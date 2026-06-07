import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

interface BulkRow {
  collegeName: string;
  collegeType: string;
  city: string;
  state: string;
  website?: string;
  isPartner: string;
  courseName: string;
  degreeType: string;
  eligibleStreams: string; // pipe-separated, e.g. "PCM|PCB"
  exam: string;
  category: string;
  cutoffScore?: string;
  cutoffRank?: string;
  academicYear: string;
  roundNumber: string;
  rowIndex: number;
}

function generateCourseCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 50);
}

function parseIsPartner(val: string): boolean {
  return ["yes", "true", "1"].includes(val.toLowerCase().trim());
}

export async function bulkUpload(req: Request, res: Response) {
  try {
    const rows: BulkRow[] = req.body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: "No rows provided" });
    }

    // ── Pre-load lookup tables ────────────────────────────────────────────────
    const [allStreams, allCategories, allExams] = await Promise.all([
      prisma.eligible_streams.findMany(),
      prisma.categories.findMany(),
      prisma.exams.findMany(),
    ]);

    const streamByCode = new Map(allStreams.map((s) => [s.stream_code, s]));
    const categoryByCode = new Map(allCategories.map((c) => [c.category_code, c]));
    const examByName = new Map(allExams.map((e) => [e.exam_name, e]));

    // Track in-flight inserts so we don't double-create within the same batch
    const courseCodeCache = new Map<string, string>(); // courseName → resolved course_code

    const results = {
      processed: 0,
      colleges: { created: 0, existing: 0 },
      courses: { created: 0, existing: 0 },
      links: { created: 0, existing: 0 },
      cutoffs: { created: 0, updated: 0 },
      errors: [] as { rowIndex: number; message: string }[],
    };

    // ── Process each row sequentially (to avoid race conditions) ─────────────
    for (const row of rows) {
      try {
        // 1. Resolve / create College
        const college = await prisma.colleges.upsert({
          where: { college_name: row.collegeName.trim() },
          update: {},
          create: {
            college_name: row.collegeName.trim(),
            college_type: row.collegeType,
            city: row.city.trim(),
            state: row.state.trim(),
            website_url: row.website?.trim() || null,
            is_partner: parseIsPartner(row.isPartner),
          },
        });

        const wasCollegeCreated = college.created_at && 
          (new Date().getTime() - new Date(college.created_at).getTime()) < 5000;
        if (wasCollegeCreated) results.colleges.created++;
        else results.colleges.existing++;

        // 2. Resolve / create Course
        const courseName = row.courseName.trim();
        let courseCode = courseCodeCache.get(courseName);

        if (!courseCode) {
          // Check if course already exists by name
          const existingCourse = await prisma.courses.findFirst({
            where: { course_name: courseName },
          });

          if (existingCourse) {
            courseCode = existingCourse.course_code;
            courseCodeCache.set(courseName, courseCode);
            results.courses.existing++;
          } else {
            // Generate unique code
            let baseCode = generateCourseCode(courseName);
            courseCode = baseCode;
            let suffix = 1;
            while (await prisma.courses.findUnique({ where: { course_code: courseCode } })) {
              courseCode = `${baseCode}_${suffix++}`;
            }
            courseCodeCache.set(courseName, courseCode);
          }
        } else {
          // Already created earlier in this batch
        }

        const course = await prisma.courses.upsert({
          where: { course_code: courseCode },
          update: {},
          create: {
            course_name: courseName,
            course_code: courseCode,
            degree_type: row.degreeType,
          },
        });

        // 2a. Ensure eligible streams are linked to the course
        const streamCodes = row.eligibleStreams.split("|").map((s) => s.trim()).filter(Boolean);
        for (const code of streamCodes) {
          const stream = streamByCode.get(code);
          if (stream) {
            const existingCourseStream = await prisma.course_eligible_streams.findFirst({
              where: { course_id: course.course_id, stream_id: stream.stream_id },
            });
            if (!existingCourseStream) {
              await prisma.course_eligible_streams.create({
                data: { course_id: course.course_id, stream_id: stream.stream_id },
              });
            }
          }
        }

        // 3. Resolve / create College-Course link
        // The unique constraint is (college_id, course_id, specialization_id)
        // specialization_id is null for our use case, but Prisma needs a workaround for null in composite unique
        const existingLink = await prisma.college_courses.findFirst({
          where: {
            college_id: college.college_id,
            course_id: course.course_id,
            specialization_id: null,
          },
        });

        let collegeCourse;
        if (existingLink) {
          collegeCourse = existingLink;
          results.links.existing++;
        } else {
          collegeCourse = await prisma.college_courses.create({
            data: {
              college_id: college.college_id,
              course_id: course.course_id,
              is_available: true,
            },
          });
          results.links.created++;
        }

        // 4. Resolve exam and category
        const exam = examByName.get(row.exam);
        const category = categoryByCode.get(row.category);

        if (!exam) {
          results.errors.push({ rowIndex: row.rowIndex, message: `Exam '${row.exam}' not found in database` });
          continue;
        }
        if (!category) {
          results.errors.push({ rowIndex: row.rowIndex, message: `Category '${row.category}' not found in database` });
          continue;
        }

        // 5. Upsert Cutoff
        const year = Number(row.academicYear);
        const round = Number(row.roundNumber) || 1;

        const existingCutoff = await prisma.cutoff_data.findFirst({
          where: {
            college_course_id: collegeCourse.college_course_id,
            exam_id: exam.exam_id,
            category_id: category.category_id,
            academic_year: year,
            round_number: round,
          },
        });

        if (existingCutoff) {
          await prisma.cutoff_data.update({
            where: { cutoff_id: existingCutoff.cutoff_id },
            data: {
              cutoff_score: row.cutoffScore ? Number(row.cutoffScore) : null,
              cutoff_rank: row.cutoffRank ? Number(row.cutoffRank) : null,
            },
          });
          results.cutoffs.updated++;
        } else {
          await prisma.cutoff_data.create({
            data: {
              college_course_id: collegeCourse.college_course_id,
              exam_id: exam.exam_id,
              category_id: category.category_id,
              cutoff_score: row.cutoffScore ? Number(row.cutoffScore) : null,
              cutoff_rank: row.cutoffRank ? Number(row.cutoffRank) : null,
              academic_year: year,
              round_number: round,
            },
          });
          results.cutoffs.created++;
        }

        // 5a. Ensure exam eligibility
        await prisma.college_course_exam_eligibility.upsert({
          where: { college_course_id_exam_id: { college_course_id: collegeCourse.college_course_id, exam_id: exam.exam_id } },
          update: {},
          create: { college_course_id: collegeCourse.college_course_id, exam_id: exam.exam_id },
        });

        results.processed++;
      } catch (rowError: any) {
        console.error(`[bulkUpload] Row ${row.rowIndex} error:`, rowError);
        results.errors.push({
          rowIndex: row.rowIndex,
          message: rowError?.message || "Unknown error",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: results,
      message: `Processed ${results.processed} of ${rows.length} rows successfully`,
    });
  } catch (error) {
    console.error("[bulkUpload]", error);
    return res.status(500).json({ success: false, message: "Bulk upload failed" });
  }
}
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
  eligibleStreams: string;
  exam: string;
  category: string;
  cutoffScore?: string;
  cutoffRank?: string;
  academicYear: string;
  roundNumber: string;
  rowIndex: number;
}

const STREAM_ALIASES: Record<string, string> = {
  arts: "humanities",
  art: "humanities",
};

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

    // ── Pre-load ALL lookup tables including colleges and courses ─────────────
    const [allStreams, allCategories, allExams, allColleges, allCourses, allCollegeCourses] =
      await Promise.all([
        prisma.eligible_streams.findMany(),
        prisma.categories.findMany(),
        prisma.exams.findMany(),
        prisma.colleges.findMany(),
        prisma.courses.findMany(),
        prisma.college_courses.findMany(),
      ]);

    // Build lookup maps
    const streamByCode = new Map(allStreams.map((s) => [s.stream_code.toLowerCase(), s]));
    const categoryByCode = new Map(allCategories.map((c) => [c.category_code, c]));
    const examByName = new Map(allExams.map((e) => [e.exam_name.toLowerCase(), e]));
    const collegeByName = new Map(allColleges.map((c) => [c.college_name.trim().toLowerCase(), c]));
    const courseByName = new Map(allCourses.map((c) => [c.course_name.trim().toLowerCase(), c]));
    const courseByCode = new Map(allCourses.map((c) => [c.course_code, c]));
    // college_course link map: "collegeId_courseId" → record
    const linkMap = new Map(
      allCollegeCourses.map((cc) => [`${cc.college_id}_${cc.course_id}`, cc])
    );

    const results = {
      processed: 0,
      colleges: { created: 0, existing: 0 },
      courses: { created: 0, existing: 0 },
      links: { created: 0, existing: 0 },
      cutoffs: { created: 0, updated: 0 },
      errors: [] as { rowIndex: number; message: string }[],
    };

    for (const row of rows) {
      try {
        // 1. Resolve / create College
        const collegeKey = row.collegeName.trim().toLowerCase();
        let college = collegeByName.get(collegeKey);

        if (!college) {
          college = await prisma.colleges.create({
            data: {
              college_name: row.collegeName.trim(),
              college_type: row.collegeType,
              city: row.city.trim(),
              state: row.state.trim(),
              website_url: row.website?.trim() || null,
              is_partner: parseIsPartner(row.isPartner),
            },
          });
          collegeByName.set(collegeKey, college);
          results.colleges.created++;
        } else {
          results.colleges.existing++;
        }

        // 2. Resolve / create Course
        const courseKey = row.courseName.trim().toLowerCase();
        let course = courseByName.get(courseKey);

        if (!course) {
          let courseCode = generateCourseCode(row.courseName.trim());
          // Handle code collision without DB round trips
          let suffix = 1;
          while (courseByCode.has(courseCode)) {
            courseCode = `${generateCourseCode(row.courseName.trim())}_${suffix++}`;
          }
          course = await prisma.courses.create({
            data: {
              course_name: row.courseName.trim(),
              course_code: courseCode,
              degree_type: row.degreeType,
            },
          });
          courseByName.set(courseKey, course);
          courseByCode.set(courseCode, course);
          results.courses.created++;
        } else {
          results.courses.existing++;
        }

        // 2a. Eligible streams — batch check in memory
        const streamCodes = row.eligibleStreams
          .split("|")
          .map((s) => {
            const normalized = s.trim().toLowerCase();
            return STREAM_ALIASES[normalized] ?? normalized;
          })
          .filter(Boolean);

        for (const code of streamCodes) {
          const stream = streamByCode.get(code);
          if (stream) {
            // Only query DB if not already known — use a simple set per course
            await prisma.course_eligible_streams.upsert({
              where: {
                course_id_stream_id: {
                  course_id: course.course_id,
                  stream_id: stream.stream_id,
                },
              },
              update: {},
              create: { course_id: course.course_id, stream_id: stream.stream_id },
            });
          }
        }

        // 3. Resolve / create College-Course link
        const linkKey = `${college.college_id}_${course.course_id}`;
        let collegeCourse = linkMap.get(linkKey);

        if (!collegeCourse) {
          collegeCourse = await prisma.college_courses.create({
            data: {
              college_id: college.college_id,
              course_id: course.course_id,
              is_available: true,
            },
          });
          linkMap.set(linkKey, collegeCourse);
          results.links.created++;
        } else {
          results.links.existing++;
        }

        // 4. Resolve exam and category
        const exam = examByName.get(row.exam.toLowerCase());
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

        // 5a. Exam eligibility
        await prisma.college_course_exam_eligibility.upsert({
          where: {
            college_course_id_exam_id: {
              college_course_id: collegeCourse.college_course_id,
              exam_id: exam.exam_id,
            },
          },
          update: {},
          create: {
            college_course_id: collegeCourse.college_course_id,
            exam_id: exam.exam_id,
          },
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
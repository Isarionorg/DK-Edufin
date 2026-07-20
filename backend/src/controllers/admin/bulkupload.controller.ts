import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

interface BulkRow {
  collegeName: string;
  collegeType: string;
  city: string;
  state: string;
  website?: string;
  isPartner: string;
  naacGrade?: string;
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

const VALID_NAAC_GRADES = ["A++", "A+", "A", "B++", "B+", "B", "C", "D"];

function normalizeNaacGrade(val?: string): string | null {
  if (!val) return null;
  const trimmed = val.trim().toUpperCase();
  if (!trimmed) return null;
  return VALID_NAAC_GRADES.includes(trimmed) ? trimmed : null;
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

// ── Validate required fields and logical constraints ─────────────────────────
function validateRow(row: BulkRow): string | null {
  const requiredFields: (keyof BulkRow)[] = [
    "collegeName", "collegeType", "city", "state",
    "courseName", "degreeType", "eligibleStreams",
    "exam", "category", "academicYear",
  ];

  for (const field of requiredFields) {
    if (!row[field] || String(row[field]).trim() === "") {
      return `Missing required field: '${field}'`;
    }
  }

  const year = Number(row.academicYear);
  if (isNaN(year) || year < 2000 || year > 2100) {
    return `Invalid academicYear: '${row.academicYear}'. Must be a valid year.`;
  }

  // AFTER
const hasScore = row.cutoffScore && !isNaN(Number(row.cutoffScore));
const hasRank = row.cutoffRank && !isNaN(Number(row.cutoffRank));
if (!hasScore && !hasRank) {
  return "At least one of cutoffScore or cutoffRank must be a valid number";
}
if (hasScore && hasRank) {
  return "Only one of cutoffScore or cutoffRank can be provided, not both";
}

return null;
}

// ── Normalize Prisma / DB errors to user-friendly messages ───────────────────
function normalizeRowError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "A duplicate record already exists for this row";
      case "P2003":
        return "A referenced record (exam, category, etc.) does not exist";
      case "P2025":
        return "Record not found during update";
      default:
        return `Database error (code: ${error.code})`;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return "Invalid data format — check field types (numbers, text, etc.)";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error processing this row";
}

export async function bulkUpload(req: Request, res: Response) {
  try {
    const rows: BulkRow[] = req.body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: "No rows provided" });
    }

    const [allStreams, allCategories, allExams, allColleges, allCourses, allCollegeCourses] =
      await Promise.all([
        prisma.eligible_streams.findMany(),
        prisma.categories.findMany(),
        prisma.exams.findMany(),
        prisma.colleges.findMany(),
        prisma.courses.findMany(),
        prisma.college_courses.findMany(),
      ]);

    const streamByCode = new Map(allStreams.map((s) => [s.stream_code.toLowerCase(), s]));
    const categoryByCode = new Map(allCategories.map((c) => [c.category_code, c]));
    const examByName = new Map(allExams.map((e) => [e.exam_name.toLowerCase(), e]));
    const collegeByName = new Map(allColleges.map((c) => [c.college_name.trim().toLowerCase(), c]));
    const courseByName = new Map(allCourses.map((c) => [c.course_name.trim().toLowerCase(), c]));
    const courseByCode = new Map(allCourses.map((c) => [c.course_code, c]));
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
        // ── Validate before touching the DB ────────────────────────────────
        const validationError = validateRow(row);
        if (validationError) {
          results.errors.push({ rowIndex: row.rowIndex, message: validationError });
          continue;
        }

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
              naac_grade: normalizeNaacGrade(row.naacGrade),
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

        // 2a. Eligible streams
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

        // 4a. Exam eligible streams
for (const code of streamCodes) {
  const stream = streamByCode.get(code);
  if (stream && exam) {
    await prisma.exam_eligible_streams.upsert({
  where: {
    exam_id_stream_id: {
      exam_id: exam.exam_id,
      stream_id: stream.stream_id,
    },
  },
  update: {},
  create: {
    exam_id: exam.exam_id,
    stream_id: stream.stream_id,
  },
});
  }
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
      } catch (rowError: unknown) {
        console.error(`[bulkUpload] Row ${row.rowIndex} error:`, rowError);
        results.errors.push({
          rowIndex: row.rowIndex,
          message: normalizeRowError(rowError),
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
    return res.status(500).json({ success: false, message: "Bulk upload failed. Please try again or contact support." });
  }
}
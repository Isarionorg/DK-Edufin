import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getCutoffs(req: Request, res: Response) {
  try {
    const cutoffs = await prisma.cutoff_data.findMany({
      orderBy: [{ academic_year: "desc" }, { round_number: "desc" }],
      take: 200,
      select: {
        cutoff_id: true,
        college_course_id: true,
        cutoff_score: true,
        cutoff_rank: true,
        academic_year: true,
        round_number: true,
        categories: { select: { category_id: true, category_code: true, category_name: true } },
        exams: { select: { exam_id: true, exam_name: true } },
        college_courses: {
          select: {
            colleges: { select: { college_name: true } },
            courses: { select: { course_name: true } },
          },
        },
      },
    });

    return res.json({ success: true, data: cutoffs });
  } catch (error) {
    console.error("[getCutoffs]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch cutoffs" });
  }
}

export async function createCutoff(req: Request, res: Response) {
  try {
    const {
      collegeCourseId,
      examName,
      categoryCode,
      cutoffScore,
      cutoffRank,
      academicYear,
      roundNumber,
    } = req.body;

    // --- Presence checks ---
    if (!collegeCourseId) {
      return res.status(400).json({ success: false, message: "collegeCourseId is required" });
    }
    if (!examName) {
      return res.status(400).json({ success: false, message: "examName is required" });
    }
    if (!categoryCode) {
      return res.status(400).json({ success: false, message: "categoryCode is required" });
    }
    if (!academicYear) {
      return res.status(400).json({ success: false, message: "academicYear is required" });
    }
    if (!cutoffScore && !cutoffRank) {
      return res.status(400).json({ success: false, message: "At least one of cutoffScore or cutoffRank is required" });
    }

    // --- Numeric validation (catches NaN before it silently reaches the DB) ---
    const year = Number(academicYear);
    if (isNaN(year) || !Number.isInteger(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ success: false, message: "academicYear must be a valid year (e.g. 2024)" });
    }

    const round = roundNumber !== undefined ? Number(roundNumber) : 1;
    if (isNaN(round) || !Number.isInteger(round) || round < 1) {
      return res.status(400).json({ success: false, message: "roundNumber must be a positive integer" });
    }

    const parsedScore = cutoffScore != null ? Number(cutoffScore) : null;
    const parsedRank  = cutoffRank  != null ? Number(cutoffRank)  : null;
    if ((parsedScore !== null && isNaN(parsedScore)) || (parsedRank !== null && isNaN(parsedRank))) {
      return res.status(400).json({ success: false, message: "cutoffScore and cutoffRank must be numeric" });
    }

    // --- DB lookups ---
    const collegeCourse = await prisma.college_courses.findUnique({
      where: { college_course_id: Number(collegeCourseId) },
    });
    if (!collegeCourse) {
      return res.status(404).json({ success: false, message: "College-course link not found" });
    }

    const exam = await prisma.exams.findUnique({ where: { exam_name: examName } });
    if (!exam) {
      return res.status(404).json({ success: false, message: `Exam '${examName}' not found` });
    }

    const category = await prisma.categories.findUnique({ where: { category_code: categoryCode } });
    if (!category) {
      return res.status(404).json({ success: false, message: `Category '${categoryCode}' not found` });
    }

    // --- Upsert ---
    const cutoff = await prisma.cutoff_data.upsert({
      where: {
        college_course_id_exam_id_category_id_academic_year_round_number: {
          college_course_id: Number(collegeCourseId),
          exam_id: exam.exam_id,
          category_id: category.category_id,
          academic_year: year,
          round_number: round,
        },
      },
      update: {
        cutoff_score: parsedScore,
        cutoff_rank: parsedRank,
      },
      create: {
        college_course_id: Number(collegeCourseId),
        exam_id: exam.exam_id,
        category_id: category.category_id,
        cutoff_score: parsedScore,
        cutoff_rank: parsedRank,
        academic_year: year,
        round_number: round,
      },
    });

    await prisma.college_course_exam_eligibility.upsert({
      where: { college_course_id_exam_id: { college_course_id: Number(collegeCourseId), exam_id: exam.exam_id } },
      update: {},
      create: { college_course_id: Number(collegeCourseId), exam_id: exam.exam_id },
    });

    return res.status(201).json({ success: true, data: cutoff });
  } catch (error: any) {
    console.error("[createCutoff]", error);
    if (error?.code === "P2002") {
      return res.status(409).json({ success: false, message: "A cutoff entry for this combination already exists" });
    }
    if (error?.code === "P2003") {
      return res.status(400).json({ success: false, message: "Referenced record not found (foreign key constraint failed)" });
    }
    return res.status(500).json({ success: false, message: "Failed to create cutoff entry" });
  }
}
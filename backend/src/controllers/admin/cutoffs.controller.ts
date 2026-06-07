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

    // Verify college_course exists
    const collegeCourse = await prisma.college_courses.findUnique({
      where: { college_course_id: Number(collegeCourseId) },
    });
    if (!collegeCourse) {
      return res.status(404).json({ success: false, message: "College-course link not found" });
    }

    // Resolve exam
    const exam = await prisma.exams.findUnique({ where: { exam_name: examName } });
    if (!exam) {
      return res.status(404).json({ success: false, message: `Exam '${examName}' not found` });
    }

    // Resolve category
    const category = await prisma.categories.findUnique({ where: { category_code: categoryCode } });
    if (!category) {
      return res.status(404).json({ success: false, message: `Category '${categoryCode}' not found` });
    }

    const round = Number(roundNumber) || 1;
    const year = Number(academicYear);

    // Upsert — supports updating existing cutoff for same period
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
        cutoff_score: cutoffScore ? Number(cutoffScore) : null,
        cutoff_rank: cutoffRank ? Number(cutoffRank) : null,
      },
      create: {
        college_course_id: Number(collegeCourseId),
        exam_id: exam.exam_id,
        category_id: category.category_id,
        cutoff_score: cutoffScore ? Number(cutoffScore) : null,
        cutoff_rank: cutoffRank ? Number(cutoffRank) : null,
        academic_year: year,
        round_number: round,
      },
    });

    // Also ensure exam eligibility is recorded
    await prisma.college_course_exam_eligibility.upsert({
      where: { college_course_id_exam_id: { college_course_id: Number(collegeCourseId), exam_id: exam.exam_id } },
      update: {},
      create: { college_course_id: Number(collegeCourseId), exam_id: exam.exam_id },
    });

    return res.status(201).json({ success: true, data: cutoff });
  } catch (error: any) {
    console.error("[createCutoff]", error);
    return res.status(500).json({ success: false, message: "Failed to create cutoff entry" });
  }
}
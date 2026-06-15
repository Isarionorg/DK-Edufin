import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getExams(req: Request, res: Response) {
  try {
    const exams = await prisma.exams.findMany({
      orderBy: { exam_name: "asc" },
      select: {
        exam_id: true,
        exam_name: true,
        exam_full_name: true,
        qualification_type: true,
        description: true,
        created_at: true,
      },
    });

    return res.json({ success: true, data: exams });
  } catch (error) {
    console.error("[getExams]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch exams" });
  }
}

export async function createExam(req: Request, res: Response) {
  try {
    const { examName, examFullName, qualificationType, description } = req.body;

    if (!examName) {
      return res.status(400).json({ success: false, message: "examName is required" });
    }
    if (!qualificationType) {
      return res.status(400).json({ success: false, message: "qualificationType is required" });
    }

    const existing = await prisma.exams.findUnique({ where: { exam_name: examName } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Exam '${examName}' already exists` });
    }

    const exam = await prisma.exams.create({
      data: {
        exam_name: examName,
        exam_full_name: examFullName || null,
        qualification_type: qualificationType,
        description: description || null,
      },
    });

    return res.status(201).json({ success: true, data: exam });
  } catch (error: any) {
    console.error("[createExam]", error);
    return res.status(500).json({ success: false, message: "Failed to create exam" });
  }
}
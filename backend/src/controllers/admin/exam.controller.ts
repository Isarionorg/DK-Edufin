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

    // --- Presence + blank-string checks ---
    if (!examName?.trim()) {
      return res.status(400).json({ success: false, message: "examName is required" });
    }
    if (!qualificationType?.trim()) {
      return res.status(400).json({ success: false, message: "qualificationType is required" });
    }

    const existing = await prisma.exams.findUnique({ where: { exam_name: examName.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Exam '${examName}' already exists` });
    }

    const exam = await prisma.exams.create({
      data: {
        exam_name: examName.trim(),
        exam_full_name: examFullName?.trim() || null,
        qualification_type: qualificationType.trim(),
        description: description?.trim() || null,
      },
    });

    return res.status(201).json({ success: true, data: exam });
  } catch (error: any) {
    console.error("[createExam]", error);

    // Race condition: two concurrent creates both passed the findUnique check
    if (error?.code === "P2002") {
      return res.status(409).json({ success: false, message: `Exam '${req.body.examName}' already exists` });
    }
    // Invalid value for a field (e.g. qualificationType doesn't match DB enum)
    if (error?.code === "P2006" || error?.code === "P2000") {
      return res.status(400).json({ success: false, message: "Invalid value provided for one or more fields" });
    }

    return res.status(500).json({ success: false, message: "Failed to create exam" });
  }
}
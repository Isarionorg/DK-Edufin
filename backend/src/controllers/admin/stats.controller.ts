import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getStats(req: Request, res: Response) {
  try {
    const [colleges, courses, collegeCourses, cutoffs] = await Promise.all([
      prisma.colleges.count(),
      prisma.courses.count(),
      prisma.college_courses.count({ where: { is_available: true } }),
      prisma.cutoff_data.count(),
    ]);

    return res.json({
      success: true,
      data: {
        colleges,
        courses,
        collegeCourses,
        cutoffs,
      },
    });
  } catch (error) {
    console.error("[getStats]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}
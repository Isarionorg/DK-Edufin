import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export async function getCollegeCourses(req: Request, res: Response) {
  try {
    const links = await prisma.college_courses.findMany({
      where: { is_available: true },
      orderBy: { created_at: "desc" },
      select: {
        college_course_id: true,
        college_id: true,
        course_id: true,
        is_available: true,
        created_at: true,
        colleges: { select: { college_id: true, college_name: true } },
        courses: { select: { course_id: true, course_name: true, degree_type: true } },
      },
    });

    return res.json({ success: true, data: links });
  } catch (error) {
    console.error("[getCollegeCourses]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch college-course links" });
  }
}

export async function createCollegeCourse(req: Request, res: Response) {
  try {
    const { collegeId, courseId } = req.body;

    if (!collegeId || !courseId) {
      return res.status(400).json({ success: false, message: "collegeId and courseId are required" });
    }

    // ── Guard against non-numeric IDs ────────────────────────────────────────
    const parsedCollegeId = Number(collegeId);
    const parsedCourseId = Number(courseId);

    if (isNaN(parsedCollegeId) || isNaN(parsedCourseId)) {
      return res.status(400).json({ success: false, message: "collegeId and courseId must be valid numbers" });
    }

    const college = await prisma.colleges.findUnique({ where: { college_id: parsedCollegeId } });
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    const course = await prisma.courses.findUnique({ where: { course_id: parsedCourseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existingLink = await prisma.college_courses.findFirst({
      where: {
        college_id: parsedCollegeId,
        course_id: parsedCourseId,
        specialization_id: null,
      },
    });

    const link = existingLink
      ? await prisma.college_courses.update({
          where: { college_course_id: existingLink.college_course_id },
          data: { is_available: true, updated_at: new Date() },
          include: {
            colleges: { select: { college_name: true } },
            courses: { select: { course_name: true, degree_type: true } },
          },
        })
      : await prisma.college_courses.create({
          data: {
            college_id: parsedCollegeId,
            course_id: parsedCourseId,
            is_available: true,
          },
          include: {
            colleges: { select: { college_name: true } },
            courses: { select: { course_name: true, degree_type: true } },
          },
        });

    return res.status(201).json({ success: true, data: link });
  } catch (error: unknown) {
    console.error("[createCollegeCourse]", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ success: false, message: "This college-course link already exists" });
    }
    return res.status(500).json({ success: false, message: "Failed to create college-course link" });
  }
}
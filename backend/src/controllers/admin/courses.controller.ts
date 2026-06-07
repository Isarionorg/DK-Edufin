import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

/**
 * Generates a course_code slug from a course name.
 * e.g. "B.Sc (Hons.) Mathematics" → "BSC_HONS_MATHEMATICS"
 */
function generateCourseCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 50);
}

export async function getCourses(req: Request, res: Response) {
  try {
    const courses = await prisma.courses.findMany({
      orderBy: { course_name: "asc" },
      select: {
        course_id: true,
        course_name: true,
        degree_type: true,
        course_eligible_streams: {
          select: {
            eligible_streams: {
              select: { stream_id: true, stream_code: true, stream_name: true },
            },
          },
        },
      },
    });

    const shaped = courses.map((c) => ({
      course_id: c.course_id,
      course_name: c.course_name,
      degree_type: c.degree_type,
      eligible_streams: c.course_eligible_streams.map((ces) => ces.eligible_streams),
    }));

    return res.json({ success: true, data: shaped });
  } catch (error) {
    console.error("[getCourses]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
}

export async function createCourse(req: Request, res: Response) {
  try {
    const { name, degreeType, eligibleStreamCodes } = req.body;
    // eligibleStreamCodes: string[] — e.g. ["PCM", "PCB"]

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Course name is required" });
    }

    const validDegrees = ["UG", "PG", "Diploma"];
    if (!validDegrees.includes(degreeType)) {
      return res.status(400).json({ success: false, message: `degreeType must be one of: ${validDegrees.join(", ")}` });
    }

    if (!Array.isArray(eligibleStreamCodes) || eligibleStreamCodes.length === 0) {
      return res.status(400).json({ success: false, message: "At least one eligible stream is required" });
    }

    // Resolve stream IDs from codes
    const streams = await prisma.eligible_streams.findMany({
      where: { stream_code: { in: eligibleStreamCodes } },
    });

    const foundCodes = streams.map((s) => s.stream_code);
    const missing = eligibleStreamCodes.filter((c: string) => !foundCodes.includes(c));
    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Unknown stream codes: ${missing.join(", ")}` });
    }

    // Generate a unique course_code
    let baseCode = generateCourseCode(name.trim());
    let courseCode = baseCode;
    let suffix = 1;

    // Ensure uniqueness by appending a suffix if needed
    while (true) {
      const existing = await prisma.courses.findUnique({ where: { course_code: courseCode } });
      if (!existing) break;
      courseCode = `${baseCode}_${suffix++}`;
    }

    // Create course + eligible streams in a transaction
    const course = await prisma.$transaction(async (tx) => {
      const created = await tx.courses.create({
        data: {
          course_name: name.trim(),
          course_code: courseCode,
          degree_type: degreeType,
        },
      });

      await tx.course_eligible_streams.createMany({
        data: streams.map((s) => ({
          course_id: created.course_id,
          stream_id: s.stream_id,
        })),
        skipDuplicates: true,
      });

      return created;
    });

    return res.status(201).json({ success: true, data: { ...course, eligible_stream_codes: foundCodes } });
  } catch (error: any) {
    console.error("[createCourse]", error);
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "A course with this name already exists" });
    }
    return res.status(500).json({ success: false, message: "Failed to create course" });
  }
}
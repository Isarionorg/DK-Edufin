import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const VALID_DEGREES = ["UG", "PG", "Diploma"];
const MAX_CODE_SUFFIX_ATTEMPTS = 10;

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

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Course name is required" });
    }

    if (!VALID_DEGREES.includes(degreeType)) {
      return res.status(400).json({ success: false, message: `degreeType must be one of: ${VALID_DEGREES.join(", ")}` });
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

    // ── Generate a unique course_code with a bounded retry limit ─────────────
    const baseCode = generateCourseCode(name.trim());
    let courseCode = baseCode;
    let suffix = 1;

    while (suffix <= MAX_CODE_SUFFIX_ATTEMPTS) {
      const existing = await prisma.courses.findUnique({ where: { course_code: courseCode } });
      if (!existing) break;
      courseCode = `${baseCode}_${suffix++}`;

      if (suffix > MAX_CODE_SUFFIX_ATTEMPTS) {
        return res.status(409).json({
          success: false,
          message: `Could not generate a unique course code for '${name.trim()}'. Try a more specific name.`,
        });
      }
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
  } catch (error: unknown) {
    console.error("[createCourse]", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ success: false, message: "A course with this name already exists" });
    }
    return res.status(500).json({ success: false, message: "Failed to create course" });
  }
}
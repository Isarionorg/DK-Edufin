import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getColleges(req: Request, res: Response) {
  try {
    const colleges = await prisma.colleges.findMany({
      orderBy: { college_name: "asc" },
      select: {
        college_id: true,
        college_name: true,
        college_type: true,
        city: true,
        state: true,
        website_url: true,
        is_partner: true,
        created_at: true,
      },
    });

    return res.json({ success: true, data: colleges });
  } catch (error) {
    console.error("[getColleges]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch colleges" });
  }
}

export async function createCollege(req: Request, res: Response) {
  try {
    const { name, type, city, state, website, isPartner } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "College name is required" });
    }
    if (!city?.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!state?.trim()) {
      return res.status(400).json({ success: false, message: "State is required" });
    }

    const validTypes = ["Government", "Private", "Deemed"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `College type must be one of: ${validTypes.join(", ")}` });
    }

    const college = await prisma.colleges.create({
      data: {
        college_name: name.trim(),
        college_type: type || "Government",
        city: city.trim(),
        state: state.trim(),
        website_url: website?.trim() || null,
        is_partner: Boolean(isPartner),
      },
    });

    return res.status(201).json({ success: true, data: college });
  } catch (error: any) {
    console.error("[createCollege]", error);
    // Unique constraint violation
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "A college with this name already exists" });
    }
    return res.status(500).json({ success: false, message: "Failed to create college" });
  }
}
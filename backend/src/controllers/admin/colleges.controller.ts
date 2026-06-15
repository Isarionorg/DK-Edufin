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

export async function updateCollege(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, type, city, state, website, isPartner } = req.body;

    const collegeId = Number(id);
    if (!collegeId) {
      return res.status(400).json({ success: false, message: "Invalid college id" });
    }

    const existing = await prisma.colleges.findUnique({ where: { college_id: collegeId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: "College name cannot be empty" });
    }
    if (city !== undefined && !city.trim()) {
      return res.status(400).json({ success: false, message: "City cannot be empty" });
    }
    if (state !== undefined && !state.trim()) {
      return res.status(400).json({ success: false, message: "State cannot be empty" });
    }

    const validTypes = ["Government", "Private", "Deemed"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `College type must be one of: ${validTypes.join(", ")}` });
    }

    const college = await prisma.colleges.update({
      where: { college_id: collegeId },
      data: {
        ...(name !== undefined && { college_name: name.trim() }),
        ...(type !== undefined && { college_type: type }),
        ...(city !== undefined && { city: city.trim() }),
        ...(state !== undefined && { state: state.trim() }),
        ...(website !== undefined && { website_url: website?.trim() || null }),
        ...(isPartner !== undefined && { is_partner: Boolean(isPartner) }),
        updated_at: new Date(),
      },
    });

    return res.json({ success: true, data: college });
  } catch (error: any) {
    console.error("[updateCollege]", error);
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "A college with this name already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "College not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to update college" });
  }
}
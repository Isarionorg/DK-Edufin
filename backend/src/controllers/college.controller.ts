import { Request, Response } from "express";
import {
  getRecommendedColleges,
  getAllColleges,
  getCollegeById,
} from "../services/college.service";
import { AppError } from "../errors/AppError";

// ============================================
// GET /colleges
// ============================================

export const getColleges = async (req: Request, res: Response) => {
  try {
    const { search, page, pageSize } = req.query;

    // Validate pagination params before they reach the service
    const parsedPage     = page     ? parseInt(page as string, 10)     : undefined;
    const parsedPageSize = pageSize ? parseInt(pageSize as string, 10) : undefined;

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return res.status(400).json({ success: false, message: "page must be a positive integer" });
    }
    if (parsedPageSize !== undefined && (isNaN(parsedPageSize) || parsedPageSize < 1)) {
      return res.status(400).json({ success: false, message: "pageSize must be a positive integer" });
    }

    const filters = {
      search: (search as string | undefined)?.trim() || undefined,
      page: parsedPage,
      pageSize: parsedPageSize,
    };

    const userId = (req as any).user?.user_id;

    if (userId) {
      try {
        const result = await getRecommendedColleges(userId, filters);
        return res.status(200).json({ success: true, personalized: true, ...result });
      } catch (err: any) {
        // Profile incomplete → fall through to generic list
        if (!(err instanceof AppError) || err.statusCode !== 422) throw err;
      }
    }

    const result = await getAllColleges(filters);
    return res.status(200).json({ success: true, personalized: false, ...result });

  } catch (error: any) {
    console.error("getColleges error:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to fetch colleges" });
  }
};

// ============================================
// GET /colleges/:id
// ============================================

export const getCollegeDetails = async (req: Request, res: Response) => {
  try {
    const collegeId = parseInt(req.params.id, 10);

    if (isNaN(collegeId) || collegeId < 1) {
      return res.status(400).json({ success: false, message: "Invalid college ID" });
    }

    const college = await getCollegeById(collegeId);

    return res.status(200).json({ success: true, data: college });

  } catch (error: any) {
    console.error("getCollegeDetails error:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to fetch college details" });
  }
};
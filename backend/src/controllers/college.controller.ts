import { Request, Response } from "express";
import {
  getRecommendedColleges,
  getAllColleges,
  getCollegeById,
} from "../services/college.service";

// ============================================
// GET /colleges
// ============================================

export const getColleges = async (req: Request, res: Response) => {
  try {
    const { search, page, pageSize } = req.query;

    const filters = {
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    };

    const userId = (req as any).user?.user_id;

    if (userId) {
      try {
        const result = await getRecommendedColleges(userId, filters);
        return res.status(200).json({
          success: true,
          personalized: true,
          ...result,
        });
      } catch (err: any) {
        // Profile incomplete → fall through to generic list
        if (err.message !== "PROFILE_INCOMPLETE") throw err;
      }
    }

    // Fallback: no auth or profile incomplete
    const result = await getAllColleges(filters);
    return res.status(200).json({
      success: true,
      personalized: false,
      ...result,
    });

  } catch (error: any) {
    console.error("getColleges error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch colleges",
    });
  }
};

// ============================================
// GET /colleges/:id
// ============================================

export const getCollegeDetails = async (req: Request, res: Response) => {
  try {
    const collegeId = parseInt(req.params.id, 10);

    if (isNaN(collegeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const college = await getCollegeById(collegeId);

    return res.status(200).json({
      success: true,
      data: college,
    });

  } catch (error: any) {
    console.error("getCollegeDetails error:", error);

    if (error.message === "College not found") {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch college details",
    });
  }
};
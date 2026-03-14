import { prisma } from "../config/prisma";
import { Request, Response } from "express";

export const getColleges = async (req: Request, res: Response) => {
  try {

    const colleges = await prisma.colleges.findMany({
      select: {
        college_id: true,
        college_name: true
      },
      orderBy: {
        college_name: "asc"
      }
    });

    res.status(200).json({
      success: true,
      data: colleges
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch colleges"
    });

  }
};
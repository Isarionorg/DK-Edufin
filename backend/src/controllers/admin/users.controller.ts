import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        phone_verified: true,
        is_email_verified: true,
        created_at: true,
        user_profiles: {
          select: {
            gender: true,
            date_of_birth: true,
            is_profile_complete: true,
            categories: { select: { category_code: true, category_name: true } },
            eligible_streams: { select: { stream_code: true, stream_name: true } },
          },
        },
        user_exam_scores: {
          select: {
            score_value: true,
            rank_value: true,
            year: true,
            exams: { select: { exam_name: true, qualification_type: true } },
          },
        },
        user_course_preferences: {
          select: {
            priority: true,
            courses: { select: { course_name: true, degree_type: true } },
          },
          orderBy: { priority: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};
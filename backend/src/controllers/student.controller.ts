// src/controllers/student.controller.ts

import { Request, Response } from 'express';
import * as studentService from '../services/student.service';

// ============================================
// TYPES
// ============================================

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const successResponse = (res: Response, statusCode: number, data: any, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Operation successful',
    data
  });
};

const errorResponse = (res: Response, statusCode: number, message: string, error?: any) => {
  if (error) {
    console.error('Error details:', error);
  }
  
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error?.message : undefined
  });
};

// ============================================
// STUDENT PROFILE CONTROLLERS
// ============================================

/**
 * @route   POST /api/student/profile/complete
 * @desc    Complete student profile form (one-time submission)
 * @access  Protected
 * 
 * @body {
 *   profile: {
 *     date_of_birth: string (optional, ISO date),
 *     gender: string (optional),
 *     category_id: number (required, 1-5),
 *     preferred_stream: string (required, Science/Commerce/Arts)
 *   },
 *   exam_scores: [
 *     {
 *       exam_id: number (required),
 *       score_value: number (optional, percentile/score),
 *       rank_value: number (optional),
 *       year: number (required, e.g. 2024)
 *     }
 *   ],
 *   course_preferences: [
 *     {
 *       course_id: number (required),
 *       priority: number (optional, auto-assigned if not provided)
 *     }
 *   ]
 * }
 */
export const completeProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized');
    }
    
    const { profile, exam_scores, course_preferences } = req.body;
    
    // Validate structure
    if (!profile || !exam_scores || !course_preferences) {
      return errorResponse(res, 400, 'Profile, exam_scores, and course_preferences are required');
    }
    
    if (!Array.isArray(exam_scores) || !Array.isArray(course_preferences)) {
      return errorResponse(res, 400, 'exam_scores and course_preferences must be arrays');
    }
    
    // Call service
    const result = await studentService.completeStudentForm(userId, {
      profile,
      exam_scores,
      course_preferences
    });
    
    return successResponse(res, 201, result, 'Student profile completed successfully');
    
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message, error);
    }
    
    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return errorResponse(res, 400, error.message, error);
    }
    
    return errorResponse(res, 500, 'Failed to complete student profile', error);
  }
};

/**
 * @route   GET /api/student/profile
 * @desc    Get complete student profile with exam scores and preferences
 * @access  Protected
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized');
    }
    
    const profile = await studentService.getStudentProfile(userId);
    
    return successResponse(res, 200, profile, 'Student profile retrieved successfully');
    
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message, error);
    }
    
    return errorResponse(res, 500, 'Failed to retrieve student profile', error);
  }
};

/**
 * @route   PUT /api/student/profile
 * @desc    Update student profile fields (not exam scores or preferences)
 * @access  Protected
 * 
 * @body {
 *   date_of_birth: string (optional),
 *   gender: string (optional),
 *   category_id: number (optional),
 *   preferred_stream: string (optional)
 * }
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized');
    }
    
    const updateData = req.body;
    
    const result = await studentService.updateStudentProfile(userId, updateData);
    
    return successResponse(res, 200, result, 'Profile updated successfully');
    
  } catch (error: any) {
    if (error.message.includes('Invalid')) {
      return errorResponse(res, 400, error.message, error);
    }
    
    return errorResponse(res, 500, 'Failed to update profile', error);
  }
};

/**
 * @route   GET /api/student/profile/status
 * @desc    Check if student has completed their profile
 * @access  Protected
 */
export const getProfileStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized');
    }
    
    const status = await studentService.getProfileCompletionStatus(userId);
    
    return successResponse(res, 200, status, 'Profile status retrieved successfully');
    
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to check profile status', error);
  }
};

// ============================================
// HELPER ENDPOINTS (Form Dropdowns)
// ============================================

/**
 * @route   GET /api/student/exams
 * @desc    Get list of all available exams for dropdown
 * @access  Protected
 */
export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const exams = await studentService.getAvailableExams();
    
    return successResponse(res, 200, exams, 'Exams retrieved successfully');
    
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to retrieve exams', error);
  }
};

/**
 * @route   GET /api/student/courses?stream=Science
 * @desc    Get list of all available courses (optionally filtered by stream)
 * @access  Protected
 */
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const stream = req.query.stream as string | undefined;
    
    const courses = await studentService.getAvailableCourses(stream);
    
    return successResponse(res, 200, courses, 'Courses retrieved successfully');
    
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to retrieve courses', error);
  }
};

/**
 * @route   GET /api/student/categories
 * @desc    Get list of categories (GENERAL, OBC, SC, ST, EWS)
 * @access  Protected
 */
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await studentService.getCategories();
    
    return successResponse(res, 200, categories, 'Categories retrieved successfully');
    
  } catch (error: any) {
    return errorResponse(res, 500, 'Failed to retrieve categories', error);
  }
};
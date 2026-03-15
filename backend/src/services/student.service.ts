// src/services/student.service.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

export interface StudentProfileDTO {
  date_of_birth?: string; // ISO date string
  gender?: string;
  category_id: number; // GENERAL=1, OBC=2, SC=3, ST=4, EWS=5
  preferred_stream: string; // Science, Commerce, Arts
}

export interface ExamScoreDTO {
  exam_id: number;
  score_value?: number; // percentile/score
  rank_value?: number; // rank
  year: number;
}

export interface CoursePreferenceDTO {
  course_id: number;
  priority?: number;
}

export interface CompleteStudentFormDTO {
  profile: StudentProfileDTO;
  exam_scores: ExamScoreDTO[];
  course_preferences: CoursePreferenceDTO[];
}

// ============================================
// VALIDATION HELPERS
// ============================================

const validateCategoryId = (category_id: number): boolean => {
  return category_id >= 1 && category_id <= 5;
};

const validateStream = (stream: string): boolean => {
  const validStreams = ['Science', 'Commerce', 'Arts'];
  return validStreams.includes(stream);
};

const validateGender = (gender?: string): boolean => {
  if (!gender) return true; // optional
  const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  return validGenders.includes(gender);
};

// ============================================
// PROFILE COMPLETION STATUS
// ============================================

/**
 * Check if user has completed their student profile
 */
export const checkProfileCompletion = async (userId: string): Promise<boolean> => {
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId }
  });
  
  return profile?.is_profile_complete === true;
};

/**
 * Get user profile completion details
 * Returns what's missing if incomplete
 */
export const getProfileCompletionStatus = async (userId: string) => {
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    include: {
      categories: true
    }
  });
  
  const examScores = await prisma.user_exam_scores.findMany({
    where: { user_id: userId },
    include: { exams: true }
  });
  
  const coursePreferences = await prisma.user_course_preferences.findMany({
    where: { user_id: userId },
    include: { courses: true }
  });
  
  const missing: string[] = [];
  
  if (!profile) {
    missing.push('Basic profile information');
  } else {
    if (!profile.category_id) missing.push('Category (General/OBC/SC/ST/EWS)');
    if (!profile.preferred_stream) missing.push('Preferred stream');
  }
  
  if (examScores.length === 0) {
    missing.push('At least one exam score');
  }
  
  if (coursePreferences.length === 0) {
    missing.push('Course preferences');
  }
  
  const isComplete = missing.length === 0 && profile?.is_profile_complete === true;
  
  return {
    is_complete: isComplete,
    missing_fields: missing,
    has_profile: !!profile,
    has_exam_scores: examScores.length > 0,
    has_course_preferences: coursePreferences.length > 0
  };
};

// ============================================
// CREATE/UPDATE STUDENT PROFILE
// ============================================

/**
 * Complete student form submission
 * Creates profile, exam scores, and course preferences in a transaction
 */
export const completeStudentForm = async (
  userId: string,
  data: CompleteStudentFormDTO
) => {
  // 1. VALIDATE INPUT
  if (!data.profile || !data.exam_scores || !data.course_preferences) {
    throw new Error('Profile, exam scores, and course preferences are required');
  }
  
  if (!validateCategoryId(data.profile.category_id)) {
    throw new Error('Invalid category. Must be between 1-5 (GENERAL/OBC/SC/ST/EWS)');
  }
  
  if (!validateStream(data.profile.preferred_stream)) {
    throw new Error('Invalid stream. Must be Science, Commerce, or Arts');
  }
  
  if (data.profile.gender && !validateGender(data.profile.gender)) {
    throw new Error('Invalid gender');
  }
  
  if (data.exam_scores.length === 0) {
    throw new Error('At least one exam score is required');
  }
  
  if (data.course_preferences.length === 0) {
    throw new Error('At least one course preference is required');
  }
  
  // 2. CHECK IF USER EXISTS
  const user = await prisma.users.findUnique({
    where: { user_id: userId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // 3. PERFORM TRANSACTION
  const result = await prisma.$transaction(async (tx) => {
    // 3a. CREATE OR UPDATE PROFILE
    const profile = await tx.user_profiles.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        date_of_birth: data.profile.date_of_birth ? new Date(data.profile.date_of_birth) : null,
        gender: data.profile.gender || null,
        category_id: data.profile.category_id,
        preferred_stream: data.profile.preferred_stream,
        is_profile_complete: true
      },
      update: {
        date_of_birth: data.profile.date_of_birth ? new Date(data.profile.date_of_birth) : undefined,
        gender: data.profile.gender || undefined,
        category_id: data.profile.category_id,
        preferred_stream: data.profile.preferred_stream,
        is_profile_complete: true,
        updated_at: new Date()
      }
    });
    
    // 3b. DELETE OLD EXAM SCORES AND CREATE NEW ONES
    await tx.user_exam_scores.deleteMany({
      where: { user_id: userId }
    });
    
    const examScores = await tx.user_exam_scores.createMany({
      data: data.exam_scores.map(score => ({
        user_id: userId,
        exam_id: score.exam_id,
        score_value: score.score_value || null,
        rank_value: score.rank_value || null,
        year: score.year
      }))
    });
    
    // 3c. DELETE OLD COURSE PREFERENCES AND CREATE NEW ONES
    await tx.user_course_preferences.deleteMany({
      where: { user_id: userId }
    });
    
    const coursePrefs = await tx.user_course_preferences.createMany({
      data: data.course_preferences.map((pref, index) => ({
        user_id: userId,
        course_id: pref.course_id,
        priority: pref.priority || (index + 1) // auto-assign priority based on order
      }))
    });
    
    return { profile, examScores, coursePrefs };
  });
  
  return {
    message: 'Student profile completed successfully',
    profile_id: result.profile.profile_id,
    is_complete: true
  };
};

// ============================================
// GET STUDENT PROFILE
// ============================================

/**
 * Get complete student profile with all related data
 */
export const getStudentProfile = async (userId: string) => {
  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      full_name: true,
      phone: true
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get profile
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    include: {
      categories: {
        select: {
          category_id: true,
          category_code: true,
          category_name: true
        }
      }
    }
  });
  
  // Get exam scores
  const examScores = await prisma.user_exam_scores.findMany({
    where: { user_id: userId },
    include: {
      exams: {
        select: {
          exam_id: true,
          exam_name: true,
          exam_full_name: true,
          qualification_type: true
        }
      }
    },
    orderBy: {
      year: 'desc'
    }
  });
  
  // Get course preferences
  const coursePreferences = await prisma.user_course_preferences.findMany({
    where: { user_id: userId },
    include: {
      courses: {
        select: {
          course_id: true,
          course_code: true,
          course_name: true,
          degree_type: true,
          stream: true
        }
      }
    },
    orderBy: {
      priority: 'asc'
    }
  });
  
  return {
    user: {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone
    },
    profile: profile ? {
      profile_id: profile.profile_id,
      date_of_birth: profile.date_of_birth,
      gender: profile.gender,
      category: profile.categories ? {
        id: profile.categories.category_id,
        code: profile.categories.category_code,
        name: profile.categories.category_name
      } : null,
      preferred_stream: profile.preferred_stream,
      is_profile_complete: profile.is_profile_complete,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    } : null,
    exam_scores: examScores.map(score => ({
      score_id: score.score_id,
      exam: {
        id: score.exams?.exam_id,
        name: score.exams?.exam_name,
        full_name: score.exams?.exam_full_name,
        type: score.exams?.qualification_type
      },
      score_value: score.score_value,
      rank_value: score.rank_value,
      year: score.year
    })),
    course_preferences: coursePreferences.map(pref => ({
      preference_id: pref.preference_id,
      course: {
        id: pref.courses.course_id,
        code: pref.courses.course_code,
        name: pref.courses.course_name,
        degree_type: pref.courses.degree_type,
        stream: pref.courses.stream
      },
      priority: pref.priority
    })),
    is_profile_complete: profile?.is_profile_complete || false
  };
};

// ============================================
// UPDATE STUDENT PROFILE PARTIALLY
// ============================================

/**
 * Update only profile fields (not exam scores or preferences)
 */
export const updateStudentProfile = async (
  userId: string,
  data: Partial<StudentProfileDTO>
) => {
  // Validate if provided
  if (data.category_id && !validateCategoryId(data.category_id)) {
    throw new Error('Invalid category');
  }
  
  if (data.preferred_stream && !validateStream(data.preferred_stream)) {
    throw new Error('Invalid stream');
  }
  
  if (data.gender && !validateGender(data.gender)) {
    throw new Error('Invalid gender');
  }
  
  const profile = await prisma.user_profiles.update({
    where: { user_id: userId },
    data: {
      ...(data.date_of_birth && { date_of_birth: new Date(data.date_of_birth) }),
      ...(data.gender && { gender: data.gender }),
      ...(data.category_id && { category_id: data.category_id }),
      ...(data.preferred_stream && { preferred_stream: data.preferred_stream }),
      updated_at: new Date()
    }
  });
  
  return {
    message: 'Profile updated successfully',
    profile_id: profile.profile_id
  };
};

// ============================================
// GET AVAILABLE EXAMS AND COURSES
// ============================================

/**
 * Get list of all available exams for form dropdown
 */
export const getAvailableExams = async () => {
  const exams = await prisma.exams.findMany({
    select: {
      exam_id: true,
      exam_name: true,
      exam_full_name: true,
      qualification_type: true
    },
    orderBy: {
      exam_name: 'asc'
    }
  });
  
  return exams;
};

/**
 * Get list of all available courses for form dropdown
 * Optionally filter by stream
 */
export const getAvailableCourses = async (stream?: string) => {
  const courses = await prisma.courses.findMany({
    where: stream ? { stream } : undefined,
    select: {
      course_id: true,
      course_code: true,
      course_name: true,
      degree_type: true,
      stream: true
    },
    orderBy: [
      { stream: 'asc' },
      { course_name: 'asc' }
    ]
  });
  
  return courses;
};

/**
 * Get list of categories (GENERAL, OBC, SC, ST, EWS)
 */
export const getCategories = async () => {
  const categories = await prisma.categories.findMany({
    select: {
      category_id: true,
      category_code: true,
      category_name: true
    },
    orderBy: {
      category_id: 'asc'
    }
  });
  
  return categories;
};
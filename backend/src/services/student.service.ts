import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

export interface StudentProfileDTO {
  date_of_birth?: string;
  gender?: string;
  category_id: number;
  stream_id: number;
}

export interface ExamScoreDTO {
  exam_id: number;
  score_value?: number;
  rank_value?: number;
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
// VALIDATION
// ============================================

const validateCategoryId = async (category_id: number): Promise<boolean> => {
  const category = await prisma.categories.findUnique({
    where: { category_id }
  });

  return !!category;
};

const validateStreamId = async (
  stream_id: number
): Promise<boolean> => {
  const stream =
    await prisma.eligible_streams.findUnique({
      where: { stream_id }
    });

  return !!stream;
};

//phone number validation 
export interface StudentProfileDTO {
  date_of_birth?: string;
  gender?: string;
  category_id: number;
  stream_id: number;
  phone: string;          // NEW — mandatory
}
const validatePhone = (phone: string): boolean => {
  // Indian 10-digit mobile number, optionally with +91 prefix
  return /^(\+91)?[6-9]\d{9}$/.test(phone.trim());
};

// const validateStream = (stream: string) =>
//   ['Science', 'Commerce', 'Arts'].includes(stream);

const validateGender = (gender?: string) =>
  !gender ||
  ['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender);

// ============================================
// PROFILE COMPLETION
// ============================================

export const checkProfileCompletion = async (userId: string) => {
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId }
  });

  return profile?.is_profile_complete === true;
};

export const getProfileCompletionStatus = async (userId: string) => {
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    include: { categories: true }
  });

  const examScores = await prisma.user_exam_scores.findMany({
    where: { user_id: userId }
  });

  const coursePreferences = await prisma.user_course_preferences.findMany({
    where: { user_id: userId }
  });

  const missing: string[] = [];

  if (!profile) missing.push('Profile');
  if (!profile?.category_id) missing.push('Category');
  if (!profile?.stream_id)
  missing.push('Stream');
  if (!examScores.length) missing.push('Exam Scores');
  if (!coursePreferences.length) missing.push('Course Preferences');

  return {
    is_complete:
      missing.length === 0 && profile?.is_profile_complete === true,
    missing_fields: missing
  };
};

// ============================================
// COMPLETE FORM
// ============================================

export const completeStudentForm = async (
  userId: string,
  data: CompleteStudentFormDTO
) => {
  if (!(await validateCategoryId(data.profile.category_id))) {
  throw new Error('Invalid category');
}

  if (
  !(await validateStreamId(
    data.profile.stream_id
  ))
) {
  throw new Error('Invalid stream');
}

  if (!validateGender(data.profile.gender))
    throw new Error('Invalid gender');

  const user = await prisma.users.findUnique({
    where: { user_id: userId }
  });

  if (!data.profile.phone || !validatePhone(data.profile.phone)) {
  throw new Error('Invalid or missing phone number');
}

  if (!user) throw new Error('User not found');

  const result = await prisma.$transaction(async (tx) => {
  await tx.users.update({
    where: { user_id: userId },
    data: { phone: data.profile.phone.trim() },
    
    
  });
    const profile = await tx.user_profiles.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        date_of_birth: data.profile.date_of_birth
          ? new Date(data.profile.date_of_birth)
          : null,
        gender: data.profile.gender || null,
        category_id: data.profile.category_id,
        stream_id:
  data.profile.stream_id,
        is_profile_complete: true
      },
      update: {
        date_of_birth: data.profile.date_of_birth
          ? new Date(data.profile.date_of_birth)
          : undefined,
        gender: data.profile.gender || undefined,
        category_id: data.profile.category_id,
        stream_id:
  data.profile.stream_id,
        is_profile_complete: true
      }
    });

    await tx.user_exam_scores.deleteMany({ where: { user_id: userId } });

    await tx.user_exam_scores.createMany({
      data: data.exam_scores.map(s => ({
        user_id: userId,
        exam_id: s.exam_id,
        score_value: s.score_value || null,
        rank_value: s.rank_value || null,
        year: s.year
      }))
    });

    await tx.user_course_preferences.deleteMany({
      where: { user_id: userId }
    });

    await tx.user_course_preferences.createMany({
      data: data.course_preferences.map((p, i) => ({
        user_id: userId,
        course_id: p.course_id,
        priority: p.priority || i + 1
      }))
    });

    return profile;

    
  },
{
    timeout: 15000,
    maxWait: 5000,
  });
  

  return {
    message: 'Profile completed successfully',
    profile_id: result.profile_id
  };
};

// ============================================
// GET PROFILE
// ============================================

export const getStudentProfile = async (userId: string) => {
  

  const user = await prisma.users.findUnique({
    where: { user_id: userId }
  });

  if (!user) throw new Error('User not found');

  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    include: { categories: true }
  });

  const examScores = await prisma.user_exam_scores.findMany({
    where: { user_id: userId },
    include: { exams: true }
  });

  const coursePreferences = await prisma.user_course_preferences.findMany({
    where: { user_id: userId },
    include: { courses: true }
  });

  return {
    user,
    profile,
    exam_scores: examScores.map(s => ({
      score_id: s.score_id,
      exam: s.exams || null,
      score_value: s.score_value,
      rank_value: s.rank_value,
      year: s.year
    })),
    course_preferences: coursePreferences.map(p => ({
      preference_id: p.preference_id,
      course: p.courses
        ? {
            course_id: p.courses.course_id,
            course_code: p.courses.course_code,
            course_name: p.courses.course_name,
            degree_type: p.courses.degree_type,
            stream: p.courses.stream
          }
        : null,
      priority: p.priority
    })),
    is_profile_complete: profile?.is_profile_complete || false
  };
};

// ============================================
// UPDATE PROFILE
// ============================================

export const updateStudentProfile = async (
  userId: string,
  data: Partial<StudentProfileDTO>
) => {
  if (data.phone !== undefined && !validatePhone(data.phone)) {
    throw new Error('Invalid phone number');
  }

  if (data.phone) {
    await prisma.users.update({
      where: { user_id: userId },
      data: { phone: data.phone.trim() }
    });
  }

  const profile = await prisma.user_profiles.update({
    where: { user_id: userId },
    data: {
      ...(data.date_of_birth && { date_of_birth: new Date(data.date_of_birth) }),
      ...(data.gender && { gender: data.gender }),
      ...(data.category_id && { category_id: data.category_id }),
      ...(data.stream_id && { stream_id: data.stream_id })
    }
  });

  return {
    message: 'Profile updated successfully',
    profile_id: profile.profile_id
  };
};

// ============================================
// DROPDOWNS
// ============================================

export const getAvailableExams = async () => {
  return prisma.exams.findMany({
    orderBy: { exam_name: 'asc' }
  });
};

// export const getAvailableCourses = async (
//   streamId?: number
// ) => {
//   const mappings =
//     await prisma.course_eligible_streams.findMany({
//       where: streamId
//         ? {
//             stream_id: streamId
//           }
//         : undefined,

//       include: {
//         courses: true
//       }
//     });

//   return mappings
//     .map((m) => m.courses)
//     .filter(Boolean);
// };

export const getAvailableCourses = async (
  streamId?: number,
  examId?: number
) => {
  // Get course IDs valid for this stream
  let streamCourseIds: number[] | undefined;
  if (streamId) {
    const mappings = await prisma.course_eligible_streams.findMany({
      where: { stream_id: streamId },
      select: { course_id: true }
    });
    streamCourseIds = [...new Set(mappings.map(m => m.course_id))];
  }

  // Get course IDs valid for this exam via college_course_exam_eligibility
  let examCourseIds: number[] | undefined;
  if (examId) {
    const eligibility = await prisma.college_course_exam_eligibility.findMany({
      where: { exam_id: examId },
      select: {
        college_courses: {
          select: { course_id: true }
        }
      }
    });
    examCourseIds = [...new Set(
  eligibility
    .map(e => e.college_courses?.course_id)
    .filter((id): id is number => id != null)
)];
  }

  // Intersect both filters
  let validCourseIds: number[];
  if (streamCourseIds && examCourseIds) {
    const examSet = new Set(examCourseIds);
    validCourseIds = streamCourseIds.filter(id => examSet.has(id));
  } else {
    validCourseIds = streamCourseIds ?? examCourseIds ?? [];
  }

  // If no filters at all, return everything
  if (!streamId && !examId) {
    return prisma.courses.findMany({ orderBy: { course_name: 'asc' } });
  }

  return prisma.courses.findMany({
    where: { course_id: { in: validCourseIds } },
    orderBy: { course_name: 'asc' }
  });
};

export const getCategories = async () => {
  return prisma.categories.findMany({
    orderBy: { category_id: 'asc' }
  });
};

export const getStreams = async (examId: number) => {
  return prisma.eligible_streams.findMany({
    where: {
      exam_eligible_streams: {
        some: {
          exam_id: examId
        }
      }
    },
    orderBy: {
      stream_name: 'asc'
    }
  });
};


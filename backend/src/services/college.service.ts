import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

interface CollegeFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

interface RecommendedCourse {
  course_id: number;
  course_name: string;
  degree_type: string | null;
  specialization: string | null;
  cutoff_value: number | null;
  cutoff_rank: number | null;
  exam_name: string;
  is_preferred: boolean;
}

interface RecommendedCollege {
  college_id: number;
  college_name: string;
  college_type: string;
  city: string;
  state: string;
  website_url: string | null;
  is_partner: boolean;
  courses: RecommendedCourse[];
  match_score: number;
}

// ============================================
// RECOMMENDED COLLEGES (PERSONALIZED)
// ============================================

export const getRecommendedColleges = async (
  userId: string,
  filters: CollegeFilters = {}
) => {
  const { search, page = 1, pageSize = 9 } = filters;

  // ── 1. STUDENT PROFILE ──────────────────────────────
  const student = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
  });

  if (!student) {
    throw new Error('Student profile not found.');
  }

  if (!student.is_profile_complete) {
    throw new Error('PROFILE_INCOMPLETE');
  }

  // ── 2. EXAM SCORES ──────────────────────────────────
  const examScores = await prisma.user_exam_scores.findMany({
    where: { user_id: userId },
  });

  if (examScores.length === 0) {
    throw new Error('No exam scores found. Please complete your profile.');
  }

  // ── 3. COURSE PREFERENCES ───────────────────────────
  const coursePreferences = await prisma.user_course_preferences.findMany({
    where: { user_id: userId },
    orderBy: { priority: 'asc' },
  });

  const preferredCourseIds = new Set(coursePreferences.map(p => p.course_id));

  // ── 4. GET COURSES VALID FOR STUDENT'S STREAM ───────
  // We'll use this to filter out courses that don't belong to student's stream
  const streamCourses = await prisma.course_eligible_streams.findMany({
    where: { stream_id: student.stream_id ?? undefined },
    select: { course_id: true },
  });

  const streamCourseIds = new Set(streamCourses.map(sc => sc.course_id));

  // ── 5. FIND ELIGIBLE CUTOFFS ─────────────────────────
  // For each exam score the student has, find cutoff rows they meet
  const cutoffConditions = examScores.map(score => {
    const condition: any = {
      exam_id: score.exam_id,
      category_id: student.category_id,
    };

    if (score.score_value !== null) {
      // Score-based: student's score must be >= cutoff_score
      condition.cutoff_score = { lte: score.score_value };
    } else if (score.rank_value !== null) {
      // Rank-based: student's rank must be <= cutoff_rank (lower rank = better)
      condition.cutoff_rank = { gte: score.rank_value };
    }

    return condition;
  });

  const eligibleCutoffs = await prisma.cutoff_data.findMany({
    where: {
      OR: cutoffConditions,
    },
    include: {
      college_courses: {
        include: {
          colleges: true,
          courses: true,
          course_specializations: true,
        },
      },
      exams: {
        select: { exam_name: true },
      },
    },
  });

  // ── 6. BUILD COLLEGE MAP ─────────────────────────────
  const collegeMap = new Map<number, RecommendedCollege>();

  for (const cutoff of eligibleCutoffs) {
    const cc = cutoff.college_courses;
    if (!cc || !cc.colleges || !cc.courses) continue;

    const college = cc.colleges;
    const course = cc.courses;

    // Filter: only courses valid for student's stream
    if (!streamCourseIds.has(course.course_id)) continue;

    // Filter: search
    if (search && !college.college_name.toLowerCase().includes(search.toLowerCase())) {
      continue;
    }

    // Init college entry
    if (!collegeMap.has(college.college_id)) {
      collegeMap.set(college.college_id, {
        college_id: college.college_id,
        college_name: college.college_name,
        college_type: college.college_type ?? 'Unknown',
        city: college.city ?? '',
        state: college.state ?? '',
        website_url: college.website_url ?? null,
        is_partner: college.is_partner ?? false,
        courses: [],
        match_score: 0,
      });
    }

    const entry = collegeMap.get(college.college_id)!;
    const isPreferred = preferredCourseIds.has(course.course_id);

    // Avoid duplicate courses per college
    const alreadyAdded = entry.courses.some(c => c.course_id === course.course_id);
    if (!alreadyAdded) {
      entry.courses.push({
        course_id: course.course_id,
        course_name: course.course_name,
        degree_type: course.degree_type ?? null,
        specialization: cc.course_specializations?.specialization_name ?? null,
        cutoff_value: cutoff.cutoff_score ? Number(cutoff.cutoff_score) : null,
        cutoff_rank: cutoff.cutoff_rank ?? null,
        exam_name: cutoff.exams?.exam_name ?? '',
        is_preferred: isPreferred,
      });
    }

    // ── 7. MATCH SCORE ─────────────────────────────────
    // Base: 50
    // +30 if any course is in student's preferences
    // +10 if partner college
    // +10 if student scored well above cutoff (margin > 5)
    let score = 50;

    if (isPreferred) score += 30;
    if (college.is_partner) score += 10;

    // Cutoff margin bonus
    const studentScore = examScores.find(s => s.exam_id === cutoff.exam_id);
    if (studentScore?.score_value && cutoff.cutoff_score) {
      const margin = Number(studentScore.score_value) - Number(cutoff.cutoff_score);
      if (margin > 5) score += 10;
    }

    // Keep the highest score across all cutoff rows for this college
    entry.match_score = Math.max(entry.match_score, score);
  }

  // ── 8. SORT ──────────────────────────────────────────
  const results = Array.from(collegeMap.values()).sort((a, b) => {
    if (b.match_score !== a.match_score) return b.match_score - a.match_score;
    if (a.is_partner !== b.is_partner) return a.is_partner ? -1 : 1;
    return a.college_name.localeCompare(b.college_name);
  });

  // ── 9. PAGINATE ──────────────────────────────────────
  const total = results.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = results.slice((page - 1) * pageSize, page * pageSize);

  return {
    data: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
};

// ============================================
// ALL COLLEGES (NON-PERSONALIZED FALLBACK)
// ============================================

export const getAllColleges = async (filters: CollegeFilters = {}) => {
  const { search, page = 1, pageSize = 9 } = filters;

  const whereClause: any = {};

  if (search) {
    whereClause.college_name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  const total = await prisma.colleges.count({ where: whereClause });

  const colleges = await prisma.colleges.findMany({
    where: whereClause,
    include: {
      college_courses: {
        include: {
          courses: true,
          course_specializations: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [{ is_partner: 'desc' }, { college_name: 'asc' }],
  });

  const data = colleges.map(college => ({
    college_id: college.college_id,
    college_name: college.college_name,
    college_type: college.college_type ?? 'Unknown',
    city: college.city ?? '',
    state: college.state ?? '',
    website_url: college.website_url ?? null,
    is_partner: college.is_partner ?? false,
    courses: college.college_courses
      .filter(cc => cc.courses !== null)
      .map(cc => ({
        course_id: cc.courses!.course_id,
        course_name: cc.courses!.course_name,
        degree_type: cc.courses!.degree_type ?? null,
        specialization: cc.course_specializations?.specialization_name ?? null,
      })),
  }));

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};

// ============================================
// SINGLE COLLEGE DETAIL
// ============================================

export const getCollegeById = async (collegeId: number) => {
  const college = await prisma.colleges.findUnique({
    where: { college_id: collegeId },
    include: {
      college_courses: {
        include: {
          courses: true,
          course_specializations: true,
          cutoff_data: {
            include: {
              exams: true,
              categories: true,
            },
          },
        },
      },
    },
  });

  if (!college) throw new Error('College not found');

  return {
    college_id: college.college_id,
    college_name: college.college_name,
    college_type: college.college_type,
    affiliation: college.affiliation,
    city: college.city,
    state: college.state,
    address: college.address,
    website_url: college.website_url,
    established_year: college.established_year,
    is_partner: college.is_partner,
    courses: college.college_courses
      .filter(cc => cc.courses !== null)
      .map(cc => ({
        course_id: cc.courses!.course_id,
        course_name: cc.courses!.course_name,
        degree_type: cc.courses!.degree_type,
        stream: cc.courses!.stream,
        duration_years: cc.courses!.duration_years,
        specialization: cc.course_specializations?.specialization_name ?? null,
        cutoffs: cc.cutoff_data.map(c => ({
          exam: c.exams?.exam_name,
          category: c.categories?.category_code,
          cutoff_score: c.cutoff_score,
          cutoff_rank: c.cutoff_rank,
          round_number: c.round_number,
          academic_year: c.academic_year,
        })),
      })),
  };
};
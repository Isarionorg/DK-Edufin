import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Prisma payload type for college_courses with all relations included in step 8
type CollegeCourseWithCutoffs = Prisma.college_coursesGetPayload<{
  include: {
    courses: true;
    course_specializations: true;
    cutoff_data: {
      include: {
        exams: { select: { exam_name: true } };
      };
    };
  };
}>;

// ============================================
// TYPES
// ============================================

interface CollegeFilters {
  search?: string;
  state?: string;
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
  naac_grade: string | null;
  courses: RecommendedCourse[];
  match_score: number;
  best_cutoff_rank: number | null;
  best_cutoff_score: number | null;
}

// ============================================
// RECOMMENDED COLLEGES (PERSONALIZED)
// ============================================

export const getRecommendedColleges = async (
  userId: string,
  filters: CollegeFilters = {}
) => {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('A valid user ID is required.');
  }

  const { search, state, page = 1, pageSize = 9 } = filters;

  if (page < 1 || pageSize < 1) {
    throw new Error('Page and page size must be positive numbers.');
  }

  // ── 1. STUDENT PROFILE ──────────────────────────────
  const student = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
  });

  if (!student) throw new Error('Student profile not found.');
  if (!student.is_profile_complete) throw new Error('PROFILE_INCOMPLETE');

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

  // ── 4. STREAM-ELIGIBLE COURSE IDs ───────────────────
  const streamCourseIds = new Set<number>();

  if (student.stream_id != null) {
    const streamCourses = await prisma.course_eligible_streams.findMany({
      where: { stream_id: student.stream_id },
      select: { course_id: true },
    });
    for (const sc of streamCourses) {
      streamCourseIds.add(sc.course_id);
    }
  }

  if (streamCourseIds.size === 0) {
    throw new Error('No eligible courses found for your stream. Please update your profile.');
  }

  // ── 5. FIND ELIGIBLE CUTOFFS ─────────────────────────
  const cutoffConditions = examScores.map(score => {
    const condition: any = {
      exam_id: score.exam_id,
      ...(student.category_id != null && { category_id: student.category_id }),
    };
    if (score.score_value !== null) {
      condition.cutoff_score = { lte: score.score_value };
    } else if (score.rank_value !== null) {
      condition.cutoff_rank = { gte: score.rank_value };
    }
    return condition;
  });

  // examScoreMap for O(1) lookup instead of repeated .find() inside loops
  const examScoreMap = new Map(examScores.map(s => [s.exam_id, s]));

  const eligibleCutoffs = await prisma.cutoff_data.findMany({
    where: { OR: cutoffConditions },
    orderBy: [
      { academic_year: 'desc' },
      { round_number: 'desc' },
    ],
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
    if (!cc?.colleges || !cc.courses) continue;

    const college = cc.colleges;
    const course = cc.courses;

    // Only stream-valid courses
    if (!streamCourseIds.has(course.course_id)) continue;

    // Search filter
    if (
      search &&
      !college.college_name.toLowerCase().includes(search.toLowerCase())
    ) continue;

    // State filter
    if (
      state &&
      college.state?.toLowerCase() !== state.toLowerCase()
    ) continue;

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
        naac_grade: college.naac_grade ?? null,
        courses: [],
        match_score: 0,
        best_cutoff_rank: null,
        best_cutoff_score: null,
      });
    }

    const entry = collegeMap.get(college.college_id)!;

    // Track best rank/score for tie-breaking sort (step 9)
    if (cutoff.cutoff_rank != null) {
      entry.best_cutoff_rank =
        entry.best_cutoff_rank == null
          ? cutoff.cutoff_rank
          : Math.min(entry.best_cutoff_rank, cutoff.cutoff_rank);
    }
    if (cutoff.cutoff_score != null) {
      const s = Number(cutoff.cutoff_score);
      entry.best_cutoff_score =
        entry.best_cutoff_score == null
          ? s
          : Math.max(entry.best_cutoff_score, s);
    }

    // Add course with cutoff data — first row wins (orderBy DESC guarantees it's the latest year)
    const alreadyAdded = entry.courses.some(c => c.course_id === course.course_id);

    if (!alreadyAdded) {
      entry.courses.push({
        course_id: course.course_id,
        course_name: course.course_name,
        degree_type: course.degree_type ?? null,
        specialization: cc.course_specializations?.specialization_name ?? null,
        cutoff_value: cutoff.cutoff_score != null ? Number(cutoff.cutoff_score) : null,
        cutoff_rank: cutoff.cutoff_rank ?? null,
        exam_name: cutoff.exams?.exam_name ?? '',
        is_preferred: preferredCourseIds.has(course.course_id),
      });
    }

    // ── 7. MATCH SCORE ──────────────────────────────────
    const isPreferred = preferredCourseIds.has(course.course_id);
    let score = 50;
    if (isPreferred) score += 30;
    if (college.is_partner) score += 10;

    const studentExamScore = examScoreMap.get(cutoff.exam_id);
    if (studentExamScore?.score_value && cutoff.cutoff_score) {
      const margin = Number(studentExamScore.score_value) - Number(cutoff.cutoff_score);
      if (margin > 5) score += 10;
    }

    entry.match_score = Math.max(entry.match_score, score);
  }

  // ── 8. APPEND REMAINING STREAM-VALID COURSES (with their actual cutoffs) ──
  if (collegeMap.size > 0) {
    const remainingCourses = await prisma.college_courses.findMany({
      where: {
        college_id: { in: Array.from(collegeMap.keys()) },
        course_id: { in: Array.from(streamCourseIds) },
      },
      include: {
        courses: true,
        course_specializations: true,
        cutoff_data: {
          where: {
            ...(student.category_id != null && { category_id: student.category_id }),
            exam_id: { in: examScores.map(s => s.exam_id).filter((id): id is number => id != null) },
          },
          orderBy: [
            { academic_year: 'desc' },
            { round_number: 'desc' },
          ],
          include: {
            exams: { select: { exam_name: true } },
          },
        },
      },
    });

    for (const cc of remainingCourses as CollegeCourseWithCutoffs[]) {
      if (!cc.courses) continue;
      const entry = cc.college_id != null ? collegeMap.get(cc.college_id) : undefined;
      if (!entry) continue;

      // Already added by step 6 — skip
      const alreadyAdded = entry.courses.some(c => c.course_id === cc.courses!.course_id);
      if (alreadyAdded) continue;

      // No cutoff rows in DB for this course + student's category/exams — hide it
      if (cc.cutoff_data.length === 0) continue;

      // Take the most recent row (already sorted latest-first)
      const latestCutoff = cc.cutoff_data[0];

      entry.courses.push({
        course_id: cc.courses.course_id,
        course_name: cc.courses.course_name,
        degree_type: cc.courses.degree_type ?? null,
        specialization: cc.course_specializations?.specialization_name ?? null,
        cutoff_value: latestCutoff.cutoff_score != null
          ? Number(latestCutoff.cutoff_score)
          : null,
        cutoff_rank: latestCutoff.cutoff_rank ?? null,
        exam_name: latestCutoff.exams?.exam_name ?? '',
        is_preferred: preferredCourseIds.has(cc.courses.course_id),
      });
    }
  }

  // ── 9. SORT ──────────────────────────────────────────
  const results = Array.from(collegeMap.values()).sort((a, b) => {
    if (b.match_score !== a.match_score) return b.match_score - a.match_score;

    if (a.best_cutoff_rank != null && b.best_cutoff_rank != null) {
      if (a.best_cutoff_rank !== b.best_cutoff_rank)
        return a.best_cutoff_rank - b.best_cutoff_rank;
    } else if (a.best_cutoff_rank != null) return -1;
    else if (b.best_cutoff_rank != null) return 1;

    if (a.best_cutoff_score != null && b.best_cutoff_score != null) {
      if (a.best_cutoff_score !== b.best_cutoff_score)
        return b.best_cutoff_score - a.best_cutoff_score;
    } else if (a.best_cutoff_score != null) return -1;
    else if (b.best_cutoff_score != null) return 1;

    if (a.is_partner !== b.is_partner) return a.is_partner ? -1 : 1;

    return a.college_name.localeCompare(b.college_name);
  });

  // ── 10. PAGINATE ─────────────────────────────────────
  const total = results.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = results.slice((page - 1) * pageSize, page * pageSize);

  return { data: paginated, total, page, pageSize, totalPages };
};

// ============================================
// ALL COLLEGES (NON-PERSONALIZED FALLBACK)
// ============================================

export const getAllColleges = async (filters: CollegeFilters = {}) => {
  const { search, state, page = 1, pageSize = 9 } = filters;

  if (page < 1 || pageSize < 1) {
    throw new Error('Page and page size must be positive numbers.');
  }

  const whereClause: any = {};
  if (search) {
    whereClause.college_name = { contains: search, mode: 'insensitive' };
  }
  if (state) {
    whereClause.state = { equals: state, mode: 'insensitive' };
  }

  const [total, colleges] = await Promise.all([
    prisma.colleges.count({ where: whereClause }),
    prisma.colleges.findMany({
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
    }),
  ]);

  const data = colleges.map(college => ({
    college_id: college.college_id,
    college_name: college.college_name,
    college_type: college.college_type ?? 'Unknown',
    city: college.city ?? '',
    state: college.state ?? '',
    website_url: college.website_url ?? null,
    is_partner: college.is_partner ?? false,
    naac_grade: college.naac_grade ?? null,
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
// DISTINCT STATES (FOR FILTER DROPDOWN)
// ============================================

export const getDistinctStates = async () => {
  const rows = await prisma.colleges.findMany({
    distinct: ['state'],
    select: { state: true },
    where: { state: { not: null } },
    orderBy: { state: 'asc' },
  });
  return rows.map(r => r.state).filter(Boolean);
};

// ============================================
// SINGLE COLLEGE DETAIL
// ============================================

export const getCollegeById = async (collegeId: number) => {
  if (collegeId == null || isNaN(collegeId) || collegeId < 1) {
    throw new Error('A valid college ID is required.');
  }

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

  if (!college) throw new Error('College not found.');

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
    naac_grade: college.naac_grade,
    courses: college.college_courses
      .filter(cc => cc.courses !== null)
      .map(cc => ({
        course_id: cc.courses!.course_id,
        course_name: cc.courses!.course_name,
        degree_type: cc.courses!.degree_type ?? null,
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
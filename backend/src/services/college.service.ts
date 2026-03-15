// src/services/college.service.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

interface CollegeFilters {
  stream?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface RecommendedCollege {
  college_id: number;
  college_name: string;
  college_type: string;
  city: string;
  state: string;
  website_url: string | null;
  is_partner: boolean;
  courses: {
    course_id: number;
    course_name: string;
    degree_type: string | null;
    specialization: string | null;
    cutoff_met: boolean;
    cutoff_value: number | null;
    exam_name: string;
  }[];
  match_score: number; // 0-100, how well this college matches student preferences
}

// ============================================
// COLLEGE RECOMMENDATION ENGINE
// ============================================

/**
 * Get personalized college recommendations based on student profile
 * 
 * Algorithm:
 * 1. Get student's exam scores, category, and course preferences
 * 2. Find colleges where student meets cutoffs
 * 3. Filter by Delhi NCR (current target region)
 * 4. Prioritize based on:
 *    - Course preference match
 *    - Partner colleges
 *    - Cutoff margin (how much above cutoff)
 * 5. Return ranked list
 */
export const getRecommendedColleges = async (
  userId: string,
  filters: CollegeFilters = {}
) => {
  const {
    stream,
    search,
    page = 1,
    pageSize = 9
  } = filters;
  
  // 1. GET STUDENT DATA
  const student = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    include: {
      categories: true
    }
  });
  
  if (!student) {
    throw new Error('Student profile not found. Please complete your profile first.');
  }
  
  if (!student.is_profile_complete) {
    throw new Error('Please complete your student profile to get recommendations');
  }
  
  const examScores = await prisma.user_exam_scores.findMany({
    where: { user_id: userId },
    include: { exams: true }
  });
  
  const coursePreferences = await prisma.user_course_preferences.findMany({
    where: { user_id: userId },
    include: { courses: true },
    orderBy: { priority: 'asc' }
  });
  
  // 2. BUILD CUTOFF QUERY
  // Find all college-courses where student meets cutoff
  const eligibleCollegeCourses = await prisma.cutoff_data.findMany({
    where: {
      AND: [
        // Category match
        { category_id: student.category_id },
        
        // Academic year (latest)
        { academic_year: new Date().getFullYear() },
        
        // Exam match with score/rank criteria
        {
          OR: examScores.map(score => ({
            AND: [
              { exam_id: score.exam_id },
              {
                OR: [
                  // Score-based cutoff
                  score.score_value ? {
                    cutoff_score: { lte: score.score_value }
                  } : {},
                  // Rank-based cutoff
                  score.rank_value ? {
                    cutoff_rank: { gte: score.rank_value }
                  } : {}
                ]
              }
            ]
          }))
        }
      ]
    },
    include: {
      college_courses: {
        include: {
          colleges: true,
          courses: true,
          course_specializations: true
        }
      },
      exams: true
    }
  });
  
  // 3. GROUP BY COLLEGE AND CALCULATE MATCH SCORES
  const collegeMap = new Map<number, RecommendedCollege>();
  
  for (const cutoff of eligibleCollegeCourses) {
    const collegeCourse = cutoff.college_courses;
    if (!collegeCourse || !collegeCourse.colleges) continue;
    
    const college = collegeCourse.colleges;
    
    // Filter: Delhi NCR only
    if (college.state !== 'Delhi' && college.city !== 'Delhi' && 
        !college.city?.toLowerCase().includes('ncr') &&
        !college.city?.toLowerCase().includes('noida') &&
        !college.city?.toLowerCase().includes('gurgaon') &&
        !college.city?.toLowerCase().includes('faridabad') &&
        !college.city?.toLowerCase().includes('ghaziabad')) {
      continue;
    }
    
    // Apply search filter
    if (search && !college.college_name.toLowerCase().includes(search.toLowerCase())) {
      continue;
    }
    
    // Apply stream filter
    if (stream && stream !== 'All' && collegeCourse.courses?.stream !== stream) {
      continue;
    }
    
    // Get or create college entry
    if (!collegeMap.has(college.college_id)) {
      collegeMap.set(college.college_id, {
        college_id: college.college_id,
        college_name: college.college_name,
        college_type: college.college_type || 'Unknown',
        city: college.city || 'Delhi',
        state: college.state || 'Delhi',
        website_url: college.website_url,
        is_partner: college.is_partner || false,
        courses: [],
        match_score: 0
      });
    }
    
    const collegeEntry = collegeMap.get(college.college_id)!;
    
    // Add course
    collegeEntry.courses.push({
      course_id: collegeCourse.courses!.course_id,
      course_name: collegeCourse.courses!.course_name,
      degree_type: collegeCourse.courses!.degree_type,
      specialization: collegeCourse.course_specializations?.specialization_name || null,
      cutoff_met: true,
      cutoff_value: cutoff.cutoff_score?.toNumber() || cutoff.cutoff_rank || null,
      exam_name: cutoff.exams?.exam_name || 'Unknown'
    });
    
    // Calculate match score (0-100)
    let score = 50; // base score
    
    // +30 for course preference match
    const courseInPreferences = coursePreferences.some(
      pref => pref.course_id === collegeCourse.courses!.course_id
    );
    if (courseInPreferences) {
      score += 30;
    }
    
    // +10 for partner colleges
    if (college.is_partner) {
      score += 10;
    }
    
    // +10 for higher cutoff margin (student scored well above cutoff)
    const studentScore = examScores.find(s => s.exam_id === cutoff.exam_id);
    if (studentScore && cutoff.cutoff_score) {
      const margin = (studentScore.score_value?.toNumber() || 0) - cutoff.cutoff_score.toNumber();
      if (margin > 5) score += 10; // 5+ points above cutoff
    }
    
    collegeEntry.match_score = Math.max(collegeEntry.match_score, score);
  }
  
  // 4. CONVERT TO ARRAY AND SORT
  let recommendations = Array.from(collegeMap.values());
  
  // Sort by: match_score DESC, is_partner DESC, college_name ASC
  recommendations.sort((a, b) => {
    if (a.match_score !== b.match_score) {
      return b.match_score - a.match_score;
    }
    if (a.is_partner !== b.is_partner) {
      return a.is_partner ? -1 : 1;
    }
    return a.college_name.localeCompare(b.college_name);
  });
  
  // 5. PAGINATE
  const total = recommendations.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = recommendations.slice(startIndex, startIndex + pageSize);
  
  return {
    data: paginatedResults,
    total,
    page,
    pageSize,
    totalPages
  };
};

// ============================================
// GET ALL COLLEGES (WITHOUT PERSONALIZATION)
// ============================================

/**
 * Get colleges with basic filtering (no personalization)
 * Used when student hasn't completed profile
 */
export const getAllColleges = async (filters: CollegeFilters = {}) => {
  const {
    stream,
    search,
    page = 1,
    pageSize = 9
  } = filters;
  
  const whereClause: any = {
    // Delhi NCR only
    OR: [
      { state: 'Delhi' },
      { city: { contains: 'Delhi', mode: 'insensitive' } },
      { city: { contains: 'NCR', mode: 'insensitive' } },
      { city: { contains: 'Noida', mode: 'insensitive' } },
      { city: { contains: 'Gurgaon', mode: 'insensitive' } },
      { city: { contains: 'Faridabad', mode: 'insensitive' } },
      { city: { contains: 'Ghaziabad', mode: 'insensitive' } }
    ]
  };
  
  // Search filter
  if (search) {
    whereClause.college_name = {
      contains: search,
      mode: 'insensitive'
    };
  }
  
  // Get total count
  const total = await prisma.colleges.count({ where: whereClause });
  
  // Get paginated colleges
  const colleges = await prisma.colleges.findMany({
    where: whereClause,
    include: {
      college_courses: {
        include: {
          courses: true,
          course_specializations: true
        },
        where: stream && stream !== 'All' ? {
          courses: { stream }
        } : undefined
      }
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [
      { is_partner: 'desc' },
      { college_name: 'asc' }
    ]
  });
  
  // Format response
  const data = colleges.map(college => ({
    college_id: college.college_id,
    college_name: college.college_name,
    college_type: college.college_type || 'Unknown',
    city: college.city || 'Delhi',
    state: college.state || 'Delhi',
    website_url: college.website_url,
    is_partner: college.is_partner || false,
    courses: college.college_courses.map(cc => ({
      course_id: cc.courses!.course_id,
      course_name: cc.courses!.course_name,
      degree_type: cc.courses!.degree_type,
      specialization: cc.course_specializations?.specialization_name || null,
      stream: cc.courses!.stream
    }))
  }));
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
};

// ============================================
// GET COLLEGE DETAILS
// ============================================

/**
 * Get detailed information about a specific college
 */
export const getCollegeById = async (collegeId: number) => {
  const college = await prisma.colleges.findUnique({
    where: { college_id: collegeId },
    include: {
      college_courses: {
        include: {
          courses: true,
          course_specializations: true,
          cutoff_data: {
            where: {
              academic_year: new Date().getFullYear()
            },
            include: {
              exams: true,
              categories: true
            }
          }
        }
      }
    }
  });
  
  if (!college) {
    throw new Error('College not found');
  }
  
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
        course_code: cc.courses!.course_code,
        degree_type: cc.courses!.degree_type,
        stream: cc.courses!.stream,
        duration_years: cc.courses!.duration_years,
        specialization: cc.course_specializations?.specialization_name,
        cutoffs: cc.cutoff_data.map(cutoff => ({
          exam: cutoff.exams?.exam_name,
          category: cutoff.categories?.category_code,
          cutoff_score: cutoff.cutoff_score,
          cutoff_rank: cutoff.cutoff_rank,
          round_number: cutoff.round_number,
          academic_year: cutoff.academic_year
        }))
      }))
  };
};
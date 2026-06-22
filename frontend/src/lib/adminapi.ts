/**
 * Thin typed wrapper around fetch for the admin API.
 * Reads NEXT_PUBLIC_API_URL from env, falls back to localhost:5000.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; message?: string }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  return json;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  colleges: number;
  courses: number;
  collegeCourses: number;
  cutoffs: number;
}

export async function fetchStats(): Promise<AdminStats> {
  const res = await apiFetch<AdminStats>("/admin/stats");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to fetch stats");
  return res.data;
}

// ── Colleges ──────────────────────────────────────────────────────────────

export interface ApiCollege {
  college_id: number;
  college_name: string;
  college_type: string | null;
  city: string | null;
  state: string | null;
  website_url: string | null;
  is_partner: boolean | null;
  naac_grade: string | null;
  created_at: string | null;
}

export async function fetchColleges(): Promise<ApiCollege[]> {
  const res = await apiFetch<ApiCollege[]>("/admin/colleges");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to fetch colleges");
  return res.data;
}

export async function createCollege(payload: {
  name: string;
  type: string;
  city: string;
  state: string;
  website?: string;
  isPartner: boolean;
  naacGrade?: string;
}): Promise<ApiCollege> {
  const res = await apiFetch<ApiCollege>("/admin/colleges", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to create college");
  return res.data;
}

// ── Courses ───────────────────────────────────────────────────────────────

export interface ApiCourse {
  course_id: number;
  course_name: string;
  degree_type: string | null;
  eligible_streams: { stream_id: number; stream_code: string; stream_name: string }[];
}

export async function fetchCourses(): Promise<ApiCourse[]> {
  const res = await apiFetch<ApiCourse[]>("/admin/courses");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to fetch courses");
  return res.data;
}

export async function createCourse(payload: {
  name: string;
  degreeType: string;
  eligibleStreamCodes: string[];
}): Promise<ApiCourse> {
  const res = await apiFetch<ApiCourse>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to create course");
  return res.data;
}

// ── College-Course Links ──────────────────────────────────────────────────

export interface ApiCollegeCourse {
  college_course_id: number;
  college_id: number | null;
  course_id: number | null;
  is_available: boolean | null;
  created_at: string | null;
  colleges: { college_id: number; college_name: string } | null;
  courses: { course_id: number; course_name: string; degree_type: string | null } | null;
}

export async function fetchCollegeCourses(): Promise<ApiCollegeCourse[]> {
  const res = await apiFetch<ApiCollegeCourse[]>("/admin/college-courses");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to fetch links");
  return res.data;
}

export async function createCollegeCourse(payload: {
  collegeId: number;
  courseId: number;
}): Promise<ApiCollegeCourse> {
  const res = await apiFetch<ApiCollegeCourse>("/admin/college-courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to create link");
  return res.data;
}

// ── Cutoffs ───────────────────────────────────────────────────────────────

export interface ApiCutoff {
  cutoff_id: number;
  college_course_id: number | null;
  cutoff_score: string | null;
  cutoff_rank: number | null;
  academic_year: number;
  round_number: number;
  categories: { category_id: number; category_code: string; category_name: string | null } | null;
  exams: { exam_id: number; exam_name: string } | null;
  college_courses: {
    colleges: { college_name: string } | null;
    courses: { course_name: string } | null;
  } | null;
}

export async function fetchCutoffs(): Promise<ApiCutoff[]> {
  const res = await apiFetch<ApiCutoff[]>("/admin/cutoffs");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to fetch cutoffs");
  return res.data;
}

export async function createCutoff(payload: {
  collegeCourseId: number;
  examName: string;
  categoryCode: string;
  cutoffScore?: number;
  cutoffRank?: number;
  academicYear: number;
  roundNumber: number;
}): Promise<ApiCutoff> {
  const res = await apiFetch<ApiCutoff>("/admin/cutoffs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to create cutoff");
  return res.data;
}

// ── Bulk Upload ───────────────────────────────────────────────────────────

export interface BulkUploadResult {
  processed: number;
  colleges: { created: number; existing: number };
  courses: { created: number; existing: number };
  links: { created: number; existing: number };
  cutoffs: { created: number; updated: number };
  errors: { rowIndex: number; message: string }[];
}

export async function bulkUpload(rows: object[]): Promise<BulkUploadResult> {
  const res = await apiFetch<BulkUploadResult>("/admin/bulk-upload", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Bulk upload failed");
  return res.data;
}

// ── Exams ─────────────────────────────────────────────────────────────────

export interface ApiExam {
  exam_id: number;
  exam_name: string;
  exam_full_name: string | null;
  qualification_type: string;
  description: string | null;
  created_at: string | null;
}

export async function fetchExams(): Promise<ApiExam[]> {
  const res = await apiFetch<ApiExam[]>("/admin/exams");
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to fetch exams");
  return res.data;
}

export async function createExam(payload: {
  examName: string;
  examFullName?: string;
  qualificationType: string;
  description?: string;
}): Promise<ApiExam> {
  const res = await apiFetch<ApiExam>("/admin/exams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to create exam");
  return res.data;
}


export async function updateCollege(
  id: number,
  payload: {
    name?: string;
    type?: string;
    city?: string;
    state?: string;
    website?: string;
    isPartner?: boolean;
  }
): Promise<ApiCollege> {
  const res = await apiFetch<ApiCollege>(`/admin/colleges/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to update college");
  return res.data;
}

export async function deleteCollege(id: number): Promise<void> {
  const res = await apiFetch<null>(`/admin/colleges/${id}`, {
    method: "DELETE",
  });
  if (!res.success) throw new Error(res.message ?? "Failed to delete college");
}
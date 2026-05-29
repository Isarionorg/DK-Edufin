"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentProfileModal from "@/components/auth/StudentProfileModal";
import axios from "@/lib/axios";

// ─────────────────────────────────────────────
// TYPES — matching service response exactly
// ─────────────────────────────────────────────

export interface Course {
  course_id: number;
  course_name: string;
  degree_type: string | null;
  specialization: string | null;
  cutoff_value: number | null;
  cutoff_rank: number | null;
  exam_name: string;
  is_preferred: boolean;
}

export interface College {
  college_id: number;
  college_name: string;
  college_type: string;
  city: string;
  state: string;
  website_url: string | null;
  is_partner: boolean;
  courses: Course[];
  match_score: number;
}

export interface CollegesApiResponse {
  success: boolean;
  personalized: boolean;
  data: College[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// COLLEGE CARD
// ─────────────────────────────────────────────

function CollegeCard({
  college,
  onClick,
}: {
  college: College;
  onClick: () => void;
}) {
  const preferredCourses = college.courses.filter(c => c.is_preferred);
  const otherCourses = college.courses.filter(c => !c.is_preferred);
  const displayCourses = [...preferredCourses, ...otherCourses];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* HEADER */}
      <div className="bg-blue-500 p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
          🏫
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base leading-tight truncate">
            {college.college_name}
          </h3>
          <p className="text-white/80 text-xs mt-0.5">{college.college_type}</p>
        </div>
        {college.is_partner && (
          <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-1 rounded-lg shrink-0">
            Partner
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        {/* LOCATION */}
        <span className="text-gray-500 text-xs flex items-center gap-1">
          📍 {college.city}, {college.state}
        </span>

        {/* MATCH SCORE — only for personalized results */}
        {college.match_score > 0 && (
          <div className="p-2 bg-green-50 rounded-lg">
            <span className="text-xs font-semibold text-green-700">
              ✅ Match Score: {college.match_score}%
            </span>
          </div>
        )}

        {/* COURSES */}
        <div className="flex flex-wrap gap-1.5">
          {displayCourses.slice(0, 3).map((course) => (
            <span
              key={course.course_id}
              className={`text-xs px-2 py-1 rounded-lg ${
                course.is_preferred
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {course.course_name}
              {course.specialization ? ` (${course.specialization})` : ""}
            </span>
          ))}
          {college.courses.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg">
              +{college.courses.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <button className="w-full py-2.5 border-2 border-blue-200 text-blue-500 text-sm font-semibold rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200">
          View Details →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COLLEGE MODAL
// ─────────────────────────────────────────────

function CollegeModal({
  college,
  onClose,
}: {
  college: College;
  onClose: () => void;
}) {
  const preferredCourses = college.courses.filter(c => c.is_preferred);
  const otherCourses = college.courses.filter(c => !c.is_preferred);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-7 flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
            🏫
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl leading-tight">
              {college.college_name}
            </h2>
            <p className="text-white/80 text-sm">{college.college_type}</p>
          </div>
        </div>

        <div className="p-7 space-y-5">
          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Location",
                value: `${college.city}, ${college.state}`,
              },
              {
                label: "Type",
                value: college.college_type,
              },
              ...(college.match_score > 0
                ? [{ label: "Match Score", value: `${college.match_score}%` }]
                : []),
              ...(college.website_url
                ? [{ label: "Website", value: college.website_url }]
                : []),
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* PREFERRED COURSES */}
          {preferredCourses.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                Your Preferred Courses
              </p>
              <div className="flex flex-wrap gap-2">
                {preferredCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="bg-blue-50 border border-blue-100 rounded-xl p-3"
                  >
                    <p className="text-sm font-semibold text-blue-700">
                      {course.course_name}
                      {course.specialization
                        ? ` — ${course.specialization}`
                        : ""}
                    </p>
                    <p className="text-xs text-blue-400 mt-0.5">
                      {course.exam_name} •{" "}
                      {course.cutoff_value
                        ? `Cutoff: ${course.cutoff_value}`
                        : course.cutoff_rank
                        ? `Rank: ${course.cutoff_rank}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER COURSES */}
          {otherCourses.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                Other Available Courses
              </p>
              <div className="flex flex-wrap gap-2">
                {otherCourses.map((course) => (
                  <span
                    key={course.course_id}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl"
                  >
                    {course.course_name}
                    {course.specialization ? ` (${course.specialization})` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Close
            </button>
            {college.website_url && (
              <a
                href={college.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all text-sm text-center"
              >
                Visit Website →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-24 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ERROR / EMPTY STATES
// ─────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">Failed to load colleges</h3>
      <p className="text-gray-400 mb-6 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">No colleges found</h3>
      <p className="text-gray-400 text-sm">
        No colleges match your exam scores and preferences yet. Try updating your profile.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE CONTENT
// ─────────────────────────────────────────────

function CollegesPageContent() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchColleges = async (searchVal = "", pageVal = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (searchVal) params.append("search", searchVal);
      params.append("page", String(pageVal));
      params.append("pageSize", "9");

      const res = await axios.get(`/colleges?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const result: CollegesApiResponse = res.data;

      setColleges(result.data);
      setIsPersonalized(result.personalized);
      setTotalPages(result.totalPages);

      // Profile not complete → show modal
      if (!result.personalized) {
        const profileRes = await axios.get("/student/profile/status", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const isComplete = profileRes.data?.data?.isProfileComplete;
        if (!isComplete) setShowProfileModal(true);
      }
    } catch (err: any) {
      console.error("Error fetching colleges:", err);
      setError(err.response?.data?.message || "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    fetchColleges(val, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchColleges(search, newPage);
  };

  const handleProfileSuccess = () => {
    setShowProfileModal(false);
    fetchColleges();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={handleProfileSuccess}
      />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            {isPersonalized ? "🎓 Personalized Recommendations" : "🏫 All Colleges"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            {isPersonalized ? "Your Perfect Colleges" : "Explore Colleges"}
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
            {isPersonalized
              ? "Based on your exam scores and preferences, we've curated the best colleges for you."
              : "Complete your profile to get personalized recommendations."}
          </p>

          {/* SEARCH */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search colleges..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchColleges(search, page)} />
        ) : colleges.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college) => (
                <CollegeCard
                  key={college.college_id}
                  college={college}
                  onClick={() => setSelectedCollege(college)}
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* MODAL */}
      {selectedCollege && (
        <CollegeModal
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </main>
  );
}

export default function CollegesPage() {
  return (
    <ProtectedRoute>
      <CollegesPageContent />
    </ProtectedRoute>
  );
}
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentProfileModal from "@/components/auth/StudentProfileModal";
import { useAuth } from "@/hooks/useAuth";
import axios from "@/lib/axios";

export interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  rating: number;
  type: "Government" | "Private" | "Deemed";
  stream: "Science" | "Commerce" | "Arts";
  courses: string[];
  entranceExam: string;
  emoji?: string;
  color?: string;
  matchScore?: number;
}

function CollegeCard({
  college,
  onClick,
}: {
  college: College;
  onClick: () => void;
}) {
  const emoji = college.emoji || "🏫";
  const color = college.color || "bg-blue-500";

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className={`${color} p-5 flex items-center gap-4`}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
          {emoji}
        </div>
        <div>
          <h3 className="text-white font-bold text-base leading-tight">
            {college.name}
          </h3>
          <p className="text-white/80 text-xs mt-0.5">{college.type}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            📍 {college.location}, {college.state}
          </span>
          <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-100">
            ⭐ {college.rating}
          </span>
        </div>

        {college.matchScore && (
          <div className="mb-3 p-2 bg-green-50 rounded-lg">
            <span className="text-xs font-semibold text-green-700">
              Match Score: {(college.matchScore * 100).toFixed(0)}%
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">Entrance:</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
            {college.entranceExam}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {college.courses.slice(0, 3).map((course) => (
            <span
              key={course}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
            >
              {course}
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

function CollegeModal({
  college,
  onClose,
}: {
  college: College;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-r from-blue-500 to-blue-600 p-7 flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
            {college.emoji || "🏫"}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{college.name}</h2>
            <p className="text-white/80 text-sm">{college.type}</p>
          </div>
        </div>

        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Location",
                value: `${college.location}, ${college.state}`,
                className: "text-gray-800",
              },
              {
                label: "Rating",
                value: `⭐ ${college.rating} / 5`,
                className: "text-yellow-500 font-bold",
              },
              {
                label: "College Type",
                value: college.type,
                className: "text-gray-800",
              },
              {
                label: "Entrance Exam",
                value: college.entranceExam,
                className: "text-blue-600",
              },
            ].map(({ label, value, className }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`font-semibold text-sm ${className}`}>{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Courses Offered</p>
            <div className="flex flex-wrap gap-2">
              {college.courses.map((course) => (
                <span
                  key={course}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-medium border border-blue-100"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Close
            </button>
            <button className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all text-sm">
              Get Guidance →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        Failed to load colleges
      </h3>
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
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        No colleges found
      </h3>
      <p className="text-gray-400">Try adjusting your search or filters</p>
    </div>
  );
}

function CollegesPageContent() {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const checkProfileAndFetchColleges = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Fixed: was /api/student/profile/status
        const statusRes = await axios.get("/student/profile/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const isComplete = statusRes.data?.data?.isProfileComplete;
        setProfileComplete(isComplete);

        if (!isComplete) {
          setShowProfileModal(true);
          setLoading(false);
          return;
        }

        // ✅ Fixed: was /api/colleges/recommendations
        const collegesRes = await axios.get("/colleges", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setColleges(collegesRes.data?.data || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching colleges:", err);
        setError(err.response?.data?.message || "Failed to load colleges");
      } finally {
        setLoading(false);
      }
    };

    checkProfileAndFetchColleges();
  }, []);

  const handleProfileSuccess = () => {
    setProfileComplete(true);
    setShowProfileModal(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
        <section className="bg-linear-to-r from-blue-600 to-blue-500 py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Find Your Perfect College
            </h1>
          </div>
        </section>
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={handleProfileSuccess}
      />

      {/* HERO */}
      <section className="bg-linear-to-r from-blue-600 to-blue-500 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            🎓 Personalized Recommendations
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Your Perfect Colleges
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Based on your exam scores and preferences, we've curated the best
            colleges for you.
          </p>
        </div>
      </section>

      {/* COLLEGES GRID */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : colleges.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                onClick={() => setSelectedCollege(college)}
              />
            ))}
          </div>
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
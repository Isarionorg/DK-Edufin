"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import axios from "@/lib/axios";

// ─────────────────────────────────────────────
// CONSTANTS & TYPES
// ─────────────────────────────────────────────

export const CATEGORIES = ["GENERAL", "OBC", "SC", "ST", "EWS"];
export const STREAMS = ["Science", "Commerce", "Arts"];
export const EXAMS = ["JEE_MAIN", "JEE_ADVANCED", "NEET", "CLAT", "MHT_CET", "BITSAT"];

export const COURSE_OPTIONS: Record<string, string[]> = {
  Science: [
    "B.Tech Computer Science",
    "B.Tech Electronics",
    "B.Tech Mechanical",
    "MBBS",
    "BDS",
    "B.Pharm",
    "B.Sc Physics",
  ],
  Commerce: ["B.Com", "BBA", "CA Foundation", "B.Sc Economics"],
  Arts: ["BA", "B.A. Law", "B.Ed", "Journalism"],
};

export interface StudentFormData {
  category: string;
  stream: string;
  examScores: Array<{
    examType: string;
    marks?: number;
    rank?: number;
  }>;
  preferredCourses: string[];
}

export interface StudentFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function StudentForm({
  onSuccess,
  onCancel,
  isModal = false,
}: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<StudentFormData>({
    category: "",
    stream: "",
    examScores: [],
    preferredCourses: [],
  });

  const handleStreamChange = (stream: string) => {
    setForm({
      ...form,
      stream,
      preferredCourses: [],
    });
  };

  const toggleExam = (exam: string) => {
    const exists = form.examScores.find((e) => e.examType === exam);
    if (exists) {
      setForm({
        ...form,
        examScores: form.examScores.filter((e) => e.examType !== exam),
      });
    } else {
      setForm({
        ...form,
        examScores: [...form.examScores, { examType: exam }],
      });
    }
  };

  const updateExamScore = (
    exam: string,
    field: "marks" | "rank",
    value: string
  ) => {
    setForm({
      ...form,
      examScores: form.examScores.map((e) =>
        e.examType === exam
          ? { ...e, [field]: value ? parseInt(value) : undefined }
          : e
      ),
    });
  };

  const toggleCourse = (course: string) => {
    setForm({
      ...form,
      preferredCourses: form.preferredCourses.includes(course)
        ? form.preferredCourses.filter((c) => c !== course)
        : [...form.preferredCourses, course],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.category || !form.stream || form.examScores.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (form.preferredCourses.length === 0) {
      setError("Please select at least one course preference");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/student/profile/complete",
        {
          category: form.category,
          stream: form.stream,
          examScores: form.examScores,
          preferredCourses: form.preferredCourses,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCourses =
    form.stream && COURSE_OPTIONS[form.stream]
      ? COURSE_OPTIONS[form.stream]
      : [];

  // Form Content (reusable for both page and modal)
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Category *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm({ ...form, category: cat })}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                form.category === cat
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Stream Preference *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {STREAMS.map((stream) => (
            <button
              key={stream}
              type="button"
              onClick={() => handleStreamChange(stream)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                form.stream === stream
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {stream}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Scores */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Exam Scores *
        </label>
        <div className="space-y-3">
          {EXAMS.map((exam) => {
            const selected = form.examScores.find((e) => e.examType === exam);
            return (
              <div key={exam}>
                <button
                  type="button"
                  onClick={() => toggleExam(exam)}
                  className={`w-full p-3 rounded-lg border-2 font-medium text-left transition-all ${
                    selected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {exam.replace(/_/g, " ")}
                </button>
                {selected && (
                  <div className="mt-3 ml-4 space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Score/Marks
                      </label>
                      <input
                        type="number"
                        placeholder="Enter your score"
                        value={selected.marks || ""}
                        onChange={(e) =>
                          updateExamScore(exam, "marks", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Rank (optional)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter your rank"
                        value={selected.rank || ""}
                        onChange={(e) =>
                          updateExamScore(exam, "rank", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Preferences */}
      {form.stream && (
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Preferred Courses *
          </label>
          <div className="space-y-3">
            {availableCourses.map((course) => (
              <label
                key={course}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.preferredCourses.includes(course)}
                  onChange={() => toggleCourse(course)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">{course}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex gap-3 pt-6 border-t border-gray-200 ${isModal ? "" : ""}`}>
        {onCancel && (
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isModal ? "Cancel" : "Back"}
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={isSubmitting}
          className={onCancel ? "flex-1" : "w-full"}
        >
          {isSubmitting ? "Saving..." : "Complete Profile"}
        </Button>
      </div>
    </form>
  );

  // Return form content or wrapped content based on context
  return formContent;
}

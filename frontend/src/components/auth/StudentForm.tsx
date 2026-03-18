"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import axios from "@/lib/axios";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const STREAMS = ["Science", "Commerce", "Arts"];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface StudentFormData {
  category: number | string;
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

  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [form, setForm] = useState<StudentFormData>({
    category: "",
    stream: "",
    examScores: [],
    preferredCourses: [],
  });

  // ─────────────────────────────────────────────
  // FETCH INITIAL DATA
  // ─────────────────────────────────────────────

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, examRes] = await Promise.all([
          axios.get("/student/categories"),
          axios.get("/student/exams"),
        ]);

        setCategories(catRes.data.data);
        setExams(examRes.data.data);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };

    fetchInitialData();
  }, []);

  // Debug
  useEffect(() => {
    console.log("EXAMS:", exams);
  }, [exams]);

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────

  const handleStreamChange = async (stream: string) => {
    setForm({
      ...form,
      stream,
      preferredCourses: [],
    });

    try {
      const res = await axios.get(`/student/courses?stream=${stream}`);
      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
    }
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

    const getExamInputType = (examName: string) => {
    if (examName === "CUET") return "score";
    if (examName === "JEE_MAIN" || examName === "JEE_ADVANCED") return "rank";
    return "both";
  };

  // ─────────────────────────────────────────────
  // SUBMIT (TEMP - WILL FIX IN STEP 3)
  // ─────────────────────────────────────────────

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
    // 🔹 CATEGORY → ID
    const selectedCategoryId = form.category;

    // 🔹 EXAMS → IDs
    const examPayload = form.examScores.map((e) => {
      const matchedExam = exams.find(
        (ex) => ex.exam_name === e.examType
      );

      return {
        exam_id: matchedExam?.exam_id,
        score_value: e.marks,
        rank_value: e.rank,
        year: new Date().getFullYear(),
      };
    });

    // 🔹 COURSES → IDs
    const coursePayload = form.preferredCourses.map((course, index) => {
      const matchedCourse = courses.find(
        (c) => c.course_name === course
      );

      return {
        course_id: matchedCourse?.course_id,
        priority: index + 1,
      };
    });

    const payload = {
      profile: {
        category_id: selectedCategoryId,
        preferred_stream: form.stream,
      },
      exam_scores: examPayload,
      course_preferences: coursePayload,
    };

    await axios.post("/student/profile/complete", payload);

    onSuccess();
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to save profile");
  } finally {
    setIsSubmitting(false);
  }
};

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* CATEGORY */}
      <div>
        <label className="block text-lg font-semibold mb-4">
          Category *
        </label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              type="button"
              onClick={() =>
                setForm({ ...form, category: cat.category_id })
              }
              className={`p-3 rounded-lg border-2 ${
                form.category === cat.category_id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              {cat.category_code === "UR" ? "GENERAL" : cat.category_code}
            </button>
          ))}
        </div>
      </div>

      {/* STREAM */}
      <div>
        <label className="block text-lg font-semibold mb-4">
          Stream *
        </label>

        <div className="grid grid-cols-3 gap-3">
          {STREAMS.map((stream) => (
            <button
              key={stream}
              type="button"
              onClick={() => handleStreamChange(stream)}
              className={`p-3 rounded-lg border-2 ${
                form.stream === stream
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              {stream}
            </button>
          ))}
        </div>
      </div>

      {/* EXAMS */}
      <div>
        <label className="block text-lg font-semibold mb-4">
          Exams *
        </label>

        {exams.map((examObj) => {
          const exam = examObj.exam_name;
          const selected = form.examScores.find(
            (e) => e.examType === exam
          );

          return (
            <div key={examObj.exam_id}>
              <button
                type="button"
                onClick={() => toggleExam(exam)}
                className={`w-full p-3 rounded-lg border-2 text-left ${
                  selected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                {exam.replace("_", " ")}
              </button>

              {selected && (
                <div className="mt-3 ml-4 space-y-3">

                  {/* CUET → SCORE */}
                  {getExamInputType(exam) === "score" && (
                    <div>
                      <label className="text-sm text-gray-600">Score / Percentile</label>
                      <input
                        type="number"
                        placeholder="Enter your score"
                        value={selected.marks || ""}
                        onChange={(e) =>
                          updateExamScore(exam, "marks", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  )}

                  {/* JEE → RANK */}
                  {getExamInputType(exam) === "rank" && (
                    <div>
                      <label className="text-sm text-gray-600">Rank</label>
                      <input
                        type="number"
                        placeholder="Enter your rank"
                        value={selected.rank || ""}
                        onChange={(e) =>
                          updateExamScore(exam, "rank", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  )}

                  {/* FALLBACK */}
                  {getExamInputType(exam) === "both" && (
                    <>
                      <input
                        type="number"
                        placeholder="Score"
                        value={selected.marks || ""}
                        onChange={(e) =>
                          updateExamScore(exam, "marks", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Rank"
                        value={selected.rank || ""}
                        onChange={(e) =>
                          updateExamScore(exam, "rank", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* COURSES */}
      {form.stream && (
        <div>
          <label className="block text-lg font-semibold mb-4">
            Preferred Courses *
          </label>

          {courses.map((course) => (
            <label key={course.course_id} className="flex gap-2">
              <input
                type="checkbox"
                checked={form.preferredCourses.includes(
                  course.course_name
                )}
                onChange={() => toggleCourse(course.course_name)}
              />
              {course.course_name}
            </label>
          ))}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" onClick={onCancel}>
            Back
          </Button>
        )}
        <Button type="submit">
          {isSubmitting ? "Saving..." : "Complete Profile"}
        </Button>
      </div>
    </form>
  );
}
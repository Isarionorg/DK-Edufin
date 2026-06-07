"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import axios from "@/lib/axios";

export interface StudentFormData {
  category: number | "";
  stream_id: number | "";
  selectedExamId: number | "";
  examScores: Array<{
    examType: string;
    marks?: number;
    rank?: number;
  }>;
  preferredCourses: number[];
}

export interface StudentFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

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
  const [streams, setStreams] = useState<any[]>([]);

  const [form, setForm] = useState<StudentFormData>({
    category: "",
    stream_id: "",
    examScores: [],
    preferredCourses: [],
    selectedExamId: "",
  });

  // ── FETCH INITIAL DATA ──
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

  useEffect(() => {
    console.log("EXAMS:", exams);
  }, [exams]);

  // ── HANDLERS ──
  const handleExamSelection = async (examId: number) => {
    setForm((prev) => ({
      ...prev,
      selectedExamId: examId,
      stream_id: "",
      preferredCourses: [],
    }));
    try {
      const res = await axios.get(`/student/streams?examId=${examId}`);
      setStreams(res.data.data);
      setCourses([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStreamChange = async (streamId: number) => {
    setForm((prev) => ({
      ...prev,
      stream_id: streamId,
      preferredCourses: [],
    }));
    try {
      const res = await axios.get(`/student/courses?stream_id=${streamId}`);
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

  const toggleCourse = (courseId: number) => {
    setForm((prev) => ({
      ...prev,
      preferredCourses: prev.preferredCourses.includes(courseId)
        ? prev.preferredCourses.filter((id) => id !== courseId)
        : [...prev.preferredCourses, courseId],
    }));
  };

  // ── SELECT ALL COURSES ──
  const allCourseIds = courses.map((c) => c.course_id);
  const allSelected =
    allCourseIds.length > 0 &&
    allCourseIds.every((id) => form.preferredCourses.includes(id));

  const toggleSelectAll = () => {
    setForm((prev) => ({
      ...prev,
      preferredCourses: allSelected ? [] : allCourseIds,
    }));
  };

  const getExamInputType = (examName: string) => {
    if (examName === "CUET") return "score";
    if (examName === "JEE_MAIN" || examName === "JEE_ADVANCED") return "rank";
    return "both";
  };

  // ── SUBMIT ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.stream_id || form.examScores.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (form.preferredCourses.length === 0) {
      setError("Please select at least one course preference");
      return;
    }

    setIsSubmitting(true);

    try {
      const examPayload = form.examScores.map((e) => {
        const matchedExam = exams.find((ex) => ex.exam_name === e.examType);
        return {
          exam_id: matchedExam?.exam_id,
          score_value: e.marks,
          rank_value: e.rank,
          year: new Date().getFullYear(),
        };
      });

      const coursePayload = form.preferredCourses.map((courseId, index) => ({
        course_id: courseId,
        priority: index + 1,
      }));

      const payload = {
        profile: {
          category_id: form.category || null,
          stream_id: form.stream_id,
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

  // ── UI ──
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 1 — EXAMS */}
      <div>
        <label className="block text-lg font-semibold mb-4">
          Exams *
        </label>
        {exams.map((examObj) => {
          const exam = examObj.exam_name;
          const selected = form.examScores.find((e) => e.examType === exam);

          return (
            <div key={examObj.exam_id} className="mb-3">
              <button
                type="button"
                onClick={() => {
                  toggleExam(exam);
                  handleExamSelection(examObj.exam_id);
                }}
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
                  {getExamInputType(exam) === "score" && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Score / Percentile
                      </label>
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

      {/* 2 — STREAM */}
      <div>
        <label className="block text-lg font-semibold mb-4">
          Stream *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {streams.map((stream) => (
            <button
              key={stream.stream_id}
              type="button"
              onClick={() => handleStreamChange(stream.stream_id)}
              className={`p-3 rounded-lg border-2 ${
                form.stream_id === stream.stream_id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              {stream.stream_code}
            </button>
          ))}
        </div>
      </div>

      {/* 3 — COURSES with Select All */}
      {form.stream_id && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold">
              Preferred Courses *
            </label>
            {courses.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className={`text-sm font-semibold px-4 py-1.5 rounded-lg border-2 transition-all duration-200 ${
                  allSelected
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-500 hover:border-blue-400"
                }`}
              >
                {allSelected ? "✓ All Selected" : "Select All"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {courses.map((course) => (
              <label
                key={course.course_id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  form.preferredCourses.includes(course.course_id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.preferredCourses.includes(course.course_id)}
                  onChange={() => toggleCourse(course.course_id)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-gray-700 text-sm font-medium">
                  {course.course_name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 4 — CATEGORY */}
      <div>
        <label className="block text-lg font-semibold mb-4">
          Category
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
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import axios from "@/lib/axios";

// ── OTP Modal ──────────────────────────────────────────────────────────────

function OtpModal({
  phone,
  onVerified,
  onClose,
}: {
  phone: string;
  onVerified: () => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Auto-send OTP when modal opens
  useEffect(() => {
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      await axios.post("/phone/send-otp", { phone });
      setCooldown(60);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/phone/verify-otp", { phone, code });
      onVerified();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          Verify your number
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-800">{phone}</span>
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {error && (
          <p className="text-sm text-red-500 mb-3 text-center">{error}</p>
        )}

        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="w-full mb-3"
        >
          {loading ? "Verifying…" : "Verify OTP"}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || cooldown > 0}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-40"
          >
            {sending
              ? "Sending…"
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface StudentFormData {
  category: number | "";
  stream_id: number | "";
  selectedExamId: number | "";
  phone: string;
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
  // New props for first-time-only OTP gating
  isPhoneVerified?: boolean;
  existingPhone?: string;
}

// ── Main Form ──────────────────────────────────────────────────────────────

export default function StudentForm({
  onSuccess,
  onCancel,
  isModal = false,
  isPhoneVerified = false,
  existingPhone = "",
}: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);

  const [courseSearch, setCourseSearch] = useState("");

  const [form, setForm] = useState<StudentFormData>({
    category: "",
    stream_id: "",
    examScores: [],
    preferredCourses: [],
    selectedExamId: "",
    // Pre-fill phone if already verified
    phone: existingPhone,
  });

  // OTP state — initialize as already verified if prop says so
  const [phoneVerified, setPhoneVerified] = useState(true);//bypassing the otp check for now, can be enabled later by changing this to isPhoneVerified
  const [showOtpModal, setShowOtpModal] = useState(false);

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
      const res = await axios.get(
        `/student/courses?stream_id=${streamId}&exam_id=${form.selectedExamId}`
      );
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

  const filteredCourses = courses.filter((course) =>
    course.course_name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const allCourseIds = filteredCourses.map((c) => c.course_id);
  const allSelected =
    allCourseIds.length > 0 &&
    allCourseIds.every((id) => form.preferredCourses.includes(id));

  const toggleSelectAll = () => {
    setForm((prev) => ({
      ...prev,
      preferredCourses: allSelected ? [] : allCourseIds,
    }));
  };

  const getExamInputType = (examName: string): "score" | "rank" | "percentile" => {
  const examObj = exams.find((e) => e.exam_name === examName);
  return examObj?.qualification_type ?? "score";
};

  // ── PHONE VALIDATION ──
  const validatePhone = (phone: string) =>
    /^(\+91)?[6-9]\d{9}$/.test(phone.trim());

  const handleRequestOtp = () => {
    if (!validatePhone(form.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setError("");
    setShowOtpModal(true);
  };

  // ── SUBMIT ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Phone verification gate
    if (!phoneVerified) {
      setError("Please verify your phone number before submitting");
      return;
    }

    if (!form.stream_id || form.examScores.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (form.preferredCourses.length === 0) {
      setError("Please select at least one course preference");
      return;
    }

    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!form.phone || !phoneRegex.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number");
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
          phone: form.phone.trim(),
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
    <>
      {showOtpModal && (
        <OtpModal
          phone={
            form.phone.trim().startsWith("+91")
              ? form.phone.trim()
              : `+91${form.phone.trim()}`
          }
          onVerified={() => {
            setPhoneVerified(true);
            setShowOtpModal(false);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* PHONE NUMBER */}
        {/* PHONE NUMBER - only show if not yet verified */}
{!existingPhone && (
  <div>
    <label className="block text-lg font-semibold mb-2">
      Phone Number <span className="text-red-500">*</span>
    </label>
    <p className="text-sm text-gray-500 mb-3">
      We'll use this to contact you for admission consultation.
    </p>
    <div className="flex gap-2">
      <input
        type="tel"
        placeholder="Enter your 10-digit mobile number"
        value={form.phone}
        maxLength={13}
        onChange={(e) =>
          setForm({
            ...form,
            phone: e.target.value.replace(/[^\d+]/g, ""),
          })
        }
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
      {/* <button
        type="button"
        onClick={handleRequestOtp}
        className="px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        Send OTP
      </button> */}
    </div>
    <p className="text-xs text-gray-400 mt-1.5">
      You'll receive a one-time code to verify this number. This is required only once.
    </p>
  </div>
)}

{/* Show verified badge if already done */}
{phoneVerified && form.phone && form.phone.replace(/\D/g, "").length >= 10 && (
  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
    <span className="text-green-600 font-semibold">✓ Phone Verified</span>
    <span className="text-gray-500 text-sm">{form.phone}</span>
  </div>
)}

        {/* 1 — EXAMS */}
        <div>
          <label className="block text-lg font-semibold mb-4">Exams *</label>
          {exams.map((examObj) => {
            const exam = examObj.exam_name;
            const selected = form.examScores.find((e) => e.examType === exam);

            return (
              <div key={examObj.exam_id} className="mb-3">
                <button
                  type="button"
                  onClick={() => {
  const isAlreadySelected = !!form.examScores.find((e) => e.examType === exam);
  if (isAlreadySelected) {
    // deselect it
    setForm((prev) => ({
      ...prev,
      examScores: prev.examScores.filter((e) => e.examType !== exam),
      selectedExamId: "",
      stream_id: "",
      preferredCourses: [],
    }));
    setStreams([]);
    setCourses([]);
  } else {
    // select this one, clear everything else
    setForm((prev) => ({
      ...prev,
      examScores: [{ examType: exam }],
      selectedExamId: examObj.exam_id,
      stream_id: "",
      preferredCourses: [],
    }));
    handleExamSelection(examObj.exam_id);
  }
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
        <label className="text-sm text-gray-600">Score</label>
        <input
          type="number"
          placeholder="Enter your score"
          value={selected.marks || ""}
          onChange={(e) => updateExamScore(exam, "marks", e.target.value)}
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
          onChange={(e) => updateExamScore(exam, "rank", e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    )}
    {getExamInputType(exam) === "percentile" && (
      <div>
        <label className="text-sm text-gray-600">Percentile</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="Enter your percentile (e.g. 98.5)"
          value={selected.marks || ""}
          onChange={(e) => updateExamScore(exam, "marks", e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    )}
  </div>
)}
              </div>
            );
          })}
        </div>

        {/* 2 — STREAM */}
        <div>
          <label className="block text-lg font-semibold mb-4">Stream *</label>
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

        {/* 3 — COURSES */}
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
            <input
              type="text"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="space-y-2">
              {filteredCourses.map((course) => (
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
          <label className="block text-lg font-semibold mb-4">Category</label>
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
        <div className="flex gap-3 flex-col">
          {!phoneVerified && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              ⚠️ Please verify your phone number above before submitting.
            </p>
          )}
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" onClick={onCancel}>
                Back
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !phoneVerified}>
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
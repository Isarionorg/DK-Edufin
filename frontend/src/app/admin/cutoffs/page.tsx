"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Category, Exam } from "@/types/admin";
import { Plus, CheckCircle2, Info, Loader2, AlertCircle } from "lucide-react";
import {
  fetchCollegeCourses,
  fetchCutoffs,
  createCutoff as apiCreateCutoff,
  ApiCollegeCourse,
  ApiCutoff,
} from "@/lib/adminapi";

const EXAMS: Exam[] = ["CUET", "JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "KCET", "WBJEE", "Other"];
const CATEGORIES: Category[] = ["UR/GENERAL", "OBC", "SC", "ST", "EWS", "PwBD"];

const SCORE_EXAMS: Exam[] = ["CUET"];
const RANK_EXAMS: Exam[] = ["JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "KCET", "WBJEE"];

const emptyForm = {
  collegeCourseId: "",
  exam: "" as Exam | "",
  category: "" as Category | "",
  cutoffScore: "",
  cutoffRank: "",
  academicYear: new Date().getFullYear().toString(),
  roundNumber: "1",
};

export default function CutoffsPage() {
  const [pairs, setPairs] = useState<ApiCollegeCourse[]>([]);
  const [cutoffs, setCutoffs] = useState<ApiCutoff[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([fetchCollegeCourses(), fetchCutoffs()])
      .then(([p, c]) => {
        setPairs(p);
        setCutoffs(c);
      })
      .catch((e) => setApiError(e.message))
      .finally(() => setLoadingData(false));
  }, []);

  const isScoreExam = form.exam ? SCORE_EXAMS.includes(form.exam as Exam) : false;
  const isRankExam = form.exam ? RANK_EXAMS.includes(form.exam as Exam) : false;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.collegeCourseId) e.pair = "Please select a college-course pair";
    if (!form.exam) e.exam = "Please select an exam";
    if (!form.category) e.category = "Please select a category";
    if (!form.academicYear || isNaN(Number(form.academicYear))) e.year = "Valid academic year required";
    if (!form.roundNumber || isNaN(Number(form.roundNumber))) e.round = "Valid round number required";
    if (isScoreExam && !form.cutoffScore) e.score = "Cutoff score is required for this exam";
    if (isRankExam && !form.cutoffRank) e.rank = "Cutoff rank is required for this exam";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const newCutoff = await apiCreateCutoff({
        collegeCourseId: Number(form.collegeCourseId),
        examName: form.exam as string,
        categoryCode: form.category as string,
        cutoffScore: form.cutoffScore ? Number(form.cutoffScore) : undefined,
        cutoffRank: form.cutoffRank ? Number(form.cutoffRank) : undefined,
        academicYear: Number(form.academicYear),
        roundNumber: Number(form.roundNumber),
      });
      setCutoffs((prev) => [newCutoff, ...prev]);
      setForm(emptyForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader
        title="Cutoff Data"
        subtitle="Enter exam-wise cutoff scores and ranks for college-course pairs"
      />

      <div className="flex-1 p-8 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Plus size={18} className="text-[#2563EB]" />
            Add Cutoff Entry
          </h2>

          {submitted && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> Cutoff entry added!
            </div>
          )}

          {apiError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* College-Course Pair */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  College–Course Pair <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.collegeCourseId}
                  onChange={(e) => setForm({ ...form, collegeCourseId: e.target.value })}
                  disabled={loadingData}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-60 ${
                    errors.pair ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select a linked college-course pair --</option>
                  {pairs.map((p) => (
                    <option key={p.college_course_id} value={p.college_course_id}>
                      {p.colleges?.college_name ?? "?"} → {p.courses?.course_name ?? "?"}
                    </option>
                  ))}
                </select>
                {errors.pair && <p className="text-xs text-red-500 mt-1">{errors.pair}</p>}
                {!loadingData && pairs.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No college-course links found. Please create links first.
                  </p>
                )}
              </div>

              {/* Exam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Exam <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.exam}
                  onChange={(e) =>
                    setForm({ ...form, exam: e.target.value as Exam, cutoffScore: "", cutoffRank: "" })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.exam ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select exam --</option>
                  {EXAMS.map((ex) => (
                    <option key={ex} value={ex}>{ex.replace(/_/g, " ")}</option>
                  ))}
                </select>
                {errors.exam && <p className="text-xs text-red-500 mt-1">{errors.exam}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.category ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select category --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>

              {/* Cutoff Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cutoff Score <span className="ml-1 text-xs text-gray-400 font-normal">(for CUET)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 650"
                  value={form.cutoffScore}
                  onChange={(e) => setForm({ ...form, cutoffScore: e.target.value })}
                  disabled={!!form.exam && !isScoreExam}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    errors.score ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.score && <p className="text-xs text-red-500 mt-1">{errors.score}</p>}
              </div>

              {/* Cutoff Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cutoff Rank <span className="ml-1 text-xs text-gray-400 font-normal">(for JEE / state CETs)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12500"
                  value={form.cutoffRank}
                  onChange={(e) => setForm({ ...form, cutoffRank: e.target.value })}
                  disabled={!!form.exam && !isRankExam}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    errors.rank ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.rank && <p className="text-xs text-red-500 mt-1">{errors.rank}</p>}
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2025"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.year ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
              </div>

              {/* Round Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Round Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={form.roundNumber}
                  onChange={(e) => setForm({ ...form, roundNumber: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.round ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.round && <p className="text-xs text-red-500 mt-1">{errors.round}</p>}
              </div>
            </div>

            {form.exam && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                <Info size={13} className="flex-shrink-0" />
                {isScoreExam
                  ? "CUET uses a score-based cutoff. Rank field is disabled."
                  : "This exam uses a rank-based cutoff. Score field is disabled."}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingData}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Add Cutoff Entry
            </button>
          </form>
        </div>

        {/* Existing Cutoffs Table */}
        {loadingData ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading cutoff data…
          </div>
        ) : cutoffs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Cutoff Entries ({cutoffs.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["College", "Course", "Exam", "Category", "Score", "Rank", "Year", "Round"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide first:pl-6 last:pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cutoffs.map((c) => (
                    <tr key={c.cutoff_id} className="hover:bg-gray-50 transition-colors">
                      <td className="pl-6 px-4 py-3.5 font-medium text-gray-800 max-w-[140px] truncate">
                        {c.college_courses?.colleges?.college_name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-[140px] truncate">
                        {c.college_courses?.courses?.course_name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {c.exams?.exam_name?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {c.categories?.category_code ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{c.cutoff_score ?? "—"}</td>
                      <td className="px-4 py-3.5 text-gray-700">{c.cutoff_rank ?? "—"}</td>
                      <td className="px-4 py-3.5 text-gray-600">{c.academic_year}</td>
                      <td className="pr-6 px-4 py-3.5 text-gray-600">R{c.round_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
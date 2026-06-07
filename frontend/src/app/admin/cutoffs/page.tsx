"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { CutoffData, Exam, Category } from "@/types/admin";
import { Plus, Trash2, CheckCircle2, Info } from "lucide-react";

const EXAMS: Exam[] = ["CUET", "JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "KCET", "WBJEE", "Other"];
const CATEGORIES: Category[] = ["UR/GENERAL", "OBC", "SC", "ST", "EWS", "PwBD"];

// Mock linked pairs — replace with API data later
const MOCK_PAIRS = [
  { id: "p1", collegeName: "Delhi University", courseName: "B.Sc (Hons.) Mathematics" },
  { id: "p2", collegeName: "IIT Bombay", courseName: "B.Tech Computer Science" },
  { id: "p3", collegeName: "Christ University", courseName: "MBA" },
];

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
  const [cutoffs, setCutoffs] = useState<CutoffData[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isScoreExam = form.exam ? SCORE_EXAMS.includes(form.exam as Exam) : false;
  const isRankExam = form.exam ? RANK_EXAMS.includes(form.exam as Exam) : false;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.collegeCourseId) e.pair = "Please select a college-course pair";
    if (!form.exam) e.exam = "Please select an exam";
    if (!form.category) e.category = "Please select a category";
    if (!form.academicYear || isNaN(Number(form.academicYear)))
      e.year = "Valid academic year required";
    if (!form.roundNumber || isNaN(Number(form.roundNumber)))
      e.round = "Valid round number required";
    if (isScoreExam && !form.cutoffScore) e.score = "Cutoff score is required for this exam";
    if (isRankExam && !form.cutoffRank) e.rank = "Cutoff rank is required for this exam";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const pair = MOCK_PAIRS.find((p) => p.id === form.collegeCourseId)!;
    const newCutoff: CutoffData = {
      id: crypto.randomUUID(),
      collegeCourseId: form.collegeCourseId,
      collegeName: pair.collegeName,
      courseName: pair.courseName,
      exam: form.exam as Exam,
      category: form.category as Category,
      cutoffScore: form.cutoffScore ? Number(form.cutoffScore) : undefined,
      cutoffRank: form.cutoffRank ? Number(form.cutoffRank) : undefined,
      academicYear: Number(form.academicYear),
      roundNumber: Number(form.roundNumber),
    };
    setCutoffs((prev) => [newCutoff, ...prev]);
    setForm(emptyForm);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.pair ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select a linked college-course pair --</option>
                  {MOCK_PAIRS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.collegeName} → {p.courseName}
                    </option>
                  ))}
                </select>
                {errors.pair && <p className="text-xs text-red-500 mt-1">{errors.pair}</p>}
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
                    <option key={ex} value={ex}>{ex.replace("_", " ")}</option>
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

              {/* Cutoff Score (CUET) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cutoff Score
                  <span className="ml-1 text-xs text-gray-400 font-normal">(for CUET)</span>
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

              {/* Cutoff Rank (JEE etc.) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cutoff Rank
                  <span className="ml-1 text-xs text-gray-400 font-normal">(for JEE / state CETs)</span>
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

            {/* Hint */}
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
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Add Cutoff Entry
            </button>
          </form>
        </div>

        {/* Table */}
        {cutoffs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                Cutoff Entries ({cutoffs.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["College", "Course", "Exam", "Category", "Score", "Rank", "Year", "Round", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide first:pl-6 last:text-right last:pr-6"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cutoffs.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="pl-6 px-4 py-3.5 font-medium text-gray-800 max-w-[140px] truncate">{c.collegeName}</td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-[140px] truncate">{c.courseName}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {c.exam.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{c.cutoffScore ?? "—"}</td>
                      <td className="px-4 py-3.5 text-gray-700">{c.cutoffRank ?? "—"}</td>
                      <td className="px-4 py-3.5 text-gray-600">{c.academicYear}</td>
                      <td className="px-4 py-3.5 text-gray-600">R{c.roundNumber}</td>
                      <td className="pr-6 px-4 py-3.5 text-right">
                        <button
                          onClick={() => setCutoffs((prev) => prev.filter((x) => x.id !== c.id))}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
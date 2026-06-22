"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { fetchExams, createExam as apiCreateExam, ApiExam } from "@/lib/adminapi";

const QUALIFICATION_TYPES = ["score", "rank", "percentile", "grade", "marks",];

const emptyForm = {
  examName: "",
  examFullName: "",
  qualificationType: "",
  description: "",
};

export default function ExamsPage() {
  const [exams, setExams] = useState<ApiExam[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch((e) => setApiError(e.message))
      .finally(() => setLoadingData(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.examName.trim()) e.examName = "Exam name is required";
    if (!form.qualificationType) e.qualificationType = "Qualification type is required";
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
      const newExam = await apiCreateExam({
        examName: form.examName.trim().toUpperCase().replace(/\s+/g, "_"),
        examFullName: form.examFullName.trim() || undefined,
        qualificationType: form.qualificationType,
        description: form.description.trim() || undefined,
      });
      setExams((prev) => [...prev, newExam].sort((a, b) => a.exam_name.localeCompare(b.exam_name)));
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
        title="Exams"
        subtitle="Manage entrance exams used for cutoffs and eligibility"
      />

      <div className="flex-1 p-8 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Plus size={18} className="text-[#2563EB]" />
            Add Exam
          </h2>

          {submitted && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> Exam added!
            </div>
          )}

          {apiError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Exam Code <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs text-gray-400 font-normal">(e.g. CUET, JEE_MAIN)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CUET"
                  value={form.examName}
                  onChange={(e) => setForm({ ...form, examName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.examName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.examName && <p className="text-xs text-red-500 mt-1">{errors.examName}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Common University Entrance Test"
                  value={form.examFullName}
                  onChange={(e) => setForm({ ...form, examFullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              {/* Qualification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Qualification Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.qualificationType}
                  onChange={(e) => setForm({ ...form, qualificationType: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.qualificationType ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select type --</option>
                  {QUALIFICATION_TYPES.map((qt) => (
                    <option key={qt} value={qt}>{qt}</option>
                  ))}
                </select>
                {errors.qualificationType && <p className="text-xs text-red-500 mt-1">{errors.qualificationType}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Optional notes about this exam"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingData}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Add Exam
            </button>
          </form>
        </div>

        {/* Existing Exams Table */}
        {loadingData ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading exams…
          </div>
        ) : exams.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Exams ({exams.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {["Exam Code", "Full Name", "Qualification", "Description"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide first:pl-6 last:pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exams.map((ex) => (
                    <tr key={ex.exam_id} className="hover:bg-gray-50 transition-colors">
                      <td className="pl-6 px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {ex.exam_name.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{ex.exam_full_name ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {ex.qualification_type}
                        </span>
                      </td>
                      <td className="pr-6 px-4 py-3.5 text-gray-600 max-w-[300px] truncate">
                        {ex.description ?? "—"}
                      </td>
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
"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { CollegeType } from "@/types/admin";
import {
  Plus, Globe, CheckCircle2, XCircle, Loader2,
  AlertCircle, Pencil, Trash2,
} from "lucide-react";
import {
  fetchColleges,
  createCollege as apiCreateCollege,
  updateCollege as apiUpdateCollege,
  deleteCollege as apiDeleteCollege,
  ApiCollege,
} from "@/lib/adminapi";

const COLLEGE_TYPES: CollegeType[] = ["Government", "Private", "Deemed"];
const NAAC_GRADES = ["A++","A+", "A","B++","B+", "B", "C"];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const emptyForm = {
  name: "",
  type: "Government" as CollegeType,
  city: "",
  state: "",
  website: "",
  isPartner: false,
  naacGrade: "",
};

// Basic URL sanity check before sending to the API — catches typos like
// "college.edu.in" (missing protocol) or stray spaces before they hit the server.
const isValidWebsiteUrl = (url: string): boolean => {
  if (!url.trim()) return true; // optional field
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export default function CollegesPage() {
  const [colleges, setColleges]     = useState<ApiCollege[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [apiError, setApiError]     = useState<string | null>(null);
  const [submitted, setSubmitted]   = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId]   = useState<number | null>(null);

  useEffect(() => {
    fetchColleges()
      .then(setColleges)
      .catch((e: unknown) => {
        setLoadError(
          e instanceof Error
            ? e.message
            : "Failed to load colleges. Please refresh the page and try again."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "College name is required";
    if (!form.city.trim())  e.city  = "City is required";
    if (!form.state)        e.state = "State is required";
    if (form.website && !isValidWebsiteUrl(form.website)) {
      e.website = "Please enter a valid URL (e.g. https://college.edu.in)";
    }
    return e;
  };

  const startEdit = (college: ApiCollege) => {
    setEditingId(college.college_id);
    setForm({
      name:      college.college_name,
      type:      (college.college_type as CollegeType) || "Government",
      city:      college.city  || "",
      state:     college.state || "",
      website:   college.website_url || "",
      isPartner: !!college.is_partner,
      naacGrade: college.naac_grade || "",
    });
    setErrors({});
    setApiError(null);
    setConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        name:      form.name.trim(),
        type:      form.type,
        city:      form.city.trim(),
        state:     form.state,
        website:   form.website.trim() || undefined,
        isPartner: form.isPartner,
        naacGrade: form.naacGrade || undefined,
      };

      if (editingId) {
        const updated = await apiUpdateCollege(editingId, payload);
        setColleges((prev) => prev.map((c) => (c.college_id === editingId ? updated : c)));
        setEditingId(null);
      } else {
        const newCollege = await apiCreateCollege(payload);
        setColleges((prev) => [newCollege, ...prev]);
      }

      setForm(emptyForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error
          ? err.message
          : `Failed to ${editingId ? "update" : "add"} the college. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (collegeId: number) => {
    setDeletingId(collegeId);
    setApiError(null);
    try {
      await apiDeleteCollege(collegeId);
      setColleges((prev) => prev.filter((c) => c.college_id !== collegeId));
      setConfirmId(null);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Failed to delete the college. It may have linked courses or cutoff data."
      );
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Colleges" subtitle="Add and manage colleges in the system" />

      <div className="flex-1 p-8 space-y-8">

        {/* Initial load failure */}
        {loadError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
            <AlertCircle size={16} className="flex-shrink-0" /> {loadError}
          </div>
        )}

        {/* ── Form ── */}
        {!loadError && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Plus size={18} className="text-[#2563EB]" />
              {editingId ? "Edit College" : "Add New College"}
            </h2>

            {submitted && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
                <CheckCircle2 size={16} />
                {editingId ? "College updated successfully!" : "College added successfully!"}
              </div>
            )}

            {apiError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertCircle size={16} className="flex-shrink-0" /> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* College Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi University"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                      errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    College Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CollegeType })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  >
                    {COLLEGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* NAAC Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    NAAC Grade <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select
                    value={form.naacGrade}
                    onChange={(e) => setForm({ ...form, naacGrade: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">Not accredited / Unknown</option>
                    {NAAC_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                      errors.city ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                      errors.state ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Website URL <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://college.edu.in"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                        errors.website ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
                </div>

                {/* Is Partner */}
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm({ ...form, isPartner: !form.isPartner })}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        form.isPartner ? "bg-[#2563EB]" : "bg-gray-200"
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        form.isPartner ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Partner College
                      <span className="block text-xs text-gray-400 font-normal">College has a business tie-up</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editingId ? "Save Changes" : "Add College"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading colleges…
          </div>
        ) : colleges.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Colleges ({colleges.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City, State</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">NAAC</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Partner</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {colleges.map((c) => (
                    <tr
                      key={c.college_id}
                      className={`hover:bg-gray-50 transition-colors ${
                        editingId === c.college_id ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5 font-medium text-gray-800">
                        {c.college_name}
                        {c.website_url && (
                          <a
                            href={c.website_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="ml-2 text-[#2563EB] hover:underline text-xs"
                          >↗</a>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.college_type === "Government" ? "bg-green-50 text-green-700" :
                          c.college_type === "Private"    ? "bg-purple-50 text-purple-700"
                                                          : "bg-orange-50 text-orange-700"
                        }`}>
                          {c.college_type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{c.city}, {c.state}</td>
                      <td className="px-6 py-3.5">
                        {c.naac_grade ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.naac_grade === "A+" ? "bg-emerald-50 text-emerald-700" :
                            c.naac_grade === "A"  ? "bg-green-50 text-green-700"    :
                            c.naac_grade === "B+" ? "bg-blue-50 text-blue-700"      :
                            c.naac_grade === "B"  ? "bg-yellow-50 text-yellow-700"  :
                                                    "bg-gray-100 text-gray-500"
                          }`}>
                            {c.naac_grade}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {c.is_partner
                          ? <CheckCircle2 size={16} className="text-green-500" />
                          : <XCircle     size={16} className="text-gray-300"  />}
                      </td>
                      <td className="px-6 py-3.5">
                        {confirmId === c.college_id ? (
                          // Inline confirm row
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Delete?</span>
                            <button
                              onClick={() => handleDelete(c.college_id)}
                              disabled={deletingId === c.college_id}
                              className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                            >
                              {deletingId === c.college_id ? "Deleting…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              disabled={deletingId === c.college_id}
                              className="text-xs font-semibold text-gray-500 hover:underline disabled:opacity-50"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => startEdit(c)}
                              className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => setConfirmId(c.college_id)}
                              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
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
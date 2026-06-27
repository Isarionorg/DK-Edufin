"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, CheckCircle2, Link2, Loader2, AlertCircle } from "lucide-react";
import {
  fetchColleges,
  fetchCourses,
  fetchCollegeCourses,
  createCollegeCourse as apiCreateCollegeCourse,
  ApiCollege,
  ApiCourse,
  ApiCollegeCourse,
} from "@/lib/adminapi";

const emptyForm = { collegeId: "", courseId: "" };

export default function CollegeCoursesPage() {
  const [colleges, setColleges] = useState<ApiCollege[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [links, setLinks] = useState<ApiCollegeCourse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([fetchColleges(), fetchCourses(), fetchCollegeCourses()])
      .then(([c, co, l]) => {
        setColleges(c);
        setCourses(co);
        setLinks(l);
      })
      .catch((e: unknown) => {
        setLoadingError(
          e instanceof Error
            ? e.message
            : "Failed to load data. Please refresh the page and try again."
        );
      })
      .finally(() => setLoadingData(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.collegeId) e.college = "Please select a college";
    if (!form.courseId) e.course = "Please select a course";
    if (
      form.collegeId &&
      form.courseId &&
      links.some(
        (l) =>
          l.college_id === Number(form.collegeId) &&
          l.course_id === Number(form.courseId)
      )
    ) {
      e.duplicate = "This college-course pair is already linked";
    }
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
      const newLink = await apiCreateCollegeCourse({
        collegeId: Number(form.collegeId),
        courseId: Number(form.courseId),
      });
      setLinks((prev) => [newLink, ...prev]);
      setForm(emptyForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Failed to create the link. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCollege = colleges.find((c) => c.college_id === Number(form.collegeId));
  const selectedCourse = courses.find((c) => c.course_id === Number(form.courseId));

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader
        title="College–Course Links"
        subtitle="Map which courses are offered by which colleges"
      />

      <div className="flex-1 p-8 space-y-8">

        {/* Initial load failure — block the whole page gracefully */}
        {loadingError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
            <AlertCircle size={16} className="flex-shrink-0" /> {loadingError}
          </div>
        )}

        {!loadingError && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Plus size={18} className="text-[#2563EB]" />
              Link a College to a Course
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              This creates an entry in the junction table — each pair can then have cutoff data added.
            </p>

            {submitted && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
                <CheckCircle2 size={16} /> Link created successfully!
              </div>
            )}

            {(errors.duplicate || apiError) && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertCircle size={16} className="flex-shrink-0" /> {errors.duplicate || apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* College */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select College <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.collegeId}
                    onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                    disabled={loadingData}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-60 ${
                      errors.college ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <option value="">-- Select a college --</option>
                    {colleges.map((c) => (
                      <option key={c.college_id} value={c.college_id}>{c.college_name}</option>
                    ))}
                  </select>
                  {errors.college && <p className="text-xs text-red-500 mt-1">{errors.college}</p>}
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    disabled={loadingData}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-60 ${
                      errors.course ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <option value="">-- Select a course --</option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_name} ({c.degree_type})
                      </option>
                    ))}
                  </select>
                  {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
                </div>
              </div>

              {/* Preview */}
              {selectedCollege && selectedCourse && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm">
                  <Link2 size={15} className="text-[#2563EB] flex-shrink-0" />
                  <span className="text-[#1D4ED8] font-medium">{selectedCollege.college_name}</span>
                  <span className="text-[#93C5FD]">↔</span>
                  <span className="text-[#1D4ED8] font-medium">{selectedCourse.course_name}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loadingData}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                Create Link
              </button>
            </form>
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading data…
          </div>
        ) : links.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Linked Pairs ({links.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">College</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Degree</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {links.map((l, i) => (
                    <tr key={l.college_course_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">
                        {l.colleges?.college_name ?? "—"}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {l.courses?.course_name ?? "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        {l.courses?.degree_type && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            l.courses.degree_type === "UG" ? "bg-blue-50 text-blue-700" :
                            l.courses.degree_type === "PG" ? "bg-purple-50 text-purple-700" : "bg-orange-50 text-orange-700"
                          }`}>
                            {l.courses.degree_type}
                          </span>
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
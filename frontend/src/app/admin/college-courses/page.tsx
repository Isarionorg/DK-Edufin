"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { CollegeCourse } from "@/types/admin";
import { Plus, Trash2, CheckCircle2, Link2 } from "lucide-react";

// Mock data — replace with API calls later
const MOCK_COLLEGES = [
  { id: "c1", name: "Delhi University" },
  { id: "c2", name: "IIT Bombay" },
  { id: "c3", name: "Christ University" },
];

const MOCK_COURSES = [
  { id: "co1", name: "B.Sc (Hons.) Mathematics" },
  { id: "co2", name: "B.Tech Computer Science" },
  { id: "co3", name: "MBA" },
  { id: "co4", name: "B.Com (Hons.)" },
];

const emptyForm = {
  collegeId: "",
  courseId: "",
};

export default function CollegeCoursesPage() {
  const [links, setLinks] = useState<CollegeCourse[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.collegeId) e.college = "Please select a college";
    if (!form.courseId) e.course = "Please select a course";
    if (
      links.some(
        (l) => l.collegeId === form.collegeId && l.courseId === form.courseId
      )
    ) {
      e.duplicate = "This college-course pair is already linked";
    }
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const college = MOCK_COLLEGES.find((c) => c.id === form.collegeId)!;
    const course = MOCK_COURSES.find((c) => c.id === form.courseId)!;

    const newLink: CollegeCourse = {
      id: crypto.randomUUID(),
      collegeId: form.collegeId,
      collegeName: college.name,
      courseId: form.courseId,
      courseName: course.name,
    };
    setLinks((prev) => [newLink, ...prev]);
    setForm(emptyForm);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader
        title="College–Course Links"
        subtitle="Map which courses are offered by which colleges"
      />

      <div className="flex-1 p-8 space-y-8">
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
          {errors.duplicate && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              {errors.duplicate}
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
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.college ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select a college --</option>
                  {MOCK_COLLEGES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.course ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">-- Select a course --</option>
                  {MOCK_COURSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
              </div>
            </div>

            {/* Preview */}
            {form.collegeId && form.courseId && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm">
                <Link2 size={15} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[#1D4ED8] font-medium">
                  {MOCK_COLLEGES.find((c) => c.id === form.collegeId)?.name}
                </span>
                <span className="text-[#93C5FD]">↔</span>
                <span className="text-[#1D4ED8] font-medium">
                  {MOCK_COURSES.find((c) => c.id === form.courseId)?.name}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Create Link
            </button>
          </form>
        </div>

        {links.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                Linked Pairs ({links.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">College</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {links.map((l, i) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">{l.collegeName}</td>
                      <td className="px-6 py-3.5 text-gray-600">{l.courseName}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setLinks((prev) => prev.filter((x) => x.id !== l.id))}
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
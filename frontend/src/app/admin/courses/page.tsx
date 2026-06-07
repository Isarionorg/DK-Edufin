"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Course, DegreeType, Stream } from "@/types/admin";
import { Plus, Trash2, CheckCircle2, X } from "lucide-react";

const DEGREE_TYPES: DegreeType[] = ["UG", "PG", "Diploma"];
const STREAMS: Stream[] = ["PCM", "PCB", "COMMERCE", "HUMANITIES", "ANY"];

const STREAM_LABELS: Record<Stream, string> = {
  PCM: "PCM (Physics, Chemistry, Math)",
  PCB: "PCB (Physics, Chemistry, Biology)",
  COMMERCE: "Commerce",
  HUMANITIES: "Humanities",
  ANY: "Any Stream",
};

const emptyForm = {
  name: "",
  degreeType: "UG" as DegreeType,
  eligibleStreams: [] as Stream[],
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleStream = (s: Stream) => {
    setForm((prev) => ({
      ...prev,
      eligibleStreams: prev.eligibleStreams.includes(s)
        ? prev.eligibleStreams.filter((x) => x !== s)
        : [...prev.eligibleStreams, s],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Course name is required";
    if (form.eligibleStreams.length === 0) e.streams = "Select at least one eligible stream";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newCourse: Course = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setCourses((prev) => [newCourse, ...prev]);
    setForm(emptyForm);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Courses" subtitle="Define courses and their eligible streams" />

      <div className="flex-1 p-8 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Plus size={18} className="text-[#2563EB]" />
            Add New Course
          </h2>

          {submitted && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} /> Course added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc (Hons.) Mathematics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Degree Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.degreeType}
                  onChange={(e) => setForm({ ...form, degreeType: e.target.value as DegreeType })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                >
                  {DEGREE_TYPES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eligible Streams <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STREAMS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStream(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        form.eligibleStreams.includes(s)
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#2563EB]/40"
                      }`}
                    >
                      {s === "PCM" || s === "PCB" ? s : STREAM_LABELS[s].split(" ")[0]}
                    </button>
                  ))}
                </div>
                {form.eligibleStreams.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.eligibleStreams.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                      >
                        {STREAM_LABELS[s]}
                        <button type="button" onClick={() => toggleStream(s)}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.streams && <p className="text-xs text-red-500 mt-1">{errors.streams}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Add Course
            </button>
          </form>
        </div>

        {courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Added Courses ({courses.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Degree</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Eligible Streams</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-800">{c.name}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.degreeType === "UG" ? "bg-blue-50 text-blue-700" :
                          c.degreeType === "PG" ? "bg-purple-50 text-purple-700" : "bg-orange-50 text-orange-700"
                        }`}>
                          {c.degreeType}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {c.eligibleStreams.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setCourses((prev) => prev.filter((x) => x.id !== c.id))}
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
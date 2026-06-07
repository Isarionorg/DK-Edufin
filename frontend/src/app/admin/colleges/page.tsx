"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { College, CollegeType } from "@/types/admin";
import { Plus, Trash2, Globe, CheckCircle2, XCircle } from "lucide-react";

const COLLEGE_TYPES: CollegeType[] = ["Government", "Private", "Deemed"];

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
};

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "College name is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "State is required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newCollege: College = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setColleges((prev) => [newCollege, ...prev]);
    setForm(emptyForm);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const deleteCollege = (id: string) => {
    setColleges((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Colleges" subtitle="Add and manage colleges in the system" />

      <div className="flex-1 p-8 space-y-8">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Plus size={18} className="text-[#2563EB]" />
            Add New College
          </h2>

          {submitted && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} />
              College added successfully!
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
                  {COLLEGE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
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
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
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
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
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
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        form.isPartner ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Partner College
                    <span className="block text-xs text-gray-400 font-normal">
                      College has a business tie-up
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Add College
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        {colleges.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                Added Colleges ({colleges.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City, State</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Partner</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {colleges.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-800">
                        {c.name}
                        {c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-[#2563EB] hover:underline text-xs"
                          >
                            ↗
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.type === "Government"
                            ? "bg-green-50 text-green-700"
                            : c.type === "Private"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-orange-50 text-orange-700"
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{c.city}, {c.state}</td>
                      <td className="px-6 py-3.5">
                        {c.isPartner ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-300" />
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => deleteCollege(c.id)}
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
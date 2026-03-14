// app/student-form/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const streams = ["Science", "Commerce", "Arts"];

const courseOptions: Record<string, string[]> = {
  Science: ["Engineering (B.Tech)", "Medicine (MBBS)", "Pharmacy", "Architecture", "BSc", "Other"],
  Commerce: ["BBA", "B.Com", "CA", "Economics", "Finance", "Other"],
  Arts: ["BA", "Law", "Journalism", "Psychology", "Design", "Other"],
};

const locations = [
  "Delhi / NCR", "Mumbai", "Pune", "Bangalore", "Chennai",
  "Hyderabad", "Kolkata", "Jaipur", "Ahmedabad", "Other",
];

export default function StudentFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    stream: "",
    twelfthPercentage: "",
    jeeScore: "",
    preferredLocation: "",
    preferredCourses: [] as string[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // reset courses when stream changes
    if (e.target.name === "stream") {
      setForm((prev) => ({ ...prev, stream: e.target.value, preferredCourses: [] }));
    }
  };

  const toggleCourse = (course: string) => {
    setForm((prev) => ({
      ...prev,
      preferredCourses: prev.preferredCourses.includes(course)
        ? prev.preferredCourses.filter((c) => c !== course)
        : [...prev.preferredCourses, course],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.phone || !form.stream || !form.preferredLocation) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.preferredCourses.length === 0) {
      setError("Please select at least one preferred course.");
      return;
    }

    setIsSubmitting(true);
    // TODO: connect to your backend API to save student info
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  // Success Screen
  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Form Submitted!
          </h2>
          <p className="text-gray-500 mb-8">
            Thank you! DK Sir will review your details and get back to you with
            personalised college recommendations shortly.
          </p>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            📋 Student Information Form
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Tell Us About <span className="text-blue-500">Yourself</span>
          </h1>
          <p className="text-gray-500">
            Fill in your details so DK Sir can guide you to the right college
            for your future.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Stream */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Stream <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                {streams.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, stream: s, preferredCourses: [] }))
                    }
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.stream === s
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-500 hover:border-blue-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 12th % & JEE Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  12th Percentage
                </label>
                <input
                  type="number"
                  name="twelfthPercentage"
                  value={form.twelfthPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 85.5"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  JEE Score
                </label>
                <input
                  type="number"
                  name="jeeScore"
                  value={form.jeeScore}
                  onChange={handleChange}
                  placeholder="e.g. 12500"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Preferred Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preferred Location for College <span className="text-red-400">*</span>
              </label>
              <select
                name="preferredLocation"
                value={form.preferredLocation}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 transition-all"
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Preferred Courses */}
            {form.stream && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred Courses <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {courseOptions[form.stream].map((course) => (
                    <button
                      type="button"
                      key={course}
                      onClick={() => toggleCourse(course)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                        form.preferredCourses.includes(course)
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-500 hover:border-blue-300"
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              Submit My Details
            </Button>

            <p className="text-center text-xs text-gray-400">
              Your information is safe and will only be used to guide you better.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
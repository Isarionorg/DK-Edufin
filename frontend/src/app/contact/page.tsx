"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const contactDetails = [
    {
      icon: "📞",
      title: "Call Us",
      subtitle: "Mon–Sat, 9am to 6pm",
      value: "+91 99999 99999",
      color: "bg-blue-500",
    },
    {
      icon: "✉️",
      title: "E-mail Us",
      subtitle: "We reply within 24 hours",
      value: "contact@dkedufin.com",
      color: "bg-indigo-500",
    },
    {
      icon: "📍",
      title: "Visit Us",
      subtitle: "123, Education Hub, Sector 18",
      value: "Noida, Uttar Pradesh – 201301",
      color: "bg-sky-500",
    },
  ];

  const socialLinks = [
    { label: "Instagram", icon: "📸", href: "#", bg: "bg-pink-50 hover:bg-pink-100 border-pink-100 hover:border-pink-300 text-pink-500" },
    { label: "YouTube", icon: "▶️", href: "#", bg: "bg-red-50 hover:bg-red-100 border-red-100 hover:border-red-300 text-red-500" },
    { label: "LinkedIn", icon: "💼", href: "#", bg: "bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-300 text-blue-500" },
    { label: "Twitter", icon: "🐦", href: "#", bg: "bg-sky-50 hover:bg-sky-100 border-sky-100 hover:border-sky-300 text-sky-500" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
            📬 Contact Us
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Let's Start a Conversation
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Have questions about college admissions? We're just a message away.
            DK Sir personally reviews every enquiry.
          </p>
        </div>
      </section>

      {/* ── CONTACT CARDS ── */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {contactDetails.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {item.title}
                </p>
                <p className="text-gray-500 text-xs mb-1">{item.subtitle}</p>
                <p className="text-gray-800 font-semibold text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-2 space-y-6">

            {/* About Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Why Reach Out?
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Whether you need help choosing the right college, understanding
                admission requirements, or planning your career path — DK Sir
                is here to guide you personally.
              </p>
              <ul className="space-y-3">
                {[
                  "Free initial consultation",
                  "Personalised college recommendations",
                  "Admission process guidance",
                  "Career path planning",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp */}
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 rounded-2xl p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <p className="text-white font-bold text-base">Chat on WhatsApp</p>
                  <p className="text-green-100 text-xs mt-0.5">Usually replies within minutes</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                Follow Us
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((social) => (
                  <div
                    key={social.label}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${social.bg}`}
                  >
                    <span className="text-lg">{social.icon}</span>
                    <span className="text-sm font-medium">{social.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6">
                    🎉
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Message Sent Successfully!
                  </h2>
                  <p className="text-gray-500 max-w-sm">
                    Thank you for getting in touch! DK Sir will personally review
                    your message and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-blue-500 font-semibold text-sm hover:text-blue-600"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8 pb-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Send Us a Message
                    </h2>
                    <p className="text-gray-500 mt-1.5 text-sm">
                      Fill in the details below and we'll get back to you within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mail Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all text-sm"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you — mention the colleges you're interested in, your stream, or any specific questions..."
                        rows={6}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all resize-none text-sm"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                        <span>⚠️</span> {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
                      Send Message →
                    </Button>

                    <p className="text-center text-xs text-gray-400">
                      🔒 Your information is private and will never be shared.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
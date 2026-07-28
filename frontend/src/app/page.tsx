// app/page.tsx
"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: "🎓",
    title: "College Discovery",
    description:
      "Browse hundreds of colleges with detailed information on courses, fees, campus life, and placements — all in one place.",
  },
  {
    icon: "🧭",
    title: "Personalized Guidance",
    description:
      "Get matched with colleges that fit your academic profile, interests, and career goals through expert consultation.",
  },
  {
    icon: "📋",
    title: "Smart Application Help",
    description:
      "From filling forms to preparing documents, we guide you through every step of the admission process stress-free.",
  },
  {
    icon: "💬",
    title: "1-on-1 Counseling",
    description:
      "Book a personal session with our consultant to get honest, unbiased advice tailored specifically for you.",
  },
  {
    icon: "📊",
    title: "Compare Colleges",
    description:
      "Side-by-side comparison of colleges based on fees, rankings, location, and available streams to make smarter decisions.",
  },
  {
    icon: "✅",
    title: "Trusted by Students",
    description:
      "Hundreds of students have found their dream college through our platform. Your success story starts here.",
  },
];

const testimonials = [
  {
    id: "deepak-kapoor",
    name: "Dr. Deepak Kapoor",
    title: "Founder",
    organization: "DK EduFin",
    type: "founder" as const,
    imageUrl: "/testimonials/deepak-kapoor.png",
    message: `Welcome to dkedufin.org - your gateway to higher education opportunities for students from remote and underserved areas. We are a volunteer-driven initiative committed to making reputable colleges and university admissions accessible to every deserving student, regardless of location or background.`,
  },
  {
    id: "mamta-kapoor",
    name: "Dr. Mamta Kapoor",
    title: "Founder",
    organization: "DK EduFin",
    type: "founder" as const,
    imageUrl: "/testimonials/mamta-kapoor.png",
    message: `Your location should never limit your education. We created dkedufin.org with one clear mission: to ensure that every student living in the remote areas of India has equal access to higher education. This service is entirely free of cost. No hidden fees, no marketing gimmicks - just honest guidance.`,
  },
  {
    id: "pravakar-rath",
    name: "Prof. Pravakar Rath",
    title: "Former Pro-Vice Chancellor",
    organization: "Mizoram University",
    type: "supporter" as const,
    imageUrl: "/testimonials/pravakar-rath.png",
    message: `I am happy to know that Dr Deepak Kapoor has taken an initiative which will benefit large number of students aspiring to develop their educational career. Such an initiative is very much important and beneficial for students from far flung, rural and remote areas.`,
  },
  {
    id: "vanlalzawma",
    name: "Sd/- V. VANLALZAWMA",
    title: "Assistant Librarian & Head, Central Library",
    organization: "NIT Mizoram",
    type: "supporter" as const,
    imageUrl: "/testimonials/vanlalzawma.png",
    message: `Heartiest congratulations on the launch of DKEDUFIN.ORG! This initiative to create a dedicated platform specifically targeting students from remote areas is truly commendable. DKEDUFIN.ORG will undoubtedly serve as a beacon of hope and opportunity for countless young minds.`,
  },
];

// Double the array for seamless infinite scroll
const doubled = [...testimonials, ...testimonials];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  const isFounder = t.type === "founder";

  return (
    <div
      className={`flex-shrink-0 w-80 sm:w-96 rounded-3xl p-6 mx-3 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isFounder
          ? "bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 shadow-xl shadow-blue-200"
          : "bg-white border border-gray-100 shadow-lg"
      }`}
    >
      {/* Decorative blob */}
      {isFounder && (
        <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
      )}
      {!isFounder && (
        <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-blue-50 rounded-full opacity-60" />
      )}

      {/* TOP ROW: Photo + Name + Badge */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        {/* Left: Photo + Name */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 ${
              isFounder ? "border-white/60" : "border-blue-200"
            } bg-blue-100`}
          >
            <img
              src={t.imageUrl}
              alt={t.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p
              className={`font-bold text-sm leading-tight ${
                isFounder ? "text-white" : "text-gray-900"
              }`}
            >
              {t.name}
            </p>
            <p
              className={`text-xs font-semibold mt-0.5 ${
                isFounder ? "text-blue-200" : "text-blue-600"
              }`}
            >
              {t.title}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isFounder ? "text-blue-300" : "text-gray-400"
              }`}
            >
              {t.organization}
            </p>
          </div>
        </div>

        {/* Right: Badge */}
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
            isFounder
              ? "bg-white/20 text-white border border-white/30"
              : "bg-blue-50 text-blue-500 border border-blue-100"
          }`}
        >
          {isFounder ? "👨‍💼 Founder" : "⭐ Supporter"}
        </span>
      </div>

      {/* Quote mark */}
      <div
        className={`text-4xl font-serif leading-none mb-2 relative z-10 ${
          isFounder ? "text-white/30" : "text-blue-200"
        }`}
      >
        "
      </div>

      {/* Message */}
      <p
        className={`text-sm leading-relaxed relative z-10 ${
          isFounder ? "text-blue-50" : "text-gray-600"
        }`}
      >
        {t.message}
      </p>
    </div>
  );
}

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Infinite auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let speed = 0.6;

    const scroll = () => {
      if (!el) return;
      el.scrollLeft += speed;

      // When we've scrolled halfway (one full set), reset to start
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    // Pause on hover
    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => {
      animationId = requestAnimationFrame(scroll);
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* ─── HERO SECTION ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🎯 Your College Journey Starts Here
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Find the Right College{" "}
          <span className="text-blue-500">For You</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          We help school students navigate the overwhelming world of college
          admissions with expert guidance, real information, and personalized
          support — so you can make the best decision for your future.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/colleges">
            <Button variant="primary" size="lg">
              Explore Colleges
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "500+", label: "Colleges Listed" },
            { value: "1000+", label: "Students Guided" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "10+", label: "Years Experience" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border border-blue-100 py-4 px-2"
            >
              <p className="text-2xl font-bold text-blue-500">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to{" "}
              <span className="text-blue-500">Decide Confidently</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Our platform is built keeping students first — simple, honest, and
              genuinely helpful.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-blue-50 hover:bg-blue-100 transition-colors duration-200 rounded-2xl p-6 border border-blue-100 hover:border-blue-300 hover:shadow-md"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT THE OWNER SECTION ─── */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-shrink-0">
              <div className="w-56 h-56 rounded-full bg-blue-200 flex items-center justify-center shadow-lg border-4 border-blue-300">
                <span className="text-7xl">👨‍💼</span>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Meet Your Counselor
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Hi, We're <span className="text-blue-500">DK EduFin</span>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed max-w-xl mb-6">
                With over 10 years of experience in college counseling, I've
                helped thousands of students find their perfect college fit. My
                mission is simple — to cut through the confusion and give every
                student honest, clear, and personalized guidance so they can
                walk into their future with confidence.
              </p>
              <p className="text-gray-500 text-base leading-relaxed max-w-xl mb-8">
                Whether you're unsure about which stream to pick, which college
                suits your budget, or how to crack the admission process — I'm
                here to walk with you every step of the way.
              </p>
              <Link href="/contact">
                <Button variant="primary" size="md">
                  Book a Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS SCROLLING SECTION ─── */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            🌟 Voices Behind DK EduFin
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by{" "}
            <span className="text-blue-500">Founders & Leaders</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Meet the founders and academic leaders who believe in our mission to
            make quality education accessible to every student.
          </p>
        </div>

        {/* Scrolling Track */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-indigo-50 to-transparent z-10 pointer-events-none" />

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-hidden py-4 cursor-grab select-none"
            style={{ scrollbarWidth: "none" }}
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>

        {/* Pause hint */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Hover over a card to pause the scroll
        </p>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-blue-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Find Your Dream College?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join hundreds of students who found their path with our guidance.
            It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-500"
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/colleges">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-blue-400"
              >
                Browse Colleges →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-blue-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} DKEdufin. All rights reserved. Built
          with ❤️ for students.
        </div>
      </footer>
    </main>
  );
}
// app/page.tsx
"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";

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
  {
    id: "amit-kumar",
    name: "Dr. Amit Kumar",
    title: "Associate Professor and Dean",
    organization: "Central University of Gujarat, Vadodara",
    type: "supporter" as const, 
    imageUrl: "/testimonials/amit-kumar.jpeg",
    message: `Congratulations to Dr. Deepak Kapoor and his entire team on the launch of your academic consultation platform, DKEdufin.Wishing you every success as you help students turn their dreams of studying at premier institutions in India and abroad into reality.Your dedication, vision, and commitment to guiding aspiring students will undoubtedly make a meaningful difference in many lives. May this new venture exceed your expectations and become a trusted destination for students seeking the right guidance.Wishing you continued success, many milestones, and all the very best on this exciting journey. Congratulations once again!`,
  },
  {
    id: "akhandanand-shukla",
    name: "Prof. Akhandanand Shukla",
    title: "Professor",
    organization: "Central University of Tamil Nadu, Thiruvarur ",
    type: "supporter" as const, 
    imageUrl: "/testimonials/akhandanand-shukla.jpeg",
    message: `Congratulations on developing such an informative userfriendly and excellent platform for students seeking guidance in choosing a suitable career path. It provides valuable educational guidance and opportunities for school and college students. The platform has immense potential to support students in their academic journey, career planning, and overall personal development. I sincerely appreciate the efforts of the entire team in team in creating this meaningful initiative and wish you continued success in empowering young learners and contributing to the advancement of education. `,
  },
];

type Testimonial = typeof testimonials[0];

// Double the array for seamless infinite scroll
const doubled = [...testimonials, ...testimonials];

function TestimonialCard({
  t,
  onOpen,
}: {
  t: Testimonial;
  onOpen: (t: Testimonial) => void;
}) {
  const isFounder = t.type === "founder";

  return (
    <button
      type="button"
      onClick={() => onOpen(t)}
      className={`flex-shrink-0 w-80 sm:w-[26rem] rounded-3xl p-6 mx-3 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
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
    </button>
  );
}

function TestimonialModal({
  t,
  onClose,
}: {
  t: Testimonial;
  onClose: () => void;
}) {
  const isFounder = t.type === "founder";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl p-8 sm:p-10 ${
          isFounder
            ? "bg-gradient-to-br from-blue-600 to-blue-800"
            : "bg-white"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
            isFounder
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-500"
          }`}
        >
          ✕
        </button>

        {/* Badge */}
        <span
          className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-6 ${
            isFounder
              ? "bg-white/20 text-white border border-white/30"
              : "bg-blue-50 text-blue-500 border border-blue-100"
          }`}
        >
          {isFounder ? "👨‍💼 Founder" : "⭐ Supporter"}
        </span>

        {/* Enlarged photo + name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 flex-shrink-0 ${
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
              className={`font-bold text-lg leading-tight ${
                isFounder ? "text-white" : "text-gray-900"
              }`}
            >
              {t.name}
            </p>
            <p
              className={`text-sm font-semibold mt-1 ${
                isFounder ? "text-blue-200" : "text-blue-600"
              }`}
            >
              {t.title}
            </p>
            <p
              className={`text-sm mt-0.5 ${
                isFounder ? "text-blue-300" : "text-gray-400"
              }`}
            >
              {t.organization}
            </p>
          </div>
        </div>

        {/* Quote mark */}
        <div
          className={`text-6xl font-serif leading-none mb-2 ${
            isFounder ? "text-white/30" : "text-blue-200"
          }`}
        >
          "
        </div>

        {/* Full message */}
        <p
          className={`text-base leading-relaxed ${
            isFounder ? "text-blue-50" : "text-gray-600"
          }`}
        >
          {t.message}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const modalOpenRef = useRef(false);
  const [activeTestimonial, setActiveTestimonial] = useState<Testimonial | null>(
    null
  );

  // Keep a ref in sync with modal state so the animation loop (set up once)
  // always reads the latest value without needing to restart itself.
  useEffect(() => {
    modalOpenRef.current = activeTestimonial !== null;
  }, [activeTestimonial]);

  // Infinite auto-scroll — single persistent rAF loop, never torn down/rebuilt
  // on hover or modal open, so it can't get stuck in a cancelled state.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    const speed = 0.4;

    const scroll = () => {
      if (!el) return;

      if (!hoveredRef.current && !modalOpenRef.current) {
        el.scrollLeft += speed;

        // When we've scrolled halfway (one full set), reset to start
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const onEnter = () => {
      hoveredRef.current = true;
    };
    const onLeave = () => {
      hoveredRef.current = false;
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
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
                With over 10 years of experience in college counseling, We've
                helped thousands of students find their perfect college fit. Our
                mission is simple — to cut through the confusion and give every
                student honest, clear, and personalized guidance so they can
                walk into their future with confidence.
              </p>
              <p className="text-gray-500 text-base leading-relaxed max-w-xl mb-8">
                Whether you're unsure about which stream to pick, which college
                suits your budget, or how to crack the admission process — We're
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
            style={{ scrollbarWidth: "none", scrollBehavior: "auto" }}
          >
            {doubled.map((t, i) => (
              <TestimonialCard
                key={`${t.id}-${i}`}
                t={t}
                onOpen={setActiveTestimonial}
              />
            ))}
          </div>
        </div>

        {/* Pause hint */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Hover or tap a card to read the full message
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

      {/* ─── TESTIMONIAL MODAL ─── */}
      {activeTestimonial && (
        <TestimonialModal
          t={activeTestimonial}
          onClose={() => setActiveTestimonial(null)}
        />
      )}
    </main>
  );
}
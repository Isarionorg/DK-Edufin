"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useEffect, useRef } from "react";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  organization: string;
  message: string;
  imageUrl: string;
  type: "founder" | "supporter";
}

const founders: Testimonial[] = [
  {
    id: "deepak-kapoor",
    name: "Dr. Deepak Kapoor",
    title: "Founder",
    organization: "DK EduFin",
    type: "founder",
    imageUrl: "/testimonials/deepak-kapoor.png",
    message: `"Get started - Apply now" • "Request free counselling" • "Find your best-fit college"

Welcome to dkedufin.org - your gateway to higher education opportunities for students from remote and underserved areas. We are a volunteer-driven initiative committed to making reputable colleges and university admissions accessible to every deserving student, regardless of location or background.`,
  },
  {
    id: "mamta-kapoor",
    name: "Dr. Mamta Kapoor",
    title: "Founder",
    organization: "DK EduFin",
    type: "founder",
    imageUrl: "/testimonials/mamta-kapoor.png",
    message: `Your location should never limit your education. We created dkedufin.org with one clear mission: to ensure that every student living in the remote areas of India has equal access to higher education.

Once you log in, you will unlock completely free tools designed to guide your next steps. By securely entering your CUET scores or board percentages, our platform will instantly analyse your options and match your academic achievements with the best possible colleges and courses across the country.

This service is entirely free of cost. No hidden fees, no marketing gimmicks - just honest guidance to help you reach your dream campus.`,
  },
];

const supporters: Testimonial[] = [
  {
    id: "pravakar-rath",
    name: "Prof. Pravakar Rath",
    title: "Former Pro-Vice Chancellor",
    organization: "Mizoram University",
    type: "supporter",
    imageUrl: "/testimonials/pravakar-rath.png",
    message: `I am happy to know that Dr Deepak Kapoor has taken an initiative which will benefit large number of students aspiring to develop their educational career. Such an initiative is very much important and beneficial for students from far flung, rural and remote areas who have very less knowledge and idea to select an appropriate college and subject. I am sure this kind of personalised student support to the prospective students can provide right direction for building an academic career.`,
  },
  {
    id: "vanlalzawma",
    name: "Sd/- V. VANLALZAWMA",
    title: "Assistant Librarian & Head, Central Library",
    organization: "NIT Mizoram",
    type: "supporter",
    imageUrl: "/testimonials/vanlalzawma.png",
    message: `Heartiest congratulations to you on the launch of DKEDUFIN.ORG!

This initiative to create a dedicated platform specifically targeting students from remote areas who aspire to pursue education nationally and abroad is truly commendable. In a time where access to the right information and guidance makes all the difference, DKEDUFIN.ORG will undoubtedly serve as a beacon of hope and opportunity for countless young minds. Your vision and commitment to bridge the education gap are inspiring and commendable.`,
  },
];

function SupporterCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-10 transition-all duration-700 ease-out"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-50 rounded-full opacity-60" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-50 rounded-full opacity-40" />

        <div className="text-6xl text-blue-200 font-serif leading-none mb-4 relative z-10">
          "
        </div>

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 relative z-10 whitespace-pre-line">
          {testimonial.message}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 border-t border-blue-50 pt-5 relative z-10 flex-wrap">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-blue-300 flex-shrink-0 bg-blue-100">
            <img
              src={testimonial.imageUrl}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
            <p className="text-blue-600 text-xs font-semibold">{testimonial.title}</p>
            <p className="text-gray-400 text-xs">{testimonial.organization}</p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs bg-blue-50 text-blue-500 font-semibold px-3 py-1 rounded-full border border-blue-100">
              ⭐ Supporter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">

      {/* ─── HERO ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🌟 Our Mission & Community
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Voices Behind{" "}
          <span className="text-blue-500">DK EduFin</span>
        </h1>
        <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto">
          Meet the founders and supporters who believe in making quality
          education accessible to every deserving student, regardless of
          location or background.
        </p>
      </section>

      {/* ─── FOUNDERS SECTION ─── */}
      {/* Mobile: stacked normally | Desktop: sticky left panel */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: FOUNDERS (sticky only on desktop) ── */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-20">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Label */}
              <div className="text-center mb-6 sm:mb-8">
                <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  👨‍💼 Our Founders
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">
                  The People Behind the Mission
                </h2>
              </div>

              {/* Founder Cards */}
              <div className="space-y-5">
                {founders.map((founder) => (
                  <div
                    key={founder.id}
                    className="bg-white/10 border border-white/20 rounded-2xl p-5 sm:p-6 hover:bg-white/15 transition-all duration-300"
                  >
                    {/* Person info */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 flex-shrink-0 bg-blue-200">
                        <img
                          src={founder.imageUrl}
                          alt={founder.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">
                          {founder.name}
                        </p>
                        <p className="text-blue-200 text-xs font-semibold">
                          {founder.title}
                        </p>
                        <p className="text-blue-300 text-xs">
                          {founder.organization}
                        </p>
                      </div>
                      <span className="text-xs bg-white/20 text-white font-semibold px-2 py-1 rounded-full border border-white/30 flex-shrink-0">
                        👨‍💼 Founder
                      </span>
                    </div>

                    {/* Quote mark */}
                    <div className="text-3xl text-white/30 font-serif leading-none mb-2">
                      "
                    </div>

                    {/* Full message — no clamp */}
                    <p className="text-blue-50 text-sm leading-relaxed whitespace-pre-line">
                      {founder.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: SCROLLABLE SUPPORTERS ── */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Label */}
            <div className="text-center mb-6 sm:mb-8">
              <span className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full">
                ⭐ Community Supporters
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
                Endorsed by Academic Leaders
              </h2>
              <p className="text-gray-500 text-sm mt-2 hidden lg:block">
                Scroll to explore what our supporters say
              </p>
            </div>

            {supporters.map((supporter, index) => (
              <SupporterCard
                key={supporter.id}
                testimonial={supporter}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY THESE VOICES MATTER ─── */}
      <section className="bg-blue-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">
            Why We Share These Voices
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
            DK EduFin is built on the foundation of genuine belief in
            transforming education accessibility. Our founders and supporters
            represent educators, administrators, and leaders who understand the
            challenges students face in remote areas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: "🎯",
                title: "Honest Mission",
                description: "No profit motive, just genuine commitment to students",
                bg: "bg-blue-500",
              },
              {
                icon: "🤝",
                title: "Expert Guidance",
                description: "Years of educational expertise backing every recommendation",
                bg: "bg-indigo-500",
              },
              {
                icon: "📈",
                title: "Real Impact",
                description: "Endorsed by academic institutions and educational leaders",
                bg: "bg-sky-500",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-blue-500 py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Join Hundreds of Students on Their Journey
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8">
            Start your college discovery today with the guidance of experts who
            truly care about your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-500 w-full sm:w-auto"
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/colleges">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-blue-400 w-full sm:w-auto"
              >
                Explore Colleges →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-blue-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} DKEduFin. All rights reserved. Built
          with ❤️ for students.
        </div>
      </footer>
    </main>
  );
}
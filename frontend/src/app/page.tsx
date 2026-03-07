// app/page.tsx
import Link from "next/link";
import Button from "@/components/ui/Button";

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

export default function HomePage() {
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
            {/* Photo placeholder */}
            <div className="flex-shrink-0">
              <div className="w-56 h-56 rounded-full bg-blue-200 flex items-center justify-center shadow-lg border-4 border-blue-300">
                <span className="text-7xl">👨‍💼</span>
              </div>
            </div>
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Meet Your Counselor
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Hi, I'm <span className="text-blue-500">DK Sir</span>
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
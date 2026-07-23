// app/testimonials/page.tsx
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  organization: string;
  message: string;
  imageUrl: string;
  type: "founder" | "supporter";
}

const testimonials: Testimonial[] = [
  {
    id: "deepak-kapoor",
    name: "Dr. Deepak Kapoor",
    title: "Founder",
    organization: "DK EduFin",
    type: "founder",
    imageUrl: "/testimonials/deepak-kapoor.png",
    message: `"Get started - Apply now"
"Request free counselling"
"Find your best-fit college"

Welcome to dkedufin.org - your gateway to higher education opportunities for students from remote and underserved areas. We are a volunteer-driven initiative committed to making reputable colleges and university admissions accessible to every deserving student, regardless of location or background.`,
  },
  {
    id: "mamta-kapoor",
    name: "Dr. Mamta Kapoor",
    title: "Founder",
    organization: "DK EduFin",
    type: "founder",
    imageUrl: "/testimonials/mamta-kapoor.png", 
    message: `
Welcome to DKEduFin.org

Your location should never limit your education. We created dkedufin.org with one clear mission: to ensure that every student living in the remote areas of India has equal access to higher education. Finding the right college or discipline can be overwhelming. We are here to simplify that journey for you.

Once you log in, you will unlock completely free tools designed to guide your next steps. By securely entering your CUET scores or board percentages, our platform will instantly analyse your options. We match your academic achievements with the best possible colleges and courses across the country.

This service is entirely free of cost. No hidden fees, no marketing gimmicks - just honest guidance to help you reach your dream campus.

Log in now, enter your scores, and let us build your pathway to success together!`,
  },
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
    message: `Dear Dr. Deepak Kapoor,

Heartiest congratulations to you on the launch of DKEDUFIN.ORG!

This initiative to create a dedicated platform specifically targeting students from remote areas who aspire to pursue education nationally and abroad is truly commendable. In a time where access to the right information and guidance makes all the difference, DKEDUFIN.ORG will undoubtedly serve as a beacon of hope and opportunity for countless young minds. Your vision and commitment to bridge the education gap are inspiring and commendable. I wish you and the entire DKEDUFIN.ORG team great success and wider reach in the coming years.

With warm regards,`,
  },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ─── HERO SECTION ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🌟 Our Mission & Community
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Voices Behind{" "}
          <span className="text-blue-500">DK EduFin</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
          Meet the founders and supporters who believe in making quality education accessible to every deserving student, regardless of location or background.
        </p>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`flex flex-col ${
                  testimonials.indexOf(testimonial) % 2 === 1
                    ? "lg:flex-row-reverse"
                    : "lg:flex-row"
                } gap-8 lg:gap-12 items-center`}
              >
                {/* Image */}
                <div className="flex-shrink-0 w-full lg:w-2/5">
                  <div className="relative w-full max-w-sm mx-auto">
                    {/* Image container with fallback background */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-blue-100 border-4 border-blue-200 flex items-center justify-center">
                      <img
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-3/5">
                  {/* Badge */}
                  <div className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {testimonial.type === "founder" ? "👨‍💼 Founder" : "⭐ Supporter"}
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 text-base leading-relaxed mb-6 whitespace-pre-line">
                    {testimonial.message}
                  </p>

                  {/* Name & Title */}
                  <div className="border-t border-blue-100 pt-6">
                    <p className="text-lg font-bold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-blue-600 font-semibold text-sm">
                      {testimonial.title}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {testimonial.organization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY THESE VOICES MATTER ─── */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Why We Share These Voices
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            DK EduFin is built on the foundation of genuine belief in transforming education accessibility. Our founders and supporters represent educators, administrators, and leaders who understand the challenges students face in remote areas. Their endorsement reflects the real-world impact and credibility of our mission.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "Honest Mission",
                description:
                  "No profit motive, just genuine commitment to students",
              },
              {
                icon: "🤝",
                title: "Expert Guidance",
                description:
                  "Years of educational expertise backing every recommendation",
              },
              {
                icon: "📈",
                title: "Real Impact",
                description:
                  "Endorsed by academic institutions and educational leaders",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-blue-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join Hundreds of Students on Their Journey
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Start your college discovery today with the guidance of experts who truly care about your success.
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
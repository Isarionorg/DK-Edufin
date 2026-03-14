// components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-14 pb-6 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              DK<span className="text-blue-400">Edufin</span>
            </Link>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Helping school students find the right college with honest,
              personalised guidance from an expert counsellor.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: "📸", label: "Instagram" },
                { icon: "▶️", label: "YouTube" },
                { icon: "💼", label: "LinkedIn" },
                { icon: "🐦", label: "Twitter" },
              ].map((s) => (
                <div
                  key={s.label}
                  title={s.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-500 rounded-xl flex items-center justify-center text-base cursor-pointer transition-all duration-200"
                >
                  {s.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Colleges", href: "/colleges" },
                { label: "Student Form", href: "/student-form" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Streams */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Explore By Stream
            </h3>
            <ul className="space-y-3">
              {[
                "Science (Engineering)",
                "Science (Medical)",
                "Commerce & BBA",
                "Arts & Humanities",
                "Design & Fashion",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/colleges"
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-lg mt-0.5">📞</span>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                  <p className="text-white text-sm font-medium">+91 99999 99999</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg mt-0.5">✉️</span>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">E-mail</p>
                  <p className="text-white text-sm font-medium">contact@dkedufin.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg mt-0.5">📍</span>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Address</p>
                  <p className="text-white text-sm font-medium">Sector 18, Noida, UP</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DKEdufin. All rights reserved. Built with ❤️ for students.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-gray-500 hover:text-blue-400 text-xs transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
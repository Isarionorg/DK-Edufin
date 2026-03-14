// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

// Temporary auth mock — replace with your real Zustand auth store later
const useAuth = () => {
  const [isLoggedIn] = useState(false);
  return { isLoggedIn };
};

export default function Navbar() {
  const { isLoggedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/DK_Edufin_logo.png"
              alt="DKEdufin Logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/colleges"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Colleges
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Contact Us
            </Link>

            <Link
              href="/student-form"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Student Form
            </Link>

            {isLoggedIn ? (
              <Link href="/dashboard/profile">
                <Button variant="primary" size="sm">
                  Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="primary" size="sm">
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 pb-4 pt-2 border-t border-blue-100">
            <Link
              href="/colleges"
              className="text-gray-600 hover:text-blue-600 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Colleges
            </Link>
            <Link
              href="/student-form"
              className="text-gray-600 hover:text-blue-600 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Student Form
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-600 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard/profile"
                onClick={() => setMenuOpen(false)}
              >
                <Button variant="primary" size="sm">
                  Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" size="sm">
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

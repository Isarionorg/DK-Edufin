"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Async handling for logout to prevent race conditions
  const handleLogout = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    logout(); // clears state + localStorage
    router.push("/");
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-28">

          {/* Logo */}
          <Link href="/" className="flex items-center">
  <Image
  src="/DK_Edufin_logo.jpeg"
  alt="DKEdufin Logo"
  width={380}
  height={120}
  priority
  className="h-24 w-auto object-contain"
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

            {/* Desktop Auth Section */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  {getInitials()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                      <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.name || user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <span className="text-lg">🏠</span>
                      <span className="font-medium">Home</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
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
              className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
            />
            <span
              className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${menuOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""
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

            {/* Mobile Auth Section */}
            {loading ? (
              <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 py-2 border-t border-blue-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {user?.name || user?.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/");
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <span>🏠</span> Home
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <span>🚪</span> Logout
                </button>
              </>
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
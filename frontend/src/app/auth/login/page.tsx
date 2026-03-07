// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl flex rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* ─── LEFT PANEL ─── */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 p-12 flex-col justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            DK<span className="text-blue-200">Edufin</span>
          </Link>

          {/* Center Content */}
          <div>
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
              {mode === "login"
                ? "Welcome back! Your dream college awaits."
                : "Join thousands of students finding their perfect college."}
            </h2>
            <p className="text-blue-100 text-base leading-relaxed">
              {mode === "login"
                ? "Log in to continue your personalized college journey with expert guidance."
                : "Sign up for free and get personalized college recommendations tailored just for you."}
            </p>

            {/* Testimonial */}
            <div className="mt-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <p className="text-white text-sm leading-relaxed italic">
                "DKEdufin helped me find the perfect college for my career goals.
                The guidance was honest and super helpful!"
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-sm">
                  R
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Rahul Sharma</p>
                  <p className="text-blue-200 text-xs">Engineering Student, Pune</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-blue-200 text-xs">
            © {new Date().getFullYear()} DKEdufin. All rights reserved.
          </p>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
              DK<span className="text-blue-400">Edufin</span>
            </Link>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                mode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => setMode("login")} />
          )}

        </div>
      </div>
    </main>
  );
}
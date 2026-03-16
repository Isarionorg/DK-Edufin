// components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import OTPInput from "@/components/auth/OTPInput";
import axiosInstance from "@/lib/axios";

interface RegisterFormProps {
  onSwitch: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [step, setStep] = useState<"register" | "otp">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and include at least one uppercase letter and one number."
  );
  return;
}

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/register", {
        email: email.toLowerCase(),
        password,
        full_name: name
      });

      if (response.data.success) {
        // Store email in sessionStorage for OTP verification
        sessionStorage.setItem("verifyEmail", email);
        setStep("otp");
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <OTPInput
        email={email}
        onVerified={() => {
          sessionStorage.removeItem("verifyEmail");
          // Redirect to login or dashboard after verified
          window.location.href = "/auth/login";
        }}
        onBack={() => setStep("register")}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-2">Start your college journey today — it's free!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          className="text-blue-500 font-semibold hover:text-blue-600"
        >
          Login
        </button>
      </p>
    </div>
  );
}
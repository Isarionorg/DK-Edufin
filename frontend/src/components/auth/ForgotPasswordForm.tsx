"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";

type Step = "email" | "otp" | "password";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Request OTP
  const handleEmailSubmit = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setError(""); setIsLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email: email.toLowerCase() });
      // Always show success regardless (backend hides whether account exists)
      setSuccess("If this email is registered, an OTP has been sent.");
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (just move to next step — actual validation happens on reset)
  const handleOtpSubmit = () => {
    if (otp.trim().length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    setError(""); setSuccess("");
    setStep("password");
  };

  // Step 3: Reset password
  const handlePasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) { setError("Please fill in both fields."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setIsLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email: email.toLowerCase(),
        otp_code: otp.trim(),
        new_password: newPassword,
      });
      setSuccess("Password reset successful! You can now log in.");
      // Give user a moment to see the success message, then go back to login
      setTimeout(onBack, 2000);
    } catch (err: any) {
      // If OTP was wrong/expired, send them back to OTP step
      const msg = err.response?.data?.message || "Reset failed. Please try again.";
      setError(msg);
      if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("expired")) {
        setStep("otp");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles: Record<Step, { heading: string; sub: string }> = {
    email: { heading: "Forgot Password?", sub: "Enter your email and we'll send you an OTP." },
    otp:   { heading: "Check Your Email", sub: `We sent a 6-digit OTP to ${email}` },
    password: { heading: "Set New Password", sub: "Choose a strong password for your account." },
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{stepTitles[step].heading}</h2>
        <p className="text-gray-500 mt-2 text-sm">{stepTitles[step].sub}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(["email", "otp", "password"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s === step ? "bg-blue-600 text-white" :
              (["email", "otp", "password"].indexOf(step) > i) ? "bg-blue-200 text-blue-700" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${(["email","otp","password"].indexOf(step) > i) ? "bg-blue-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* STEP 1: Email */}
        {step === "email" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
            />
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">One-Time Password</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleOtpSubmit()}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all tracking-widest text-center text-xl font-semibold"
            />
            <button
              type="button"
              onClick={handleEmailSubmit}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium mt-2"
            >
              Resend OTP
            </button>
          </div>
        )}

        {/* STEP 3: New password */}
        {step === "password" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Repeat your new password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
              />
            </div>
          </>
        )}

        {/* Feedback banners */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* CTA button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          onClick={step === "email" ? handleEmailSubmit : step === "otp" ? handleOtpSubmit : handlePasswordSubmit}
        >
          {step === "email" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Reset Password"}
        </Button>
      </div>

      {/* Back to login */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Remember your password?{" "}
        <button onClick={onBack} className="text-blue-500 font-semibold hover:text-blue-600">
          Back to Login
        </button>
      </p>
    </div>
  );
}
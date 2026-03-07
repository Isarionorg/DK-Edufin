"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const email = sessionStorage.getItem("verifyEmail");
      if (!email) {
        setError("Email not found. Please register first.");
        router.push("/auth/register");
        return;
      }

      const response = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (response.data.success) {
        sessionStorage.removeItem("verifyEmail");
        router.push("/auth/login");
      } else {
        setError(response.data.message || "OTP verification failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight block text-center mb-8">
            DK<span className="text-blue-400">Edufin</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Verify OTP
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter the 6-digit code sent to your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Didn't receive a code?{" "}
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Resend
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

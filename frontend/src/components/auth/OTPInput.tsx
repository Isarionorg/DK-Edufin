// components/auth/OTPInput.tsx
"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";

interface OTPInputProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPInput({ email, onVerified, onBack }: OTPInputProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only 1 digit
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pasted.forEach((char, i) => {
      if (/^\d$/.test(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    // TODO: connect to your backend OTP verification API
    setTimeout(() => {
      setIsLoading(false);
      onVerified();
    }, 1500);
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    // TODO: connect to your backend resend OTP API
    setTimeout(() => {
      setIsResending(false);
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
        <p className="text-gray-500 mt-2 text-sm">
          We sent a 6-digit OTP to{" "}
          <span className="font-semibold text-blue-500">{email}</span>
        </p>
      </div>

      {/* OTP Boxes */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 transition-all"
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Verify Button */}
      <Button
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
        onClick={handleVerify}
      >
        Verify OTP
      </Button>

      {/* Resend & Back */}
      <div className="flex items-center justify-between mt-5 text-sm">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
        >
          {isResending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
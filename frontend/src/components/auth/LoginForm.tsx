// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth"; // 1. Import hook

interface LoginFormProps {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth(); // 2. Grab the login helper
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        const token = response.data.data.token;
        
        if (token) {
          // 3. Fire the hook login update. This updates your state reactively!
          const loginSuccess = await login(token);
          
          if (loginSuccess) {
            router.push("/colleges");
            router.refresh(); // Clears any Next.js layout caching layers
          } else {
            setError("Could not retrieve your user profile. Please try again.");
          }
        }
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-500 mt-2">Login to continue your college journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50 transition-all"
          />
          <div className="text-right mt-2">
            <button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Forgot password?
            </button>
          </div>
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
          Login
        </Button>
      </form>

      {/* Switch to Register */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{" "}
        <button
          onClick={onSwitch}
          className="text-blue-500 font-semibold hover:text-blue-600"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
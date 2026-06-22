// app/student-form/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentForm from "@/components/auth/StudentForm";
import axios from "@/lib/axios";

function StudentFormContent() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  // OTP gate — fetched once on mount
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [existingPhone, setExistingPhone] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserPhone = async () => {
      try {
        const res = await axios.get("/auth/me");
const user = res.data.data;
        if (user?.phone_verified) {
          setPhoneVerified(true);
          setExistingPhone(user.phone ?? "");
        }
      } catch {
        // Not yet profiled or not logged in — leave defaults (false, "")
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserPhone();
  }, []);

  const handleSuccess = () => {
    setSubmitted(true);
  };

  // Success Screen
  if (submitted) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Profile Completed!
          </h2>
          <p className="text-gray-500 mb-8">
            Your profile has been saved successfully. Now you can explore
            personalized college recommendations.
          </p>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => router.push("/colleges")}
          >
            View College Recommendations
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-500 mb-8">
            Help us understand your preferences for personalized college
            recommendations
          </p>

          {loadingUser ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              Loading…
            </div>
          ) : (
            <StudentForm
              onSuccess={handleSuccess}
              onCancel={() => router.back()}
              isModal={false}
              isPhoneVerified={phoneVerified}
              existingPhone={existingPhone}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function StudentFormPage() {
  return (
    <ProtectedRoute>
      <StudentFormContent />
    </ProtectedRoute>
  );
}
"use client";

import { useUser } from "@/hooks/useUser";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome back, {user?.name || "Student"}!</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Profile Status</h3>
          <p className="text-2xl font-bold text-blue-600">{user?.completed ? "Complete" : "Incomplete"}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Colleges Saved</h3>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Applications</h3>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/profile"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg text-center"
        >
          Complete Your Profile
        </Link>
        <Link
          href="/colleges"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg text-center"
        >
          Explore Colleges
        </Link>
      </div>
    </div>
  );
}
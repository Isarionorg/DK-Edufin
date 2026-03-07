"use client";

import { useUser } from "@/hooks/useUser";
import { useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Profile Header */}
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <p className="text-gray-900">{user?.name || "Not provided"}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <p className="text-gray-900">{user?.email || "Not provided"}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Status</label>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
            <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg">
            Change Password
          </button>
          <button className="w-full bg-red-100 hover:bg-red-200 text-red-900 font-semibold py-2 rounded-lg">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

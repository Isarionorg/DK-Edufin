"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Building2, BookOpen, Link2, BarChart3, TrendingUp, Users, Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { fetchStats, AdminStats } from "@/lib/adminapi";

const quickActions = [
  { label: "Add New College", href: "/admin/colleges", desc: "Register a college with details", icon: Building2 },
  { label: "Add New Course", href: "/admin/courses", desc: "Create a course offering", icon: BookOpen },
  { label: "Link College & Course", href: "/admin/college-courses", desc: "Map courses to colleges", icon: Link2 },
  { label: "Add Exam", href: "/admin/exams", desc: "Register a new entrance exam", icon: GraduationCap },
  { label: "Add Cutoff Data", href: "/admin/cutoffs", desc: "Enter exam cutoff scores/ranks", icon: BarChart3 },
  { label: "Bulk Upload (CSV/Excel)", href: "/admin/bulk-upload", desc: "Upload data from colleges in bulk", icon: TrendingUp },
  { label: "View Users", href: "/admin/users", desc: "Browse student profiles and contact info", icon: Users },  // ← add
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Colleges", value: stats?.colleges ?? 0, icon: Building2, color: "bg-blue-50 text-blue-600", href: "/admin/colleges" },
    { label: "Total Courses", value: stats?.courses ?? 0, icon: BookOpen, color: "bg-indigo-50 text-indigo-600", href: "/admin/courses" },
    { label: "College-Course Links", value: stats?.collegeCourses ?? 0, icon: Link2, color: "bg-sky-50 text-sky-600", href: "/admin/college-courses" },
    { label: "Cutoff Entries", value: stats?.cutoffs ?? 0, icon: BarChart3, color: "bg-cyan-50 text-cyan-600", href: "/admin/cutoffs" },
    // { label: "Total Exams", value: stats?.exams ?? 0, icon: GraduationCap, color: "bg-violet-50 text-violet-600", href: "/admin/exams" },
    { label: "Registered Users", value: stats?.users ?? 0, icon: Users, color: "bg-violet-50 text-violet-600", href: "/admin/users" },  // ← add
  ];

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back, Admin. Here's what's happening."
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#2563EB]/30 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                {loading ? (
                  <Loader2 size={20} className="animate-spin text-gray-300 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors">
                    {stat.value.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            Could not load stats: {error}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#2563EB]/40 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[#2563EB] transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1D4ED8]">Getting Started</p>
            <p className="text-sm text-[#3B82F6] mt-1">
              Start by adding colleges, then create courses, link them together, register exams,
              and finally add cutoff data. Use Bulk Upload to import CSV/Excel files sent by partner colleges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Link2,
  BarChart3,
  Upload,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Colleges", href: "/admin/colleges", icon: Building2 },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "College-Course Links", href: "/admin/college-courses", icon: Link2 },
  { label: "Cutoff Data", href: "/admin/cutoffs", icon: BarChart3 },
  { label: "Bulk Upload", href: "/admin/bulk-upload", icon: Upload, badge: "CSV/Excel" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-gray-900">DK</span>
          <span className="text-xl font-black text-[#2563EB]">EduFin</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-[#2563EB]" : "text-gray-400 group-hover:text-gray-600"}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-[#2563EB] text-white px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={14} className="text-[#2563EB]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
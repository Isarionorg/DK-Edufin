"use client";

import { Bell, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem('dk_admin_token');
    } catch (err) {
      console.error('Failed to clear admin session:', err);
      // Even if storage couldn't be cleared, still redirect to login
      // so the admin isn't stuck on the page.
    } finally {
      router.replace('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {pathname !== "/admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-all"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>
        )}

        {/* <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
          {/* <Bell size={18} className="text-gray-500" /> */}
          {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full" />
        </button> */} 

        {/* ← replace the Exit Panel link with this button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}
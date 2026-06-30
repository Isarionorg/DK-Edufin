'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminauth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecked(true);
      return;
    }

    try {
      if (!isAdminLoggedIn()) {
        router.replace('/admin/login');
      } else {
        setChecked(true);
      }
    } catch (err) {
      console.error('Admin auth check failed:', err);
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
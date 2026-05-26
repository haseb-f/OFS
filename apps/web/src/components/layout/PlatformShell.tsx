'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import PlatformSidebar from './PlatformSidebar';
import Header from './Header';

const PLATFORM_TITLES: Record<string, string> = {
  '/platform/dashboard': 'لوحة تحكم المنصة',
  '/platform/brands':    'إدارة البراندات',
  '/platform/companies': 'إدارة الشركات',
  '/platform/branches':  'إدارة الفروع',
  '/platform/users':     'إدارة المستخدمين',
  '/platform/roles':     'الأدوار والصلاحيات',
};

interface PlatformShellProps {
  children: React.ReactNode;
  locale: string;
}

export default function PlatformShell({ children, locale }: PlatformShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const titleAr =
    Object.entries(PLATFORM_TITLES).find(([seg]) => pathname.includes(seg))?.[1] ??
    'لوحة تحكم المنصة';

  return (
    <div className="ofs-shell">
      <PlatformSidebar
        locale={locale}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="ofs-body">
        <Header
          titleAr={titleAr}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />
        <main className="ofs-page" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

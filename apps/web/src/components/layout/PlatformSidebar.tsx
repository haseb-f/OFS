'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function IcoBrands() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function IcoCompanies() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  );
}

function IcoBranches() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
    </svg>
  );
}

function IcoUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IcoRoles() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function IcoLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

// ── Navigation items ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/platform/dashboard', labelAr: 'لوحة التحكم',        Icon: IcoDashboard },
  { href: '/platform/brands',    labelAr: 'البراندات',           Icon: IcoBrands    },
  { href: '/platform/companies', labelAr: 'الشركات',             Icon: IcoCompanies },
  { href: '/platform/branches',  labelAr: 'الفروع',              Icon: IcoBranches  },
  { href: '/platform/users',     labelAr: 'المستخدمون',          Icon: IcoUsers     },
  { href: '/platform/roles',     labelAr: 'الأدوار والصلاحيات',  Icon: IcoRoles     },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

interface PlatformSidebarProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformSidebar({ locale, isOpen, onClose }: PlatformSidebarProps) {
  const pathname  = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent) {
      if (e.target === overlayRef.current) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen, onClose]);

  return (
    <>
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="قائمة إدارة المنصة">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">OFS Platform</span>
            <span className="sidebar-logo-sub">المنصة المركزية</span>
          </div>
        </div>

        {/* Platform Owner badge */}
        <div className="plat-sidebar-badge">
          <span className="plat-sidebar-badge-dot" aria-hidden="true"/>
          <span>مالك المنصة — Platform Owner</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="روابط الإدارة">
          {NAV_ITEMS.map(({ href, labelAr, Icon }) => {
            const fullHref = `/${locale}${href}`;
            const isActive = pathname.includes(href);
            return (
              <Link
                key={href}
                href={fullHref}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                onClick={() => isOpen && onClose()}
              >
                <span className="sidebar-item-icon"><Icon /></span>
                <span className="sidebar-item-label">{labelAr}</span>
                {isActive && <span className="sidebar-item-dot" aria-hidden="true"/>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" aria-hidden="true">PO</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">أحمد القحطاني</span>
              <span className="sidebar-user-role">Platform Owner</span>
            </div>
          </div>
          <button type="button" className="sidebar-logout-btn" aria-label="تسجيل الخروج">
            <IcoLogout />
          </button>
        </div>

      </aside>

      {isOpen && (
        <div
          ref={overlayRef}
          className="sidebar-overlay"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
    </>
  );
}

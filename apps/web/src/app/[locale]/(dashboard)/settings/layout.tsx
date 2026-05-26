'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoGeneral() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function IcoTenant() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
    </svg>
  );
}

function IcoWorld() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
    </svg>
  );
}

function IcoCity() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

function IcoCurrency() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  );
}

function IcoPayment() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  );
}

function IcoCustomerStatus() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );
}

function IcoOrderStatus() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 000-2h-3z" clipRule="evenodd" />
    </svg>
  );
}

function IcoExpense() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function IcoCostCenter() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const SETTINGS_NAV = [
  { id: 'general',            labelAr: 'الإعدادات العامة',      href: '/settings/general',            icon: <IcoGeneral /> },
  { id: 'tenant-context',     labelAr: 'سياق المؤسسة',           href: '/settings/tenant-context',     icon: <IcoTenant /> },
  { id: 'countries',          labelAr: 'الدول',                  href: '/settings/countries',          icon: <IcoWorld /> },
  { id: 'cities',             labelAr: 'المدن',                  href: '/settings/cities',             icon: <IcoCity /> },
  { id: 'currencies',         labelAr: 'العملات',                href: '/settings/currencies',         icon: <IcoCurrency /> },
  { id: 'payment-methods',    labelAr: 'طرق الدفع',              href: '/settings/payment-methods',    icon: <IcoPayment /> },
  { id: 'customer-statuses',  labelAr: 'حالات العملاء',           href: '/settings/customer-statuses',  icon: <IcoCustomerStatus /> },
  { id: 'order-statuses',     labelAr: 'حالات الطلبات',           href: '/settings/order-statuses',     icon: <IcoOrderStatus /> },
  { id: 'expense-categories', labelAr: 'تصنيفات المصروفات',       href: '/settings/expense-categories', icon: <IcoExpense /> },
  { id: 'cost-centers',       labelAr: 'مراكز التكلفة',           href: '/settings/cost-centers',       icon: <IcoCostCenter /> },
];

// ── Layout ────────────────────────────────────────────────────────────────────

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'ar';

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">إعدادات النظام</h2>
          <p className="page-subtitle">الإعدادات الأساسية والبيانات المرجعية للمنظومة</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* ── Settings sidebar nav ── */}
        <div
          className="ofs-card"
          style={{
            padding: 'var(--space-2)',
            alignSelf: 'start',
            position: 'sticky',
            insetBlockStart: 'calc(var(--header-height) + var(--space-6))',
          }}
        >
          {SETTINGS_NAV.map((item) => {
            const active = pathname.includes(item.href);
            return (
              <Link
                key={item.id}
                href={`/${locale}${item.href}`}
                className={`settings-nav-item${active ? ' active' : ''}`}
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                {item.icon}
                <span>{item.labelAr}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Page content ── */}
        <div style={{ minBlockSize: 0 }}>
          {children}
        </div>
      </div>
    </>
  );
}

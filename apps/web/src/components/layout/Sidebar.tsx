'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mockUser, mockTenant } from '@/lib/mock-data';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  labelAr: string;
  href: string;
  badge?: string;
}

interface NavSection {
  id: string;
  labelAr: string;
  icon: React.ReactNode;
  items: NavItem[];
}

// ── Section Icons ─────────────────────────────────────────────────────────────

function IcoDashboard() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IcoSales() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 000-2h-3z" clipRule="evenodd" />
    </svg>
  );
}

function IcoPurchases() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  );
}

function IcoInventory() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function IcoCosts() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

function IcoAccounting() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  );
}

function IcoExpenses() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  );
}

function IcoHR() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
  );
}

function IcoReports() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function IcoAdmin() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function IcoCRM() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z" />
      <path fillRule="evenodd" d="M10 12a7 7 0 00-7 7h2a5 5 0 0110 0h2a7 7 0 00-7-7z" clipRule="evenodd" />
      <path d="M15.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 9.5a3.5 3.5 0 00-3.5-3.5 3.5 3.5 0 013.5 3.5v.5h1.5A1.5 1.5 0 0020 8.5v-.5a5 5 0 00-5-5" />
      <path fillRule="evenodd" d="M16 15a3 3 0 00-3-3h-6a3 3 0 00-3 3v1h12v-1z" clipRule="evenodd" />
    </svg>
  );
}

function IcoImport() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function IcoSettings() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function IcoChevron() {
  return (
    <svg className="sidebar-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function IcoLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5, flexShrink: 0 }}>
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
  );
}

// ── Navigation Data ───────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'crm',
    labelAr: 'إدارة علاقات العملاء',
    icon: <IcoCRM />,
    items: [
      { labelAr: 'لوحة CRM',           href: '/crm',                             },
      { labelAr: 'خط الصفقات',         href: '/crm/leads',                       badge: '12' },
      { labelAr: 'العملاء',            href: '/crm/customers',                   },
      { labelAr: 'الأنشطة',            href: '/crm/activities',                  },
      { labelAr: 'المهام',             href: '/crm/tasks',                       badge: '23' },
      { labelAr: 'مركز التوزيع',       href: '/crm/lead-distribution',           badge: '8'  },
      { labelAr: 'قواعد التوزيع',      href: '/crm/lead-distribution/rules',     },
      { labelAr: 'طابور التوزيع',      href: '/crm/lead-distribution/queue',     badge: '8'  },
      { labelAr: 'ملكية العملاء',      href: '/crm/lead-distribution/ownership', },
      { labelAr: 'سجل التعيينات',      href: '/crm/lead-distribution/history',   },
    ],
  },
  {
    id: 'sales',
    labelAr: 'المبيعات',
    icon: <IcoSales />,
    items: [
      { labelAr: 'لوحة المبيعات', href: '/sales' },
      { labelAr: 'العملاء المحتملون', href: '/sales/leads', badge: '18' },
      { labelAr: 'العملاء', href: '/sales/customers' },
      { labelAr: 'الطلبات', href: '/sales/orders', badge: '18' },
      { labelAr: 'عروض الأسعار', href: '/sales/quotes' },
      { labelAr: 'فواتير المبيعات', href: '/sales/invoices' },
      { labelAr: 'مرتجعات المبيعات', href: '/sales/returns' },
      { labelAr: 'إشعارات دائنة', href: '/sales/credit-notes' },
      { labelAr: 'التحصيلات', href: '/sales/payments' },
      { labelAr: 'كشوفات الحسابات', href: '/sales/statements' },
    ],
  },
  {
    id: 'purchases',
    labelAr: 'المشتريات',
    icon: <IcoPurchases />,
    items: [
      { labelAr: 'لوحة المشتريات',      href: '/purchases/dashboard' },
      { labelAr: 'الموردون',             href: '/purchases/vendors' },
      { labelAr: 'طلبات الشراء',         href: '/purchases/requests' },
      { labelAr: 'طلبات عروض الأسعار',  href: '/purchases/rfq' },
      { labelAr: 'أوامر الشراء',         href: '/purchases/orders' },
      { labelAr: 'فواتير المشتريات',     href: '/purchases/invoices' },
      { labelAr: 'مردودات المشتريات',    href: '/purchases/returns' },
      { labelAr: 'إشعارات مدينة',        href: '/purchases/debit-notes' },
      { labelAr: 'مدفوعات الموردين',     href: '/purchases/payments' },
      { labelAr: 'كشف حساب الموردين',   href: '/purchases/statements' },
    ],
  },
  {
    id: 'inventory',
    labelAr: 'المخزون',
    icon: <IcoInventory />,
    items: [
      { labelAr: 'المنتجات والخدمات', href: '/inventory/products' },
      { labelAr: 'التصنيفات', href: '/inventory/categories' },
      { labelAr: 'الوحدات', href: '/inventory/units' },
      { labelAr: 'المستودعات', href: '/inventory/warehouses' },
      { labelAr: 'التحويلات', href: '/inventory/transfers' },
      { labelAr: 'التسويات', href: '/inventory/adjustments' },
      { labelAr: 'الجرد', href: '/inventory/stocktake' },
    ],
  },
  {
    id: 'costs',
    labelAr: 'التكاليف',
    icon: <IcoCosts />,
    items: [
      { labelAr: 'مراكز التكلفة', href: '/costs/centers' },
      { labelAr: 'عناصر التكلفة', href: '/costs/elements' },
      { labelAr: 'تحميل التكاليف', href: '/costs/allocation' },
      { labelAr: 'توزيع التكاليف', href: '/costs/distribution' },
      { labelAr: 'تكلفة المنتجات', href: '/costs/products' },
      { labelAr: 'تكلفة الخدمات', href: '/costs/services' },
      { labelAr: 'تكلفة المخزون', href: '/costs/inventory' },
    ],
  },
  {
    id: 'accounting',
    labelAr: 'المحاسبة',
    icon: <IcoAccounting />,
    items: [
      { labelAr: 'شجرة الحسابات',           href: '/accounting/chart' },
      { labelAr: 'مراكز التكلفة',           href: '/accounting/cost-centers' },
      { labelAr: 'القيود اليومية',           href: '/accounting/journal' },
      { labelAr: 'الأستاذ العام',            href: '/accounting/ledger' },
      { labelAr: 'كشف الحساب',              href: '/accounting/account-statement' },
      { labelAr: 'ميزان المراجعة',           href: '/accounting/trial-balance' },
      { labelAr: 'قائمة الدخل',             href: '/accounting/income-statement' },
      { labelAr: 'قائمة المركز المالي',      href: '/accounting/balance-sheet' },
      { labelAr: 'التدفقات النقدية',         href: '/accounting/cash-flow' },
      { labelAr: 'الأصول الثابتة',          href: '/accounting/fixed-assets' },
      { labelAr: 'المصروفات',               href: '/accounting/expenses' },
      { labelAr: 'الإيصالات',               href: '/accounting/receipts' },
      { labelAr: 'المدفوعات',               href: '/accounting/payments' },
      { labelAr: 'الأطراف ذات الصلة',       href: '/accounting/related-parties' },
      { labelAr: 'مركز العمليات الواردة',   href: '/accounting/incoming' },
      { labelAr: 'مركز العمليات الصادرة',  href: '/accounting/outgoing' },
    ],
  },
  {
    id: 'expenses',
    labelAr: 'المصروفات',
    icon: <IcoExpenses />,
    items: [
      { labelAr: 'تسجيل المصروفات', href: '/expenses/register' },
      { labelAr: 'تصنيف المصروفات', href: '/expenses/categories' },
      { labelAr: 'المصروفات المقدمة', href: '/expenses/prepaid' },
      { labelAr: 'المصروفات المؤجلة', href: '/expenses/deferred' },
      { labelAr: 'جداول التوزيع', href: '/expenses/schedules' },
    ],
  },
  {
    id: 'hr',
    labelAr: 'الموارد البشرية',
    icon: <IcoHR />,
    items: [
      { labelAr: 'الموظفون', href: '/hr/employees' },
      { labelAr: 'الرواتب', href: '/hr/payroll' },
      { labelAr: 'قواعد العمولات', href: '/hr/commission-rules' },
      { labelAr: 'التارجت', href: '/hr/targets' },
      { labelAr: 'مؤشرات الأداء', href: '/hr/kpis' },
      { labelAr: 'مستحقات الموظفين', href: '/hr/entitlements' },
    ],
  },
  {
    id: 'reports',
    labelAr: 'التقارير',
    icon: <IcoReports />,
    items: [
      { labelAr: 'تقارير المبيعات', href: '/reports/sales' },
      { labelAr: 'تقارير العملاء', href: '/reports/customers' },
      { labelAr: 'تقارير التحصيل', href: '/reports/collections' },
      { labelAr: 'تقارير المشتريات', href: '/reports/purchases' },
      { labelAr: 'تقارير المخزون', href: '/reports/inventory' },
      { labelAr: 'تقارير التكاليف', href: '/reports/costs' },
      { labelAr: 'التقارير المالية', href: '/reports/financial' },
      { labelAr: 'تقارير الموارد البشرية', href: '/reports/hr' },
    ],
  },
  {
    id: 'import',
    labelAr: 'الاستيراد',
    icon: <IcoImport />,
    items: [
      { labelAr: 'تحصيلات وإيداعات',        href: '/import/collections' },
      { labelAr: 'مدفوعات',                   href: '/import/payments' },
      { labelAr: 'رواتب',                     href: '/import/payroll' },
      { labelAr: 'عملاء',                     href: '/import/customers' },
      { labelAr: 'موردون',                    href: '/import/vendors' },
      { labelAr: 'منتجات وخدمات',            href: '/import/products' },
      { labelAr: 'أرصدة افتتاحية — عملاء',  href: '/import/customer-opening-balances' },
      { labelAr: 'أرصدة افتتاحية — موردون', href: '/import/vendor-opening-balances' },
      { labelAr: 'قيود الافتتاح',             href: '/import/opening-entries' },
      { labelAr: 'سجل الاستيرادات',          href: '/import/history' },
    ],
  },
  {
    id: 'settings',
    labelAr: 'الإعدادات',
    icon: <IcoSettings />,
    items: [
      { labelAr: 'الإعدادات العامة',      href: '/settings/general' },
      { labelAr: 'سياق المؤسسة',           href: '/settings/tenant-context' },
      { labelAr: 'الدول',                  href: '/settings/countries' },
      { labelAr: 'المدن',                  href: '/settings/cities' },
      { labelAr: 'العملات',                href: '/settings/currencies' },
      { labelAr: 'طرق الدفع',              href: '/settings/payment-methods' },
      { labelAr: 'حالات العملاء',           href: '/settings/customer-statuses' },
      { labelAr: 'حالات الطلبات',           href: '/settings/order-statuses' },
      { labelAr: 'تصنيفات المصروفات',       href: '/settings/expense-categories' },
      { labelAr: 'مراكز التكلفة',           href: '/settings/cost-centers' },
    ],
  },
  {
    id: 'admin',
    labelAr: 'إدارة النظام',
    icon: <IcoAdmin />,
    items: [
      { labelAr: 'المستخدمون', href: '/admin/users' },
      { labelAr: 'الأدوار والصلاحيات', href: '/admin/roles' },
      { labelAr: 'البراندات', href: '/admin/brands' },
      { labelAr: 'الشركات', href: '/admin/companies' },
      { labelAr: 'الفروع', href: '/admin/branches' },
      { labelAr: 'إعدادات المبيعات', href: '/admin/settings/sales' },
      { labelAr: 'إعدادات المشتريات', href: '/admin/settings/purchases' },
      { labelAr: 'إعدادات المخزون', href: '/admin/settings/inventory' },
      { labelAr: 'إعدادات المحاسبة', href: '/admin/settings/accounting' },
      { labelAr: 'إعدادات الموارد البشرية', href: '/admin/settings/hr' },
      { labelAr: 'إعدادات الاستيراد', href: '/admin/settings/import' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ofs-nav-expanded';

interface SidebarProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ locale, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [expanded, setExpanded] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  // Auto-expand the section that contains the active route on first load
  useEffect(() => {
    if (expanded !== null) return;
    const active = NAV_SECTIONS.find((s) =>
      s.items.some((i) => pathname.includes(i.href)),
    );
    if (active) {
      setExpanded(active.id);
      localStorage.setItem(STORAGE_KEY, active.id);
    }
  }, []);

  function toggleSection(id: string) {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  }

  function isItemActive(href: string) {
    return pathname.includes(href);
  }

  function buildHref(href: string) {
    return `/${locale}${href}`;
  }

  const dashboardActive = pathname.includes('/dashboard');

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isOpen ? ' show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`ofs-sidebar${isOpen ? ' open' : ''}`} aria-label="التنقل الرئيسي">

        {/* ── Logo ── */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" fill="white" fillOpacity="0.9" />
              <path d="M10 5L15 8V12L10 15L5 12V8L10 5Z" fill="white" fillOpacity="0.25" />
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">OFS</span>
            <span className="sidebar-logo-sub">{mockTenant.nameAr}</span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav" aria-label="القائمة الرئيسية">

          {/* Dashboard — standalone */}
          <div className="sidebar-standalone">
            <Link
              href={buildHref('/dashboard')}
              className={`sidebar-item${dashboardActive ? ' active' : ''}`}
              onClick={onClose}
              aria-current={dashboardActive ? 'page' : undefined}
            >
              <span className="sidebar-item-icon" aria-hidden="true">
                <IcoDashboard />
              </span>
              <span className="sidebar-item-label">لوحة التحكم</span>
            </Link>
          </div>

          {/* Accordion sections */}
          {NAV_SECTIONS.map((section) => {
            const sectionOpen = expanded === section.id;
            const hasActive = section.items.some((i) => isItemActive(i.href));

            return (
              <div key={section.id} className="sidebar-section">
                {/* Section header — accordion trigger */}
                <button
                  type="button"
                  className={[
                    'sidebar-section-header',
                    sectionOpen ? 'open' : '',
                    hasActive && !sectionOpen ? 'has-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={sectionOpen}
                >
                  <span className="sidebar-section-icon" aria-hidden="true">
                    {section.icon}
                  </span>
                  <span className="sidebar-section-label-text">{section.labelAr}</span>
                  <IcoChevron />
                </button>

                {/* Section body — collapsible */}
                <div
                  className={`sidebar-section-body${sectionOpen ? ' open' : ''}`}
                  aria-hidden={!sectionOpen}
                >
                  {section.items.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={buildHref(item.href)}
                        className={`sidebar-item sidebar-item-sub${active ? ' active' : ''}`}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        title={item.labelAr}
                      >
                        <span className="sidebar-item-dot" aria-hidden="true" />
                        <span className="sidebar-sub-label">{item.labelAr}</span>
                        {item.badge && (
                          <span className="sidebar-badge">{item.badge}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── User footer ── */}
        <div className="sidebar-footer">
          <div className="sidebar-user" role="button" tabIndex={0}>
            <div className="sidebar-avatar">{mockUser.initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{mockUser.nameAr}</div>
              <div className="sidebar-user-role">{mockUser.roleAr}</div>
            </div>
            <IcoLogout />
          </div>
        </div>

      </aside>
    </>
  );
}

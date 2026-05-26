'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

// Route title map — Arabic first.
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':                    'لوحة التحكم',
  // Sales
  '/sales/leads':                  'العملاء المحتملون',
  '/sales/customers':              'العملاء',
  '/sales/quotes':                 'عروض الأسعار',
  '/sales/invoices':               'فواتير المبيعات',
  '/sales/returns':                'مرتجعات المبيعات',
  '/sales/credit-notes':           'إشعارات دائنة',
  '/sales/payments':               'المدفوعات والتحصيل',
  '/sales/statements':             'كشف حساب العملاء',
  // Purchases
  '/purchases/vendors':            'الموردين',
  '/purchases/orders':             'طلبات الشراء',
  '/purchases/invoices':           'فواتير المشتريات',
  '/purchases/returns':            'مردودات المشتريات',
  '/purchases/debit-notes':        'إشعارات مدينة',
  '/purchases/payments':           'المدفوعات',
  '/purchases/statements':         'كشف حساب الموردين',
  // Inventory
  '/inventory/products':           'المنتجات والخدمات',
  '/inventory/categories':         'التصنيفات',
  '/inventory/units':              'الوحدات',
  '/inventory/warehouses':         'المستودعات',
  '/inventory/transfers':          'التحويلات',
  '/inventory/adjustments':        'التسويات',
  '/inventory/stocktake':          'الجرد',
  // Costs
  '/costs/centers':                'مراكز التكلفة',
  '/costs/elements':               'عناصر التكلفة',
  '/costs/allocation':             'تحميل التكاليف',
  '/costs/distribution':           'توزيع التكاليف',
  '/costs/products':               'تكلفة المنتجات',
  '/costs/services':               'تكلفة الخدمات',
  '/costs/inventory':              'تكلفة المخزون',
  // Accounting
  '/accounting/chart':             'شجرة الحسابات',
  '/accounting/cost-centers':      'مراكز التكلفة',
  '/accounting/journal':           'القيود اليومية',
  '/accounting/ledger':            'الأستاذ العام',
  '/accounting/account-statement': 'كشف الحساب',
  '/accounting/trial-balance':     'ميزان المراجعة',
  '/accounting/income-statement':  'قائمة الدخل',
  '/accounting/balance-sheet':     'قائمة المركز المالي',
  '/accounting/cash-flow':         'قائمة التدفقات النقدية',
  '/accounting/fixed-assets':      'الأصول الثابتة',
  '/accounting/expenses':          'المصروفات',
  '/accounting/receipts':          'الإيصالات',
  '/accounting/payments':          'المدفوعات',
  '/accounting/related-parties':   'الأطراف ذات الصلة',
  '/accounting/incoming':          'مركز العمليات الواردة',
  '/accounting/outgoing':          'مركز العمليات الصادرة',
  '/accounting/financial-statements': 'القوائم المالية',
  '/accounting/quick-ops':         'عمليات سريعة',
  '/accounting/partners':          'الشركاء والأطراف ذات العلاقة',
  // Expenses
  '/expenses/register':            'تسجيل المصروفات',
  '/expenses/categories':          'تصنيف المصروفات',
  '/expenses/prepaid':             'المصروفات المقدمة',
  '/expenses/deferred':            'المصروفات المؤجلة',
  '/expenses/schedules':           'جداول التوزيع',
  // HR
  '/hr/employees':                 'الموظفون',
  '/hr/payroll':                   'الرواتب',
  '/hr/commission-rules':          'قواعد العمولات',
  '/hr/targets':                   'التارجت',
  '/hr/kpis':                      'مؤشرات الأداء',
  '/hr/entitlements':              'مستحقات الموظفين',
  // Reports
  '/reports/sales':                'تقارير المبيعات',
  '/reports/customers':            'تقارير العملاء',
  '/reports/collections':          'تقارير التحصيل',
  '/reports/purchases':            'تقارير المشتريات',
  '/reports/inventory':            'تقارير المخزون',
  '/reports/costs':                'تقارير التكاليف',
  '/reports/financial':            'التقارير المالية',
  '/reports/hr':                   'تقارير الموارد البشرية',
  // Admin
  '/admin/users':                  'المستخدمون',
  '/admin/roles':                  'الأدوار والصلاحيات',
  '/admin/brands':                 'البراندات',
  '/admin/companies':              'الشركات',
  '/admin/branches':               'الفروع',
  '/admin/settings/sales':         'إعدادات المبيعات',
  '/admin/settings/purchases':     'إعدادات المشتريات',
  '/admin/settings/inventory':     'إعدادات المخزون',
  '/admin/settings/accounting':    'إعدادات المحاسبة',
  '/admin/settings/hr':            'إعدادات الموارد البشرية',
  '/admin/settings/import':        'إعدادات الاستيراد',
  // CRM Lead Distribution
  '/crm/lead-distribution/rules':     'قواعد التوزيع',
  '/crm/lead-distribution/queue':     'طابور التوزيع',
  '/crm/lead-distribution/ownership': 'ملكية العملاء المحتملين',
  '/crm/lead-distribution/history':   'سجل التعيينات',
  '/crm/lead-distribution':           'مركز توزيع العملاء المحتملين',
  // Legacy
  '/settings':                        'الإعدادات',
};

function resolveTitleAr(pathname: string): string {
  for (const [segment, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.endsWith(segment) || pathname.includes(`${segment}/`)) {
      return title;
    }
  }
  return 'لوحة التحكم';
}

interface DashboardShellProps {
  children: React.ReactNode;
  locale: string;
}

export default function DashboardShell({ children, locale }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const titleAr = resolveTitleAr(pathname);

  return (
    <div className="ofs-shell">
      <Sidebar
        locale={locale}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="ofs-body">
        <Header
          titleAr={titleAr}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="ofs-page" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

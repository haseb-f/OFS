import type { Metadata } from 'next';
import KpiCard from '@/components/dashboard/KpiCard';
import ActivityTable from '@/components/dashboard/ActivityTable';
import QuickActions from '@/components/dashboard/QuickActions';
import { kpiData, recentActivities, quickActions } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'لوحة التحكم',
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const today = new Date();
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const dateStr = `${dayNames[today.getDay()]}، ${today.getDate()} ${monthNamesAr[today.getMonth()]} ${today.getFullYear()}`;

  void locale;

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">لوحة التحكم</h2>
          <p className="page-subtitle">{dateStr} · مرحباً بك، محمد 👋</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-outline">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            تصدير التقرير
          </button>
          <button className="btn-cta">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            طلب جديد
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((item) => (
          <KpiCard key={item.id} item={item} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* Left column: Activity table */}
        <ActivityTable items={recentActivities} />

        {/* Right column: Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <QuickActions actions={quickActions} />

          {/* Mini stats card */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h2
              className="ofs-card-title"
              style={{ marginBlockEnd: 'var(--space-4)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)' }}
            >
              ملخص الشهر
            </h2>
            {[
              { labelAr: 'إجمالي الإيرادات', value: '312,400 ر.س', color: 'var(--color-status-active)' },
              { labelAr: 'الطلبات المكتملة', value: '184 طلب', color: 'var(--color-status-completed)' },
              { labelAr: 'عملاء جدد', value: '28 عميل', color: 'var(--color-status-pending)' },
              { labelAr: 'طلبات ملغاة', value: '6 طلبات', color: 'var(--color-status-rejected)' },
            ].map((stat) => (
              <div
                key={stat.labelAr}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBlock: 'var(--space-2)',
                  borderBlockEnd: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  {stat.labelAr}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: stat.color }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

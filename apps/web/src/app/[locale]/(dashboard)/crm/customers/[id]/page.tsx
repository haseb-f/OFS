'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCrmCustomers,
  mockCrmActivities,
  mockCrmTasks,
  CRM_CUSTOMER_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '@/lib/crm-mock-data';
import { fNum } from '@/lib/format';

type TabId = 'overview' | 'orders' | 'invoices' | 'collections' | 'activities' | 'tasks' | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',    label: 'نظرة عامة' },
  { id: 'orders',      label: 'الطلبات' },
  { id: 'invoices',    label: 'الفواتير' },
  { id: 'collections', label: 'التحصيلات' },
  { id: 'activities',  label: 'الأنشطة' },
  { id: 'tasks',       label: 'المهام' },
  { id: 'notes',       label: 'الملاحظات' },
];

const STATUS_COLORS = {
  active:   { bg: '#f0fdf4', color: '#15803d' },
  prospect: { bg: '#eff6ff', color: '#1d4ed8' },
  inactive: { bg: '#f1f5f9', color: '#64748b' },
  churned:  { bg: '#fef2f2', color: '#b91c1c' },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  low:      { bg: '#f1f5f9', color: '#64748b' },
  medium:   { bg: '#fffbeb', color: '#b45309' },
  high:     { bg: '#fff7ed', color: '#c2410c' },
  critical: { bg: '#fef2f2', color: '#b91c1c' },
};

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    call:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6z"/></svg>,
    meeting:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    whatsapp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    email:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    visit:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    followup: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return <>{icons[type] ?? icons.call}</>;
}

const mockOrders = [
  { id: 'ORD-001', date: '20 May 2026', amount: 38500, status: 'مكتمل' },
  { id: 'ORD-002', date: '12 Apr 2026', amount: 21000, status: 'مكتمل' },
  { id: 'ORD-003', date: '03 Mar 2026', amount: 45000, status: 'مُلغى' },
];

const mockInvoices = [
  { id: 'INV-001', date: '20 May 2026', amount: 38500, status: 'مدفوعة' },
  { id: 'INV-002', date: '12 Apr 2026', amount: 21000, status: 'مدفوعة' },
];

const mockCollections = [
  { id: 'COL-001', date: '22 May 2026', amount: 38500, method: 'تحويل بنكي' },
  { id: 'COL-002', date: '14 Apr 2026', amount: 21000, method: 'نقد' },
];

export default function CustomerProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const customerId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const customer = mockCrmCustomers.find(c => c.id === customerId) ?? mockCrmCustomers[0];
  const activities = mockCrmActivities.filter(a => a.customerId === customer.id).slice(0, 5);
  const tasks = mockCrmTasks.filter(t => t.customerId === customer.id);
  const statusColors = STATUS_COLORS[customer.status] ?? STATUS_COLORS.inactive;

  const mockNotes = [
    { id: 'N1', author: customer.assignedUser, date: '20 May 2026', text: 'العميل يرغب في توسيع الطلبات الشهر القادم، تم إبلاغ الفريق المختص.' },
  ];

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href={`/${locale}/crm/customers`} className="btn-ghost" style={{ padding: '8px', borderRadius: 'var(--radius-md)' }} title="رجوع">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
          <div>
            <h2 className="page-title">{customer.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBlockStart: 4 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>{customer.code}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                paddingInline: 'var(--space-2)', paddingBlock: '2px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                background: statusColors.bg, color: statusColors.color,
              }}>
                {CRM_CUSTOMER_STATUS_LABELS[customer.status]}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            نشاط جديد
          </button>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Profile card */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
            <div style={{
              inlineSize: 64, blockSize: 64, borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)',
              margin: '0 auto var(--space-3)',
            }}>
              {customer.name.charAt(0)}
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
              {customer.name}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockStart: 4 }}>
              {customer.code}
            </div>
            <div style={{ marginBlockStart: 'var(--space-3)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', background: statusColors.bg, color: statusColors.color }}>
                {CRM_CUSTOMER_STATUS_LABELS[customer.status]}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              {[
                { label: 'إجمالي الطلبات', value: String(customer.totalOrders) },
                { label: 'إجمالي الإيرادات', value: `${fNum(customer.totalRevenue, 0)} ر.س` },
                { label: 'عدد الأنشطة', value: String(activities.length) },
                { label: 'المهام المفتوحة', value: String(tasks.filter(t => t.status === 'open' || t.status === 'in_progress').length) },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  textAlign: 'center',
                  border: '1px solid var(--color-border-subtle)',
                }}>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockStart: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-4)' }}>
              بيانات التواصل
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0, marginBlockStart: 2 }} aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6z"/>
                </svg>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', direction: 'ltr' }}>{customer.phone}</span>
              </div>
              {customer.email && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0, marginBlockStart: 2 }} aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', direction: 'ltr', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0, marginBlockStart: 2 }} aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{customer.city}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0, marginBlockStart: 2 }} aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{customer.assignedUser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 0, borderBlockEnd: '2px solid var(--color-border)', marginBlockEnd: 'var(--space-5)', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                paddingInline: 'var(--space-4)', paddingBlock: 'var(--space-3)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === tab.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBlockEnd: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBlockEnd: -2, whiteSpace: 'nowrap',
                transition: 'color var(--transition-fast)',
                fontFamily: 'inherit',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-4)' }}>
                  ملخص الحساب
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                  {[
                    { label: 'إجمالي الإيرادات', value: `${fNum(customer.totalRevenue, 0)} ر.س`, color: 'var(--color-primary)' },
                    { label: 'عدد الطلبات', value: String(customer.totalOrders) },
                    { label: 'آخر نشاط', value: customer.lastActivity },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockEnd: 4 }}>{stat.label}</div>
                      <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: stat.color ?? 'var(--color-text)' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activities inline */}
              <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>آخر الأنشطة</h4>
                  <button onClick={() => setActiveTab('activities')} className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)' }}>
                    عرض الكل
                  </button>
                </div>
                {activities.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingBlock: 'var(--space-8)', color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-sm)' }}>
                    لا توجد أنشطة
                  </div>
                ) : activities.map(act => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingBlock: 'var(--space-2)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
                    <div style={{
                      inlineSize: 30, blockSize: 30, borderRadius: 'var(--radius-md)', flexShrink: 0,
                      background: act.status === 'completed' ? '#f0fdf4' : '#eff6ff',
                      color: act.status === 'completed' ? '#16a34a' : '#1d4ed8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ActivityIcon type={act.type} />
                    </div>
                    <div style={{ flex: 1, minInlineSize: 0 }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.subject}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{ACTIVITY_TYPE_LABELS[act.type]} · {act.date}</div>
                    </div>
                    <span style={{
                      display: 'inline-flex', paddingInline: 'var(--space-2)', paddingBlock: '2px',
                      borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      background: act.status === 'completed' ? '#f0fdf4' : act.status === 'scheduled' ? '#eff6ff' : '#fef2f2',
                      color: act.status === 'completed' ? '#16a34a' : act.status === 'scheduled' ? '#1d4ed8' : '#b91c1c',
                    }}>
                      {ACTIVITY_STATUS_LABELS[act.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>الطلبات ({mockOrders.length})</h4>
              </div>
              <div className="ofs-table-wrap">
                <table className="ofs-table">
                  <thead><tr><th>رقم الطلب</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {mockOrders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{o.id}</td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{o.date}</td>
                        <td className="num" style={{ fontSize: 'var(--font-size-sm)' }}>{fNum(o.amount, 0)} ر.س</td>
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: o.status === 'مكتمل' ? '#15803d' : '#b91c1c', fontWeight: 'var(--font-weight-semibold)' }}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices */}
          {activeTab === 'invoices' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>الفواتير ({mockInvoices.length})</h4>
              </div>
              <div className="ofs-table-wrap">
                <table className="ofs-table">
                  <thead><tr><th>رقم الفاتورة</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {mockInvoices.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{inv.id}</td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{inv.date}</td>
                        <td className="num" style={{ fontSize: 'var(--font-size-sm)' }}>{fNum(inv.amount, 0)} ر.س</td>
                        <td><span style={{ fontSize: 'var(--font-size-xs)', color: '#15803d', fontWeight: 'var(--font-weight-semibold)' }}>{inv.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Collections */}
          {activeTab === 'collections' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>التحصيلات ({mockCollections.length})</h4>
              </div>
              <div className="ofs-table-wrap">
                <table className="ofs-table">
                  <thead><tr><th>رقم التحصيل</th><th>التاريخ</th><th>المبلغ</th><th>طريقة الدفع</th></tr></thead>
                  <tbody>
                    {mockCollections.map(col => (
                      <tr key={col.id}>
                        <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{col.id}</td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{col.date}</td>
                        <td className="num" style={{ fontSize: 'var(--font-size-sm)' }}>{fNum(col.amount, 0)} ر.س</td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{col.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activities */}
          {activeTab === 'activities' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>الأنشطة ({activities.length})</h4>
                <button className="btn-cta" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  نشاط جديد
                </button>
              </div>
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-10)', color: 'var(--color-text-subtle)' }}>لا توجد أنشطة</div>
              ) : activities.map(act => {
                const sc = { completed: { bg: '#f0fdf4', color: '#16a34a', iconBg: '#dcfce7' }, scheduled: { bg: '#eff6ff', color: '#1d4ed8', iconBg: '#dbeafe' }, cancelled: { bg: '#fef2f2', color: '#b91c1c', iconBg: '#fee2e2' } }[act.status];
                return (
                  <div key={act.id} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', marginBlockEnd: 'var(--space-3)' }}>
                    <div style={{ inlineSize: 36, blockSize: 36, borderRadius: 'var(--radius-md)', background: sc.iconBg, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ActivityIcon type={act.type} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBlockEnd: 4 }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{act.subject}</span>
                        <span style={{ display: 'inline-flex', paddingInline: 'var(--space-2)', paddingBlock: '2px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: sc.bg, color: sc.color }}>
                          {ACTIVITY_STATUS_LABELS[act.status]}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {ACTIVITY_TYPE_LABELS[act.type]}{act.duration && ` · ${act.duration} دقيقة`} · {act.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>المهام ({tasks.length})</h4>
                <button className="btn-cta" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  مهمة جديدة
                </button>
              </div>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-10)', color: 'var(--color-text-subtle)' }}>لا توجد مهام</div>
              ) : (
                <div className="ofs-table-wrap">
                  <table className="ofs-table">
                    <thead><tr><th>المهمة</th><th>الأولوية</th><th>تاريخ الاستحقاق</th><th>الحالة</th></tr></thead>
                    <tbody>
                      {tasks.map(task => {
                        const pc = PRIORITY_COLORS[task.priority];
                        return (
                          <tr key={task.id}>
                            <td>
                              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>{task.name}</div>
                              {task.description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{task.description}</div>}
                            </td>
                            <td><span style={{ display: 'inline-flex', paddingInline: 'var(--space-2)', paddingBlock: '2px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: pc.bg, color: pc.color }}>{TASK_PRIORITY_LABELS[task.priority]}</span></td>
                            <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{task.dueDate}</td>
                            <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{TASK_STATUS_LABELS[task.status]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>الملاحظات</h4>
                <button className="btn-cta" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  إضافة ملاحظة
                </button>
              </div>
              {mockNotes.map(note => (
                <div key={note.id} style={{ padding: 'var(--space-4)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', marginBlockEnd: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBlockEnd: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{note.author}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>{note.date}</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

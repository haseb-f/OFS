'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  purchaseKpis,
  mockPurchaseOrders,
  mockPurchaseInvoices,
  mockVendorPayments,
  mockVendors,
} from '@/lib/purchasing-mock-data';
import { PoBadge, PiBadge, VpBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';

function KpiIcon({ id }: { id: string }) {
  if (id === 'total-pos') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
  if (id === 'pending-invoices') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
  if (id === 'payments-due') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  );
}

const RECENT_PO_COUNT = 6;
const RECENT_INVOICE_COUNT = 5;

export default function PurchaseDashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'payments'>('pos');

  const recentPos     = [...mockPurchaseOrders].sort((a, b) => b.orderDateIso.localeCompare(a.orderDateIso)).slice(0, RECENT_PO_COUNT);
  const recentInvoices = [...mockPurchaseInvoices].sort((a, b) => b.invoiceDateIso.localeCompare(a.invoiceDateIso)).slice(0, RECENT_INVOICE_COUNT);
  const recentPayments = [...mockVendorPayments].sort((a, b) => b.paymentDateIso.localeCompare(a.paymentDateIso)).slice(0, 6);

  const topVendors = [...mockVendors]
    .filter(v => v.status === 'active')
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, 5);

  const overdueInvoices = mockPurchaseInvoices.filter(
    pi => pi.status === 'approved' && pi.dueDateIso < '2026-05-25',
  );

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">لوحة المشتريات</h2>
          <p className="page-subtitle">نظرة عامة على أنشطة المشتريات</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير التقرير
          </button>
          <Link href={`/${locale}/purchases/orders`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            أمر شراء جديد
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {purchaseKpis.map(kpi => (
          <div key={kpi.id} className="kpi-card">
            <div className="kpi-card-header">
              <div>
                <div className="kpi-card-label">{kpi.labelAr}</div>
                <div className="kpi-card-value">{kpi.value}</div>
              </div>
              <div className="kpi-card-icon" style={{ background: kpi.iconBg }}>
                <span style={{ color: kpi.iconColor }}><KpiIcon id={kpi.id} /></span>
              </div>
            </div>
            <div className={`kpi-card-trend ${kpi.trendDirection === 'up' ? 'up' : 'down'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {kpi.trendDirection === 'up'
                  ? <polyline points="18 15 12 9 6 15"/>
                  : <polyline points="6 9 12 15 18 9"/>}
              </svg>
              <span>{kpi.trend}</span>
              <span style={{ color: 'var(--color-text-subtle)', fontWeight: 'var(--font-weight-regular)' }}>
                {kpi.trendLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: 'var(--radius-lg)', marginBlockEnd: 'var(--space-5)',
          fontSize: 'var(--font-size-sm)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ color: '#c2410c', fontWeight: 'var(--font-weight-semibold)' }}>
            {overdueInvoices.length} فاتورة متأخرة
          </span>
          <span style={{ color: '#b45309' }}>تجاوزت تاريخ الاستحقاق</span>
          <Link href={`/${locale}/purchases/invoices`} className="btn-ghost" style={{ marginInlineStart: 'auto', fontSize: 'var(--font-size-sm)', padding: '4px 12px' }}>
            عرض الفواتير
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-5)', alignItems: 'start' }}>

        {/* Left: Recent activity tabs */}
        <div className="ofs-card">
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">النشاط الأخير</h3>
            <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--color-surface-overlay)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              {(['pos', 'invoices', 'payments'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)',
                    fontWeight: activeTab === tab ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    background: activeTab === tab ? 'var(--color-surface)' : 'none',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: activeTab === tab ? 'var(--shadow-xs)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {tab === 'pos' ? 'أوامر الشراء' : tab === 'invoices' ? 'الفواتير' : 'المدفوعات'}
                </button>
              ))}
            </div>
          </div>

          {/* POs tab */}
          {activeTab === 'pos' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="ofs-table">
                <thead>
                  <tr>
                    <th>رقم الأمر</th>
                    <th>المورد</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPos.map(po => (
                    <tr key={po.id}>
                      <td>
                        <Link href={`/${locale}/purchases/orders`} className="lead-order-link">{po.poNumber}</Link>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>{po.vendorName}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                        {fNum(po.totalAmount)} {po.currency}
                      </td>
                      <td><PoBadge status={po.status} /></td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{po.orderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoices tab */}
          {activeTab === 'invoices' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="ofs-table">
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>المورد</th>
                    <th>الإجمالي</th>
                    <th>الاستحقاق</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map(pi => (
                    <tr key={pi.id}>
                      <td>
                        <div>
                          <Link href={`/${locale}/purchases/invoices`} className="lead-order-link">{pi.invoiceNumber}</Link>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{pi.vendorInvoiceRef}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>{pi.vendorName}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                        {fNum(pi.totalAmount)} {pi.currency}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{pi.dueDate}</td>
                      <td><PiBadge status={pi.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments tab */}
          {activeTab === 'payments' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="ofs-table">
                <thead>
                  <tr>
                    <th>رقم الدفعة</th>
                    <th>المورد</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map(vp => (
                    <tr key={vp.id}>
                      <td>
                        <Link href={`/${locale}/purchases/payments`} className="lead-order-link">{vp.paymentNumber}</Link>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>{vp.vendorName}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                        {fNum(vp.amount)} {vp.currency}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>{vp.paymentMethod}</td>
                      <td><VpBadge status={vp.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href={`/${locale}/purchases/${activeTab === 'pos' ? 'orders' : activeTab === 'invoices' ? 'invoices' : 'payments'}`}
              className="btn-ghost"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              عرض الكل
            </Link>
          </div>
        </div>

        {/* Right: Quick actions + Top vendors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Quick actions */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="ofs-card-title" style={{ marginBlockEnd: 'var(--space-4)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)' }}>
              إجراءات سريعة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {[
                { labelAr: 'طلب شراء جديد', href: `/purchases/requests` },
                { labelAr: 'طلب عرض سعر', href: `/purchases/rfq` },
                { labelAr: 'أمر شراء جديد', href: `/purchases/orders` },
                { labelAr: 'تسجيل فاتورة', href: `/purchases/invoices` },
                { labelAr: 'تسجيل دفعة', href: `/purchases/payments` },
                { labelAr: 'إضافة مورد', href: `/purchases/vendors` },
              ].map(a => (
                <Link key={a.labelAr} href={`/${locale}${a.href}`} className="quick-link-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  {a.labelAr}
                </Link>
              ))}
            </div>
          </div>

          {/* Top vendors */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="ofs-card-title" style={{ marginBlockEnd: 'var(--space-4)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)' }}>
              أكبر الموردين
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topVendors.map((v, i) => (
                <div key={v.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  paddingBlock: 'var(--space-2)',
                  borderBlockEnd: i < topVendors.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    inlineSize: 28, blockSize: 28, borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minInlineSize: 0 }}>
                    <Link href={`/${locale}/purchases/vendors`} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.nameAr}
                    </Link>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {fNum(v.totalPurchases)} ر.س
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBlockStart: 'var(--space-3)' }}>
              <Link href={`/${locale}/purchases/vendors`} className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', inlineSize: '100%', justifyContent: 'center' }}>
                عرض كل الموردين
              </Link>
            </div>
          </div>

          {/* Monthly summary */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="ofs-card-title" style={{ marginBlockEnd: 'var(--space-4)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)' }}>
              ملخص مايو 2026
            </h3>
            {[
              { labelAr: 'أوامر شراء جديدة', value: `${mockPurchaseOrders.length} أمر`, color: 'var(--color-primary)' },
              { labelAr: 'فواتير مستلمة', value: `${mockPurchaseInvoices.filter(p => p.status !== 'cancelled').length} فاتورة`, color: 'var(--color-status-completed)' },
              { labelAr: 'مدفوعات منجزة', value: `${mockVendorPayments.filter(p => p.status === 'paid').length} دفعة`, color: 'var(--color-status-pending)' },
              { labelAr: 'مردودات', value: `${mockVendorPayments.filter(p => p.status === 'cancelled').length} مرتجع`, color: 'var(--color-status-rejected)' },
            ].map(stat => (
              <div key={stat.labelAr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 'var(--space-2)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{stat.labelAr}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

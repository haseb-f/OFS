'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockSalesInvoices, mockSalesCollections, mockQuotations, mockSalesReturns, mockCreditNotes,
} from '@/lib/mock-data';
import { fNum, fDate } from '@/lib/format';
import InvoiceStatusBadge from '@/components/sales/InvoiceStatusBadge';

function IcoTrend({ up }: { up: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {up ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /> : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />}
    </svg>
  );
}

export default function SalesDashboardPage() {
  const { locale } = useParams<{ locale: string }>();

  const totalRevenue   = mockSalesInvoices.filter(i => i.status === 'posted').reduce((s, i) => s + i.totalAmount, 0);
  const outstanding    = mockSalesInvoices.filter(i => i.status === 'posted').reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);
  const monthInvoices  = mockSalesInvoices.filter(i => i.issueDateIso >= '2026-05-01').length;
  const monthCollected = mockSalesCollections.filter(c => c.collectionDateIso >= '2026-05-01').reduce((s, c) => s + c.amount, 0);
  const overdueInvoices = mockSalesInvoices.filter(i => i.status === 'posted' && i.paidAmount < i.totalAmount && i.dueDateIso < '2026-05-25').length;

  const recentInvoices = [...mockSalesInvoices].sort((a, b) => b.issueDateIso.localeCompare(a.issueDateIso)).slice(0, 8);
  const pendingQuotes  = mockQuotations.filter(q => q.status === 'sent').length;
  const openReturns    = mockSalesReturns.filter(r => r.status === 'draft' || r.status === 'approved').length;
  const openCN         = mockCreditNotes.filter(c => c.status === 'draft' || c.status === 'approved').length;

  const kpis = [
    {
      label: 'إجمالي الإيرادات',
      value: fNum(totalRevenue),
      unit: 'SAR',
      trend: '+18.4%',
      up: true,
      note: 'مقارنة بالشهر الماضي',
      color: '#15803d',
      bg: '#f0fdf4',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      label: 'المبالغ المستحقة',
      value: fNum(outstanding),
      unit: 'SAR',
      trend: '-5.2%',
      up: false,
      note: 'مقارنة بالشهر الماضي',
      color: '#b45309',
      bg: '#fffbeb',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'فواتير الشهر',
      value: String(monthInvoices),
      unit: 'فاتورة',
      trend: '+3',
      up: true,
      note: 'مقارنة بالشهر الماضي',
      color: '#1d4ed8',
      bg: '#eff6ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    {
      label: 'تحصيلات الشهر',
      value: fNum(monthCollected),
      unit: 'SAR',
      trend: '+22.1%',
      up: true,
      note: 'مقارنة بالشهر الماضي',
      color: '#15803d',
      bg: '#f0fdf4',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
    {
      label: 'فواتير متأخرة',
      value: String(overdueInvoices),
      unit: 'فاتورة',
      trend: overdueInvoices > 0 ? `${overdueInvoices} متأخرة` : 'لا يوجد',
      up: false,
      note: 'تجاوزت تاريخ الاستحقاق',
      color: '#b91c1c',
      bg: '#fef2f2',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">لوحة المبيعات</h2>
          <p className="page-subtitle">نظرة عامة على أداء المبيعات</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href={`/${locale}/sales/invoices`} className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            الفواتير
          </Link>
          <Link href={`/${locale}/sales/invoices`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            فاتورة جديدة
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="sales-kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-card-header">
              <div>
                <p className="kpi-card-label">{k.label}</p>
                <p className="kpi-card-value" style={{ color: 'var(--color-text)', fontSize: '1.5rem' }}>
                  {k.value}
                  {k.unit && (
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', marginInlineStart: 6 }}>
                      {k.unit}
                    </span>
                  )}
                </p>
              </div>
              <div className="kpi-card-icon" style={{ background: k.bg, color: k.color }}>
                {k.icon}
              </div>
            </div>
            <div className={`kpi-card-trend ${k.up ? 'up' : 'down'}`}>
              <IcoTrend up={k.up} />
              <span>{k.trend}</span>
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>{k.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="sales-dashboard-grid">

        {/* Recent Invoices */}
        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="ofs-card-header">
            <span className="ofs-card-title">آخر الفواتير</span>
            <Link href={`/${locale}/sales/invoices`} className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }}>
              عرض الكل
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>العميل</th>
                  <th>المصدر</th>
                  <th style={{ textAlign: 'end' }}>الإجمالي</th>
                  <th style={{ textAlign: 'end' }}>المتبقي</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => {
                  const remaining = inv.totalAmount - inv.paidAmount;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', display: 'inline-block' }}>
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.customerName}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          inv.source === 'order_based' ? 'invoice-source-order' :
                          inv.source === 'collection_based' ? 'invoice-source-collection' :
                          'invoice-source-manual'
                        }`} style={{ fontSize: '0.625rem' }}>
                          {inv.source === 'order_based' ? 'طلب' : inv.source === 'collection_based' ? 'تحصيل' : 'يدوي'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'end', fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {fNum(inv.totalAmount)} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{inv.currency}</span>
                      </td>
                      <td style={{ textAlign: 'end', fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {remaining === 0
                          ? <span style={{ color: 'var(--color-status-active)' }}>مُسوَّى ✓</span>
                          : <span style={{ color: '#b45309' }}>{fNum(remaining)}</span>
                        }
                      </td>
                      <td><InvoiceStatusBadge status={inv.status} /></td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {fDate(inv.issueDateIso, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Quick actions */}
          <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
            <p className="ofs-card-title" style={{ marginBlockEnd: 'var(--space-3)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
              إجراءات سريعة
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {[
                { label: 'فاتورة جديدة', href: `/sales/invoices`, color: '#15803d', bg: '#f0fdf4' },
                { label: 'عرض سعر جديد', href: `/sales/quotes`, color: '#1d4ed8', bg: '#eff6ff' },
                { label: 'تسجيل تحصيل', href: `/sales/payments`, color: '#6d28d9', bg: '#f5f3ff' },
                { label: 'مرتجع مبيعات', href: `/sales/returns`, color: '#b45309', bg: '#fffbeb' },
                { label: 'إشعار دائن', href: `/sales/credit-notes`, color: '#b91c1c', bg: '#fef2f2' },
              ].map(a => (
                <Link key={a.href} href={`/${locale}${a.href}`} className="quick-link-btn" style={{ gap: 'var(--space-3)' }}>
                  <span style={{ inlineSize: 28, blockSize: 28, borderRadius: 'var(--radius-md)', background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Pipeline summary */}
          <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
            <p className="ofs-card-title" style={{ marginBlockEnd: 'var(--space-3)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
              ملخص المتابعة
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'عروض أسعار مُرسلة', value: pendingQuotes, color: '#1d4ed8', href: `/sales/quotes` },
                { label: 'مرتجعات مفتوحة', value: openReturns, color: '#b45309', href: `/sales/returns` },
                { label: 'إشعارات دائنة معلقة', value: openCN, color: '#b91c1c', href: `/sales/credit-notes` },
                { label: 'تحصيلات غير مرتبطة', value: mockSalesCollections.filter(c => c.matchingStatus === 'unmatched').length, color: '#475569', href: `/sales/payments` },
              ].map(item => (
                <Link key={item.href} href={`/${locale}${item.href}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                    {item.value}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
            <p className="ofs-card-title" style={{ marginBlockEnd: 'var(--space-3)', paddingBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
              تقارير وكشوفات
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {[
                { label: 'كشف حساب العملاء', href: `/sales/statements` },
                { label: 'طلبات المبيعات', href: `/sales/orders` },
                { label: 'سجل التحصيلات', href: `/sales/payments` },
              ].map(l => (
                <Link key={l.href} href={`/${locale}${l.href}`} className="quick-link-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

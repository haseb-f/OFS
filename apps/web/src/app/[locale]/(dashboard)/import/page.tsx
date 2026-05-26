'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockImports,
  IMPORT_SOURCE_LABELS,
  IMPORT_TARGET_LABELS,
} from '@/lib/mock-data';
import ImportStatusBadge from '@/components/import/ImportStatusBadge';
import TableToolbar from '@/components/ui/TableToolbar';
import { fNum } from '@/lib/format';

export default function ImportDashboardPage() {
  const { locale } = useParams<{ locale: string }>();

  const recent   = [...mockImports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const total    = mockImports.length;
  const thisMonth = mockImports.filter(i => i.createdAt.includes('مايو 2026')).length;
  const completed = mockImports.filter(i => i.status === 'completed');
  const successRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const totalRecords = mockImports.reduce((s, i) => s + i.successRows, 0);

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز الاستيراد</h2>
          <p className="page-subtitle">استيراد البيانات من Google Sheets و Excel و CSV</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href={`/${locale}/import/history`} className="btn-outline" style={{ textDecoration: 'none' }}>
            سجل الاستيرادات
          </Link>
          <Link href={`/${locale}/import/new`} className="btn-cta" style={{ textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            استيراد جديد
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="customer-stats-row ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>إجمالي الاستيرادات</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
        </div>
        <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>هذا الشهر</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{thisMonth}</span>
        </div>
        <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>معدل النجاح</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>{successRate}%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-5)' }}>

        {/* Recent imports table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>آخر الاستيرادات</h3>
            <Link href={`/${locale}/import/history`} className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
              عرض الكل
            </Link>
          </div>
          <div className="ofs-card" style={{ overflow: 'hidden' }}>
            <TableToolbar
              onRefresh={() => { /* mock */ }}
              onExport={() => { /* mock */ }}
            />
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>المصدر</th>
                  <th>الوجهة</th>
                  <th>الحالة</th>
                  <th>السجلات</th>
                  <th>التاريخ</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(imp => (
                  <tr key={imp.id}>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        {imp.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace' }}>
                        {IMPORT_SOURCE_LABELS[imp.source]}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{IMPORT_TARGET_LABELS[imp.target]}</td>
                    <td><ImportStatusBadge status={imp.status} /></td>
                    <td style={{ fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums' }}>
                      {imp.status === 'draft' ? '—' : (
                        <span>
                          <span style={{ color: 'var(--color-status-active)' }}>{imp.successRows}</span>
                          {imp.errorRows > 0 && <span style={{ color: '#b91c1c' }}> / {imp.errorRows} خطأ</span>}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {imp.createdAt}
                    </td>
                    <td>
                      <Link
                        href={`/${locale}/import/${imp.id}`}
                        className="btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: quick actions + guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Quick start */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">بدء استيراد جديد</h3></div>
            <div className="ofs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {([
                { label: 'Excel', icon: '📗', desc: 'ملفات .xlsx و .xls', src: 'excel' },
                { label: 'Google Sheets', icon: '🟢', desc: 'استيراد من جدول مشارك', src: 'google_sheets' },
                { label: 'CSV', icon: '📄', desc: 'ملفات .csv نصية', src: 'csv' },
              ]).map(s => (
                <Link
                  key={s.src}
                  href={`/${locale}/import/new`}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'inherit', transition: 'border-color var(--transition-fast), background var(--transition-fast)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">إحصائيات</h3></div>
            <div className="ofs-card-body">
              <div className="detail-row">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>إجمالي السجلات المستوردة</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{fNum(totalRecords, 0)}</span>
              </div>
              <div className="detail-row">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>عمليات مكتملة</span>
                <span style={{ color: 'var(--color-status-active)', fontWeight: 'var(--font-weight-semibold)' }}>{completed.length}</span>
              </div>
              <div className="detail-row">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>جزئي أو فاشل</span>
                <span style={{ color: '#b91c1c' }}>{mockImports.filter(i => i.status === 'failed' || i.status === 'partial').length}</span>
              </div>
              <div className="detail-row">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>تنسيق التاريخ المقبول</span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', background: 'var(--color-surface-raised)', padding: '2px 6px', borderRadius: 4 }}>DD MMM YYYY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

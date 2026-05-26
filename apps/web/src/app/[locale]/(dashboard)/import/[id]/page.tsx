import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  mockImports,
  IMPORT_SOURCE_LABELS,
  IMPORT_TARGET_LABELS,
} from '@/lib/mock-data';
import ImportStatusBadge from '@/components/import/ImportStatusBadge';
import type { ReactNode } from 'react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imp = mockImports.find(i => i.id === id);
  return { title: imp ? `${imp.name} — استيراد` : 'تفاصيل الاستيراد' };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="detail-row">
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{value}</span>
    </div>
  );
}

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const imp = mockImports.find(i => i.id === id);
  if (!imp) notFound();

  const successPct = imp.totalRows > 0 ? Math.round((imp.successRows / imp.totalRows) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href={`/${locale}/import/history`} className="btn-ghost" style={{ padding: '6px 10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h2 className="page-title">{imp.name}</h2>
            <p className="page-subtitle">{imp.id} · {imp.createdAt}</p>
          </div>
        </div>
        <ImportStatusBadge status={imp.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-5)' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Stats row */}
          <div className="import-result-stats">
            {([
              { label: 'إجمالي الصفوف', val: imp.totalRows, color: undefined },
              { label: 'ناجح',           val: imp.successRows, color: 'var(--color-status-active)' as string | undefined },
              { label: 'أخطاء',          val: imp.errorRows,   color: imp.errorRows > 0 ? '#b91c1c' : undefined },
              { label: 'تحذيرات',        val: imp.warningRows, color: imp.warningRows > 0 ? '#b45309' : undefined },
            ]).map(stat => (
              <div
                key={stat.label}
                className="ofs-card"
                style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}
              >
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stat.label}</span>
                <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
                  {imp.status === 'draft' ? '—' : stat.val}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {imp.status !== 'draft' && imp.totalRows > 0 && (
            <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBlockEnd: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)' }}>معدل النجاح</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{successPct}%</span>
              </div>
              <div className="import-progress-track">
                <div className="import-progress-fill" style={{ inlineSize: `${successPct}%` }} />
              </div>
            </div>
          )}

          {/* Field mappings */}
          {imp.fieldMappings.length > 0 && (
            <div className="ofs-card">
              <div className="ofs-card-header">
                <h3 className="ofs-card-title">تعيين الحقول</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{imp.fieldMappings.length} حقل</span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <table className="ofs-table">
                  <thead>
                    <tr>
                      <th>عمود المصدر</th>
                      <th>حقل الوجهة</th>
                      <th>مطلوب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imp.fieldMappings.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>{m.sourceColumn}</td>
                        <td style={{ fontSize: 'var(--font-size-sm)' }}>{m.targetLabelAr}</td>
                        <td>
                          {m.required ? (
                            <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                              مطلوب
                            </span>
                          ) : (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>اختياري</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Validation issues */}
          {imp.validationIssues.length > 0 && (
            <div className="ofs-card">
              <div className="ofs-card-header">
                <h3 className="ofs-card-title">مشاكل التحقق</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{imp.validationIssues.length} مشكلة</span>
              </div>
              <div className="validation-issue-list">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 110px 70px 1fr 130px',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderBlockEnd: '1px solid var(--color-border)',
                }}>
                  <span>صف</span>
                  <span>الحقل</span>
                  <span>النوع</span>
                  <span>المشكلة</span>
                  <span>القيمة</span>
                </div>
                {imp.validationIssues.map((issue, idx) => (
                  <div key={idx} className={`validation-issue-row ${issue.type === 'error' ? 'is-error' : 'is-warning'}`}>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{issue.row}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{issue.fieldAr}</span>
                    <span>
                      <span className={`issue-type-badge ${issue.type}`}>
                        {issue.type === 'error' ? 'خطأ' : 'تحذير'}
                      </span>
                    </span>
                    <span>{issue.messageAr}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: '#b91c1c' }}>{issue.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Details */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">تفاصيل الاستيراد</h3></div>
            <div className="ofs-card-body">
              <DetailRow label="المصدر" value={
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 'var(--font-size-xs)',
                  background: 'var(--color-surface-raised)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}>
                  {IMPORT_SOURCE_LABELS[imp.source]}
                </span>
              } />
              <DetailRow label="الوجهة" value={IMPORT_TARGET_LABELS[imp.target]} />
              <DetailRow label="الحالة" value={<ImportStatusBadge status={imp.status} />} />
              {imp.fileName && (
                <DetailRow label="اسم الملف" value={
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{imp.fileName}</span>
                } />
              )}
              {imp.fileSize && <DetailRow label="حجم الملف" value={imp.fileSize} />}
              {imp.sheetUrl && (
                <DetailRow label="رابط الجدول" value={
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', wordBreak: 'break-all' }}>
                    {imp.sheetUrl}
                  </span>
                } />
              )}
              <DetailRow label="بواسطة" value={imp.createdBy} />
              <DetailRow label="تاريخ الإنشاء" value={imp.createdAt} />
              {imp.completedAt && <DetailRow label="تاريخ الاكتمال" value={imp.completedAt} />}
            </div>
          </div>

          {/* Notes */}
          {imp.notes && (
            <div className="ofs-card">
              <div className="ofs-card-header"><h3 className="ofs-card-title">ملاحظات</h3></div>
              <div className="ofs-card-body">
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  margin: 0,
                  lineHeight: 'var(--line-height-relaxed)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {imp.notes}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">الإجراءات</h3></div>
            <div className="ofs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link
                href={`/${locale}/import/new`}
                className="btn-outline"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                تكرار هذا الاستيراد
              </Link>
              <Link
                href={`/${locale}/import/history`}
                className="btn-ghost"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                العودة للسجل
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

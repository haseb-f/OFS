'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCollections,
  COLLECTION_PAYMENT_METHOD_LABELS,
  COLLECTION_MATCH_TYPE_LABELS,
  MATCH_RULE_LABELS,
  type MatchRuleKey,
} from '@/lib/mock-data';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import { fNum } from '@/lib/format';

// ── Score gauge bar ────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const cls = score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track" style={{ flex: 1 }}>
        <div className={`score-bar-fill ${cls}`} style={{ inlineSize: `${score}%` }} />
      </div>
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', minInlineSize: 32, textAlign: 'end' }}>
        {score}%
      </span>
    </div>
  );
}

// ── Score circle ───────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const cls = score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';
  return (
    <div className={`score-circle ${cls}`}>
      <span>{score}</span>
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-regular)' }}>%</span>
    </div>
  );
}

// ── Detail row ─────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-row">
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{value}</span>
    </div>
  );
}

// ── Rule row ───────────────────────────────────────────────────────────────────

const RULE_WEIGHT_LABELS: Record<MatchRuleKey, number> = {
  order_number:   30,
  amount:         25,
  customer_name:  20,
  customer_phone: 10,
  payment_phone:  10,
  date:            5,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CollectionDetailsPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [showRules, setShowRules] = useState(true);

  const collection = mockCollections.find(c => c.id === id);

  if (!collection) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: 'var(--font-size-lg)' }}>التحصيل غير موجود</p>
        <Link href={`/${locale}/accounting/collections`} className="btn-outline" style={{ marginBlockStart: 'var(--space-4)', textDecoration: 'none', display: 'inline-block' }}>
          العودة إلى القائمة
        </Link>
      </div>
    );
  }

  const { match } = collection;
  const canApprove = collection.status === 'suggested_match' || collection.status === 'matched';
  const canReject  = collection.status === 'imported' || collection.status === 'suggested_match' || collection.status === 'matched';
  const canInvoice = collection.status === 'approved';

  return (
    <>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBlockEnd: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        <Link href={`/${locale}/accounting/collections`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>مركز التحصيل</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>{collection.reference}</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h2 className="page-title" style={{ marginBlock: 0 }}>{collection.reference}</h2>
              <CollectionStatusBadge status={collection.status} />
              {match && (
                <span className={match.matchType === 'automatic' ? 'col-match-auto' : 'col-match-manual'}>
                  {match.matchType === 'automatic' ? '⚡' : '✎'} {COLLECTION_MATCH_TYPE_LABELS[match.matchType]}
                </span>
              )}
            </div>
            <p className="page-subtitle" style={{ marginBlockStart: 'var(--space-1)' }}>
              {collection.customerName} — {fNum(collection.amount)} {collection.currency}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {canApprove && (
            <button type="button" className="btn-cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              اعتماد المطابقة
            </button>
          )}
          {canInvoice && (
            <button type="button" className="btn-cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              إنشاء فاتورة
            </button>
          )}
          <button type="button" className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            مطابقة يدوية
          </button>
          {canReject && (
            <button type="button" className="btn-ghost" style={{ color: '#b91c1c' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              رفض
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: match ? '1fr 1fr' : '1fr', gap: 'var(--space-5)', marginBlockEnd: 'var(--space-5)' }}>

        {/* Collection Info Card */}
        <div className="ofs-card">
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">بيانات التحصيل</h3>
          </div>
          <div className="ofs-card-body">
            <DetailRow label="رقم المرجع"     value={<span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{collection.reference}</span>} />
            <DetailRow label="العميل"          value={collection.customerName} />
            {collection.customerPhone && <DetailRow label="هاتف العميل" value={<span style={{ direction: 'ltr' }}>{collection.customerPhone}</span>} />}
            {collection.paymentPhone && collection.paymentPhone !== collection.customerPhone && (
              <DetailRow label="هاتف الدفع" value={<span style={{ direction: 'ltr' }}>{collection.paymentPhone}</span>} />
            )}
            <DetailRow label="المبلغ"          value={<span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>{fNum(collection.amount)} {collection.currency}</span>} />
            <DetailRow label="تاريخ الدفع"     value={collection.paymentDate} />
            <DetailRow label="طريقة الدفع"     value={COLLECTION_PAYMENT_METHOD_LABELS[collection.paymentMethod]} />
            {collection.bank         && <DetailRow label="البنك"         value={collection.bank} />}
            {collection.transactionRef && <DetailRow label="رقم المعاملة" value={<span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{collection.transactionRef}</span>} />}
            {collection.sourceOrderNumber && <DetailRow label="رقم الطلب المصدر" value={<span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{collection.sourceOrderNumber}</span>} />}
            <DetailRow label="مصدر الاستيراد" value={collection.importedFrom === 'import' ? 'استيراد تلقائي' : 'إدخال يدوي'} />
            <DetailRow label="تاريخ الإنشاء"  value={collection.createdAt} />
            {collection.notes && (
              <div style={{ marginBlockStart: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', borderInlineStart: '3px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>{collection.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Match Card */}
        {match && (
          <div className="ofs-card">
            <div className="ofs-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="ofs-card-title">الطلب المطابق</h3>
              <ScoreCircle score={match.totalScore} />
            </div>
            <div className="ofs-card-body">
              <DetailRow label="رقم الطلب"     value={<span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)' }}>{match.orderNumber}</span>} />
              <DetailRow label="العميل"          value={match.customerName} />
              <DetailRow label="مبلغ الطلب"     value={<span style={{ fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{fNum(match.orderAmount)} {match.currency}</span>} />
              <DetailRow label="تاريخ الطلب"    value={match.orderDate} />
              <DetailRow label="نوع المطابقة"   value={
                <span className={match.matchType === 'automatic' ? 'col-match-auto' : 'col-match-manual'}>
                  {match.matchType === 'automatic' ? '⚡' : '✎'} {COLLECTION_MATCH_TYPE_LABELS[match.matchType]}
                </span>
              } />
              <div style={{ marginBlockStart: 'var(--space-2)', borderBlockStart: '1px solid var(--color-border)', paddingBlockStart: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setShowRules(v => !v)}
                  style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {showRules ? '▼' : '▶'} تفاصيل قواعد المطابقة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match Rules Breakdown */}
      {match && showRules && (
        <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">نتائج قواعد المطابقة التلقائية</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="acc-table" style={{ minInlineSize: 640 }}>
              <thead>
                <tr>
                  <th>القاعدة</th>
                  <th>الوزن</th>
                  <th>قيمة التحصيل</th>
                  <th>قيمة الطلب</th>
                  <th style={{ width: 200 }}>نسبة التطابق</th>
                  <th style={{ textAlign: 'center', width: 80 }}>النتيجة</th>
                </tr>
              </thead>
              <tbody>
                {match.rules.map((r) => (
                  <tr key={r.rule}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                      {MATCH_RULE_LABELS[r.rule]}
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '2px 6px', fontVariantNumeric: 'tabular-nums' }}>
                        {RULE_WEIGHT_LABELS[r.rule]}%
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontFamily: r.rule !== 'customer_name' ? 'monospace' : undefined }}>
                      {r.sourceValue}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontFamily: r.rule !== 'customer_name' ? 'monospace' : undefined }}>
                      {r.targetValue}
                    </td>
                    <td>
                      <ScoreBar score={r.score} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.matched ? (
                        <span style={{ color: '#16a34a', fontSize: 'var(--font-size-base)' }}>✓</span>
                      ) : (
                        <span style={{ color: '#b91c1c', fontSize: 'var(--font-size-base)' }}>✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="totals-label">الإجمالي المرجّح</td>
                  <td><span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)' }}>100%</span></td>
                  <td colSpan={2}></td>
                  <td>
                    <ScoreBar score={match.totalScore} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 'var(--font-weight-bold)',
                      fontVariantNumeric: 'tabular-nums',
                      color: match.totalScore >= 80 ? '#166534' : match.totalScore >= 60 ? '#92400e' : '#991b1b',
                    }}>
                      {match.totalScore}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Score interpretation */}
          <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {[
              { range: '80 – 100%', label: 'مطابقة عالية الثقة',    color: '#166534', bg: '#dcfce7', border: '#86efac' },
              { range: '60 – 79%',  label: 'مطابقة متوسطة الثقة',   color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
              { range: '0 – 59%',   label: 'مطابقة منخفضة — مراجعة يدوية', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
            ].map(item => (
              <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: item.bg, border: `1px solid ${item.border}`, flexShrink: 0 }} />
                <span style={{ color: item.color, fontWeight: 'var(--font-weight-medium)' }}>{item.range}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>— {item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions card for unmatched */}
      {!match && collection.status === 'imported' && (
        <div className="ofs-card">
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">إجراءات مطلوبة</h3>
          </div>
          <div className="ofs-card-body">
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button type="button" className="btn-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                مطابقة يدوية
              </button>
              <button type="button" className="btn-ghost" style={{ color: '#b91c1c' }}>
                رفض التحصيل
              </button>
            </div>
            <p style={{ marginBlockStart: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              لم يُعثر على طلب مطابق تلقائياً. يمكن إجراء مطابقة يدوية أو رفض هذا التحصيل.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

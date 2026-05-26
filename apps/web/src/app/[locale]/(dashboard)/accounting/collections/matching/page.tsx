'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCollections,
  COLLECTION_PAYMENT_METHOD_LABELS,
  COLLECTION_MATCH_TYPE_LABELS,
  MATCH_RULE_LABELS,
  type CollectionMatchType,
} from '@/lib/mock-data';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import { fNum } from '@/lib/format';

function scoreClass(score: number) {
  return score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';
}

// ── Score circle ───────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  return (
    <div className={`score-circle ${scoreClass(score)}`} title={`نسبة المطابقة: ${score}%`}>
      <span>{score}</span>
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-regular)' }}>%</span>
    </div>
  );
}

// ── Mini score bar ─────────────────────────────────────────────────────────────

function MiniScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-1)' }}>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', minInlineSize: 90, flexShrink: 0 }}>{label}</span>
      <div className="score-bar-track" style={{ flex: 1, blockSize: 4 }}>
        <div className={`score-bar-fill ${scoreClass(score)}`} style={{ inlineSize: `${score}%`, blockSize: '100%', borderRadius: 'var(--radius-full)' }} />
      </div>
      <span style={{ fontSize: 'var(--font-size-xs)', fontVariantNumeric: 'tabular-nums', minInlineSize: 28, textAlign: 'end', color: score >= 80 ? '#166534' : score >= 60 ? '#92400e' : '#b91c1c', fontWeight: 'var(--font-weight-medium)' }}>
        {score}%
      </span>
    </div>
  );
}

// ── Match Card ─────────────────────────────────────────────────────────────────

function MatchCard({
  collection,
  locale,
  onApprove,
  onReject,
}: {
  collection: (typeof mockCollections)[0];
  locale: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const { match } = collection;
  if (!match) return null;

  return (
    <div className="match-center-card">
      {/* Header: Collection | Score | Order */}
      <div className="match-center-header">

        {/* Collection side */}
        <div className="match-center-side">
          <div className="match-center-side-label">التحصيل</div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontFamily: 'monospace' }}>{collection.reference}</div>
          <div style={{ fontWeight: 'var(--font-weight-medium)', marginBlockStart: 'var(--space-1)' }}>{collection.customerName}</div>
          {collection.customerPhone && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>{collection.customerPhone}</div>
          )}
          <div style={{ marginBlockStart: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
              {fNum(collection.amount)} {collection.currency}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{collection.paymentDate}</span>
          </div>
          <div style={{ marginBlockStart: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {COLLECTION_PAYMENT_METHOD_LABELS[collection.paymentMethod]}
              {collection.bank ? ` — ${collection.bank}` : ''}
            </span>
          </div>
          <div style={{ marginBlockStart: 'var(--space-2)' }}>
            <CollectionStatusBadge status={collection.status} />
          </div>
        </div>

        {/* Score divider */}
        <div className="match-center-divider">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)', textAlign: 'center' }}>نسبة المطابقة</div>
            <ScoreCircle score={match.totalScore} />
            <span className={match.matchType === 'automatic' ? 'col-match-auto' : 'col-match-manual'} style={{ fontSize: '11px' }}>
              {match.matchType === 'automatic' ? '⚡' : '✎'} {COLLECTION_MATCH_TYPE_LABELS[match.matchType]}
            </span>
          </div>
        </div>

        {/* Order side */}
        <div className="match-center-side">
          <div className="match-center-side-label">الطلب المقترح</div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontFamily: 'monospace' }}>{match.orderNumber}</div>
          <div style={{ fontWeight: 'var(--font-weight-medium)', marginBlockStart: 'var(--space-1)' }}>{match.customerName}</div>
          <div style={{ marginBlockStart: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
              {fNum(match.orderAmount)} {match.currency}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{match.orderDate}</span>
          </div>
          <div style={{ marginBlockStart: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {match.rules.filter(r => r.matched).map(r => (
              <span key={r.rule} style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                {MATCH_RULE_LABELS[r.rule]} ✓
              </span>
            ))}
          </div>
        </div>

        {/* View link */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Link
            href={`/${locale}/accounting/collections/${collection.id}`}
            className="btn-ghost"
            style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px', whiteSpace: 'nowrap' }}
          >
            مراجعة
          </Link>
        </div>
      </div>

      {/* Rules toggle */}
      <div className="match-rules-panel">
        <button
          type="button"
          onClick={() => setRulesOpen(v => !v)}
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', padding: 0 }}
        >
          {rulesOpen ? '▼' : '▶'} <span>تفاصيل قواعد المطابقة ({match.rules.length} قاعدة)</span>
        </button>

        {rulesOpen && (
          <div style={{ marginBlockStart: 'var(--space-3)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-2)' }}>
            {match.rules.map(r => (
              <div key={r.rule} style={{ padding: 'var(--space-2) var(--space-3)', background: r.matched ? '#f0fdf4' : 'var(--color-surface)', border: `1px solid ${r.matched ? '#bbf7d0' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 'var(--space-1)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    {MATCH_RULE_LABELS[r.rule]}
                    <span style={{ marginInlineStart: 'var(--space-1)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' }}>({r.weight}%)</span>
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: r.matched ? '#166534' : '#b91c1c', fontWeight: 'var(--font-weight-bold)' }}>
                    {r.matched ? '✓ مطابق' : '✗ غير مطابق'}
                  </span>
                </div>
                <MiniScoreBar score={r.score} label="" />
                <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: '11px', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>
                  <span>التحصيل: <span style={{ fontFamily: 'monospace' }}>{r.sourceValue}</span></span>
                  <span>الطلب: <span style={{ fontFamily: 'monospace' }}>{r.targetValue}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="match-actions-bar">
        <button
          type="button"
          className="btn-cta"
          onClick={() => onApprove(collection.id)}
          style={{ fontSize: 'var(--font-size-sm)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          اعتماد المطابقة
        </button>
        <button type="button" className="btn-outline" style={{ fontSize: 'var(--font-size-sm)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          مطابقة يدوية
        </button>
        <button type="button" className="btn-outline" style={{ fontSize: 'var(--font-size-sm)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          إنشاء فاتورة
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => onReject(collection.id)}
          style={{ fontSize: 'var(--font-size-sm)', color: '#b91c1c', marginInlineStart: 'auto' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          رفض
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MatchingCenterPage() {
  const { locale } = useParams<{ locale: string }>();
  const [minScore, setMinScore] = useState(0);
  const [matchTypeFilter, setMatchType] = useState<CollectionMatchType | 'all'>('all');
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

  const pendingCollections = useMemo(() => {
    return mockCollections.filter(c =>
      (c.status === 'suggested_match' || c.status === 'matched') &&
      !approvedIds.includes(c.id) &&
      !rejectedIds.includes(c.id),
    );
  }, [approvedIds, rejectedIds]);

  const filtered = useMemo(() => {
    let data = [...pendingCollections];
    if (matchTypeFilter !== 'all') data = data.filter(c => c.match?.matchType === matchTypeFilter);
    if (minScore > 0) data = data.filter(c => (c.match?.totalScore ?? 0) >= minScore);
    return data.sort((a, b) => (b.match?.totalScore ?? 0) - (a.match?.totalScore ?? 0));
  }, [pendingCollections, matchTypeFilter, minScore]);

  const highScore  = filtered.filter(c => (c.match?.totalScore ?? 0) >= 80).length;
  const medScore   = filtered.filter(c => { const s = c.match?.totalScore ?? 0; return s >= 60 && s < 80; }).length;
  const lowScore   = filtered.filter(c => (c.match?.totalScore ?? 0) < 60).length;
  const allPending = mockCollections.filter(c => c.status === 'suggested_match' || c.status === 'matched').length;

  function handleApprove(id: string) {
    setApprovedIds(prev => [...prev, id]);
  }

  function handleReject(id: string) {
    setRejectedIds(prev => [...prev, id]);
  }

  return (
    <>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز المطابقة</h2>
          <p className="page-subtitle">مراجعة واعتماد التحصيلات المقترحة للمطابقة — {allPending} تحصيل بانتظار القرار</p>
        </div>
        <Link href={`/${locale}/accounting/collections`} className="btn-outline" style={{ textDecoration: 'none' }}>
          قائمة التحصيلات
        </Link>
      </div>

      {/* Stats */}
      <div className="col-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>إجمالي المعلّقة</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{allPending}</span>
        </div>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>ثقة عالية (≥80%)</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#166534', fontVariantNumeric: 'tabular-nums' }}>{highScore}</span>
        </div>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>ثقة متوسطة (60–79%)</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>{medScore}</span>
        </div>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>ثقة منخفضة (&lt;60%)</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#991b1b', fontVariantNumeric: 'tabular-nums' }}>{lowScore}</span>
        </div>
      </div>

      {/* Feedback banners for session actions */}
      {approvedIds.length > 0 && (
        <div style={{ marginBlockEnd: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: '#166534', fontWeight: 'var(--font-weight-medium)' }}>
            ✓ تم اعتماد {approvedIds.length} تحصيل في هذه الجلسة
          </span>
          <button type="button" onClick={() => setApprovedIds([])} style={{ fontSize: 'var(--font-size-xs)', color: '#166534', background: 'none', border: 'none', cursor: 'pointer' }}>
            تراجع
          </button>
        </div>
      )}
      {rejectedIds.length > 0 && (
        <div style={{ marginBlockEnd: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: '#b91c1c', fontWeight: 'var(--font-weight-medium)' }}>
            ✗ تم رفض {rejectedIds.length} تحصيل في هذه الجلسة
          </span>
          <button type="button" onClick={() => setRejectedIds([])} style={{ fontSize: 'var(--font-size-xs)', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer' }}>
            تراجع
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              الحد الأدنى للنسبة:
            </label>
            <select
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="ofs-select"
              style={{ width: 120 }}
            >
              <option value={0}>الكل</option>
              <option value={80}>80% فأكثر</option>
              <option value={60}>60% فأكثر</option>
              <option value={40}>40% فأكثر</option>
            </select>
          </div>
          <select
            value={matchTypeFilter}
            onChange={e => setMatchType(e.target.value as typeof matchTypeFilter)}
            className="ofs-select"
          >
            <option value="all">كل أنواع المطابقة</option>
            <option value="automatic">تلقائية فقط</option>
            <option value="manual">يدوية فقط</option>
          </select>
          {(minScore > 0 || matchTypeFilter !== 'all') && (
            <button type="button" className="btn-ghost" onClick={() => { setMinScore(0); setMatchType('all'); }}>
              مسح الفلاتر
            </button>
          )}
          <span style={{ marginInlineStart: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {filtered.length} تحصيل معروض
          </span>
        </div>
      </div>

      {/* Match cards */}
      {filtered.length === 0 ? (
        <div className="ofs-card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-3xl)', marginBlockEnd: 'var(--space-3)' }}>✓</div>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBlockEnd: 'var(--space-2)' }}>
            لا توجد تحصيلات بانتظار المطابقة
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>
            جميع التحصيلات المقترحة تمت معالجتها أو لا تطابق الفلتر المحدد
          </p>
          <Link href={`/${locale}/accounting/collections`} className="btn-outline" style={{ textDecoration: 'none' }}>
            العودة لقائمة التحصيلات
          </Link>
        </div>
      ) : (
        filtered.map(col => (
          <MatchCard
            key={col.id}
            collection={col}
            locale={locale}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </>
  );
}

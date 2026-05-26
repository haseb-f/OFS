'use client';

import { fNum } from '@/lib/format';

interface SmartMatch {
  confidence: number;
  matchType: 'exact' | 'high' | 'medium' | 'low';
  matchedOn: string[];
  suggestedCustomerName: string;
  suggestedCustomerId?: string;
  suggestedOrderId?: string;
  suggestedInvoiceId?: string;
  suggestedAmount?: number;
  overrideApplied?: boolean;
}

interface ImportSmartMatchCardProps {
  match: SmartMatch;
  onAccept: () => void;
  onOverride: () => void;
}

const MATCH_TYPE_CONFIG = {
  exact:  { label: 'مطابقة تامة', color: '#16a34a', bg: '#dcfce7' },
  high:   { label: 'مطابقة عالية', color: '#16a34a', bg: '#dcfce7' },
  medium: { label: 'مطابقة متوسطة', color: '#b45309', bg: '#fef3c7' },
  low:    { label: 'مطابقة منخفضة', color: '#b91c1c', bg: '#fee2e2' },
};

const FIELD_LABELS: Record<string, string> = {
  phone:            'هاتف',
  amount:           'مبلغ',
  reference:        'مرجع',
  customer_name:    'اسم العميل',
  transaction_date: 'تاريخ',
  email:            'بريد',
};

export default function ImportSmartMatchCard({ match, onAccept, onOverride }: ImportSmartMatchCardProps) {
  const cfg = MATCH_TYPE_CONFIG[match.matchType];
  const barWidth = Math.round((match.confidence / 100) * 80);

  return (
    <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 80, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ width: barWidth, height: '100%', background: cfg.color, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: cfg.color, fontVariantNumeric: 'tabular-nums' }}>
            {match.confidence}%
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className="btn-ghost"
            onClick={onOverride}
            style={{ padding: '3px 10px', fontSize: 'var(--font-size-xs)' }}
          >
            تعديل يدوي
          </button>
          <button
            className="btn-cta"
            onClick={onAccept}
            style={{ padding: '3px 10px', fontSize: 'var(--font-size-xs)' }}
          >
            قبول المطابقة
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
          {match.suggestedCustomerName}
        </span>
        {match.suggestedCustomerId && (
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: 'var(--color-text-muted)', background: 'var(--color-surface)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--color-border)' }}>
            {match.suggestedCustomerId}
          </span>
        )}
        {match.suggestedOrderId && (
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: '#1d4ed8', background: '#eff6ff', padding: '1px 5px', borderRadius: 3, border: '1px solid #bfdbfe' }}>
            {match.suggestedOrderId}
          </span>
        )}
        {match.suggestedInvoiceId && (
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: '#7c3aed', background: '#f5f3ff', padding: '1px 5px', borderRadius: 3, border: '1px solid #ddd6fe' }}>
            {match.suggestedInvoiceId}
          </span>
        )}
        {match.suggestedAmount !== undefined && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 'auto', fontVariantNumeric: 'tabular-nums' }}>
            {fNum(match.suggestedAmount)} ر.س
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
        {match.matchedOn.map(field => (
          <span key={field} style={{ fontSize: 'var(--font-size-xs)', padding: '1px 6px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 3 }}>
            ✓ {FIELD_LABELS[field] ?? field}
          </span>
        ))}
        {match.overrideApplied && (
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '1px 6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: 3 }}>
            تم التعديل يدوياً
          </span>
        )}
      </div>
    </div>
  );
}

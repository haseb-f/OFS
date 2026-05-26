'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaymentMethod {
  id:          string;
  code:        string;
  nameAr:      string;
  nameEn:      string;
  category:    'cash' | 'bank' | 'card' | 'digital' | 'bnpl';
  enabled:     boolean;
  iconColor:   string;
  iconBg:      string;
  isSystem:    boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: PaymentMethod[] = [
  { id: 'pm-1',  code: 'CASH',          nameAr: 'نقداً',           nameEn: 'Cash',           category: 'cash',    enabled: true,  iconColor: '#15803d', iconBg: '#f0fdf4', isSystem: true  },
  { id: 'pm-2',  code: 'BANK_TRANSFER', nameAr: 'تحويل بنكي',     nameEn: 'Bank Transfer',  category: 'bank',    enabled: true,  iconColor: '#1d4ed8', iconBg: '#eff6ff', isSystem: true  },
  { id: 'pm-3',  code: 'CREDIT_CARD',   nameAr: 'بطاقة ائتمانية', nameEn: 'Credit Card',    category: 'card',    enabled: true,  iconColor: '#7c3aed', iconBg: '#f5f3ff', isSystem: false },
  { id: 'pm-4',  code: 'MADA',          nameAr: 'مدى',             nameEn: 'Mada',           category: 'card',    enabled: true,  iconColor: '#0891b2', iconBg: '#ecfeff', isSystem: false },
  { id: 'pm-5',  code: 'VISA',          nameAr: 'فيزا',            nameEn: 'Visa',           category: 'card',    enabled: true,  iconColor: '#1d4ed8', iconBg: '#eff6ff', isSystem: false },
  { id: 'pm-6',  code: 'MASTERCARD',    nameAr: 'ماستركارد',       nameEn: 'Mastercard',     category: 'card',    enabled: true,  iconColor: '#b91c1c', iconBg: '#fef2f2', isSystem: false },
  { id: 'pm-7',  code: 'STC_PAY',       nameAr: 'STC Pay',         nameEn: 'STC Pay',        category: 'digital', enabled: false, iconColor: '#7c3aed', iconBg: '#f5f3ff', isSystem: false },
  { id: 'pm-8',  code: 'URPAY',         nameAr: 'UrPay',           nameEn: 'UrPay',          category: 'digital', enabled: false, iconColor: '#0891b2', iconBg: '#ecfeff', isSystem: false },
  { id: 'pm-9',  code: 'TABBY',         nameAr: 'تابي',            nameEn: 'Tabby',          category: 'bnpl',    enabled: false, iconColor: '#059669', iconBg: '#ecfdf5', isSystem: false },
  { id: 'pm-10', code: 'TAMARA',        nameAr: 'تمارا',           nameEn: 'Tamara',         category: 'bnpl',    enabled: false, iconColor: '#d97706', iconBg: '#fffbeb', isSystem: false },
];

const CATEGORY_LABELS: Record<string, string> = {
  cash:    'نقدي',
  bank:    'بنكي',
  card:    'بطاقات',
  digital: 'محافظ رقمية',
  bnpl:    'الشراء الآن والدفع لاحقاً',
};

// ── Payment method icon ───────────────────────────────────────────────────────

function PaymentIcon({ code }: { code: string }) {
  if (code === 'CASH') return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
    </svg>
  );
  if (code === 'BANK_TRANSFER') return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
    </svg>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => !disabled && onChange(!enabled)}
      style={{
        inlineSize: '44px',
        blockSize: '24px',
        borderRadius: 'var(--radius-full)',
        background: enabled ? 'var(--color-primary)' : 'var(--color-border)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background var(--transition-fast)',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute',
        inlineSize: '18px',
        blockSize: '18px',
        borderRadius: '50%',
        background: 'white',
        insetBlockStart: '3px',
        insetInlineStart: enabled ? 'calc(100% - 21px)' : '3px',
        transition: 'inset-inline-start var(--transition-fast)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const CATEGORY_ORDER: string[] = ['cash', 'bank', 'card', 'digital', 'bnpl'];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL);

  function toggle(id: string) {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label:    CATEGORY_LABELS[cat],
    items:    methods.filter(m => m.category === cat),
  })).filter(g => g.items.length > 0);

  const enabledCount = methods.filter(m => m.enabled).length;

  return (
    <div>
      {/* Summary banner */}
      <div
        className="ofs-card"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          marginBlockEnd: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(59,130,246,0.04) 100%)',
          borderBlockStart: '3px solid var(--color-primary)',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-1)' }}>طرق الدفع المفعّلة</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
            {enabledCount} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>من {methods.length}</span>
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'end' }}>
          فعّل طرق الدفع التي تريد إتاحتها للعملاء
        </div>
      </div>

      {/* Groups */}
      {grouped.map(group => (
        <div key={group.category} className="ofs-card" style={{ marginBlockEnd: 'var(--space-4)', overflow: 'hidden' }}>
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">{group.label}</h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
              {group.items.filter(m => m.enabled).length}/{group.items.length} مفعّل
            </span>
          </div>

          <div>
            {group.items.map((method, idx) => (
              <div
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBlockEnd: idx < group.items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {/* Icon */}
                <div style={{ inlineSize: '44px', blockSize: '44px', borderRadius: 'var(--radius-lg)', background: method.iconBg, color: method.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                  <PaymentIcon code={method.code} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minInlineSize: 0 }}>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                    {method.nameAr}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }} dir="ltr">
                    {method.nameEn}
                    {method.isSystem && (
                      <span style={{ marginInlineStart: 'var(--space-2)', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', paddingInline: 'var(--space-2)', fontWeight: 'var(--font-weight-semibold)', fontSize: '10px' }}>
                        أساسي
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: method.enabled ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {method.enabled ? 'مفعّل' : 'معطّل'}
                  </span>
                  <Toggle enabled={method.enabled} onChange={() => toggle(method.id)} disabled={method.isSystem} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-cta">حفظ الإعدادات</button>
      </div>
    </div>
  );
}

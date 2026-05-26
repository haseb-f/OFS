'use client';

import { useState } from 'react';
import {
  mockDistributionRules,
  DIST_METHOD_LABELS,
  DIST_METHOD_COLORS,
  type DistributionRule,
  type DistributionMethod,
} from '@/lib/lead-distribution-mock-data';
import { fNum } from '@/lib/format';

// ── Method Badge ──────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: DistributionMethod }) {
  const c = DIST_METHOD_COLORS[method];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
      paddingInline: 'var(--space-2)', paddingBlock: '3px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-medium)',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      <MethodIcon method={method} />
      {DIST_METHOD_LABELS[method]}
    </span>
  );
}

function MethodIcon({ method }: { method: DistributionMethod }) {
  const icons: Record<DistributionMethod, React.ReactNode> = {
    manual: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    round_robin: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    ),
    weighted: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    team: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    branch: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    company: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    skill: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  };
  return <>{icons[method]}</>;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function StatusToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={() => onChange(!active)}
      style={{
        inlineSize: 40, blockSize: 22,
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--color-primary)' : 'var(--color-border)',
        border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
        transition: 'background var(--transition-fast)',
      }}
    >
      <span style={{
        display: 'block',
        inlineSize: 16, blockSize: 16,
        borderRadius: 'var(--radius-full)',
        background: '#fff',
        position: 'absolute',
        insetBlockStart: 3,
        insetInlineStart: active ? 21 : 3,
        transition: 'inset-inline-start var(--transition-fast)',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </button>
  );
}

// ── Rule Card ─────────────────────────────────────────────────────────────────

const METHOD_DESCRIPTIONS: Record<DistributionMethod, { title: string; detail: string }> = {
  manual:      { title: 'تعيين يدوي',         detail: 'يختار المدير العميل ويُسنده مباشرةً لمندوب بعينه.' },
  round_robin: { title: 'التناوب الدوري',     detail: 'يُوزَّع العملاء بالتناوب المتساوي على جميع المندوبين النشطين.' },
  weighted:    { title: 'الوزن النسبي',       detail: 'يُعيَّن كل مندوب نسبةً من العملاء تتناسب مع وزنه وأدائه.' },
  team:        { title: 'توزيع الفريق',       detail: 'يُحوَّل العميل لأقرب مندوب في الفريق المخصص لنوع العميل.' },
  branch:      { title: 'توزيع الفروع',       detail: 'يُسند العميل للمندوب في نفس فرع منطقته الجغرافية.' },
  company:     { title: 'توزيع الشركات',      detail: 'يُربط عميل الشركة بالمندوب المسؤول عن حساب تلك الشركة.' },
  skill:       { title: 'توزيع المهارات',     detail: 'يُختار المندوب الذي تتطابق مهاراته مع احتياجات العميل.' },
};

function RuleCard({ rule, onToggle }: { rule: DistributionRule; onToggle: () => void }) {
  const methodInfo = METHOD_DESCRIPTIONS[rule.method];
  return (
    <div style={{
      background: rule.status === 'active' ? 'var(--color-surface)' : 'var(--color-surface-overlay)',
      border: `1px solid ${rule.status === 'active' ? 'var(--color-border)' : 'var(--color-border-subtle)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
      opacity: rule.status === 'active' ? 1 : 0.7,
      transition: 'all var(--transition-fast)',
    }}>
      {/* Row 1: Priority + Method + Name + Toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <span style={{
          inlineSize: 28, blockSize: 28, borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-overlay)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-muted)', flexShrink: 0,
        }}>
          {rule.priority}
        </span>
        <div style={{ flex: 1, minInlineSize: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
              {rule.name}
            </span>
            <MethodBadge method={rule.method} />
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            {methodInfo.detail}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: rule.status === 'active' ? '#15803d' : 'var(--color-text-muted)' }}>
            {rule.status === 'active' ? 'نشط' : 'معطل'}
          </span>
          <StatusToggle active={rule.status === 'active'} onChange={onToggle} />
        </div>
      </div>

      {/* Row 2: Conditions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
        {rule.conditions.map((cond, i) => (
          <span key={i} style={{
            paddingInline: 'var(--space-2)', paddingBlock: '2px',
            background: 'var(--color-surface-overlay)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
          }}>
            {cond}
          </span>
        ))}
      </div>

      {/* Row 3: Stats + Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBlockStart: 'var(--space-3)',
        borderBlockStart: '1px solid var(--color-border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 2 }}>إجمالي مُعيَّن</div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
              {fNum(rule.totalAssigned, 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 2 }}>آخر استخدام</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{rule.lastUsed}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn-ghost" style={{ paddingInline: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const METHOD_FILTER_OPTIONS: { value: 'all' | DistributionMethod; label: string }[] = [
  { value: 'all',      label: 'الكل' },
  { value: 'round_robin', label: 'التناوب الدوري' },
  { value: 'weighted', label: 'الوزن النسبي' },
  { value: 'team',     label: 'الفريق' },
  { value: 'branch',   label: 'الفرع' },
  { value: 'company',  label: 'الشركة' },
  { value: 'skill',    label: 'المهارة' },
];

export default function DistributionRulesPage() {
  const [rules, setRules] = useState(mockDistributionRules);
  const [methodFilter, setMethodFilter] = useState<'all' | DistributionMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = rules.filter(r => {
    if (methodFilter !== 'all' && r.method !== methodFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  function toggleRule(id: string) {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
    ));
  }

  const activeCount = rules.filter(r => r.status === 'active').length;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">قواعد التوزيع</h2>
          <p className="page-subtitle">
            {activeCount} قاعدة نشطة من {rules.length} · التوزيع التلقائي للعملاء المحتملين
          </p>
        </div>
        <button className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          قاعدة جديدة
        </button>
      </div>

      {/* Method Overview Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--space-3)', marginBlockEnd: 'var(--space-5)',
      }}>
        {(Object.keys(METHOD_DESCRIPTIONS) as DistributionMethod[]).map(method => {
          const c = DIST_METHOD_COLORS[method];
          const info = METHOD_DESCRIPTIONS[method];
          const ruleForMethod = rules.find(r => r.method === method);
          return (
            <div key={method} style={{
              padding: 'var(--space-3)',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
            onClick={() => setMethodFilter(method === methodFilter ? 'all' : method)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 'var(--space-2)' }}>
                <MethodBadge method={method} />
                {ruleForMethod && (
                  <span style={{
                    inlineSize: 8, blockSize: 8, borderRadius: 'var(--radius-full)',
                    background: ruleForMethod.status === 'active' ? '#16a34a' : '#9ca3af',
                  }} />
                )}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: c.color, fontWeight: 'var(--font-weight-medium)', marginBlockEnd: 2 }}>
                {info.title}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {ruleForMethod ? `${fNum(ruleForMethod.totalAssigned, 0)} مُعيَّن` : 'غير مُعيَّن'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="leads-filter-chips">
          {METHOD_FILTER_OPTIONS.map(f => (
            <button
              key={f.value}
              className={`filter-chip${methodFilter === f.value ? ' active' : ''}`}
              onClick={() => setMethodFilter(f.value as typeof methodFilter)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              className={`filter-chip${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'الكل' : s === 'active' ? 'نشط' : 'معطل'}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.length === 0 ? (
          <div className="ofs-card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ marginBlockEnd: 'var(--space-3)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            لا توجد قواعد تطابق الفلتر المحدد
          </div>
        ) : filtered.map(rule => (
          <RuleCard key={rule.id} rule={rule} onToggle={() => toggleRule(rule.id)} />
        ))}
      </div>
    </>
  );
}

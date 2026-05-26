'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCrmLeads,
  STAGE_LABELS,
  SOURCE_LABELS,
  type CrmLead,
  type CrmLeadStage,
} from '@/lib/crm-mock-data';
import { fNum } from '@/lib/format';

// ── Stage config ──────────────────────────────────────────────────────────────

interface StageConfig {
  id: CrmLeadStage;
  color: string;
  bg: string;
  headerBg: string;
  borderColor: string;
}

const STAGES: StageConfig[] = [
  { id: 'new',           color: '#475569', bg: '#f8fafc', headerBg: '#f1f5f9', borderColor: '#e2e8f0' },
  { id: 'contacted',     color: '#1d4ed8', bg: '#eff6ff', headerBg: '#dbeafe', borderColor: '#bfdbfe' },
  { id: 'interested',    color: '#6d28d9', bg: '#f5f3ff', headerBg: '#ede9fe', borderColor: '#ddd6fe' },
  { id: 'qualified',     color: '#b45309', bg: '#fffbeb', headerBg: '#fef3c7', borderColor: '#fde68a' },
  { id: 'proposal_sent', color: '#c2410c', bg: '#fff7ed', headerBg: '#fed7aa', borderColor: '#fdba74' },
  { id: 'won',           color: '#15803d', bg: '#f0fdf4', headerBg: '#dcfce7', borderColor: '#bbf7d0' },
  { id: 'lost',          color: '#b91c1c', bg: '#fef2f2', headerBg: '#fee2e2', borderColor: '#fecaca' },
];

// ── Lead Card ─────────────────────────────────────────────────────────────────

function LeadCard({ lead, locale }: { lead: CrmLead; locale: string }) {
  return (
    <Link
      href={`/${locale}/crm/leads/${lead.id}`}
      style={{
        display: 'block',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
        marginBlockEnd: 'var(--space-2)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Name + company */}
      <div style={{ marginBlockEnd: 'var(--space-2)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
          {lead.name}
        </div>
        {lead.company && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.company}</div>
        )}
      </div>

      {/* Phone */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBlockEnd: 'var(--space-2)' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6z"/>
        </svg>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr' }}>{lead.phone}</span>
      </div>

      {/* Source */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-2)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          paddingInline: 'var(--space-2)', paddingBlock: '2px',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)',
          background: 'var(--color-surface-overlay)',
          color: 'var(--color-text-muted)',
        }}>
          {SOURCE_LABELS[lead.source]}
        </span>
      </div>

      {/* Footer: assigned user + value */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockStart: 'var(--space-2)', paddingBlockStart: 'var(--space-2)', borderBlockStart: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{
            inlineSize: 22, blockSize: 22, borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.625rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
          }}>
            {lead.assignedUserInitials}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.assignedUser}</span>
        </div>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          {fNum(lead.expectedValue, 0)} ر.س
        </span>
      </div>

      {/* Last activity */}
      <div style={{ marginBlockStart: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)' }} aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>{lead.lastActivity}</span>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadsPipelinePage() {
  const params = useParams();
  const locale = params.locale as string;

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<CrmLeadStage | 'all'>('all');

  const filteredLeads = useMemo(() => {
    let data = [...mockCrmLeads];
    if (stageFilter !== 'all') data = data.filter(l => l.stage === stageFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(l =>
        l.name.includes(q) ||
        l.phone.includes(q) ||
        (l.company ?? '').includes(q)
      );
    }
    return data;
  }, [search, stageFilter]);

  const totalValue = filteredLeads.reduce((acc, l) => acc + l.expectedValue, 0);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">خط الصفقات</h2>
          <p className="page-subtitle">
            {filteredLeads.length} عميل محتمل · قيمة محتملة: {fNum(totalValue, 0)} ر.س
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-outline" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            عميل محتمل جديد
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="leads-filter-chips">
          <button
            className={`filter-chip${stageFilter === 'all' ? ' active' : ''}`}
            onClick={() => setStageFilter('all')}
          >
            الكل
            <span className="filter-chip-count">{mockCrmLeads.length}</span>
          </button>
          {STAGES.map(s => {
            const count = mockCrmLeads.filter(l => l.stage === s.id).length;
            return (
              <button
                key={s.id}
                className={`filter-chip${stageFilter === s.id ? ' active' : ''}`}
                onClick={() => setStageFilter(s.id)}
              >
                {STAGE_LABELS[s.id]}
                {count > 0 && <span className="filter-chip-count">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="leads-search">
          <span className="leads-search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="search"
            placeholder="البحث بالاسم أو الهاتف أو الشركة…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        overflowX: 'auto',
        paddingBlockEnd: 'var(--space-6)',
        minBlockSize: 'calc(100vh - 280px)',
        alignItems: 'flex-start',
      }}>
        {STAGES.map(stage => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
          const stageValue = stageLeads.reduce((acc, l) => acc + l.expectedValue, 0);

          return (
            <div
              key={stage.id}
              style={{
                flexShrink: 0,
                inlineSize: 272,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              {/* Column header */}
              <div style={{
                background: stage.headerBg,
                border: `1px solid ${stage.borderColor}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                position: 'sticky',
                insetBlockStart: 0,
                zIndex: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 4 }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: stage.color }}>
                    {STAGE_LABELS[stage.id]}
                  </span>
                  <span style={{
                    inlineSize: 22, blockSize: 22, borderRadius: 'var(--radius-full)',
                    background: stage.bg,
                    border: `1px solid ${stage.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
                    color: stage.color,
                  }}>
                    {stageLeads.length}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: stage.color, opacity: 0.75 }}>
                  {fNum(stageValue, 0)} ر.س
                </div>
              </div>

              {/* Cards */}
              <div style={{
                background: stage.bg,
                border: `1px solid ${stage.borderColor}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-2)',
                flex: 1,
                minBlockSize: 200,
              }}>
                {stageLeads.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    blockSize: 80, color: 'var(--color-text-subtle)',
                    fontSize: 'var(--font-size-xs)',
                    flexDirection: 'column', gap: 'var(--space-2)',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/>
                    </svg>
                    لا يوجد عملاء في هذه المرحلة
                  </div>
                ) : stageLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} locale={locale} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

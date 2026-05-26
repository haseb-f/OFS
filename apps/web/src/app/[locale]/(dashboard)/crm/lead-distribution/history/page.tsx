'use client';

import { useState, useMemo } from 'react';
import {
  mockAssignmentHistory,
  DIST_METHOD_LABELS,
  DIST_METHOD_COLORS,
  type DistributionMethod,
  type AssignmentRecord,
} from '@/lib/lead-distribution-mock-data';

// ── Method Badge ──────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: DistributionMethod }) {
  const c = DIST_METHOD_COLORS[method];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      paddingInline: 'var(--space-2)', paddingBlock: '2px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {DIST_METHOD_LABELS[method]}
    </span>
  );
}

// ── Timeline Row ──────────────────────────────────────────────────────────────

function TimelineRow({ record, isLast }: { record: AssignmentRecord; isLast: boolean }) {
  const isReassign = Boolean(record.fromAgent);
  const dotColor = isReassign ? '#b45309' : '#15803d';
  const dotBg = isReassign ? '#fef3c7' : '#dcfce7';

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', paddingBlock: 'var(--space-4)' }}>
      {/* Timeline line + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, inlineSize: 32 }}>
        <div style={{
          inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-full)',
          background: dotBg, border: `2px solid ${dotColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: dotColor, flexShrink: 0,
        }}>
          {isReassign ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          )}
        </div>
        {!isLast && (
          <div style={{ flex: 1, inlineSize: 2, background: 'var(--color-border)', marginBlockStart: 4 }} />
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, minInlineSize: 0,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 4 }}>
              {record.leadName}
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)', marginInlineStart: 'var(--space-2)' }}>
                #{record.leadId}
              </span>
            </div>
            <MethodBadge method={record.method} />
          </div>
          <div style={{ textAlign: 'end' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 2 }}>
              {record.timestamp}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
              بواسطة: {record.triggeredBy}
            </div>
          </div>
        </div>

        {/* Assignment flow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBlockEnd: record.notes ? 'var(--space-3)' : 0 }}>
          {record.fromAgent ? (
            <>
              {/* From agent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{
                  inlineSize: 28, blockSize: 28, borderRadius: 'var(--radius-full)',
                  background: '#fef3c7', color: '#b45309',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                }}>
                  {record.fromAgentInitials}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  {record.fromAgent}
                </span>
              </div>
              {/* Arrow */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </>
          ) : (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', paddingInlineEnd: 'var(--space-2)' }}>
              تعيين جديد →
            </span>
          )}

          {/* To agent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
              inlineSize: 28, blockSize: 28, borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.625rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
            }}>
              {record.toAgentInitials}
            </span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
              {record.toAgent}
            </span>
          </div>
        </div>

        {/* Notes */}
        {record.notes && (
          <div style={{
            marginBlockStart: 'var(--space-3)',
            paddingBlockStart: 'var(--space-3)',
            borderBlockStart: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginBlockStart: 1 }} aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            {record.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────

function TableRow({ record }: { record: AssignmentRecord }) {
  return (
    <tr>
      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        {record.timestamp}
      </td>
      <td>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
          {record.leadName}
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          #{record.leadId}
        </div>
      </td>
      <td><MethodBadge method={record.method} /></td>
      <td>
        {record.fromAgent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
              inlineSize: 24, blockSize: 24, borderRadius: 'var(--radius-full)',
              background: '#fef3c7', color: '#b45309',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
            }}>
              {record.fromAgentInitials}
            </span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {record.fromAgent}
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-xs)' }}>—</span>
        )}
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            inlineSize: 24, blockSize: 24, borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
          }}>
            {record.toAgentInitials}
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
            {record.toAgent}
          </span>
        </div>
      </td>
      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        {record.triggeredBy}
      </td>
      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', maxInlineSize: 200 }}>
        {record.notes ?? <span style={{ color: 'var(--color-text-subtle)' }}>—</span>}
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ViewMode = 'timeline' | 'table';

export default function AssignmentHistoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [methodFilter, setMethodFilter] = useState<'all' | DistributionMethod>('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = [...mockAssignmentHistory];
    if (methodFilter !== 'all') data = data.filter(r => r.method === methodFilter);
    if (agentFilter !== 'all') data = data.filter(r => r.toAgent === agentFilter || r.fromAgent === agentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.leadName.includes(q) ||
        r.toAgent.includes(q) ||
        (r.fromAgent ?? '').includes(q) ||
        r.triggeredBy.includes(q)
      );
    }
    return data;
  }, [methodFilter, agentFilter, search]);

  const uniqueAgents = [...new Set([
    ...mockAssignmentHistory.map(r => r.toAgent),
    ...mockAssignmentHistory.filter(r => r.fromAgent).map(r => r.fromAgent!),
  ])];

  const methodCounts = useMemo(() =>
    mockAssignmentHistory.reduce<Partial<Record<DistributionMethod, number>>>((acc, r) => {
      acc[r.method] = (acc[r.method] ?? 0) + 1;
      return acc;
    }, {}), []);

  const reassignCount = filtered.filter(r => r.fromAgent).length;
  const autoCount = filtered.filter(r => r.method !== 'manual').length;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">سجل التعيينات</h2>
          <p className="page-subtitle">
            {filtered.length} سجل · {reassignCount} إعادة تعيين · {autoCount} تلقائي
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          {/* View toggle */}
          <div style={{
            display: 'flex', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)', overflow: 'hidden',
          }}>
            {(['timeline', 'table'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-2)',
                  background: viewMode === mode ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: viewMode === mode ? '#fff' : 'var(--color-text-muted)',
                  border: 'none', cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {mode === 'timeline' ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    تسلسل زمني
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    جدول
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)' }}>
        <div className="leads-filter-chips">
          <button className={`filter-chip${methodFilter === 'all' ? ' active' : ''}`} onClick={() => setMethodFilter('all')}>
            الكل <span className="filter-chip-count">{mockAssignmentHistory.length}</span>
          </button>
          {(Object.keys(DIST_METHOD_COLORS) as DistributionMethod[]).map(method => {
            const count = methodCounts[method];
            if (!count) return null;
            return (
              <button key={method} className={`filter-chip${methodFilter === method ? ' active' : ''}`}
                onClick={() => setMethodFilter(method)}>
                {DIST_METHOD_LABELS[method]}
                <span className="filter-chip-count">{count}</span>
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
            placeholder="البحث بالاسم أو المندوب…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Agent filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-4)', flexWrap: 'wrap' }}>
        <button className={`filter-chip${agentFilter === 'all' ? ' active' : ''}`} onClick={() => setAgentFilter('all')}>
          جميع المندوبين
        </button>
        {uniqueAgents.map(agent => (
          <button key={agent}
            className={`filter-chip${agentFilter === agent ? ' active' : ''}`}
            onClick={() => setAgentFilter(agent)}>
            {agent}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="ofs-card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ marginBlockEnd: 'var(--space-3)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          لا توجد سجلات تطابق الفلتر المحدد
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && filtered.length > 0 && (
        <div style={{ maxInlineSize: 720 }}>
          {filtered.map((record, idx) => (
            <TimelineRow key={record.id} record={record} isLast={idx === filtered.length - 1} />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="ofs-card">
          <div className="ofs-table-wrap">
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>العميل</th>
                  <th>طريقة التوزيع</th>
                  <th>من</th>
                  <th>إلى</th>
                  <th>بواسطة</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <TableRow key={record.id} record={record} />
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            paddingInline: 'var(--space-5)', paddingBlock: 'var(--space-3)',
            borderBlockStart: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
          }}>
            عرض {filtered.length} من {mockAssignmentHistory.length} سجل
          </div>
        </div>
      )}
    </>
  );
}

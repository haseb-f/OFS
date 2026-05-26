'use client';

import { useState, useMemo } from 'react';
import {
  mockLeadOwnership,
  mockDistributionAgents,
  LEAD_DIST_STATUS_LABELS,
  LEAD_DIST_STATUS_COLORS,
  type LeadDistStatus,
  type LeadOwnership,
} from '@/lib/lead-distribution-mock-data';
import { fNum } from '@/lib/format';

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadDistStatus }) {
  const c = LEAD_DIST_STATUS_COLORS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      paddingInline: 'var(--space-2)', paddingBlock: '3px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {LEAD_DIST_STATUS_LABELS[status]}
    </span>
  );
}

// ── Change Owner Modal ────────────────────────────────────────────────────────

function ChangeOwnerModal({ lead, onClose }: { lead: LeadOwnership; onClose: () => void }) {
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', inlineSize: 460,
        boxShadow: 'var(--shadow-elevated)', maxBlockSize: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBlockEnd: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0, marginBlockEnd: 'var(--space-1)' }}>
            تغيير المالك
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            {lead.leadName} · المالك الحالي: {lead.currentOwner}
          </p>
        </div>

        <div style={{ marginBlockEnd: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-2)' }}>
            المالك الجديد
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {mockDistributionAgents
              .filter(a => a.name !== lead.currentOwner)
              .map(agent => (
              <label key={agent.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: `1px solid ${selected === agent.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                background: selected === agent.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              }}>
                <input type="radio" name="new-owner" value={agent.id}
                  checked={selected === agent.id}
                  onChange={() => setSelected(agent.id)}
                  style={{ accentColor: 'var(--color-primary)' }} />
                <span style={{
                  inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                }}>
                  {agent.initials}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {agent.team} · {agent.branch}
                  </div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: '#15803d', fontWeight: 'var(--font-weight-semibold)' }}>
                    {agent.conversionRate}%
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {agent.assignedCount} مُعيَّن
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBlockEnd: 'var(--space-5)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-2)' }}>
            سبب التغيير (اختياري)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="أدخل سبب تغيير المالك…"
            rows={3}
            style={{
              inlineSize: '100%', boxSizing: 'border-box',
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)', color: 'var(--color-text)',
              background: 'var(--color-surface)',
              resize: 'vertical', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn-cta" disabled={!selected} onClick={onClose}>
            تغيير المالك
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type SortKey = 'leadName' | 'currentOwner' | 'status' | 'assignedAt' | 'expectedValue';

const STATUS_FILTERS: { value: 'all' | LeadDistStatus; label: string }[] = [
  { value: 'all',       label: 'الكل' },
  { value: 'new',       label: 'جديد' },
  { value: 'assigned',  label: 'مُعيَّن' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'qualified', label: 'مؤهل' },
  { value: 'won',       label: 'فوز' },
  { value: 'lost',      label: 'خسارة' },
];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, transform: active && dir === 'asc' ? 'scaleY(-1)' : 'none', flexShrink: 0 }}>
      <path d="M6 8.5 1.5 4h9L6 8.5z" />
    </svg>
  );
}

export default function LeadOwnershipPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | LeadDistStatus>('all');
  const [agentFilter, setAgentFilter]   = useState('all');
  const [search, setSearch]             = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('assignedAt');
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [changeOwnerLead, setChangeOwnerLead] = useState<LeadOwnership | null>(null);

  const filtered = useMemo(() => {
    let data = [...mockLeadOwnership];
    if (statusFilter !== 'all') data = data.filter(l => l.status === statusFilter);
    if (agentFilter !== 'all') data = data.filter(l => l.currentOwner === agentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(l =>
        l.leadName.includes(q) ||
        l.phone.includes(q) ||
        (l.company ?? '').includes(q) ||
        l.currentOwner.includes(q)
      );
    }
    data.sort((a, b) => {
      const av = sortKey === 'expectedValue' ? a[sortKey] : String(a[sortKey] ?? '');
      const bv = sortKey === 'expectedValue' ? b[sortKey] : String(b[sortKey] ?? '');
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [statusFilter, agentFilter, search, sortKey, sortDir]);

  const totalValue = filtered.reduce((s, l) => s + l.expectedValue, 0);
  const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l.leadId));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) filtered.forEach(l => next.delete(l.leadId));
      else filtered.forEach(l => next.add(l.leadId));
      return next;
    });
  }

  const statusCounts = useMemo(() =>
    mockLeadOwnership.reduce<Partial<Record<LeadDistStatus, number>>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {}), []);

  const uniqueAgents = [...new Set(mockLeadOwnership.map(l => l.currentOwner))];

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">ملكية العملاء المحتملين</h2>
          <p className="page-subtitle">
            {filtered.length} نتيجة · إجمالي القيمة: {fNum(totalValue, 0)} ر.س
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
        </div>
      </div>

      {/* Status Filter chips */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)' }}>
        <div className="leads-filter-chips">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-chip${statusFilter === f.value ? ' active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              {f.value !== 'all' && statusCounts[f.value as LeadDistStatus] != null && (
                <span className="filter-chip-count">{statusCounts[f.value as LeadDistStatus]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="leads-search">
          <span className="leads-search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="search"
            placeholder="البحث بالاسم أو الهاتف أو المندوب…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Agent filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-4)', flexWrap: 'wrap' }}>
        <button
          className={`filter-chip${agentFilter === 'all' ? ' active' : ''}`}
          onClick={() => setAgentFilter('all')}
        >
          جميع المندوبين
        </button>
        {uniqueAgents.map(agent => {
          const agentData = mockDistributionAgents.find(a => a.name === agent);
          return (
            <button
              key={agent}
              className={`filter-chip${agentFilter === agent ? ' active' : ''}`}
              onClick={() => setAgentFilter(agent)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              {agentData && (
                <span style={{
                  inlineSize: 18, blockSize: 18, borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', fontWeight: 'var(--font-weight-bold)',
                }}>
                  {agentData.initials}
                </span>
              )}
              {agent}
              <span className="filter-chip-count">
                {mockLeadOwnership.filter(l => l.currentOwner === agent).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>تم تحديد <strong>{selected.size}</strong> عميل</span>
          <div className="bulk-bar-spacer" />
          <button className="btn-ghost" onClick={() => setSelected(new Set())}>إلغاء التحديد</button>
          <button className="btn-outline">إعادة التعيين الجماعي</button>
        </div>
      )}

      {/* Table */}
      <div className="ofs-card">
        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: 44, paddingInline: 'var(--space-3)' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    aria-label="تحديد الكل" style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                </th>
                <th className="sort-th" onClick={() => toggleSort('leadName')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    العميل <SortIcon active={sortKey === 'leadName'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('currentOwner')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    المالك الحالي <SortIcon active={sortKey === 'currentOwner'} dir={sortDir} />
                  </span>
                </th>
                <th>الفريق / الفرع</th>
                <th className="sort-th" onClick={() => toggleSort('status')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('assignedAt')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    تاريخ التعيين <SortIcon active={sortKey === 'assignedAt'} dir={sortDir} />
                  </span>
                </th>
                <th>آخر نشاط</th>
                <th className="sort-th" onClick={() => toggleSort('expectedValue')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    القيمة المتوقعة <SortIcon active={sortKey === 'expectedValue'} dir={sortDir} />
                  </span>
                </th>
                <th style={{ inlineSize: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty-cell">
                    <div className="table-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    لا توجد نتائج تطابق الفلتر المحدد
                  </td>
                </tr>
              ) : filtered.map(lead => (
                <tr key={lead.leadId} className={selected.has(lead.leadId) ? 'row-selected' : ''}>
                  <td style={{ paddingInline: 'var(--space-3)' }}>
                    <input type="checkbox" checked={selected.has(lead.leadId)}
                      onChange={() => toggleSelect(lead.leadId)}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      aria-label={`تحديد ${lead.leadName}`} />
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
                      {lead.leadName}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>
                      {lead.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{
                        inlineSize: 28, blockSize: 28, borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                      }}>
                        {lead.currentOwnerInitials}
                      </span>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                        {lead.currentOwner}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 2 }}>
                      {lead.team}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
                      {lead.branch}
                    </div>
                  </td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {lead.assignedAt}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {lead.lastActivity}
                  </td>
                  <td className="num">{fNum(lead.expectedValue, 0)} ر.س</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-ghost"
                        style={{ paddingInline: 'var(--space-2)', paddingBlock: '4px', fontSize: 'var(--font-size-xs)' }}
                        onClick={() => setChangeOwnerLead(lead)}
                        title="تغيير المالك"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                          <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                        تغيير
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div style={{
          paddingInline: 'var(--space-5)', paddingBlock: 'var(--space-3)',
          borderBlockStart: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            عرض {filtered.length} من {mockLeadOwnership.length} عميل
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
            الإجمالي: {fNum(totalValue, 0)} ر.س
          </span>
        </div>
      </div>

      {/* Change Owner Modal */}
      {changeOwnerLead && (
        <ChangeOwnerModal lead={changeOwnerLead} onClose={() => setChangeOwnerLead(null)} />
      )}
    </>
  );
}

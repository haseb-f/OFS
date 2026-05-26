'use client';

import { useState, useMemo } from 'react';
import {
  mockQueuedLeads,
  mockDistributionAgents,
  type QueuedLead,
} from '@/lib/lead-distribution-mock-data';
import { fNum } from '@/lib/format';

// ── Priority Config ───────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { label: 'عالية',    bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
  medium: { label: 'متوسطة',   bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  low:    { label: 'منخفضة',   bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' },
};

function PriorityBadge({ priority }: { priority: QueuedLead['priority'] }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      paddingInline: 'var(--space-2)', paddingBlock: '2px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      <span style={{ inlineSize: 6, blockSize: 6, borderRadius: 'var(--radius-full)', background: c.dot }} />
      {c.label}
    </span>
  );
}

function WaitBadge({ minutes }: { minutes: number }) {
  const isUrgent = minutes >= 60;
  const isWarning = minutes >= 30 && minutes < 60;
  const color = isUrgent ? '#b91c1c' : isWarning ? '#b45309' : '#475569';
  const bg = isUrgent ? '#fef2f2' : isWarning ? '#fffbeb' : '#f8fafc';
  const label = minutes < 60
    ? `${minutes} دقيقة`
    : `${Math.floor(minutes / 60)} ساعة ${minutes % 60 > 0 ? `${minutes % 60} د` : ''}`;
  return (
    <span style={{
      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
      color, background: bg,
      paddingInline: 'var(--space-2)', paddingBlock: '2px',
      borderRadius: 'var(--radius-sm)',
    }}>
      {label}
    </span>
  );
}

// ── Assign Modal ──────────────────────────────────────────────────────────────

function AssignModal({ lead, onClose }: { lead: QueuedLead; onClose: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          inlineSize: 440,
          boxShadow: 'var(--shadow-elevated)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBlockEnd: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0, marginBlockEnd: 'var(--space-1)' }}>
            تعيين عميل محتمل
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            {lead.name} · {lead.city}
          </p>
        </div>

        <div style={{ marginBlockEnd: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-2)' }}>
            اختر المندوب
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {mockDistributionAgents.map(agent => (
              <label key={agent.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: `1px solid ${selectedAgent === agent.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: selectedAgent === agent.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
              }}>
                <input type="radio" name="agent" value={agent.id}
                  checked={selectedAgent === agent.id}
                  onChange={() => setSelectedAgent(agent.id)}
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
                    {agent.branch} · {agent.pendingCount} معلق
                  </div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: '#15803d', fontWeight: 'var(--font-weight-semibold)' }}>
                    {agent.conversionRate}%
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>تحويل</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn-cta" disabled={!selectedAgent} onClick={onClose}>
            تعيين الآن
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({ lead, onAssign }: { lead: QueuedLead; onAssign: () => void }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-3)',
      marginBlockEnd: 'var(--space-2)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBlockEnd: 'var(--space-2)' }}>
        <PriorityBadge priority={lead.priority} />
        <WaitBadge minutes={lead.waitingMinutes} />
      </div>

      <div style={{ marginBlockEnd: 'var(--space-2)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
          {lead.name}
        </div>
        {lead.company && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.company}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-2)' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.city}</span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>·</span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.source}</span>
      </div>

      {lead.requiredSkills && lead.requiredSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBlockEnd: 'var(--space-2)' }}>
          {lead.requiredSkills.map(skill => (
            <span key={skill} style={{
              paddingInline: 'var(--space-2)', paddingBlock: '1px',
              background: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-sm)',
              fontSize: '0.65rem', color: '#7c3aed',
            }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBlockStart: 'var(--space-2)',
        borderBlockStart: '1px solid var(--color-border-subtle)',
        marginBlockStart: 'var(--space-2)',
      }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
          {fNum(lead.expectedValue, 0)} ر.س
        </span>
        <button
          className="btn-cta"
          style={{ paddingInline: 'var(--space-3)', paddingBlock: '4px', fontSize: 'var(--font-size-xs)' }}
          onClick={onAssign}
        >
          تعيين
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ViewMode = 'kanban' | 'table';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

const PRIORITY_COLS = [
  { key: 'high' as const,   ...PRIORITY_CONFIG.high,   label: 'أولوية عالية' },
  { key: 'medium' as const, ...PRIORITY_CONFIG.medium, label: 'أولوية متوسطة' },
  { key: 'low' as const,    ...PRIORITY_CONFIG.low,    label: 'أولوية منخفضة' },
];

export default function DistributionQueuePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignLead, setAssignLead] = useState<QueuedLead | null>(null);
  const [bulkAssignAgent, setBulkAssignAgent] = useState('');
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  const filtered = useMemo(() => {
    let data = [...mockQueuedLeads];
    if (priorityFilter !== 'all') data = data.filter(l => l.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(l =>
        l.name.includes(q) ||
        l.city.includes(q) ||
        (l.company ?? '').includes(q) ||
        l.source.includes(q)
      );
    }
    return data;
  }, [priorityFilter, search]);

  const totalValue = filtered.reduce((s, l) => s + l.expectedValue, 0);
  const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id));

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
      if (allSelected) filtered.forEach(l => next.delete(l.id));
      else filtered.forEach(l => next.add(l.id));
      return next;
    });
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">طابور التوزيع</h2>
          <p className="page-subtitle">
            {filtered.length} عميل في الانتظار · قيمة متوقعة: {fNum(totalValue, 0)} ر.س
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {selected.size > 0 && (
            <button className="btn-cta" onClick={() => setShowBulkPanel(true)}>
              تعيين جماعي ({selected.size})
            </button>
          )}
          {/* View toggle */}
          <div style={{
            display: 'flex', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)', overflow: 'hidden',
          }}>
            {(['kanban', 'table'] as const).map(mode => (
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
                }}
              >
                {mode === 'kanban' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="leads-filter-chips">
          <button className={`filter-chip${priorityFilter === 'all' ? ' active' : ''}`} onClick={() => setPriorityFilter('all')}>
            الكل <span className="filter-chip-count">{mockQueuedLeads.length}</span>
          </button>
          {(['high', 'medium', 'low'] as const).map(p => {
            const count = mockQueuedLeads.filter(l => l.priority === p).length;
            return (
              <button key={p} className={`filter-chip${priorityFilter === p ? ' active' : ''}`} onClick={() => setPriorityFilter(p)}>
                {PRIORITY_CONFIG[p].label}
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
            placeholder="البحث بالاسم أو المدينة أو المصدر…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>تم تحديد <strong>{selected.size}</strong> عميل</span>
          <div className="bulk-bar-spacer" />
          <button className="btn-ghost" onClick={() => setSelected(new Set())}>إلغاء التحديد</button>
          <button className="btn-cta" onClick={() => setShowBulkPanel(true)}>تعيين جماعي</button>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div style={{
          display: 'flex', gap: 'var(--space-4)',
          overflowX: 'auto', paddingBlockEnd: 'var(--space-6)',
          alignItems: 'flex-start', minBlockSize: 'calc(100vh - 300px)',
        }}>
          {PRIORITY_COLS.map(col => {
            const colLeads = filtered.filter(l => l.priority === col.key);
            return (
              <div key={col.key} style={{ flexShrink: 0, inlineSize: 300, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {/* Column header */}
                <div style={{
                  background: col.bg, border: `1px solid ${col.border}`,
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
                  position: 'sticky', insetBlockStart: 0, zIndex: 2,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ inlineSize: 8, blockSize: 8, borderRadius: 'var(--radius-full)', background: col.dot }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: col.color }}>
                        {col.label}
                      </span>
                    </div>
                    <span style={{
                      inlineSize: 22, blockSize: 22, borderRadius: 'var(--radius-full)',
                      background: col.bg, border: `1px solid ${col.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: col.color,
                    }}>
                      {colLeads.length}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: col.color, opacity: 0.75 }}>
                    {fNum(colLeads.reduce((s, l) => s + l.expectedValue, 0), 0)} ر.س
                  </div>
                </div>

                {/* Cards */}
                <div style={{
                  background: col.bg, border: `1px solid ${col.border}`,
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-2)',
                  flex: 1, minBlockSize: 200,
                }}>
                  {colLeads.length === 0 ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      blockSize: 80, color: 'var(--color-text-subtle)',
                      fontSize: 'var(--font-size-xs)', flexDirection: 'column', gap: 'var(--space-2)',
                    }}>
                      لا يوجد عملاء في الانتظار
                    </div>
                  ) : colLeads.map(lead => (
                    <KanbanCard key={lead.id} lead={lead} onAssign={() => setAssignLead(lead)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="ofs-card">
          <div className="ofs-table-wrap">
            <table className="ofs-table">
              <thead>
                <tr>
                  <th style={{ inlineSize: 44, paddingInline: 'var(--space-3)' }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      aria-label="تحديد الكل" style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                  </th>
                  <th>العميل</th>
                  <th>المدينة</th>
                  <th>المصدر</th>
                  <th>الأولوية</th>
                  <th>وقت الانتظار</th>
                  <th>القيمة المتوقعة</th>
                  <th>المهارات المطلوبة</th>
                  <th style={{ inlineSize: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="table-empty-cell">
                      <div className="table-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                        </svg>
                      </div>
                      طابور التوزيع فارغ
                    </td>
                  </tr>
                ) : filtered.map(lead => (
                  <tr key={lead.id} className={selected.has(lead.id) ? 'row-selected' : ''}>
                    <td style={{ paddingInline: 'var(--space-3)' }}>
                      <input type="checkbox" checked={selected.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        aria-label={`تحديد ${lead.name}`} />
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
                        {lead.name}
                      </div>
                      {lead.company && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.company}</div>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{lead.city}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{lead.source}</td>
                    <td><PriorityBadge priority={lead.priority} /></td>
                    <td><WaitBadge minutes={lead.waitingMinutes} /></td>
                    <td className="num">{fNum(lead.expectedValue, 0)} ر.س</td>
                    <td>
                      {lead.requiredSkills && lead.requiredSkills.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {lead.requiredSkills.map(s => (
                            <span key={s} style={{
                              paddingInline: 6, paddingBlock: 1,
                              background: '#faf5ff', border: '1px solid #ddd6fe',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.65rem', color: '#7c3aed',
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-xs)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-cta"
                        style={{ paddingInline: 'var(--space-3)', paddingBlock: '4px', fontSize: 'var(--font-size-xs)' }}
                        onClick={() => setAssignLead(lead)}>
                        تعيين
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Assign Panel */}
      {showBulkPanel && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowBulkPanel(false)}>
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', inlineSize: 440,
            boxShadow: 'var(--shadow-elevated)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0, marginBlockEnd: 'var(--space-1)' }}>
              تعيين جماعي
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>
              تعيين {selected.size} عميل لمندوب واحد
            </p>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-2)' }}>
              المندوب المُعيَّن
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBlockEnd: 'var(--space-5)' }}>
              {mockDistributionAgents.map(agent => (
                <label key={agent.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  border: `1px solid ${bulkAssignAgent === agent.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: bulkAssignAgent === agent.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                }}>
                  <input type="radio" name="bulk-agent" value={agent.id}
                    checked={bulkAssignAgent === agent.id}
                    onChange={() => setBulkAssignAgent(agent.id)}
                    style={{ accentColor: 'var(--color-primary)' }} />
                  <span style={{
                    inlineSize: 30, blockSize: 30, borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 'var(--font-weight-bold)', flexShrink: 0,
                  }}>
                    {agent.initials}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>{agent.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{agent.branch} · {agent.pendingCount} معلق حالياً</div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: '#15803d', fontWeight: 'var(--font-weight-semibold)' }}>
                    {agent.conversionRate}%
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowBulkPanel(false)}>إلغاء</button>
              <button className="btn-cta" disabled={!bulkAssignAgent} onClick={() => { setShowBulkPanel(false); setSelected(new Set()); }}>
                تعيين {selected.size} عميل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Assign Modal */}
      {assignLead && (
        <AssignModal lead={assignLead} onClose={() => setAssignLead(null)} />
      )}
    </>
  );
}

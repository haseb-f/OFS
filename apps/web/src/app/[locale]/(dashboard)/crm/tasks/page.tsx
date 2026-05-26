'use client';

import { useState, useMemo } from 'react';
import {
  mockCrmTasks,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type CrmTaskPriority,
  type CrmTaskStatus,
} from '@/lib/crm-mock-data';



const STATUS_FILTERS: { value: 'all' | CrmTaskStatus; label: string }[] = [
  { value: 'all',         label: 'كل الحالات' },
  { value: 'open',        label: 'مفتوح' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'waiting',     label: 'في الانتظار' },
  { value: 'completed',   label: 'مكتمل' },
  { value: 'cancelled',   label: 'ملغي' },
];

const PRIORITY_COLORS: Record<CrmTaskPriority, { bg: string; color: string; dot: string }> = {
  low:      { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  medium:   { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
  high:     { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  critical: { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
};

const STATUS_COLORS: Record<CrmTaskStatus, { bg: string; color: string }> = {
  open:        { bg: '#f1f5f9', color: '#475569' },
  in_progress: { bg: '#eff6ff', color: '#1d4ed8' },
  waiting:     { bg: '#fffbeb', color: '#b45309' },
  completed:   { bg: '#f0fdf4', color: '#15803d' },
  cancelled:   { bg: '#fef2f2', color: '#b91c1c' },
};

type SortKey = 'name' | 'customerName' | 'assignedUser' | 'priority' | 'dueDate' | 'status';

const PRIORITY_ORDER: Record<CrmTaskPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const STATUS_ORDER: Record<CrmTaskStatus, number> = { open: 5, in_progress: 4, waiting: 3, completed: 2, cancelled: 1 };

const PAGE_SIZE = 10;

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, transform: active && dir === 'asc' ? 'scaleY(-1)' : 'none', flexShrink: 0 }}>
      <path d="M6 8.5 1.5 4h9L6 8.5z" />
    </svg>
  );
}

export default function TasksCenterPage() {
  const [search,          setSearch]          = useState('');
  const [priorityFilter,  setPriorityFilter]  = useState<'all' | CrmTaskPriority>('all');
  const [statusFilter,    setStatusFilter]    = useState<'all' | CrmTaskStatus>('all');
  const [selected,        setSelected]        = useState<Set<string>>(new Set());
  const [sortKey,         setSortKey]         = useState<SortKey>('dueDate');
  const [sortDir,         setSortDir]         = useState<'asc' | 'desc'>('asc');
  const [page,            setPage]            = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockCrmTasks];
    if (priorityFilter !== 'all') data = data.filter(t => t.priority === priorityFilter);
    if (statusFilter !== 'all')   data = data.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(t =>
        t.name.includes(q) ||
        t.customerName.includes(q) ||
        t.assignedUser.includes(q)
      );
    }
    data.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === 'priority') {
        av = PRIORITY_ORDER[a.priority];
        bv = PRIORITY_ORDER[b.priority];
      } else if (sortKey === 'status') {
        av = STATUS_ORDER[a.status];
        bv = STATUS_ORDER[b.status];
      } else {
        av = String(a[sortKey] ?? '').toLowerCase();
        bv = String(b[sortKey] ?? '').toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [search, priorityFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  const allPageSelected = paged.length > 0 && paged.every(t => selected.has(t.id));
  function toggleAll() {
    setSelected(prev => {
      const n = new Set(prev);
      if (allPageSelected) paged.forEach(t => n.delete(t.id));
      else paged.forEach(t => n.add(t.id));
      return n;
    });
  }

  const statusCounts = useMemo(() =>
    mockCrmTasks.reduce<Partial<Record<CrmTaskStatus, number>>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {}),
  []);

  const priorityCounts = useMemo(() =>
    mockCrmTasks.reduce<Partial<Record<CrmTaskPriority, number>>>((acc, t) => {
      acc[t.priority] = (acc[t.priority] ?? 0) + 1;
      return acc;
    }, {}),
  []);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز المهام</h2>
          <p className="page-subtitle">
            {filtered.length} مهمة
            {priorityFilter !== 'all' && ` · ${TASK_PRIORITY_LABELS[priorityFilter]}`}
            {statusFilter !== 'all' && ` · ${TASK_STATUS_LABELS[statusFilter]}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            مهمة جديدة
          </button>
        </div>
      </div>

      {/* Priority overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBlockEnd: 'var(--space-5)' }}>
        {(['critical', 'high', 'medium', 'low'] as CrmTaskPriority[]).map(priority => {
          const pc = PRIORITY_COLORS[priority];
          const count = priorityCounts[priority] ?? 0;
          const isActive = priorityFilter === priority;
          return (
            <button
              key={priority}
              onClick={() => { setPriorityFilter(isActive ? 'all' : priority); setPage(1); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: isActive ? pc.bg : 'var(--color-surface)',
                border: `1px solid ${isActive ? pc.dot + '80' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-xl)',
                cursor: 'pointer',
                textAlign: 'start',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ inlineSize: 10, blockSize: 10, borderRadius: 'var(--radius-full)', background: pc.dot, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
                  {TASK_PRIORITY_LABELS[priority]}
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: isActive ? pc.color : 'var(--color-text)' }}>
                  {count}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="leads-filter-chips" style={{ flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                className={`filter-chip${statusFilter === f.value ? ' active' : ''}`}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
              >
                {f.label}
                {f.value !== 'all' && statusCounts[f.value] != null && (
                  <span className="filter-chip-count">{statusCounts[f.value]}</span>
                )}
              </button>
            ))}
          </div>
          {(priorityFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="btn-ghost"
              style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)' }}
              onClick={() => { setPriorityFilter('all'); setStatusFilter('all'); setPage(1); }}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
        <div className="leads-search">
          <span className="leads-search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="search"
            placeholder="البحث بالمهمة أو العميل أو المسؤول…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>تم تحديد <strong>{selected.size}</strong> مهمة</span>
          <div className="bulk-bar-spacer" />
          <button className="btn-ghost" onClick={() => setSelected(new Set())}>إلغاء التحديد</button>
          <button className="btn-outline" style={{ color: 'var(--color-status-rejected)', borderColor: 'var(--color-status-rejected)' }}>
            حذف المحدد
          </button>
        </div>
      )}

      {/* Table */}
      <div className="ofs-card">
        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: 44, paddingInline: 'var(--space-3)' }}>
                  <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                    aria-label="تحديد الكل"
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                </th>
                <th className="sort-th" onClick={() => toggleSort('name')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    اسم المهمة <SortIcon active={sortKey === 'name'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('customerName')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    العميل <SortIcon active={sortKey === 'customerName'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('assignedUser')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    المسؤول <SortIcon active={sortKey === 'assignedUser'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('priority')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    الأولوية <SortIcon active={sortKey === 'priority'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('dueDate')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    تاريخ الاستحقاق <SortIcon active={sortKey === 'dueDate'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('status')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} />
                  </span>
                </th>
                <th style={{ inlineSize: 64 }}></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">
                    <div className="table-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                    </div>
                    لا توجد مهام تطابق معايير البحث
                  </td>
                </tr>
              ) : paged.map(task => {
                const pc = PRIORITY_COLORS[task.priority];
                const sc = STATUS_COLORS[task.status];
                return (
                  <tr key={task.id} className={selected.has(task.id) ? 'row-selected' : ''}>
                    <td style={{ paddingInline: 'var(--space-3)', inlineSize: 44 }}>
                      <input type="checkbox" checked={selected.has(task.id)} onChange={() => toggleSelect(task.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        aria-label={`تحديد ${task.name}`} />
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                        {task.name}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{task.customerName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                          inlineSize: 26, blockSize: 26, borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
                          flexShrink: 0,
                        }}>
                          {task.assignedUserInitials}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{task.assignedUser}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                        paddingInline: 'var(--space-2)', paddingBlock: '2px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        background: pc.bg, color: pc.color,
                      }}>
                        <span style={{ inlineSize: 6, blockSize: 6, borderRadius: 'var(--radius-full)', background: pc.dot, flexShrink: 0 }} />
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {task.dueDate}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        paddingInline: 'var(--space-2)', paddingBlock: '2px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        background: sc.bg, color: sc.color,
                      }}>
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button className="btn-ghost" style={{ padding: '6px', borderRadius: 'var(--radius-md)' }} title="تعديل">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="leads-pagination">
            <span className="pagination-info">
              عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
            <div className="pagination-controls">
              <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', paddingInline: 'var(--space-3)' }}
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-page${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', paddingInline: 'var(--space-3)' }}
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>التالي</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

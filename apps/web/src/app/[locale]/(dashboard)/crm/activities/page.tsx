'use client';

import { useState, useMemo } from 'react';
import {
  mockCrmActivities,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_STATUS_LABELS,
  type CrmActivityType,
  type CrmActivityStatus,
} from '@/lib/crm-mock-data';

const TYPE_FILTERS: { value: 'all' | CrmActivityType; label: string }[] = [
  { value: 'all',      label: 'الكل' },
  { value: 'call',     label: 'مكالمة' },
  { value: 'meeting',  label: 'اجتماع' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'email',    label: 'بريد إلكتروني' },
  { value: 'visit',    label: 'زيارة' },
  { value: 'followup', label: 'متابعة' },
];

const STATUS_FILTERS: { value: 'all' | CrmActivityStatus; label: string }[] = [
  { value: 'all',       label: 'كل الحالات' },
  { value: 'scheduled', label: 'مجدول' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

const TYPE_COLORS: Record<CrmActivityType, { bg: string; color: string }> = {
  call:     { bg: '#f0fdf4', color: '#15803d' },
  meeting:  { bg: '#eff6ff', color: '#1d4ed8' },
  whatsapp: { bg: '#f0fdf4', color: '#059669' },
  email:    { bg: '#f5f3ff', color: '#6d28d9' },
  visit:    { bg: '#fff7ed', color: '#c2410c' },
  followup: { bg: '#fffbeb', color: '#b45309' },
};

const STATUS_COLORS: Record<CrmActivityStatus, { bg: string; color: string }> = {
  scheduled: { bg: '#eff6ff', color: '#1d4ed8' },
  completed: { bg: '#f0fdf4', color: '#15803d' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c' },
};

function ActivityIcon({ type }: { type: CrmActivityType }) {
  const icons: Record<CrmActivityType, React.ReactNode> = {
    call:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.82 19.79 19.79 0 0 1 .93 1.18 2 2 0 0 1 2.92 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6z"/></svg>,
    meeting:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    whatsapp: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    email:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    visit:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    followup: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return <>{icons[type]}</>;
}

const PAGE_SIZE = 10;

export default function ActivitiesCenterPage() {

  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState<'all' | CrmActivityType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CrmActivityStatus>('all');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockCrmActivities];
    if (typeFilter !== 'all')   data = data.filter(a => a.type === typeFilter);
    if (statusFilter !== 'all') data = data.filter(a => a.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(a =>
        a.subject.includes(q) ||
        a.customerName.includes(q) ||
        a.assignedUser.includes(q)
      );
    }
    return data;
  }, [search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typeCounts = useMemo(() =>
    mockCrmActivities.reduce<Partial<Record<CrmActivityType, number>>>((acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + 1;
      return acc;
    }, {}),
  []);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز الأنشطة</h2>
          <p className="page-subtitle">
            {filtered.length} نشاط
            {typeFilter !== 'all' && ` · ${ACTIVITY_TYPE_LABELS[typeFilter]}`}
            {statusFilter !== 'all' && ` · ${ACTIVITY_STATUS_LABELS[statusFilter]}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            نشاط جديد
          </button>
        </div>
      </div>

      {/* Activity type quick cards */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBlockEnd: 'var(--space-5)', overflowX: 'auto', paddingBlockEnd: 2 }}>
        {TYPE_FILTERS.filter(f => f.value !== 'all').map(f => {
          const tc = TYPE_COLORS[f.value as CrmActivityType];
          const count = typeCounts[f.value as CrmActivityType] ?? 0;
          const isActive = typeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: isActive ? tc.bg : 'var(--color-surface)',
                border: `1px solid ${isActive ? tc.color + '40' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-xl)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-md)', background: isActive ? 'white' : tc.bg, color: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ActivityIcon type={f.value as CrmActivityType} />
              </span>
              <div style={{ textAlign: 'start' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: isActive ? tc.color : 'var(--color-text)' }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
                  {count} نشاط
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Search toolbar */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as 'all' | CrmActivityStatus); setPage(1); }}
            className="form-select"
            style={{ minInlineSize: 160, fontSize: 'var(--font-size-sm)' }}
            aria-label="تصفية بالحالة"
          >
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          {(typeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="btn-ghost"
              style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)' }}
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setPage(1); }}
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
            placeholder="البحث بالموضوع أو العميل أو المسؤول…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Activities list */}
      <div className="ofs-card">
        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: 52 }}>النوع</th>
                <th>الموضوع</th>
                <th>العميل</th>
                <th>المسؤول</th>
                <th>التاريخ</th>
                <th>المدة</th>
                <th>الحالة</th>
                <th style={{ inlineSize: 64 }}></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">
                    <div className="table-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    لا توجد أنشطة تطابق معايير البحث
                  </td>
                </tr>
              ) : paged.map(act => {
                const tc = TYPE_COLORS[act.type];
                const sc = STATUS_COLORS[act.status];
                return (
                  <tr key={act.id}>
                    <td style={{ paddingInline: 'var(--space-3)' }}>
                      <div style={{
                        inlineSize: 36, blockSize: 36, borderRadius: 'var(--radius-lg)',
                        background: tc.bg, color: tc.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ActivityIcon type={act.type} />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                        {act.subject}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {ACTIVITY_TYPE_LABELS[act.type]}
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{act.customerName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                          inlineSize: 26, blockSize: 26, borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
                          flexShrink: 0,
                        }}>
                          {act.assignedUserInitials}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{act.assignedUser}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{act.date}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {act.duration ? `${act.duration} دق` : '—'}
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
                        {ACTIVITY_STATUS_LABELS[act.status]}
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

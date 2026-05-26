'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockJournalEntries,
  JOURNAL_STATUS_LABELS,
  type JournalEntryStatus,
  type JournalEntry,
} from '@/lib/mock-data';
import OfsSelect from '@/components/ui/OfsSelect';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<JournalEntryStatus, string> = {
  posted: 'journal-status-posted',
  draft:  'journal-status-draft',
  void:   'journal-status-void',
};

function JournalStatusBadge({ status }: { status: JournalEntryStatus }) {
  return (
    <span className={`status-badge ${STATUS_CLASS[status]}`}>
      {JOURNAL_STATUS_LABELS[status]}
    </span>
  );
}

// ── Expandable row ────────────────────────────────────────────────────────────

function JournalRow({ entry, locale }: { entry: JournalEntry; locale: string }) {
  const [open, setOpen] = useState(false);
  const balanced = entry.totalDebit === entry.totalCredit;

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <td>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineEnd: 'var(--space-2)' }}>
            {open ? '▼' : '▶'}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
            {entry.entryNumber}
          </span>
        </td>
        <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{entry.date}</td>
        <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.descriptionAr}
        </td>
        <td>
          {entry.reference && (
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', padding: '1px 5px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              {entry.reference}
            </span>
          )}
        </td>
        <td className="col-amount">
          <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
            {fNum(entry.totalDebit)}
          </span>
        </td>
        <td className="col-amount">
          <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
            {fNum(entry.totalCredit)}
          </span>
        </td>
        <td>
          <span className={`je-balanced-chip ${balanced ? 'balanced' : 'unbalanced'}`}>
            {balanced ? '✓ متوازن' : '✗ غير متوازن'}
          </span>
        </td>
        <td><JournalStatusBadge status={entry.status} /></td>
        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{entry.createdBy}</td>
        <td>
          <Link
            href={`/${locale}/accounting/journal/${entry.id}`}
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
            onClick={e => e.stopPropagation()}
          >
            عرض
          </Link>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={10} style={{ padding: 0 }}>
            <div className="je-lines-panel">
              <div className="je-lines-table-wrap">
                <table className="acc-table" style={{ minInlineSize: 640 }}>
                  <thead>
                    <tr>
                      <th>كود الحساب</th>
                      <th>اسم الحساب</th>
                      <th>البيان</th>
                      <th className="col-amount">مدين</th>
                      <th className="col-amount">دائن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td><span className="coa-code-chip">{line.accountCode}</span></td>
                        <td style={{ paddingInlineStart: line.credit > 0 ? 'calc(var(--space-4) + 24px)' : undefined }}>
                          {line.accountNameAr}
                        </td>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {line.descriptionAr ?? '—'}
                        </td>
                        <td className="col-amount">
                          {line.debit > 0
                            ? <span className="amount-debit">{line.debit === 0 ? '—' : fNum(line.debit)}</span>
                            : <span className="amount-zero">—</span>}
                        </td>
                        <td className="col-amount">
                          {line.credit > 0
                            ? <span className="amount-credit">{line.credit === 0 ? '—' : fNum(line.credit)}</span>
                            : <span className="amount-zero">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="totals-label">الإجمالي</td>
                      <td className="col-amount">
                        <span className={balanced ? 'amount-balanced' : 'amount-unbalanced'}>
                          {fNum(entry.totalDebit)}
                        </span>
                      </td>
                      <td className="col-amount">
                        <span className={balanced ? 'amount-balanced' : 'amount-unbalanced'}>
                          {fNum(entry.totalCredit)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {entry.notes && (
                <p style={{ marginBlockStart: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  ملاحظة: {entry.notes}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export default function JournalPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JournalEntryStatus | 'all'>('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockJournalEntries];
    if (statusFilter !== 'all') data = data.filter(e => e.status === statusFilter);
    if (dateFrom) data = data.filter(e => e.dateIso >= dateFrom);
    if (dateTo)   data = data.filter(e => e.dateIso <= dateTo);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(e =>
        e.entryNumber.toLowerCase().includes(q) ||
        e.descriptionAr.includes(q) ||
        (e.reference ?? '').toLowerCase().includes(q),
      );
    }
    return data.sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  }, [search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const grandDebit  = filtered.reduce((s, e) => s + (e.status !== 'void' ? e.totalDebit : 0), 0);
  const grandCredit = filtered.reduce((s, e) => s + (e.status !== 'void' ? e.totalCredit : 0), 0);

  const posted  = mockJournalEntries.filter(e => e.status === 'posted').length;
  const drafts  = mockJournalEntries.filter(e => e.status === 'draft').length;
  const voids   = mockJournalEntries.filter(e => e.status === 'void').length;

  const hasFilters = search || statusFilter !== 'all' || entryTypeFilter !== 'all' || dateFrom || dateTo;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">القيود اليومية</h2>
          <p className="page-subtitle">دفتر اليومية — {mockJournalEntries.length} قيد</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          قيد جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>

        <div className="kpi-card je-kpi-card">
          <div className="je-kpi-icon je-kpi-icon--total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="kpi-card-value">{mockJournalEntries.length}</div>
          <div className="kpi-card-label">إجمالي القيود</div>
        </div>

        <div className="kpi-card je-kpi-card">
          <div className="je-kpi-icon je-kpi-icon--posted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: 'var(--color-status-active)' }}>{posted}</div>
          <div className="kpi-card-label">مرحّلة</div>
        </div>

        <div className="kpi-card je-kpi-card">
          <div className="je-kpi-icon je-kpi-icon--draft">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: '#64748b' }}>{drafts}</div>
          <div className="kpi-card-label">مسودات</div>
        </div>

        <div className="kpi-card je-kpi-card">
          <div className="je-kpi-icon je-kpi-icon--void">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: '#b91c1c' }}>{voids}</div>
          <div className="kpi-card-label">ملغاة</div>
        </div>

      </div>

      {/* Filters */}
      <div className="ofs-card je-filters-toolbar">

        <div className="je-filters-search">
          <input
            type="search"
            placeholder="بحث برقم القيد أو البيان أو المرجع..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="ofs-input"
          />
        </div>

        <div className="je-filters-controls">
          <div className="je-filter-select">
            <OfsSelect
              options={[
                { value: 'all',    label: 'كل الحالات' },
                { value: 'posted', label: 'مرحّل' },
                { value: 'draft',  label: 'مسودة' },
                { value: 'void',   label: 'ملغي' },
              ]}
              value={statusFilter}
              onChange={v => { setStatusFilter(v as typeof statusFilter); setPage(1); }}
            />
          </div>

          <div className="je-filter-select">
            <OfsSelect
              options={[
                { value: 'all',       label: 'كل الأنواع' },
                { value: 'manual',    label: 'يدوي' },
                { value: 'automatic', label: 'تلقائي' },
                { value: 'opening',   label: 'افتتاحي' },
              ]}
              value={entryTypeFilter}
              onChange={v => { setEntryTypeFilter(v); setPage(1); }}
            />
          </div>

          <div className="je-date-range">
            <OfsDatePicker
              value={dateFrom}
              onChange={v => { setDateFrom(v); setPage(1); }}
              aria-label="من تاريخ"
            />
            <span className="je-date-range-sep" aria-hidden="true">—</span>
            <OfsDatePicker
              value={dateTo}
              onChange={v => { setDateTo(v); setPage(1); }}
              aria-label="إلى تاريخ"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setEntryTypeFilter('all');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              مسح الفلاتر
            </button>
          )}
        </div>

      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden', marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 900 }}>
            <thead>
              <tr>
                <th>رقم القيد</th>
                <th>التاريخ</th>
                <th>البيان</th>
                <th>المرجع</th>
                <th className="col-amount">مدين (ر.س)</th>
                <th className="col-amount">دائن (ر.س)</th>
                <th>التوازن</th>
                <th>الحالة</th>
                <th>بواسطة</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد قيود مطابقة
                  </td>
                </tr>
              ) : paginated.map(entry => (
                <JournalRow key={entry.id} entry={entry} locale={locale} />
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="totals-label">
                    إجمالي القيود المعروضة ({filtered.length} قيد)
                  </td>
                  <td className="col-amount">
                    <span className={grandDebit === grandCredit ? 'amount-balanced' : 'amount-unbalanced'}>
                      {fNum(grandDebit)}
                    </span>
                  </td>
                  <td className="col-amount">
                    <span className={grandDebit === grandCredit ? 'amount-balanced' : 'amount-unbalanced'}>
                      {fNum(grandCredit)}
                    </span>
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{page} / {totalPages}</span>
          <button className="btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</button>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useMemo } from 'react';
import {
  mockOutgoingOperations,
  type OperationRecord,
  type OperationPostingStatus,
  type OutgoingSourceType,
  OUTGOING_SOURCE_LABELS,
} from '@/lib/mock-data';
import { fNum, fDate } from '@/lib/format';
import OfsSelect from '@/components/ui/OfsSelect';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const POSTING_STATUS_CONFIG: Record<OperationPostingStatus, { label: string; color: string; bg: string }> = {
  unposted: { label: 'غير مرحّل',   color: '#6b7280', bg: '#f3f4f6' },
  posting:  { label: 'جارٍ الترحيل', color: '#b45309', bg: '#fef3c7' },
  posted:   { label: 'مرحّل',        color: '#16a34a', bg: '#dcfce7' },
  failed:   { label: 'فشل الترحيل', color: '#b91c1c', bg: '#fee2e2' },
};

const APPROVAL_CONFIG = {
  pending:  { label: 'معلق',   color: '#6b7280', bg: '#f3f4f6' },
  approved: { label: 'مُعتمد', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'مرفوض', color: '#b91c1c', bg: '#fee2e2' },
};

const ENTITY_ICON: Record<string, string> = {
  invoice:  '🧾',
  customer: '👤',
  vendor:   '🏭',
  journal:  '📒',
  order:    '📦',
};

const SOURCE_TYPES: OutgoingSourceType[] = [
  'vendor_payment', 'payroll', 'expense', 'advance', 'tax_payment', 'operational_payment',
];

// ─────────────────────────────────────────────────────────────────────────────
// Summary Card
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="ofs-card" style={{ flex: 1, minInlineSize: 160 }}>
      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-1)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: color ?? 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Posting Status Badge
// ─────────────────────────────────────────────────────────────────────────────

function PostingBadge({ status }: { status: OperationPostingStatus }) {
  const cfg = POSTING_STATUS_CONFIG[status];
  return (
    <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color, fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OutgoingOperationsPage() {
  const [records, setRecords]         = useState<OperationRecord[]>(mockOutgoingOperations);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());
  const [search, setSearch]           = useState('');
  const [filterPosting, setFilterPosting] = useState<OperationPostingStatus | ''>('');
  const [filterSource, setFilterSource]   = useState<OutgoingSourceType | ''>('');
  const [refreshing, setRefreshing]   = useState(false);

  const lastRefreshed = '24 May 2026، 17:42';

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filterPosting && r.postingStatus !== filterPosting) return false;
      if (filterSource  && r.sourceType   !== filterSource)  return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.partyName.toLowerCase().includes(q) && !r.reference.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [records, filterPosting, filterSource, search]);

  const stats = useMemo(() => ({
    total:    records.length,
    posted:   records.filter(r => r.postingStatus === 'posted').length,
    unposted: records.filter(r => r.postingStatus === 'unposted').length,
    failed:   records.filter(r => r.postingStatus === 'failed').length,
    totalAmount:    records.reduce((s, r) => s + r.amount, 0),
    postedAmount:   records.filter(r => r.postingStatus === 'posted').reduce((s, r) => s + r.amount, 0),
    unpostedAmount: records.filter(r => r.postingStatus === 'unposted').reduce((s, r) => s + r.amount, 0),
  }), [records]);

  const allSelected    = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const selectedOnView = filtered.filter(r => selected.has(r.id)).map(r => r.id);

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(r => n.add(r.id)); return n; });
    }
  }

  function toggleRow(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handlePost(ids: string[]) {
    setRecords(prev => prev.map(r => ids.includes(r.id) && r.postingStatus === 'unposted' && r.approvalStatus === 'approved'
      ? { ...r, postingStatus: 'posting' }
      : r
    ));
    setSelected(new Set());
    setTimeout(() => {
      setRecords(prev => prev.map(r => ids.includes(r.id) && r.postingStatus === 'posting'
        ? { ...r, postingStatus: 'posted', postedAt: '2026-05-24', postedBy: 'المستخدم الحالي', journalEntryId: `JE-2026-${1300 + Math.floor(Math.random() * 100)}` }
        : r
      ));
    }, 1800);
  }

  function handleApprove(ids: string[]) {
    setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
    setSelected(new Set());
  }

  function handleReject(ids: string[]) {
    setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));
    setSelected(new Set());
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1800);
  }

  const canPost = selectedOnView.length > 0 && selectedOnView.some(id => {
    const r = records.find(x => x.id === id);
    return r && r.postingStatus === 'unposted' && r.approvalStatus === 'approved';
  });

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز العمليات الصادرة</h2>
          <p className="page-subtitle">مراجعة وترحيل المدفوعات والمصروفات المستوردة</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            آخر تحديث: {lastRefreshed}
          </span>
          <button
            className="btn-cta"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minInlineSize: 130, justifyContent: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {refreshing ? 'جارٍ التحديث...' : 'تحديث البيانات'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-5)' }}>
        <SummaryCard label="إجمالي العمليات" value={String(stats.total)} />
        <SummaryCard label="إجمالي المدفوعات" value={`${fNum(stats.totalAmount)} SAR`} color="#b91c1c" />
        <SummaryCard label="المرحّلة" value={String(stats.posted)} sub={`${fNum(stats.postedAmount)} SAR`} color="#16a34a" />
        <SummaryCard label="غير المرحّلة" value={String(stats.unposted)} sub={`${fNum(stats.unpostedAmount)} SAR`} color="#b45309" />
        {stats.failed > 0 && <SummaryCard label="فشل الترحيل" value={String(stats.failed)} color="#b91c1c" />}
      </div>

      {/* Main Card */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="ofs-ops-toolbar" style={{ background: selectedOnView.length > 0 ? '#fff7ed' : 'transparent', transition: 'background 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <input
              type="search"
              className="form-input"
              placeholder="بحث برقم مرجعي أو اسم الطرف..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxInlineSize: 240, blockSize: 36, fontSize: 'var(--font-size-sm)' }}
            />
            <OfsSelect
              options={[{ value: '', label: 'كل حالات الترحيل' }, ...(Object.keys(POSTING_STATUS_CONFIG) as OperationPostingStatus[]).map(s => ({ value: s, label: POSTING_STATUS_CONFIG[s].label }))]}
              value={filterPosting}
              onChange={v => setFilterPosting(v as OperationPostingStatus | '')}
              size="sm"
            />
            <OfsSelect
              options={[{ value: '', label: 'كل أنواع المصادر' }, ...SOURCE_TYPES.map(s => ({ value: s, label: OUTGOING_SOURCE_LABELS[s] }))]}
              value={filterSource}
              onChange={v => setFilterSource(v as OutgoingSourceType | '')}
              size="sm"
            />
          </div>

          {selectedOnView.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginInlineStart: 'auto' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                {selectedOnView.length} محدد
              </span>
              <button
                className="btn-outline"
                onClick={() => handleReject(selectedOnView)}
                style={{ fontSize: 'var(--font-size-xs)', padding: '4px 12px', color: '#b91c1c', borderColor: '#fca5a5' }}
              >
                رفض
              </button>
              <button
                className="btn-outline"
                onClick={() => handleApprove(selectedOnView)}
                style={{ fontSize: 'var(--font-size-xs)', padding: '4px 12px', color: '#16a34a', borderColor: '#86efac' }}
              >
                اعتماد
              </button>
              {canPost && (
                <button
                  className="btn-cta"
                  onClick={() => handlePost(selectedOnView)}
                  style={{ fontSize: 'var(--font-size-xs)', padding: '4px 14px' }}
                >
                  ترحيل المحددة
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th style={{ inlineSize: 48 }}>#</th>
                <th style={{ inlineSize: 110 }}>التاريخ</th>
                <th style={{ inlineSize: 140 }}>نوع العملية</th>
                <th>الطرف / المرجع</th>
                <th style={{ inlineSize: 130 }}>المبلغ</th>
                <th style={{ inlineSize: 100 }}>الاعتماد</th>
                <th style={{ inlineSize: 110 }}>حالة الترحيل</th>
                <th style={{ inlineSize: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    لا توجد عمليات مطابقة
                  </td>
                </tr>
              )}
              {filtered.map(record => {
                const isExpanded = expanded.has(record.id);
                const isSelected = selected.has(record.id);
                const apCfg     = APPROVAL_CONFIG[record.approvalStatus];
                const hasDetails = record.linkedEntities.length > 0 || !!record.description || !!record.notes || !!record.journalEntryId;

                return (
                  <>
                    <tr key={record.id} style={{ background: isSelected ? '#fff7ed' : undefined }}>
                      <td><input type="checkbox" checked={isSelected} onChange={() => toggleRow(record.id)} /></td>
                      <td>
                        <button
                          onClick={() => hasDetails && toggleExpand(record.id)}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            cursor: hasDetails ? 'pointer' : 'default',
                            fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-xs)',
                            color: hasDetails ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            display: 'flex', alignItems: 'center', gap: 2,
                          }}
                        >
                          {hasDetails && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          )}
                          {record.rowNumber}
                        </button>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums' }}>
                        {fDate(record.transactionDate)}
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
                          {OUTGOING_SOURCE_LABELS[record.sourceType as OutgoingSourceType]}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{record.partyName}</span>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{record.reference}</span>
                        </div>
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                        {fNum(record.amount)} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{record.currency}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: apCfg.bg, color: apCfg.color, whiteSpace: 'nowrap' }}>
                          {apCfg.label}
                        </span>
                      </td>
                      <td><PostingBadge status={record.postingStatus} /></td>
                      <td>
                        {record.postingStatus === 'unposted' && record.approvalStatus === 'approved' && (
                          <button
                            className="btn-ghost"
                            onClick={() => handlePost([record.id])}
                            style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', color: 'var(--color-primary)' }}
                          >
                            ترحيل
                          </button>
                        )}
                        {record.postingStatus === 'failed' && (
                          <button
                            className="btn-ghost"
                            onClick={() => handlePost([record.id])}
                            style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', color: '#b91c1c' }}
                          >
                            إعادة محاولة
                          </button>
                        )}
                        {record.postingStatus === 'posting' && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>جارٍ...</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && hasDetails && (
                      <tr key={`${record.id}-exp`} style={{ background: '#fafafa' }}>
                        <td colSpan={9} style={{ padding: 'var(--space-3) var(--space-5) var(--space-3) calc(var(--space-5) + 48px)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {record.description && (
                              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                {record.description}
                              </p>
                            )}
                            {record.notes && (
                              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                <span>⚠</span> {record.notes}
                              </p>
                            )}
                            {record.postedAt && (
                              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#16a34a' }}>
                                رُحِّل بتاريخ {fDate(record.postedAt)} بواسطة {record.postedBy}
                              </p>
                            )}
                            {record.linkedEntities.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBlockStart: 'var(--space-1)' }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', alignSelf: 'center' }}>روابط:</span>
                                {record.linkedEntities.map(e => (
                                  <span key={e.id} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                    {ENTITY_ICON[e.type]} {e.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {records.some(r => r.postingStatus === 'unposted' && r.approvalStatus === 'approved') && (
          <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {records.filter(r => r.postingStatus === 'unposted' && r.approvalStatus === 'approved').length} عملية معتمدة وجاهزة للترحيل
            </span>
            <button
              className="btn-cta"
              onClick={() => handlePost(records.filter(r => r.postingStatus === 'unposted' && r.approvalStatus === 'approved').map(r => r.id))}
            >
              ترحيل الكل الجاهز
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

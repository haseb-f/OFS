'use client';

import { useState, useMemo } from 'react';

export interface ColumnDef {
  key: string;
  labelAr: string;
  width?: number;
  render?: (value: string, record: ReviewRecord) => React.ReactNode;
}

export interface ValidationMsg {
  field: string;
  fieldAr: string;
  message: string;
  type: 'error' | 'warning';
}

export interface SmartMatch {
  confidence: number;
  matchType: 'exact' | 'high' | 'medium' | 'low';
  matchedOn: string[];
  suggestedCustomerName: string;
  suggestedCustomerId?: string;
  suggestedOrderId?: string;
  suggestedInvoiceId?: string;
  suggestedAmount?: number;
  overrideApplied?: boolean;
}

export interface ReviewRecord {
  id: string;
  rowNumber: number;
  reviewStatus: 'ready' | 'needs_review' | 'duplicate' | 'error';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  fields: Record<string, string>;
  validationMessages: ValidationMsg[];
  smartMatch?: SmartMatch;
  notes?: string;
}

interface ImportReviewCenterProps {
  records: ReviewRecord[];
  columns: ColumnDef[];
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
  renderExtra?: (record: ReviewRecord) => React.ReactNode;
}

const TAB_CONFIG = [
  { key: 'ready',        labelAr: 'جاهز',          color: '#16a34a', bg: '#dcfce7' },
  { key: 'needs_review', labelAr: 'يحتاج مراجعة',  color: '#b45309', bg: '#fef3c7' },
  { key: 'duplicate',    labelAr: 'مكرر',           color: '#1d4ed8', bg: '#dbeafe' },
  { key: 'error',        labelAr: 'خطأ',            color: '#b91c1c', bg: '#fee2e2' },
] as const;

const APPROVAL_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'معلق',    color: '#6b7280', bg: '#f3f4f6' },
  approved: { label: 'مُعتمد', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'مرفوض',  color: '#b91c1c', bg: '#fee2e2' },
};

export default function ImportReviewCenter({ records, columns, onApprove, onReject, renderExtra }: ImportReviewCenterProps) {
  const [activeTab, setActiveTab] = useState<'ready' | 'needs_review' | 'duplicate' | 'error'>('ready');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const c: Record<string, number> = { ready: 0, needs_review: 0, duplicate: 0, error: 0 };
    records.forEach(r => { c[r.reviewStatus] = (c[r.reviewStatus] ?? 0) + 1; });
    return c;
  }, [records]);

  const tabRecords = useMemo(() => {
    return records.filter(r => {
      if (r.reviewStatus !== activeTab) return false;
      if (!search) return true;
      return Object.values(r.fields).some(v => v.toLowerCase().includes(search.toLowerCase()));
    });
  }, [records, activeTab, search]);

  const allSelected = tabRecords.length > 0 && tabRecords.every(r => selected.has(r.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); tabRecords.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); tabRecords.forEach(r => n.add(r.id)); return n; });
    }
  };

  const toggleRow = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSelected(new Set());
    setSearch('');
  };

  const selectedOnTab = tabRecords.filter(r => selected.has(r.id)).map(r => r.id);

  return (
    <div className="ofs-card" style={{ overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBlockEnd: '1px solid var(--color-border)', paddingInline: 'var(--space-5)' }}>
        {TAB_CONFIG.map(tab => {
          const active = activeTab === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                background: 'none',
                border: 'none',
                borderBlockEnd: active ? `2px solid ${tab.color}` : '2px solid transparent',
                color: active ? tab.color : 'var(--color-text-muted)',
                fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBlockEnd: -1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.labelAr}
              {count > 0 && (
                <span style={{ fontSize: 'var(--font-size-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: active ? tab.bg : 'var(--color-surface-raised)', color: active ? tab.color : 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ padding: 'var(--space-3) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)', background: selectedOnTab.length > 0 ? '#f0fdf4' : 'transparent', transition: 'background 0.15s' }}>
        <input
          type="search"
          className="form-input"
          placeholder="بحث..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220, height: 32, fontSize: 'var(--font-size-sm)' }}
        />
        {selectedOnTab.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginInlineStart: 'auto' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {selectedOnTab.length} محدد
            </span>
            <button
              className="btn-outline"
              onClick={() => { onReject(selectedOnTab); setSelected(new Set()); }}
              style={{ fontSize: 'var(--font-size-xs)', padding: '4px 12px', color: '#b91c1c', borderColor: '#fca5a5' }}
            >
              رفض المحددة
            </button>
            <button
              className="btn-cta"
              onClick={() => { onApprove(selectedOnTab); setSelected(new Set()); }}
              style={{ fontSize: 'var(--font-size-xs)', padding: '4px 12px' }}
            >
              اعتماد المحددة
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="ofs-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th style={{ width: 52 }}>#</th>
              {columns.map(col => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>{col.labelAr}</th>
              ))}
              <th style={{ width: 90 }}>الحالة</th>
              <th style={{ width: 90 }}>الاعتماد</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {tabRecords.length === 0 && (
              <tr>
                <td colSpan={columns.length + 5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  {search ? 'لا توجد نتائج مطابقة' : 'لا توجد سجلات في هذا القسم'}
                </td>
              </tr>
            )}
            {tabRecords.map(record => {
              const isExpanded = expanded.has(record.id);
              const hasMessages = record.validationMessages.length > 0;
              const hasExtra = !!renderExtra && !!record.smartMatch;
              const apSt = APPROVAL_STYLES[record.approvalStatus];
              const tabCfg = TAB_CONFIG.find(t => t.key === record.reviewStatus)!;

              return (
                <>
                  <tr key={record.id} style={{ background: selected.has(record.id) ? '#f0fdf4' : undefined }}>
                    <td>
                      <input type="checkbox" checked={selected.has(record.id)} onChange={() => toggleRow(record.id)} />
                    </td>
                    <td>
                      <button
                        onClick={() => (hasMessages || hasExtra) && toggleExpand(record.id)}
                        style={{
                          background: 'none', border: 'none', cursor: (hasMessages || hasExtra) ? 'pointer' : 'default',
                          fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-xs)',
                          color: (hasMessages || hasExtra) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          display: 'flex', alignItems: 'center', gap: 2, padding: 0,
                        }}
                      >
                        {(hasMessages || hasExtra) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        )}
                        {record.rowNumber}
                      </button>
                    </td>
                    {columns.map(col => (
                      <td key={col.key} style={{ fontSize: 'var(--font-size-sm)', maxWidth: col.width ?? 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.render ? col.render(record.fields[col.key] ?? '', record) : (record.fields[col.key] || <span style={{ color: 'var(--color-text-muted)' }}>—</span>)}
                      </td>
                    ))}
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: tabCfg.bg, color: tabCfg.color, whiteSpace: 'nowrap' }}>
                        {tabCfg.labelAr}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: apSt?.bg, color: apSt?.color, whiteSpace: 'nowrap' }}>
                        {apSt?.label}
                      </span>
                    </td>
                    <td>
                      {record.approvalStatus === 'pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                          <button
                            className="btn-ghost"
                            onClick={() => onReject([record.id])}
                            style={{ padding: '3px 8px', fontSize: 'var(--font-size-xs)', color: '#b91c1c' }}
                          >
                            رفض
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={() => onApprove([record.id])}
                            style={{ padding: '3px 8px', fontSize: 'var(--font-size-xs)', color: '#16a34a' }}
                          >
                            اعتماد
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (hasMessages || hasExtra) && (
                    <tr key={`${record.id}-expanded`} style={{ background: '#fafafa' }}>
                      <td colSpan={columns.length + 5} style={{ padding: 'var(--space-3) var(--space-5) var(--space-3) calc(var(--space-5) + 52px)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {hasMessages && record.validationMessages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                              <span style={{ color: msg.type === 'error' ? '#b91c1c' : '#b45309', flexShrink: 0 }}>
                                {msg.type === 'error' ? '✕' : '⚠'}
                              </span>
                              <span style={{ color: msg.type === 'error' ? '#b91c1c' : '#b45309' }}>
                                <strong>{msg.fieldAr}:</strong> {msg.message}
                              </span>
                            </div>
                          ))}
                          {hasExtra && renderExtra && (
                            <div style={{ marginBlockStart: hasMessages ? 'var(--space-2)' : 0 }}>
                              {renderExtra(record)}
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
      {activeTab === 'ready' && tabRecords.some(r => r.approvalStatus === 'pending') && (
        <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-cta"
            onClick={() => {
              const pendingIds = tabRecords.filter(r => r.approvalStatus === 'pending').map(r => r.id);
              onApprove(pendingIds);
            }}
          >
            اعتماد جميع الجاهزة ({tabRecords.filter(r => r.approvalStatus === 'pending').length})
          </button>
        </div>
      )}
    </div>
  );
}

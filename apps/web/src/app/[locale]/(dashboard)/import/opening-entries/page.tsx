'use client';

import { useState } from 'react';
import ImportSourceConfigCard from '@/components/import/ImportSourceConfigCard';
import ImportReviewCenter from '@/components/import/ImportReviewCenter';
import type { ReviewRecord, ColumnDef } from '@/components/import/ImportReviewCenter';
import { mockImportSourceConfigs, mockOpeningEntriesReviewRecords } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

const SOURCE_CONFIG = mockImportSourceConfigs.find(s => s.moduleType === 'opening_entries')!;

const INITIAL_RECORDS: ReviewRecord[] = mockOpeningEntriesReviewRecords.map(r => ({
  id: r.id,
  rowNumber: r.rowNumber,
  reviewStatus: r.reviewStatus,
  approvalStatus: r.approvalStatus,
  fields: r.fields,
  validationMessages: r.validationMessages,
}));

const COLUMNS: ColumnDef[] = [
  { key: 'date',        labelAr: 'التاريخ', width: 120 },
  { key: 'description', labelAr: 'البيان', width: 200 },
  { key: 'account_code', labelAr: 'رمز الحساب', width: 120 },
  {
    key: 'debit', labelAr: 'مدين', width: 120,
    render: (v) => v && parseFloat(v) > 0
      ? <span style={{ fontVariantNumeric: 'tabular-nums', color: '#16a34a', fontWeight: 'var(--font-weight-medium)' }}>{fNum(parseFloat(v))}</span>
      : <span style={{ color: 'var(--color-text-muted)' }}>—</span>,
  },
  {
    key: 'credit', labelAr: 'دائن', width: 120,
    render: (v) => v && parseFloat(v) > 0
      ? <span style={{ fontVariantNumeric: 'tabular-nums', color: '#b91c1c', fontWeight: 'var(--font-weight-medium)' }}>{fNum(parseFloat(v))}</span>
      : <span style={{ color: 'var(--color-text-muted)' }}>—</span>,
  },
  { key: 'reference', labelAr: 'المرجع', width: 130 },
];

export default function OpeningEntriesPage() {
  const [records, setRecords] = useState<ReviewRecord[]>(INITIAL_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1800); };
  const handleApprove = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
  const handleReject  = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));

  const totalDebit  = records.filter(r => r.approvalStatus !== 'rejected').reduce((s, r) => s + parseFloat(r.fields.debit  || '0'), 0);
  const totalCredit = records.filter(r => r.approvalStatus !== 'rejected').reduce((s, r) => s + parseFloat(r.fields.credit || '0'), 0);
  const balanced    = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">قيود الافتتاح</h2>
          <p className="page-subtitle">مراجعة واعتماد قيود الأرصدة الافتتاحية</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: balanced ? '#dcfce7' : '#fee2e2', color: balanced ? '#16a34a' : '#b91c1c', fontWeight: 'var(--font-weight-semibold)' }}>
            {balanced ? '✓ متوازن' : '✕ غير متوازن'}
          </span>
        </div>
      </div>

      {/* Balance check widget */}
      <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي المدين</p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
              {fNum(totalDebit)}
            </p>
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}>=</div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي الدائن</p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#b91c1c', fontVariantNumeric: 'tabular-nums' }}>
              {fNum(totalCredit)}
            </p>
          </div>
          {!balanced && (
            <div style={{ marginInlineStart: 'auto', padding: 'var(--space-2) var(--space-3)', background: '#fee2e2', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: '#b91c1c' }}>
              الفرق: {fNum(Math.abs(totalDebit - totalCredit))} — يجب تصحيح القيود قبل الترحيل
            </div>
          )}
        </div>
      </div>

      <ImportSourceConfigCard config={SOURCE_CONFIG} onRefresh={handleRefresh} refreshing={refreshing} onConfigure={() => {}} />
      <ImportReviewCenter records={records} columns={COLUMNS} onApprove={handleApprove} onReject={handleReject} />
    </>
  );
}

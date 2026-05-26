'use client';

import { useState } from 'react';
import ImportSourceConfigCard from '@/components/import/ImportSourceConfigCard';
import ImportReviewCenter from '@/components/import/ImportReviewCenter';
import type { ReviewRecord, ColumnDef } from '@/components/import/ImportReviewCenter';
import { mockImportSourceConfigs, mockCustomerOBReviewRecords } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

const SOURCE_CONFIG = mockImportSourceConfigs.find(s => s.moduleType === 'customer_opening_balances')!;

const INITIAL_RECORDS: ReviewRecord[] = mockCustomerOBReviewRecords.map(r => ({
  id: r.id,
  rowNumber: r.rowNumber,
  reviewStatus: r.reviewStatus,
  approvalStatus: r.approvalStatus,
  fields: r.fields,
  validationMessages: r.validationMessages,
}));

const COLUMNS: ColumnDef[] = [
  { key: 'customer_name', labelAr: 'العميل', width: 200 },
  { key: 'account_code',  labelAr: 'رمز الحساب', width: 120 },
  {
    key: 'debit', labelAr: 'مدين', width: 120,
    render: (v) => v && parseFloat(v) > 0
      ? <span style={{ fontVariantNumeric: 'tabular-nums', color: '#16a34a' }}>{fNum(parseFloat(v))}</span>
      : <span style={{ color: 'var(--color-text-muted)' }}>—</span>,
  },
  {
    key: 'credit', labelAr: 'دائن', width: 120,
    render: (v) => v && parseFloat(v) > 0
      ? <span style={{ fontVariantNumeric: 'tabular-nums', color: '#b91c1c' }}>{fNum(parseFloat(v))}</span>
      : <span style={{ color: 'var(--color-text-muted)' }}>—</span>,
  },
  { key: 'date', labelAr: 'التاريخ', width: 120 },
];

export default function CustomerOpeningBalancesPage() {
  const [records, setRecords] = useState<ReviewRecord[]>(INITIAL_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1800); };
  const handleApprove = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
  const handleReject  = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));

  const totalDebit  = records.filter(r => r.approvalStatus !== 'rejected').reduce((s, r) => s + parseFloat(r.fields.debit  || '0'), 0);
  const approved    = records.filter(r => r.approvalStatus === 'approved').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">أرصدة افتتاحية — عملاء</h2>
          <p className="page-subtitle">مراجعة واعتماد الأرصدة الافتتاحية للعملاء</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
            إجمالي: {fNum(totalDebit)} ر.س
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#f3f4f6', color: '#6b7280' }}>
            {approved} معتمد
          </span>
        </div>
      </div>

      {/* One-time notice */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', marginBlockEnd: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: '#92400e' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginBlockStart: 1 }}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>الأرصدة الافتتاحية تُدخَل مرة واحدة فقط عند بدء النظام. تأكد من صحة البيانات قبل الاعتماد، إذ لا يمكن عكسها تلقائياً.</span>
      </div>

      <ImportSourceConfigCard config={SOURCE_CONFIG} onRefresh={handleRefresh} refreshing={refreshing} onConfigure={() => {}} />
      <ImportReviewCenter records={records} columns={COLUMNS} onApprove={handleApprove} onReject={handleReject} />
    </>
  );
}

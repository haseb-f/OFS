'use client';

import { useState } from 'react';
import ImportSourceConfigCard from '@/components/import/ImportSourceConfigCard';
import ImportReviewCenter from '@/components/import/ImportReviewCenter';
import type { ReviewRecord, ColumnDef } from '@/components/import/ImportReviewCenter';
import { mockImportSourceConfigs, mockPayrollReviewRecords } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

const SOURCE_CONFIG = mockImportSourceConfigs.find(s => s.moduleType === 'payroll')!;

const INITIAL_RECORDS: ReviewRecord[] = mockPayrollReviewRecords.map(r => ({
  id: r.id,
  rowNumber: r.rowNumber,
  reviewStatus: r.reviewStatus,
  approvalStatus: r.approvalStatus,
  fields: r.fields,
  validationMessages: r.validationMessages,
}));

const COLUMNS: ColumnDef[] = [
  { key: 'employee_name', labelAr: 'الموظف', width: 180 },
  { key: 'employee_id',   labelAr: 'رقم الموظف', width: 110 },
  {
    key: 'base_salary', labelAr: 'الراتب الأساسي', width: 130,
    render: (v) => v ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(parseFloat(v))}</span> : '—',
  },
  {
    key: 'allowances', labelAr: 'البدلات', width: 100,
    render: (v) => v ? <span style={{ fontVariantNumeric: 'tabular-nums', color: '#16a34a' }}>{fNum(parseFloat(v))}</span> : '—',
  },
  {
    key: 'deductions', labelAr: 'الخصومات', width: 100,
    render: (v) => v && parseFloat(v) > 0 ? <span style={{ fontVariantNumeric: 'tabular-nums', color: '#b91c1c' }}>{fNum(parseFloat(v))}</span> : '—',
  },
  {
    key: 'net_salary', labelAr: 'الصافي', width: 120,
    render: (v) => v ? <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-semibold)' }}>{fNum(parseFloat(v))}</span> : '—',
  },
  { key: 'payment_date', labelAr: 'تاريخ الصرف', width: 120 },
];

export default function PayrollImportPage() {
  const [records, setRecords] = useState<ReviewRecord[]>(INITIAL_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1800); };
  const handleApprove = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
  const handleReject  = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));

  const totalNet = records
    .filter(r => r.approvalStatus === 'approved')
    .reduce((s, r) => s + parseFloat(r.fields.net_salary || '0'), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">استيراد الرواتب</h2>
          <p className="page-subtitle">مراجعة واعتماد كشف الرواتب المستورد من Google Sheets</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {totalNet > 0 && (
            <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
              صافي معتمد: {fNum(totalNet)} ر.س
            </span>
          )}
        </div>
      </div>

      <ImportSourceConfigCard config={SOURCE_CONFIG} onRefresh={handleRefresh} refreshing={refreshing} onConfigure={() => {}} />
      <ImportReviewCenter records={records} columns={COLUMNS} onApprove={handleApprove} onReject={handleReject} />
    </>
  );
}

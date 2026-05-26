'use client';

import { useState } from 'react';
import ImportSourceConfigCard from '@/components/import/ImportSourceConfigCard';
import ImportReviewCenter from '@/components/import/ImportReviewCenter';
import type { ReviewRecord, ColumnDef } from '@/components/import/ImportReviewCenter';
import { mockImportSourceConfigs, mockProductImportReviewRecords } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

const SOURCE_CONFIG = mockImportSourceConfigs.find(s => s.moduleType === 'products_import')!;

const INITIAL_RECORDS: ReviewRecord[] = mockProductImportReviewRecords.map(r => ({
  id: r.id,
  rowNumber: r.rowNumber,
  reviewStatus: r.reviewStatus,
  approvalStatus: r.approvalStatus,
  fields: r.fields,
  validationMessages: r.validationMessages,
}));

const COLUMNS: ColumnDef[] = [
  { key: 'name',     labelAr: 'المنتج / الخدمة', width: 180 },
  { key: 'sku',      labelAr: 'رمز المنتج', width: 140 },
  { key: 'category', labelAr: 'التصنيف', width: 110 },
  { key: 'unit',     labelAr: 'الوحدة', width: 80 },
  {
    key: 'price', labelAr: 'السعر', width: 100,
    render: (v) => v ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(parseFloat(v))}</span> : '—',
  },
  {
    key: 'cost', labelAr: 'التكلفة', width: 100,
    render: (v) => v ? <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)' }}>{fNum(parseFloat(v))}</span> : '—',
  },
  {
    key: 'tax_rate', labelAr: 'الضريبة', width: 80,
    render: (v) => v ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}%</span> : '—',
  },
];

export default function ProductsImportPage() {
  const [records, setRecords] = useState<ReviewRecord[]>(INITIAL_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1800); };
  const handleApprove = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
  const handleReject  = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));

  const approved = records.filter(r => r.approvalStatus === 'approved').length;
  const pending  = records.filter(r => r.approvalStatus === 'pending').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">استيراد المنتجات والخدمات</h2>
          <p className="page-subtitle">مراجعة واعتماد كتالوج المنتجات المستورد من Google Sheets</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#16a34a' }}>{approved} معتمد</span>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#f3f4f6', color: '#6b7280' }}>{pending} معلق</span>
        </div>
      </div>

      <ImportSourceConfigCard config={SOURCE_CONFIG} onRefresh={handleRefresh} refreshing={refreshing} onConfigure={() => {}} />
      <ImportReviewCenter records={records} columns={COLUMNS} onApprove={handleApprove} onReject={handleReject} />
    </>
  );
}

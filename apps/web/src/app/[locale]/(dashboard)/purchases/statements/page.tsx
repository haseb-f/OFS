'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockVendors, getVendorStatement } from '@/lib/purchasing-mock-data';
import { VendorBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

const TYPE_COLOR: Record<string, string> = {
  'فاتورة':          '#b91c1c',
  'دفعة':            '#15803d',
  'إشعار مدين':      '#15803d',
  'مرتجع':           '#15803d',
  'رصيد افتتاحي':   '#475569',
};

export default function VendorStatementsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [selectedVendorId, setSelectedVendorId] = useState<string>(mockVendors[0]?.id ?? '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const vendor = useMemo(() => mockVendors.find(v => v.id === selectedVendorId), [selectedVendorId]);

  const allLines = useMemo(() => {
    if (!selectedVendorId) return [];
    return getVendorStatement(selectedVendorId);
  }, [selectedVendorId]);

  const lines = useMemo(() => {
    let list = allLines;
    if (dateFrom) list = list.filter(l => l.dateIso >= dateFrom);
    if (dateTo)   list = list.filter(l => l.dateIso <= dateTo);
    return list;
  }, [allLines, dateFrom, dateTo]);

  const closingBalance = lines.length > 0 ? lines[lines.length - 1].balance : 0;
  const activeVendors  = mockVendors.filter(v => v.status !== 'blacklisted');

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">كشف حساب الموردين</h2>
          <p className="page-subtitle">حركات الحساب والرصيد التفصيلي</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            طباعة / تصدير
          </button>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            إرسال للمورد
          </button>
        </div>
      </div>

      {/* Vendor selector + date range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 'var(--space-3)', alignItems: 'end', marginBlockEnd: 'var(--space-5)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-1)' }}>
            المورد
          </label>
          <select className="form-select" value={selectedVendorId} onChange={e => setSelectedVendorId(e.target.value)} style={{ blockSize: 40, fontSize: 'var(--font-size-sm)' }}>
            {activeVendors.map(v => (
              <option key={v.id} value={v.id}>{v.nameAr} ({v.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-1)' }}>
            من تاريخ
          </label>
          <OfsDatePicker value={dateFrom} onChange={setDateFrom} size="sm" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', marginBlockEnd: 'var(--space-1)' }}>
            إلى تاريخ
          </label>
          <OfsDatePicker value={dateTo} onChange={setDateTo} size="sm" />
        </div>
        {(dateFrom || dateTo) && (
          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', alignSelf: 'end', blockSize: 40 }}
            onClick={() => { setDateFrom(''); setDateTo(''); }}>
            مسح
          </button>
        )}
      </div>

      {/* Vendor header card */}
      {vendor && (
        <div className="vendor-profile-header" style={{ marginBlockEnd: 'var(--space-5)' }}>
          <div className="vendor-avatar-lg">
            {vendor.nameAr.trim().charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBlockEnd: 'var(--space-1)', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{vendor.nameAr}</h3>
              <VendorBadge status={vendor.status} />
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>
              {vendor.code} · {vendor.city} · {vendor.paymentTerms}
            </div>
            <div className="vendor-stat-row">
              <div className="vendor-stat-item">
                <div className="vendor-stat-label">الرصيد الحالي</div>
                <div className="vendor-stat-value" style={{ color: vendor.currentBalance > 0 ? '#b91c1c' : '#15803d' }}>
                  {fNum(vendor.currentBalance)} ر.س
                </div>
              </div>
              <div className="vendor-stat-item">
                <div className="vendor-stat-label">الرصيد الختامي (الفترة)</div>
                <div className="vendor-stat-value" style={{ color: closingBalance > 0 ? '#b91c1c' : closingBalance < 0 ? '#15803d' : 'var(--color-text-muted)' }}>
                  {fNum(Math.abs(closingBalance))} ر.س {closingBalance > 0 ? 'مدين' : closingBalance < 0 ? 'دائن' : ''}
                </div>
              </div>
              <div className="vendor-stat-item">
                <div className="vendor-stat-label">إجمالي المشتريات</div>
                <div className="vendor-stat-value">{fNum(vendor.totalPurchases)} ر.س</div>
              </div>
              <div className="vendor-stat-item">
                <div className="vendor-stat-label">حد الائتمان</div>
                <div className="vendor-stat-value">{fNum(vendor.creditLimit)} ر.س</div>
              </div>
            </div>
          </div>
          <Link href={`/${locale}/purchases/vendors`} className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', alignSelf: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            ملف المورد
          </Link>
        </div>
      )}

      {/* Statement table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div className="ofs-card-header">
          <h3 className="ofs-card-title">
            كشف الحساب
            {(dateFrom || dateTo) && (
              <span style={{ marginInlineStart: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', fontWeight: 'var(--font-weight-regular)' }}>
                {dateFrom && `من ${dateFrom}`} {dateTo && `إلى ${dateTo}`}
              </span>
            )}
          </h3>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{lines.length} حركة</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم المستند</th>
                <th>النوع</th>
                <th style={{ textAlign: 'end' }}>مدين (عليه)</th>
                <th style={{ textAlign: 'end' }}>دائن (له)</th>
                <th style={{ textAlign: 'end' }}>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={6} className="table-empty-cell">لا توجد حركات في الفترة المحددة</td></tr>
              ) : lines.map((line, idx) => (
                <tr key={line.id}>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{line.date}</td>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: idx === 0 ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)', color: idx === 0 ? 'var(--color-text-muted)' : 'var(--color-primary)', cursor: idx === 0 ? 'default' : 'pointer' }}>
                      {line.docNumber}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#f1f5f9', color: TYPE_COLOR[line.type] ?? 'var(--color-text-muted)' }}>
                      {line.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {line.debit > 0
                      ? <span className="statement-table-debit">{fNum(line.debit)}</span>
                      : <span style={{ color: 'var(--color-text-subtle)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {line.credit > 0
                      ? <span className="statement-table-credit">{fNum(line.credit)}</span>
                      : <span style={{ color: 'var(--color-text-subtle)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    <span className={line.balance > 0 ? 'statement-balance-pos' : line.balance < 0 ? 'statement-balance-neg' : 'statement-balance-zero'}>
                      {fNum(Math.abs(line.balance))}
                      {line.balance !== 0 && (
                        <span style={{ fontSize: '0.65rem', marginInlineStart: 4 }}>
                          {line.balance > 0 ? 'مدين' : 'دائن'}
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {lines.length > 0 && (
              <tfoot>
                <tr style={{ background: 'var(--color-surface-raised)' }}>
                  <td colSpan={3} style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                    الإجمالي
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: '#b91c1c' }}>
                    {fNum(lines.reduce((s, l) => s + l.debit, 0))}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: '#15803d' }}>
                    {fNum(lines.reduce((s, l) => s + l.credit, 0))}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: closingBalance > 0 ? '#b91c1c' : closingBalance < 0 ? '#15803d' : 'var(--color-text-muted)' }}>
                    {fNum(Math.abs(closingBalance))}
                    {closingBalance !== 0 && (
                      <span style={{ fontSize: '0.65rem', marginInlineStart: 4 }}>
                        {closingBalance > 0 ? 'مدين' : 'دائن'}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}

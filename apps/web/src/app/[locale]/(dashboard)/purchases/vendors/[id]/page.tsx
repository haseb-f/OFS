'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  mockVendors,
  mockPurchaseOrders,
  mockPurchaseInvoices,
  mockVendorPayments,
  getVendorStatement,
} from '@/lib/purchasing-mock-data';
import { VendorBadge, PoBadge, PiBadge, VpBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';

type Tab = 'orders' | 'invoices' | 'payments' | 'statement';

const TYPE_COLOR: Record<string, string> = {
  'فاتورة':        '#b91c1c',
  'دفعة':          '#15803d',
  'إشعار مدين':    '#15803d',
  'مرتجع':         '#15803d',
  'رصيد افتتاحي': '#475569',
};

export default function VendorProfilePage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [tab, setTab] = useState<Tab>('orders');

  const vendor = useMemo(() => mockVendors.find(v => v.id === id), [id]);

  const orders   = useMemo(() => mockPurchaseOrders.filter(o => o.vendorId === id),   [id]);
  const invoices = useMemo(() => mockPurchaseInvoices.filter(i => i.vendorId === id), [id]);
  const payments = useMemo(() => mockVendorPayments.filter(p => p.vendorId === id),   [id]);
  const statement = useMemo(() => getVendorStatement(id), [id]);

  if (!vendor) return notFound();

  const closingBalance = statement.length > 0 ? statement[statement.length - 1].balance : 0;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href={`/${locale}/purchases/vendors`} className="btn-ghost" style={{ padding: '6px 10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h2 className="page-title">{vendor.nameAr}</h2>
            <p className="page-subtitle">{vendor.code} · ملف المورد</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </button>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            أمر شراء جديد
          </button>
        </div>
      </div>

      {/* Vendor card */}
      <div className="vendor-profile-header" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="vendor-avatar-lg">{vendor.nameAr.trim().charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBlockEnd: 'var(--space-1)', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{vendor.nameAr}</h3>
            <VendorBadge status={vendor.status} />
            {vendor.tags.map(tag => (
              <span key={tag} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-1)' }}>
            {vendor.city} · {vendor.phone} · {vendor.email}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>
            رقم الضريبة: {vendor.vatNumber} · عضو منذ {vendor.createdDate}
          </div>
          <div className="vendor-stat-row">
            <div className="vendor-stat-item">
              <div className="vendor-stat-label">الرصيد الحالي</div>
              <div className="vendor-stat-value" style={{ color: vendor.currentBalance > 0 ? '#b91c1c' : '#15803d' }}>
                {fNum(vendor.currentBalance)} ر.س
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
            <div className="vendor-stat-item">
              <div className="vendor-stat-label">شروط الدفع</div>
              <div className="vendor-stat-value">{vendor.paymentTerms}</div>
            </div>
            <div className="vendor-stat-item">
              <div className="vendor-stat-label">آخر أمر شراء</div>
              <div className="vendor-stat-value">{vendor.lastOrderDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pur-tabs" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <button className={`pur-tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
          أوامر الشراء
          {orders.length > 0 && <span className="pur-tab-badge">{orders.length}</span>}
        </button>
        <button className={`pur-tab${tab === 'invoices' ? ' active' : ''}`} onClick={() => setTab('invoices')}>
          الفواتير
          {invoices.length > 0 && <span className="pur-tab-badge">{invoices.length}</span>}
        </button>
        <button className={`pur-tab${tab === 'payments' ? ' active' : ''}`} onClick={() => setTab('payments')}>
          المدفوعات
          {payments.length > 0 && <span className="pur-tab-badge">{payments.length}</span>}
        </button>
        <button className={`pur-tab${tab === 'statement' ? ' active' : ''}`} onClick={() => setTab('statement')}>
          كشف الحساب
        </button>
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">أوامر الشراء</h3>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{orders.length} أمر</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>رقم الأمر</th>
                  <th>طلب العرض</th>
                  <th style={{ textAlign: 'end' }}>الإجمالي</th>
                  <th style={{ textAlign: 'end' }}>المدفوع</th>
                  <th>تاريخ الأمر</th>
                  <th>موعد الاستلام</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="table-empty-cell">لا توجد أوامر شراء لهذا المورد</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id}>
                    <td><span className="lead-order-link">{o.poNumber}</span></td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: o.rfqNumber ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}>
                      {o.rfqNumber ?? '—'}
                    </td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {fNum(o.totalAmount)} {o.currency}
                    </td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {o.status === 'paid'
                        ? <span style={{ color: '#15803d', fontWeight: 'var(--font-weight-semibold)' }}>مُسوَّى ✓</span>
                        : o.paidAmount > 0
                          ? <span style={{ color: '#b45309' }}>{fNum(o.paidAmount)}</span>
                          : <span style={{ color: 'var(--color-text-subtle)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{o.orderDate}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{o.expectedDate}</td>
                    <td><PoBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices tab */}
      {tab === 'invoices' && (
        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">الفواتير</h3>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{invoices.length} فاتورة</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>رقم خارجي</th>
                  <th>أمر الشراء</th>
                  <th style={{ textAlign: 'end' }}>الإجمالي</th>
                  <th>تاريخ الفاتورة</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={7} className="table-empty-cell">لا توجد فواتير لهذا المورد</td></tr>
                ) : invoices.map(inv => {
                  const overdue = inv.status === 'approved' && inv.dueDateIso < '2026-05-25';
                  return (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span className="lead-order-link">{inv.invoiceNumber}</span>
                          {overdue && (
                            <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: '#fee2e2', color: '#b91c1c', fontWeight: 'var(--font-weight-semibold)' }}>
                              متأخرة
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{inv.vendorInvoiceRef}</td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: inv.poNumber ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}>
                        {inv.poNumber ?? '—'}
                      </td>
                      <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                        {fNum(inv.totalAmount)} {inv.currency}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{inv.invoiceDate}</td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: overdue ? '#b91c1c' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{inv.dueDate}</td>
                      <td><PiBadge status={inv.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments tab */}
      {tab === 'payments' && (
        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">المدفوعات</h3>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{payments.length} دفعة</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>رقم الدفعة</th>
                  <th>الفاتورة</th>
                  <th style={{ textAlign: 'end' }}>المبلغ</th>
                  <th>طريقة الدفع</th>
                  <th>المرجع</th>
                  <th>تاريخ الدفع</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={7} className="table-empty-cell">لا توجد مدفوعات لهذا المورد</td></tr>
                ) : payments.map(pmt => (
                  <tr key={pmt.id}>
                    <td><span className="lead-order-link">{pmt.paymentNumber}</span></td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: pmt.invoiceNumber ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}>
                      {pmt.invoiceNumber ?? '—'}
                    </td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {fNum(pmt.amount)} {pmt.currency}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{pmt.paymentMethod}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{pmt.reference ?? '—'}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{pmt.paymentDate}</td>
                    <td><VpBadge status={pmt.status} /></td>
                  </tr>
                ))}
              </tbody>
              {payments.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--color-surface-raised)' }}>
                    <td colSpan={2} style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                      الإجمالي
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: '#15803d', whiteSpace: 'nowrap' }}>
                      {fNum(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0))} ر.س
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Statement tab */}
      {tab === 'statement' && (
        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="ofs-card-header">
            <h3 className="ofs-card-title">كشف الحساب</h3>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{statement.length} حركة</span>
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
                {statement.length === 0 ? (
                  <tr><td colSpan={6} className="table-empty-cell">لا توجد حركات لهذا المورد</td></tr>
                ) : statement.map((line, idx) => (
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
              {statement.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--color-surface-raised)' }}>
                    <td colSpan={3} style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                      الإجمالي
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: '#b91c1c' }}>
                      {fNum(statement.reduce((s, l) => s + l.debit, 0))}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-5)', textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: '#15803d' }}>
                      {fNum(statement.reduce((s, l) => s + l.credit, 0))}
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
          <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link href={`/${locale}/purchases/statements`} className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
              عرض الكشف الكامل مع فلترة التاريخ ←
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

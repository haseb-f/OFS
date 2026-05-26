'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { mockInvoices, INVOICE_TYPE_LABELS, INVOICE_SOURCE_LABELS, INVOICE_STATUS_LABELS, type InvoiceStatus } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtNum(n: number, currency = '') {
  return `${fNum(n)}${currency ? ' ' + currency : ''}`;
}

function lineSubtotal(qty: number, price: number)          { return qty * price; }
function lineTax(qty: number, price: number, rate: number) { return qty * price * (rate / 100); }

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const classMap: Record<InvoiceStatus, string> = {
    draft:     'inv-status-draft',
    issued:    'inv-status-issued',
    paid:      'inv-status-paid',
    cancelled: 'inv-status-cancelled',
  };
  return (
    <span className={`status-badge ${classMap[status]}`}>{INVOICE_STATUS_LABELS[status]}</span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock company info
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY = {
  nameAr:    'شركة المستقبل للتجارة والخدمات',
  nameEn:    'Future Trading & Services Co.',
  taxNumber: '300100200300003',
  address:   'حي العليا، شارع الملك فهد، الرياض 11534',
  phone:     '+966 11 500 0000',
  email:     'info@future-trade.sa',
  website:   'www.future-trade.sa',
  crNumber:  '1010500000',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function InvoicePreviewPage() {
  const { locale }   = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [activeId, setActiveId] = useState<string>(id ?? mockInvoices[0]?.id ?? '');
  const invoice = mockInvoices.find(inv => inv.id === activeId) ?? mockInvoices[0];

  if (!invoice) {
    return (
      <div style={{ textAlign: 'center', paddingBlock: 'var(--space-16)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>لا توجد فاتورة للعرض.</p>
        <Link href={`/${locale}/accounting/invoices/new`} className="btn-cta" style={{ marginBlockStart: 'var(--space-4)', textDecoration: 'none', display: 'inline-flex' }}>
          إنشاء فاتورة جديدة
        </Link>
      </div>
    );
  }

  // Compute totals
  const subtotal   = invoice.lines.reduce((s, l) => s + lineSubtotal(l.quantity, l.unitPrice), 0);
  const totalTax   = invoice.lines.reduce((s, l) => s + (l.taxable ? lineTax(l.quantity, l.unitPrice, l.taxRate) : 0), 0);
  const grandTotal = subtotal + totalTax;

  return (
    <>

      {/* Controls bar — hidden on print */}
      <div className="inv-print-controls" style={{ marginBlockEnd: 'var(--space-5)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBlockEnd: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          <Link href={`/${locale}/accounting/collections`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>مركز التحصيل</Link>
          <span>/</span>
          <Link href={`/${locale}/accounting/invoices/new`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>الفواتير</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text)' }}>معاينة</span>
        </div>

        <div className="page-header" style={{ marginBlockEnd: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div>
              <h2 className="page-title" style={{ marginBlock: 0 }}>{invoice.invoiceNumber}</h2>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBlockStart: 'var(--space-1)', flexWrap: 'wrap' }}>
                <InvoiceStatusBadge status={invoice.status} />
                <span className="status-badge" style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                  {INVOICE_TYPE_LABELS[invoice.type]}
                </span>
                <span className="status-badge" style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                  {INVOICE_SOURCE_LABELS[invoice.source]}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {/* Invoice selector */}
            <select
              className="ofs-select"
              value={activeId}
              onChange={e => setActiveId(e.target.value)}
              style={{ minInlineSize: 200 }}
            >
              {mockInvoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName}
                </option>
              ))}
            </select>
            <Link
              href={`/${locale}/accounting/invoices/new`}
              className="btn-outline"
              style={{ textDecoration: 'none' }}
            >
              فاتورة جديدة
            </Link>
            <button
              type="button"
              className="btn-cta"
              onClick={() => window.print()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              طباعة / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice source trail */}
      {(invoice.collectionRef || invoice.orderNumber) && (
        <div className="inv-print-controls ofs-card" style={{ marginBlockEnd: 'var(--space-4)', padding: 'var(--space-3) var(--space-5)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)' }}>
            {invoice.collectionRef && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>التحصيل المرتبط:</span>
                <Link href={`/${locale}/accounting/collections/${invoice.collectionId}`} style={{ color: 'var(--color-primary)', fontFamily: 'monospace', textDecoration: 'none', fontWeight: 'var(--font-weight-medium)' }}>
                  {invoice.collectionRef}
                </Link>
              </div>
            )}
            {invoice.orderNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>الطلب المرتبط:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-medium)' }}>{invoice.orderNumber}</span>
              </div>
            )}
            {invoice.generateReceiptVoucher && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#166534' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                سند قبض مُنشأ
              </div>
            )}
            {invoice.generateAccountingEntries && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#166534' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                قيود محاسبية مُولَّدة
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INVOICE DOCUMENT ── */}
      <div className="inv-preview-page ofs-card" style={{ padding: 'var(--space-8)' }}>

        {/* Company header */}
        <div className="inv-preview-header">
          <div className="inv-preview-company">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBlockEnd: 'var(--space-2)' }}>
              <div style={{ width: 48, height: 48, background: 'var(--color-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" fill="white" fillOpacity="0.9" />
                  <path d="M10 5L15 8V12L10 15L5 12V8L10 5Z" fill="white" fillOpacity="0.25" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>{COMPANY.nameAr}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{COMPANY.nameEn}</div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span>الرقم الضريبي: {COMPANY.taxNumber}</span>
              <span>السجل التجاري: {COMPANY.crNumber}</span>
              <span>{COMPANY.address}</span>
              <span dir="ltr">{COMPANY.phone} | {COMPANY.email}</span>
            </div>
          </div>
          <div className="inv-preview-meta">
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
              فاتورة ضريبية
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockStart: 2 }}>Tax Invoice</div>
            <div style={{ marginBlockStart: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--font-size-sm)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>رقم الفاتورة:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{invoice.invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>تاريخ الإصدار:</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{invoice.issueDate}</span>
              </div>
              {invoice.dueDate && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>تاريخ الاستحقاق:</span>
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{invoice.dueDate}</span>
                </div>
              )}
              <div style={{ marginBlockStart: 'var(--space-2)' }}>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="inv-preview-parties">
          <div className="inv-preview-party">
            <div className="inv-preview-party-label">المورِّد / Seller</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{COMPANY.nameAr}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>الرقم الضريبي: {COMPANY.taxNumber}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{COMPANY.address}</div>
          </div>
          <div className="inv-preview-party">
            <div className="inv-preview-party-label">العميل / Customer</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{invoice.customerName}</div>
            {invoice.customerTaxNumber && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>الرقم الضريبي: {invoice.customerTaxNumber}</div>
            )}
            {invoice.customerPhone && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>{invoice.customerPhone}</div>
            )}
            {invoice.customerAddress && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{invoice.customerAddress}</div>
            )}
          </div>
        </div>

        {/* Reference info */}
        {(invoice.collectionRef || invoice.orderNumber) && (
          <div style={{ marginBlockEnd: 'var(--space-5)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', fontSize: 'var(--font-size-xs)' }}>
            {invoice.collectionRef && (
              <span><span style={{ color: 'var(--color-text-muted)' }}>رقم التحصيل: </span><strong style={{ fontFamily: 'monospace' }}>{invoice.collectionRef}</strong></span>
            )}
            {invoice.orderNumber && (
              <span><span style={{ color: 'var(--color-text-muted)' }}>رقم الطلب: </span><strong style={{ fontFamily: 'monospace' }}>{invoice.orderNumber}</strong></span>
            )}
            <span><span style={{ color: 'var(--color-text-muted)' }}>نوع الفاتورة: </span><strong>{INVOICE_TYPE_LABELS[invoice.type]}</strong></span>
          </div>
        )}

        {/* Line items */}
        <table className="inv-preview-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>البيان</th>
              <th style={{ width: 60, textAlign: 'center' }}>الكمية</th>
              <th style={{ width: 110, textAlign: 'end' }}>سعر الوحدة</th>
              <th style={{ width: 90, textAlign: 'center' }}>نسبة الضريبة</th>
              <th style={{ width: 100, textAlign: 'end' }}>مبلغ الضريبة</th>
              <th style={{ width: 120, textAlign: 'end' }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, idx) => {
              const sub  = lineSubtotal(line.quantity, line.unitPrice);
              const tax  = line.taxable ? lineTax(line.quantity, line.unitPrice, line.taxRate) : 0;
              const tot  = sub + tax;
              return (
                <tr key={line.id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{line.description}</td>
                  <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{fNum(line.quantity, 0)}</td>
                  <td className="col-r">{fmtNum(line.unitPrice)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {line.taxable
                      ? <span style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '1px 6px', fontSize: 'var(--font-size-xs)' }}>{line.taxRate}%</span>
                      : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>معفى</span>
                    }
                  </td>
                  <td className="col-r" style={{ color: tax > 0 ? '#b45309' : 'var(--color-text-muted)' }}>
                    {tax > 0 ? fmtNum(tax) : '—'}
                  </td>
                  <td className="col-r" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{fmtNum(tot)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="inv-preview-totals">
          <div className="inv-preview-totals-box">
            <div className="inv-preview-totals-row">
              <span style={{ color: 'var(--color-text-muted)' }}>المجموع قبل الضريبة</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtNum(subtotal, invoice.currency)}</span>
            </div>
            <div className="inv-preview-totals-row">
              <span style={{ color: 'var(--color-text-muted)' }}>ضريبة القيمة المضافة</span>
              <span style={{ color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(totalTax, invoice.currency)}</span>
            </div>
            <div className="inv-preview-totals-row grand">
              <span>الإجمالي الكلي</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtNum(grandTotal, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & terms */}
        {(invoice.notes || invoice.termsAndConditions) && (
          <div style={{ display: 'grid', gridTemplateColumns: invoice.notes && invoice.termsAndConditions ? '1fr 1fr' : '1fr', gap: 'var(--space-5)', marginBlockEnd: 'var(--space-5)' }}>
            {invoice.notes && (
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBlockEnd: 'var(--space-2)', color: 'var(--color-primary)' }}>ملاحظات</div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBlockEnd: 'var(--space-2)', color: 'var(--color-primary)' }}>الشروط والأحكام</div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="inv-preview-footer">
          <div>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)', marginBlockEnd: 4 }}>شكراً لتعاملكم معنا</p>
            <p style={{ margin: 0 }}>للاستفسار: {COMPANY.phone} | {COMPANY.email}</p>
            <p style={{ margin: 0 }}>{COMPANY.website}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
            <div className="inv-preview-signature">
              <p style={{ margin: 0 }}>المحاسب المفوَّض</p>
            </div>
            <div className="inv-preview-signature">
              <p style={{ margin: 0 }}>ختم الشركة</p>
            </div>
          </div>
        </div>

        {/* QR code placeholder */}
        <div style={{ marginBlockStart: 'var(--space-5)', paddingBlockStart: 'var(--space-4)', borderBlockStart: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 80, height: 80, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-raised)', flexShrink: 0 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="18" y="18" width="3" height="3"/>
            </svg>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)', marginBlockEnd: 2 }}>رمز الاستجابة السريعة (ZATCA)</p>
            <p style={{ margin: 0 }}>يُمكّن التحقق من الفاتورة إلكترونياً عبر منصة فاتورة</p>
            <p style={{ margin: 0, fontFamily: 'monospace', marginBlockStart: 4, fontSize: 10 }}>{invoice.invoiceNumber} | {invoice.issueDate} | {fmtNum(grandTotal, invoice.currency)}</p>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="inv-print-controls" style={{ marginBlockStart: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href={`/${locale}/accounting/invoices/new`} className="btn-outline" style={{ textDecoration: 'none' }}>
            ← العودة للتحرير
          </Link>
          <Link href={`/${locale}/accounting/collections`} className="btn-ghost" style={{ textDecoration: 'none' }}>
            مركز التحصيل
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="button" className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تنزيل PDF
          </button>
          <button type="button" className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            إرسال بالبريد
          </button>
          <button type="button" className="btn-cta" onClick={() => window.print()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            طباعة
          </button>
        </div>
      </div>
    </>
  );
}

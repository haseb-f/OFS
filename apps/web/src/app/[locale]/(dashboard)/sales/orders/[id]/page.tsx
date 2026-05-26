import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  mockOrders,
  ORDER_PAYMENT_LABELS,
  ORDER_SHIPPING_LABELS,
} from '@/lib/mock-data';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { fNum } from '@/lib/format';

interface Props { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const o = mockOrders.find(x => x.id === id);
  return { title: o ? `${o.orderNumber}` : 'تفاصيل الطلب' };
}

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  created: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  status_change: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  payment: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  shipped: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  note: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  assigned: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const TIMELINE_DOT_CLASS: Record<string, string> = {
  created:       'timeline-dot-created',
  status_change: 'timeline-dot-status_change',
  payment:       'timeline-dot-payment',
  shipped:       'timeline-dot-shipped',
  note:          'timeline-dot-note',
  assigned:      'timeline-dot-assigned',
};

const FILE_ICONS: Record<string, string> = {
  pdf:   '📄',
  image: '🖼️',
  excel: '📊',
};

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="detail-row">
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', fontVariantNumeric: mono ? 'tabular-nums' : undefined }}>
        {value}
      </span>
    </div>
  );
}

const fmtAmt = (n: number, cur = 'SAR') =>
  n === 0 ? '—' : `${fNum(n)} ${cur}`;

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const o = mockOrders.find(x => x.id === id);
  if (!o) notFound();

  const remaining  = o.totalAmount - o.paidAmount;
  const isSettled  = remaining === 0;

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link
            href={`/${locale}/sales/orders`}
            className="btn-ghost"
            style={{ padding: '6px 8px', gap: 4, marginBlockStart: 2 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            الطلبات
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h2 className="page-title" style={{ marginBlock: 0 }}>{o.orderNumber}</h2>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="page-subtitle">
              {o.orderDate}
              {o.externalOrderId ? ` · ${o.externalOrderId}` : ''}
              {o.assignedTo ? ` · ${o.assignedTo}` : ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link
            href={`/${locale}/sales/orders/${id}/edit`}
            className="btn-outline"
            style={{ textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="order-detail-grid">

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Customer */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">معلومات العميل</h3>
              {o.customerId && (
                <Link
                  href={`/${locale}/sales/customers/${o.customerId}`}
                  className="btn-ghost"
                  style={{ fontSize: 'var(--font-size-xs)', padding: '4px 8px' }}
                >
                  عرض ملف العميل
                </Link>
              )}
            </div>
            <div className="ofs-card-body">
              <DetailRow label="الاسم"    value={o.customerName} />
              <DetailRow label="الهاتف"   value={<span dir="ltr">{o.phone}</span>} />
              <DetailRow label="الدولة"   value={o.country} />
              <DetailRow label="المدينة"  value={o.city} />
              {o.address && <DetailRow label="العنوان" value={o.address} />}
            </div>
          </div>

          {/* Order info */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">تفاصيل الطلب</h3></div>
            <div className="ofs-card-body">
              <DetailRow label="رقم الطلب"   value={o.orderNumber} mono />
              {o.externalOrderId && <DetailRow label="رقم خارجي" value={<span dir="ltr">{o.externalOrderId}</span>} mono />}
              <DetailRow label="تاريخ الطلب" value={o.orderDate} />
              <DetailRow label="المنتج"       value={o.product} />
              <DetailRow label="الكمية"       value={fNum(o.quantity, 0)} mono />
              {o.unitPrice > 0 && (
                <DetailRow label="سعر الوحدة" value={fmtAmt(o.unitPrice, o.currency)} mono />
              )}
              <DetailRow
                label="الإجمالي"
                value={
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                    {fmtAmt(o.totalAmount, o.currency)}
                  </span>
                }
              />
            </div>
          </div>

          {/* Payment */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات الدفع</h3></div>
            <div className="ofs-card-body">
              <DetailRow label="طريقة الدفع" value={ORDER_PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod} />
              <DetailRow label="العملة"       value={o.currency} />
              <DetailRow label="المدفوع"      value={fmtAmt(o.paidAmount, o.currency)} mono />
              <DetailRow
                label="المتبقي"
                value={
                  isSettled
                    ? <span style={{ color: 'var(--color-status-active)', fontWeight: 'var(--font-weight-semibold)' }}>مُسوَّى ✓</span>
                    : <span style={{ color: '#b45309', fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>{fmtAmt(remaining, o.currency)}</span>
                }
              />
              {o.receipt && <DetailRow label="رقم الإيصال" value={<span dir="ltr">{o.receipt}</span>} mono />}
            </div>
          </div>

          {/* Shipping */}
          {(o.shippingMethod || o.shippingTrackingNumber || o.expectedDeliveryDate || o.deliveredDate) && (
            <div className="ofs-card">
              <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات الشحن</h3></div>
              <div className="ofs-card-body">
                {o.shippingMethod && (
                  <DetailRow label="طريقة الشحن" value={ORDER_SHIPPING_LABELS[o.shippingMethod] ?? o.shippingMethod} />
                )}
                {o.shippingTrackingNumber && (
                  <DetailRow label="رقم التتبع" value={<span dir="ltr">{o.shippingTrackingNumber}</span>} mono />
                )}
                {o.expectedDeliveryDate && (
                  <DetailRow label="تاريخ التسليم المتوقع" value={o.expectedDeliveryDate} />
                )}
                {o.deliveredDate && (
                  <DetailRow
                    label="تاريخ التسليم الفعلي"
                    value={<span style={{ color: 'var(--color-status-active)' }}>{o.deliveredDate}</span>}
                  />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {o.notes && (
            <div className="ofs-card">
              <div className="ofs-card-header"><h3 className="ofs-card-title">ملاحظات</h3></div>
              <div className="ofs-card-body">
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', lineHeight: 1.7, margin: 0 }}>
                  {o.notes}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">سجل الأحداث</h3></div>
            <div className="order-timeline">
              {o.timeline.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', paddingBlock: 'var(--space-4)' }}>لا يوجد سجل أحداث</p>
              ) : (
                <div className="lead-timeline">
                  {[...o.timeline].reverse().map(ev => (
                    <div key={ev.id} className="timeline-event">
                      <div className={`timeline-dot ${TIMELINE_DOT_CLASS[ev.type] ?? 'timeline-dot-created'}`}>
                        {TIMELINE_ICONS[ev.type]}
                      </div>
                      <div className="timeline-content">
                        <p className="timeline-description">{ev.descriptionAr}</p>
                        <div className="timeline-meta">
                          <span>{ev.author}</span>
                          <span>·</span>
                          <span>{ev.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">المرفقات</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {o.attachments.length} ملف
              </span>
            </div>
            <div className="ofs-card-body">
              {o.attachments.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)' }}>لا توجد مرفقات</p>
                  <button className="btn-ghost" style={{ marginBlockStart: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
                    رفع ملف
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {o.attachments.map(att => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-raised)',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{FILE_ICONS[att.fileType] ?? '📎'}</span>
                      <div style={{ flex: 1, minInlineSize: 0 }}>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {att.size} · {att.uploadedAt} · {att.uploadedBy}
                        </p>
                      </div>
                      <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', flexShrink: 0 }}>تنزيل</button>
                    </div>
                  ))}
                  <button className="btn-ghost" style={{ alignSelf: 'flex-start', marginBlockStart: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                    + إضافة ملف
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Status + actions */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">الحالة</h3></div>
            <div className="ofs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>الحالة الحالية</span>
                <OrderStatusBadge status={o.status} />
              </div>
              <Link
                href={`/${locale}/sales/orders/${id}/edit`}
                className="btn-cta"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none', padding: '10px 0', display: 'block' }}
              >
                تعديل الطلب
              </Link>
            </div>
          </div>

          {/* Financial summary */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">ملخص مالي</h3></div>
            <div className="ofs-card-body">
              <div className="order-financial-grid">
                <div className="order-financial-cell">
                  <span className="order-financial-label">الإجمالي</span>
                  <span className="order-financial-value">{fNum(o.totalAmount)}</span>
                </div>
                <div className="order-financial-cell">
                  <span className="order-financial-label">المدفوع</span>
                  <span className="order-financial-value">{fNum(o.paidAmount)}</span>
                </div>
                <div className="order-financial-cell" style={{ gridColumn: 'span 2' }}>
                  <span className="order-financial-label">المتبقي</span>
                  <span className={`order-financial-value ${isSettled ? 'value-settled' : 'value-remaining'}`}>
                    {isSettled
                      ? `مُسوَّى بالكامل ✓`
                      : `${fNum(remaining)} ${o.currency}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات إضافية</h3></div>
            <div className="ofs-card-body">
              <DetailRow label="المندوب"   value={o.assignedTo ?? '—'} />
              <DetailRow label="الدفع"     value={ORDER_PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod} />
              <DetailRow label="العملة"    value={o.currency} />
              {o.shippingMethod && (
                <DetailRow label="الشحن" value={ORDER_SHIPPING_LABELS[o.shippingMethod] ?? o.shippingMethod} />
              )}
              <DetailRow label="تاريخ الإنشاء"  value={o.createdAt} />
              <DetailRow label="آخر تحديث"       value={o.updatedAt} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockLeads, LEAD_PAYMENT_LABELS } from '@/lib/mock-data';
import LeadStatusBadge from '@/components/leads/LeadStatusBadge';
import { fNum } from '@/lib/format';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lead = mockLeads.find(l => l.id === id);
  return { title: lead ? lead.customerName : 'عميل محتمل' };
}

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  created: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  status_change: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  assigned: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  note: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  call: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.94-1.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.9z"/>
    </svg>
  ),
};

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      <span className={`detail-row-value${mono ? ' num' : ''}`}>{value}</span>
    </div>
  );
}

export default async function LeadDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const lead = mockLeads.find(l => l.id === id);
  if (!lead) notFound();

  return (
    <>
      {/* Page header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <Link href={`/${locale}/sales/leads`} className="btn-ghost"
            style={{ marginBlockStart: 6, padding: '6px 8px', gap: 'var(--space-1)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            رجوع
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-1)' }}>
              <h2 className="page-title">{lead.customerName}</h2>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="page-subtitle">
              {lead.externalOrderId && <>طلب # {lead.externalOrderId} · </>}
              {lead.orderDate}
              {lead.assignedTo && <> · مُعيّن: {lead.assignedTo}</>}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
          <Link href={`/${locale}/sales/leads/${id}/edit`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </Link>
        </div>
      </div>

      {/* Detail grid */}
      <div className="lead-detail-grid">
        {/* ── Left / main column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* معلومات العميل */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">معلومات العميل</h3>
            </div>
            <div className="detail-section-body">
              <DetailRow label="الاسم"               value={lead.customerName} />
              <DetailRow label="رقم الهاتف"          value={lead.phone} mono />
              <DetailRow label="البلد"               value={lead.country} />
              {lead.city    && <DetailRow label="المدينة"   value={lead.city} />}
              {lead.address && <DetailRow label="العنوان"   value={lead.address} />}
            </div>
          </div>

          {/* معلومات الطلب */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">معلومات الطلب</h3>
            </div>
            <div className="detail-section-body">
              {lead.externalOrderId && <DetailRow label="رقم الطلب الخارجي" value={lead.externalOrderId} mono />}
              <DetailRow label="تاريخ الطلب"     value={lead.orderDate} />
              <DetailRow label="المنتج"          value={lead.product} />
              <DetailRow label="الكمية"          value={`${lead.quantity} وحدة`} mono />
              <DetailRow label="المبلغ المدفوع"
                value={`${fNum(lead.paidAmount)} ${lead.currency}`} mono />
              <DetailRow label="طريقة الدفع"    value={LEAD_PAYMENT_LABELS[lead.paymentMethod]} />
              {lead.receipt && <DetailRow label="رقم الإيصال" value={lead.receipt} mono />}
            </div>
          </div>

          {/* سجل النشاط */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">سجل النشاط</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {lead.timeline.length} حدث
              </span>
            </div>
            <div className="lead-timeline">
              {lead.timeline.map(event => (
                <div key={event.id} className="timeline-event">
                  <div className={`timeline-dot timeline-dot-${event.type}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {TIMELINE_ICONS[event.type]}
                  </div>
                  <div className="timeline-content">
                    <p className="timeline-desc">{event.descriptionAr}</p>
                    <div className="timeline-meta">
                      <span>{event.author}</span>
                      <span>·</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right / sidebar column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* الحالة والتعيين */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">الحالة والتعيين</h3>
            </div>
            <div className="detail-section-body">
              <div className="detail-row">
                <span className="detail-row-label">الحالة الحالية</span>
                <LeadStatusBadge status={lead.status} />
              </div>
              {lead.assignedTo && <DetailRow label="مُعيّن إلى" value={lead.assignedTo} />}
              <DetailRow label="تاريخ الإنشاء"  value={lead.createdAt} />
              <DetailRow label="آخر تحديث"      value={lead.updatedAt} />
            </div>
          </div>

          {/* ملاحظات */}
          {lead.notes && (
            <div className="ofs-card">
              <div className="ofs-card-header">
                <h3 className="ofs-card-title">ملاحظات</h3>
              </div>
              <div style={{
                padding: 'var(--space-5)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text)',
                lineHeight: 1.75,
              }}>
                {lead.notes}
              </div>
            </div>
          )}

          {/* ملخص مالي */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">ملخص مالي</h3>
            </div>
            <div className="detail-section-body">
              <div className="detail-row">
                <span className="detail-row-label">المبلغ المدفوع</span>
                <span className="detail-row-value num" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
                  {fNum(lead.paidAmount)}
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', marginInlineStart: 4, color: 'var(--color-text-muted)' }}>
                    {lead.currency}
                  </span>
                </span>
              </div>
              <DetailRow label="الكمية"       value={`${lead.quantity} وحدة`} mono />
              <DetailRow label="طريقة الدفع" value={LEAD_PAYMENT_LABELS[lead.paymentMethod]} />
            </div>
          </div>

          {/* إجراءات سريعة */}
          <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link href={`/${locale}/sales/leads/${id}/edit`} className="btn-outline"
                style={{ justifyContent: 'center' }}>
                تعديل البيانات
              </Link>
              <Link href={`/${locale}/sales/leads`} className="btn-ghost"
                style={{ justifyContent: 'center' }}>
                العودة للقائمة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

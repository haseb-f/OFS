import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockCustomers, TAG_COLORS } from '@/lib/mock-data';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import CustomerTypeBadge from '@/components/customers/CustomerTypeBadge';
import { fNum } from '@/lib/format';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = mockCustomers.find(x => x.id === id);
  return { title: c?.nameAr ?? 'العميل' };
}

const AVATAR_COLORS = { company: 'type-company', individual: 'type-individual', government: 'type-government' };

const FILE_TYPE_LABELS = { pdf: 'PDF', excel: 'XLS', word: 'DOC', image: 'IMG' };

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      <span className={`detail-row-value${mono ? ' num' : ''}`}>{value}</span>
    </div>
  );
}

const TIMELINE_DOT: Record<string, string> = {
  created:      'timeline-dot-created',
  order:        'timeline-dot-status_change',
  payment:      'timeline-dot-assigned',
  note:         'timeline-dot-note',
  status_change:'timeline-dot-status_change',
  contact:      'timeline-dot-call',
};

export default async function CustomerDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const c = mockCustomers.find(x => x.id === id);
  if (!c) notFound();

  const initial = c.nameAr.trim().charAt(0);

  return (
    <>
      {/* Page header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <Link href={`/${locale}/sales/customers`} className="btn-ghost"
            style={{ marginBlockStart: 6, padding: '6px 8px', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            رجوع
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBlockEnd: 4 }}>
              <h2 className="page-title">{c.nameAr}</h2>
              <CustomerStatusBadge status={c.status} />
            </div>
            <p className="page-subtitle">
              {c.code}
              {c.assignedSalesperson && <> · {c.assignedSalesperson}</>}
              {c.lastOrderDate && <> · آخر طلب: {c.lastOrderDate}</>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
          <Link href={`/${locale}/sales/customers/${id}/statement`} className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            كشف الحساب
          </Link>
          <Link href={`/${locale}/sales/customers/${id}/edit`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </Link>
        </div>
      </div>

      {/* Profile card */}
      <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="customer-profile-card">
          <div className={`customer-avatar-lg ${AVATAR_COLORS[c.type]}`}>{initial}</div>
          <div className="customer-profile-info">
            <p className="customer-profile-name">{c.nameAr}</p>
            {c.nameEn && <p className="customer-profile-name-en">{c.nameEn}</p>}
            <div className="customer-profile-badges">
              <span className="customer-code-badge">{c.code}</span>
              <CustomerTypeBadge type={c.type} />
              <CustomerStatusBadge status={c.status} />
            </div>
            {c.tags.length > 0 && (
              <div className="customer-tags">
                {c.tags.map(tag => {
                  const col = TAG_COLORS[tag];
                  return (
                    <span key={tag} className="tag-chip"
                      style={{ background: col?.bg, color: col?.color, borderColor: col?.border, border: '1px solid' }}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="customer-stats-row">
          <div className="customer-stat">
            <span className="customer-stat-label">إجمالي الطلبات</span>
            <span className="customer-stat-value">{c.totalOrders}</span>
            <span className="customer-stat-sub">طلب</span>
          </div>
          <div className="customer-stat">
            <span className="customer-stat-label">إجمالي القيمة</span>
            <span className="customer-stat-value" style={{ fontSize: 'var(--font-size-base)' }}>
              {fNum(c.totalOrderValue)}
            </span>
            <span className="customer-stat-sub">{c.currency}</span>
          </div>
          <div className="customer-stat">
            <span className="customer-stat-label">الرصيد المستحق</span>
            <span className="customer-stat-value"
              style={{ color: c.outstanding === 0 ? 'var(--color-status-active)' : 'var(--color-status-pending)', fontSize: 'var(--font-size-base)' }}>
              {c.outstanding === 0 ? 'مُسوَّى' : fNum(c.outstanding)}
            </span>
            {c.outstanding > 0 && <span className="customer-stat-sub">{c.currency}</span>}
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="customer-detail-grid">
        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* معلومات الاتصال */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">معلومات الاتصال</h3>
            </div>
            <div className="detail-section-body">
              <Row label="الهاتف الرئيسي" value={<span style={{ direction: 'ltr', display: 'inline-block' }}>{c.phone}</span>} mono />
              {c.phone2 && <Row label="الهاتف الثاني"  value={<span style={{ direction: 'ltr', display: 'inline-block' }}>{c.phone2}</span>} mono />}
              {c.email  && <Row label="البريد الإلكتروني" value={
                <a href={`mailto:${c.email}`} style={{ color: 'var(--color-primary)', direction: 'ltr', display: 'inline-block' }}>{c.email}</a>
              } />}
            </div>
          </div>

          {/* جهات الاتصال */}
          {c.contacts.length > 0 && (
            <div className="ofs-card">
              <div className="ofs-card-header">
                <h3 className="ofs-card-title">جهات الاتصال</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{c.contacts.length} جهة</span>
              </div>
              <div className="contacts-list">
                {c.contacts.map(con => (
                  <div key={con.id} className="contact-item">
                    <div className="contact-avatar">{con.nameAr.charAt(0)}</div>
                    <div>
                      <p className="contact-name">{con.nameAr}</p>
                      {con.role  && <p className="contact-role">{con.role}</p>}
                      <p className="contact-phone">{con.phone}</p>
                      {con.email && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBlockStart: 1, direction: 'ltr', textAlign: 'start' }}>
                          {con.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* العنوان */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">العنوان</h3></div>
            <div className="detail-section-body">
              <Row label="البلد"        value={c.country} />
              <Row label="المدينة"      value={c.city} />
              {c.district && <Row label="الحي / المنطقة" value={c.district} />}
              {c.street   && <Row label="الشارع"         value={c.street} />}
            </div>
          </div>

          {/* الملخص المالي */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">الملخص المالي</h3>
              <Link href={`/${locale}/sales/customers/${id}/statement`}
                style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                كشف الحساب ←
              </Link>
            </div>
            <div className="detail-section-body">
              <Row label="إجمالي الطلبات"  value={`${c.totalOrders} طلب`} />
              <Row label="إجمالي القيمة"   value={`${fNum(c.totalOrderValue)} ${c.currency}`} mono />
              <Row label="إجمالي المدفوع"  value={`${fNum(c.totalPaid)} ${c.currency}`} mono />
              <div className="detail-row">
                <span className="detail-row-label">الرصيد المستحق</span>
                <span className={`detail-row-value num`} style={{
                  color: c.outstanding === 0 ? 'var(--color-status-active)' : 'var(--color-status-pending)',
                  fontWeight: 'var(--font-weight-bold)',
                }}>
                  {c.outstanding === 0 ? 'مُسوَّى' : `${fNum(c.outstanding)} ${c.currency}`}
                </span>
              </div>
              {c.creditLimit != null && (
                <Row label="حد الائتمان" value={`${fNum(c.creditLimit)} ${c.currency}`} mono />
              )}
              {c.lastOrderDate   && <Row label="آخر طلب"  value={c.lastOrderDate} />}
              {c.lastPaymentDate && <Row label="آخر دفعة" value={c.lastPaymentDate} />}
            </div>
          </div>

          {/* سجل النشاط */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">سجل النشاط</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {c.timeline.length} حدث
              </span>
            </div>
            <div className="lead-timeline">
              {c.timeline.map(ev => (
                <div key={ev.id} className="timeline-event">
                  <div className={`timeline-dot ${TIMELINE_DOT[ev.type] ?? 'timeline-dot-created'}`} />
                  <div className="timeline-content">
                    <p className="timeline-desc">{ev.descriptionAr}</p>
                    <div className="timeline-meta">
                      <span>{ev.author}</span><span>·</span><span>{ev.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* التعيين والمعلومات */}
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات الحساب</h3></div>
            <div className="detail-section-body">
              <Row label="الحالة" value={<CustomerStatusBadge status={c.status} />} />
              <Row label="النوع"  value={<CustomerTypeBadge  type={c.type} />} />
              {c.assignedSalesperson && <Row label="المندوب المسؤول" value={c.assignedSalesperson} />}
              {c.taxNumber           && <Row label="الرقم الضريبي"   value={c.taxNumber} mono />}
              {c.commercialRegNumber && <Row label="السجل التجاري"   value={c.commercialRegNumber} mono />}
              <Row label="تاريخ الإنشاء"  value={c.createdAt} />
              <Row label="آخر تحديث"      value={c.updatedAt} />
            </div>
          </div>

          {/* الملاحظات */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">الملاحظات</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {c.notes.length} ملاحظة
              </span>
            </div>
            {c.notes.length > 0 ? (
              <div className="notes-list">
                {c.notes.map(n => (
                  <div key={n.id} className="note-item">
                    <p className="note-text">{n.text}</p>
                    <div className="note-meta">
                      <span>{n.author}</span><span>·</span><span>{n.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                لا توجد ملاحظات
              </div>
            )}
            <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border-subtle)' }}>
              <button className="btn-ghost" style={{ inlineSize: '100%', justifyContent: 'center', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                إضافة ملاحظة
              </button>
            </div>
          </div>

          {/* المرفقات */}
          <div className="ofs-card">
            <div className="ofs-card-header">
              <h3 className="ofs-card-title">المرفقات</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {c.attachments.length} ملف
              </span>
            </div>
            {c.attachments.length > 0 ? (
              <div className="attachments-list">
                {c.attachments.map(att => (
                  <div key={att.id} className="attachment-item">
                    <div className={`attachment-icon type-${att.fileType}`}>
                      {FILE_TYPE_LABELS[att.fileType]}
                    </div>
                    <div className="attachment-info">
                      <p className="attachment-name">{att.name}</p>
                      <p className="attachment-meta">{att.size} · {att.uploadedAt}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                لا توجد مرفقات
              </div>
            )}
            <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border-subtle)' }}>
              <button className="btn-ghost" style={{ inlineSize: '100%', justifyContent: 'center', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                رفع ملف
              </button>
            </div>
          </div>

          {/* إجراءات سريعة */}
          <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link href={`/${locale}/sales/customers/${id}/statement`} className="btn-outline"
                style={{ justifyContent: 'center' }}>
                عرض كشف الحساب
              </Link>
              <Link href={`/${locale}/sales/customers/${id}/edit`} className="btn-outline"
                style={{ justifyContent: 'center' }}>
                تعديل البيانات
              </Link>
              <Link href={`/${locale}/sales/customers`} className="btn-ghost"
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

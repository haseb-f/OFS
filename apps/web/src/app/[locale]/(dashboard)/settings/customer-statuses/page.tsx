'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CustomerStatus {
  id:          string;
  code:        string;
  nameAr:      string;
  nameEn:      string;
  color:       string;
  bgColor:     string;
  description: string;
  isSystem:    boolean;
  order:       number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: CustomerStatus[] = [
  { id: 'cs-1', code: 'LEAD',       nameAr: 'عميل محتمل', nameEn: 'Lead',       color: '#1d4ed8', bgColor: '#eff6ff', description: 'جهة اتصال أولية — لم يتم التفاعل بعد',         isSystem: true,  order: 1 },
  { id: 'cs-2', code: 'INTERESTED', nameAr: 'مهتم',       nameEn: 'Interested', color: '#b45309', bgColor: '#fffbeb', description: 'أبدى اهتمامه بالمنتجات أو الخدمات',            isSystem: false, order: 2 },
  { id: 'cs-3', code: 'QUALIFIED',  nameAr: 'مؤهّل',      nameEn: 'Qualified',  color: '#7c3aed', bgColor: '#f5f3ff', description: 'تم التحقق من احتياجاته وصلاحيته كعميل فعلي',    isSystem: false, order: 3 },
  { id: 'cs-4', code: 'CUSTOMER',   nameAr: 'عميل',       nameEn: 'Customer',   color: '#15803d', bgColor: '#f0fdf4', description: 'أتمّ صفقة شراء واحدة على الأقل',                isSystem: true,  order: 4 },
  { id: 'cs-5', code: 'INACTIVE',   nameAr: 'غير نشط',   nameEn: 'Inactive',   color: '#475569', bgColor: '#f8fafc', description: 'لم يتعامل خلال الفترة الأخيرة أو طلب الإيقاف', isSystem: false, order: 5 },
];

// ── Modal ─────────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { color: '#15803d', bg: '#f0fdf4' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#7c3aed', bg: '#f5f3ff' },
  { color: '#b45309', bg: '#fffbeb' },
  { color: '#0891b2', bg: '#ecfeff' },
  { color: '#b91c1c', bg: '#fef2f2' },
  { color: '#475569', bg: '#f8fafc' },
  { color: '#6d28d9', bg: '#f5f3ff' },
];

interface ModalProps {
  item?:   CustomerStatus;
  onClose: () => void;
  onSave:  (data: Omit<CustomerStatus, 'id' | 'isSystem'>) => void;
}

function StatusModal({ item, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    code:        item?.code        ?? '',
    nameAr:      item?.nameAr      ?? '',
    nameEn:      item?.nameEn      ?? '',
    color:       item?.color       ?? '#15803d',
    bgColor:     item?.bgColor     ?? '#f0fdf4',
    description: item?.description ?? '',
    order:       item?.order       ?? 99,
  });

  const isEdit = Boolean(item);
  function field<K extends keyof typeof form>(key: K, val: typeof form[K]) { setForm(f => ({ ...f, [key]: val })); }

  function selectColor(color: string, bg: string) { setForm(f => ({ ...f, color, bgColor: bg })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameAr.trim()) return;
    onSave(form);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onClose}>
      <div style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', inlineSize: '100%', maxInlineSize: '520px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{isEdit ? 'تعديل الحالة' : 'إضافة حالة'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
        <form onSubmit={submit}>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>معاينة:</span>
              <span className="status-badge" style={{ backgroundColor: form.bgColor, color: form.color }}>
                {form.nameAr || 'الاسم'}
              </span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">الاسم بالعربية *</label>
                <input className="form-input" value={form.nameAr} onChange={e => field('nameAr', e.target.value)} placeholder="مثال: مهتم" required />
              </div>
              <div className="form-group">
                <label className="form-label">كود الحالة</label>
                <input className="form-input" value={form.code} onChange={e => field('code', e.target.value.toUpperCase())} placeholder="INTERESTED" dir="ltr" disabled={isEdit && item?.isSystem} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">الاسم بالإنجليزية</label>
              <input className="form-input" value={form.nameEn} onChange={e => field('nameEn', e.target.value)} placeholder="e.g. Interested" dir="ltr" />
            </div>

            <div className="form-group">
              <label className="form-label">لون الحالة</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(({ color, bg }) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => selectColor(color, bg)}
                    style={{
                      inlineSize: '28px', blockSize: '28px',
                      borderRadius: 'var(--radius-full)',
                      background: bg,
                      border: form.color === color ? `3px solid ${color}` : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label={`لون ${color}`}
                  >
                    <span style={{ inlineSize: 12, blockSize: 12, borderRadius: '50%', background: color }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">الوصف</label>
              <textarea className="form-textarea" value={form.description} onChange={e => field('description', e.target.value)} placeholder="وصف مختصر لهذه الحالة..." rows={2} style={{ resize: 'vertical', minBlockSize: '72px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderBlockStart: '1px solid var(--color-border-subtle)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn-cta">{isEdit ? 'حفظ التعديلات' : 'إضافة'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerStatusesPage() {
  const [items,   setItems]   = useState<CustomerStatus[]>(INITIAL);
  const [modal,   setModal]   = useState<{ mode: 'create' | 'edit'; item?: CustomerStatus } | null>(null);
  const [delId,   setDelId]   = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => a.order - b.order);

  function handleSave(data: Omit<CustomerStatus, 'id' | 'isSystem'>) {
    if (modal?.mode === 'create') {
      setItems(prev => [...prev, { ...data, id: `cs-${Date.now()}`, isSystem: false }]);
    } else if (modal?.item) {
      setItems(prev => prev.map(s => s.id === modal.item!.id ? { ...s, ...data } : s));
    }
    setModal(null);
  }

  function handleDelete() {
    setItems(prev => prev.filter(s => s.id !== delId));
    setDelId(null);
  }

  return (
    <>
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div className="ofs-table-toolbar">
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {items.length} حالة
          </div>
          <div className="ofs-table-toolbar-end">
            <button className="btn-cta" onClick={() => setModal({ mode: 'create' })}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginInlineEnd: 'var(--space-1)' }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة حالة
            </button>
          </div>
        </div>

        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: '40px' }}>#</th>
                <th>الحالة</th>
                <th>الكود</th>
                <th>الوصف</th>
                <th style={{ inlineSize: '110px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((status, idx) => (
                <tr key={status.id}>
                  <td style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: status.bgColor, color: status.color }}>
                      {status.nameAr}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', paddingInline: 'var(--space-2)', paddingBlock: '2px' }}>
                      {status.code}
                    </span>
                    {status.isSystem && (
                      <span style={{ marginInlineStart: 'var(--space-2)', fontSize: '10px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', paddingInline: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' }}>
                        أساسي
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxInlineSize: '280px' }}>
                    {status.description || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', blockSize: '30px' }} onClick={() => setModal({ mode: 'edit', item: status })}>تعديل</button>
                      {!status.isSystem && (
                        <button onClick={() => setDelId(status.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }} aria-label="حذف">
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline preview */}
      <div className="ofs-card" style={{ padding: 'var(--space-5)', marginBlockStart: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-3)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          تسلسل الحالات
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {sorted.map((status, idx) => (
            <div key={status.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="status-badge" style={{ backgroundColor: status.bgColor, color: status.color }}>{status.nameAr}</span>
              {idx < sorted.length - 1 && (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} aria-hidden="true">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {modal && <StatusModal item={modal.item} onClose={() => setModal(null)} onSave={handleSave} />}

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={() => setDelId(null)}>
          <div style={{ background: 'var(--glass-bg-strong)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--glass-border)', inlineSize: '100%', maxInlineSize: '400px', padding: 'var(--space-6)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ inlineSize: 48, blockSize: 48, borderRadius: 'var(--radius-full)', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBlockEnd: 'var(--space-4)' }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#b91c1c' }} aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            </div>
            <h4 style={{ margin: 0, marginBlockEnd: 'var(--space-2)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>حذف الحالة</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>هل تريد حذف هذه الحالة؟</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button className="btn-outline" onClick={() => setDelId(null)}>إلغاء</button>
              <button onClick={handleDelete} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', blockSize: '38px', paddingInline: 'var(--space-5)', background: '#b91c1c', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

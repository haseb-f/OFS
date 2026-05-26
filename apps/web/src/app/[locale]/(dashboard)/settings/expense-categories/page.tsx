'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryStatus = 'active' | 'inactive';

interface ExpenseCategory {
  id:          string;
  code:        string;
  nameAr:      string;
  nameEn:      string;
  description: string;
  status:      CategoryStatus;
  iconColor:   string;
  iconBg:      string;
  isSystem:    boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: ExpenseCategory[] = [
  { id: 'ec-1', code: 'MARKETING',     nameAr: 'التسويق والإعلان', nameEn: 'Marketing',     description: 'مصاريف التسويق والإعلانات وحملات التوعية',        status: 'active',   iconColor: '#7c3aed', iconBg: '#f5f3ff', isSystem: false },
  { id: 'ec-2', code: 'PAYROLL',       nameAr: 'الرواتب',          nameEn: 'Payroll',       description: 'رواتب الموظفين والمكافآت والعمولات',               status: 'active',   iconColor: '#15803d', iconBg: '#f0fdf4', isSystem: true  },
  { id: 'ec-3', code: 'RENT',          nameAr: 'الإيجارات',        nameEn: 'Rent',          description: 'إيجار المكاتب والمستودعات والمنشآت',               status: 'active',   iconColor: '#0891b2', iconBg: '#ecfeff', isSystem: false },
  { id: 'ec-4', code: 'UTILITIES',     nameAr: 'المرافق',          nameEn: 'Utilities',     description: 'فواتير الكهرباء والماء والغاز والاتصالات',          status: 'active',   iconColor: '#d97706', iconBg: '#fffbeb', isSystem: false },
  { id: 'ec-5', code: 'SHIPPING',      nameAr: 'الشحن والتوصيل',   nameEn: 'Shipping',      description: 'تكاليف الشحن والتوصيل والتخليص الجمركي',           status: 'active',   iconColor: '#1d4ed8', iconBg: '#eff6ff', isSystem: false },
  { id: 'ec-6', code: 'BANK_FEES',     nameAr: 'الرسوم البنكية',   nameEn: 'Bank Fees',     description: 'عمولات وأتعاب الخدمات البنكية والمالية',            status: 'active',   iconColor: '#b45309', iconBg: '#fffbeb', isSystem: false },
  { id: 'ec-7', code: 'ADMINISTRATIVE',nameAr: 'المصروفات الإدارية',nameEn: 'Administrative',description: 'القرطاسية والمستلزمات المكتبية وأتعاب الاستشارات', status: 'active',   iconColor: '#475569', iconBg: '#f8fafc', isSystem: false },
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CategoryStatus }) {
  return status === 'active'
    ? <span className="status-badge" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#15803d' }}>نشطة</span>
    : <span className="status-badge" style={{ backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569' }}>غير نشطة</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  item?:   ExpenseCategory;
  onClose: () => void;
  onSave:  (data: Omit<ExpenseCategory, 'id' | 'isSystem'>) => void;
}

const COLOR_PRESETS = [
  { color: '#7c3aed', bg: '#f5f3ff' }, { color: '#15803d', bg: '#f0fdf4' },
  { color: '#0891b2', bg: '#ecfeff' }, { color: '#d97706', bg: '#fffbeb' },
  { color: '#1d4ed8', bg: '#eff6ff' }, { color: '#b45309', bg: '#fffbeb' },
  { color: '#b91c1c', bg: '#fef2f2' }, { color: '#475569', bg: '#f8fafc' },
];

function CategoryModal({ item, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    code:        item?.code        ?? '',
    nameAr:      item?.nameAr      ?? '',
    nameEn:      item?.nameEn      ?? '',
    description: item?.description ?? '',
    status:      (item?.status     ?? 'active') as CategoryStatus,
    iconColor:   item?.iconColor   ?? '#7c3aed',
    iconBg:      item?.iconBg      ?? '#f5f3ff',
  });

  const isEdit = Boolean(item);
  function field<K extends keyof typeof form>(key: K, val: typeof form[K]) { setForm(f => ({ ...f, [key]: val })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameAr.trim()) return;
    onSave(form);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onClose}>
      <div style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', inlineSize: '100%', maxInlineSize: '520px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{isEdit ? 'تعديل الفئة' : 'إضافة فئة مصروف'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
        <form onSubmit={submit}>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">الاسم بالعربية *</label>
                <input className="form-input" value={form.nameAr} onChange={e => field('nameAr', e.target.value)} placeholder="مثال: الرواتب" required />
              </div>
              <div className="form-group">
                <label className="form-label">الكود</label>
                <input className="form-input" value={form.code} onChange={e => field('code', e.target.value.toUpperCase())} placeholder="PAYROLL" dir="ltr" disabled={isEdit && item?.isSystem} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالإنجليزية</label>
              <input className="form-input" value={form.nameEn} onChange={e => field('nameEn', e.target.value)} placeholder="e.g. Payroll" dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">اللون</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {COLOR_PRESETS.map(({ color, bg }) => (
                  <button key={color} type="button" onClick={() => { field('iconColor', color); field('iconBg', bg); }} style={{ inlineSize: '28px', blockSize: '28px', borderRadius: 'var(--radius-full)', background: bg, border: form.iconColor === color ? `3px solid ${color}` : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={`لون ${color}`}>
                    <span style={{ inlineSize: 12, blockSize: 12, borderRadius: '50%', background: color }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">الوصف</label>
              <textarea className="form-textarea" value={form.description} onChange={e => field('description', e.target.value)} rows={2} style={{ resize: 'vertical', minBlockSize: '72px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">الحالة</label>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                {(['active', 'inactive'] as CategoryStatus[]).map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                    <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => field('status', s)} style={{ accentColor: 'var(--color-primary)' }} />
                    {s === 'active' ? 'نشطة' : 'غير نشطة'}
                  </label>
                ))}
              </div>
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

// ── Category icon ─────────────────────────────────────────────────────────────

function CategoryIcon({ code }: { code: string }) {
  if (code === 'PAYROLL') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
    </svg>
  );
  if (code === 'SHIPPING') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-.8.4l-2.4 3.2V14h4a1 1 0 001-1v-2h1a1 1 0 001-1V9a1 1 0 00-1-1h-1.5l-1.5-1zm-1.05 9a2.5 2.5 0 014.9 0H18a1 1 0 001-1v-1h-1V9.36l-1.2-1.6A2 2 0 0015 7h-2v10h-.05z"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExpenseCategoriesPage() {
  const [items,  setItems]  = useState<ExpenseCategory[]>(INITIAL);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState<{ mode: 'create' | 'edit'; item?: ExpenseCategory } | null>(null);
  const [delId,  setDelId]  = useState<string | null>(null);

  const filtered = items.filter(c =>
    !search ||
    c.nameAr.includes(search) ||
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave(data: Omit<ExpenseCategory, 'id' | 'isSystem'>) {
    if (modal?.mode === 'create') {
      setItems(prev => [...prev, { ...data, id: `ec-${Date.now()}`, isSystem: false }]);
    } else if (modal?.item) {
      setItems(prev => prev.map(c => c.id === modal.item!.id ? { ...c, ...data } : c));
    }
    setModal(null);
  }

  function handleDelete() {
    setItems(prev => prev.filter(c => c.id !== delId));
    setDelId(null);
  }

  return (
    <>
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div className="ofs-table-toolbar">
          <div className="ofs-table-toolbar-search">
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', insetInlineStart: 'var(--space-3)', insetBlockStart: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input className="form-input" style={{ paddingInlineStart: 'calc(var(--space-3) + 16px + var(--space-2))', blockSize: '38px', fontSize: 'var(--font-size-sm)' }} placeholder="بحث في التصنيفات..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="ofs-table-toolbar-end">
            <span className="ofs-table-result-count">{filtered.length} فئة</span>
            <button className="btn-cta" onClick={() => setModal({ mode: 'create' })}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginInlineEnd: 'var(--space-1)' }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة فئة
            </button>
          </div>
        </div>

        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th>الفئة</th>
                <th>الكود</th>
                <th>الوصف</th>
                <th style={{ inlineSize: '90px' }}>الحالة</th>
                <th style={{ inlineSize: '110px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>لا توجد نتائج</td></tr>
              ) : (
                filtered.map(cat => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ inlineSize: '36px', blockSize: '36px', borderRadius: 'var(--radius-md)', background: cat.iconBg, color: cat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                          <CategoryIcon code={cat.code} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{cat.nameAr}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }} dir="ltr">{cat.nameEn}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', paddingInline: 'var(--space-2)', paddingBlock: '2px' }}>{cat.code}</span>
                      {cat.isSystem && <span style={{ marginInlineStart: 'var(--space-2)', fontSize: '10px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', paddingInline: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' }}>أساسي</span>}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxInlineSize: '260px' }}>{cat.description || '—'}</td>
                    <td><StatusBadge status={cat.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', blockSize: '30px' }} onClick={() => setModal({ mode: 'edit', item: cat })}>تعديل</button>
                        {!cat.isSystem && (
                          <button onClick={() => setDelId(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }} aria-label="حذف">
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <CategoryModal item={modal.item} onClose={() => setModal(null)} onSave={handleSave} />}

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={() => setDelId(null)}>
          <div style={{ background: 'var(--glass-bg-strong)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--glass-border)', inlineSize: '100%', maxInlineSize: '400px', padding: 'var(--space-6)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h4 style={{ margin: 0, marginBlockEnd: 'var(--space-2)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>حذف الفئة</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>هل تريد حذف هذه الفئة؟</p>
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

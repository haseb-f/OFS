'use client';

import { useState } from 'react';
import OfsSelect from '@/components/ui/OfsSelect';

// ── Types ─────────────────────────────────────────────────────────────────────

type CostCenterStatus = 'active' | 'inactive';

interface CostCenter {
  id:       string;
  code:     string;
  nameAr:   string;
  nameEn:   string;
  parentId: string | null;
  status:   CostCenterStatus;
  level:    number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: CostCenter[] = [
  { id: 'cc-1',  code: 'CC-100', nameAr: 'المبيعات',                nameEn: 'Sales',               parentId: null,   status: 'active',   level: 1 },
  { id: 'cc-2',  code: 'CC-110', nameAr: 'مبيعات السعودية',         nameEn: 'Saudi Sales',          parentId: 'cc-1', status: 'active',   level: 2 },
  { id: 'cc-3',  code: 'CC-120', nameAr: 'مبيعات الخليج',           nameEn: 'Gulf Sales',           parentId: 'cc-1', status: 'active',   level: 2 },
  { id: 'cc-4',  code: 'CC-200', nameAr: 'العمليات',                nameEn: 'Operations',           parentId: null,   status: 'active',   level: 1 },
  { id: 'cc-5',  code: 'CC-210', nameAr: 'المستودعات',              nameEn: 'Warehouses',           parentId: 'cc-4', status: 'active',   level: 2 },
  { id: 'cc-6',  code: 'CC-220', nameAr: 'الشحن والتوصيل',          nameEn: 'Shipping & Delivery',  parentId: 'cc-4', status: 'active',   level: 2 },
  { id: 'cc-7',  code: 'CC-300', nameAr: 'الإدارة العامة',           nameEn: 'General Admin',        parentId: null,   status: 'active',   level: 1 },
  { id: 'cc-8',  code: 'CC-310', nameAr: 'الموارد البشرية',         nameEn: 'Human Resources',      parentId: 'cc-7', status: 'active',   level: 2 },
  { id: 'cc-9',  code: 'CC-320', nameAr: 'تقنية المعلومات',         nameEn: 'Information Technology',parentId: 'cc-7', status: 'active',   level: 2 },
  { id: 'cc-10', code: 'CC-400', nameAr: 'التسويق',                 nameEn: 'Marketing',            parentId: null,   status: 'inactive', level: 1 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CostCenterStatus }) {
  return status === 'active'
    ? <span className="status-badge" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#15803d' }}>نشط</span>
    : <span className="status-badge" style={{ backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569' }}>غير نشط</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  item?:   CostCenter;
  items:   CostCenter[];
  onClose: () => void;
  onSave:  (data: Omit<CostCenter, 'id'>) => void;
}

function CostCenterModal({ item, items, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    code:     item?.code     ?? '',
    nameAr:   item?.nameAr   ?? '',
    nameEn:   item?.nameEn   ?? '',
    parentId: item?.parentId ?? null as string | null,
    status:   (item?.status  ?? 'active') as CostCenterStatus,
    level:    item?.level    ?? 1,
  });

  const isEdit = Boolean(item);
  function field<K extends keyof typeof form>(key: K, val: typeof form[K]) { setForm(f => ({ ...f, [key]: val })); }

  // Only allow selecting top-level centers as parent (avoid circular)
  const parentOptions = items
    .filter(c => c.level === 1 && c.id !== item?.id)
    .map(c => ({ value: c.id, label: `${c.code} — ${c.nameAr}` }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.nameAr.trim()) return;
    const level = form.parentId ? 2 : 1;
    onSave({ ...form, level });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onClose}>
      <div style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', inlineSize: '100%', maxInlineSize: '520px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{isEdit ? 'تعديل مركز التكلفة' : 'إضافة مركز تكلفة'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
        <form onSubmit={submit}>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">الكود *</label>
                <input className="form-input" value={form.code} onChange={e => field('code', e.target.value.toUpperCase())} placeholder="CC-100" dir="ltr" required />
              </div>
              <div className="form-group">
                <label className="form-label">المركز الأعلى</label>
                <OfsSelect
                  options={[{ value: '', label: 'مركز رئيسي (لا يوجد)' }, ...parentOptions]}
                  value={form.parentId ?? ''}
                  onChange={v => field('parentId', v || null)}
                  placeholder="مركز رئيسي"
                  clearable
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالعربية *</label>
              <input className="form-input" value={form.nameAr} onChange={e => field('nameAr', e.target.value)} placeholder="مثال: المبيعات" required />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالإنجليزية</label>
              <input className="form-input" value={form.nameEn} onChange={e => field('nameEn', e.target.value)} placeholder="e.g. Sales" dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">الحالة</label>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                {(['active', 'inactive'] as CostCenterStatus[]).map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                    <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => field('status', s)} style={{ accentColor: 'var(--color-primary)' }} />
                    {s === 'active' ? 'نشط' : 'غير نشط'}
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CostCentersPage() {
  const [items,  setItems]  = useState<CostCenter[]>(INITIAL);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState<{ mode: 'create' | 'edit'; item?: CostCenter } | null>(null);
  const [delId,  setDelId]  = useState<string | null>(null);

  const filtered = items.filter(c =>
    !search ||
    c.nameAr.includes(search) ||
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const parentName = (parentId: string | null): string | null => {
    if (!parentId) return null;
    return items.find(c => c.id === parentId)?.nameAr ?? null;
  };

  function handleSave(data: Omit<CostCenter, 'id'>) {
    if (modal?.mode === 'create') {
      setItems(prev => [...prev, { ...data, id: `cc-${Date.now()}` }]);
    } else if (modal?.item) {
      setItems(prev => prev.map(c => c.id === modal.item!.id ? { ...c, ...data } : c));
    }
    setModal(null);
  }

  function handleDelete() {
    const id = delId;
    // Also remove children
    setItems(prev => prev.filter(c => c.id !== id && c.parentId !== id));
    setDelId(null);
  }

  // Sort: top-level first, then children under their parent
  const sorted = filtered.sort((a, b) => {
    if (!a.parentId && !b.parentId) return a.code.localeCompare(b.code);
    if (!a.parentId) return -1;
    if (!b.parentId) return 1;
    return a.code.localeCompare(b.code);
  });

  return (
    <>
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div className="ofs-table-toolbar">
          <div className="ofs-table-toolbar-search">
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', insetInlineStart: 'var(--space-3)', insetBlockStart: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input className="form-input" style={{ paddingInlineStart: 'calc(var(--space-3) + 16px + var(--space-2))', blockSize: '38px', fontSize: 'var(--font-size-sm)' }} placeholder="بحث في مراكز التكلفة..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="ofs-table-toolbar-end">
            <span className="ofs-table-result-count">{filtered.length} مركز</span>
            <button className="btn-cta" onClick={() => setModal({ mode: 'create' })}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginInlineEnd: 'var(--space-1)' }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة مركز
            </button>
          </div>
        </div>

        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>الاسم</th>
                <th>المركز الأعلى</th>
                <th style={{ inlineSize: '90px' }}>الحالة</th>
                <th style={{ inlineSize: '110px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>لا توجد نتائج</td></tr>
              ) : (
                sorted.map(center => {
                  const parent = parentName(center.parentId);
                  const isChild = center.level > 1;

                  return (
                    <tr key={center.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingInlineStart: isChild ? 'var(--space-5)' : 0 }}>
                          {isChild && (
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} aria-hidden="true">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                          <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', fontWeight: isChild ? 'var(--font-weight-regular)' : 'var(--font-weight-semibold)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', paddingInline: 'var(--space-2)', paddingBlock: '2px' }}>
                            {center.code}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ paddingInlineStart: isChild ? 'var(--space-5)' : 0 }}>
                          <div style={{ fontWeight: isChild ? 'var(--font-weight-regular)' : 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{center.nameAr}</div>
                          {center.nameEn && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }} dir="ltr">{center.nameEn}</div>}
                        </div>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {parent ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--color-text-subtle)' }} aria-hidden="true"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/></svg>
                            {parent}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic', fontSize: 'var(--font-size-xs)' }}>مركز رئيسي</span>
                        )}
                      </td>
                      <td><StatusBadge status={center.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', blockSize: '30px' }} onClick={() => setModal({ mode: 'edit', item: center })}>تعديل</button>
                          <button onClick={() => setDelId(center.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }} aria-label="حذف">
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <CostCenterModal item={modal.item} items={items} onClose={() => setModal(null)} onSave={handleSave} />}

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={() => setDelId(null)}>
          <div style={{ background: 'var(--glass-bg-strong)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--glass-border)', inlineSize: '100%', maxInlineSize: '420px', padding: 'var(--space-6)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ inlineSize: 48, blockSize: 48, borderRadius: 'var(--radius-full)', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBlockEnd: 'var(--space-4)' }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#b91c1c' }} aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            </div>
            <h4 style={{ margin: 0, marginBlockEnd: 'var(--space-2)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>حذف مركز التكلفة</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-2)' }}>
              هل تريد حذف هذا المركز؟
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>
              سيتم حذف جميع المراكز الفرعية التابعة أيضاً.
            </p>
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

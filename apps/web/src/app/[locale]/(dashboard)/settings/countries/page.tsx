'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Country {
  id:     string;
  code:   string;
  nameAr: string;
  nameEn: string;
  dialCode: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: Country[] = [
  { id: 'c-1',  code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia',        dialCode: '+966' },
  { id: 'c-2',  code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', dialCode: '+971' },
  { id: 'c-3',  code: 'KW', nameAr: 'الكويت',                   nameEn: 'Kuwait',              dialCode: '+965' },
  { id: 'c-4',  code: 'QA', nameAr: 'قطر',                      nameEn: 'Qatar',               dialCode: '+974' },
  { id: 'c-5',  code: 'BH', nameAr: 'البحرين',                  nameEn: 'Bahrain',             dialCode: '+973' },
  { id: 'c-6',  code: 'OM', nameAr: 'سلطنة عُمان',              nameEn: 'Oman',                dialCode: '+968' },
  { id: 'c-7',  code: 'JO', nameAr: 'الأردن',                   nameEn: 'Jordan',              dialCode: '+962' },
  { id: 'c-8',  code: 'EG', nameAr: 'مصر',                      nameEn: 'Egypt',               dialCode: '+20'  },
  { id: 'c-9',  code: 'LB', nameAr: 'لبنان',                    nameEn: 'Lebanon',             dialCode: '+961' },
  { id: 'c-10', code: 'IQ', nameAr: 'العراق',                   nameEn: 'Iraq',                dialCode: '+964' },
  { id: 'c-11', code: 'YE', nameAr: 'اليمن',                    nameEn: 'Yemen',               dialCode: '+967' },
  { id: 'c-12', code: 'SY', nameAr: 'سوريا',                    nameEn: 'Syria',               dialCode: '+963' },
  { id: 'c-13', code: 'US', nameAr: 'الولايات المتحدة',         nameEn: 'United States',       dialCode: '+1'   },
  { id: 'c-14', code: 'GB', nameAr: 'المملكة المتحدة',          nameEn: 'United Kingdom',      dialCode: '+44'  },
  { id: 'c-15', code: 'TR', nameAr: 'تركيا',                    nameEn: 'Turkey',              dialCode: '+90'  },
];

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  item?:    Country;
  onClose:  () => void;
  onSave:   (data: Omit<Country, 'id'>) => void;
}

function CountryModal({ item, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    code:     item?.code     ?? '',
    nameAr:   item?.nameAr   ?? '',
    nameEn:   item?.nameEn   ?? '',
    dialCode: item?.dialCode ?? '',
  });

  const isEdit = Boolean(item);

  function field(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.nameAr.trim()) return;
    onSave(form);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-elevated)',
          inlineSize: '100%',
          maxInlineSize: '500px',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
            {isEdit ? 'تعديل الدولة' : 'إضافة دولة'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)', borderRadius: 'var(--radius-md)' }} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit}>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">كود الدولة *</label>
                <input className="form-input" value={form.code} onChange={e => field('code', e.target.value.toUpperCase())} placeholder="مثال: SA" maxLength={3} dir="ltr" required />
              </div>
              <div className="form-group">
                <label className="form-label">كود الاتصال</label>
                <input className="form-input" value={form.dialCode} onChange={e => field('dialCode', e.target.value)} placeholder="+966" dir="ltr" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالعربية *</label>
              <input className="form-input" value={form.nameAr} onChange={e => field('nameAr', e.target.value)} placeholder="مثال: المملكة العربية السعودية" required />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالإنجليزية</label>
              <input className="form-input" value={form.nameEn} onChange={e => field('nameEn', e.target.value)} placeholder="e.g. Saudi Arabia" dir="ltr" />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderBlockStart: '1px solid var(--color-border-subtle)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn-cta">
              {isEdit ? 'حفظ التعديلات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({ nameAr, onCancel, onConfirm }: { nameAr: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-elevated)',
          inlineSize: '100%',
          maxInlineSize: '420px',
          padding: 'var(--space-6)',
          textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ inlineSize: 48, blockSize: 48, borderRadius: 'var(--radius-full)', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBlockEnd: 'var(--space-4)' }} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#b91c1c' }}>
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        </div>
        <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0, marginBlockEnd: 'var(--space-2)' }}>حذف الدولة</h4>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>
          هل تريد حذف <strong>{nameAr}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button className="btn-outline" onClick={onCancel}>إلغاء</button>
          <button
            onClick={onConfirm}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              blockSize: '38px', paddingInline: 'var(--space-5)',
              background: '#b91c1c', color: 'white', border: 'none',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CountriesPage() {
  const [items,   setItems]   = useState<Country[]>(INITIAL);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState<{ mode: 'create' | 'edit'; item?: Country } | null>(null);
  const [delItem, setDelItem] = useState<Country | null>(null);

  const filtered = items.filter(c =>
    !search ||
    c.nameAr.includes(search) ||
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave(data: Omit<Country, 'id'>) {
    if (modal?.mode === 'create') {
      setItems(prev => [...prev, { ...data, id: `c-${Date.now()}` }]);
    } else if (modal?.item) {
      setItems(prev => prev.map(c => c.id === modal.item!.id ? { ...c, ...data } : c));
    }
    setModal(null);
  }

  function handleDelete() {
    if (!delItem) return;
    setItems(prev => prev.filter(c => c.id !== delItem.id));
    setDelItem(null);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div className="ofs-table-toolbar">
          <div className="ofs-table-toolbar-search">
            <div style={{ position: 'relative' }}>
              <svg className="ofs-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: 'var(--space-3)', insetBlockStart: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', pointerEvents: 'none' }}>
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                className="form-input"
                style={{ paddingInlineStart: 'calc(var(--space-3) + 16px + var(--space-2))', blockSize: '38px', fontSize: 'var(--font-size-sm)' }}
                placeholder="بحث في الدول..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="ofs-table-toolbar-end">
            <span className="ofs-table-result-count">{filtered.length} دولة</span>
            <button className="btn-cta" onClick={() => setModal({ mode: 'create' })}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginInlineEnd: 'var(--space-1)' }}>
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              إضافة دولة
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: '70px' }}>الكود</th>
                <th>الاسم بالعربية</th>
                <th>الاسم بالإنجليزية</th>
                <th style={{ inlineSize: '100px' }}>كود الاتصال</th>
                <th style={{ inlineSize: '110px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map(country => (
                  <tr key={country.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', paddingInline: 'var(--space-2)', paddingBlock: '2px' }}>
                        {country.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{country.nameAr}</td>
                    <td dir="ltr" style={{ color: 'var(--color-text-muted)' }}>{country.nameEn}</td>
                    <td dir="ltr" style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{country.dialCode}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', blockSize: '30px' }}
                          onClick={() => setModal({ mode: 'edit', item: country })}
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => setDelItem(country)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }}
                          aria-label="حذف"
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal   && <CountryModal item={modal.item} onClose={() => setModal(null)} onSave={handleSave} />}
      {delItem && <DeleteModal nameAr={delItem.nameAr} onCancel={() => setDelItem(null)} onConfirm={handleDelete} />}
    </>
  );
}

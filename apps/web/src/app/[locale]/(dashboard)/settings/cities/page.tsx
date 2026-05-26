'use client';

import { useState } from 'react';
import OfsSelect from '@/components/ui/OfsSelect';

// ── Types ─────────────────────────────────────────────────────────────────────

interface City {
  id:        string;
  nameAr:    string;
  nameEn:    string;
  countryId: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'SA', label: 'المملكة العربية السعودية' },
  { value: 'AE', label: 'الإمارات العربية المتحدة' },
  { value: 'KW', label: 'الكويت' },
  { value: 'QA', label: 'قطر' },
  { value: 'BH', label: 'البحرين' },
  { value: 'OM', label: 'سلطنة عُمان' },
  { value: 'JO', label: 'الأردن' },
  { value: 'EG', label: 'مصر' },
];

const INITIAL: City[] = [
  { id: 'ct-1',  nameAr: 'الرياض',         nameEn: 'Riyadh',       countryId: 'SA' },
  { id: 'ct-2',  nameAr: 'جدة',            nameEn: 'Jeddah',       countryId: 'SA' },
  { id: 'ct-3',  nameAr: 'مكة المكرمة',    nameEn: 'Makkah',       countryId: 'SA' },
  { id: 'ct-4',  nameAr: 'المدينة المنورة', nameEn: 'Madinah',      countryId: 'SA' },
  { id: 'ct-5',  nameAr: 'الدمام',         nameEn: 'Dammam',       countryId: 'SA' },
  { id: 'ct-6',  nameAr: 'الطائف',         nameEn: 'Taif',         countryId: 'SA' },
  { id: 'ct-7',  nameAr: 'دبي',            nameEn: 'Dubai',        countryId: 'AE' },
  { id: 'ct-8',  nameAr: 'أبوظبي',         nameEn: 'Abu Dhabi',    countryId: 'AE' },
  { id: 'ct-9',  nameAr: 'الشارقة',        nameEn: 'Sharjah',      countryId: 'AE' },
  { id: 'ct-10', nameAr: 'عجمان',          nameEn: 'Ajman',        countryId: 'AE' },
  { id: 'ct-11', nameAr: 'مدينة الكويت',   nameEn: 'Kuwait City',  countryId: 'KW' },
  { id: 'ct-12', nameAr: 'السالمية',       nameEn: 'Salmiya',      countryId: 'KW' },
  { id: 'ct-13', nameAr: 'الدوحة',         nameEn: 'Doha',         countryId: 'QA' },
  { id: 'ct-14', nameAr: 'المنامة',        nameEn: 'Manama',       countryId: 'BH' },
  { id: 'ct-15', nameAr: 'مسقط',           nameEn: 'Muscat',       countryId: 'OM' },
  { id: 'ct-16', nameAr: 'عمّان',           nameEn: 'Amman',        countryId: 'JO' },
  { id: 'ct-17', nameAr: 'القاهرة',        nameEn: 'Cairo',        countryId: 'EG' },
  { id: 'ct-18', nameAr: 'الإسكندرية',     nameEn: 'Alexandria',   countryId: 'EG' },
];

const COUNTRY_LABEL: Record<string, string> = Object.fromEntries(COUNTRIES.map(c => [c.value, c.label]));

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  item?:   City;
  onClose: () => void;
  onSave:  (data: Omit<City, 'id'>) => void;
}

function CityModal({ item, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    nameAr:    item?.nameAr    ?? '',
    nameEn:    item?.nameEn    ?? '',
    countryId: item?.countryId ?? '',
  });

  const isEdit = Boolean(item);

  function field(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameAr.trim() || !form.countryId) return;
    onSave(form);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', inlineSize: '100%', maxInlineSize: '480px', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
            {isEdit ? 'تعديل المدينة' : 'إضافة مدينة'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
        <form onSubmit={submit}>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">الدولة *</label>
              <OfsSelect options={COUNTRIES} value={form.countryId} onChange={v => field('countryId', v)} placeholder="اختر الدولة" searchPlaceholder="ابحث..." />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالعربية *</label>
              <input className="form-input" value={form.nameAr} onChange={e => field('nameAr', e.target.value)} placeholder="مثال: الرياض" required />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالإنجليزية</label>
              <input className="form-input" value={form.nameEn} onChange={e => field('nameEn', e.target.value)} placeholder="e.g. Riyadh" dir="ltr" />
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

function DeleteModal({ nameAr, onCancel, onConfirm }: { nameAr: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onCancel}>
      <div style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', inlineSize: '100%', maxInlineSize: '400px', padding: 'var(--space-6)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ inlineSize: 48, blockSize: 48, borderRadius: 'var(--radius-full)', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBlockEnd: 'var(--space-4)' }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#b91c1c' }} aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        </div>
        <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0, marginBlockEnd: 'var(--space-2)' }}>حذف المدينة</h4>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>
          هل تريد حذف <strong>{nameAr}</strong>؟ لا يمكن التراجع.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button className="btn-outline" onClick={onCancel}>إلغاء</button>
          <button onClick={onConfirm} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', blockSize: '38px', paddingInline: 'var(--space-5)', background: '#b91c1c', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>حذف</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CitiesPage() {
  const [items,       setItems]       = useState<City[]>(INITIAL);
  const [search,      setSearch]      = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [modal,       setModal]       = useState<{ mode: 'create' | 'edit'; item?: City } | null>(null);
  const [delItem,     setDelItem]     = useState<City | null>(null);

  const filtered = items.filter(c => {
    const matchSearch  = !search || c.nameAr.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filterCountry || c.countryId === filterCountry;
    return matchSearch && matchCountry;
  });

  function handleSave(data: Omit<City, 'id'>) {
    if (modal?.mode === 'create') {
      setItems(prev => [...prev, { ...data, id: `ct-${Date.now()}` }]);
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
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div className="ofs-table-toolbar">
          <div className="ofs-table-toolbar-search">
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', insetInlineStart: 'var(--space-3)', insetBlockStart: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input className="form-input" style={{ paddingInlineStart: 'calc(var(--space-3) + 16px + var(--space-2))', blockSize: '38px', fontSize: 'var(--font-size-sm)' }} placeholder="بحث في المدن..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="ofs-table-toolbar-filters">
            <OfsSelect
              options={[{ value: '', label: 'كل الدول' }, ...COUNTRIES]}
              value={filterCountry}
              onChange={setFilterCountry}
              placeholder="تصفية بالدولة"
              clearable
            />
          </div>
          <div className="ofs-table-toolbar-end">
            <span className="ofs-table-result-count">{filtered.length} مدينة</span>
            <button className="btn-cta" onClick={() => setModal({ mode: 'create' })}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginInlineEnd: 'var(--space-1)' }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة مدينة
            </button>
          </div>
        </div>

        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th>المدينة</th>
                <th>الاسم بالإنجليزية</th>
                <th>الدولة</th>
                <th style={{ inlineSize: '110px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>لا توجد نتائج مطابقة</td></tr>
              ) : (
                filtered.map(city => (
                  <tr key={city.id}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{city.nameAr}</td>
                    <td dir="ltr" style={{ color: 'var(--color-text-muted)' }}>{city.nameEn}</td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', paddingInline: 'var(--space-2)', paddingBlock: '2px' }}>
                        {COUNTRY_LABEL[city.countryId] ?? city.countryId}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', blockSize: '30px' }} onClick={() => setModal({ mode: 'edit', item: city })}>تعديل</button>
                        <button onClick={() => setDelItem(city)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }} aria-label="حذف">
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
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

      {modal   && <CityModal item={modal.item} onClose={() => setModal(null)} onSave={handleSave} />}
      {delItem && <DeleteModal nameAr={delItem.nameAr} onCancel={() => setDelItem(null)} onConfirm={handleDelete} />}
    </>
  );
}

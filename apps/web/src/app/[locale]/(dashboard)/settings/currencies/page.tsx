'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type CurrencyStatus = 'active' | 'inactive';

interface Currency {
  id:       string;
  code:     string;
  nameAr:   string;
  nameEn:   string;
  symbol:   string;
  status:   CurrencyStatus;
  isSystem: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL: Currency[] = [
  { id: 'cur-1', code: 'SAR', nameAr: 'ريال سعودي',      nameEn: 'Saudi Riyal',       symbol: 'ر.س',  status: 'active',   isSystem: true  },
  { id: 'cur-2', code: 'AED', nameAr: 'درهم إماراتي',    nameEn: 'UAE Dirham',        symbol: 'د.إ',  status: 'active',   isSystem: false },
  { id: 'cur-3', code: 'KWD', nameAr: 'دينار كويتي',     nameEn: 'Kuwaiti Dinar',     symbol: 'د.ك',  status: 'active',   isSystem: false },
  { id: 'cur-4', code: 'QAR', nameAr: 'ريال قطري',       nameEn: 'Qatari Riyal',      symbol: 'ر.ق',  status: 'active',   isSystem: false },
  { id: 'cur-5', code: 'BHD', nameAr: 'دينار بحريني',    nameEn: 'Bahraini Dinar',    symbol: 'د.ب',  status: 'active',   isSystem: false },
  { id: 'cur-6', code: 'OMR', nameAr: 'ريال عُماني',     nameEn: 'Omani Rial',        symbol: 'ر.ع',  status: 'active',   isSystem: false },
  { id: 'cur-7', code: 'USD', nameAr: 'دولار أمريكي',    nameEn: 'US Dollar',         symbol: '$',    status: 'active',   isSystem: false },
  { id: 'cur-8', code: 'EUR', nameAr: 'يورو',             nameEn: 'Euro',              symbol: '€',    status: 'active',   isSystem: false },
  { id: 'cur-9', code: 'GBP', nameAr: 'جنيه إسترليني',   nameEn: 'British Pound',     symbol: '£',    status: 'inactive', isSystem: false },
  { id: 'cur-10',code: 'EGP', nameAr: 'جنيه مصري',       nameEn: 'Egyptian Pound',    symbol: 'ج.م',  status: 'inactive', isSystem: false },
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CurrencyStatus }) {
  const map = {
    active:   { bg: 'rgba(22,163,74,0.1)',  color: '#15803d', label: 'نشطة'    },
    inactive: { bg: 'rgba(100,116,139,0.1)', color: '#475569', label: 'غير نشطة' },
  };
  const s = map[status];
  return (
    <span className="status-badge" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  item?:   Currency;
  onClose: () => void;
  onSave:  (data: Omit<Currency, 'id' | 'isSystem'>) => void;
}

function CurrencyModal({ item, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    code:   item?.code   ?? '',
    nameAr: item?.nameAr ?? '',
    nameEn: item?.nameEn ?? '',
    symbol: item?.symbol ?? '',
    status: (item?.status ?? 'active') as CurrencyStatus,
  });

  const isEdit = Boolean(item);
  function field<K extends keyof typeof form>(key: K, val: typeof form[K]) { setForm(f => ({ ...f, [key]: val })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.nameAr.trim()) return;
    onSave(form);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onClose}>
      <div style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', inlineSize: '100%', maxInlineSize: '500px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{isEdit ? 'تعديل العملة' : 'إضافة عملة'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }} aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
        <form onSubmit={submit}>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">كود ISO *</label>
                <input className="form-input" value={form.code} onChange={e => field('code', e.target.value.toUpperCase())} placeholder="SAR" maxLength={3} dir="ltr" required disabled={isEdit && item?.isSystem} />
              </div>
              <div className="form-group">
                <label className="form-label">الرمز *</label>
                <input className="form-input" value={form.symbol} onChange={e => field('symbol', e.target.value)} placeholder="ر.س" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالعربية *</label>
              <input className="form-input" value={form.nameAr} onChange={e => field('nameAr', e.target.value)} placeholder="مثال: ريال سعودي" required />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم بالإنجليزية</label>
              <input className="form-input" value={form.nameEn} onChange={e => field('nameEn', e.target.value)} placeholder="e.g. Saudi Riyal" dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">الحالة</label>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                {(['active', 'inactive'] as CurrencyStatus[]).map(s => (
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

function DeleteModal({ nameAr, isSystem, onCancel, onConfirm }: { nameAr: string; isSystem: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (isSystem) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onCancel}>
        <div style={{ background: 'var(--glass-bg-strong)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--glass-border)', inlineSize: '100%', maxInlineSize: '380px', padding: 'var(--space-6)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <h4 style={{ margin: 0, marginBlockEnd: 'var(--space-3)', color: 'var(--color-text)' }}>لا يمكن الحذف</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-4)' }}>
            <strong>{nameAr}</strong> هي العملة الأساسية للنظام ولا يمكن حذفها.
          </p>
          <button className="btn-cta" onClick={onCancel}>حسناً</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={onCancel}>
      <div style={{ background: 'var(--glass-bg-strong)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--glass-border)', inlineSize: '100%', maxInlineSize: '400px', padding: 'var(--space-6)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ inlineSize: 48, blockSize: 48, borderRadius: 'var(--radius-full)', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBlockEnd: 'var(--space-4)' }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#b91c1c' }} aria-hidden="true"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        </div>
        <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0, marginBlockEnd: 'var(--space-2)' }}>حذف العملة</h4>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBlockEnd: 'var(--space-5)' }}>هل تريد حذف <strong>{nameAr}</strong>؟</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button className="btn-outline" onClick={onCancel}>إلغاء</button>
          <button onClick={onConfirm} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', blockSize: '38px', paddingInline: 'var(--space-5)', background: '#b91c1c', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>حذف</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CurrenciesPage() {
  const [items,   setItems]   = useState<Currency[]>(INITIAL);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState<{ mode: 'create' | 'edit'; item?: Currency } | null>(null);
  const [delItem, setDelItem] = useState<Currency | null>(null);

  const filtered = items.filter(c =>
    !search ||
    c.nameAr.includes(search) ||
    c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave(data: Omit<Currency, 'id' | 'isSystem'>) {
    if (modal?.mode === 'create') {
      setItems(prev => [...prev, { ...data, id: `cur-${Date.now()}`, isSystem: false }]);
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
              <input className="form-input" style={{ paddingInlineStart: 'calc(var(--space-3) + 16px + var(--space-2))', blockSize: '38px', fontSize: 'var(--font-size-sm)' }} placeholder="بحث في العملات..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="ofs-table-toolbar-end">
            <span className="ofs-table-result-count">{filtered.length} عملة</span>
            <button className="btn-cta" onClick={() => setModal({ mode: 'create' })}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ marginInlineEnd: 'var(--space-1)' }}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
              إضافة عملة
            </button>
          </div>
        </div>

        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: '80px' }}>الكود</th>
                <th>الاسم</th>
                <th style={{ inlineSize: '70px' }}>الرمز</th>
                <th style={{ inlineSize: '100px' }}>الحالة</th>
                <th style={{ inlineSize: '110px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>لا توجد نتائج</td></tr>
              ) : (
                filtered.map(cur => (
                  <tr key={cur.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{cur.code}</span>
                        {cur.isSystem && (
                          <span style={{ fontSize: 10, background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', paddingInline: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' }}>أساسية</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cur.nameAr}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }} dir="ltr">{cur.nameEn}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)' }}>{cur.symbol}</td>
                    <td><StatusBadge status={cur.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', paddingInline: 'var(--space-3)', paddingBlock: 'var(--space-1)', blockSize: '30px' }} onClick={() => setModal({ mode: 'edit', item: cur })}>تعديل</button>
                        {!cur.isSystem && (
                          <button onClick={() => setDelItem(cur)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }} aria-label="حذف">
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

      {modal   && <CurrencyModal item={modal.item} onClose={() => setModal(null)} onSave={handleSave} />}
      {delItem && <DeleteModal nameAr={delItem.nameAr} isSystem={delItem.isSystem} onCancel={() => setDelItem(null)} onConfirm={handleDelete} />}
    </>
  );
}

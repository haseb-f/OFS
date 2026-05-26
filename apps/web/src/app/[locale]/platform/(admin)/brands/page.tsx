'use client';

import { useMemo, useState } from 'react';
import { mockPlatformBrands } from '@/lib/platform-mock-data';
import { fDate, fNum } from '@/lib/format';
import OfsSelect from '@/components/ui/OfsSelect';

export default function BrandsPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [planFilter, setPlan]     = useState('all');

  const filtered = useMemo(() => {
    let data = [...mockPlatformBrands];
    if (statusFilter !== 'all') data = data.filter(b => b.status === statusFilter);
    if (planFilter   !== 'all') data = data.filter(b => b.plan   === planFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(b => b.nameAr.includes(q) || b.code.toLowerCase().includes(q));
    }
    return data;
  }, [search, statusFilter, planFilter]);

  const hasFilters = search || statusFilter !== 'all' || planFilter !== 'all';

  return (
    <div className="ofs-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">إدارة البراندات</h2>
          <p className="page-subtitle">{fNum(mockPlatformBrands.length, 0)} براند مسجّل في المنصة</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          إضافة براند
        </button>
      </div>

      <div className="ofs-card plat-filter-bar">
        <div className="plat-filter-search">
          <input
            type="search"
            className="ofs-input"
            placeholder="بحث باسم البراند أو الكود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="plat-filter-controls">
          <div className="plat-filter-select">
            <OfsSelect
              options={[
                { value: 'all', label: 'كل الحالات' },
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'غير نشط' },
                { value: 'suspended', label: 'موقوف' },
              ]}
              value={statusFilter}
              onChange={setStatus}
              placeholder="الحالة"
            />
          </div>
          <div className="plat-filter-select">
            <OfsSelect
              options={[
                { value: 'all', label: 'كل الخطط' },
                { value: 'starter', label: 'مبتدئ' },
                { value: 'professional', label: 'احترافي' },
                { value: 'enterprise', label: 'مؤسسي' },
              ]}
              value={planFilter}
              onChange={setPlan}
              placeholder="الخطة"
            />
          </div>
          {hasFilters && (
            <button type="button" className="btn-ghost"
              onClick={() => { setSearch(''); setStatus('all'); setPlan('all'); }}>
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th>البراند</th>
                <th>الكود</th>
                <th>الحالة</th>
                <th>الخطة</th>
                <th>انتهاء الاشتراك</th>
                <th style={{ textAlign: 'center' }}>المستخدمون</th>
                <th style={{ textAlign: 'center' }}>الشركات</th>
                <th>تاريخ الإنشاء</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد براندات مطابقة
                  </td>
                </tr>
              ) : filtered.map(brand => (
                <tr key={brand.id}>
                  <td>
                    <div className="plat-entity-cell">
                      <div className="plat-entity-avatar">{brand.nameAr.charAt(0)}</div>
                      <span className="plat-entity-name">{brand.nameAr}</span>
                    </div>
                  </td>
                  <td><span className="plat-code-chip">{brand.code}</span></td>
                  <td>
                    <span className={`status-badge plat-status-${brand.status}`}>
                      {brand.status === 'active' ? 'نشط' : brand.status === 'inactive' ? 'غير نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td>
                    <span className={`plat-badge-plan plat-badge-plan--${brand.plan}`}>
                      {brand.plan === 'enterprise' ? 'مؤسسي' : brand.plan === 'professional' ? 'احترافي' : 'مبتدئ'}
                    </span>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>{fDate(brand.planExpiry, true)}</td>
                  <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>{fNum(brand.usersCount, 0)}</td>
                  <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>{fNum(brand.companiesCount, 0)}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{fDate(brand.createdAt, true)}</td>
                  <td>
                    <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}>تعديل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="plat-table-footer">
            <span className="plat-result-count">{fNum(filtered.length, 0)} نتيجة</span>
          </div>
        )}
      </div>

    </div>
  );
}

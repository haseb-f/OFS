'use client';

import { useMemo, useState } from 'react';
import { mockPlatformCompanies, mockPlatformBrands } from '@/lib/platform-mock-data';
import { fNum } from '@/lib/format';
import OfsSelect from '@/components/ui/OfsSelect';

export default function CompaniesPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [brandFilter, setBrand]   = useState('all');

  // Build brand options from unique brands in companies list
  const brandOptions = useMemo(() => {
    const seen = new Map<string, string>();
    mockPlatformCompanies.forEach(c => seen.set(c.brandId, c.brandNameAr));
    return [
      { value: 'all', label: 'كل البراندات' },
      ...Array.from(seen.entries()).map(([id, name]) => ({ value: id, label: name })),
    ];
  }, []);

  const filtered = useMemo(() => {
    let data = [...mockPlatformCompanies];
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (brandFilter  !== 'all') data = data.filter(c => c.brandId === brandFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.nameAr.includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.brandNameAr.includes(q)
      );
    }
    return data;
  }, [search, statusFilter, brandFilter]);

  const hasFilters = search || statusFilter !== 'all' || brandFilter !== 'all';

  return (
    <div className="ofs-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">إدارة الشركات</h2>
          <p className="page-subtitle">{fNum(mockPlatformCompanies.length, 0)} شركة مسجّلة عبر {fNum(mockPlatformBrands.length, 0)} براندات</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          إضافة شركة
        </button>
      </div>

      <div className="ofs-card plat-filter-bar">
        <div className="plat-filter-search">
          <input
            type="search"
            className="ofs-input"
            placeholder="بحث باسم الشركة أو الكود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="plat-filter-controls">
          <div className="plat-filter-select">
            <OfsSelect
              options={[
                { value: 'all',      label: 'كل الحالات' },
                { value: 'active',   label: 'نشط'        },
                { value: 'inactive', label: 'غير نشط'    },
              ]}
              value={statusFilter}
              onChange={setStatus}
              placeholder="الحالة"
            />
          </div>
          <div className="plat-filter-select" style={{ minInlineSize: 220 }}>
            <OfsSelect
              options={brandOptions}
              value={brandFilter}
              onChange={setBrand}
              placeholder="البراند"
            />
          </div>
          {hasFilters && (
            <button type="button" className="btn-ghost"
              onClick={() => { setSearch(''); setStatus('all'); setBrand('all'); }}>
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
                <th>اسم الشركة</th>
                <th>الكود</th>
                <th>البراند</th>
                <th>الدولة</th>
                <th>العملة</th>
                <th>الحالة</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد شركات مطابقة
                  </td>
                </tr>
              ) : filtered.map(company => (
                <tr key={company.id}>
                  <td>
                    <div className="plat-entity-cell">
                      <div className="plat-entity-avatar">{company.nameAr.charAt(0)}</div>
                      <span className="plat-entity-name">{company.nameAr}</span>
                    </div>
                  </td>
                  <td><span className="plat-code-chip">{company.code}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{company.brandNameAr}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{company.country}</td>
                  <td>
                    <span className="plat-code-chip">{company.currency}</span>
                  </td>
                  <td>
                    <span className={`status-badge plat-status-${company.status}`}>
                      {company.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
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

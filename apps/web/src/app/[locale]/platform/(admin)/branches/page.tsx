'use client';

import { useMemo, useState } from 'react';
import { mockPlatformBranches, mockPlatformCompanies } from '@/lib/platform-mock-data';
import { fNum } from '@/lib/format';
import OfsSelect from '@/components/ui/OfsSelect';

export default function BranchesPage() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [companyFilter, setCompany] = useState('all');

  const companyOptions = useMemo(() => {
    const seen = new Map<string, string>();
    mockPlatformBranches.forEach(b => seen.set(b.companyId, b.companyNameAr));
    return [
      { value: 'all', label: 'كل الشركات' },
      ...Array.from(seen.entries()).map(([id, name]) => ({ value: id, label: name })),
    ];
  }, []);

  const filtered = useMemo(() => {
    let data = [...mockPlatformBranches];
    if (statusFilter  !== 'all') data = data.filter(b => b.status    === statusFilter);
    if (companyFilter !== 'all') data = data.filter(b => b.companyId === companyFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(b =>
        b.nameAr.includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.city.includes(q)
      );
    }
    return data;
  }, [search, statusFilter, companyFilter]);

  const hasFilters = search || statusFilter !== 'all' || companyFilter !== 'all';

  return (
    <div className="ofs-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">إدارة الفروع</h2>
          <p className="page-subtitle">{fNum(mockPlatformBranches.length, 0)} فرع عبر {fNum(mockPlatformCompanies.length, 0)} شركات</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          إضافة فرع
        </button>
      </div>

      <div className="ofs-card plat-filter-bar">
        <div className="plat-filter-search">
          <input
            type="search"
            className="ofs-input"
            placeholder="بحث باسم الفرع أو الكود أو المدينة..."
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
              ]}
              value={statusFilter}
              onChange={setStatus}
              placeholder="الحالة"
            />
          </div>
          <div className="plat-filter-select" style={{ minInlineSize: 220 }}>
            <OfsSelect
              options={companyOptions}
              value={companyFilter}
              onChange={setCompany}
              placeholder="الشركة"
            />
          </div>
          {hasFilters && (
            <button type="button" className="btn-ghost"
              onClick={() => { setSearch(''); setStatus('all'); setCompany('all'); }}>
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
                <th>اسم الفرع</th>
                <th>الكود</th>
                <th>الشركة</th>
                <th>المدينة</th>
                <th>الحالة</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد فروع مطابقة
                  </td>
                </tr>
              ) : filtered.map(branch => (
                <tr key={branch.id}>
                  <td>
                    <div className="plat-entity-cell">
                      <div className="plat-entity-avatar">{branch.nameAr.charAt(0)}</div>
                      <span className="plat-entity-name">{branch.nameAr}</span>
                    </div>
                  </td>
                  <td><span className="plat-code-chip">{branch.code}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{branch.companyNameAr}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{branch.city}</td>
                  <td>
                    <span className={`status-badge plat-status-${branch.status}`}>
                      {branch.status === 'active' ? 'نشط' : 'غير نشط'}
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

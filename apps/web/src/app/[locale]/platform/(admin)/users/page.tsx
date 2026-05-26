'use client';

import { useMemo, useState } from 'react';
import { mockPlatformUsers } from '@/lib/platform-mock-data';
import { fDate, fNum } from '@/lib/format';
import OfsSelect from '@/components/ui/OfsSelect';

export default function UsersPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [roleFilter, setRole]     = useState('all');

  const roleOptions = useMemo(() => {
    const seen = new Map<string, string>();
    mockPlatformUsers.forEach(u => seen.set(u.roleCode, u.roleNameAr));
    return [
      { value: 'all', label: 'كل الأدوار' },
      ...Array.from(seen.entries()).map(([code, name]) => ({ value: code, label: name })),
    ];
  }, []);

  const filtered = useMemo(() => {
    let data = [...mockPlatformUsers];
    if (statusFilter !== 'all') data = data.filter(u => u.status   === statusFilter);
    if (roleFilter   !== 'all') data = data.filter(u => u.roleCode === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        u.nameAr.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.brandNameAr ?? '').includes(q)
      );
    }
    return data;
  }, [search, statusFilter, roleFilter]);

  const hasFilters = search || statusFilter !== 'all' || roleFilter !== 'all';

  return (
    <div className="ofs-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">إدارة المستخدمين</h2>
          <p className="page-subtitle">{fNum(mockPlatformUsers.length, 0)} مستخدم مسجّل في المنصة</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          إضافة مستخدم
        </button>
      </div>

      <div className="ofs-card plat-filter-bar">
        <div className="plat-filter-search">
          <input
            type="search"
            className="ofs-input"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
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
                { value: 'pending',  label: 'معلق'       },
              ]}
              value={statusFilter}
              onChange={setStatus}
              placeholder="الحالة"
            />
          </div>
          <div className="plat-filter-select" style={{ minInlineSize: 200 }}>
            <OfsSelect
              options={roleOptions}
              value={roleFilter}
              onChange={setRole}
              placeholder="الدور"
            />
          </div>
          {hasFilters && (
            <button type="button" className="btn-ghost"
              onClick={() => { setSearch(''); setStatus('all'); setRole('all'); }}>
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
                <th>المستخدم</th>
                <th>الدور</th>
                <th>البراند</th>
                <th>الشركة</th>
                <th>الفرع</th>
                <th>آخر دخول</th>
                <th>الحالة</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا يوجد مستخدمون مطابقون
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="plat-entity-cell">
                      <div className="plat-entity-avatar">{user.nameAr.charAt(0)}</div>
                      <div>
                        <div className="plat-entity-name">{user.nameAr}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>{user.roleNameAr}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{user.brandNameAr ?? '—'}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{user.companyNameAr ?? '—'}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{user.branchNameAr ?? '—'}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {fDate(user.lastLoginAt, true)}
                  </td>
                  <td>
                    <span className={`status-badge plat-status-${user.status}`}>
                      {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'معلق' : 'غير نشط'}
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

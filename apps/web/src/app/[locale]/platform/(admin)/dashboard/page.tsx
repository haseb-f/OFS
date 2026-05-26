'use client';

import { platformKpis, mockPlatformBrands, mockPlatformUsers } from '@/lib/platform-mock-data';
import { fDate } from '@/lib/format';

export default function PlatformDashboardPage() {
  const recentBrands = mockPlatformBrands.slice(0, 4);
  const recentUsers  = mockPlatformUsers.slice(0, 5);

  return (
    <div className="ofs-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">لوحة تحكم المنصة</h2>
          <p className="page-subtitle">نظرة شاملة على جميع البراندات والمستخدمين</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          براند جديد
        </button>
      </div>

      {/* KPI Row 1 */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-4)' }}>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="kpi-card-value">{platformKpis.totalBrands}</div>
          <div className="kpi-card-label">إجمالي البراندات</div>
        </div>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: 'var(--color-status-active)' }}>{platformKpis.activeBrands}</div>
          <div className="kpi-card-label">براندات نشطة</div>
        </div>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--inactive">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: 'var(--color-text-muted)' }}>{platformKpis.inactiveBrands}</div>
          <div className="kpi-card-label">براندات غير نشطة</div>
        </div>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--companies">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: '#3b82f6' }}>{platformKpis.totalCompanies}</div>
          <div className="kpi-card-label">إجمالي الشركات</div>
        </div>

      </div>

      {/* KPI Row 2 */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBlockEnd: 'var(--space-6)' }}>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--branches">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: '#8b5cf6' }}>{platformKpis.totalBranches}</div>
          <div className="kpi-card-label">إجمالي الفروع</div>
        </div>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--users">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ color: '#f59e0b' }}>{platformKpis.totalUsers}</div>
          <div className="kpi-card-label">إجمالي المستخدمين</div>
        </div>

        <div className="kpi-card plat-kpi-card">
          <div className="plat-kpi-icon plat-kpi-icon--activity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="kpi-card-value" style={{ fontSize: '1.05rem', letterSpacing: '0' }}>{fDate(platformKpis.lastActivity, true)}</div>
          <div className="kpi-card-label">آخر نشاط</div>
        </div>

      </div>

      {/* Two-column: Recent Brands + Recent Users */}
      <div className="plat-dash-grid">

        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="plat-section-header">
            <h3 className="plat-section-title">أحدث البراندات</h3>
            <a href="brands" className="plat-section-link">عرض الكل</a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>البراند</th>
                  <th>الكود</th>
                  <th>الخطة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentBrands.map(brand => (
                  <tr key={brand.id}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{brand.nameAr}</td>
                    <td><span className="plat-code-chip">{brand.code}</span></td>
                    <td>
                      <span className={`plat-badge-plan plat-badge-plan--${brand.plan}`}>
                        {brand.plan === 'enterprise' ? 'مؤسسي' : brand.plan === 'professional' ? 'احترافي' : 'مبتدئ'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge plat-status-${brand.status}`}>
                        {brand.status === 'active' ? 'نشط' : brand.status === 'inactive' ? 'غير نشط' : 'موقوف'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div className="plat-section-header">
            <h3 className="plat-section-title">أحدث المستخدمين</h3>
            <a href="users" className="plat-section-link">عرض الكل</a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ofs-table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>الدور</th>
                  <th>آخر دخول</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{user.nameAr}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>{user.email}</div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>{user.roleNameAr}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {fDate(user.lastLoginAt, true)}
                    </td>
                    <td>
                      <span className={`status-badge plat-status-${user.status}`}>
                        {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'معلق' : 'غير نشط'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

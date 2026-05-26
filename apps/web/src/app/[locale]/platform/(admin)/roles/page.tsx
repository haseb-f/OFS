'use client';

import { useState } from 'react';
import { mockPlatformRoles, defaultPermissionModules, type PlatformRole, type PermissionModule, type RoleScope } from '@/lib/platform-mock-data';
import { fNum } from '@/lib/format';

const SCOPE_LABELS: Record<RoleScope, string> = {
  platform: 'منصة',
  brand:    'براند',
  company:  'شركة',
  branch:   'فرع',
};

const PERM_LABELS: Record<keyof PermissionModule['permissions'], string> = {
  view:    'عرض',
  create:  'إضافة',
  edit:    'تعديل',
  delete:  'حذف',
  approve: 'اعتماد',
  export:  'تصدير',
};

const PERM_KEYS = ['view', 'create', 'edit', 'delete', 'approve', 'export'] as const;
type PermKey = typeof PERM_KEYS[number];

// ── Permission checkbox ──────────────────────────────────────────────────────

function PermCheck({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`plat-perm-check${checked ? ' checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="2 6 5 9 10 3"/>
        </svg>
      )}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<PlatformRole>(mockPlatformRoles[0]);
  const [modules, setModules] = useState<PermissionModule[]>(defaultPermissionModules);

  function togglePerm(moduleId: string, permKey: PermKey) {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId
          ? { ...m, permissions: { ...m.permissions, [permKey]: !m.permissions[permKey] } }
          : m
      )
    );
  }

  function toggleAll(permKey: PermKey, value: boolean) {
    setModules(prev =>
      prev.map(m => ({ ...m, permissions: { ...m.permissions, [permKey]: value } }))
    );
  }

  const allChecked = (key: PermKey) => modules.every(m => m.permissions[key]);

  return (
    <div className="ofs-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">الأدوار والصلاحيات</h2>
          <p className="page-subtitle">{fNum(mockPlatformRoles.length, 0)} دور — اختر دوراً لعرض وتعديل صلاحياته</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          دور جديد
        </button>
      </div>

      {/* Roles grid */}
      <div className="plat-role-grid" style={{ marginBlockEnd: 'var(--space-6)' }}>
        {mockPlatformRoles.map(role => (
          <button
            key={role.id}
            type="button"
            className={`plat-role-card${selectedRole.id === role.id ? ' selected' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            <div className="plat-role-card-header">
              <span className="plat-role-name">{role.nameAr}</span>
              <span className={`plat-scope-badge plat-scope-badge--${role.scope}`}>
                {SCOPE_LABELS[role.scope]}
              </span>
            </div>
            <span className="plat-role-code">{role.code}</span>
            <p className="plat-role-desc">{role.descriptionAr}</p>
            <div className="plat-role-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <span>{fNum(role.usersCount, 0)} مستخدم</span>
            </div>
          </button>
        ))}
      </div>

      {/* Permissions matrix */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>

        <div className="plat-perm-header">
          <div>
            <h3 className="plat-perm-title">
              صلاحيات: {selectedRole.nameAr}
            </h3>
            <p className="plat-perm-subtitle">
              <span className={`plat-scope-badge plat-scope-badge--${selectedRole.scope}`} style={{ fontSize: '0.65rem' }}>
                {SCOPE_LABELS[selectedRole.scope]}
              </span>
              {' '}— {selectedRole.descriptionAr}
            </p>
          </div>
          <button type="button" className="btn-cta" style={{ fontSize: 'var(--font-size-xs)', padding: '8px 16px' }}>
            حفظ التغييرات
          </button>
        </div>

        <div className="plat-perm-wrap">
          <table className="plat-perm-table">
            <thead>
              <tr>
                <th>الوحدة</th>
                {PERM_KEYS.map(key => (
                  <th key={key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <span>{PERM_LABELS[key]}</span>
                      <PermCheck
                        checked={allChecked(key)}
                        onChange={v => toggleAll(key, v)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.id}>
                  <td className="plat-perm-module-label">{mod.nameAr}</td>
                  {PERM_KEYS.map(key => (
                    <td key={key} className="plat-perm-cell">
                      <PermCheck
                        checked={mod.permissions[key]}
                        onChange={() => togglePerm(mod.id, key)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

'use client';

import type { QuickAction } from '@/lib/mock-data';

interface QuickActionsProps {
  actions: QuickAction[];
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'add-lead': (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
    </svg>
  ),
  'new-order': (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  ),
  'add-customer': (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  'generate-report': (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
};

const QUICK_LINKS = [
  { labelAr: 'تقرير المبيعات الشهري', icon: '📊' },
  { labelAr: 'المدفوعات المعلّقة', icon: '⏳' },
  { labelAr: 'المخزون المنخفض', icon: '⚠️' },
];

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
      <h2
        className="ofs-card-title"
        style={{
          marginBlockEnd: 'var(--space-4)',
          paddingBlockEnd: 'var(--space-3)',
          borderBlockEnd: '1px solid var(--color-border-subtle)',
        }}
      >
        إجراءات سريعة
      </h2>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="quick-action-btn"
            aria-label={action.labelAr}
          >
            <div
              className="quick-action-icon"
              style={{ backgroundColor: action.iconBg, color: action.iconColor }}
              aria-hidden="true"
            >
              {ACTION_ICONS[action.id]}
            </div>
            <span>{action.labelAr}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          marginBlockStart: 'var(--space-4)',
          paddingBlockStart: 'var(--space-4)',
          borderBlockStart: '1px solid var(--color-border-subtle)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-subtle)',
            marginBlockEnd: 'var(--space-2)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          روابط سريعة
        </div>
        {QUICK_LINKS.map((link) => (
          <button key={link.labelAr} className="quick-link-btn">
            <span aria-hidden="true">{link.icon}</span>
            <span>{link.labelAr}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

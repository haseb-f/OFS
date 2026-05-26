'use client';

import { useState } from 'react';

interface SourceConfig {
  id: string;
  name: string;
  sheetUrl: string;
  sheetName?: string;
  companyName: string;
  branchName: string;
  currency: string;
  status: 'connected' | 'disconnected' | 'error';
  lastRefreshed?: string;
  totalRows?: number;
}

interface ImportSourceConfigCardProps {
  config: SourceConfig | null;
  onRefresh: () => void;
  refreshing: boolean;
  onConfigure: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  connected:    { bg: '#dcfce7', color: '#16a34a', label: 'متصل' },
  disconnected: { bg: '#f3f4f6', color: '#6b7280', label: 'غير متصل' },
  error:        { bg: '#fee2e2', color: '#b91c1c', label: 'خطأ في الاتصال' },
};

export default function ImportSourceConfigCard({ config, onRefresh, refreshing, onConfigure }: ImportSourceConfigCardProps) {
  const [showUrl, setShowUrl] = useState(false);

  if (!config) {
    return (
      <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="ofs-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>لا يوجد مصدر بيانات مرتبط</p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>اربط جدول Google Sheets لبدء الاستيراد</p>
          </div>
          <button className="btn-cta" onClick={onConfigure} style={{ marginBlockStart: 'var(--space-1)' }}>
            ربط مصدر بيانات
          </button>
        </div>
      </div>
    );
  }

  const st = STATUS_STYLES[config.status] ?? STATUS_STYLES.error;

  return (
    <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', borderBlockEnd: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{config.name}</p>
            {config.sheetName && (
              <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                ورقة: <span style={{ fontFamily: 'monospace' }}>{config.sheetName}</span>
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: st?.bg, color: st?.color, fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap' }}>
            {st?.label}
          </span>
          <button
            className="btn-ghost"
            onClick={onConfigure}
            style={{ padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center' }}
            title="إعدادات المصدر"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0M20 12h1M3 12H2M12 20v1M12 3V2"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: 'var(--space-3) var(--space-5)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', borderBlockEnd: '1px solid var(--color-border)' }}>
        {[
          { label: config.companyName },
          { label: config.branchName },
          { label: config.currency },
        ].map((chip, i) => (
          <span key={i} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', color: 'var(--color-text-muted)' }}>
            {chip.label}
          </span>
        ))}
        {config.totalRows !== undefined && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 'auto' }}>
            {config.totalRows} صف
          </span>
        )}
      </div>

      <div style={{ padding: 'var(--space-3) var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {config.lastRefreshed && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              آخر تحديث: {config.lastRefreshed}
            </span>
          )}
          <button
            onClick={() => setShowUrl(v => !v)}
            style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline dotted' }}
          >
            {showUrl ? 'إخفاء الرابط' : 'عرض الرابط'}
          </button>
          {showUrl && (
            <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: 'var(--color-text-muted)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {config.sheetUrl}
            </span>
          )}
        </div>
        <button
          className="btn-cta"
          onClick={onRefresh}
          disabled={refreshing || config.status !== 'connected'}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 120, justifyContent: 'center' }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
          >
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {refreshing ? 'جارٍ التحديث...' : 'تحديث البيانات'}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

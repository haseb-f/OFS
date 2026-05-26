'use client';

import { useState, useRef } from 'react';
import OfsSelect from '@/components/ui/OfsSelect';

// ── Options ───────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Riyadh',    label: 'الرياض (UTC+3)',          meta: 'Asia/Riyadh' },
  { value: 'Asia/Dubai',     label: 'دبي / أبوظبي (UTC+4)',    meta: 'Asia/Dubai' },
  { value: 'Asia/Kuwait',    label: 'الكويت (UTC+3)',          meta: 'Asia/Kuwait' },
  { value: 'Asia/Qatar',     label: 'قطر (UTC+3)',             meta: 'Asia/Qatar' },
  { value: 'Asia/Bahrain',   label: 'البحرين (UTC+3)',         meta: 'Asia/Bahrain' },
  { value: 'Africa/Cairo',   label: 'القاهرة (UTC+2/3)',       meta: 'Africa/Cairo' },
  { value: 'Asia/Amman',     label: 'عمّان (UTC+2/3)',         meta: 'Asia/Amman' },
  { value: 'Asia/Baghdad',   label: 'بغداد (UTC+3)',           meta: 'Asia/Baghdad' },
  { value: 'Europe/London',  label: 'لندن (UTC+0/1)',          meta: 'Europe/London' },
  { value: 'America/New_York', label: 'نيويورك (UTC-5/-4)',    meta: 'America/New_York' },
];

const CURRENCY_POSITION_OPTIONS = [
  { value: 'before', label: 'قبل المبلغ  ―  ر.س 1,250.00' },
  { value: 'after',  label: 'بعد المبلغ  ―  1,250.00 ر.س' },
];

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-4)' }}>
      <div className="ofs-card-header">
        <h3 className="ofs-card-title">{title}</h3>
      </div>
      <div style={{ padding: 'var(--space-5)' }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 'var(--space-6)',
        alignItems: 'center',
        paddingBlock: 'var(--space-4)',
        borderBlockEnd: last ? 'none' : '1px solid var(--color-border-subtle)',
      }}
    >
      <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
        {label}
      </label>
      <div style={{ maxInlineSize: '400px' }}>{children}</div>
    </div>
  );
}

// ── Logo upload area ──────────────────────────────────────────────────────────

function LogoUpload() {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
      {/* Preview box */}
      <div
        style={{
          inlineSize: '80px',
          blockSize: '80px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-raised)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {preview ? (
          <img src={preview} alt="شعار الشركة" style={{ inlineSize: '100%', blockSize: '100%', objectFit: 'contain' }} />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-text-subtle)' }} aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          flex: 1,
          maxInlineSize: '280px',
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'var(--color-primary-subtle)' : 'var(--color-surface-raised)',
          transition: 'all var(--transition-fast)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', marginInline: 'auto', display: 'block', marginBlockEnd: 'var(--space-2)' }} aria-hidden="true">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
        </svg>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlock: 0 }}>
          اسحب الملف هنا أو <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>تصفّح</span>
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginBlockStart: 'var(--space-1)', marginBlockEnd: 0 }}>
          PNG, SVG, JPG — الحجم الأقصى 2 MB
        </p>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {preview && (
        <button
          onClick={() => setPreview(null)}
          className="btn-ghost"
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: 'var(--space-2) var(--space-3)' }}
        >
          إزالة
        </button>
      )}
    </div>
  );
}

// ── Locked badge ──────────────────────────────────────────────────────────────

function LockedBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        color: '#b45309',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 'var(--radius-full)',
        paddingInline: 'var(--space-2)',
        paddingBlock: '2px',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
      </svg>
      مثبّت عالمياً
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GeneralSettingsPage() {
  const [language,         setLanguage]         = useState('ar');
  const [timezone,         setTimezone]         = useState('Asia/Riyadh');
  const [currencyPosition, setCurrencyPosition] = useState('after');
  const [saved,            setSaved]            = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      {/* Company Logo */}
      <Section title="شعار الشركة">
        <LogoUpload />
      </Section>

      {/* Display & Language */}
      <Section title="اللغة والمنطقة الزمنية">
        <SettingRow label="لغة النظام">
          <OfsSelect
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={setLanguage}
            placeholder="اختر اللغة"
          />
        </SettingRow>

        <SettingRow label="المنطقة الزمنية" last>
          <OfsSelect
            options={TIMEZONE_OPTIONS}
            value={timezone}
            onChange={setTimezone}
            placeholder="اختر المنطقة الزمنية"
            searchPlaceholder="ابحث في المناطق..."
          />
        </SettingRow>
      </Section>

      {/* Date Format — locked */}
      <Section title="تنسيق التاريخ">
        <SettingRow label="صيغة التاريخ">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: 'var(--font-size-sm)',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                paddingInline: 'var(--space-3)',
                paddingBlock: 'var(--space-2)',
                color: 'var(--color-text)',
                letterSpacing: '0.05em',
              }}
            >
              DD MMM YYYY
            </code>
            <LockedBadge />
          </div>
          <div style={{ marginBlockStart: 'var(--space-3)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {['24 May 2026', '01 Jan 2027', '31 Dec 2025'].map((ex) => (
              <span key={ex} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-sm)', paddingInline: 'var(--space-2)', paddingBlock: '2px', border: '1px solid var(--color-border-subtle)' }}>
                {ex}
              </span>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Number Format — locked */}
      <Section title="تنسيق الأرقام">
        <SettingRow label="صيغة الأرقام">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
              أرقام إنجليزية (Latin) فقط
            </span>
            <LockedBadge />
          </div>
          <div style={{ marginBlockStart: 'var(--space-3)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {['1,250', '12,500', '127,450.50'].map((ex) => (
              <span
                key={ex}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-sm)',
                  paddingInline: 'var(--space-3)',
                  paddingBlock: 'var(--space-1)',
                  border: '1px solid var(--color-border-subtle)',
                  fontFamily: 'monospace',
                }}
              >
                {ex}
              </span>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Currency Format */}
      <Section title="تنسيق العملة">
        <SettingRow label="موضع رمز العملة" last>
          <OfsSelect
            options={CURRENCY_POSITION_OPTIONS}
            value={currencyPosition}
            onChange={setCurrencyPosition}
            placeholder="اختر الموضع"
          />
        </SettingRow>
      </Section>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginBlockStart: 'var(--space-2)' }}>
        {saved && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            تم الحفظ
          </span>
        )}
        <button className="btn-cta" onClick={handleSave}>
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

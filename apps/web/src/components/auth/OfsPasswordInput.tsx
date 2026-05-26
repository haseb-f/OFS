'use client';

import { useState } from 'react';

function EyeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

interface OfsPasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Adds error styling to the input */
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  /**
   * Base CSS class applied to the <input> element.
   * Defaults to 'form-input'. Use 'ofs-input' for platform pages.
   */
  inputClassName?: string;
}

/**
 * Password input with show/hide toggle. The icon lives in its own 40×40 px
 * slot on the physical-right of the input (always, regardless of page dir)
 * and the input reserves 48 px of right-side padding so text can never
 * travel beneath the icon.
 */
export function OfsPasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  error = false,
  disabled = false,
  required = false,
  autoComplete = 'current-password',
  minLength,
  inputClassName = 'form-input',
}: OfsPasswordInputProps) {
  const [showPass, setShowPass] = useState(false);

  const errorClass = error ? ` ${inputClassName}--error` : '';

  return (
    <div className="ofs-pw-wrap">
      <input
        id={id}
        type={showPass ? 'text' : 'password'}
        className={`${inputClassName}${errorClass} ofs-pw-input`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        minLength={minLength}
        dir="ltr"
      />
      <button
        type="button"
        className="ofs-pw-toggle"
        onClick={() => setShowPass((v) => !v)}
        aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        tabIndex={-1}
      >
        {showPass ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

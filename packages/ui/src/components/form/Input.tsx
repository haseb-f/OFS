import type { CSSProperties, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  id: string;
}

export function Input({ error, label, id, style: externalStyle, ...props }: InputProps) {
  const inputStyle: CSSProperties = {
    display: 'block',
    inlineSize: '100%',
    paddingBlock: 'var(--space-2)',
    paddingInline: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error ? 'var(--color-status-rejected)' : 'var(--color-border)'}`,
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family-base)',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    textAlign: 'start',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
    ...externalStyle,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={inputStyle}
        {...props}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-status-rejected)' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

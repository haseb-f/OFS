'use client';

import { useRef, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'بحث...',
  disabled = false,
  id,
  className = '',
  autoFocus = false,
  onKeyDown,
}: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`ofs-search-wrap${focused ? ' ofs-search-focused' : ''}${className ? ' ' + className : ''}`}>

      {/* Search icon — inline-start (right in RTL) */}
      <span className="ofs-search-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
        </svg>
      </span>

      <input
        ref={inputRef}
        type="search"
        id={id}
        className="ofs-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        onFocus={() => { setFocused(true); }}
        onBlur={() => { setFocused(false); }}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        dir="auto"
      />

      {/* Clear — inline-end (left in RTL), only when there is text */}
      {value && (
        <button
          type="button"
          className="ofs-search-clear"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          tabIndex={-1}
          aria-label="مسح البحث"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

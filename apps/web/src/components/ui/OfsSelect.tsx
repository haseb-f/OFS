'use client';

import { useState, useRef, useEffect, useId, type KeyboardEvent } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OfsSelectOption {
  value: string;
  label: string;
  group?: string;
  meta?: string;
  disabled?: boolean;
}

export interface OfsSelectGroup {
  key: string;
  label: string;
}

interface OfsSelectProps {
  options: OfsSelectOption[];
  groups?: OfsSelectGroup[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OfsSelect({
  options,
  groups,
  value,
  onChange,
  placeholder = 'اختر...',
  searchPlaceholder = 'بحث...',
  clearable = false,
  disabled = false,
  loading = false,
  id,
  className = '',
  size = 'md',
  'aria-label': ariaLabel,
}: OfsSelectProps) {
  const uid        = useId();
  const inputId    = id ?? uid;
  const listId     = `${uid}-list`;

  const [open, setOpen]             = useState(false);
  const [closing, setClosing]       = useState(false);
  const [search, setSearch]         = useState('');
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const wrapRef    = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = search.trim()
    ? options.filter(o => !o.disabled && (
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.meta?.toLowerCase().includes(search.toLowerCase())
      ))
    : options.filter(o => !o.disabled || o.value === value);

  // Build flat list of selectable options for keyboard navigation
  const selectableOptions = filtered.filter(o => !o.disabled);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onOutside);
    return () => { document.removeEventListener('mousedown', onOutside); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => { searchRef.current?.focus(); }, 30);
    return () => { clearTimeout(t); };
  }, [open]);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setSearch('');
      setFocusedIdx(-1);
    }, 130);
  }

  function handleTrigger() {
    if (disabled || loading) return;
    if (open) { close(); } else { setOpen(true); }
  }

  function pick(val: string) {
    onChange(val);
    close();
    triggerRef.current?.focus();
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    triggerRef.current?.focus();
  }

  function handleSearchKey(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx(i => Math.min(i + 1, selectableOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIdx >= 0 && selectableOptions[focusedIdx]) {
          pick(selectableOptions[focusedIdx].value);
        }
        break;
      case 'Escape':
        close();
        triggerRef.current?.focus();
        break;
    }
  }

  // Group the filtered options
  const renderOptions = () => {
    if (groups && groups.length > 0) {
      return groups.map(grp => {
        const grpOptions = filtered.filter(o => o.group === grp.key);
        if (grpOptions.length === 0) return null;
        return (
          <div key={grp.key} role="group" aria-label={grp.label}>
            <div className="ofs-select-group-label">{grp.label}</div>
            {grpOptions.map(opt => renderOption(opt))}
          </div>
        );
      });
    }
    return filtered.map(opt => renderOption(opt));
  };

  function renderOption(opt: OfsSelectOption) {
    const flatIdx = selectableOptions.findIndex(o => o.value === opt.value);
    const isSelected = opt.value === value;
    const isFocused  = flatIdx === focusedIdx;
    const isDisabled = opt.disabled;

    return (
      <div
        key={opt.value}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        className={[
          'ofs-select-option',
          isSelected  ? 'selected' : '',
          isFocused   ? 'focused'  : '',
          isDisabled  ? 'disabled' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => { if (!isDisabled) { pick(opt.value); } }}
        onMouseEnter={() => { if (!isDisabled) { setFocusedIdx(flatIdx); } }}
      >
        <span className="ofs-select-option-label">{opt.label}</span>
        {opt.meta && <span className="ofs-select-option-meta">{opt.meta}</span>}
        {isSelected && (
          <svg className="ofs-select-option-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="2 8 6 12 14 4"/>
          </svg>
        )}
      </div>
    );
  }

  const sizeClass = size === 'sm' ? 'ofs-select-wrap--sm' : '';

  return (
    <div ref={wrapRef} className={`ofs-select-wrap ${sizeClass} ${className}`.trim()}>

      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        id={inputId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        className="ofs-select-trigger"
        onClick={handleTrigger}
        disabled={disabled}
      >
        {loading ? (
          <span className="ofs-select-loading-dots" aria-label="جارٍ التحميل">
            <span/><span/><span/>
          </span>
        ) : (
          <span className={`ofs-select-value${!selected ? ' ofs-select-placeholder' : ''}`}>
            {selected ? selected.label : placeholder}
          </span>
        )}

        {clearable && value && !loading && (
          <button
            type="button"
            className="ofs-select-clear"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="مسح الاختيار"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        <svg className="ofs-select-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {(open || closing) && (
        <div
          id={listId}
          className={`ofs-select-dropdown${closing ? ' closing' : ''}`}
          role="listbox"
        >

          {/* Sticky search */}
          <div className="ofs-select-search-wrap">
            <span className="ofs-select-search-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
            </span>
            <input
              ref={searchRef}
              type="text"
              className="ofs-select-search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setFocusedIdx(-1); }}
              onKeyDown={handleSearchKey}
              aria-autocomplete="list"
              aria-controls={listId}
              autoComplete="off"
            />
          </div>

          {/* Options */}
          <div className="ofs-select-options" role="presentation">
            {clearable && value && (
              <div
                role="option"
                aria-selected={false}
                className="ofs-select-option ofs-select-option-all"
                onClick={() => { pick(''); }}
              >
                <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>— {placeholder}</span>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="ofs-select-option-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ opacity: 0.35, marginInline: 'auto' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span>لا توجد نتائج</span>
              </div>
            ) : (
              renderOptions()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useId, type KeyboardEvent } from 'react';
import { fDate, fMonthYear, parseISODate, toISODate } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OfsDatePickerProps {
  value: string;                 // ISO "2026-05-24" or ""
  onChange: (iso: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;                  // ISO min date
  max?: string;                  // ISO max date
  id?: string;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OfsDatePicker({
  value,
  onChange,
  placeholder = 'اختر تاريخاً...',
  disabled = false,
  min,
  max,
  id,
  className = '',
  size = 'md',
  'aria-label': ariaLabel,
}: OfsDatePickerProps) {
  const uid        = useId();
  const panelId    = `${uid}-panel`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);

  const today        = new Date();
  const selected     = value ? parseISODate(value) : null;
  const minDate      = min ? parseISODate(min) : null;
  const maxDate      = max ? parseISODate(max) : null;

  const [open, setOpen]     = useState(false);
  const [closing, setClosing] = useState(false);
  const [viewYear, setVY]   = useState(selected?.getFullYear()  ?? today.getFullYear());
  const [viewMonth, setVM]  = useState(selected?.getMonth()     ?? today.getMonth());
  const [focused, setFocused] = useState<Date | null>(selected ?? today);

  // Sync view when value changes externally
  useEffect(() => {
    if (selected) { setVY(selected.getFullYear()); setVM(selected.getMonth()); }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) closePanel();
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  function closePanel() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 130);
  }

  function toggleOpen() {
    if (disabled) return;
    if (open) {
      closePanel();
    } else {
      const base = selected ?? today;
      setVY(base.getFullYear());
      setVM(base.getMonth());
      setFocused(base);
      setOpen(true);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setVY(y => y - 1); setVM(11); }
    else setVM(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setVY(y => y + 1); setVM(0); }
    else setVM(m => m + 1);
  }

  function pickDay(d: Date) {
    if (isDisabledDay(d)) return;
    onChange(toISODate(d));
    closePanel();
    triggerRef.current?.focus();
  }

  function isDisabledDay(d: Date) {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  function handlePanelKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!focused) return;
    const next = new Date(focused);
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); next.setDate(next.getDate() - 1); break;  // RTL: right = back
      case 'ArrowLeft':  e.preventDefault(); next.setDate(next.getDate() + 1); break;  // RTL: left = forward
      case 'ArrowUp':    e.preventDefault(); next.setDate(next.getDate() - 7); break;
      case 'ArrowDown':  e.preventDefault(); next.setDate(next.getDate() + 7); break;
      case 'Enter': case ' ':
        e.preventDefault();
        if (!isDisabledDay(focused)) pickDay(focused);
        return;
      case 'Escape':
        closePanel();
        triggerRef.current?.focus();
        return;
      case 'PageUp':
        e.preventDefault();
        next.setMonth(next.getMonth() - 1);
        break;
      case 'PageDown':
        e.preventDefault();
        next.setMonth(next.getMonth() + 1);
        break;
      default: return;
    }
    setFocused(next);
    setVY(next.getFullYear());
    setVM(next.getMonth());
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDayOfWeek(viewYear, viewMonth);
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const displayValue = selected ? fDate(selected) : '';
  const sizeClass = size === 'sm' ? 'ofs-datepicker-wrap--sm' : '';

  return (
    <div ref={wrapRef} className={`ofs-datepicker-wrap ${sizeClass} ${className}`.trim()}>

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={id ?? uid}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="ofs-datepicker-trigger"
        onClick={toggleOpen}
        disabled={disabled}
      >
        <svg className="ofs-datepicker-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="16" height="14" rx="2"/><path d="M2 8h16M7 2v4M13 2v4"/>
        </svg>
        <span className={displayValue ? 'ofs-datepicker-value' : 'ofs-datepicker-placeholder'}>
          {displayValue || placeholder}
        </span>
        {displayValue && (
          <button
            type="button"
            className="ofs-datepicker-clear"
            onClick={e => { e.stopPropagation(); onChange(''); triggerRef.current?.focus(); }}
            tabIndex={-1}
            aria-label="مسح التاريخ"
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

      {/* Calendar panel */}
      {(open || closing) && (
        <div
          id={panelId}
          className={`ofs-datepicker-panel${closing ? ' closing' : ''}`}
          role="dialog"
          aria-label="اختيار التاريخ"
          onKeyDown={handlePanelKey}
          tabIndex={-1}
        >
          {/* Month navigation */}
          <div className="ofs-datepicker-nav">
            <button type="button" className="ofs-datepicker-nav-btn" onClick={nextMonth} aria-label="الشهر التالي">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="10 3 5 8 10 13"/>
              </svg>
            </button>
            <span className="ofs-datepicker-month-label">{fMonthYear(new Date(viewYear, viewMonth))}</span>
            <button type="button" className="ofs-datepicker-nav-btn" onClick={prevMonth} aria-label="الشهر السابق">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 3 11 8 6 13"/>
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="ofs-datepicker-grid" role="grid">
            {DAYS_EN.map(d => (
              <div key={d} className="ofs-datepicker-weekday" role="columnheader" aria-label={d}>{d}</div>
            ))}

            {/* Day cells */}
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} className="ofs-datepicker-cell ofs-datepicker-cell--empty" aria-hidden="true"/>;
              const isToday    = isSameDay(cell, today);
              const isSelected = selected ? isSameDay(cell, selected) : false;
              const isFocused  = focused  ? isSameDay(cell, focused)  : false;
              const isDis      = isDisabledDay(cell);
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isDis}
                  tabIndex={isFocused ? 0 : -1}
                  className={[
                    'ofs-datepicker-cell',
                    isToday    ? 'today'    : '',
                    isSelected ? 'selected' : '',
                    isFocused  ? 'focused'  : '',
                    isDis      ? 'disabled' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => pickDay(cell)}
                  onMouseEnter={() => setFocused(cell)}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="ofs-datepicker-footer">
            <button
              type="button"
              className="ofs-datepicker-today-btn"
              onClick={() => pickDay(today)}
              disabled={isDisabledDay(today)}
            >
              اليوم — {fDate(today, true)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

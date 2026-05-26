'use client';

import { useState, useRef, useEffect, useId, type KeyboardEvent } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountNode {
  id: string;
  code: string;
  name: string;
  level?: number;
  selectable?: boolean;   // default true — set false for header accounts
  children?: AccountNode[];
}

interface OfsAccountSelectProps {
  accounts: AccountNode[];
  value: string;            // selected account id
  onChange: (id: string, account: AccountNode) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function findById(nodes: AccountNode[], id: string): AccountNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findById(n.children, id);
      if (f) return f;
    }
  }
  return undefined;
}

function matchesSearch(node: AccountNode, q: string): boolean {
  const lq = q.toLowerCase();
  return node.code.toLowerCase().includes(lq) || node.name.toLowerCase().includes(lq);
}

function filterTree(nodes: AccountNode[], q: string): AccountNode[] {
  const result: AccountNode[] = [];
  for (const n of nodes) {
    const childMatches = n.children ? filterTree(n.children, q) : [];
    const selfMatches  = matchesSearch(n, q);
    if (selfMatches || childMatches.length > 0) {
      const node: AccountNode = { ...n };
      if (childMatches.length > 0) node.children = childMatches;
      result.push(node);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OfsAccountSelect({
  accounts,
  value,
  onChange,
  placeholder = 'اختر حساباً...',
  disabled = false,
  id,
  className = '',
  size = 'md',
  'aria-label': ariaLabel,
}: OfsAccountSelectProps) {
  const uid        = useId();
  const listId     = `${uid}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  const [open, setOpen]         = useState(false);
  const [closing, setClosing]   = useState(false);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const selected = value ? findById(accounts, value) : undefined;

  const displayAccounts = search.trim()
    ? filterTree(accounts, search)
    : accounts;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setSearch('');
    }, 130);
  }

  function pick(node: AccountNode) {
    if (node.selectable === false) return;
    onChange(node.id, node);
    close();
    triggerRef.current?.focus();
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function handleSearchKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { close(); triggerRef.current?.focus(); }
  }

  function renderNodes(nodes: AccountNode[], level = 0): React.ReactNode[] {
    return nodes.flatMap(node => {
      const hasChildren  = node.children && node.children.length > 0;
      const isExpanded   = expanded.has(node.id) || search.trim().length > 0;
      const isSelected   = node.id === value;
      const isSelectable = node.selectable !== false;

      const row = (
        <div
          key={node.id}
          className={[
            'ofs-account-select-row',
            `ofs-account-select-row--l${Math.min(level, 4)}`,
            isSelected   ? 'selected'    : '',
            !isSelectable ? 'group-header' : '',
          ].filter(Boolean).join(' ')}
          style={{ paddingInlineStart: `calc(var(--space-4) + ${level * 18}px)` }}
          onClick={() => isSelectable ? pick(node) : toggleExpand(node.id)}
          role={isSelectable ? 'option' : 'group'}
          aria-selected={isSelectable ? isSelected : undefined}
        >
          {/* Expand toggle */}
          {hasChildren && (
            <button
              type="button"
              className="ofs-account-expand-btn"
              onClick={e => { e.stopPropagation(); toggleExpand(node.id); }}
              aria-label={isExpanded ? 'طي' : 'توسيع'}
            >
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }}
              >
                <polyline points="4 2 8 6 4 10"/>
              </svg>
            </button>
          )}
          {!hasChildren && <span className="ofs-account-expand-btn" style={{ visibility: 'hidden' }}/>}

          {/* Account code */}
          <span className="ofs-account-code">{node.code}</span>

          {/* Account name */}
          <span className="ofs-account-name">{node.name}</span>

          {/* Selected check */}
          {isSelected && (
            <svg className="ofs-account-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="2 8 6 12 14 4"/>
            </svg>
          )}
        </div>
      );

      return [
        row,
        ...(hasChildren && isExpanded ? renderNodes(node.children!, level + 1) : []),
      ];
    });
  }

  const sizeClass = size === 'sm' ? 'ofs-select-wrap--sm' : '';

  return (
    <div ref={wrapRef} className={`ofs-select-wrap ${sizeClass} ${className}`.trim()}>

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={id ?? uid}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        className="ofs-select-trigger"
        onClick={() => !disabled && (open ? close() : setOpen(true))}
        disabled={disabled}
      >
        {selected ? (
          <span className="ofs-select-value">
            <span className="ofs-account-code" style={{ fontSize: '0.72rem', opacity: 0.7 }}>{selected.code}</span>
            {' '}{selected.name}
          </span>
        ) : (
          <span className="ofs-select-value ofs-select-placeholder">{placeholder}</span>
        )}
        {selected && (
          <button
            type="button"
            className="ofs-select-clear"
            onClick={e => { e.stopPropagation(); onChange('', {} as AccountNode); }}
            tabIndex={-1}
            aria-label="مسح الاختيار"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        )}
        <svg className="ofs-select-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>

      {/* Dropdown */}
      {(open || closing) && (
        <div
          id={listId}
          className={`ofs-select-dropdown${closing ? ' closing' : ''}`}
          role="listbox"
          aria-label={ariaLabel}
        >

          {/* Search */}
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
              placeholder="بحث برمز أو اسم الحساب..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
              autoComplete="off"
            />
          </div>

          {/* Account tree */}
          <div className="ofs-select-options ofs-account-tree" role="presentation">
            {displayAccounts.length === 0 ? (
              <div className="ofs-select-option-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35, marginInline: 'auto' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span>لا توجد نتائج</span>
              </div>
            ) : (
              renderNodes(displayAccounts)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

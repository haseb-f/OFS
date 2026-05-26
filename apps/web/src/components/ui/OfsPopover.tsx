'use client';

import { useState, useRef, useEffect, useId } from 'react';

interface OfsPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top';
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export default function OfsPopover({
  trigger,
  children,
  placement = 'bottom-start',
  className = '',
  contentClassName = '',
  disabled = false,
}: OfsPopoverProps) {
  const [open, setOpen]       = useState(false);
  const [closing, setClosing] = useState(false);
  const wrapRef         = useRef<HTMLDivElement>(null);
  const id              = useId();

  function closePopover() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 130);
  }

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) closePopover();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePopover();
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const placementClass = `ofs-popover-content--${placement}`;

  return (
    <div ref={wrapRef} className={`ofs-popover-wrap ${className}`.trim()}>
      <div
        className="ofs-popover-trigger"
        onClick={() => !disabled && (open ? closePopover() : setOpen(true))}
        aria-expanded={open}
        aria-controls={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) { if (open) { closePopover(); } else { setOpen(true); } }
          }
        }}
      >
        {trigger}
      </div>
      {(open || closing) && (
        <div
          id={id}
          className={`ofs-popover-content ${placementClass} ${contentClassName}${closing ? ' closing' : ''}`.trim()}
          role="dialog"
        >
          <div className="ofs-popover-arrow" aria-hidden="true" />
          {children}
        </div>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 10 8 14 16 6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="8" /><line x1="10" y1="6" x2="10" y2="10" /><line x1="10" y1="14" x2="10.01" y2="14" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="8" /><line x1="10" y1="10" x2="10" y2="14" /><line x1="10" y1="6" x2="10.01" y2="6" />
    </svg>
  );
}

const ICONS: Record<ToastType, React.ReactNode> = {
  error: <ErrorIcon />,
  success: <CheckIcon />,
  info: <InfoIcon />,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`ofs-toast ofs-toast--${toast.type}`}
    >
      <span className="ofs-toast__icon">{ICONS[toast.type]}</span>
      <span className="ofs-toast__message">{toast.message}</span>
      <button
        type="button"
        className="ofs-toast__close"
        aria-label="إغلاق"
        onClick={() => onDismiss(toast.id)}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="5" y1="5" x2="15" y2="15" /><line x1="15" y1="5" x2="5" y2="15" />
        </svg>
      </button>
    </div>
  );
}

export function OfsToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="ofs-toast-container" aria-label="الإشعارات">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

let _nextId = 1;

export function useOfsToast(autoDismissMs = 5000) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = 'error') => {
      const id = _nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), autoDismissMs);
      timers.current.set(id, timer);
      return id;
    },
    [autoDismissMs, dismiss],
  );

  // Cleanup on unmount
  useEffect(() => {
    const map = timers.current;
    return () => { map.forEach((t) => clearTimeout(t)); map.clear(); };
  }, []);

  return { toasts, push, dismiss };
}

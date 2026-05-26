'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function OfsRouteLoader() {
  const pathname = usePathname();
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const prevPath = useRef(pathname);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    if (doneTimer.current) clearTimeout(doneTimer.current);

    setState('running');

    // Give the bar a tick to start animating before snapping to done
    doneTimer.current = setTimeout(() => {
      setState('done');
      doneTimer.current = setTimeout(() => setState('idle'), 300);
    }, 80);

    return () => {
      if (doneTimer.current) clearTimeout(doneTimer.current);
    };
  }, [pathname]);

  if (state === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      className={`ofs-route-bar ${state === 'running' ? 'ofs-route-bar--running' : 'ofs-route-bar--done'}`}
    />
  );
}

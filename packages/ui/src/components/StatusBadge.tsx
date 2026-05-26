import type { StatusConfig } from '@ofs/types';

interface StatusBadgeProps<TStatus extends string> {
  status: TStatus;
  config: Record<TStatus, StatusConfig<TStatus>>;
  size?: 'sm' | 'md';
}

export function StatusBadge<TStatus extends string>({
  status,
  config,
  size = 'md',
}: StatusBadgeProps<TStatus>) {
  const statusConfig = config[status];

  if (!statusConfig) {
    return (
      <span role="status" aria-label={status} style={{ color: 'var(--color-text-muted)' }}>
        {status}
      </span>
    );
  }

  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: size === 'sm' ? 'var(--space-2)' : 'var(--space-3)',
    paddingBlock: size === 'sm' ? 'var(--space-1)' : 'var(--space-2)',
    borderRadius: 'var(--radius-full)',
    fontSize: size === 'sm' ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    backgroundColor: `color-mix(in srgb, ${statusConfig.colour} 15%, transparent)`,
    color: statusConfig.colour,
    border: `1px solid color-mix(in srgb, ${statusConfig.colour} 30%, transparent)`,
    whiteSpace: 'nowrap',
  };

  return (
    <span role="status" aria-label={statusConfig.label} style={styles}>
      {statusConfig.labelAr}
    </span>
  );
}

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

// Shared presentational states. Deliberately i18n-free: callers pass translated
// strings so the same component works for every locale.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      {Icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

type LoadingRowsProps = {
  rows?: number;
  ariaLabel?: string;
};

export function LoadingRows({
  rows = 5,
  ariaLabel = 'Loading',
}: LoadingRowsProps) {
  const skeletonRows = Array.from({ length: rows }, (_, index) => ({
    id: `skeleton-row-${index}`,
  }));

  return (
    <output
      aria-busy="true"
      aria-label={ariaLabel}
      className="flex flex-col gap-3"
    >
      {skeletonRows.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="size-10 rounded-full" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" aria-hidden="true" />
            <Skeleton className="h-3 w-1/2" aria-hidden="true" />
          </div>
        </div>
      ))}
    </output>
  );
}

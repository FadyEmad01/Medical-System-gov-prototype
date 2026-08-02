import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<'output'>) {
  return (
    <output
      data-slot="spinner"
      aria-label="Loading"
      className={cn('inline-flex size-4', className)}
      {...props}
    >
      <Loader2Icon className="size-full animate-spin" aria-hidden="true" />
    </output>
  );
}

export { Spinner };

'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
};

// Shared destructive-ish confirmation surface for the patient portal. Callers
// pass translated strings; pending state swaps the confirm button for a
// spinner to prevent double submissions.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations('dashboard');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {t('insuranceCards.actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

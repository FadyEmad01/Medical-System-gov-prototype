'use client';

import { MoreHorizontalIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import { isBffError } from '@/features/app-shell/hooks/use-bff-error';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate, formatDateTime } from '@/features/dashboard/lib/format';
import type { ReplacementReason } from '@/lib/api/enums';
import {
  type CardAction,
  type CardActionInput,
  getCardActions,
  useCardDetail,
  usePatientCards,
  useReactivateCard,
  useRenewCard,
  useReplaceCard,
  useRevokeCard,
  useRotateCardToken,
  useSuspendCard,
} from '../hooks/use-insurance-cards';
import {
  CARD_LOSS_REASONS,
  type CardDetailResponse,
  type CardResponse,
} from '../types';

export function InsuranceCardsView() {
  const t = useTranslations('dashboard');
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const cardsQuery = usePatientCards(patientId);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? t('common.errors.loadFailed')}
        onRetry={() => void refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  if (cardsQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (cardsQuery.isError) {
    return (
      <ErrorState
        message={
          cardsQuery.error instanceof Error
            ? cardsQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void cardsQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const cards = cardsQuery.data ?? [];

  if (cards.length === 0) {
    return (
      <EmptyState
        title={t('insuranceCards.noCardsTitle')}
        description={t('insuranceCards.noCardsDescription')}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('insuranceCards.cardNumber')}</TableHead>
            <TableHead>{t('insuranceCards.holder')}</TableHead>
            <TableHead>{t('insuranceCards.status')}</TableHead>
            <TableHead>{t('insuranceCards.issueReason')}</TableHead>
            <TableHead>{t('insuranceCards.validity')}</TableHead>
            <TableHead className="text-end">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell className="font-medium">
                {card.cardNumber ?? t('common.unknown')}
              </TableCell>
              <TableCell>
                {card.holderFullName ?? t('common.unknown')}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(statusKey('card', card.status))}
                </Badge>
              </TableCell>
              <TableCell>
                {t(statusKey('issueReason', card.issueReason))}
              </TableCell>
              <TableCell>
                <Badge
                  variant={card.isCurrentlyValid ? 'secondary' : 'outline'}
                >
                  {card.isCurrentlyValid
                    ? t('insuranceCards.valid')
                    : t('insuranceCards.expired')}
                </Badge>
              </TableCell>
              <TableCell className="text-end">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    {t('common.view')}
                  </Button>
                  <CardActionMenu card={card} patientId={patientId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CardDetailDialog
        cardId={selectedCardId}
        onOpenChange={(open) => {
          if (!open) setSelectedCardId(null);
        }}
      />
    </div>
  );
}

function CardDetailDialog({
  cardId,
  onOpenChange,
}: {
  cardId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const detailQuery = useCardDetail(cardId);
  const card = detailQuery.data;

  return (
    <Dialog open={cardId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('insuranceCards.detailTitle')}</DialogTitle>
          <DialogDescription>
            {card?.cardNumber ?? t('common.loading')}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading && (
          <LoadingRows rows={3} ariaLabel={t('common.loading')} />
        )}

        {detailQuery.isError && (
          <ErrorState
            message={t('common.errors.loadFailed')}
            onRetry={() => void detailQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        )}

        {card ? (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailLine
                label={t('insuranceCards.cardNumber')}
                value={card.cardNumber ?? t('common.unknown')}
              />
              <DetailLine
                label={t('insuranceCards.holder')}
                value={card.holderFullName ?? t('common.unknown')}
              />
              <DetailLine
                label={t('insuranceCards.status')}
                value={t(statusKey('card', card.status))}
              />
              <DetailLine
                label={t('insuranceCards.issueReason')}
                value={t(statusKey('issueReason', card.issueReason))}
              />
              <DetailLine
                label={t('insuranceCards.version')}
                value={String(card.version)}
              />
              <DetailLine
                label={t('insuranceCards.issuedAt')}
                value={formatDate(card.issuedAt, locale)}
              />
              <DetailLine
                label={t('insuranceCards.expiresAt')}
                value={formatDate(card.expiresAt, locale)}
              />
              <DetailLine
                label={t('insuranceCards.reason')}
                value={card.reasonNote ?? t('common.unknown')}
              />
            </div>

            {card.statusHistory && card.statusHistory.length > 0 ? (
              <section className="flex flex-col gap-2">
                <h3 className="font-medium">
                  {t('insuranceCards.statusHistory')}
                </h3>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('insuranceCards.previousStatus')}
                        </TableHead>
                        <TableHead>{t('insuranceCards.newStatus')}</TableHead>
                        <TableHead>{t('insuranceCards.reason')}</TableHead>
                        <TableHead>{t('insuranceCards.changedAt')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {card.statusHistory.map((change) => (
                        <TableRow key={change.id}>
                          <TableCell>
                            {t(statusKey('card', change.previousStatus))}
                          </TableCell>
                          <TableCell>
                            {t(statusKey('card', change.newStatus))}
                          </TableCell>
                          <TableCell>
                            {change.reason ?? t('common.unknown')}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(change.changedAt, locale)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Per-row lifecycle actions. Rendered only when the patient id is resolved, so
// the mutation hooks below are unconditionally called within this component.
function CardActionMenu({
  card,
  patientId,
}: {
  card: CardResponse;
  patientId: number | undefined;
}) {
  const t = useTranslations('dashboard');
  const suspend = useSuspendCard(patientId ?? 0);
  const reactivate = useReactivateCard(patientId ?? 0);
  const revoke = useRevokeCard(patientId ?? 0);
  const renew = useRenewCard(patientId ?? 0);
  const replace = useReplaceCard(patientId ?? 0);
  const rotateToken = useRotateCardToken(patientId ?? 0);
  const [pendingAction, setPendingAction] = useState<CardAction | null>(null);

  const availableActions = getCardActions(card.status);

  if (availableActions.length === 0) {
    return null;
  }

  const mutationByAction: Record<
    CardAction,
    ReturnType<typeof useSuspendCard>
  > = {
    suspend,
    reactivate,
    revoke,
    renew,
    replace,
    rotateToken,
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <MoreHorizontalIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">{t('common.actions')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableActions.map((action) => (
            <DropdownMenuItem
              key={action}
              onSelect={() => setPendingAction(action)}
            >
              {t(`insuranceCards.actions.${action}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {pendingAction !== null ? (
        <CardActionDialog
          card={card}
          action={pendingAction}
          mutation={mutationByAction[pendingAction]}
          open
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
        />
      ) : null}
    </>
  );
}

function CardActionDialog({
  card,
  action,
  mutation,
  open,
  onOpenChange,
}: {
  card: CardResponse;
  action: CardAction;
  mutation: {
    isPending: boolean;
    mutate: (
      variables: CardActionInput,
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => void;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('dashboard');
  const [replacementReason, setReplacementReason] =
    useState<ReplacementReason>('Lost');

  const confirm = () => {
    mutation.mutate(
      {
        cardId: card.id,
        ...(action === 'replace' ? { replacementReason } : {}),
      },
      {
        onSuccess: () => {
          toast.success(t(`insuranceCards.actions.${action}Success`));
          onOpenChange(false);
        },
        onError: (error) => {
          if (isBffError(error) && error.status === 401) return;
          toast.error(
            error instanceof Error
              ? error.message
              : t('common.errors.actionFailed'),
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(`insuranceCards.actions.${action}ConfirmTitle`)}
          </DialogTitle>
          <DialogDescription>
            {t(`insuranceCards.actions.${action}ConfirmDescription`)}
          </DialogDescription>
        </DialogHeader>

        {action === 'replace' ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {t('insuranceCards.actions.replacementReason')}
            </span>
            <Select
              value={replacementReason}
              onValueChange={(value) =>
                setReplacementReason(value as ReplacementReason)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARD_LOSS_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {t(statusKey('replacementReason', reason))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={confirm} disabled={mutation.isPending}>
            {mutation.isPending && <Spinner data-icon="inline-start" />}
            {t('insuranceCards.actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export type { CardDetailResponse };

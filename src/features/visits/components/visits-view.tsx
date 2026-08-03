'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate, formatDateTime } from '@/features/dashboard/lib/format';
import { usePatientVisits, useVisit } from '../hooks/use-visits';
import type { VisitResponse } from '../types';

export function VisitsView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const visitsQuery = usePatientVisits(patientId);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

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

  if (visitsQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (visitsQuery.isError) {
    return (
      <ErrorState
        message={
          visitsQuery.error instanceof Error
            ? visitsQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void visitsQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const visits = visitsQuery.data ?? [];

  if (visits.length === 0) {
    return (
      <EmptyState
        title={t('visits.noVisitsTitle')}
        description={t('visits.noVisitsDescription')}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('visits.visitDate')}</TableHead>
            <TableHead>{t('visits.visitType')}</TableHead>
            <TableHead>{t('visits.status')}</TableHead>
            <TableHead>{t('visits.doctor')}</TableHead>
            <TableHead className="text-end">{t('visits.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell>{formatDate(visit.visitDate, locale)}</TableCell>
              <TableCell>{t(statusKey('visit', visit.visitType))}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(statusKey('visit', visit.status))}
                </Badge>
              </TableCell>
              <TableCell>
                {visit.doctorFullName ?? t('common.unknown')}
              </TableCell>
              <TableCell className="text-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVisitId(visit.id)}
                >
                  {t('common.view')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <VisitDetailDialog
        visitId={selectedVisitId}
        onOpenChange={(open) => {
          if (!open) setSelectedVisitId(null);
        }}
      />
    </div>
  );
}

function VisitDetailDialog({
  visitId,
  onOpenChange,
}: {
  visitId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const detailQuery = useVisit(visitId);
  const visit = detailQuery.data;

  return (
    <Dialog open={visitId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('visits.detailTitle')}</DialogTitle>
          <DialogDescription>
            {visit
              ? formatDateTime(visit.visitDate, locale)
              : t('common.loading')}
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

        {visit ? (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailLine
                label={t('visits.visitType')}
                value={t(statusKey('visit', visit.visitType))}
              />
              <DetailLine
                label={t('visits.status')}
                value={t(statusKey('visit', visit.status))}
              />
              <DetailLine
                label={t('visits.doctor')}
                value={visit.doctorFullName ?? t('common.unknown')}
              />
              <DetailLine
                label={t('visits.diagnosis')}
                value={visit.diagnosis ?? t('common.unknown')}
              />
              <DetailLine
                label={t('visits.notes')}
                value={visit.notes ?? t('common.unknown')}
              />
              <DetailLine
                label={t('visits.requiredTests')}
                value={visit.requiredTests ?? t('common.unknown')}
              />
            </div>

            {visit.medications && visit.medications.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="font-medium">{t('visits.medications')}</h3>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('visits.medicineName')}</TableHead>
                        <TableHead>{t('visits.dosage')}</TableHead>
                        <TableHead>{t('visits.frequency')}</TableHead>
                        <TableHead>{t('visits.duration')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visit.medications.map((medication) => (
                        <TableRow key={medication.id}>
                          <TableCell>
                            {medication.medicineName ?? t('common.unknown')}
                          </TableCell>
                          <TableCell>
                            {medication.dosage ?? t('common.unknown')}
                          </TableCell>
                          <TableCell>
                            {medication.frequency ?? t('common.unknown')}
                          </TableCell>
                          <TableCell>
                            {medication.duration ?? t('common.unknown')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {visit.attachments && visit.attachments.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="font-medium">{t('visits.attachments')}</h3>
                <ul className="flex flex-col gap-1">
                  {visit.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      {attachment.fileUrl ? (
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {attachment.fileName ?? attachment.fileUrl}
                        </a>
                      ) : (
                        (attachment.fileName ??
                        attachment.fileUrl ??
                        t('common.unknown'))
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : null}
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

export type { VisitResponse };

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { statusKey } from '@/features/doctor/lib/enum-labels';
import { formatDate, formatDateTime } from '@/features/doctor/lib/format';
import { CreateVisitDialog } from '@/features/visits/components/create-visit-dialog';
import {
  usePatientMedicalSummary,
  usePatientVisitHistory,
} from '../hooks/use-patients';

export function PatientDetailView({ patientId }: { patientId: number }) {
  const t = useTranslations('doctor');
  const locale = useLocale();
  const [createOpen, setCreateOpen] = useState(false);
  const summaryQuery = usePatientMedicalSummary(patientId);
  const historyQuery = usePatientVisitHistory(patientId);

  if (summaryQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (summaryQuery.isError) {
    if (isBffError(summaryQuery.error) && summaryQuery.error.status === 404) {
      return (
        <EmptyState
          title={t('patientSearch.notFoundTitle')}
          description={t('patientSearch.notFoundDescription')}
        />
      );
    }
    return (
      <ErrorState
        message={summaryQuery.error.message ?? t('common.errors.loadFailed')}
        onRetry={() => void summaryQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const summary = summaryQuery.data;

  if (summary === undefined) {
    return <ErrorState message={t('common.errors.loadFailed')} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">
              {summary.fullName ?? t('common.unknown')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {summary.nationalId ?? t('common.unknown')}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            {t('createVisit.title')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <IdentityMetric
            label={t('medicalSummary.dateOfBirth')}
            value={formatDate(summary.dateOfBirth, locale)}
          />
          <IdentityMetric
            label={t('medicalSummary.gender')}
            value={t(statusKey('gender', summary.gender))}
          />
          <IdentityMetric
            label={t('medicalSummary.lastVisit')}
            value={
              summary.lastVisit
                ? `${formatDateTime(summary.lastVisit.visitDate, locale)} · ${
                    summary.lastVisit.doctorName ?? t('common.unknown')
                  } · ${t(statusKey('visitType', summary.lastVisit.visitType))}`
                : t('medicalSummary.noData')
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MedicalBlock
          title={t('medicalSummary.diagnosis')}
          content={summary.latestDiagnosis ?? t('medicalSummary.noData')}
        />
        <MedicalBlock
          title={t('medicalSummary.notes')}
          content={summary.latestNotes ?? t('medicalSummary.noData')}
        />
        <MedicalBlock
          title={t('medicalSummary.requiredTests')}
          content={summary.latestRequiredTests ?? t('medicalSummary.noData')}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('medicalSummary.medications')}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.latestMedications &&
            summary.latestMedications.length > 0 ? (
              <ul className="flex flex-col divide-y text-sm">
                {summary.latestMedications.map((medication, index) => (
                  <li
                    key={`${medication.medicationName ?? 'medication'}-${index}`}
                    className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="font-medium">
                      {medication.medicationName ?? t('common.unknown')}
                    </span>
                    <span className="text-muted-foreground">
                      {medication.dosage ?? t('common.unknown')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('medicalSummary.noData')}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('medicalSummary.attachments')}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.latestAttachments &&
            summary.latestAttachments.length > 0 ? (
              <ul className="flex flex-col divide-y text-sm">
                {summary.latestAttachments.map((attachment, index) => (
                  <li
                    key={`${attachment.fileName ?? 'attachment'}-${index}`}
                    className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="font-medium">
                      {attachment.fileName ?? t('common.unknown')}
                    </span>
                    <span className="text-muted-foreground">
                      {attachment.fileType ?? t('common.unknown')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('medicalSummary.noData')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('visitHistory.title')}</CardTitle>
          <CardDescription>{t('visitHistory.empty')}</CardDescription>
        </CardHeader>
        <CardContent>
          {historyQuery.isLoading ? (
            <LoadingRows rows={4} ariaLabel={t('common.loading')} />
          ) : historyQuery.isError ? (
            <ErrorState
              message={t('common.errors.loadFailed')}
              onRetry={() => void historyQuery.refetch()}
              retryLabel={t('common.retry')}
            />
          ) : (historyQuery.data ?? []).length === 0 ? (
            <EmptyState
              title={t('visitHistory.title')}
              description={t('visitHistory.empty')}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('visitHistory.columns.visitDate')}</TableHead>
                    <TableHead>{t('visitHistory.columns.doctor')}</TableHead>
                    <TableHead>{t('visitHistory.columns.type')}</TableHead>
                    <TableHead>{t('visitHistory.columns.diagnosis')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(historyQuery.data ?? []).map((visit) => (
                    <TableRow key={visit.visitId}>
                      <TableCell>
                        {formatDate(visit.visitDate, locale)}
                      </TableCell>
                      <TableCell>
                        {visit.doctorName ?? t('common.unknown')}
                      </TableCell>
                      <TableCell>
                        {t(statusKey('visitType', visit.visitType))}
                      </TableCell>
                      <TableCell>
                        {visit.diagnosisSummary ?? t('common.unknown')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateVisitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patientId={patientId}
        patientFullName={summary.fullName ?? undefined}
      />
    </div>
  );
}

function IdentityMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-base font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}

function MedicalBlock({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}

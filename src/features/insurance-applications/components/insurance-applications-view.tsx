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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ConfirmDialog } from '@/features/dashboard/components/confirm-dialog';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate, formatDateTime } from '@/features/dashboard/lib/format';
import {
  useApplicationDetail,
  useCancelApplication,
  useCreateApplication,
  usePatientApplications,
  useSubmitApplication,
} from '../hooks/use-insurance-applications';
import type { ApplicationResponse } from '../types';

type ApplicationAction = 'submit' | 'cancel';

export function InsuranceApplicationsView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const applicationsQuery = usePatientApplications(patientId);
  const createApplication = useCreateApplication(patientId ?? 0);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [actionTarget, setActionTarget] = useState<{
    application: ApplicationResponse;
    action: ApplicationAction;
  } | null>(null);

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

  if (applicationsQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (applicationsQuery.isError) {
    return (
      <ErrorState
        message={
          applicationsQuery.error instanceof Error
            ? applicationsQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void applicationsQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const applications = applicationsQuery.data ?? [];

  const handleCreate = () => {
    createApplication.mutate(undefined, {
      onSuccess: () => toast.success(t('insuranceApplications.createSuccess')),
      onError: (createError) =>
        toast.error(
          createError instanceof Error
            ? createError.message
            : t('insuranceApplications.createError'),
        ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate} disabled={createApplication.isPending}>
          {createApplication.isPending && <Spinner data-icon="inline-start" />}
          {t('insuranceApplications.create')}
        </Button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title={t('insuranceApplications.noApplicationsTitle')}
          description={t('insuranceApplications.noApplicationsDescription')}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('insuranceApplications.applicationNumber')}
                </TableHead>
                <TableHead>{t('insuranceApplications.status')}</TableHead>
                <TableHead>{t('insuranceApplications.channel')}</TableHead>
                <TableHead>{t('insuranceApplications.submittedAt')}</TableHead>
                <TableHead>
                  {t('insuranceApplications.documentCount')}
                </TableHead>
                <TableHead>
                  {t('insuranceApplications.dependentCount')}
                </TableHead>
                <TableHead className="text-end">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.applicationNumber ?? t('common.unknown')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(statusKey('application', application.status))}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.submissionChannel ?? t('common.unknown')}
                  </TableCell>
                  <TableCell>
                    {application.submittedAt
                      ? formatDate(application.submittedAt, locale)
                      : t('common.unknown')}
                  </TableCell>
                  <TableCell>{application.documentCount}</TableCell>
                  <TableCell>{application.dependentCount}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplicationId(application.id)}
                      >
                        {t('common.view')}
                      </Button>
                      <ApplicationActionMenu
                        application={application}
                        onSelectAction={(action) =>
                          setActionTarget({ application, action })
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ApplicationDetailDialog
        applicationId={selectedApplicationId}
        onOpenChange={(open) => {
          if (!open) setSelectedApplicationId(null);
        }}
      />

      <ApplicationConfirmDialog
        target={actionTarget}
        patientId={patientId}
        onClose={() => setActionTarget(null)}
      />
    </div>
  );
}

function ApplicationActionMenu({
  application,
  onSelectAction,
}: {
  application: ApplicationResponse;
  onSelectAction: (action: ApplicationAction) => void;
}) {
  const t = useTranslations('dashboard');

  const canSubmit = application.status === 'Draft';
  const canCancel =
    application.status === 'Draft' ||
    application.status === 'Submitted' ||
    application.status === 'UnderReview' ||
    application.status === 'WaitingForDocuments';

  if (!canSubmit && !canCancel) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
          <MoreHorizontalIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">{t('common.actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canSubmit ? (
          <DropdownMenuItem onSelect={() => onSelectAction('submit')}>
            {t('insuranceApplications.submit')}
          </DropdownMenuItem>
        ) : null}
        {canCancel ? (
          <DropdownMenuItem onSelect={() => onSelectAction('cancel')}>
            {t('insuranceApplications.cancel')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ApplicationConfirmDialog({
  target,
  patientId,
  onClose,
}: {
  target: {
    application: ApplicationResponse;
    action: ApplicationAction;
  } | null;
  patientId: number;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard');
  const submit = useSubmitApplication(patientId ?? 0);
  const cancel = useCancelApplication(patientId ?? 0);

  if (target === null) {
    return null;
  }

  const isSubmit = target.action === 'submit';
  const mutation = isSubmit ? submit : cancel;

  const confirm = () => {
    mutation.mutate(target.application.id, {
      onSuccess: () => {
        toast.success(
          t(
            isSubmit
              ? 'insuranceApplications.submitSuccess'
              : 'insuranceApplications.cancelSuccess',
          ),
        );
        onClose();
      },
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : t('common.errors.actionFailed'),
        ),
    });
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t(
        isSubmit
          ? 'insuranceApplications.submitConfirmTitle'
          : 'insuranceApplications.cancelConfirmTitle',
      )}
      description={t(
        isSubmit
          ? 'insuranceApplications.submitConfirmDescription'
          : 'insuranceApplications.cancelConfirmDescription',
      )}
      isPending={mutation.isPending}
      onConfirm={confirm}
    />
  );
}

function ApplicationDetailDialog({
  applicationId,
  onOpenChange,
}: {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const detailQuery = useApplicationDetail(applicationId);
  const application = detailQuery.data;

  return (
    <Dialog open={applicationId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('insuranceApplications.detailTitle')}</DialogTitle>
          <DialogDescription>
            {application?.applicationNumber ?? t('common.loading')}
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

        {application ? (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailLine
                label={t('insuranceApplications.status')}
                value={t(statusKey('application', application.status))}
              />
              <DetailLine
                label={t('insuranceApplications.submittedAt')}
                value={
                  application.submittedAt
                    ? formatDateTime(application.submittedAt, locale)
                    : t('common.unknown')
                }
              />
              <DetailLine
                label={t('insuranceStatus.eligibilityStatus')}
                value={t(
                  statusKey(
                    'eligibility',
                    application.eligibilityStatusSnapshot,
                  ),
                )}
              />
              <DetailLine
                label={t('insuranceStatus.verificationStatus')}
                value={t(
                  statusKey(
                    'verification',
                    application.verificationStatusSnapshot,
                  ),
                )}
              />
              {application.decisionReason ? (
                <DetailLine
                  label={t('insuranceApplications.decisionReason')}
                  value={application.decisionReason}
                />
              ) : null}
            </div>

            {application.reviewHistory &&
            application.reviewHistory.length > 0 ? (
              <section className="flex flex-col gap-2">
                <h3 className="font-medium">
                  {t('insuranceApplications.reviewHistory')}
                </h3>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('insuranceApplications.reviewOutcome')}
                        </TableHead>
                        <TableHead>
                          {t('insuranceApplications.reviewedAt')}
                        </TableHead>
                        <TableHead>
                          {t('insuranceApplications.decisionReason')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {application.reviewHistory.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {t(
                                statusKey(
                                  'reviewOutcome',
                                  review.reviewOutcome,
                                ),
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDateTime(review.reviewedAt, locale)}
                          </TableCell>
                          <TableCell>
                            {review.citizenVisibleReason ?? t('common.unknown')}
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

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

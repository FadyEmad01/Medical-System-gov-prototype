'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatDate } from '@/features/doctor/lib/format';
import { Link } from '@/i18n/navigation';
import {
  useAssignedPatients,
  useDeleteAssignment,
} from '../hooks/use-assignments';

export function AssignedPatientsView() {
  const t = useTranslations('doctor');
  const locale = useLocale();
  const { user } = useAuth();
  const assignedQuery = useAssignedPatients(user?.id);
  const [unassignPatientId, setUnassignPatientId] = useState<number | null>(
    null,
  );

  if (user?.id === undefined) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (assignedQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (assignedQuery.isError) {
    if (isBffError(assignedQuery.error) && assignedQuery.error.status === 403) {
      return (
        <EmptyState
          title={t('assignedPatients.forbiddenTitle')}
          description={t('assignedPatients.forbiddenDescription')}
        />
      );
    }
    return (
      <ErrorState
        message={assignedQuery.error.message ?? t('common.errors.loadFailed')}
        onRetry={() => void assignedQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const patients = assignedQuery.data ?? [];

  if (patients.length === 0) {
    return (
      <EmptyState
        title={t('assignedPatients.emptyTitle')}
        description={t('assignedPatients.emptyDescription')}
        action={
          <Button asChild>
            <Link href="/doctor/patients">
              {t('assignedPatients.searchCta')}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('assignedPatients.columns.patientId')}</TableHead>
              <TableHead>{t('assignedPatients.columns.fullName')}</TableHead>
              <TableHead>{t('assignedPatients.columns.nationalId')}</TableHead>
              <TableHead>
                {t('assignedPatients.columns.mobileNumber')}
              </TableHead>
              <TableHead>{t('assignedPatients.columns.assignedAt')}</TableHead>
              <TableHead className="text-end">
                {t('assignedPatients.title')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.patientId}>
                <TableCell>{patient.patientId}</TableCell>
                <TableCell className="font-medium">
                  {patient.fullName ?? t('common.unknown')}
                </TableCell>
                <TableCell>
                  {patient.nationalId ?? t('common.unknown')}
                </TableCell>
                <TableCell>
                  {patient.mobileNumber ?? t('common.unknown')}
                </TableCell>
                <TableCell>{formatDate(patient.assignedAt, locale)}</TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUnassignPatientId(patient.patientId)}
                  >
                    {t('assignedPatients.unassign')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UnassignPatientDialog
        open={unassignPatientId !== null}
        patientId={unassignPatientId}
        doctorId={user.id}
        onOpenChange={(open) => {
          if (!open) setUnassignPatientId(null);
        }}
      />
    </div>
  );
}

function UnassignPatientDialog({
  open,
  patientId,
  doctorId,
  onOpenChange,
}: {
  open: boolean;
  patientId: number | null;
  doctorId: number;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('doctor');
  const deleteAssignment = useDeleteAssignment(doctorId);

  const handleConfirm = () => {
    if (patientId === null) return;
    deleteAssignment.mutate(patientId, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(t('assignedPatients.unassigned'));
      },
      onError: (error) => {
        onOpenChange(false);
        toast.error(
          error instanceof Error
            ? error.message
            : t('common.errors.loadFailed'),
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('assignedPatients.unassignConfirmTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('assignedPatients.unassignConfirm')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteAssignment.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={deleteAssignment.isPending}>
            {deleteAssignment.isPending && <Spinner data-icon="inline-start" />}
            {t('assignedPatients.unassign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

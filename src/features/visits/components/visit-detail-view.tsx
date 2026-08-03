'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import {
  useUploadAttachment,
  useVisitAttachments,
} from '@/features/attachments/hooks/use-attachments';
import { statusKey } from '@/features/doctor/lib/enum-labels';
import { formatDateTime } from '@/features/doctor/lib/format';
import type { VisitStatus } from '@/lib/api/enums';
import {
  useAddVisitMedications,
  useUpdateVisit,
  useUpdateVisitStatus,
} from '../hooks/use-visit-actions';
import { useVisit } from '../hooks/use-visits';
import type { VisitResponse } from '../types';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function VisitDetailView({ visitId }: { visitId: string }) {
  const t = useTranslations('doctor');
  const locale = useLocale();
  const visitQuery = useVisit(visitId);
  const attachmentsQuery = useVisitAttachments(visitId);
  const updateStatus = useUpdateVisitStatus(visitId);
  const [editOpen, setEditOpen] = useState(false);
  const [addMedicationOpen, setAddMedicationOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (visitQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (visitQuery.isError) {
    if (isBffError(visitQuery.error) && visitQuery.error.status === 404) {
      return (
        <EmptyState
          title={t('visitDetail.notFoundTitle')}
          description={t('visitDetail.notFoundDescription')}
        />
      );
    }
    return (
      <ErrorState
        message={visitQuery.error.message ?? t('common.errors.loadFailed')}
        onRetry={() => void visitQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const visit = visitQuery.data;

  if (visit === undefined) {
    return <ErrorState message={t('common.errors.loadFailed')} />;
  }

  const handleStatusChange = (status: VisitStatus) => {
    updateStatus.mutate(status, {
      onSuccess: () => {
        toast.success(t('visitDetail.statusUpdated'));
      },
    });
  };

  const handleCancelConfirm = () => {
    updateStatus.mutate('Cancelled', {
      onSuccess: () => {
        setCancelOpen(false);
        toast.success(t('visitDetail.statusUpdated'));
      },
    });
  };

  const attachments = attachmentsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle>
              {visit.patientFullName ?? t('common.unknown')}
            </CardTitle>
            <CardDescription>
              {visit.patientNationalId ?? t('common.unknown')}
            </CardDescription>
          </div>
          <Badge variant="outline">{t(statusKey('visit', visit.status))}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DetailLine
              label={t('visitDetail.visitDate')}
              value={formatDateTime(visit.visitDate, locale)}
            />
            <DetailLine
              label={t('visitDetail.visitType')}
              value={t(statusKey('visitType', visit.visitType))}
            />
            <DetailLine
              label={t('visitDetail.statusLabel')}
              value={t(statusKey('visit', visit.status))}
            />
          </div>

          {visit.status === 'Scheduled' || visit.status === 'InProgress' ? (
            <div className="flex flex-wrap items-center gap-2">
              {visit.status === 'Scheduled' ? (
                <Button
                  onClick={() => handleStatusChange('InProgress')}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending && (
                    <Spinner data-icon="inline-start" />
                  )}
                  {t('visitDetail.start')}
                </Button>
              ) : null}
              {visit.status === 'InProgress' ? (
                <>
                  <Button
                    onClick={() => handleStatusChange('Completed')}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending && (
                      <Spinner data-icon="inline-start" />
                    )}
                    {t('visitDetail.complete')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCancelOpen(true)}
                    disabled={updateStatus.isPending}
                  >
                    {t('visitDetail.cancel')}
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <CardTitle>{t('medicalSummary.diagnosis')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            {t('visitDetail.edit')}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailBlock
            title={t('visitDetail.diagnosis')}
            content={visit.diagnosis ?? t('medicalSummary.noData')}
          />
          <DetailBlock
            title={t('visitDetail.notes')}
            content={visit.notes ?? t('medicalSummary.noData')}
          />
          <DetailBlock
            title={t('visitDetail.requiredTests')}
            content={visit.requiredTests ?? t('medicalSummary.noData')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <CardTitle>{t('visitDetail.medications')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddMedicationOpen(true)}
          >
            {t('visitDetail.addMedication')}
          </Button>
        </CardHeader>
        <CardContent>
          {visit.medications && visit.medications.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('createVisit.medicineName')}</TableHead>
                    <TableHead>{t('createVisit.dosage')}</TableHead>
                    <TableHead>{t('createVisit.frequency')}</TableHead>
                    <TableHead>{t('createVisit.duration')}</TableHead>
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
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('visitDetail.noMedications')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('visitDetail.attachments')}</CardTitle>
          <CardDescription>{t('visitDetail.noAttachments')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {attachmentsQuery.isLoading ? (
            <LoadingRows rows={2} ariaLabel={t('common.loading')} />
          ) : attachmentsQuery.isError ? (
            <ErrorState
              message={t('common.errors.loadFailed')}
              onRetry={() => void attachmentsQuery.refetch()}
              retryLabel={t('common.retry')}
            />
          ) : attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('visitDetail.noAttachments')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y text-sm">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                >
                  <span className="font-medium">
                    {attachment.fileName ?? t('common.unknown')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                    </span>
                    {attachment.fileUrl ? (
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {t('visitDetail.openFile')}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <UploadAttachmentSection visitId={visitId} />
        </CardContent>
      </Card>

      <EditVisitDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        visit={visit}
      />

      <AddMedicationDialog
        open={addMedicationOpen}
        onOpenChange={setAddMedicationOpen}
        visitId={visitId}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('visitDetail.cancelConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('visitDetail.cancelConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={updateStatus.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCancelConfirm}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && <Spinner data-icon="inline-start" />}
              {t('visitDetail.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditVisitDialog({
  open,
  onOpenChange,
  visit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: VisitResponse;
}) {
  const t = useTranslations('doctor');
  const updateVisit = useUpdateVisit(visit.id);

  const editSchema = z.object({
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
    requiredTests: z.string().optional(),
  });

  type EditFormData = z.infer<typeof editSchema>;

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { diagnosis: '', notes: '', requiredTests: '' },
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      form.reset({
        diagnosis: visit.diagnosis ?? '',
        notes: visit.notes ?? '',
        requiredTests: visit.requiredTests ?? '',
      });
    }
  }, [visit, form]);

  const { register, handleSubmit, formState } = form;

  const onSubmit = (data: EditFormData) => {
    updateVisit.mutate(
      {
        diagnosis: data.diagnosis || null,
        notes: data.notes || null,
        requiredTests: data.requiredTests || null,
      },
      {
        onSuccess: () => {
          toast.success(t('visitDetail.saved'));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t('visitDetail.saveFailed'));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('visitDetail.editTitle')}</DialogTitle>
          <DialogDescription>{t('createVisit.description')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field>
            <FieldLabel>{t('createVisit.diagnosis')}</FieldLabel>
            <FieldContent>
              <Input {...register('diagnosis')} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>{t('createVisit.notes')}</FieldLabel>
            <FieldContent>
              <Input {...register('notes')} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>{t('createVisit.requiredTests')}</FieldLabel>
            <FieldContent>
              <Input {...register('requiredTests')} />
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={updateVisit.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateVisit.isPending}>
              {updateVisit.isPending && <Spinner data-icon="inline-start" />}
              {t('visitDetail.save')}
            </Button>
          </DialogFooter>

          {formState.errors.diagnosis ? (
            <FieldError>{formState.errors.diagnosis.message}</FieldError>
          ) : null}
          {formState.errors.notes ? (
            <FieldError>{formState.errors.notes.message}</FieldError>
          ) : null}
          {formState.errors.requiredTests ? (
            <FieldError>{formState.errors.requiredTests.message}</FieldError>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMedicationDialog({
  open,
  onOpenChange,
  visitId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: string;
}) {
  const t = useTranslations('doctor');
  const addMedications = useAddVisitMedications(visitId);

  const medicationSchema = z.object({
    medicineName: z.string().min(1, { message: t('forms.requiredField') }),
    dosage: z.string().min(1, { message: t('forms.requiredField') }),
    frequency: z.string().min(1, { message: t('forms.requiredField') }),
    duration: z.string().min(1, { message: t('forms.requiredField') }),
  });

  type MedicationFormData = z.infer<typeof medicationSchema>;

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
    },
  });

  const { register, handleSubmit, formState } = form;

  const onSubmit = (data: MedicationFormData) => {
    addMedications.mutate([data], {
      onSuccess: () => {
        toast.success(t('visitDetail.medicationAdded'));
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('visitDetail.addMedication')}</DialogTitle>
          <DialogDescription>{t('createVisit.description')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MedicationField
              label={t('createVisit.medicineName')}
              error={formState.errors.medicineName?.message}
              inputProps={register('medicineName')}
            />
            <MedicationField
              label={t('createVisit.dosage')}
              error={formState.errors.dosage?.message}
              inputProps={register('dosage')}
            />
            <MedicationField
              label={t('createVisit.frequency')}
              error={formState.errors.frequency?.message}
              inputProps={register('frequency')}
            />
            <MedicationField
              label={t('createVisit.duration')}
              error={formState.errors.duration?.message}
              inputProps={register('duration')}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={addMedications.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={addMedications.isPending}>
              {addMedications.isPending && <Spinner data-icon="inline-start" />}
              {t('visitDetail.addMedication')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UploadAttachmentSection({ visitId }: { visitId: string }) {
  const t = useTranslations('doctor');
  const uploadAttachment = useUploadAttachment(visitId);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (file === null) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(t('visitDetail.uploadSizeError'));
      return;
    }

    const uploadingToastId = toast.loading(t('visitDetail.uploading'));

    uploadAttachment.mutate(file, {
      onSuccess: () => {
        toast.dismiss(uploadingToastId);
        toast.success(t('visitDetail.uploaded'));
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error) => {
        toast.dismiss(uploadingToastId);
        toast.error(
          error instanceof Error
            ? error.message
            : t('visitDetail.uploadFailed'),
        );
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        ref={fileInputRef}
        type="file"
        className="flex-1"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
        }}
      />
      <Button
        onClick={handleUpload}
        disabled={uploadAttachment.isPending || file === null}
      >
        {uploadAttachment.isPending && <Spinner data-icon="inline-start" />}
        {t('visitDetail.upload')}
      </Button>
    </div>
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

function DetailBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{title}</span>
      <p className="text-sm">{content}</p>
    </div>
  );
}

function MedicationField({
  label,
  error,
  inputProps,
}: {
  label: string;
  error: string | undefined;
  inputProps: React.ComponentProps<'input'>;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Input {...inputProps} />
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

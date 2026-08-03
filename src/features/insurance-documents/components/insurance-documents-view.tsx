'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate } from '@/features/dashboard/lib/format';
import {
  usePatientDocuments,
  useUploadDocument,
} from '../hooks/use-insurance-documents';
import { type CitizenDocumentResponse, DOCUMENT_TYPES } from '../types';

export function InsuranceDocumentsView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const documentsQuery = usePatientDocuments(patientId);
  const [uploadOpen, setUploadOpen] = useState(false);

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

  if (documentsQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (documentsQuery.isError) {
    return (
      <ErrorState
        message={
          documentsQuery.error instanceof Error
            ? documentsQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void documentsQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const documents = documentsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setUploadOpen(true)}>
          {t('insuranceDocuments.upload')}
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title={t('insuranceDocuments.noDocumentsTitle')}
          description={t('insuranceDocuments.noDocumentsDescription')}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('insuranceDocuments.documentType')}</TableHead>
                <TableHead>{t('insuranceDocuments.documentNumber')}</TableHead>
                <TableHead>{t('insuranceDocuments.fileName')}</TableHead>
                <TableHead>{t('insuranceDocuments.uploadedAt')}</TableHead>
                <TableHead>{t('insuranceDocuments.expiresAt')}</TableHead>
                <TableHead>{t('insuranceDocuments.reviewStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    {t(statusKey('documentType', document.documentType))}
                  </TableCell>
                  <TableCell>
                    {document.documentNumber ?? t('common.unknown')}
                  </TableCell>
                  <TableCell>
                    {document.fileUrl ? (
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {document.fileName ?? document.fileUrl}
                      </a>
                    ) : (
                      (document.fileName ?? t('common.unknown'))
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(document.uploadedAt, locale)}
                  </TableCell>
                  <TableCell>
                    {document.expiresAt ? (
                      <ExpiryBadge
                        expiresAt={document.expiresAt}
                        locale={locale}
                      />
                    ) : (
                      t('common.unknown')
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(statusKey('documentReview', document.reviewStatus))}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <UploadDocumentDialog
        open={uploadOpen}
        patientId={patientId}
        onOpenChange={setUploadOpen}
      />
    </div>
  );
}

function ExpiryBadge({
  expiresAt,
  locale,
}: {
  expiresAt: string;
  locale: string;
}) {
  const t = useTranslations('dashboard');

  const expiry = new Date(expiresAt);
  const now = new Date();
  if (expiry < now) {
    return <Badge variant="outline">{t('insuranceDocuments.expired')}</Badge>;
  }
  const soonThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (expiry < soonThreshold) {
    return (
      <Badge variant="secondary">{t('insuranceDocuments.expirySoon')}</Badge>
    );
  }
  return <span>{formatDate(expiresAt, locale)}</span>;
}

function UploadDocumentDialog({
  open,
  patientId,
  onOpenChange,
}: {
  open: boolean;
  patientId: number | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('dashboard');
  const uploadDocument = useUploadDocument(patientId ?? 0);
  const [file, setFile] = useState<File | null>(null);

  const uploadDocumentSchema = z.object({
    documentType: z.enum(DOCUMENT_TYPES, {
      message: t('forms.requiredField'),
    }),
    documentNumber: z.string().optional(),
    expiresAt: z.string().optional(),
  });

  type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

  const form = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      documentType: 'NationalId',
      documentNumber: '',
      expiresAt: '',
    },
  });

  const { register, handleSubmit, control, reset, formState } = form;

  const onSubmit = (data: UploadDocumentFormData) => {
    if (!file) {
      toast.error(t('insuranceDocuments.uploadError'));
      return;
    }

    uploadDocument.mutate(
      {
        documentType: data.documentType,
        file,
        documentNumber: data.documentNumber || undefined,
        expiresAt: data.expiresAt || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('insuranceDocuments.uploadSuccess'));
          reset();
          setFile(null);
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : t('insuranceDocuments.uploadError'),
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('insuranceDocuments.uploadTitle')}</DialogTitle>
          <DialogDescription>
            {t('insuranceDocuments.noDocumentsDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field>
            <FieldLabel>{t('insuranceDocuments.documentType')}</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="documentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((documentType) => (
                        <SelectItem key={documentType} value={documentType}>
                          {t(statusKey('documentType', documentType))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>{t('insuranceDocuments.file')}</FieldLabel>
            <FieldContent>
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                }}
              />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>{t('insuranceDocuments.documentNumber')}</FieldLabel>
              <FieldContent>
                <Input
                  {...register('documentNumber')}
                  placeholder={t('common.unknown')}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('insuranceDocuments.expiresAt')}</FieldLabel>
              <FieldContent>
                <Input type="date" {...register('expiresAt')} />
              </FieldContent>
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadDocument.isPending}
              type="button"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={uploadDocument.isPending || file === null}
            >
              {uploadDocument.isPending && <Spinner data-icon="inline-start" />}
              {t('insuranceDocuments.upload')}
            </Button>
          </DialogFooter>

          {formState.errors.documentType ? (
            <FieldError>{formState.errors.documentType.message}</FieldError>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { CitizenDocumentResponse };

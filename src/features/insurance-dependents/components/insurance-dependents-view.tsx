'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';
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
  FieldGroup,
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
import { ConfirmDialog } from '@/features/dashboard/components/confirm-dialog';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate } from '@/features/dashboard/lib/format';
import {
  useAddDependent,
  useEndDependentRelationship,
  usePatientDependents,
} from '../hooks/use-insurance-dependents';
import {
  type AddDependentRequest,
  DEPENDENT_GENDERS,
  DEPENDENT_RELATIONSHIP_TYPES,
  type DependentResponse,
} from '../types';

export function InsuranceDependentsView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const dependentsQuery = usePatientDependents(patientId);
  const [addOpen, setAddOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<DependentResponse | null>(null);

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

  if (dependentsQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (dependentsQuery.isError) {
    return (
      <ErrorState
        message={
          dependentsQuery.error instanceof Error
            ? dependentsQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void dependentsQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const dependents = dependentsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setAddOpen(true)}>
          {t('insuranceDependents.add')}
        </Button>
      </div>

      {dependents.length === 0 ? (
        <EmptyState
          title={t('insuranceDependents.noDependentsTitle')}
          description={t('insuranceDependents.noDependentsDescription')}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('insuranceDependents.fullName')}</TableHead>
                <TableHead>{t('insuranceDependents.dateOfBirth')}</TableHead>
                <TableHead>{t('insuranceDependents.gender')}</TableHead>
                <TableHead>{t('insuranceDependents.nationalId')}</TableHead>
                <TableHead>
                  {t('insuranceDependents.relationshipType')}
                </TableHead>
                <TableHead>{t('insuranceDependents.status')}</TableHead>
                <TableHead className="text-end">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dependents.map((dependent) => (
                <TableRow key={dependent.relationshipId}>
                  <TableCell className="font-medium">
                    {dependent.fullName ?? t('common.unknown')}
                  </TableCell>
                  <TableCell>
                    {formatDate(dependent.dateOfBirth, locale)}
                  </TableCell>
                  <TableCell>
                    {t(statusKey('gender', dependent.gender))}
                  </TableCell>
                  <TableCell>
                    {dependent.nationalId ?? t('common.unknown')}
                  </TableCell>
                  <TableCell>
                    {t(statusKey('relationship', dependent.relationshipType))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dependent.isActive ? 'secondary' : 'outline'}
                    >
                      {t(statusKey('dependent', dependent.status))}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    {dependent.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEndTarget(dependent)}
                      >
                        {t('insuranceDependents.endRelationship')}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddDependentDialog
        open={addOpen}
        patientId={patientId}
        onOpenChange={setAddOpen}
      />

      <EndRelationshipDialog
        dependent={endTarget}
        patientId={patientId}
        onClose={() => setEndTarget(null)}
      />
    </div>
  );
}

function AddDependentDialog({
  open,
  patientId,
  onOpenChange,
}: {
  open: boolean;
  patientId: number | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('dashboard');
  const addDependent = useAddDependent(patientId ?? 0);

  const addDependentSchema = z.object({
    firstName: z.string().min(1, { message: t('forms.requiredField') }),
    secondName: z.string().min(1, { message: t('forms.requiredField') }),
    thirdName: z.string().min(1, { message: t('forms.requiredField') }),
    fourthName: z.string().min(1, { message: t('forms.requiredField') }),
    dateOfBirth: z.string().min(1, { message: t('forms.requiredField') }),
    gender: z.enum(DEPENDENT_GENDERS),
    relationshipType: z.enum(DEPENDENT_RELATIONSHIP_TYPES),
    nationalId: z.string().optional(),
  });

  type AddDependentFormData = z.infer<typeof addDependentSchema>;

  const form = useForm<AddDependentFormData>({
    resolver: zodResolver(addDependentSchema),
    defaultValues: {
      firstName: '',
      secondName: '',
      thirdName: '',
      fourthName: '',
      dateOfBirth: '',
      gender: 'Male',
      relationshipType: 'Spouse',
      nationalId: '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form;

  const onSubmit = (data: AddDependentFormData) => {
    const request: AddDependentRequest = {
      firstName: data.firstName,
      secondName: data.secondName,
      thirdName: data.thirdName,
      fourthName: data.fourthName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      relationshipType: data.relationshipType,
      nationalId: data.nationalId ? data.nationalId : null,
    };

    addDependent.mutate(request, {
      onSuccess: () => {
        toast.success(t('insuranceDependents.addSuccess'));
        reset();
        onOpenChange(false);
      },
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : t('insuranceDependents.addError'),
        ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('insuranceDependents.add')}</DialogTitle>
          <DialogDescription>
            {t('insuranceDependents.noDependentsDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FieldGroup>
            <FieldGroupItem label={t('profile.fullName')}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>{t('profile.firstName')}</FieldLabel>
                  <FieldContent>
                    <Input
                      {...register('firstName')}
                      placeholder={t('profile.firstName')}
                      aria-invalid={Boolean(errors.firstName)}
                    />
                  </FieldContent>
                  {errors.firstName ? (
                    <FieldError>{errors.firstName.message}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>{t('profile.secondName')}</FieldLabel>
                  <FieldContent>
                    <Input
                      {...register('secondName')}
                      placeholder={t('profile.secondName')}
                      aria-invalid={Boolean(errors.secondName)}
                    />
                  </FieldContent>
                  {errors.secondName ? (
                    <FieldError>{errors.secondName.message}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>{t('profile.thirdName')}</FieldLabel>
                  <FieldContent>
                    <Input
                      {...register('thirdName')}
                      placeholder={t('profile.thirdName')}
                      aria-invalid={Boolean(errors.thirdName)}
                    />
                  </FieldContent>
                  {errors.thirdName ? (
                    <FieldError>{errors.thirdName.message}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>{t('profile.fourthName')}</FieldLabel>
                  <FieldContent>
                    <Input
                      {...register('fourthName')}
                      placeholder={t('profile.fourthName')}
                      aria-invalid={Boolean(errors.fourthName)}
                    />
                  </FieldContent>
                  {errors.fourthName ? (
                    <FieldError>{errors.fourthName.message}</FieldError>
                  ) : null}
                </Field>
              </div>
            </FieldGroupItem>
          </FieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>{t('insuranceDependents.dateOfBirth')}</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  {...register('dateOfBirth')}
                  aria-invalid={Boolean(errors.dateOfBirth)}
                />
              </FieldContent>
              {errors.dateOfBirth ? (
                <FieldError>{errors.dateOfBirth.message}</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel>{t('insuranceDependents.gender')}</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPENDENT_GENDERS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {t(statusKey('gender', gender))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {t('insuranceDependents.relationshipType')}
              </FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="relationshipType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPENDENT_RELATIONSHIP_TYPES.map((relationship) => (
                          <SelectItem key={relationship} value={relationship}>
                            {t(statusKey('relationship', relationship))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('insuranceDependents.nationalId')}</FieldLabel>
              <FieldContent>
                <Input
                  {...register('nationalId')}
                  placeholder={t('common.unknown')}
                />
              </FieldContent>
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addDependent.isPending}
              type="button"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={addDependent.isPending}>
              {addDependent.isPending && <Spinner data-icon="inline-start" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroupItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function EndRelationshipDialog({
  dependent,
  patientId,
  onClose,
}: {
  dependent: DependentResponse | null;
  patientId: number | undefined;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard');
  const endRelationship = useEndDependentRelationship(patientId ?? 0);

  if (dependent === null) {
    return null;
  }

  const confirm = () => {
    endRelationship.mutate(dependent.relationshipId, {
      onSuccess: () => {
        toast.success(t('insuranceDependents.endSuccess'));
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
      title={t('insuranceDependents.endConfirmTitle')}
      description={t('insuranceDependents.endConfirmDescription')}
      isPending={endRelationship.isPending}
      onConfirm={confirm}
    />
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { useAuth } from '@/features/auth/hooks/use-auth';
import { statusKey } from '@/features/doctor/lib/enum-labels';
import { patientsKeys } from '@/features/patients/hooks/use-patients';
import { useCreateVisit } from '../hooks/use-visit-actions';

const VISIT_TYPES = ['Consultation', 'FollowUp', 'Emergency'] as const;

export function CreateVisitDialog({
  open,
  onOpenChange,
  patientId,
  patientFullName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  patientFullName?: string;
}) {
  const t = useTranslations('doctor');
  const { user } = useAuth();
  const createVisit = useCreateVisit();
  const queryClient = useQueryClient();

  const medicationSchema = z.object({
    medicineName: z.string().min(1, { message: t('forms.requiredField') }),
    dosage: z.string().min(1, { message: t('forms.requiredField') }),
    frequency: z.string().min(1, { message: t('forms.requiredField') }),
    duration: z.string().min(1, { message: t('forms.requiredField') }),
  });

  const visitSchema = z.object({
    visitDate: z.string().min(1, { message: t('forms.requiredField') }),
    visitType: z.enum(VISIT_TYPES, { message: t('forms.requiredField') }),
    notes: z.string().optional(),
    diagnosis: z.string().optional(),
    requiredTests: z.string().optional(),
    medications: z.array(medicationSchema),
  });

  type VisitFormData = z.infer<typeof visitSchema>;

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visitDate: '',
      visitType: 'Consultation',
      notes: '',
      diagnosis: '',
      requiredTests: '',
      medications: [],
    },
  });

  const { register, handleSubmit, control, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const onSubmit = (data: VisitFormData) => {
    if (user === null) return;

    createVisit.mutate(
      {
        patientId,
        doctorId: user.id,
        visitDate: data.visitDate,
        visitType: data.visitType,
        notes: data.notes || undefined,
        diagnosis: data.diagnosis || undefined,
        requiredTests: data.requiredTests || undefined,
        medications: data.medications.length > 0 ? data.medications : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('createVisit.success'));
          void queryClient.invalidateQueries({
            queryKey: patientsKeys.visitHistory(patientId),
          });
          onOpenChange(false);
          form.reset();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : t('createVisit.error'),
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('createVisit.title')}</DialogTitle>
          <DialogDescription>
            {t('createVisit.description')}
            {patientFullName ? ` — ${patientFullName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>{t('createVisit.visitDate')}</FieldLabel>
              <FieldContent>
                <Input type="date" {...register('visitDate')} />
                {formState.errors.visitDate ? (
                  <FieldError>{formState.errors.visitDate.message}</FieldError>
                ) : null}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('createVisit.visitType')}</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="visitType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIT_TYPES.map((visitType) => (
                          <SelectItem key={visitType} value={visitType}>
                            {t(statusKey('visitType', visitType))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
            </Field>
          </div>

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

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                {t('createVisit.medications')}
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    medicineName: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                  })
                }
              >
                {t('createVisit.addMedication')}
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('createVisit.medications')}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 rounded-lg border p-3"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <MedicationField
                        label={t('createVisit.medicineName')}
                        error={
                          formState.errors.medications?.[index]?.medicineName
                            ?.message
                        }
                        inputProps={register(
                          `medications.${index}.medicineName`,
                        )}
                      />
                      <MedicationField
                        label={t('createVisit.dosage')}
                        error={
                          formState.errors.medications?.[index]?.dosage?.message
                        }
                        inputProps={register(`medications.${index}.dosage`)}
                      />
                      <MedicationField
                        label={t('createVisit.frequency')}
                        error={
                          formState.errors.medications?.[index]?.frequency
                            ?.message
                        }
                        inputProps={register(`medications.${index}.frequency`)}
                      />
                      <MedicationField
                        label={t('createVisit.duration')}
                        error={
                          formState.errors.medications?.[index]?.duration
                            ?.message
                        }
                        inputProps={register(`medications.${index}.duration`)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => remove(index)}
                    >
                      {t('createVisit.removeMedication')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={createVisit.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createVisit.isPending}>
              {createVisit.isPending && <Spinner data-icon="inline-start" />}
              {t('createVisit.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

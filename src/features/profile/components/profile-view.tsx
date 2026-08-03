'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import { isBffError } from '@/features/app-shell/hooks/use-bff-error';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate } from '@/features/dashboard/lib/format';
import type { MaritalStatus } from '@/lib/api/enums';
import { useProfile, useUpdateProfile } from '../hooks/use-profile';
import type { UpdateProfileRequest } from '../types';

const MARITAL_STATUSES: readonly MaritalStatus[] = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
];

const profileFormSchema = z.object({
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  preferredLanguage: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

function emptyToNull(value: string | undefined): string | null {
  return value && value.trim().length > 0 ? value.trim() : null;
}

function toUpdateRequest(values: ProfileFormData): UpdateProfileRequest {
  return {
    occupation: emptyToNull(values.occupation),
    maritalStatus:
      values.maritalStatus === '' || values.maritalStatus === undefined
        ? null
        : (values.maritalStatus as MaritalStatus),
    nationality: emptyToNull(values.nationality),
    preferredLanguage: emptyToNull(values.preferredLanguage),
    emergencyContactName: emptyToNull(values.emergencyContactName),
    emergencyContactPhone: emptyToNull(values.emergencyContactPhone),
  };
}

export function ProfileView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();

  const profile = profileQuery.data;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      occupation: '',
      maritalStatus: '',
      nationality: '',
      preferredLanguage: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  // Prefill the editable fields once the profile arrives. The guard runs only
  // once so a background profile refetch (e.g. refetchOnWindowFocus) never
  // discards typed-but-unsaved input.
  const initialized = useRef(false);

  useEffect(() => {
    if (!profile || initialized.current) return;
    initialized.current = true;
    form.reset({
      occupation: profile.occupation ?? '',
      maritalStatus: profile.maritalStatus ?? '',
      nationality: profile.nationality ?? '',
      preferredLanguage: profile.preferredLanguage ?? '',
      emergencyContactName: profile.emergencyContactName ?? '',
      emergencyContactPhone: profile.emergencyContactPhone ?? '',
    });
  }, [profile, form]);

  const onSubmit = useCallback(
    async (values: ProfileFormData) => {
      try {
        await updateProfile.mutateAsync(toUpdateRequest(values));
        toast.success(t('profile.saveSuccess'));
      } catch (e) {
        if (isBffError(e) && e.status === 401) return;
        toast.error(e instanceof Error ? e.message : t('profile.saveError'));
      }
    },
    [updateProfile, t],
  );

  if (isLoading || profileQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (isError || profileQuery.isError) {
    return (
      <ErrorState
        message={error?.message ?? t('common.errors.loadFailed')}
        onRetry={() => void refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  if (patientId === undefined || profile === undefined) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-center text-sm text-muted-foreground">
            {t('profile.emptyTitle')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.editTitle')}</CardTitle>
          <CardDescription>{t('profile.readOnlyNotice')}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileField
              label={t('profile.fullName')}
              value={profile.fullName ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.nationalId')}
              value={profile.nationalId ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.username')}
              value={profile.username ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.dateOfBirth')}
              value={formatDate(profile.dateOfBirth, locale)}
            />
            <ProfileField
              label={t('profile.gender')}
              value={t(statusKey('gender', profile.gender))}
            />
            <ProfileField
              label={t('profile.mobileNumber')}
              value={profile.mobileNumber ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.governorate')}
              value={profile.governorate ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.district')}
              value={profile.district ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.email')}
              value={profile.email ?? t('common.unknown')}
            />
            <ProfileField
              label={t('profile.address')}
              value={profile.address ?? t('common.unknown')}
            />
          </dl>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.editTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field data-invalid={!!errors.occupation || undefined}>
                  <FieldLabel htmlFor="occupation">
                    {t('profile.occupation')}{' '}
                    <span className="text-muted-foreground">
                      ({t('profile.optional')})
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input id="occupation" {...register('occupation')} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!errors.maritalStatus || undefined}>
                  <FieldLabel htmlFor="maritalStatus">
                    {t('profile.maritalStatus')}{' '}
                    <span className="text-muted-foreground">
                      ({t('profile.optional')})
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="maritalStatus" className="w-full">
                            <SelectValue placeholder={t('common.unknown')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {MARITAL_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t(statusKey('maritalStatus', status))}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!errors.nationality || undefined}>
                  <FieldLabel htmlFor="nationality">
                    {t('profile.nationality')}{' '}
                    <span className="text-muted-foreground">
                      ({t('profile.optional')})
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input id="nationality" {...register('nationality')} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!errors.preferredLanguage || undefined}>
                  <FieldLabel htmlFor="preferredLanguage">
                    {t('profile.preferredLanguage')}{' '}
                    <span className="text-muted-foreground">
                      ({t('profile.optional')})
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="preferredLanguage"
                      {...register('preferredLanguage')}
                    />
                  </FieldContent>
                </Field>

                <Field
                  data-invalid={!!errors.emergencyContactName || undefined}
                >
                  <FieldLabel htmlFor="emergencyContactName">
                    {t('profile.emergencyContactName')}{' '}
                    <span className="text-muted-foreground">
                      ({t('profile.optional')})
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="emergencyContactName"
                      {...register('emergencyContactName')}
                    />
                    {errors.emergencyContactName?.message && (
                      <FieldError>
                        {errors.emergencyContactName.message}
                      </FieldError>
                    )}
                  </FieldContent>
                </Field>

                <Field
                  data-invalid={!!errors.emergencyContactPhone || undefined}
                >
                  <FieldLabel htmlFor="emergencyContactPhone">
                    {t('profile.emergencyContactPhone')}{' '}
                    <span className="text-muted-foreground">
                      ({t('profile.optional')})
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="emergencyContactPhone"
                      {...register('emergencyContactPhone')}
                    />
                    {errors.emergencyContactPhone?.message && (
                      <FieldError>
                        {errors.emergencyContactPhone.message}
                      </FieldError>
                    )}
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              size="lg"
              className="min-w-40"
              disabled={updateProfile.isPending || !isDirty}
            >
              {updateProfile.isPending && <Spinner data-icon="inline-start" />}
              {t('common.save')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

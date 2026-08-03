'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import { isBffError } from '@/features/app-shell/hooks/use-bff-error';
import { statusKey } from '@/features/doctor/lib/enum-labels';
import { formatDate } from '@/features/doctor/lib/format';
import { Link } from '@/i18n/navigation';
import { useSearchPatient } from '../hooks/use-patients';

export function PatientSearchView() {
  const t = useTranslations('doctor');
  const locale = useLocale();
  const [searchNationalId, setSearchNationalId] = useState('');
  const searchQuery = useSearchPatient(searchNationalId);

  const searchSchema = z.object({
    nationalId: z.string().regex(/^\d{14}$/, {
      message: t('forms.nationalIdInvalid'),
    }),
  });

  type SearchFormData = z.infer<typeof searchSchema>;

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { nationalId: '' },
  });

  const { register, handleSubmit, formState } = form;

  const onSubmit = (data: SearchFormData) => {
    setSearchNationalId(data.nationalId);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('patientSearch.nationalIdLabel')}</CardTitle>
          <CardDescription>{t('patientSearch.placeholder')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 sm:flex-row sm:items-start"
            noValidate
          >
            <Field className="flex-1">
              <FieldLabel className="sr-only">
                {t('patientSearch.nationalIdLabel')}
              </FieldLabel>
              <FieldContent>
                <Input
                  {...register('nationalId')}
                  inputMode="numeric"
                  maxLength={14}
                  placeholder={t('patientSearch.nationalIdLabel')}
                />
                {formState.errors.nationalId ? (
                  <FieldError>{formState.errors.nationalId.message}</FieldError>
                ) : null}
              </FieldContent>
            </Field>
            <Button type="submit">{t('patientSearch.searchButton')}</Button>
          </form>
        </CardContent>
      </Card>

      <SearchResult
        searchNationalId={searchNationalId}
        query={searchQuery}
        locale={locale}
      />
    </div>
  );
}

function SearchResult({
  searchNationalId,
  query,
  locale,
}: {
  searchNationalId: string;
  query: ReturnType<typeof useSearchPatient>;
  locale: string;
}) {
  const t = useTranslations('doctor');

  if (searchNationalId === '') {
    return (
      <p className="text-sm text-muted-foreground">
        {t('patientSearch.placeholder')}
      </p>
    );
  }

  if (query.isLoading) {
    return <LoadingRows rows={4} ariaLabel={t('common.loading')} />;
  }

  if (query.isError) {
    if (isBffError(query.error) && query.error.status === 404) {
      return (
        <EmptyState
          title={t('patientSearch.notFoundTitle')}
          description={t('patientSearch.notFoundDescription')}
        />
      );
    }
    return (
      <ErrorState
        message={query.error.message ?? t('common.errors.loadFailed')}
        onRetry={() => void query.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const patient = query.data;

  if (patient === undefined) {
    return <ErrorState message={t('common.errors.loadFailed')} />;
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PatientLine
            label={t('patientSearch.fullName')}
            value={patient.fullName ?? t('common.unknown')}
          />
          <PatientLine
            label={t('patientSearch.nationalId')}
            value={patient.nationalId ?? t('common.unknown')}
          />
          <PatientLine
            label={t('patientSearch.gender')}
            value={t(statusKey('gender', patient.gender))}
          />
          <PatientLine
            label={t('patientSearch.dateOfBirth')}
            value={formatDate(patient.dateOfBirth, locale)}
          />
          <PatientLine
            label={t('patientSearch.mobileNumber')}
            value={patient.mobileNumber ?? t('common.unknown')}
          />
        </div>
        <Button asChild className="w-fit">
          <Link href={`/doctor/patients/${patient.id}`}>
            {t('patientSearch.viewPatient')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PatientLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

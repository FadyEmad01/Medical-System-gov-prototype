'use client';

import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDateTime } from '@/features/dashboard/lib/format';
import {
  useCheckEligibility,
  useEligibility,
} from '../hooks/use-insurance-eligibility';

// Sent to the backend when a patient triggers a self check. The status field is
// the patient's current known snapshot; the backend returns the authoritative
// result.
const SELF_CHECK_REASON = 'Patient initiated check';

export function InsuranceEligibilityView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const eligibilityQuery = useEligibility(patientId);
  const checkEligibility = useCheckEligibility(patientId ?? 0);

  if (isLoading) {
    return <LoadingRows rows={4} ariaLabel={t('common.loading')} />;
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

  if (eligibilityQuery.isLoading) {
    return <LoadingRows rows={4} ariaLabel={t('common.loading')} />;
  }

  if (eligibilityQuery.isError) {
    return (
      <ErrorState
        message={
          eligibilityQuery.error instanceof Error
            ? eligibilityQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void eligibilityQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const neverChecked =
    eligibilityQuery.data === undefined || eligibilityQuery.data.neverChecked;
  const eligibility =
    eligibilityQuery.data && !eligibilityQuery.data.neverChecked
      ? eligibilityQuery.data.data
      : null;

  const handleCheck = () => {
    if (patientId === undefined) return;
    checkEligibility.mutate(
      {
        patientId,
        status: eligibility ? eligibility.status : 'PendingReview',
        reason: SELF_CHECK_REASON,
      },
      {
        onSuccess: () => toast.success(t('insuranceEligibility.checkSuccess')),
        onError: (checkError) =>
          toast.error(
            checkError instanceof Error
              ? checkError.message
              : t('insuranceEligibility.checkError'),
          ),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>{t('insuranceEligibility.checkTitle')}</CardTitle>
          <CardDescription>
            {t('insuranceEligibility.neverCheckedDescription')}
          </CardDescription>
        </div>
        <Button onClick={handleCheck} disabled={checkEligibility.isPending}>
          {checkEligibility.isPending && <Spinner data-icon="inline-start" />}
          {t('insuranceEligibility.check')}
        </Button>
      </CardHeader>
      <CardContent>
        {neverChecked || eligibility === null ? (
          <EmptyState
            title={t('insuranceEligibility.neverCheckedTitle')}
            description={t('insuranceEligibility.neverCheckedDescription')}
          />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {t(statusKey('eligibility', eligibility.status))}
              </Badge>
              <span className="text-muted-foreground">
                {formatDateTime(eligibility.checkedAt, locale)}
              </span>
            </div>
            {eligibility.reason ? (
              <EligibilityLine
                label={t('insuranceEligibility.reason')}
                value={eligibility.reason}
              />
            ) : null}
            {eligibility.remarks ? (
              <EligibilityLine
                label={t('insuranceEligibility.remarks')}
                value={eligibility.remarks}
              />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EligibilityLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

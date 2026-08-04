'use client';

import { useLocale, useTranslations } from 'next-intl';
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
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate, formatDateTime } from '@/features/dashboard/lib/format';
import { useCurrentCard } from '@/features/insurance-cards/hooks/use-insurance-cards';
import { useInsuranceStatus } from '@/features/insurance-status/hooks/use-insurance-status';
import { useLatestVerification } from '@/features/insurance-verification/hooks/use-insurance-verification';
import { usePatientVisits } from '@/features/visits/hooks/use-visits';
import { Link } from '@/i18n/navigation';

export function DashboardView() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {t('dashboard.greeting')}
          {user?.fullName ? `, ${user.fullName}` : ''}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <StatusSummarySection patientId={patientId} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CurrentCardSection patientId={patientId} />
        <LatestVerificationSection patientId={patientId} />
      </div>

      <RecentVisitsSection patientId={patientId} />
    </div>
  );
}

function StatusSummarySection({
  patientId,
}: {
  patientId: number | undefined;
}) {
  const t = useTranslations('dashboard');
  const statusQuery = useInsuranceStatus(patientId);

  if (statusQuery.isLoading) {
    return <LoadingRows rows={2} ariaLabel={t('common.loading')} />;
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <ErrorState
        message={t('common.errors.loadFailed')}
        onRetry={() => void statusQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const status = statusQuery.data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryMetric
        label={t('insuranceStatus.applicationNumber')}
        value={status.currentApplicationNumber ?? t('common.unknown')}
      />
      <SummaryMetric
        label={t('insuranceStatus.applicationStatus')}
        value={
          status.currentApplicationStatus
            ? t(statusKey('application', status.currentApplicationStatus))
            : t('common.unknown')
        }
        badge
      />
      <SummaryMetric
        label={t('insuranceStatus.eligibilityStatus')}
        value={
          status.eligibilityStatus
            ? t(statusKey('eligibility', status.eligibilityStatus))
            : t('common.unknown')
        }
        badge
      />
      <SummaryMetric
        label={t('insuranceStatus.verificationStatus')}
        value={
          status.verificationStatus
            ? t(statusKey('verification', status.verificationStatus))
            : t('common.unknown')
        }
        badge
      />
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {badge ? (
          <Badge variant="outline" className="w-fit">
            {value}
          </Badge>
        ) : (
          <span className="text-base font-semibold">{value}</span>
        )}
      </CardContent>
    </Card>
  );
}

function CurrentCardSection({ patientId }: { patientId: number | undefined }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const currentCardQuery = useCurrentCard(patientId);
  const card = currentCardQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.currentCard')}</CardTitle>
        <CardDescription>
          {t('dashboard.currentCardDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentCardQuery.isLoading ? (
          <LoadingRows rows={2} ariaLabel={t('common.loading')} />
        ) : currentCardQuery.isError ? (
          <ErrorState
            message={t('common.errors.loadFailed')}
            onRetry={() => void currentCardQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : card == null ? (
          <EmptyState
            title={t('dashboard.noCurrentCard')}
            description={t('insuranceCards.noCardsDescription')}
          />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                {card.cardNumber ?? t('common.unknown')}
              </span>
              <Badge variant={card.isCurrentlyValid ? 'secondary' : 'outline'}>
                {card.isCurrentlyValid
                  ? t('insuranceCards.valid')
                  : t('insuranceCards.expired')}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>{card.holderFullName ?? t('common.unknown')}</span>
              <span>{formatDate(card.expiresAt, locale)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LatestVerificationSection({
  patientId,
}: {
  patientId: number | undefined;
}) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const verificationQuery = useLatestVerification(patientId);
  const result = verificationQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.latestVerification')}</CardTitle>
        <CardDescription>
          {t('dashboard.latestVerificationDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verificationQuery.isLoading ? (
          <LoadingRows rows={2} ariaLabel={t('common.loading')} />
        ) : verificationQuery.isError ? (
          <ErrorState
            message={t('common.errors.loadFailed')}
            onRetry={() => void verificationQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : result === undefined || result.neverChecked ? (
          <EmptyState
            title={t('dashboard.noVerification')}
            description={t('insuranceStatus.verificationStatus')}
          />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline">
                {t(statusKey('verification', result.data.status))}
              </Badge>
              <span className="text-muted-foreground">
                {formatDateTime(result.data.verifiedAt, locale)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricLine
                label={t('dashboard.context')}
                value={t(statusKey('verificationContext', result.data.context))}
              />
              <MetricLine
                label={t('dashboard.source')}
                value={t(statusKey('verificationSource', result.data.source))}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RecentVisitsSection({ patientId }: { patientId: number | undefined }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const visitsQuery = usePatientVisits(patientId);
  const visits = visitsQuery.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>{t('dashboard.recentVisits')}</CardTitle>
          <CardDescription>
            {t('dashboard.recentVisitsDescription')}
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/visits">{t('dashboard.viewAll')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {visitsQuery.isLoading ? (
          <LoadingRows rows={3} ariaLabel={t('common.loading')} />
        ) : visitsQuery.isError ? (
          <ErrorState
            message={t('common.errors.loadFailed')}
            onRetry={() => void visitsQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : visits.length === 0 ? (
          <EmptyState
            title={t('dashboard.noRecentVisits')}
            description={t('visits.noVisitsDescription')}
          />
        ) : (
          <div className="flex flex-col divide-y">
            {visits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {t(statusKey('visit', visit.visitType))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(visit.visitDate, locale)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {visit.doctorFullName ?? t('common.unknown')}
                  </span>
                  <Badge variant="outline">
                    {t(statusKey('visit', visit.status))}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

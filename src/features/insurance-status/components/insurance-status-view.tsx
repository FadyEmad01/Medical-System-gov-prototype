'use client';

import { CheckCircle2Icon, CircleIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import { usePatientId } from '@/features/dashboard/hooks/use-patient-id';
import { statusKey } from '@/features/dashboard/lib/enum-labels';
import { formatDate } from '@/features/dashboard/lib/format';
import { useInsuranceStatus } from '../hooks/use-insurance-status';

export function InsuranceStatusView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { patientId, isLoading, isError, error, refetch } = usePatientId();
  const statusQuery = useInsuranceStatus(patientId);

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

  if (statusQuery.isLoading) {
    return <LoadingRows rows={4} ariaLabel={t('common.loading')} />;
  }

  if (statusQuery.isError) {
    return (
      <ErrorState
        message={
          statusQuery.error instanceof Error
            ? statusQuery.error.message
            : t('common.errors.loadFailed')
        }
        onRetry={() => void statusQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const status = statusQuery.data;
  if (!status) {
    return (
      <EmptyState
        title={t('common.noResults')}
        description={t('common.errors.loadFailed')}
      />
    );
  }

  const timeline = status.timeline ?? [];
  const completedStages = timeline.filter((stage) => stage.isComplete).length;
  const progressValue =
    timeline.length === 0
      ? 0
      : Math.round((completedStages / timeline.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusMetric
          label={t('insuranceStatus.applicationNumber')}
          value={status.currentApplicationNumber ?? t('common.unknown')}
        />
        <StatusMetric
          label={t('insuranceStatus.applicationStatus')}
          value={t(statusKey('application', status.currentApplicationStatus))}
          badge
        />
        <StatusMetric
          label={t('insuranceStatus.eligibilityStatus')}
          value={t(statusKey('eligibility', status.eligibilityStatus))}
          badge
        />
        <StatusMetric
          label={t('insuranceStatus.verificationStatus')}
          value={t(statusKey('verification', status.verificationStatus))}
          badge
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('insuranceStatus.timelineTitle')}</CardTitle>
          <CardDescription>
            {t('insuranceStatus.documentCount')}: {status.documentCount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <EmptyState
              title={t('insuranceStatus.noTimelineTitle')}
              description={t('insuranceStatus.noTimelineDescription')}
            />
          ) : (
            <div className="flex flex-col gap-6">
              <Progress
                value={progressValue}
                aria-label={t('insuranceStatus.timelineTitle')}
              />
              <ol className="flex flex-col gap-4">
                {timeline.map((stage, index) => {
                  const StageIcon = stage.isComplete
                    ? CheckCircle2Icon
                    : CircleIcon;
                  return (
                    <li
                      key={`${stage.stageName ?? 'stage'}-${index}`}
                      className="flex items-start gap-3"
                    >
                      <StageIcon
                        className={
                          stage.isComplete
                            ? 'mt-0.5 size-5 text-primary'
                            : 'mt-0.5 size-5 text-muted-foreground/50'
                        }
                        aria-hidden="true"
                      />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {stage.stageName ?? t('common.unknown')}
                        </span>
                        {stage.timestamp ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(stage.timestamp, locale)}
                          </span>
                        ) : null}
                      </div>
                      {stage.isComplete ? (
                        <Badge variant="secondary">
                          {t('insuranceCards.valid')}
                        </Badge>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusMetric({
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

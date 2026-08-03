'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/features/admin/lib/format';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import type {
  AuditActionCount,
  AuditTopPatient,
  AuditTopUser,
} from '@/features/audit-logs/types';
import {
  useAuditDashboard,
  useVerifyAuditChain,
} from '../hooks/use-audit-logs';

const CHART_BAR_FILL = '#00B4D8';

export function AdminDashboardView() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const dashboardQuery = useAuditDashboard();

  if (dashboardQuery.isLoading) {
    return <LoadingRows rows={6} ariaLabel={t('common.loading')} />;
  }

  if (dashboardQuery.isError || dashboardQuery.data === undefined) {
    return (
      <ErrorState
        message={t('common.errors.loadFailed')}
        onRetry={() => void dashboardQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.totalRecords')}
          value={dashboard.totalRecords.toLocaleString(locale)}
        />
        <StatCard
          label={t('dashboard.successful')}
          value={dashboard.successfulOperations.toLocaleString(locale)}
        />
        <StatCard
          label={t('dashboard.failed')}
          value={dashboard.failedOperations.toLocaleString(locale)}
        />
        <StatCard
          label={t('dashboard.critical')}
          value={dashboard.criticalEvents.toLocaleString(locale)}
        />
        <StatCard
          label={t('dashboard.actionsToday')}
          value={dashboard.actionsToday.toLocaleString(locale)}
        />
        <StatCard
          label={t('dashboard.averageExecutionTime')}
          value={
            dashboard.averageExecutionTimeMs === null
              ? '—'
              : `${dashboard.averageExecutionTimeMs.toLocaleString(locale)} ms`
          }
        />
        <StatCard
          label={t('dashboard.lastAuditTimestamp')}
          value={formatDateTime(dashboard.lastAuditTimestamp, locale)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MostCommonActionsCard actions={dashboard.mostCommonActions ?? []} />
        <VerifyChainCard />
        <TopActiveUsersCard users={dashboard.topActiveUsers ?? []} />
        <TopAccessedPatientsCard
          patients={dashboard.topAccessedPatients ?? []}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-base font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}

function MostCommonActionsCard({ actions }: { actions: AuditActionCount[] }) {
  const t = useTranslations('admin');

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.mostCommonActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title={t('dashboard.noData')} />
        </CardContent>
      </Card>
    );
  }

  const chartData = actions.map((item) => ({
    name: item.action ?? t('common.unknown'),
    count: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.mostCommonActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Recharts has no RTL API; the chart is laid out with a fixed LTR
            coordinate system so axes render correctly in both locales. */}
        <div dir="ltr" className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_BAR_FILL} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopActiveUsersCard({ users }: { users: AuditTopUser[] }) {
  const t = useTranslations('admin');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.topActiveUsers')}</CardTitle>
        <CardDescription>{t('dashboard.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <EmptyState title={t('dashboard.noData')} />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.columns.user')}</TableHead>
                  <TableHead>{t('audit.columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      {user.userName ?? t('common.unknown')}
                    </TableCell>
                    <TableCell>{user.actionCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopAccessedPatientsCard({
  patients,
}: {
  patients: AuditTopPatient[];
}) {
  const t = useTranslations('admin');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.topAccessedPatients')}</CardTitle>
        <CardDescription>{t('dashboard.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <EmptyState title={t('dashboard.noData')} />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.filters.patientId')}</TableHead>
                  <TableHead>{t('dashboard.accessCount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.patientId}>
                    <TableCell>{patient.patientId}</TableCell>
                    <TableCell>{patient.accessCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VerifyChainCard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const verifyMutation = useVerifyAuditChain();

  const handleVerify = () => {
    verifyMutation.mutate(undefined, {
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : t('common.errors.loadFailed'),
        );
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.verify')}</CardTitle>
        <CardDescription>{t('dashboard.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={handleVerify}
          disabled={verifyMutation.isPending}
          className="w-fit"
        >
          {verifyMutation.isPending && <Spinner data-icon="inline-start" />}
          {verifyMutation.isPending
            ? t('dashboard.verifying')
            : t('dashboard.verifyAction')}
        </Button>

        {verifyMutation.data === undefined ? null : verifyMutation.data
            .isValid ? (
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              {t('dashboard.verifiedValid')}
            </Badge>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Badge variant="destructive" className="w-fit">
              {t('dashboard.verifiedInvalid')}
            </Badge>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailLine
                label={t('dashboard.brokenRecord')}
                value={verifyMutation.data.brokenRecordId ?? '—'}
              />
              <DetailLine
                label={t('dashboard.brokenTimestamp')}
                value={formatDateTime(
                  verifyMutation.data.brokenTimestamp,
                  locale,
                )}
              />
              <DetailLine
                label={t('dashboard.recordsChecked')}
                value={String(verifyMutation.data.totalRecordsChecked)}
              />
              <DetailLine
                label={t('dashboard.verificationDuration')}
                value={`${verifyMutation.data.verificationDurationMs} ms`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

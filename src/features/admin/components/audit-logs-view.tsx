'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { statusKey } from '@/features/admin/lib/enum-labels';
import { formatDateTime } from '@/features/admin/lib/format';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import type { AuditLogQuery } from '@/features/audit-logs/types';
import type { AuditCategory, AuditRiskLevel } from '@/lib/api/enums';
import { useAuditLogs } from '../hooks/use-audit-logs';
import { AuditLogDetailDialog } from './audit-log-detail-dialog';

const PAGE_SIZE = 20;

const CATEGORIES: AuditCategory[] = [
  'Authentication',
  'Patient',
  'Visit',
  'Medication',
  'Attachment',
  'Assignment',
  'Administration',
  'Insurance',
];

const RISK_LEVELS: AuditRiskLevel[] = [
  'Information',
  'Low',
  'Medium',
  'High',
  'Critical',
];

const SORT_OPTIONS: ReadonlyArray<{
  value: NonNullable<AuditLogQuery['sortBy']>;
  labelKey: string;
}> = [
  { value: 'TimestampUtc', labelKey: 'audit.columns.timestamp' },
  { value: 'Action', labelKey: 'audit.columns.action' },
  { value: 'Category', labelKey: 'audit.columns.category' },
  { value: 'Success', labelKey: 'audit.columns.success' },
  { value: 'StatusCode', labelKey: 'audit.columns.statusCode' },
  { value: 'ExecutionTimeMs', labelKey: 'audit.columns.executionTime' },
];

type SuccessFilter = 'all' | 'true' | 'false';

export function AuditLogsView() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AuditLogQuery['sortBy']>('TimestampUtc');
  const [sortDescending, setSortDescending] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [success, setSuccess] = useState<SuccessFilter>('all');
  const [riskLevel, setRiskLevel] = useState<string>('all');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [visitId, setVisitId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Text/date filters settle through a short debounce so keystrokes don't
  // refetch on every change; Select filters apply immediately via applyFilter.
  const debouncedAction = useDebouncedValue(action, 300);
  const debouncedUserId = useDebouncedValue(userId, 300);
  const debouncedPatientId = useDebouncedValue(patientId, 300);
  const debouncedVisitId = useDebouncedValue(visitId, 300);
  const debouncedStartDate = useDebouncedValue(startDate, 300);
  const debouncedEndDate = useDebouncedValue(endDate, 300);

  const query: AuditLogQuery = {
    page,
    pageSize: PAGE_SIZE,
    sortBy,
    sortDescending,
    category: category === 'all' ? undefined : (category as AuditCategory),
    success: success === 'all' ? undefined : success === 'true',
    riskLevel: riskLevel === 'all' ? undefined : (riskLevel as AuditRiskLevel),
    action: debouncedAction.trim() === '' ? undefined : debouncedAction.trim(),
    userId: parseOptionalInt(debouncedUserId),
    patientId: parseOptionalInt(debouncedPatientId),
    visitId:
      debouncedVisitId.trim() === '' ? undefined : debouncedVisitId.trim(),
    startDate: debouncedStartDate === '' ? undefined : debouncedStartDate,
    endDate: debouncedEndDate === '' ? undefined : debouncedEndDate,
  };

  const logsQuery = useAuditLogs(query);
  const items = logsQuery.data?.items ?? [];
  const totalCount = logsQuery.data?.totalCount ?? 0;
  const totalPages = logsQuery.data?.totalPages ?? 1;

  // Every filter change restarts pagination so the user never sits on a page
  // that no longer exists after the result set shrinks.
  const applyFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  // Debounced filters restart pagination only when the settled value actually
  // changes (not on every keystroke), matching applyFilter's behaviour. The
  // previous-value ref skips the initial mount, where page is already 1.
  const settledFilterSignature = [
    debouncedAction.trim(),
    debouncedUserId.trim(),
    debouncedPatientId.trim(),
    debouncedVisitId.trim(),
    debouncedStartDate.trim(),
    debouncedEndDate.trim(),
  ].join('\u0000');
  const previousFilterSignatureRef = useRef(settledFilterSignature);

  useEffect(() => {
    if (previousFilterSignatureRef.current === settledFilterSignature) return;
    previousFilterSignatureRef.current = settledFilterSignature;
    setPage(1);
  }, [settledFilterSignature]);

  const toggleSortDescending = () => {
    setSortDescending((prev) => !prev);
    setPage(1);
  };

  const resetFilters = () => {
    setCategory('all');
    setSuccess('all');
    setRiskLevel('all');
    setAction('');
    setUserId('');
    setPatientId('');
    setVisitId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle>{t('audit.title')}</CardTitle>
            <CardDescription>{t('audit.subtitle')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            {t('audit.filters.clear')}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field>
              <FieldLabel>{t('audit.filters.category')}</FieldLabel>
              <FieldContent>
                <Select
                  value={category}
                  onValueChange={(value) => applyFilter(setCategory, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('audit.filters.all')}
                    </SelectItem>
                    {CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(statusKey('category', item))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.riskLevel')}</FieldLabel>
              <FieldContent>
                <Select
                  value={riskLevel}
                  onValueChange={(value) => applyFilter(setRiskLevel, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('audit.filters.all')}
                    </SelectItem>
                    {RISK_LEVELS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(statusKey('riskLevel', item))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.success')}</FieldLabel>
              <FieldContent>
                <Select
                  value={success}
                  onValueChange={(value) =>
                    applyFilter(setSuccess, value as SuccessFilter)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('audit.filters.all')}
                    </SelectItem>
                    <SelectItem value="true">
                      {t('audit.successYes')}
                    </SelectItem>
                    <SelectItem value="false">
                      {t('audit.successNo')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.action')}</FieldLabel>
              <FieldContent>
                <Input
                  value={action}
                  onChange={(event) => setAction(event.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.userId')}</FieldLabel>
              <FieldContent>
                <Input
                  inputMode="numeric"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.patientId')}</FieldLabel>
              <FieldContent>
                <Input
                  inputMode="numeric"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.visitId')}</FieldLabel>
              <FieldContent>
                <Input
                  value={visitId}
                  onChange={(event) => setVisitId(event.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.startDate')}</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t('audit.filters.endDate')}</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                {t('audit.sort.sortBy')}
              </span>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  applyFilter(setSortBy, value as AuditLogQuery['sortBy'])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={toggleSortDescending}>
              {sortDescending
                ? t('audit.sort.descending')
                : t('audit.sort.ascending')}
            </Button>
          </div>

          {logsQuery.isLoading ? (
            <LoadingRows rows={8} ariaLabel={t('common.loading')} />
          ) : logsQuery.isError ? (
            <ErrorState
              message={logsQuery.error.message ?? t('common.errors.loadFailed')}
              onRetry={() => void logsQuery.refetch()}
              retryLabel={t('common.retry')}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title={t('audit.empty.title')}
              description={t('audit.empty.description')}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('audit.columns.timestamp')}</TableHead>
                    <TableHead>{t('audit.columns.user')}</TableHead>
                    <TableHead>{t('audit.columns.role')}</TableHead>
                    <TableHead>{t('audit.columns.category')}</TableHead>
                    <TableHead>{t('audit.columns.riskLevel')}</TableHead>
                    <TableHead>{t('audit.columns.action')}</TableHead>
                    <TableHead>{t('audit.filters.patientId')}</TableHead>
                    <TableHead>{t('audit.filters.visitId')}</TableHead>
                    <TableHead>{t('audit.columns.success')}</TableHead>
                    <TableHead>{t('audit.columns.statusCode')}</TableHead>
                    <TableHead>{t('audit.columns.executionTime')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.auditId}
                      className="cursor-pointer"
                      tabIndex={0}
                      onClick={() => setSelectedAuditId(item.auditId)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        setSelectedAuditId(item.auditId);
                      }}
                    >
                      <TableCell>
                        {formatDateTime(item.timestampUtc, locale)}
                      </TableCell>
                      <TableCell>
                        {item.userName ?? t('common.unknown')}
                      </TableCell>
                      <TableCell>{item.role ?? t('common.unknown')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(statusKey('category', item.category))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(statusKey('riskLevel', item.riskLevel))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.action ?? t('common.unknown')}
                      </TableCell>
                      <TableCell>
                        {item.patientId === null ? '—' : String(item.patientId)}
                      </TableCell>
                      <TableCell>
                        {item.visitId ?? t('common.unknown')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.success ? 'secondary' : 'destructive'}
                        >
                          {item.success
                            ? t('audit.successYes')
                            : t('audit.successNo')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.statusCode === null
                          ? '—'
                          : String(item.statusCode)}
                      </TableCell>
                      <TableCell>
                        {item.executionTimeMs === null
                          ? '—'
                          : `${item.executionTimeMs} ms`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('audit.pagination.pageInfo', {
                current: page,
                total: totalPages,
              })}
              {' · '}
              {t('audit.pagination.totalRecords', { count: totalCount })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || logsQuery.isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                {t('audit.pagination.prev')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || logsQuery.isLoading}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                {t('audit.pagination.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuditLogDetailDialog
        auditId={selectedAuditId}
        onOpenChange={(open) => {
          if (!open) setSelectedAuditId(null);
        }}
      />
    </div>
  );
}

function parseOptionalInt(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}

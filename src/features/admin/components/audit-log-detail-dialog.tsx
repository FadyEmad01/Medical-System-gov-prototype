'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { statusKey } from '@/features/admin/lib/enum-labels';
import { formatDateTime } from '@/features/admin/lib/format';
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/features/app-shell/components/states';
import type { AuditLogDetail } from '@/features/audit-logs/types';
import { useAuditLog } from '../hooks/use-audit-logs';

export function AuditLogDetailDialog({
  auditId,
  onOpenChange,
}: {
  auditId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('admin');
  const [currentId, setCurrentId] = useState<string | null>(auditId);

  // The dialog can navigate to the previous/next record in the chain via
  // local state; syncing from the prop keeps it in lockstep with the parent.
  useEffect(() => {
    setCurrentId(auditId);
  }, [auditId]);

  const detailQuery = useAuditLog(currentId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={currentId !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('audit.detail.title')}</DialogTitle>
          <DialogDescription>
            {currentId ?? t('common.unknown')}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? (
          <LoadingRows rows={4} ariaLabel={t('common.loading')} />
        ) : detailQuery.isError ? (
          <ErrorState
            message={detailQuery.error.message ?? t('common.errors.loadFailed')}
            onRetry={() => void detailQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : detailQuery.data === undefined ? (
          <EmptyState title={t('audit.empty.title')} />
        ) : (
          <AuditLogDetailContent
            detail={detailQuery.data}
            onNavigate={setCurrentId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuditLogDetailContent({
  detail,
  onNavigate,
}: {
  detail: AuditLogDetail;
  onNavigate: (id: string) => void;
}) {
  const t = useTranslations('admin');
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{t('audit.detail.overview')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailLine
            label={t('audit.columns.timestamp')}
            value={formatDateTime(detail.timestampUtc, locale)}
          />
          <DetailLine
            label={t('audit.columns.user')}
            value={detail.userName ?? t('common.unknown')}
          />
          <DetailLine
            label={t('audit.columns.role')}
            value={detail.role ?? t('common.unknown')}
          />
          <DetailLine
            label={t('audit.columns.action')}
            value={detail.action ?? t('common.unknown')}
          />
          <DetailLine
            label={t('audit.columns.category')}
            value={t(statusKey('category', detail.category))}
          />
          <DetailLine
            label={t('audit.columns.riskLevel')}
            value={t(statusKey('riskLevel', detail.riskLevel))}
          />
          <DetailLine
            label={t('audit.columns.success')}
            value={
              detail.success ? t('audit.successYes') : t('audit.successNo')
            }
          />
          <DetailLine
            label={t('audit.columns.statusCode')}
            value={detail.statusCode === null ? '—' : String(detail.statusCode)}
          />
          <DetailLine
            label={t('audit.columns.executionTime')}
            value={
              detail.executionTimeMs === null
                ? '—'
                : `${detail.executionTimeMs} ms`
            }
          />
          <DetailLine
            label={t('audit.filters.patientId')}
            value={detail.patientId === null ? '—' : String(detail.patientId)}
          />
          <DetailLine
            label={t('audit.filters.visitId')}
            value={detail.visitId ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.description')}
            value={detail.description ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.resourceType')}
            value={detail.resourceType ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.resourceId')}
            value={detail.resourceId ?? '—'}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">
          {t('audit.detail.requestInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailLine
            label={t('audit.detail.requestPath')}
            value={detail.requestPath ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.httpMethod')}
            value={detail.httpMethod ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.ipAddress')}
            value={detail.ipAddress ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.userAgent')}
            value={detail.userAgent ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.browser')}
            value={joinVersion(detail.browser, detail.browserVersion)}
          />
          <DetailLine
            label={t('audit.detail.operatingSystem')}
            value={joinVersion(
              detail.operatingSystem,
              detail.operatingSystemVersion,
            )}
          />
          <DetailLine
            label={t('audit.detail.deviceType')}
            value={t(statusKey('deviceType', detail.deviceType))}
          />
          <DetailLine
            label={t('audit.detail.platform')}
            value={t(statusKey('platform', detail.platform))}
          />
          <DetailLine
            label={t('audit.detail.correlationId')}
            value={detail.correlationId ?? '—'}
          />
          <DetailLine
            label={t('audit.detail.sessionId')}
            value={detail.sessionId ?? '—'}
          />
        </div>
      </section>

      {detail.oldValuesJson ? (
        <JsonBlock
          title={t('audit.detail.oldValues')}
          raw={detail.oldValuesJson}
        />
      ) : null}
      {detail.newValuesJson ? (
        <JsonBlock
          title={t('audit.detail.newValues')}
          raw={detail.newValuesJson}
        />
      ) : null}
      {detail.additionalDataJson ? (
        <JsonBlock
          title={t('audit.detail.additionalData')}
          raw={detail.additionalDataJson}
        />
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{t('audit.detail.hashes')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailLine
            label={t('audit.detail.previousHash')}
            value={detail.previousHash ?? '—'}
            mono
          />
          <DetailLine
            label={t('audit.detail.currentHash')}
            value={detail.currentHash ?? '—'}
            mono
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{t('audit.detail.chain')}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!detail.previousAuditId}
            onClick={() => {
              if (detail.previousAuditId) onNavigate(detail.previousAuditId);
            }}
          >
            {t('audit.detail.previousRecord')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!detail.nextAuditId}
            onClick={() => {
              if (detail.nextAuditId) onNavigate(detail.nextAuditId);
            }}
          >
            {t('audit.detail.nextRecord')}
          </Button>
        </div>
      </section>
    </div>
  );
}

function JsonBlock({ title, raw }: { title: string; raw: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs">
        {prettyJson(raw)}
      </pre>
    </section>
  );
}

function DetailLine({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={mono ? 'break-all font-mono font-medium' : 'font-medium'}
      >
        {value}
      </span>
    </div>
  );
}

function joinVersion(name: string | null, version: string | null): string {
  return [name, version].filter(Boolean).join(' ') || '—';
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

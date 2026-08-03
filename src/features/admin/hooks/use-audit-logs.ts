'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import type {
  AuditChainVerificationResult,
  AuditDashboard,
  AuditLogDetail,
  AuditLogListItem,
  AuditLogQuery,
} from '@/features/audit-logs/types';
import type { PagedResultDto } from '@/lib/api/shared';
import { bffFetch } from '@/lib/bff';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/audit-logs/api/* exactly.
export const AUDIT_PATH = '/api/audit';

export const auditKeys = {
  all: ['audit'] as const,
  list: (q: AuditLogQuery) =>
    [
      ...auditKeys.all,
      'list',
      q.page,
      q.pageSize,
      q.sortBy,
      q.sortDescending,
      q.category,
      q.success,
      q.riskLevel,
      q.failureReason,
      q.action,
      q.userId,
      q.patientId,
      q.visitId,
      q.startDate,
      q.endDate,
    ] as const,
  detail: (id: string) => [...auditKeys.all, 'detail', id] as const,
  // auditKeys.all is exactly ['audit']; the eager spread below would hit the
  // temporal dead zone, so the literal form is used instead.
  dashboard: ['audit', 'dashboard'] as const,
};

export function useAuditLogs(query: AuditLogQuery) {
  const result = useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () =>
      bffFetch<PagedResultDto<AuditLogListItem>>(AUDIT_PATH, { query }),
  });

  useBffQueryError(result);

  return result;
}

export function useAuditLog(id: string | null) {
  const result = useQuery({
    queryKey: auditKeys.detail(id ?? ''),
    queryFn: () => bffFetch<AuditLogDetail>(`${AUDIT_PATH}/${id}`),
    enabled: id !== null,
  });

  useBffQueryError(result);

  return result;
}

export function useAuditDashboard() {
  const result = useQuery({
    queryKey: auditKeys.dashboard,
    queryFn: () => bffFetch<AuditDashboard>(`${AUDIT_PATH}/dashboard`),
  });

  useBffQueryError(result);

  return result;
}

export function useVerifyAuditChain() {
  const handleError = useBffError();

  return useMutation({
    mutationFn: () =>
      bffFetch<AuditChainVerificationResult>(`${AUDIT_PATH}/verify`),
    onError: handleError,
  });
}

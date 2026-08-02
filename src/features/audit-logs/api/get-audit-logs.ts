import type { PagedResultDto } from '@/lib/api/shared';
import { http } from '@/lib/http';
import type { AuditLogListItem, AuditLogQuery } from '../types';

export async function getAuditLogs(
  query: AuditLogQuery,
  token: string,
): Promise<PagedResultDto<AuditLogListItem>> {
  return http<PagedResultDto<AuditLogListItem>>('/api/audit', {
    method: 'GET',
    query,
    token,
  });
}

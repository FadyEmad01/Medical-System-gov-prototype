import { http } from '@/lib/http';
import type { AuditLogDetail } from '../types';

export async function getAuditLog(
  id: string,
  token: string,
): Promise<AuditLogDetail> {
  return http<AuditLogDetail>(`/api/audit/${id}`, {
    method: 'GET',
    token,
  });
}

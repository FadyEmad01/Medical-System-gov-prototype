import { http } from '@/lib/http';
import type { AuditDashboard } from '../types';

export async function getAuditDashboard(
  token: string,
): Promise<AuditDashboard> {
  return http<AuditDashboard>('/api/audit/dashboard', {
    method: 'GET',
    token,
  });
}

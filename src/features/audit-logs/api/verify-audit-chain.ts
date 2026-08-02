import { http } from '@/lib/http';
import type { AuditChainVerificationResult } from '../types';

export async function verifyAuditChain(
  token: string,
): Promise<AuditChainVerificationResult> {
  return http<AuditChainVerificationResult>('/api/audit/verify', {
    method: 'GET',
    token,
  });
}

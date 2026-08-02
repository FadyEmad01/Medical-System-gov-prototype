import { http } from '@/lib/http';
import type { CardVerificationResult, VerifyCardRequest } from '../types';

export async function verifyCard(
  data: VerifyCardRequest,
  token: string,
): Promise<CardVerificationResult> {
  return http<CardVerificationResult>('/api/insurance/cards/verify', {
    method: 'POST',
    body: data,
    token,
  });
}

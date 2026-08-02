import { http } from '@/lib/http';
import type { InsuranceVerificationResponse } from '../types';

export async function getLatestVerification(
  patientId: number,
  token: string,
): Promise<InsuranceVerificationResponse> {
  return http<InsuranceVerificationResponse>(
    `/api/insurance/verification/${patientId}/latest`,
    {
      method: 'GET',
      token,
    },
  );
}

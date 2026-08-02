import { http } from '@/lib/http';
import type { InsuranceVerificationResponse } from '../types';

export async function getCurrentVerification(
  patientId: number,
  token: string,
): Promise<InsuranceVerificationResponse> {
  return http<InsuranceVerificationResponse>(
    `/api/insurance/verification/current/${patientId}`,
    {
      method: 'GET',
      token,
    },
  );
}

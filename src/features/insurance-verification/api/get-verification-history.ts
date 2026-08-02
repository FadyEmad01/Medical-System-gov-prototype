import { http } from '@/lib/http';
import type { InsuranceVerificationResponse } from '../types';

export async function getVerificationHistory(
  patientId: number,
  token: string,
): Promise<InsuranceVerificationResponse[]> {
  return http<InsuranceVerificationResponse[]>(
    `/api/insurance/verification/${patientId}/history`,
    {
      method: 'GET',
      token,
    },
  );
}

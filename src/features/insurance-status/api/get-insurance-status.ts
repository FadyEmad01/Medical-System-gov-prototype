import { http } from '@/lib/http';
import type { InsuranceStatusResponse } from '../types';

export async function getInsuranceStatus(
  patientId: number,
  token: string,
): Promise<InsuranceStatusResponse> {
  return http<InsuranceStatusResponse>(`/api/insurance/status/${patientId}`, {
    method: 'GET',
    token,
  });
}

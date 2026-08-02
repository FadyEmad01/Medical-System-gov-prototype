import { http } from '@/lib/http';
import type { InsuranceEligibilityResponse } from '../types';

export async function getEligibility(
  patientId: number,
  token: string,
): Promise<InsuranceEligibilityResponse> {
  return http<InsuranceEligibilityResponse>(
    `/api/insurance/eligibility/${patientId}`,
    {
      method: 'GET',
      token,
    },
  );
}

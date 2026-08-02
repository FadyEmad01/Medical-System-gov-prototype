import { http } from '@/lib/http';
import type {
  CheckEligibilityRequest,
  InsuranceEligibilityResponse,
} from '../types';

export async function checkEligibility(
  data: CheckEligibilityRequest,
  token: string,
): Promise<InsuranceEligibilityResponse> {
  return http<InsuranceEligibilityResponse>(
    '/api/insurance/eligibility/check',
    {
      method: 'POST',
      body: data,
      token,
    },
  );
}

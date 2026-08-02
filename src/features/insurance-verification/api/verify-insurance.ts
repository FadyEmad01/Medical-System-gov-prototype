import { http } from '@/lib/http';
import type {
  InsuranceVerificationResponse,
  VerifyInsuranceRequest,
} from '../types';

export async function verifyInsurance(
  data: VerifyInsuranceRequest,
  token: string,
): Promise<InsuranceVerificationResponse> {
  return http<InsuranceVerificationResponse>(
    '/api/insurance/verification/verify',
    {
      method: 'POST',
      body: data,
      token,
    },
  );
}

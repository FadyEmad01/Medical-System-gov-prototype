import { http } from '@/lib/http';
import type { ApplicationResponse } from '../types';

export async function submitApplication(
  applicationId: string,
  token: string,
): Promise<ApplicationResponse> {
  return http<ApplicationResponse>(
    `/api/insurance/applications/${applicationId}/submit`,
    {
      method: 'PATCH',
      token,
    },
  );
}

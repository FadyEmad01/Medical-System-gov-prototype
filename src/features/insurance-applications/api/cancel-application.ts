import { http } from '@/lib/http';
import type { ApplicationResponse } from '../types';

export async function cancelApplication(
  applicationId: string,
  token: string,
): Promise<ApplicationResponse> {
  return http<ApplicationResponse>(
    `/api/insurance/applications/${applicationId}/cancel`,
    {
      method: 'PATCH',
      token,
    },
  );
}

import { http } from '@/lib/http';
import type { ApplicationResponse, ReviewApplicationRequest } from '../types';

export async function reviewApplication(
  applicationId: string,
  data: ReviewApplicationRequest,
  token: string,
): Promise<ApplicationResponse> {
  return http<ApplicationResponse>(
    `/api/insurance/applications/${applicationId}/review`,
    {
      method: 'PATCH',
      body: data,
      token,
    },
  );
}

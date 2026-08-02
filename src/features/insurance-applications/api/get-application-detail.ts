import { http } from '@/lib/http';
import type { ApplicationDetailResponse } from '../types';

export async function getApplicationDetail(
  applicationId: string,
  token: string,
): Promise<ApplicationDetailResponse> {
  return http<ApplicationDetailResponse>(
    `/api/insurance/applications/detail/${applicationId}`,
    {
      method: 'GET',
      token,
    },
  );
}

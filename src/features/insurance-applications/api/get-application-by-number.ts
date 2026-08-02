import { http } from '@/lib/http';
import type { ApplicationDetailResponse } from '../types';

export async function getApplicationByNumber(
  applicationNumber: string,
  token: string,
): Promise<ApplicationDetailResponse> {
  return http<ApplicationDetailResponse>(
    `/api/insurance/applications/by-number/${applicationNumber}`,
    {
      method: 'GET',
      token,
    },
  );
}

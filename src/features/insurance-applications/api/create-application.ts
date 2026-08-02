import { http } from '@/lib/http';
import type { ApplicationResponse } from '../types';

export async function createApplication(
  token: string,
): Promise<ApplicationResponse> {
  return http<ApplicationResponse>('/api/insurance/applications', {
    method: 'POST',
    token,
  });
}

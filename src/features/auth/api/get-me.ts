import { http } from '@/lib/http';
import type { MeResponse } from '../types';

export async function getCurrentUser(token: string): Promise<MeResponse> {
  return http<MeResponse>('/api/auth/me', {
    method: 'GET',
    token,
  });
}

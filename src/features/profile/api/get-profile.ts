import { http } from '@/lib/http';
import type { ProfileResponse } from '../types';

export async function getProfile(token: string): Promise<ProfileResponse> {
  return http<ProfileResponse>('/api/profile', {
    method: 'GET',
    token,
  });
}

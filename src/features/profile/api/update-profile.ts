import { http } from '@/lib/http';
import type { ProfileResponse, UpdateProfileRequest } from '../types';

export async function updateProfile(
  data: UpdateProfileRequest,
  token: string,
): Promise<ProfileResponse> {
  return http<ProfileResponse>('/api/profile', {
    method: 'PUT',
    body: data,
    token,
  });
}

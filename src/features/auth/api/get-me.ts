import { http } from '@/lib/http';

interface MeResponse {
  userId: number;
  nationalId: string;
  username: string;
  fullName: string;
  role: string;
}

export async function getCurrentUser(
  token: string,
): Promise<MeResponse> {
  return http<MeResponse>('/api/auth/me', {
    method: 'GET',
    token,
  });
}

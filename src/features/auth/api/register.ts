import { http } from '@/lib/http';
import type { AuthResponse, RegisterRequest } from '../types';

export async function registerUser(
  data: RegisterRequest,
): Promise<AuthResponse> {
  return http<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: data,
  });
}

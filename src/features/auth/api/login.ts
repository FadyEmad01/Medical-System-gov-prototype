import { http } from '@/lib/http';
import type { LoginRequest, AuthResponse } from '../types';

export async function loginUser(
  data: LoginRequest,
): Promise<AuthResponse> {
  return http<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  });
}

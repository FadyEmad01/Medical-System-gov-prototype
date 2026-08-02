import { http } from '@/lib/http';
import type { AuthResponse, LoginRequest } from '../types';

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  return http<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  });
}

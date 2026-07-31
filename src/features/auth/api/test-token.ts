import { http } from '@/lib/http';
import type { AuthResponse } from '../types';

/**
 * Dev-only: returns a valid token for a given NationalId.
 * Returns 404 Not Found outside Development/Staging environments.
 * Intended to speed up manual testing via Swagger.
 */
export async function verifyToken(nationalId: string): Promise<AuthResponse> {
  return http<AuthResponse>('/api/auth/test-token', {
    method: 'POST',
    body: { nationalId },
  });
}

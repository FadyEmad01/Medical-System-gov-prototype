import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyToken } from './test-token';
import type { AuthResponse } from '../types';

const mockHttp = vi.hoisted(() => vi.fn());

vi.mock('@/lib/http', () => ({
  http: mockHttp,
  HttpError: class HttpError extends Error {
    constructor(
      public status: number,
      message: string,
      public body?: unknown,
    ) {
      super(message);
      this.name = 'HttpError';
    }
  },
}));

describe('verifyToken (dev-only)', () => {
  const mockResponse: AuthResponse = {
    token: 'dev-jwt-token',
    expiresAtUtc: '2026-08-06T00:00:00Z',
    userId: 1,
    nationalId: '05376658493657',
    username: 'devuser',
    fullName: 'Dev User',
    role: 'Patient',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with POST and nationalId in body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await verifyToken('05376658493657');

    expect(mockHttp).toHaveBeenCalledWith('/api/auth/test-token', {
      method: 'POST',
      body: { nationalId: '05376658493657' },
    });
    expect(result).toEqual(mockResponse);
  });

  it('returns AuthResponse with valid token for dev use', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await verifyToken('05376658493657');

    expect(result.token).toBe('dev-jwt-token');
    expect(result.role).toBe('Patient');
  });
});

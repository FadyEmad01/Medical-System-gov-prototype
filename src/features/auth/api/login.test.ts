import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthResponse, LoginRequest } from '../types';
import { loginUser } from './login';

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

describe('loginUser', () => {
  const mockResponse: AuthResponse = {
    token: 'jwt-token',
    expiresAtUtc: '2026-08-06T00:00:00Z',
    userId: 1,
    nationalId: '05376658493657',
    username: 'testuser',
    fullName: 'Test User',
    role: 'Patient',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const credentials: LoginRequest = {
      nationalId: '05376658493657',
      password: 'secret123',
    };

    const result = await loginUser(credentials);

    expect(mockHttp).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      loginUser({ nationalId: '123', password: 'pw' }),
    ).rejects.toThrow('Network error');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser } from './get-me';

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

describe('getCurrentUser', () => {
  const mockMeResponse = {
    userId: 1,
    nationalId: '05376658493657',
    username: 'testuser',
    fullName: 'Test User',
    role: 'Patient',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with GET method and Bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockMeResponse);

    const result = await getCurrentUser('valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/auth/me', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockMeResponse);
  });

  it('propagates errors when token is invalid', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(getCurrentUser('invalid-token')).rejects.toThrow(
      'Unauthorized',
    );
  });
});

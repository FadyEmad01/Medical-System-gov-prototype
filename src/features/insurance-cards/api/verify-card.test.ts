import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardVerificationResult, VerifyCardRequest } from '../types';
import { verifyCard } from './verify-card';

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

describe('verifyCard', () => {
  const token = 'valid-jwt-token';
  const mockResponse: CardVerificationResult = {
    cardNumber: 'INS-2026-00000015',
    holderFullName: 'Test Patient',
    isCurrentlyValid: true,
    expiresAt: '2027-08-02T10:00:00Z',
    status: 'Active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: VerifyCardRequest = {
      verificationToken: '22222222-2222-4222-8222-222222222222',
    };

    const result = await verifyCard(data, token);

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/cards/verify', {
      method: 'POST',
      body: data,
      token,
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      verifyCard(
        { verificationToken: '22222222-2222-4222-8222-222222222222' },
        token,
      ),
    ).rejects.toThrow('Forbidden');
  });
});

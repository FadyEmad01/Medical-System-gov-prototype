import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InsuranceVerificationResponse } from '../types';
import { getCurrentVerification } from './get-current-verification';

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

describe('getCurrentVerification', () => {
  const mockResponse: InsuranceVerificationResponse = {
    id: 'b0e2a1d4-0000-4000-8000-000000000001',
    patientId: 1,
    patientFullName: 'Test Patient',
    patientNationalId: '05376658493657',
    status: 'Verified',
    context: 'CheckIn',
    source: 'Manual',
    reason: 'National id matches',
    remarks: null,
    verifiedAt: '2026-08-02T10:00:00Z',
    expiresAt: '2026-08-02T11:00:00Z',
    verifiedBy: 2,
    correlationId: 'c0e2a1d4-0000-4000-8000-000000000001',
    isCurrentlyValid: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getCurrentVerification(1, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/insurance/verification/current/1',
      {
        method: 'GET',
        token: 'valid-jwt-token',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Not Found'));

    await expect(
      getCurrentVerification(999, 'valid-jwt-token'),
    ).rejects.toThrow('Not Found');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  InsuranceVerificationResponse,
  VerifyInsuranceRequest,
} from '../types';
import { verifyInsurance } from './verify-insurance';

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

describe('verifyInsurance', () => {
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

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const request: VerifyInsuranceRequest = {
      patientId: 1,
      status: 'Verified',
      context: 'CheckIn',
      reason: 'National id matches',
    };

    const result = await verifyInsurance(request, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/insurance/verification/verify',
      {
        method: 'POST',
        body: request,
        token: 'valid-jwt-token',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      verifyInsurance(
        {
          patientId: 1,
          status: 'Verified',
          context: 'CheckIn',
          reason: 'test',
        },
        'invalid-token',
      ),
    ).rejects.toThrow('Forbidden');
  });
});

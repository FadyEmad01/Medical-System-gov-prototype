import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CheckEligibilityRequest,
  InsuranceEligibilityResponse,
} from '../types';
import { checkEligibility } from './check-eligibility';

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

describe('checkEligibility', () => {
  const mockResponse: InsuranceEligibilityResponse = {
    id: 'b0e2a1d4-0000-4000-8000-000000000001',
    patientId: 1,
    patientFullName: 'Test Patient',
    patientNationalId: '05376658493657',
    status: 'Eligible',
    reason: 'All documents valid',
    checkedAt: '2026-08-02T10:00:00Z',
    checkedBy: 2,
    remarks: null,
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const request: CheckEligibilityRequest = {
      patientId: 1,
      status: 'Eligible',
      reason: 'All documents valid',
    };

    const result = await checkEligibility(request, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/eligibility/check', {
      method: 'POST',
      body: request,
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      checkEligibility(
        { patientId: 1, status: 'Eligible', reason: 'test' },
        'invalid-token',
      ),
    ).rejects.toThrow('Forbidden');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InsuranceEligibilityResponse } from '../types';
import { getEligibility } from './get-eligibility';

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

describe('getEligibility', () => {
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

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getEligibility(1, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/eligibility/1', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Not Found'));

    await expect(getEligibility(999, 'valid-jwt-token')).rejects.toThrow(
      'Not Found',
    );
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InsuranceStatusResponse } from '../types';
import { getInsuranceStatus } from './get-insurance-status';

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

describe('getInsuranceStatus', () => {
  const mockResponse: InsuranceStatusResponse = {
    patientId: 1,
    currentApplicationNumber: 'APP-2026-00000015',
    currentApplicationId: 'b0e2a1d4-0000-4000-8000-000000000001',
    currentApplicationStatus: 'UnderReview',
    timeline: [
      {
        stageName: 'Application Submitted',
        isComplete: true,
        timestamp: '2026-08-01T09:00:00Z',
      },
      {
        stageName: 'Documents Verified',
        isComplete: false,
        timestamp: null,
      },
    ],
    eligibilityStatus: 'PendingReview',
    verificationStatus: 'Pending',
    documentCount: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getInsuranceStatus(1, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/status/1', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Not Found'));

    await expect(getInsuranceStatus(999, 'valid-jwt-token')).rejects.toThrow(
      'Not Found',
    );
  });
});

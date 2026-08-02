import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApplicationDetailResponse } from '../types';
import { getApplicationByNumber } from './get-application-by-number';

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

describe('getApplicationByNumber', () => {
  const token = 'valid-jwt-token';
  const applicationNumber = 'APP-2026-00000015';
  const mockResponse: ApplicationDetailResponse = {
    applicationNumber,
    id: '11111111-1111-4111-8111-111111111111',
    patientId: 1,
    status: 'Approved',
    submissionChannel: 'WebPortal',
    submittedAt: '2026-08-02T10:00:00Z',
    reviewedBy: 2,
    reviewedAt: '2026-08-02T11:00:00Z',
    decisionReason: 'All documents verified',
    eligibilityStatusSnapshot: 'Eligible',
    verificationStatusSnapshot: 'Verified',
    documentCount: 1,
    dependentCount: 0,
    createdAt: '2026-08-02T10:00:00Z',
    correlationId: '11111111-1111-4111-8111-111111111112',
    reviewHistory: [
      {
        id: '11111111-1111-4111-8111-111111111113',
        previousStatus: 'UnderReview',
        newStatus: 'Approved',
        reviewOutcome: 'Approved',
        reviewedBy: 2,
        reviewedAt: '2026-08-02T11:00:00Z',
        citizenVisibleReason: 'All documents verified',
        internalNotes: 'Everything looks good',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getApplicationByNumber(applicationNumber, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/applications/by-number/${applicationNumber}`,
      {
        method: 'GET',
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      getApplicationByNumber(applicationNumber, token),
    ).rejects.toThrow('Forbidden');
  });
});

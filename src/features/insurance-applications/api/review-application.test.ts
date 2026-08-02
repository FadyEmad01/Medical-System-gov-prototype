import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApplicationResponse, ReviewApplicationRequest } from '../types';
import { reviewApplication } from './review-application';

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

describe('reviewApplication', () => {
  const token = 'valid-jwt-token';
  const applicationId = '11111111-1111-4111-8111-111111111111';
  const mockResponse: ApplicationResponse = {
    applicationNumber: 'APP-2026-00000015',
    id: applicationId,
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: ReviewApplicationRequest = {
      newStatus: 'Approved',
      citizenVisibleReason: 'All documents verified',
      internalNotes: 'Everything looks good',
    };

    const result = await reviewApplication(applicationId, data, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/applications/${applicationId}/review`,
      {
        method: 'PATCH',
        body: data,
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      reviewApplication(applicationId, { newStatus: 'Approved' }, token),
    ).rejects.toThrow('Forbidden');
  });
});

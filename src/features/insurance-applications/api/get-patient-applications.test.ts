import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApplicationResponse } from '../types';
import { getPatientApplications } from './get-patient-applications';

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

describe('getPatientApplications', () => {
  const token = 'valid-jwt-token';
  const patientId = 1;
  const mockResponse: ApplicationResponse[] = [
    {
      applicationNumber: 'APP-2026-00000015',
      id: '11111111-1111-4111-8111-111111111111',
      patientId,
      status: 'Submitted',
      submissionChannel: 'WebPortal',
      submittedAt: '2026-08-02T10:00:00Z',
      reviewedBy: null,
      reviewedAt: null,
      decisionReason: null,
      eligibilityStatusSnapshot: 'PendingReview',
      verificationStatusSnapshot: 'Pending',
      documentCount: 0,
      dependentCount: 0,
      createdAt: '2026-08-02T10:00:00Z',
      correlationId: '11111111-1111-4111-8111-111111111112',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getPatientApplications(patientId, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/applications/${patientId}`,
      {
        method: 'GET',
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(getPatientApplications(patientId, token)).rejects.toThrow(
      'Forbidden',
    );
  });
});

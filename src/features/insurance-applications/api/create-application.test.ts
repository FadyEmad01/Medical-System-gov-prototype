import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApplicationResponse } from '../types';
import { createApplication } from './create-application';

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

describe('createApplication', () => {
  const token = 'valid-jwt-token';
  const mockResponse: ApplicationResponse = {
    applicationNumber: null,
    id: '11111111-1111-4111-8111-111111111111',
    patientId: 1,
    status: 'Draft',
    submissionChannel: 'WebPortal',
    submittedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    decisionReason: null,
    eligibilityStatusSnapshot: 'PendingReview',
    verificationStatusSnapshot: 'Pending',
    documentCount: 0,
    dependentCount: 0,
    createdAt: '2026-08-02T10:00:00Z',
    correlationId: '11111111-1111-4111-8111-111111111112',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await createApplication(token);

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/applications', {
      method: 'POST',
      token,
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(createApplication(token)).rejects.toThrow('Forbidden');
  });
});

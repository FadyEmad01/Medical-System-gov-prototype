import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DependentResponse } from '../types';
import { endDependentRelationship } from './end-dependent-relationship';

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

describe('endDependentRelationship', () => {
  const token = 'valid-jwt-token';
  const relationshipId = '11111111-1111-4111-8111-111111111112';
  const mockResponse: DependentResponse = {
    dependentPersonId: '11111111-1111-4111-8111-111111111111',
    fullName: 'Child Dependent',
    dateOfBirth: '2015-05-10',
    gender: 'Female',
    nationalId: null,
    status: 'Active',
    relationshipId,
    relationshipType: 'Child',
    isPrimarySponsor: false,
    startedAt: '2026-08-02T10:00:00Z',
    endedAt: '2026-08-02T12:00:00Z',
    isActive: false,
    correlationId: '11111111-1111-4111-8111-111111111113',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await endDependentRelationship(relationshipId, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/dependents/${relationshipId}/end`,
      {
        method: 'PATCH',
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      endDependentRelationship(relationshipId, token),
    ).rejects.toThrow('Forbidden');
  });
});

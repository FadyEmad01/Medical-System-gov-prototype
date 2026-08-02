import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DependentResponse } from '../types';
import { getPatientDependents } from './get-patient-dependents';

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

describe('getPatientDependents', () => {
  const token = 'valid-jwt-token';
  const patientId = 1;
  const mockResponse: DependentResponse[] = [
    {
      dependentPersonId: '11111111-1111-4111-8111-111111111111',
      fullName: 'Child Dependent',
      dateOfBirth: '2015-05-10',
      gender: 'Female',
      nationalId: null,
      status: 'Active',
      relationshipId: '11111111-1111-4111-8111-111111111112',
      relationshipType: 'Child',
      isPrimarySponsor: false,
      startedAt: '2026-08-02T10:00:00Z',
      endedAt: null,
      isActive: true,
      correlationId: '11111111-1111-4111-8111-111111111113',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getPatientDependents(patientId, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/dependents/${patientId}`,
      {
        method: 'GET',
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(getPatientDependents(patientId, token)).rejects.toThrow(
      'Forbidden',
    );
  });
});

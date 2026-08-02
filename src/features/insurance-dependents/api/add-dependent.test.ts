import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AddDependentRequest, DependentResponse } from '../types';
import { addDependent } from './add-dependent';

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

describe('addDependent', () => {
  const token = 'valid-jwt-token';
  const mockResponse: DependentResponse = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: AddDependentRequest = {
      firstName: 'Child',
      secondName: 'Dependent',
      thirdName: 'Test',
      fourthName: 'User',
      dateOfBirth: '2015-05-10',
      gender: 'Female',
      relationshipType: 'Child',
      nationalId: '05376658493657',
    };

    const result = await addDependent(data, token);

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/dependents', {
      method: 'POST',
      body: data,
      token,
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      addDependent(
        {
          firstName: 'Child',
          secondName: 'Dependent',
          thirdName: 'Test',
          fourthName: 'User',
          dateOfBirth: '2015-05-10',
          gender: 'Female',
          relationshipType: 'Child',
        },
        token,
      ),
    ).rejects.toThrow('Forbidden');
  });
});

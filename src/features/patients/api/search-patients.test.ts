import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PatientSearchResponse } from '../types';
import { searchPatients } from './search-patients';

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

describe('searchPatients', () => {
  const mockResponse: PatientSearchResponse = {
    id: 42,
    nationalId: '05376658493657',
    fullName: 'Test Patient',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    mobileNumber: '01000000000',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with NationalId query and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await searchPatients('05376658493657', 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/patients/search', {
      method: 'GET',
      query: { NationalId: '05376658493657' },
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Patient not found'));

    await expect(
      searchPatients('05376658493657', 'valid-jwt-token'),
    ).rejects.toThrow('Patient not found');
  });
});

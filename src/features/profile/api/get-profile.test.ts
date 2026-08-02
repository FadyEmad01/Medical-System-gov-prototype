import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProfileResponse } from '../types';
import { getProfile } from './get-profile';

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

describe('getProfile', () => {
  const mockResponse: ProfileResponse = {
    patientId: 42,
    nationalId: '05376658493657',
    username: 'testuser',
    fullName: 'Test Patient',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    mobileNumber: '01000000000',
    governorate: 'Cairo',
    district: 'Nasr City',
    email: 'test@example.com',
    address: '1 Main St',
    occupation: 'Engineer',
    maritalStatus: 'Single',
    nationality: 'Egyptian',
    preferredLanguage: 'ar',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '01111111111',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with the profile path and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getProfile('valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/profile', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(getProfile('invalid-token')).rejects.toThrow('Unauthorized');
  });
});

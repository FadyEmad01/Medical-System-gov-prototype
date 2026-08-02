import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssignedPatientResponse } from '../types';
import { getAssignedPatients } from './get-assigned-patients';

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

describe('getAssignedPatients', () => {
  const mockResponse: AssignedPatientResponse[] = [
    {
      patientId: 1,
      fullName: 'Test Patient',
      nationalId: '05376658493657',
      mobileNumber: '01000000000',
      assignedAt: '2026-08-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getAssignedPatients(1, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/doctors/1/patients', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(getAssignedPatients(1, 'valid-jwt-token')).rejects.toThrow(
      'Network error',
    );
  });
});

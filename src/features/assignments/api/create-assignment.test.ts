import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DoctorPatientAssignmentResponse } from '../types';
import { createAssignment } from './create-assignment';

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

describe('createAssignment', () => {
  const mockResponse: DoctorPatientAssignmentResponse = {
    assignmentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    doctorName: 'Dr. Test',
    patientName: 'Test Patient',
    assignedAt: '2026-08-02T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await createAssignment(1, 2, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/doctors/1/patients/2', {
      method: 'POST',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(createAssignment(1, 2, 'valid-jwt-token')).rejects.toThrow(
      'Network error',
    );
  });
});

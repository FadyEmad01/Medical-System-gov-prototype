import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VisitResponse } from '../types';
import { getVisit } from './get-visit';

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

describe('getVisit', () => {
  const mockResponse: VisitResponse = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    patientId: 1,
    patientFullName: 'Test Patient',
    patientNationalId: '05376658493657',
    doctorId: 2,
    doctorFullName: 'Dr. Test',
    visitDate: '2026-08-02T09:00:00Z',
    visitType: 'Consultation',
    status: 'Completed',
    notes: null,
    diagnosis: 'Hypertension',
    requiredTests: 'Blood panel',
    createdAt: '2026-08-02T08:30:00Z',
    medications: [
      {
        id: 1,
        medicineName: 'Amlodipine',
        dosage: '5 mg',
        frequency: 'Once daily',
        duration: '30 days',
      },
    ],
    attachments: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getVisit(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      'valid-jwt-token',
    );

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/visits/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      {
        method: 'GET',
        token: 'valid-jwt-token',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      getVisit('3fa85f64-5717-4562-b3fc-2c963f66afa6', 'valid-jwt-token'),
    ).rejects.toThrow('Network error');
  });
});

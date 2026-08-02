import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UpdateVisitRequest, VisitResponse } from '../types';
import { updateVisit } from './update-visit';

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

describe('updateVisit', () => {
  const mockResponse: VisitResponse = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    patientId: 1,
    patientFullName: 'Test Patient',
    patientNationalId: '05376658493657',
    doctorId: 2,
    doctorFullName: 'Dr. Test',
    visitDate: '2026-08-02T09:00:00Z',
    visitType: 'Consultation',
    status: 'InProgress',
    notes: 'Updated note',
    diagnosis: 'Hypertension',
    requiredTests: null,
    createdAt: '2026-08-02T08:30:00Z',
    medications: null,
    attachments: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const request: UpdateVisitRequest = {
      diagnosis: 'Hypertension',
      notes: 'Updated note',
      requiredTests: null,
    };

    const result = await updateVisit(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      request,
      'valid-jwt-token',
    );

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/visits/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      {
        method: 'PUT',
        body: request,
        token: 'valid-jwt-token',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      updateVisit(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        { notes: 'Updated note' },
        'valid-jwt-token',
      ),
    ).rejects.toThrow('Network error');
  });
});

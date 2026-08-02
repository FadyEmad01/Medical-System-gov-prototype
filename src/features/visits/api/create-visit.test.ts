import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateVisitRequest, VisitResponse } from '../types';
import { createVisit } from './create-visit';

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

describe('createVisit', () => {
  const mockResponse: VisitResponse = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    patientId: 1,
    patientFullName: 'Test Patient',
    patientNationalId: '05376658493657',
    doctorId: 2,
    doctorFullName: 'Dr. Test',
    visitDate: '2026-08-02T09:00:00Z',
    visitType: 'Consultation',
    status: 'Scheduled',
    notes: 'Follow-up requested',
    diagnosis: null,
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

    const request: CreateVisitRequest = {
      patientId: 1,
      doctorId: 2,
      visitDate: '2026-08-02T09:00:00Z',
      visitType: 'Consultation',
      notes: 'Follow-up requested',
    };

    const result = await createVisit(request, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/visits', {
      method: 'POST',
      body: request,
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    const request: CreateVisitRequest = {
      patientId: 1,
      doctorId: 2,
      visitDate: '2026-08-02T09:00:00Z',
      visitType: 'Consultation',
    };

    await expect(createVisit(request, 'valid-jwt-token')).rejects.toThrow(
      'Network error',
    );
  });
});

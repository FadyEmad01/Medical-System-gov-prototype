import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PatientVisitHistoryItem } from '../types';
import { getPatientVisitHistory } from './get-patient-visit-history';

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

describe('getPatientVisitHistory', () => {
  const mockResponse: PatientVisitHistoryItem[] = [
    {
      visitId: '3b7c9e1a-0000-0000-0000-000000000001',
      visitDate: '2026-07-01T10:00:00Z',
      doctorId: 7,
      doctorName: 'Dr. Test',
      visitType: 'Consultation',
      diagnosisSummary: 'Hypertension',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with the patient visit history path and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getPatientVisitHistory(42, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/patients/42/visit-history', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Patient not found'));

    await expect(getPatientVisitHistory(42, 'valid-jwt-token')).rejects.toThrow(
      'Patient not found',
    );
  });
});

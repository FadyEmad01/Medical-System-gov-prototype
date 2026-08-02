import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PatientMedicalSummary } from '../types';
import { getPatientMedicalSummary } from './get-patient-medical-summary';

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

describe('getPatientMedicalSummary', () => {
  const mockResponse: PatientMedicalSummary = {
    patientId: 42,
    fullName: 'Test Patient',
    nationalId: '05376658493657',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    lastVisit: {
      visitId: '3b7c9e1a-0000-0000-0000-000000000001',
      visitDate: '2026-07-01T10:00:00Z',
      doctorName: 'Dr. Test',
      visitType: 'Consultation',
    },
    latestDiagnosis: 'Hypertension',
    latestNotes: 'Follow up in 3 months',
    latestRequiredTests: 'Blood pressure',
    latestMedications: [{ medicationName: 'Aspirin', dosage: '81mg' }],
    latestAttachments: [
      {
        attachmentId: '3b7c9e1a-0000-0000-0000-000000000002',
        fileName: 'report.pdf',
        fileType: 'application/pdf',
        uploadedAt: '2026-07-01T10:05:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with the patient medical summary path and bearer token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getPatientMedicalSummary(42, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/patients/42/medical-summary', {
      method: 'GET',
      token: 'valid-jwt-token',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Patient not found'));

    await expect(
      getPatientMedicalSummary(42, 'valid-jwt-token'),
    ).rejects.toThrow('Patient not found');
  });
});

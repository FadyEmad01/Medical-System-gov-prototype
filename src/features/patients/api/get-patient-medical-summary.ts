import { http } from '@/lib/http';
import type { PatientMedicalSummary } from '../types';

export async function getPatientMedicalSummary(
  patientId: number,
  token: string,
): Promise<PatientMedicalSummary> {
  return http<PatientMedicalSummary>(
    `/api/patients/${patientId}/medical-summary`,
    {
      method: 'GET',
      token,
    },
  );
}

import { http } from '@/lib/http';
import type { PatientVisitHistoryItem } from '../types';

export async function getPatientVisitHistory(
  patientId: number,
  token: string,
): Promise<PatientVisitHistoryItem[]> {
  return http<PatientVisitHistoryItem[]>(
    `/api/patients/${patientId}/visit-history`,
    {
      method: 'GET',
      token,
    },
  );
}

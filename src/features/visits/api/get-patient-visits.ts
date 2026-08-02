import { http } from '@/lib/http';
import type { VisitResponse } from '../types';

export async function getPatientVisits(
  patientId: number,
  token: string,
): Promise<VisitResponse[]> {
  return http<VisitResponse[]>(`/api/patients/${patientId}/visits`, {
    method: 'GET',
    token,
  });
}

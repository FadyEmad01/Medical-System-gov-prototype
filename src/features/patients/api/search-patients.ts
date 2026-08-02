import { http } from '@/lib/http';
import type { PatientSearchResponse } from '../types';

export async function searchPatients(
  nationalId: string,
  token: string,
): Promise<PatientSearchResponse> {
  return http<PatientSearchResponse>('/api/patients/search', {
    method: 'GET',
    query: { NationalId: nationalId },
    token,
  });
}

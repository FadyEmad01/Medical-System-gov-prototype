import { http } from '@/lib/http';
import type { AssignedPatientResponse } from '../types';

export async function getAssignedPatients(
  doctorId: number,
  token: string,
): Promise<AssignedPatientResponse[]> {
  return http<AssignedPatientResponse[]>(`/api/doctors/${doctorId}/patients`, {
    method: 'GET',
    token,
  });
}

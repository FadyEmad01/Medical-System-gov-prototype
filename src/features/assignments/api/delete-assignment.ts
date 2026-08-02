import { http } from '@/lib/http';

export async function deleteAssignment(
  doctorId: number,
  patientId: number,
  token: string,
): Promise<void> {
  return http<void>(`/api/doctors/${doctorId}/patients/${patientId}`, {
    method: 'DELETE',
    token,
  });
}

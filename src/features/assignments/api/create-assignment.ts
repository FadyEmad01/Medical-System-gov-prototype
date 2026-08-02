import { http } from '@/lib/http';
import type { DoctorPatientAssignmentResponse } from '../types';

export async function createAssignment(
  doctorId: number,
  patientId: number,
  token: string,
): Promise<DoctorPatientAssignmentResponse> {
  return http<DoctorPatientAssignmentResponse>(
    `/api/doctors/${doctorId}/patients/${patientId}`,
    {
      method: 'POST',
      token,
    },
  );
}

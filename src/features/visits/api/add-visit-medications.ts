import { http } from '@/lib/http';
import type { AddMedicationsRequest, VisitResponse } from '../types';

export async function addVisitMedications(
  id: string,
  data: AddMedicationsRequest,
  token: string,
): Promise<VisitResponse> {
  return http<VisitResponse>(`/api/visits/${id}/medications`, {
    method: 'POST',
    body: data,
    token,
  });
}

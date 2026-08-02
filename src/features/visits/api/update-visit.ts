import { http } from '@/lib/http';
import type { UpdateVisitRequest, VisitResponse } from '../types';

export async function updateVisit(
  id: string,
  data: UpdateVisitRequest,
  token: string,
): Promise<VisitResponse> {
  return http<VisitResponse>(`/api/visits/${id}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

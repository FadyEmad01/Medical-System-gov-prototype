import { http } from '@/lib/http';
import type { UpdateVisitStatusRequest, VisitResponse } from '../types';

export async function updateVisitStatus(
  id: string,
  data: UpdateVisitStatusRequest,
  token: string,
): Promise<VisitResponse> {
  return http<VisitResponse>(`/api/visits/${id}/status`, {
    method: 'PATCH',
    body: data,
    token,
  });
}

import { http } from '@/lib/http';
import type { AttachmentResponse } from '../types';

export async function getVisitAttachments(
  visitId: string,
  token: string,
): Promise<AttachmentResponse[]> {
  return http<AttachmentResponse[]>(`/api/visits/${visitId}/attachments`, {
    method: 'GET',
    token,
  });
}

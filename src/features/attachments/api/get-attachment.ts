import { http } from '@/lib/http';
import type { AttachmentResponse } from '../types';

export async function getAttachment(
  id: string,
  token: string,
): Promise<AttachmentResponse> {
  return http<AttachmentResponse>(`/api/attachments/${id}`, {
    method: 'GET',
    token,
  });
}

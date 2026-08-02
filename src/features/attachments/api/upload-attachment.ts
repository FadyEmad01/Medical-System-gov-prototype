import { http } from '@/lib/http';
import type { UploadAttachmentResponse } from '../types';

export async function uploadAttachment(
  visitId: string,
  file: File | Blob,
  token: string,
): Promise<UploadAttachmentResponse> {
  const form = new FormData();
  form.append('file', file);
  return http<UploadAttachmentResponse>(`/api/visits/${visitId}/attachments`, {
    method: 'POST',
    body: form,
    token,
  });
}

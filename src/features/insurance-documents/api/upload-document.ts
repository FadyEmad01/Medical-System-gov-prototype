import type { DocumentType } from '@/lib/api/enums';
import { http } from '@/lib/http';
import type { CitizenDocumentResponse } from '../types';

export async function uploadDocument(
  data: {
    documentType: DocumentType;
    file: File | Blob;
    documentNumber?: string;
    expiresAt?: string;
    dependentPersonId?: string;
  },
  token: string,
): Promise<CitizenDocumentResponse> {
  const form = new FormData();
  form.append('documentType', data.documentType);
  form.append('file', data.file);

  if (data.documentNumber !== undefined) {
    form.append('documentNumber', data.documentNumber);
  }
  if (data.expiresAt !== undefined) {
    form.append('expiresAt', data.expiresAt);
  }
  if (data.dependentPersonId !== undefined) {
    form.append('dependentPersonId', data.dependentPersonId);
  }

  return http<CitizenDocumentResponse>('/api/insurance/documents/upload', {
    method: 'POST',
    body: form,
    token,
  });
}

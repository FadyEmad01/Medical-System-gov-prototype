import { http } from '@/lib/http';
import type { CitizenDocumentResponse } from '../types';

export async function getDocument(
  documentId: string,
  token: string,
): Promise<CitizenDocumentResponse> {
  return http<CitizenDocumentResponse>(
    `/api/insurance/documents/document/${documentId}`,
    {
      method: 'GET',
      token,
    },
  );
}

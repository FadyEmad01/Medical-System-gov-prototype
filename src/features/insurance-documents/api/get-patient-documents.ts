import { http } from '@/lib/http';
import type { CitizenDocumentResponse } from '../types';

export async function getPatientDocuments(
  patientId: number,
  token: string,
): Promise<CitizenDocumentResponse[]> {
  return http<CitizenDocumentResponse[]>(
    `/api/insurance/documents/${patientId}`,
    {
      method: 'GET',
      token,
    },
  );
}

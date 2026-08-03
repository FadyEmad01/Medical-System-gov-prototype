'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import type { DocumentType } from '@/lib/api/enums';
import { bffFetch } from '@/lib/bff';
import type { CitizenDocumentResponse } from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-documents/api/* exactly.
export const INSURANCE_DOCUMENTS_PATH = '/api/insurance/documents';

export const documentKeys = {
  all: ['insurance-documents'] as const,
  patient: (patientId: number) =>
    [...documentKeys.all, 'patient', patientId] as const,
};

export type UploadDocumentInput = {
  documentType: DocumentType;
  file: File;
  documentNumber?: string;
  expiresAt?: string;
};

export function usePatientDocuments(patientId: number | undefined) {
  const query = useQuery({
    queryKey: documentKeys.patient(patientId ?? 0),
    queryFn: () =>
      bffFetch<CitizenDocumentResponse[]>(
        `${INSURANCE_DOCUMENTS_PATH}/${patientId}`,
      ),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function useUploadDocument(patientId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    // Multipart FormData goes through bffFetch untouched: it is a FormData
    // instance, so no Content-Type header is set and the browser adds the
    // boundary automatically.
    mutationFn: (data: UploadDocumentInput) => {
      const form = new FormData();
      form.append('documentType', data.documentType);
      form.append('file', data.file);
      if (data.documentNumber !== undefined) {
        form.append('documentNumber', data.documentNumber);
      }
      if (data.expiresAt !== undefined) {
        form.append('expiresAt', data.expiresAt);
      }
      return bffFetch<CitizenDocumentResponse>(
        `${INSURANCE_DOCUMENTS_PATH}/upload`,
        { method: 'POST', body: form },
      );
    },
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: documentKeys.patient(patientId),
      });
    },
  });
}

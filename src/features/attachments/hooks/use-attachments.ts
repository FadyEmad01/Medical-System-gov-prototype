'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type { AttachmentResponse, UploadAttachmentResponse } from '../types';

// Same-origin paths (relative to the /api/bff proxy prefix). Match
// src/features/attachments/api/* exactly.
export const VISIT_ATTACHMENTS_PATH = '/api/visits';
export const ATTACHMENTS_PATH = '/api/attachments';

export const attachmentsKeys = {
  all: ['attachments'] as const,
  visit: (visitId: string) =>
    [...attachmentsKeys.all, 'visit', visitId] as const,
};

export function useVisitAttachments(visitId: string | null) {
  const query = useQuery({
    queryKey: attachmentsKeys.visit(visitId ?? ''),
    queryFn: () =>
      bffFetch<AttachmentResponse[]>(
        `${VISIT_ATTACHMENTS_PATH}/${visitId}/attachments`,
      ),
    enabled: visitId !== null,
  });

  useBffQueryError(query);

  return query;
}

export function useUploadAttachment(visitId: string) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    // Multipart FormData goes through bffFetch untouched: it is a FormData
    // instance, so no Content-Type header is set and the browser adds the
    // boundary automatically.
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return bffFetch<UploadAttachmentResponse>(
        `${VISIT_ATTACHMENTS_PATH}/${visitId}/attachments`,
        { method: 'POST', body: form },
      );
    },
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attachmentsKeys.visit(visitId),
      });
    },
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBffError } from '@/features/app-shell/hooks/use-bff-error';
import type { VisitStatus } from '@/lib/api/enums';
import { bffFetch } from '@/lib/bff';
import type {
  CreateVisitMedication,
  CreateVisitRequest,
  UpdateVisitRequest,
  VisitResponse,
} from '../types';
import { VISITS_PATH, visitsKeys } from './use-visits';

export function useCreateVisit() {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVisitRequest) =>
      bffFetch<VisitResponse>(VISITS_PATH, { method: 'POST', body: data }),
    onError: handleError,
    onSuccess: (_, data) => {
      void queryClient.invalidateQueries({
        queryKey: visitsKeys.patient(data.patientId),
      });
      void queryClient.invalidateQueries({ queryKey: visitsKeys.all });
    },
  });
}

export function useUpdateVisit(visitId: string) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVisitRequest) =>
      bffFetch<VisitResponse>(`${VISITS_PATH}/${visitId}`, {
        method: 'PUT',
        body: data,
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: visitsKeys.detail(visitId),
      });
      void queryClient.invalidateQueries({ queryKey: visitsKeys.all });
    },
  });
}

export function useUpdateVisitStatus(visitId: string) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: VisitStatus) =>
      bffFetch<VisitResponse>(`${VISITS_PATH}/${visitId}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: visitsKeys.all });
    },
  });
}

export function useAddVisitMedications(visitId: string) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medications: CreateVisitMedication[]) =>
      bffFetch<VisitResponse>(`${VISITS_PATH}/${visitId}/medications`, {
        method: 'POST',
        body: { medications },
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: visitsKeys.detail(visitId),
      });
    },
  });
}

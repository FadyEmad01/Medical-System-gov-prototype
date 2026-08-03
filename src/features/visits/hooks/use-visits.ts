'use client';

import { useQuery } from '@tanstack/react-query';
import { useBffError } from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type { VisitResponse } from '../types';

// Same-origin paths (relative to the /api/bff proxy prefix). Match
// src/features/visits/api/* exactly.
export const PATIENT_VISITS_PATH = '/api/patients';
export const VISITS_PATH = '/api/visits';

export const visitsKeys = {
  all: ['visits'] as const,
  patient: (patientId: number) =>
    [...visitsKeys.all, 'patient', patientId] as const,
  detail: (visitId: string) => [...visitsKeys.all, 'detail', visitId] as const,
};

export function usePatientVisits(patientId: number | undefined) {
  const handleError = useBffError();

  return useQuery({
    queryKey: visitsKeys.patient(patientId ?? 0),
    queryFn: () =>
      bffFetch<VisitResponse[]>(`${PATIENT_VISITS_PATH}/${patientId}/visits`),
    enabled: patientId !== undefined,
    onError: handleError,
  });
}

export function useVisit(visitId: string | null) {
  const handleError = useBffError();

  return useQuery({
    queryKey: visitsKeys.detail(visitId ?? ''),
    queryFn: () => bffFetch<VisitResponse>(`${VISITS_PATH}/${visitId}`),
    enabled: visitId !== null,
    onError: handleError,
  });
}

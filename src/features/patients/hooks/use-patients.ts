'use client';

import { useQuery } from '@tanstack/react-query';
import { useBffQueryError } from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type {
  PatientMedicalSummary,
  PatientSearchResponse,
  PatientVisitHistoryItem,
} from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/patients/api/* exactly.
export const PATIENTS_PATH = '/api/patients';

export const patientsKeys = {
  all: ['patients'] as const,
  search: (nationalId: string) =>
    [...patientsKeys.all, 'search', nationalId] as const,
  medicalSummary: (patientId: number) =>
    [...patientsKeys.all, 'medicalSummary', patientId] as const,
  visitHistory: (patientId: number) =>
    [...patientsKeys.all, 'visitHistory', patientId] as const,
};

export function useSearchPatient(nationalId: string) {
  const query = useQuery({
    queryKey: patientsKeys.search(nationalId),
    queryFn: () =>
      bffFetch<PatientSearchResponse>(`${PATIENTS_PATH}/search`, {
        query: { NationalId: nationalId },
      }),
    enabled: nationalId.length > 0,
  });

  useBffQueryError(query);

  return query;
}

export function usePatientMedicalSummary(patientId: number | undefined) {
  const query = useQuery({
    queryKey: patientsKeys.medicalSummary(patientId ?? 0),
    queryFn: () =>
      bffFetch<PatientMedicalSummary>(
        `${PATIENTS_PATH}/${patientId}/medical-summary`,
      ),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function usePatientVisitHistory(patientId: number | undefined) {
  const query = useQuery({
    queryKey: patientsKeys.visitHistory(patientId ?? 0),
    queryFn: () =>
      bffFetch<PatientVisitHistoryItem[]>(
        `${PATIENTS_PATH}/${patientId}/visit-history`,
      ),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

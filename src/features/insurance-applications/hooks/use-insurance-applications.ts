'use client';

import {
  type UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type { ApplicationDetailResponse, ApplicationResponse } from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-applications/api/* exactly.
export const INSURANCE_APPLICATIONS_PATH = '/api/insurance/applications';

export const applicationKeys = {
  all: ['insurance-applications'] as const,
  patient: (patientId: number) => [
    ...applicationKeys.all,
    'patient',
    patientId,
  ],
  detail: (applicationId: string) => [
    ...applicationKeys.all,
    'detail',
    applicationId,
  ],
};

export function usePatientApplications(patientId: number | undefined) {
  const query = useQuery({
    queryKey: applicationKeys.patient(patientId ?? 0),
    queryFn: () =>
      bffFetch<ApplicationResponse[]>(
        `${INSURANCE_APPLICATIONS_PATH}/${patientId}`,
      ),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function useApplicationDetail(applicationId: string | null) {
  const query = useQuery({
    queryKey: applicationKeys.detail(applicationId ?? ''),
    queryFn: () =>
      bffFetch<ApplicationDetailResponse>(
        `${INSURANCE_APPLICATIONS_PATH}/detail/${applicationId}`,
      ),
    enabled: applicationId !== null,
  });

  useBffQueryError(query);

  return query;
}

function useApplicationMutation(
  patientId: number,
  buildPath: (applicationId: string) => string,
  method: string,
): UseMutationResult<ApplicationResponse, unknown, string> {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId) =>
      bffFetch<ApplicationResponse>(buildPath(applicationId), { method }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.patient(patientId),
      });
    },
  });
}

export function useCreateApplication(patientId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      bffFetch<ApplicationResponse>(INSURANCE_APPLICATIONS_PATH, {
        method: 'POST',
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.patient(patientId),
      });
    },
  });
}

export function useSubmitApplication(patientId: number) {
  return useApplicationMutation(
    patientId,
    (applicationId) => `${INSURANCE_APPLICATIONS_PATH}/${applicationId}/submit`,
    'PATCH',
  );
}

export function useCancelApplication(patientId: number) {
  return useApplicationMutation(
    patientId,
    (applicationId) => `${INSURANCE_APPLICATIONS_PATH}/${applicationId}/cancel`,
    'PATCH',
  );
}

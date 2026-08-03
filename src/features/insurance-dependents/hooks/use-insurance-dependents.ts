'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type { AddDependentRequest, DependentResponse } from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-dependents/api/* exactly.
export const INSURANCE_DEPENDENTS_PATH = '/api/insurance/dependents';

export const dependentKeys = {
  all: ['insurance-dependents'] as const,
  patient: (patientId: number) =>
    [...dependentKeys.all, 'patient', patientId] as const,
};

export function usePatientDependents(patientId: number | undefined) {
  const query = useQuery({
    queryKey: dependentKeys.patient(patientId ?? 0),
    queryFn: () =>
      bffFetch<DependentResponse[]>(
        `${INSURANCE_DEPENDENTS_PATH}/${patientId}`,
      ),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function useAddDependent(patientId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddDependentRequest) =>
      bffFetch<DependentResponse>(INSURANCE_DEPENDENTS_PATH, {
        method: 'POST',
        body: data,
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: dependentKeys.patient(patientId),
      });
    },
  });
}

export function useEndDependentRelationship(patientId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationshipId: string) =>
      bffFetch<DependentResponse>(
        `${INSURANCE_DEPENDENTS_PATH}/${relationshipId}/end`,
        { method: 'PATCH' },
      ),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: dependentKeys.patient(patientId),
      });
    },
  });
}

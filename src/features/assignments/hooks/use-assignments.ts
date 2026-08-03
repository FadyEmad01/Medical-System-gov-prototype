'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useBffError,
  useBffQueryError,
} from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type {
  AssignedPatientResponse,
  DoctorPatientAssignmentResponse,
} from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/assignments/api/* exactly.
export const ASSIGNMENTS_PATH = '/api/doctors';

export const assignmentsKeys = {
  all: ['assignments'] as const,
  doctor: (doctorId: number) =>
    [...assignmentsKeys.all, 'doctor', doctorId] as const,
};

export function useAssignedPatients(doctorId: number | undefined) {
  const query = useQuery({
    queryKey: assignmentsKeys.doctor(doctorId ?? 0),
    queryFn: () =>
      bffFetch<AssignedPatientResponse[]>(
        `${ASSIGNMENTS_PATH}/${doctorId}/patients`,
      ),
    enabled: doctorId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function useCreateAssignment(doctorId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: number) =>
      bffFetch<DoctorPatientAssignmentResponse>(
        `${ASSIGNMENTS_PATH}/${doctorId}/patients/${patientId}`,
        { method: 'POST' },
      ),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assignmentsKeys.doctor(doctorId),
      });
    },
  });
}

export function useDeleteAssignment(doctorId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: number) =>
      bffFetch<void>(`${ASSIGNMENTS_PATH}/${doctorId}/patients/${patientId}`, {
        method: 'DELETE',
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assignmentsKeys.doctor(doctorId),
      });
    },
  });
}

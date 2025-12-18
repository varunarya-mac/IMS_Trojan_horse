/**
 * Alarm Hooks
 * React Query hooks for alarm data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmApi } from '../services/alarmApi';
import type {
  UpdateAlarmPatternRequest,
  CreateAlarmPatternRequest,
} from '../types/alarm';

// Query keys
export const alarmKeys = {
  all: ['alarms'] as const,
  disciplines: () => [...alarmKeys.all, 'disciplines'] as const,
  allFlows: () => [...alarmKeys.all, 'flows', 'all'] as const,
  alarmFlows: (disciplineTypeId: string) =>
    [...alarmKeys.all, 'flows', disciplineTypeId] as const,
  alarmFlowsByDiscipline: (disciplineId: string) =>
    [...alarmKeys.all, 'flows', 'discipline', disciplineId] as const,
  alarmPattern: (key: string, version?: number) =>
    [...alarmKeys.all, 'pattern', key, version] as const,
  versions: (key: string) => [...alarmKeys.all, 'versions', key] as const,
};

/**
 * Fetch all disciplines with types
 */
export function useDisciplines() {
  return useQuery({
    queryKey: alarmKeys.disciplines(),
    queryFn: () => alarmApi.getDisciplines(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Fetch ALL alarm flows for all disciplines at once
 * Data is cached for 1 hour and filtered client-side
 */
export function useAllAlarmFlows() {
  return useQuery({
    queryKey: alarmKeys.allFlows(),
    queryFn: () => alarmApi.getAllAlarmFlows(),
    staleTime: 60 * 60 * 1000, // 1 hour - data stays fresh for 1 hour
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}

/**
 * Fetch alarm flows for a discipline (all types under the discipline)
 * @deprecated Use useAllAlarmFlows() instead for better caching
 */
export function useAlarmFlowsByDiscipline(disciplineId: string | null) {
  return useQuery({
    queryKey: alarmKeys.alarmFlowsByDiscipline(disciplineId || ''),
    queryFn: () => alarmApi.getAlarmFlowsByDiscipline(disciplineId!),
    enabled: !!disciplineId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Fetch a specific alarm pattern
 */
export function useAlarmPattern(
  alarmPatternKey: string | null,
  version?: number
) {
  return useQuery({
    queryKey: alarmKeys.alarmPattern(alarmPatternKey || '', version),
    queryFn: () => alarmApi.getAlarmPattern(alarmPatternKey!, version),
    enabled: !!alarmPatternKey,
  });
}

/**
 * Fetch version history for an alarm pattern
 */
export function useAlarmVersions(alarmPatternKey: string | null) {
  return useQuery({
    queryKey: alarmKeys.versions(alarmPatternKey || ''),
    queryFn: () => alarmApi.getAlarmVersions(alarmPatternKey!),
    enabled: !!alarmPatternKey,
  });
}

/**
 * Update an alarm pattern mutation
 */
export function useUpdateAlarmPattern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alarmPatternKey,
      data,
    }: {
      alarmPatternKey: string;
      data: UpdateAlarmPatternRequest;
    }) => alarmApi.updateAlarmPattern(alarmPatternKey, data),
    onSuccess: (_result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: alarmKeys.alarmPattern(variables.alarmPatternKey),
      });
      queryClient.invalidateQueries({
        queryKey: alarmKeys.versions(variables.alarmPatternKey),
      });
      // Invalidate all flows to refresh the list
      queryClient.invalidateQueries({
        queryKey: [...alarmKeys.all, 'flows'],
      });
    },
  });
}

/**
 * Create a new alarm pattern mutation
 */
export function useCreateAlarmPattern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlarmPatternRequest) =>
      alarmApi.createAlarmPattern(data),
    onSuccess: (result) => {
      // Invalidate flows for the discipline type
      queryClient.invalidateQueries({
        queryKey: alarmKeys.alarmFlows(result.alarmPattern.disciplineTypeId),
      });
    },
  });
}

/**
 * Delete an alarm pattern mutation
 */
export function useDeleteAlarmPattern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alarmPatternKey: string) =>
      alarmApi.deleteAlarmPattern(alarmPatternKey),
    onSuccess: () => {
      // Invalidate all flows
      queryClient.invalidateQueries({
        queryKey: [...alarmKeys.all, 'flows'],
      });
    },
  });
}

/**
 * Rollback an alarm pattern mutation
 */
export function useRollbackAlarmPattern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alarmPatternKey,
      targetVersion,
      reason,
    }: {
      alarmPatternKey: string;
      targetVersion: number;
      reason?: string;
    }) => alarmApi.rollbackAlarmPattern(alarmPatternKey, targetVersion, reason),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: alarmKeys.alarmPattern(variables.alarmPatternKey),
      });
      queryClient.invalidateQueries({
        queryKey: alarmKeys.versions(variables.alarmPatternKey),
      });
    },
  });
}

/**
 * Import alarm configuration mutation
 */
export function useImportConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      configs,
      overwriteExisting,
    }: {
      configs: string[];
      overwriteExisting: boolean;
    }) => alarmApi.importConfig(configs, overwriteExisting),
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({
        queryKey: alarmKeys.all,
      });
    },
  });
}

/**
 * Import a single discipline configuration mutation
 * Used for parallel imports of multiple disciplines
 * Note: Cache invalidation is handled by the parent component after all imports complete
 */
export function useImportSingleDiscipline() {
  return useMutation({
    mutationFn: ({
      enterpriseInfo,
      discipline,
      overwriteExisting,
    }: {
      enterpriseInfo: { name: string; version: number };
      discipline: object;
      overwriteExisting: boolean;
    }) => alarmApi.importSingleDiscipline(enterpriseInfo, discipline, overwriteExisting),
  });
}

/**
 * Invalidate all alarm queries - useful after parallel imports
 */
export function useInvalidateAlarmQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: alarmKeys.all,
    });
  };
}

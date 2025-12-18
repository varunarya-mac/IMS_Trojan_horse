/**
 * Alarm API Service
 * Handles communication with the alarm-management-api Appwrite function
 */

import { Client, Functions } from 'appwrite';
import { APPWRITE_CONFIG } from '@config/appwrite';
import type {
  ApiResponse,
  DisciplinesResponse,
  AlarmFlowsResponse,
  NewAlarmFlowsResponse,
  AlarmPatternResponse,
  AlarmPatternDTO,
  UpdateAlarmPatternRequest,
  CreateAlarmPatternRequest,
  ImportSummaryDTO,
} from '../types/alarm';

// HTTP method type for Appwrite function execution
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Initialize Appwrite client for functions
const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const functions = new Functions(client);

const FUNCTION_ID = APPWRITE_CONFIG.fnAlarmManagement;

/**
 * Execute an Appwrite function with the given path and method
 */
async function executeFunction<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: object
): Promise<T> {
  try {
    const execution = await functions.createExecution(
      FUNCTION_ID,
      body ? JSON.stringify(body) : '',
      false, // async = false (wait for response)
      path,
      method as Parameters<typeof functions.createExecution>[4]
    );

    const response = JSON.parse(execution.responseBody) as ApiResponse<T>;

    if (!response.success) {
      throw new Error(response.error?.message || 'API request failed');
    }

    return response.data as T;
  } catch (error) {
    console.error(`Alarm API error (${method} ${path}):`, error);
    throw error;
  }
}

/**
 * Alarm API Service
 */
export const alarmApi = {
  /**
   * Get all disciplines with their types
   */
  async getDisciplines(): Promise<DisciplinesResponse> {
    return executeFunction<DisciplinesResponse>('/disciplines', 'GET');
  },

  /**
   * Get alarm flows for a discipline type
   */
  async getAlarmFlows(disciplineTypeId: string): Promise<AlarmFlowsResponse> {
    return executeFunction<AlarmFlowsResponse>('/alarm-flows', 'GET', {
      disciplineTypeId,
    });
  },

  /**
   * Get alarm flows for a discipline (all types under the discipline)
   */
  async getAlarmFlowsByDiscipline(disciplineId: string): Promise<NewAlarmFlowsResponse> {
    // API returns an array, extract first element
    const response = await executeFunction<NewAlarmFlowsResponse[]>('/alarm-flows', 'GET', {
      disciplineId,
    });
    return response[0];
  },

  /**
   * Get ALL alarm flows for all disciplines at once
   * Used for caching all data upfront and filtering client-side
   */
  async getAllAlarmFlows(): Promise<NewAlarmFlowsResponse[]> {
    return executeFunction<NewAlarmFlowsResponse[]>('/alarm-flows', 'GET');
  },

  /**
   * Get a specific alarm pattern by key
   */
  async getAlarmPattern(
    alarmPatternKey: string,
    version?: number
  ): Promise<AlarmPatternResponse> {
    const path = version
      ? `/alarm-patterns/${alarmPatternKey}?version=${version}`
      : `/alarm-patterns/${alarmPatternKey}`;
    return executeFunction<AlarmPatternResponse>(path, 'GET');
  },

  /**
   * Update an alarm pattern (creates a new version)
   */
  async updateAlarmPattern(
    alarmPatternKey: string,
    data: UpdateAlarmPatternRequest
  ): Promise<{ alarmPattern: AlarmPatternDTO; previousVersion: number }> {
    return executeFunction<{
      alarmPattern: AlarmPatternDTO;
      previousVersion: number;
    }>(`/alarm-patterns/${alarmPatternKey}`, 'PUT', data);
  },

  /**
   * Create a new alarm pattern
   */
  async createAlarmPattern(
    data: CreateAlarmPatternRequest
  ): Promise<AlarmPatternResponse> {
    return executeFunction<AlarmPatternResponse>('/alarm-patterns', 'POST', data);
  },

  /**
   * Delete an alarm pattern (soft delete)
   */
  async deleteAlarmPattern(
    alarmPatternKey: string
  ): Promise<{ message: string; alarmPatternKey: string }> {
    return executeFunction<{ message: string; alarmPatternKey: string }>(
      `/alarm-patterns/${alarmPatternKey}`,
      'DELETE'
    );
  },

  /**
   * Get version history for an alarm pattern
   */
  async getAlarmVersions(
    alarmPatternKey: string,
    includeAudit: boolean = false
  ): Promise<{
    alarmPatternKey: string;
    currentVersion: number;
    versions: Array<{
      version: number;
      createdAt: string;
      createdBy: string | null;
      changeDescription: string | null;
      isLatest: boolean;
    }>;
  }> {
    const path = includeAudit
      ? `/alarm-patterns/${alarmPatternKey}/versions?includeAudit=true`
      : `/alarm-patterns/${alarmPatternKey}/versions`;
    return executeFunction(path, 'GET');
  },

  /**
   * Rollback an alarm pattern to a specific version
   */
  async rollbackAlarmPattern(
    alarmPatternKey: string,
    targetVersion: number,
    reason?: string
  ): Promise<{
    alarmPattern: AlarmPatternDTO;
    rolledBackFrom: number;
    rolledBackTo: number;
  }> {
    return executeFunction(
      `/alarm-patterns/${alarmPatternKey}/rollback`,
      'POST',
      { targetVersion, reason }
    );
  },

  /**
   * Import alarm configuration from JSON
   * @param configs Array of JSON config strings
   * @param overwriteExisting Whether to overwrite existing alarms
   */
  async importConfig(
    configs: string[],
    overwriteExisting: boolean = false
  ): Promise<ImportSummaryDTO> {
    return executeFunction<ImportSummaryDTO>('/import', 'POST', {
      configs,
      overwriteExisting,
    });
  },

  /**
   * Import a single discipline configuration
   * @param enterpriseInfo Enterprise name and version
   * @param discipline Single discipline object to import
   * @param overwriteExisting Whether to overwrite existing alarms
   */
  async importSingleDiscipline(
    enterpriseInfo: { name: string; version: number },
    discipline: object,
    overwriteExisting: boolean = false
  ): Promise<ImportSummaryDTO> {
    const config = JSON.stringify({
      enterprise: {
        ...enterpriseInfo,
        disciplines: [discipline],
      },
    });
    return executeFunction<ImportSummaryDTO>('/import', 'POST', {
      configs: [config],
      overwriteExisting,
    });
  },
};

export default alarmApi;

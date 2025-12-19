/**
 * API Client Middleware
 * Shared utilities for API calls
 */

import { Functions } from 'appwrite';
import { client } from '@lib/appwrite';
import type { HttpMethod } from '@constants/api';

const functions = new Functions(client);

/**
 * Execute an Appwrite function with standardized error handling
 */
export async function executeFunction<T>(
  functionId: string,
  path: string,
  method: HttpMethod = 'GET',
  body?: object
): Promise<T> {
  const execution = await functions.createExecution(
    functionId,
    body ? JSON.stringify(body) : '',
    false,
    path,
    method
  );
  return JSON.parse(execution.responseBody);
}

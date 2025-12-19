/**
 * Appwrite Client Initialization
 * Centralized client setup for all Appwrite services
 */

import { Client, Account, Functions, Storage } from 'appwrite';
import { APPWRITE_CONFIG } from '@config/appwrite';

// Initialize the Appwrite client
const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Export initialized services
export const account = new Account(client);
export const functions = new Functions(client);
export const storage = new Storage(client);
export { client };

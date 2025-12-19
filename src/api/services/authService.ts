/**
 * Auth Service
 * Appwrite authentication service
 */

import { Client, Account, Models } from 'appwrite';
import { APPWRITE_CONFIG } from '@config/appwrite';

// Initialize the Appwrite client
const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize Appwrite services
export const account = new Account(client);

// Export the client for potential future use
export { client };

// Types
export type User = Models.User<Models.Preferences>;
export type Session = Models.Session;

// Auth Service Functions
export const authService = {
  // Login with email and password
  async login(email: string, password: string): Promise<Session> {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error('Appwrite login error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Appwrite getCurrentUser error:', error);
      return null;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite logout error:', error);
      throw error;
    }
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  },
};

export default authService;

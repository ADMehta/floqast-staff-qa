/**
 * env.ts
 * Loads environment variables from .env files and exposes them as a typed config object.
 * This allows tests to run against different environments (local, CI, staging) without code changes.
 */

import 'dotenv/config'; // Loads variables from .env into process.env

// Define the shape of our environment configuration
export type Env = {
  baseURL: string;           // Base URL for API requests
  uiURL: string;             // Base URL for UI tests
  token?: string;            // Optional auth token for API calls
  apiKey?: string;           // Optional API key for services
  envName: string;           // Name of the current environment (local, ci, staging)
  logApiResponses: boolean;  // Whether to log API responses to file/console
};

// Build the config object from environment variables
const env: Env = {
  baseURL: process.env.BASE_URL || 'http://localhost:3001',
  uiURL: process.env.UI_URL || 'http://localhost:3002',
  token: process.env.TOKEN,
  apiKey: process.env.API_KEY,
  envName: process.env.ENV_NAME || 'local',
  logApiResponses: process.env.LOG_API === 'true',
};

export default env;

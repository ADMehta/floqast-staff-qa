/**
 * assertions.ts
 * Custom assertion helpers for API and UI tests.
 */

import { expect, APIResponse } from '@playwright/test';

// Assert that the response has the expected status and returns valid JSON
export const expectJson = async (res: APIResponse, status = 200) => {
  expect(res.status(), 'unexpected status').toBe(status); // Check HTTP status
  const json = await res.json(); // Parse JSON
  expect(json, 'response should be JSON object').toBeTruthy(); // Ensure it's not null/empty
  return json; // Return parsed JSON for further assertions
};

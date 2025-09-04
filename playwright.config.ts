/**
 * Playwright Test Configuration
 * -----------------------------
 * This file controls how Playwright runs your tests, including:
 *  - Test directory and timeouts
 *  - Reporters (console, HTML, Allure)
 *  - Browser/device settings
 *  - Separate configs for API and UI tests
 *  - Local vs CI behavior (headed/headless, slowMo, workers)
 */

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';


// Load environment variables from .env (BASE_URL, UI_URL, TOKEN, etc.)
dotenv.config();

export default defineConfig({
  // global set up
//  globalSetup: require.resolve('./tests/global-setup.ts'),


  // Where Playwright should look for test files
  testDir: './tests',

  // Global timeout for each test (in ms)
  timeout: 30 * 1000, // 30 seconds

  // Timeout for individual expect() assertions
  expect: { timeout: 5000 }, // 5 seconds

  // Run tests in parallel by default
  fullyParallel: true,

  // Fail the build if test.only is accidentally left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI to reduce flakiness
  retries: process.env.CI ? 2 : 0,

  // Limit workers in CI for stability; use all cores locally
  workers: process.env.CI ? 2 : undefined,

  // Reporters control how results are displayed/stored
  reporter: [
    ['list'], // Clean console output
    ['html', { open: 'never', outputFolder: 'playwright-report' }], // Built-in HTML report
    ['allure-playwright'] // Allure report for rich dashboards
  ],

  // Default settings for all tests (can be overridden per project)
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001', // Default API base URL
    viewport: { width: 1280, height: 720 }, // Browser window size
    ignoreHTTPSErrors: true, // Ignore HTTPS errors (useful for self-signed certs)
    video: 'retain-on-failure', // Record video only on failures
    screenshot: 'only-on-failure', // Capture screenshot only on failures
    trace: 'retain-on-failure' // Keep Playwright trace for failed tests
  },

  // Separate "projects" let us configure API and UI tests differently
  projects: [
    {
      name: 'API tests',
      testMatch: /.*api\/.*\.spec\.ts/, // Only run files in tests/api
      use: {
        ...devices['Desktop Chrome'],
        headless: true // Always headless for API tests (faster, no UI needed)
      },
      fullyParallel: false, // Run tests in a file sequentially for watchability
    },
    {
      name: 'UI tests',
      testMatch: /.*ui\/.*\.spec\.ts/, // Only run files in tests/ui
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : false, // Headless in CI, headed locally
        slowMo: process.env.CI ? 0 : 1000 // Slow down actions locally for visibility
      },
      fullyParallel: false, // Run tests in a file sequentially for watchability
      workers: process.env.CI ? undefined : 1 // One worker locally so tests run one-by-one
    }
  ]
});
/**
 * apiClient.ts
 * A lightweight wrapper around Playwright's APIRequestContext.
 * Handles base URL, authentication headers, and optional API response logging.
 */

import { APIRequestContext, request, APIResponse } from '@playwright/test';
import env from '../config/env';
import logger from './logger';
import { allure } from 'allure-playwright';

export class ApiClient {
  private ctx!: APIRequestContext; // Holds the Playwright API request context
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = env.baseURL;
    // Always set a token — use dummy if not provided
    this.token = env.token || 'dummy-token';
  }

  // Initialize the API context with base URL and auth headers
  async init() {
    this.ctx = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Dispose of the API context
  async dispose() {
    if (this.ctx) {
      await this.ctx.dispose();
    }
  }

  // Core request method with Allure attachments + optional logging
  private async doRequest(method: string, path: string, data?: any): Promise<APIResponse> {
    const start = Date.now();
    const res = await this.ctx.fetch(path, { method, data });
    const duration = Date.now() - start;

    const responseBody = await res.text().catch(() => '<non-text>');

    if (env.logApiResponses) {
      logger.api(path, data, responseBody, res.status());
    }

    // Attach to Allure
    allure.attachment(
      `Request ${method} ${path}`,
      JSON.stringify({ method, url: `${this.baseURL}${path}`, body: data }, null, 2),
      'application/json'
    );
    allure.attachment(
      `Response ${method} ${path}`,
      JSON.stringify({ status: res.status(), body: responseBody, durationMs: duration }, null, 2),
      'application/json'
    );

    return res;
  }

  // HTTP helpers
  async get(path: string): Promise<APIResponse> {
    return this.doRequest('GET', path);
  }

  async post(path: string, body: any): Promise<APIResponse> {
    return this.doRequest('POST', path, body);
  }

  async put(path: string, body?: any): Promise<APIResponse> {
    return this.doRequest('PUT', path, body);
  }

  async delete(path: string): Promise<APIResponse> {
    return this.doRequest('DELETE', path);
  }
}



// /**
//  * apiClient.ts
//  * A lightweight wrapper around Playwright's APIRequestContext.
//  * Handles base URL, authentication headers, and optional API response logging.
//  */

// import { APIRequestContext, request, APIResponse } from '@playwright/test';
// import env from '../config/env';
// import logger from './logger';
// import { allure } from 'allure-playwright';

// export class ApiClient {
//   private ctx!: APIRequestContext; // Holds the Playwright API request context

//   // Initialize the API context with base URL and optional auth headers
//   async init() {
//     this.ctx = await request.newContext({
//       baseURL: env.baseURL,
//       extraHTTPHeaders: env.token ? { Authorization: `Bearer ${env.token}` } : {},
//     });
//   }

//   // POST request helper
//   async post<T>(path: string, body: any): Promise<APIResponse> {
//     const res = await this.ctx.post(path, { data: body });
//     if (env.logApiResponses) logger.api(path, body, await res.text(), res.status());
//     return res;
//   }

//   // GET request helper
//   async get(path: string): Promise<APIResponse> {
//     const res = await this.ctx.get(path);
//     if (env.logApiResponses) logger.api(path, undefined, await res.text(), res.status());
//     return res;
//   }

//   // Log and attach request/response for debugging and reporting.
//   async request(method: string, path: string, data?: any) {
//     const url = `${this.baseURL}${path}`;
//     const start = Date.now();
//     const res = await this.ctx.fetch(url, { method, data });
//     const duration = Date.now() - start;

//     const responseBody = await res.text().catch(() => '<non-text>');
//     const log = { method, url, status: res.status(), durationMs: duration, requestBody: data, responseBody };

//     // Attach to Allure
//     allure.attachment(`Request ${method} ${path}`, JSON.stringify({ method, url, body: data }, null, 2), 'application/json');
//     allure.attachment(`Response ${method} ${path}`, JSON.stringify({ status: res.status(), body: responseBody }, null, 2), 'application/json');

//     return res;
//   }
//   // Dispose of the API context
//   async dispose() {
//     await this.ctx.dispose();
//   }

//   async put(path: string, data?: any) {
//     return this.request('PUT', path, data);
//   }

//   async delete(path: string) {
//     return this.request('DELETE', path);
//   }

// }

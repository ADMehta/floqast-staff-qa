/**
 * logger.ts
 * Simple logger that writes API request/response details to both console and a log file.
 */

import fs from 'fs';
const logFile = 'reports/api.log'; // Log file path

export default {
  api: (path: string, req: any, resBody: string, status: number) => {
    const line = JSON.stringify({
      ts: new Date().toISOString(), // Timestamp
      path,
      status,
      req,
      res: resBody,
    });
    fs.appendFileSync(logFile, line + '\n'); // Append to log file
    console.log('[API]', path, status); // Log to console
  },
};

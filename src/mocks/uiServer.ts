/**
 * uiServer.ts
 * Simple Express server to serve static HTML/JS/CSS for UI tests.
 * Serves files from the /public directory (index.html, transaction.html, etc.).
 */


import express from 'express';
import path from 'path';

const app = express();

// Resolve the absolute path to the public folder
const publicDir = path.join(__dirname, '../../public');

// Serve static files (HTML, CSS, JS) from /public
app.use(express.static(publicDir));

const PORT = process.env.UI_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Mock UI server running at http://localhost:${PORT}`);
  console.log(`Serving static files from: ${publicDir}`);
});

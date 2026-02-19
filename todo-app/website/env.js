const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Centralised env loader: prefer .env, fall back to .env.sample for local/dev only.
const rootDir = __dirname;
const envPath = path.join(rootDir, '.env');
const samplePath = path.join(rootDir, '.env.sample');

let loadedFrom = null;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  loadedFrom = envPath;
} else if (process.env.NODE_ENV !== 'production' && fs.existsSync(samplePath)) {
  dotenv.config({ path: samplePath });
  loadedFrom = samplePath;
}

if (!loadedFrom) {
  // eslint-disable-next-line no-console
  console.warn('[env] No .env file found. Using existing process.env only.');
} else if (loadedFrom === samplePath) {
  // eslint-disable-next-line no-console
  console.info('[env] Loaded variables from .env.sample (dev fallback).');
}

module.exports = { loadedFrom };

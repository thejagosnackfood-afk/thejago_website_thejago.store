import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveAsset(requestPath) {
  const safePath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, '');
  const target = path.join(distDir, safePath);

  if (!target.startsWith(distDir)) {
    return null;
  }

  if (existsSync(target) && statSync(target).isFile()) {
    return target;
  }

  return null;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const assetPath = resolveAsset(url.pathname === '/' ? '/index.html' : url.pathname);
  if (assetPath) {
    if (req.method === 'HEAD') {
      const ext = path.extname(assetPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      });
      res.end();
      return;
    }
    sendFile(res, assetPath);
    return;
  }

  const fallback = path.join(distDir, 'index.html');
  if (existsSync(fallback)) {
    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    createReadStream(fallback).pipe(res);
    return;
  }

  res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Build output not found.');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${port}`);
});

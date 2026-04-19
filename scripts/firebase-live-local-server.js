const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", ".firebase", "thejagosnackfood-420", "hosting");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4182);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function safePath(inputPath) {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[\\/])+/, "");
  return normalized;
}

function resolveFile(urlPathname) {
  const cleanPath = decodeURIComponent(urlPathname.split("?")[0] || "/");
  const normalized = safePath(cleanPath);

  const candidates = [];
  if (normalized === "/" || normalized === "\\") {
    candidates.push("index.html");
  } else {
    const trimmed = normalized.replace(/^[/\\]+/, "");
    candidates.push(trimmed);
    candidates.push(`${trimmed}.html`);
    candidates.push(path.join(trimmed, "index.html"));
  }

  for (const candidate of candidates) {
    const fullPath = path.resolve(ROOT_DIR, candidate);
    if (!fullPath.startsWith(ROOT_DIR)) continue;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  const notFound = path.join(ROOT_DIR, "404.html");
  if (fs.existsSync(notFound)) {
    return notFound;
  }
  return null;
}

function sendFile(res, filePath, statusCode) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(statusCode, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filePath).pipe(res);
}

if (!fs.existsSync(ROOT_DIR)) {
  console.error(`Hosting snapshot tidak ditemukan: ${ROOT_DIR}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const filePath = resolveFile(req.url || "/");
  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }

  const is404 = path.basename(filePath) === "404.html";
  sendFile(res, filePath, is404 ? 404 : 200);
});

server.listen(PORT, HOST, () => {
  console.log(`Firebase live local server running at http://${HOST}:${PORT}`);
  console.log(`Serving snapshot: ${ROOT_DIR}`);
});

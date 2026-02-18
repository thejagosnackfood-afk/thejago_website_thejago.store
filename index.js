// Centralised environment loader keeps .env.sample usable locally while .env stays untracked
require('./env');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { connectDb } = require('./src/db');
const { notFound, errorHandler } = require('./src/middleware/errors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;

const defaultStaticDir = path.resolve(__dirname, '../frontend/dist');
const staticDir = process.env.STATIC_DIR ? path.resolve(process.env.STATIC_DIR) : defaultStaticDir;
const staticIndex = path.join(staticDir, 'index.html');

app.get('/', (req, res) => {
  // If the frontend is built, serve it from the API server.
  if (fs.existsSync(staticIndex)) {
    return res.sendFile(staticIndex);
  }

  // Helpful fallback when the user expects http://localhost:3000 to show UI.
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>The Jago Store</title>
    <style>
      body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:40px;max-width:760px;line-height:1.5}
      code,pre{background:#f4f4f5;padding:2px 6px;border-radius:6px}
      pre{padding:12px;overflow:auto}
      a{color:#c2410c}
    </style>
  </head>
  <body>
    <h1>Backend jalan, Frontend belum dibuild</h1>
    <p>API aktif di <code>/api/*</code>. Untuk menampilkan UI:</p>
    <h3>Mode Dev (Vite)</h3>
    <pre><code>cd ../frontend
npm install
npm run dev</code></pre>
    <p>Buka <a href="http://localhost:5173">http://localhost:5173</a></p>
    <h3>Mode Serve di Port 3000</h3>
    <pre><code>cd ../frontend
npm install
npm run build

cd ../website
npm start</code></pre>
    <p>Setelah build, UI akan muncul di <code>http://localhost:${PORT}</code>.</p>
  </body>
</html>`);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'thejago.store-api' });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/assistant', require('./src/routes/assistantRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/gen-image', require('./src/routes/imageRoutes'));

// Optional: serve a built frontend (Vite/React) if present.
if (fs.existsSync(staticIndex)) {
  app.use(express.static(staticDir));
  // Express v5 + path-to-regexp no longer accepts '*' routes.
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(staticIndex);
  });
}

app.use(notFound);
app.use(errorHandler);
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exitCode = 1;
  });

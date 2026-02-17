require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { connectDb } = require('./src/db');
const { notFound, errorHandler } = require('./src/middleware/errors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

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
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Optional: serve a built frontend (Vite/React) if present.
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
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

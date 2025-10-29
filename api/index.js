 // api/index.js - Vercel Serverless Function Handler
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar rutas
import authRoutes from '../server/src/routes/auth.routes.js';
import productsRoutes from '../server/src/routes/products.routes.js';
import categoriesRoutes from '../server/src/routes/categories.routes.js';
import uploadsRoutes from '../server/src/routes/uploads.routes.js';
import quotesRoutes from '../server/src/routes/quotes.routes.js';
import statsRoutes from '../server/src/routes/stats.routes.js';
import colorsRoutes from '../server/src/routes/colors.routes.js';
import contactRoutes from '../server/src/routes/contact.routes.js';
import customersRoutes from '../server/src/routes/customers.routes.js';
import { requireAuth } from '../server/src/auth.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Rutas protegidas
app.use('/api/stats', requireAuth, statsRoutes);
app.use('/api/customers', requireAuth, customersRoutes);

// Otras rutas
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/colors', colorsRoutes);

// Quotes (necesita io, pero en serverless no tenemos WebSockets)
// Crear un mock de io para que funcione
const mockIo = {
  emit: () => {},
  on: () => {},
  sockets: { emit: () => {} }
};
app.use('/api/quotes', quotesRoutes(mockIo));

// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'GLDS API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Vercel serverless handler wrapper for the Express app
export default async function handler(req, res) {
  // Ensure Vercel waits until the response is finished
  await new Promise((resolve, reject) => {
    let finished = false;
    const done = (err) => {
      if (finished) return;
      finished = true;
      if (err) return reject(err);
      resolve();
    };

    try {
      app(req, res, (err) => done(err));
    } catch (err) {
      return done(err);
    }

    res.on('finish', () => done());
    res.on('close', () => done());
  });
}
 // api/index.js - Vercel Serverless Function Handler
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

// Health check
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GLDS API is running on Vercel Serverless',
    timestamp: new Date().toISOString(),
    env: {
      nodeVersion: process.version,
      platform: process.platform,
      hasClientUrl: !!process.env.CLIENT_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      clientUrl: process.env.CLIENT_URL,
    }
  });
});

// Diagnóstico
app.get('/api/debug', (req, res) => {
  res.json({
    env: process.env,
    cwd: process.cwd(),
    nodeVersion: process.version,
  });
});

// Lazy load routes to avoid import errors
let routesCache = {};

async function loadRoute(resource) {
  if (routesCache[resource]) {
    return routesCache[resource];
  }

  const routeMap = {
    'auth': '../server/src/routes/auth.routes.js',
    'products': '../server/src/routes/products.routes.js',
    'categories': '../server/src/routes/categories.routes.js',
    'uploads': '../server/src/routes/uploads.routes.js',
    'quotes': '../server/src/routes/quotes.routes.js',
    'stats': '../server/src/routes/stats.routes.js',
    'colors': '../server/src/routes/colors.routes.js',
    'contact': '../server/src/routes/contact.routes.js',
    'customers': '../server/src/routes/customers.routes.js',
  };

  if (!routeMap[resource]) {
    return null;
  }

  try {
    const routeModule = await import(routeMap[resource]);
    const router = routeModule.default;

    // Para quotes que necesita io
    if (resource === 'quotes' && typeof router === 'function') {
      const mockIo = {
        emit: () => {},
        on: () => {},
        sockets: { emit: () => {} }
      };
      routesCache[resource] = router(mockIo);
    } else {
      routesCache[resource] = router;
    }

    return routesCache[resource];
  } catch (error) {
    console.error(`Error loading route ${resource}:`, error);
    throw error;
  }
}

// Dynamic route handler
app.use('/api/:resource/*', async (req, res, next) => {
  try {
    const { resource } = req.params;
    const router = await loadRoute(resource);

    if (!router) {
      return next();
    }

    // Crear un nuevo request con la ruta ajustada
    const originalUrl = req.originalUrl;
    req.url = req.url.replace(`/${resource}`, '');
    req.originalUrl = originalUrl;

    router(req, res, next);
  } catch (error) {
    console.error('Route handler error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      resource: req.params.resource,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// También manejar rutas sin subrutas (ej: /api/products)
app.use('/api/:resource', async (req, res, next) => {
  try {
    const { resource } = req.params;
    const router = await loadRoute(resource);

    if (!router) {
      return next();
    }

    req.url = '/';
    router(req, res, next);
  } catch (error) {
    console.error('Route handler error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      resource: req.params.resource,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
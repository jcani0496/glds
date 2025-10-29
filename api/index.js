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
      hasDatabase: !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL,
      hasClientUrl: !!process.env.CLIENT_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      clientUrl: process.env.CLIENT_URL,
    }
  });
});

// Import routes
let authRoutes, productsRoutes, categoriesRoutes, uploadsRoutes, quotesRoutes, statsRoutes, colorsRoutes, contactRoutes, customersRoutes;

// Load routes with error handling
async function initializeRoutes() {
  try {
    console.log('🔄 Loading routes...');

    try {
      const authModule = await import('../server/src/routes/auth.routes.js');
      authRoutes = authModule.default;
      console.log('✅ Auth routes loaded');
    } catch (e) {
      console.error('❌ Failed to load auth routes:', e.message);
    }

    try {
      const productsModule = await import('../server/src/routes/products.routes.js');
      productsRoutes = productsModule.default;
      console.log('✅ Products routes loaded');
    } catch (e) {
      console.error('❌ Failed to load products routes:', e.message);
    }

    try {
      const categoriesModule = await import('../server/src/routes/categories.routes.js');
      categoriesRoutes = categoriesModule.default;
      console.log('✅ Categories routes loaded');
    } catch (e) {
      console.error('❌ Failed to load categories routes:', e.message);
    }

    try {
      const uploadsModule = await import('../server/src/routes/uploads.routes.js');
      uploadsRoutes = uploadsModule.default;
      console.log('✅ Uploads routes loaded');
    } catch (e) {
      console.error('❌ Failed to load uploads routes:', e.message);
    }

    try {
      const quotesModule = await import('../server/src/routes/quotes.routes.js');
      quotesRoutes = quotesModule.default;
      console.log('✅ Quotes routes loaded');
    } catch (e) {
      console.error('❌ Failed to load quotes routes:', e.message);
    }

    try {
      const statsModule = await import('../server/src/routes/stats.routes.js');
      statsRoutes = statsModule.default;
      console.log('✅ Stats routes loaded');
    } catch (e) {
      console.error('❌ Failed to load stats routes:', e.message);
    }

    try {
      const colorsModule = await import('../server/src/routes/colors.routes.js');
      colorsRoutes = colorsModule.default;
      console.log('✅ Colors routes loaded');
    } catch (e) {
      console.error('❌ Failed to load colors routes:', e.message);
    }

    try {
      const contactModule = await import('../server/src/routes/contact.routes.js');
      contactRoutes = contactModule.default;
      console.log('✅ Contact routes loaded');
    } catch (e) {
      console.error('❌ Failed to load contact routes:', e.message);
    }

    try {
      const customersModule = await import('../server/src/routes/customers.routes.js');
      customersRoutes = customersModule.default;
      console.log('✅ Customers routes loaded');
    } catch (e) {
      console.error('❌ Failed to load customers routes:', e.message);
    }

    console.log('✅ All routes initialized');
  } catch (error) {
    console.error('❌ Error initializing routes:', error);
  }
}

// Initialize routes on startup
await initializeRoutes();

// Mount routes
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Mounted /api/auth');
}
if (productsRoutes) {
  app.use('/api/products', productsRoutes);
  console.log('✅ Mounted /api/products');
}
if (categoriesRoutes) {
  app.use('/api/categories', categoriesRoutes);
  console.log('✅ Mounted /api/categories');
}
if (uploadsRoutes) {
  app.use('/api/uploads', uploadsRoutes);
  console.log('✅ Mounted /api/uploads');
}
if (quotesRoutes) {
  app.use('/api/quotes', quotesRoutes);
  console.log('✅ Mounted /api/quotes');
}
if (statsRoutes) {
  app.use('/api/stats', statsRoutes);
  console.log('✅ Mounted /api/stats');
}
if (colorsRoutes) {
  app.use('/api/colors', colorsRoutes);
  console.log('✅ Mounted /api/colors');
}
if (contactRoutes) {
  app.use('/api/contact', contactRoutes);
  console.log('✅ Mounted /api/contact');
}
if (customersRoutes) {
  app.use('/api/customers', customersRoutes);
  console.log('✅ Mounted /api/customers');
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      '/api',
      '/api/auth',
      '/api/products',
      '/api/categories',
      '/api/uploads',
      '/api/quotes',
      '/api/stats',
      '/api/colors',
      '/api/contact',
      '/api/customers',
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
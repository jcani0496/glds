let sql = null;

try {
  if (process.env.POSTGRES_URL) {
    // Intentar cargar @vercel/postgres de forma dinámica para ser compatible
    // con entornos donde no esté instalado (en cuyo caso se usará `pg`).
    try {
      // Intentar require (funciona en muchas configuraciones de Node/CJS)
      if (typeof require !== 'undefined') {
        // eslint-disable-next-line global-require
        const vercel = require('@vercel/postgres');
        sql = vercel?.sql || vercel?.default?.sql || null;
      } else {
        // Fallback a import dinámico en ESM (no bloqueante)
        import('@vercel/postgres')
          .then(mod => {
            sql = mod?.sql || mod?.default?.sql || null;
          })
          .catch(() => {
            // Ignorar, se usará pg Pool si está disponible
          });
      }
    } catch (err) {
      // Si falla la carga, dejamos sql en null para usar Pool
      sql = null;
    }
  }
} catch (err) {
  sql = null;
}
import pg from 'pg';

const { Pool } = pg;

// Configuración de la conexión
let pool = null;
let dbError = null;

// Intentar conectar a Postgres
try {
  // En Vercel, usar las variables de entorno automáticas
  if (process.env.POSTGRES_URL) {
    console.log('✅ Using Vercel Postgres');
    // @vercel/postgres usa las variables de entorno automáticamente
  } else if (process.env.DATABASE_URL) {
    // Fallback para desarrollo local o Railway/Render
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('✅ Using custom DATABASE_URL');
  } else {
    throw new Error('No database configuration found. Please set POSTGRES_URL or DATABASE_URL');
  }
} catch (error) {
  dbError = error;
  console.error('❌ Database connection error:', error.message);
}

// Wrapper para queries que funciona con ambos métodos
export const query = async (text, params = []) => {
  try {
    if (process.env.POSTGRES_URL) {
      // Usar @vercel/postgres
      const result = await sql.query(text, params);
      return result;
    } else if (pool) {
      // Usar pg Pool
      const result = await pool.query(text, params);
      return result;
    } else {
      throw new Error('Database not available');
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper para obtener un solo registro
export const queryOne = async (text, params = []) => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

// Helper para obtener todos los registros
export const queryAll = async (text, params = []) => {
  const result = await query(text, params);
  return result.rows;
};

// Inicializar esquema de base de datos
export const initDatabase = async () => {
  if (dbError) {
    console.error('Cannot initialize database:', dbError.message);
    return false;
  }

  try {
    console.log('🔄 Initializing database schema...');

    // Crear tablas
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        description TEXT,
        image_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        category_id INTEGER REFERENCES categories(id),
        material VARCHAR(255),
        use_case TEXT,
        delivery_time VARCHAR(100),
        stock_status VARCHAR(50) DEFAULT 'available',
        is_new BOOLEAN DEFAULT FALSE,
        is_popular BOOLEAN DEFAULT FALSE,
        is_eco_friendly BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        customer_company VARCHAR(255),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        follow_up_at TIMESTAMP,
        expected_delivery VARCHAR(100),
        tracking_token VARCHAR(100) UNIQUE,
        reminder_count INTEGER DEFAULT 0,
        customer_portal_last_seen TIMESTAMP,
        pdf_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quote_items (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER NOT NULL REFERENCES quotes(id),
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        qty INTEGER NOT NULL,
        color VARCHAR(100),
        customization TEXT
      );

      CREATE TABLE IF NOT EXISTS colors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        hex VARCHAR(7),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_colors (
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        color_id INTEGER NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, color_id)
      );

      CREATE TABLE IF NOT EXISTS quote_events (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER NOT NULL REFERENCES quotes(id),
        type VARCHAR(100) NOT NULL,
        payload TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quote_drafts (
        id SERIAL PRIMARY KEY,
        token VARCHAR(100) UNIQUE NOT NULL,
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        payload TEXT NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        notes TEXT,
        tags TEXT,
        status VARCHAR(50) DEFAULT 'active',
        total_quotes INTEGER DEFAULT 0,
        last_quote_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customer_interactions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        subject VARCHAR(255),
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear índices
    await query(`
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_feat ON products(featured);
      CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);
      CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(active);
      CREATE INDEX IF NOT EXISTS idx_prod_colors ON product_colors(product_id, color_id);
      CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON quote_events(quote_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_quote_drafts_token ON quote_drafts(token);
      CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
      CREATE INDEX IF NOT EXISTS idx_quotes_tracking_token ON quotes(tracking_token);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
      CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer ON customer_interactions(customer_id, created_at);
    `);

    // Crear trigger para actualizar contador de cotizaciones
    await query(`
      CREATE OR REPLACE FUNCTION update_customer_quote_count()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Actualizar o insertar cliente
        INSERT INTO customers (name, email, phone, company, total_quotes, last_quote_date, status)
        VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, NEW.customer_company, 1, NEW.created_at, 'lead')
        ON CONFLICT (email) DO UPDATE SET
          total_quotes = (SELECT COUNT(*) FROM quotes WHERE customer_email = NEW.customer_email),
          last_quote_date = NEW.created_at,
          updated_at = CURRENT_TIMESTAMP;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_update_customer_quote_count ON quotes;
      
      CREATE TRIGGER trigger_update_customer_quote_count
      AFTER INSERT ON quotes
      FOR EACH ROW
      EXECUTE FUNCTION update_customer_quote_count();
    `);

    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
};

// Exportar para compatibilidad con código existente
export const db = {
  query,
  queryOne,
  queryAll,
};

export { dbError };

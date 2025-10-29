import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'glds.sqlite');
const firstTime = !fs.existsSync(dbPath);

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/* Tablas base + nuevas tablas de colores + metadata/eventos/drafts para cotizaciones */
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  image_url TEXT,
  featured INTEGER DEFAULT 0,
  category_id INTEGER,
  material TEXT,
  use_case TEXT,
  delivery_time TEXT,
  stock_status TEXT DEFAULT 'available',
  is_new INTEGER DEFAULT 0,
  is_popular INTEGER DEFAULT 0,
  is_eco_friendly INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  status_updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  follow_up_at TEXT,
  expected_delivery TEXT,
  tracking_token TEXT UNIQUE,
  reminder_count INTEGER DEFAULT 0,
  customer_portal_last_seen TEXT,
  pdf_path TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  sku TEXT,
  qty INTEGER NOT NULL,
  color TEXT,
  customization TEXT,
  FOREIGN KEY(quote_id) REFERENCES quotes(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

/* NUEVO: catálogo global de colores */
CREATE TABLE IF NOT EXISTS colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  hex TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

/* NUEVO: relación N:M producto <-> colores disponibles */
CREATE TABLE IF NOT EXISTS product_colors (
  product_id INTEGER NOT NULL,
  color_id INTEGER NOT NULL,
  PRIMARY KEY (product_id, color_id),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(color_id)  REFERENCES colors(id)   ON DELETE CASCADE
);

/* Eventos/actividad relacionados con una cotización (seguimiento, envíos, visitas, cambios de estado, etc.) */
CREATE TABLE IF NOT EXISTS quote_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(quote_id) REFERENCES quotes(id)
);

/* Borradores guardados de cotizaciones (para compartir enlaces o continuar edición) */
CREATE TABLE IF NOT EXISTS quote_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  payload TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

/* Migración ligera por si la DB existía sin nuevas columnas */
try {
  const cols = db.prepare("PRAGMA table_info(quotes)").all();
  const ensure = (name, def) => {
    if (!cols.find((c) => c.name === name)) {
      db.exec(`ALTER TABLE quotes ADD COLUMN ${name} ${def}`);
    }
  };
  ensure("customer_company", "TEXT");
  ensure("status_updated_at", "TEXT DEFAULT CURRENT_TIMESTAMP");
  ensure("follow_up_at", "TEXT");
  ensure("expected_delivery", "TEXT");
  ensure("tracking_token", "TEXT UNIQUE");
  ensure("reminder_count", "INTEGER DEFAULT 0");
  ensure("customer_portal_last_seen", "TEXT");
} catch {}

try {
  db.exec(
    "CREATE TABLE IF NOT EXISTS quote_events (id INTEGER PRIMARY KEY AUTOINCREMENT, quote_id INTEGER NOT NULL, type TEXT NOT NULL, payload TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(quote_id) REFERENCES quotes(id))"
  );
} catch {}

try {
  db.exec(
    "CREATE TABLE IF NOT EXISTS quote_drafts (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT UNIQUE NOT NULL, customer_email TEXT, customer_name TEXT, payload TEXT NOT NULL, expires_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)"
  );
} catch {}

/* Índices para acelerar búsqueda/filtros/paginación */
db.exec(`
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_feat ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(active);
CREATE INDEX IF NOT EXISTS idx_prod_colors ON product_colors(product_id, color_id);
CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON quote_events(quote_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quote_drafts_token ON quote_drafts(token);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_feat ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(active);
CREATE INDEX IF NOT EXISTS idx_prod_colors ON product_colors(product_id, color_id);
`);

/* Migración ligera por si la DB existía sin customer_company */
try {
  const cols = db.prepare("PRAGMA table_info(quotes)").all();
  const ensure = (name, def) => {
    if (!cols.find((c) => c.name === name)) {
      db.exec(`ALTER TABLE quotes ADD COLUMN ${name} ${def}`);
    }
  };
  ensure("customer_company", "TEXT");
  ensure("status_updated_at", "TEXT DEFAULT CURRENT_TIMESTAMP");
  ensure("follow_up_at", "TEXT");
  ensure("expected_delivery", "TEXT");
  ensure("tracking_token", "TEXT");
  ensure("reminder_count", "INTEGER DEFAULT 0");
  ensure("customer_portal_last_seen", "TEXT");
} catch {}

/* Índices para acelerar búsqueda/filtros/paginación */
db.exec(`
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
`);
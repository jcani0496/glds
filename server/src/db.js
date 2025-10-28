import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'glds.sqlite');
const firstTime = !fs.existsSync(dbPath);

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/* Tablas base + nuevas tablas de colores */
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
`);

/* Índices para acelerar búsqueda/filtros/paginación */
db.exec(`
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_feat ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(active);
CREATE INDEX IF NOT EXISTS idx_prod_colors ON product_colors(product_id, color_id);
`);

/* Migración ligera por si la DB existía sin customer_company */
try {
  const cols = db.prepare("PRAGMA table_info(quotes)").all();
  if (!cols.find((c) => c.name === "customer_company")) {
    db.exec("ALTER TABLE quotes ADD COLUMN customer_company TEXT");
  }
} catch {}

export const isFresh = firstTime;
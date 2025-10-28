import { db } from './db.js';
import slugify from './util.slugify.js';

/* ============ Helpers internos ============ */
function buildFilters({ q, category_id, featured } = {}) {
  const conds = [];
  const vals = [];
  if (q) {
    conds.push('(p.name LIKE ? OR p.sku LIKE ?)');
    vals.push(`%${q}%`, `%${q}%`);
  }
  if (category_id) {
    conds.push('p.category_id = ?');
    vals.push(category_id);
  }
  if (featured != null) {
    conds.push('p.featured = ?');
    vals.push(featured ? 1 : 0);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  return { where, vals };
}

function buildOrder(sort = 'new') {
  switch (sort) {
    case 'name_asc':
      return 'ORDER BY p.name ASC';
    case 'name_desc':
      return 'ORDER BY p.name DESC';
    case 'featured':
      return 'ORDER BY p.featured DESC, p.created_at DESC';
    case 'category':
      return 'ORDER BY c.name ASC, p.name ASC';
    case 'new':
    default:
      return 'ORDER BY p.created_at DESC';
  }
}

/* ---------------- Admins ---------------- */
export const admins = {
  create: ({ email, password_hash }) => {
    const stmt = db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
    return stmt.run(email, password_hash);
  },
  findByEmail: (email) => db.prepare('SELECT * FROM admins WHERE email = ?').get(email),
};

/* ---------------- Categories ---------------- */
export const categories = {
  list: () => db.prepare('SELECT * FROM categories ORDER BY name').all(),
  get: (id) => db.prepare('SELECT * FROM categories WHERE id = ?').get(id),
  create: ({ name }) => {
    const slug = slugify(name);
    return db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name, slug);
  },
  update: (id, { name }) => {
    const slug = slugify(name);
    return db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, id);
  },
  remove: (id) => db.prepare('DELETE FROM categories WHERE id = ?').run(id),
};

/* ---------------- Colors ---------------- */
export const colors = {
  list: ({ activeOnly = false } = {}) => {
    const sql = activeOnly
      ? 'SELECT * FROM colors WHERE active = 1 ORDER BY name'
      : 'SELECT * FROM colors ORDER BY name';
    return db.prepare(sql).all();
  },
  get: (id) => db.prepare('SELECT * FROM colors WHERE id = ?').get(id),
  create: ({ name, hex, active = true }) =>
    db
      .prepare('INSERT INTO colors (name, hex, active) VALUES (?, ?, ?)')
      .run(name, hex || null, active ? 1 : 0),
  update: (id, { name, hex, active }) =>
    db
      .prepare('UPDATE colors SET name = COALESCE(?, name), hex = COALESCE(?, hex), active = COALESCE(?, active) WHERE id = ?')
      .run(name ?? null, hex ?? null, active == null ? null : active ? 1 : 0, id),
  remove: (id) => db.prepare('DELETE FROM colors WHERE id = ?').run(id),
};

/* ---------------- Products ---------------- */
export const products = {
  /* Listado simple (compatibilidad con vistas existentes: Admin, etc.) */
  list: ({ q, category_id, featured, sort = 'new' } = {}) => {
    const { where, vals } = buildFilters({ q, category_id, featured });
    const orderBy = buildOrder(sort);
    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ${orderBy}
    `;
    return db.prepare(sql).all(...vals);
  },

  /* Conteo con los mismos filtros */
  count: ({ q, category_id, featured } = {}) => {
    const { where, vals } = buildFilters({ q, category_id, featured });
    const sql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
    `;
    const { total } = db.prepare(sql).get(...vals);
    return Number(total || 0);
  },

  /* Paginado */
  listPaged: ({ q, category_id, featured, sort = 'new', page = 1, pageSize = 12 } = {}) => {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(48, Math.max(6, Number(pageSize) || 12));
    const offset = (p - 1) * ps;

    const total = products.count({ q, category_id, featured });
    if (total === 0) {
      return { items: [], total: 0, page: p, pageSize: ps };
    }

    const { where, vals } = buildFilters({ q, category_id, featured });
    const orderBy = buildOrder(sort);
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const items = db.prepare(sql).all(...vals, ps, offset);
    return { items, total, page: p, pageSize: ps };
  },

  get: (id) => db.prepare('SELECT * FROM products WHERE id = ?').get(id),

  create: ({ name, sku, description, image_url, featured, category_id }) =>
    db
      .prepare('INSERT INTO products (name, sku, description, image_url, featured, category_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, sku, description, image_url, featured ? 1 : 0, category_id || null),

  update: (id, { name, sku, description, image_url, featured, category_id }) =>
    db
      .prepare('UPDATE products SET name=?, sku=?, description=?, image_url=?, featured=?, category_id=? WHERE id=?')
      .run(name, sku, description, image_url, featured ? 1 : 0, category_id || null, id),

  remove: (id) => db.prepare('DELETE FROM products WHERE id = ?').run(id),

  /* ---- Colores asignados a producto ---- */
  colors: (product_id) =>
    db
      .prepare(
        `SELECT c.* FROM colors c
         INNER JOIN product_colors pc ON pc.color_id=c.id
         WHERE pc.product_id = ? AND c.active=1
         ORDER BY c.name`
      )
      .all(product_id),

  setColors: (product_id, color_ids = []) => {
    const del = db.prepare('DELETE FROM product_colors WHERE product_id = ?');
    del.run(product_id);
    if (!Array.isArray(color_ids) || color_ids.length === 0) return;

    const ins = db.prepare('INSERT OR IGNORE INTO product_colors (product_id, color_id) VALUES (?, ?)');
    const trx = db.transaction((ids) => {
      for (const cid of ids) ins.run(product_id, Number(cid));
    });
    trx(color_ids);
  },

  /* Listados con colores */
  listWithColors: (filters) => {
    const base = products.list(filters);
    return base.map((p) => ({ ...p, colors: products.colors(p.id) }));
  },

  listWithColorsPaged: (filters) => {
    const { items, total, page, pageSize } = products.listPaged(filters);
    return {
      items: items.map((p) => ({ ...p, colors: products.colors(p.id) })),
      total,
      page,
      pageSize,
    };
  },

  getWithColors: (id) => {
    const p = products.get(id);
    if (!p) return null;
    return { ...p, colors: products.colors(id) };
  },
};

/* ---------------- Quotes ---------------- */
export const quotes = {
  list: ({ status } = {}) => {
    let sql = 'SELECT * FROM quotes';
    const vals = [];
    if (status) {
      sql += ' WHERE status = ?';
      vals.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    return db.prepare(sql).all(...vals);
  },
  get: (id) => db.prepare('SELECT * FROM quotes WHERE id = ?').get(id),
  getByCode: (code) => db.prepare('SELECT * FROM quotes WHERE code = ?').get(code),
  items: (quote_id) => db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(quote_id),
  create: ({ code, customer_name, customer_email, customer_phone, customer_company, notes }) =>
    db
      .prepare(
        'INSERT INTO quotes (code, customer_name, customer_email, customer_phone, customer_company, notes) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(code, customer_name, customer_email, customer_phone || null, customer_company || null, notes || null),
  addItem: ({ quote_id, product_id, product_name, sku, qty, color, customization }) =>
    db
      .prepare(
        'INSERT INTO quote_items (quote_id, product_id, product_name, sku, qty, color, customization) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(quote_id, product_id || null, product_name, sku || null, qty, color || null, customization || null),
  setStatus: (id, status) => db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, id),
  setPdfPath: (id, pdf_path) => db.prepare('UPDATE quotes SET pdf_path = ? WHERE id = ?').run(pdf_path, id),
};
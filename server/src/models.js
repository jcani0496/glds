import { db } from './db.js';
import slugify from './util.slugify.js';

/* ============ Helpers internos ============ */
function buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly } = {}) {
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
  if (material) {
    conds.push('p.material = ?');
    vals.push(material);
  }
  if (use_case) {
    conds.push('p.use_case = ?');
    vals.push(use_case);
  }
  if (delivery_time) {
    conds.push('p.delivery_time = ?');
    vals.push(delivery_time);
  }
  if (stock_status) {
    conds.push('p.stock_status = ?');
    vals.push(stock_status);
  }
  if (is_new != null) {
    conds.push('p.is_new = ?');
    vals.push(is_new ? 1 : 0);
  }
  if (is_popular != null) {
    conds.push('p.is_popular = ?');
    vals.push(is_popular ? 1 : 0);
  }
  if (is_eco_friendly != null) {
    conds.push('p.is_eco_friendly = ?');
    vals.push(is_eco_friendly ? 1 : 0);
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
  list: ({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly, sort = 'new' } = {}) => {
    const { where, vals } = buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly });
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
  count: ({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly } = {}) => {
    const { where, vals } = buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly });
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
  listPaged: ({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly, sort = 'new', page = 1, pageSize = 12 } = {}) => {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(48, Math.max(6, Number(pageSize) || 12));
    const offset = (p - 1) * ps;

    const total = products.count({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly });
    if (total === 0) {
      return { items: [], total: 0, page: p, pageSize: ps };
    }

    const { where, vals } = buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly });
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

  create: ({ name, sku, description, image_url, featured, category_id, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }) =>
    db
      .prepare('INSERT INTO products (name, sku, description, image_url, featured, category_id, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(name, sku, description, image_url, featured ? 1 : 0, category_id || null, material || null, use_case || null, delivery_time || null, stock_status || 'available', is_new ? 1 : 0, is_popular ? 1 : 0, is_eco_friendly ? 1 : 0),

  update: (id, { name, sku, description, image_url, featured, category_id, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }) =>
    db
      .prepare('UPDATE products SET name=?, sku=?, description=?, image_url=?, featured=?, category_id=?, material=?, use_case=?, delivery_time=?, stock_status=?, is_new=?, is_popular=?, is_eco_friendly=? WHERE id=?')
      .run(name, sku, description, image_url, featured ? 1 : 0, category_id || null, material || null, use_case || null, delivery_time || null, stock_status || 'available', is_new ? 1 : 0, is_popular ? 1 : 0, is_eco_friendly ? 1 : 0, id),

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
  soonFollowUps: () =>
    db
      .prepare(
        `SELECT * FROM quotes
         WHERE follow_up_at IS NOT NULL
         ORDER BY follow_up_at ASC
         LIMIT 50`
      )
      .all(),
  get: (id) => db.prepare('SELECT * FROM quotes WHERE id = ?').get(id),
  getByCode: (code) => db.prepare('SELECT * FROM quotes WHERE code = ?').get(code),
  getByTrackingToken: (token) =>
    db.prepare('SELECT * FROM quotes WHERE tracking_token = ?').get(token),
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
  setStatus: (id, status) =>
    db
      .prepare('UPDATE quotes SET status = ?, status_updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, id),
  setPdfPath: (id, pdf_path) => db.prepare('UPDATE quotes SET pdf_path = ? WHERE id = ?').run(pdf_path, id),
  setFollowUp: (id, follow_up_at) =>
    db.prepare('UPDATE quotes SET follow_up_at = ? WHERE id = ?').run(follow_up_at || null, id),
  setExpectedDelivery: (id, expected_delivery) =>
    db.prepare('UPDATE quotes SET expected_delivery = ? WHERE id = ?').run(expected_delivery || null, id),
  setTrackingToken: (id, token) =>
    db.prepare('UPDATE quotes SET tracking_token = ? WHERE id = ?').run(token || null, id),
  incrementReminder: (id) =>
    db.prepare('UPDATE quotes SET reminder_count = COALESCE(reminder_count, 0) + 1 WHERE id = ?').run(id),
  touchPortalSeen: (id) =>
    db.prepare('UPDATE quotes SET customer_portal_last_seen = CURRENT_TIMESTAMP WHERE id = ?').run(id),
};

export const quoteEvents = {
  create: ({ quote_id, type, payload }) =>
    db
      .prepare(
        'INSERT INTO quote_events (quote_id, type, payload) VALUES (?, ?, ?)'
      )
      .run(quote_id, type, payload ? JSON.stringify(payload) : null),
  list: (quote_id) =>
    db
      .prepare('SELECT * FROM quote_events WHERE quote_id = ? ORDER BY created_at DESC')
      .all(quote_id),
};

export const quoteDrafts = {
  create: ({ token, customer_email, customer_name, payload, expires_at }) =>
    db
      .prepare(
        'INSERT INTO quote_drafts (token, customer_email, customer_name, payload, expires_at) VALUES (?, ?, ?, ?, ?)'
      )
      .run(token, customer_email || null, customer_name || null, JSON.stringify(payload), expires_at || null),
  update: (token, { customer_email, customer_name, payload, expires_at }) =>
    db
      .prepare(
        'UPDATE quote_drafts SET customer_email = COALESCE(?, customer_email), customer_name = COALESCE(?, customer_name), payload = COALESCE(?, payload), expires_at = COALESCE(?, expires_at), updated_at = CURRENT_TIMESTAMP WHERE token = ?'
      )
      .run(
        customer_email || null,
        customer_name || null,
        payload ? JSON.stringify(payload) : null,
        expires_at || null,
        token
      ),
  get: (token) => {
    const row = db
      .prepare('SELECT * FROM quote_drafts WHERE token = ?')
      .get(token);
    if (!row) return null;
    return { ...row, payload: row.payload ? JSON.parse(row.payload) : null };
  },
  pruneExpired: () =>
    db
      .prepare('DELETE FROM quote_drafts WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP')
      .run(),
};
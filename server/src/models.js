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
    vals.push(featured ? true : false);
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
    vals.push(is_new ? true : false);
  }
  if (is_popular != null) {
    conds.push('p.is_popular = ?');
    vals.push(is_popular ? true : false);
  }
  if (is_eco_friendly != null) {
    conds.push('p.is_eco_friendly = ?');
    vals.push(is_eco_friendly ? true : false);
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
  create: async ({ email, password_hash }) => {
    const stmt = db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?) RETURNING id');
    return await stmt.get(email, password_hash);
  },
  findByEmail: async (email) => await db.prepare('SELECT * FROM admins WHERE email = ?').get(email),
};

/* ---------------- Categories ---------------- */
export const categories = {
  list: async () => await db.prepare('SELECT * FROM categories ORDER BY name').all(),
  get: async (id) => await db.prepare('SELECT * FROM categories WHERE id = ?').get(id),
  create: async ({ name }) => {
    const slug = slugify(name);
    return await db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?) RETURNING id').get(name, slug);
  },
  update: async (id, { name }) => {
    const slug = slugify(name);
    return await db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, id);
  },
  remove: async (id) => await db.prepare('DELETE FROM categories WHERE id = ?').run(id),
};

/* ---------------- Colors ---------------- */
export const colors = {
  list: async ({ activeOnly = false } = {}) => {
    const sql = activeOnly
      ? 'SELECT * FROM colors WHERE active = TRUE ORDER BY name'
      : 'SELECT * FROM colors ORDER BY name';
    return await db.prepare(sql).all();
  },
  get: async (id) => await db.prepare('SELECT * FROM colors WHERE id = $1').get(id),
  create: async ({ name, hex, active = true }) =>
    await db
      .prepare('INSERT INTO colors (name, hex, active) VALUES ($1, $2, $3) RETURNING id')
      .get(name, hex || null, active),
  update: async (id, { name, hex, active }) =>
    await db
      .prepare('UPDATE colors SET name = COALESCE($1, name), hex = COALESCE($2, hex), active = COALESCE($3, active) WHERE id = $4')
      .run(name ?? null, hex ?? null, active ?? null, id),
  remove: async (id) => await db.prepare('DELETE FROM colors WHERE id = $1').run(id),
};

/* ---------------- Products ---------------- */
export const products = {
  /* Listado simple (compatibilidad con vistas existentes: Admin, etc.) */
  list: async ({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly, sort = 'new' } = {}) => {
    const { where, vals } = buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }, { pg: true });
    const orderBy = buildOrder(sort);
    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ${orderBy}
    `;
    return await db.prepare(sql).all(...vals);
  },

  /* Conteo con los mismos filtros */
  count: async ({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly } = {}) => {
    const { where, vals } = buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }, { pg: true });
    const sql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
    `;
    const result = await db.prepare(sql).get(...vals);
    return Number(result?.total || 0);
  },

  /* Paginado */
  listPaged: async ({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly, sort = 'new', page = 1, pageSize = 12 } = {}) => {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(48, Math.max(6, Number(pageSize) || 12));
    const offset = (p - 1) * ps;

    const total = await products.count({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly });
    if (total === 0) {
      return { items: [], total: 0, page: p, pageSize: ps };
    }

    const { where, vals } = buildFilters({ q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }, { pg: true });
    const orderBy = buildOrder(sort);
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ${orderBy}
      LIMIT $${vals.length + 1} OFFSET $${vals.length + 2}
    `;
    const items = await db.prepare(sql).all(...vals, ps, offset);
    return { items, total, page: p, pageSize: ps };
  },

  get: async (id) => await db.prepare('SELECT * FROM products WHERE id = $1').get(id),

  create: async ({ name, sku, description, image_url, featured, category_id, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }) =>
    await db
      .prepare('INSERT INTO products (name, sku, description, image_url, featured, category_id, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id')
      .get(name, sku, description, image_url, Boolean(featured), category_id || null, material || null, use_case || null, delivery_time || null, stock_status || 'available', Boolean(is_new), Boolean(is_popular), Boolean(is_eco_friendly)),

  update: async (id, { name, sku, description, image_url, featured, category_id, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly }) =>
    await db
      .prepare('UPDATE products SET name=$1, sku=$2, description=$3, image_url=$4, featured=$5, category_id=$6, material=$7, use_case=$8, delivery_time=$9, stock_status=$10, is_new=$11, is_popular=$12, is_eco_friendly=$13 WHERE id=$14')
      .run(name, sku, description, image_url, Boolean(featured), category_id || null, material || null, use_case || null, delivery_time || null, stock_status || 'available', Boolean(is_new), Boolean(is_popular), Boolean(is_eco_friendly), id),

  remove: async (id) => await db.prepare('DELETE FROM products WHERE id = $1').run(id),

  /* ---- Colores asignados a producto ---- */
  colors: async (product_id) =>
    await db
      .prepare(
        `SELECT c.* FROM colors c
         INNER JOIN product_colors pc ON pc.color_id=c.id
         WHERE pc.product_id = $1 AND c.active=TRUE
         ORDER BY c.name`
      )
      .all(product_id),

  setColors: async (product_id, color_ids = []) => {
    await db.prepare('DELETE FROM product_colors WHERE product_id = $1').run(product_id);
    if (!Array.isArray(color_ids) || color_ids.length === 0) return;

    const insertSql = 'INSERT INTO product_colors (product_id, color_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    for (const cid of color_ids) {
      await db.prepare(insertSql).run(product_id, Number(cid));
    }
  },

  /* Listados con colores */
  listWithColors: async (filters) => {
    const base = await products.list(filters);
    return await Promise.all(base.map(async (p) => ({ ...p, colors: await products.colors(p.id) })));
  },

  listWithColorsPaged: async (filters) => {
    const { items, total, page, pageSize } = await products.listPaged(filters);
    const mapped = await Promise.all(items.map(async (p) => ({ ...p, colors: await products.colors(p.id) })));
    return {
      items: mapped,
      total,
      page,
      pageSize,
    };
  },

  getWithColors: async (id) => {
    const p = await products.get(id);
    if (!p) return null;
    return { ...p, colors: await products.colors(id) };
  },
};

/* ---------------- Quotes ---------------- */
export const quotes = {
  list: async ({ status, q, page = 1, pageSize = 20, sort = 'new' } = {}) => {
    const conds = [];
    const vals = [];
    if (status) {
      conds.push('status = $' + (vals.length + 1));
      vals.push(status);
    }
    if (q) {
      conds.push(`(code ILIKE $${vals.length + 1} OR customer_name ILIKE $${vals.length + 2} OR customer_email ILIKE $${vals.length + 3})`);
      vals.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const orderBy = sort === 'old' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';
    const sql = `SELECT * FROM quotes ${where} ${orderBy}`;
    return await db.prepare(sql).all(...vals);
  },

  soonFollowUps: async () =>
    await db
      .prepare(
        `SELECT * FROM quotes
         WHERE follow_up_at IS NOT NULL
         ORDER BY follow_up_at ASC
         LIMIT 50`
      )
      .all(),

  get: async (id) => await db.prepare('SELECT * FROM quotes WHERE id = $1').get(id),
  getByCode: async (code) => await db.prepare('SELECT * FROM quotes WHERE code = $1').get(code),
  getByTrackingToken: async (token) =>
    await db.prepare('SELECT * FROM quotes WHERE tracking_token = $1').get(token),
  items: async (quote_id) => await db.prepare('SELECT * FROM quote_items WHERE quote_id = $1').all(quote_id),

  create: async ({ code, customer_name, customer_email, customer_phone, customer_company, notes, status = 'pending', items = [] }) => {
    const result = await db
      .prepare('INSERT INTO quotes (code, customer_name, customer_email, customer_phone, customer_company, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id')
      .get(code, customer_name, customer_email, customer_phone || null, customer_company || null, notes || null, status);

    const quote_id = result.id;
    for (const item of items) {
      await db
        .prepare('INSERT INTO quote_items (quote_id, product_id, product_name, sku, qty, color, customization) VALUES ($1, $2, $3, $4, $5, $6, $7)')
        .run(quote_id, item.product_id || null, item.product_name, item.sku || null, item.qty, item.color || null, item.customization || null);
    }
    return result;
  },

  updateStatus: async (id, status) =>
    await db.prepare('UPDATE quotes SET status = $1, status_updated_at = CURRENT_TIMESTAMP WHERE id = $2').run(status, id),

  setPdfPath: async (id, pdf_path) => await db.prepare('UPDATE quotes SET pdf_path = $1 WHERE id = $2').run(pdf_path, id),
  setFollowUpAt: async (id, follow_up_at) =>
    await db.prepare('UPDATE quotes SET follow_up_at = $1 WHERE id = $2').run(follow_up_at || null, id),
  setExpectedDelivery: async (id, expected_delivery) =>
    await db.prepare('UPDATE quotes SET expected_delivery = $1 WHERE id = $2').run(expected_delivery || null, id),
  setTrackingToken: async (id, token) =>
    await db.prepare('UPDATE quotes SET tracking_token = $1 WHERE id = $2').run(token || null, id),
  incrementReminderCount: async (id) =>
    await db.prepare('UPDATE quotes SET reminder_count = COALESCE(reminder_count, 0) + 1 WHERE id = $1').run(id),
  markPortalSeen: async (id) =>
    await db.prepare('UPDATE quotes SET customer_portal_last_seen = CURRENT_TIMESTAMP WHERE id = $1').run(id),

  addEvent: async (quote_id, type, payload = null) =>
    await db
      .prepare('INSERT INTO quote_events (quote_id, type, payload) VALUES ($1, $2, $3) RETURNING id')
      .get(quote_id, type, payload ? JSON.stringify(payload) : null),

  getEvents: async (quote_id) => {
    const rows = await db.prepare('SELECT * FROM quote_events WHERE quote_id = $1 ORDER BY created_at DESC').all(quote_id);
    return rows.map((r) => ({
      ...r,
      payload: r.payload ? JSON.parse(r.payload) : null,
    }));
  },

  saveDraft: async ({ token, customer_email, customer_name, payload, expires_at }) =>
    await db
      .prepare('INSERT INTO quote_drafts (token, customer_email, customer_name, payload, expires_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (token) DO UPDATE SET payload = $6, updated_at = CURRENT_TIMESTAMP RETURNING id')
      .get(token, customer_email || null, customer_name || null, JSON.stringify(payload), expires_at || null, JSON.stringify(payload)),

  getDraft: async (token) => {
    const row = await db.prepare('SELECT * FROM quote_drafts WHERE token = $1').get(token);
    if (!row) return null;
    return {
      ...row,
      payload: row.payload ? JSON.parse(row.payload) : null,
    };
  },
};

/* ---------------- Customers ---------------- */
export const customers = {
  list: async ({ status, q, page = 1, pageSize = 20 } = {}) => {
    const conds = [];
    const params = [];
    if (status) {
      conds.push('status = $' + (params.length + 1));
      params.push(status);
    }
    if (q) {
      conds.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 2} OR company ILIKE $${params.length + 3})`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const query = `SELECT * FROM customers ${where} ORDER BY created_at DESC`;
    const customers = await db.prepare(query).all(...params);
    return customers;
  },

  get: async (id) => await db.prepare('SELECT * FROM customers WHERE id = $1').get(id),
  getByEmail: async (email) => await db.prepare('SELECT * FROM customers WHERE email = $1').get(email),

  create: async ({ name, email, phone, company, address, city, country, notes, tags, status = 'active' }) =>
    await db
      .prepare('INSERT INTO customers (name, email, phone, company, address, city, country, notes, tags, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id')
      .get(name, email, phone || null, company || null, address || null, city || null, country || null, notes || null, tags || null, status),

  update: async (id, { name, email, phone, company, address, city, country, notes, tags, status }) =>
    await db
      .prepare('UPDATE customers SET name=$1, email=$2, phone=$3, company=$4, address=$5, city=$6, country=$7, notes=$8, tags=$9, status=$10, updated_at=CURRENT_TIMESTAMP WHERE id=$11')
      .run(name, email, phone || null, company || null, address || null, city || null, country || null, notes || null, tags || null, status, id),

  remove: async (id) => await db.prepare('DELETE FROM customers WHERE id = $1').run(id),

  addInteraction: async ({ customer_id, type, subject, notes, created_by }) =>
    await db
      .prepare('INSERT INTO customer_interactions (customer_id, type, subject, notes, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id')
      .get(customer_id, type, subject || null, notes || null, created_by || null),

  getInteractions: async (customer_id) =>
    await db.prepare('SELECT * FROM customer_interactions WHERE customer_id = $1 ORDER BY created_at DESC').all(customer_id),
};

/* ---------------- Quote Drafts ---------------- */
export const quoteDrafts = {
  get: async (token) => {
    const row = await db.prepare('SELECT * FROM quote_drafts WHERE token = $1').get(token);
    if (!row) return null;
    return {
      ...row,
      payload: row.payload ? JSON.parse(row.payload) : null,
    };
  },

  create: async ({ token, customer_email, customer_name, payload, expires_at }) =>
    await db
      .prepare('INSERT INTO quote_drafts (token, customer_email, customer_name, payload, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id')
      .get(token, customer_email || null, customer_name || null, JSON.stringify(payload), expires_at || null),

  update: async (token, { customer_email, customer_name, payload, expires_at }) =>
    await db
      .prepare('UPDATE quote_drafts SET customer_email=$1, customer_name=$2, payload=$3, expires_at=$4, updated_at=CURRENT_TIMESTAMP WHERE token=$5')
      .run(customer_email || null, customer_name || null, JSON.stringify(payload), expires_at || null, token),

  pruneExpired: async () =>
    await db.prepare('DELETE FROM quote_drafts WHERE expires_at < CURRENT_TIMESTAMP').run(),
};
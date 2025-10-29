// server/src/routes/stats.routes.js
import { Router } from "express";
import dayjs from "dayjs";
import { db } from "../db.js";

const r = Router();

// GET /stats/summary  (montado con requireAuth en index.js)
r.get("/summary", (req, res) => {
  const now = dayjs();
  const from7  = now.subtract(7,  "day").format("YYYY-MM-DD HH:mm:ss");
  const from14 = now.subtract(13, "day").startOf("day");
  const from30 = now.subtract(30, "day").format("YYYY-MM-DD HH:mm:ss");

  const total    = db.prepare(`SELECT COUNT(*) c FROM quotes`).get().c;
  const pending  = db.prepare(`SELECT COUNT(*) c FROM quotes WHERE status='pending'`).get().c;
  const approved = db.prepare(`SELECT COUNT(*) c FROM quotes WHERE status='approved'`).get().c;
  const closed   = db.prepare(`SELECT COUNT(*) c FROM quotes WHERE status='closed'`).get().c;

  const last7 = db
    .prepare(`SELECT COUNT(*) c FROM quotes WHERE datetime(created_at) >= datetime(?)`)
    .get(from7).c;

  // Serie últimos 14 días
  const rows = db.prepare(`
    SELECT date(created_at) d, COUNT(*) c
    FROM quotes
    WHERE date(created_at) >= date(?)
    GROUP BY date(created_at)
    ORDER BY d ASC
  `).all(from14.format("YYYY-MM-DD"));

  const series14d = [];
  for (let i = 0; i < 14; i++) {
    const d = from14.add(i, "day").format("YYYY-MM-DD");
    const f = rows.find(r => r.d === d);
    series14d.push({ day: d, count: f ? f.c : 0 });
  }

  // Top productos (30d) por líneas de ítem
  const top_products = db.prepare(`
    SELECT COALESCE(qi.product_name, 'Producto') AS label, COUNT(*) AS count
    FROM quote_items qi
    JOIN quotes q ON q.id = qi.quote_id
    WHERE datetime(q.created_at) >= datetime(?)
    GROUP BY label
    ORDER BY count DESC
    LIMIT 5
  `).all(from30);

  // Top categorías (30d) — requiere product_id asociado
  const top_categories = db.prepare(`
    SELECT COALESCE(c.name, 'Sin categoría') AS label, COUNT(*) AS count
    FROM quote_items qi
    JOIN quotes q ON q.id = qi.quote_id
    JOIN products p ON p.id = qi.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE datetime(q.created_at) >= datetime(?)
    GROUP BY label
    ORDER BY count DESC
    LIMIT 5
  `).all(from30);

  // Clientes únicos (30d)
  const unique_customers_30d = db.prepare(`
    SELECT COUNT(DISTINCT customer_email) AS c
    FROM quotes
    WHERE datetime(created_at) >= datetime(?)
  `).get(from30).c;

  // PDFs enviados (30d): hay pdf_path
  const pdfs_sent_30d = db.prepare(`
    SELECT COUNT(*) AS c
    FROM quotes
    WHERE pdf_path IS NOT NULL AND TRIM(pdf_path) <> ''
      AND datetime(created_at) >= datetime(?)
  `).get(from30).c;

  // Ítems por cotización (promedio, 30d)
  const avgRow = db.prepare(`
    SELECT AVG(cnt) AS avg_items
    FROM (
      SELECT COUNT(*) AS cnt
      FROM quote_items qi
      JOIN quotes q ON q.id = qi.quote_id
      WHERE datetime(q.created_at) >= datetime(?)
      GROUP BY q.id
    )
  `).get(from30);
  const avg_items_per_quote = avgRow?.avg_items ?? 0;

  res.json({
    total,
    last7,
    pending,
    approved,
    closed,
    series14d,
    top_products,
    top_categories,
    unique_customers_30d,
    pdfs_sent_30d,
    avg_items_per_quote,
  });
});

r.get("/products-analytics", (req, res) => {
  try {
    const { period = "30" } = req.query;
    const now = dayjs();
    const fromDate = now.subtract(Number(period), "day").format("YYYY-MM-DD HH:mm:ss");

    let mostQuoted = [];
    try {
      mostQuoted = db.prepare(`
        SELECT
          p.id,
          p.name,
          p.sku,
          p.image_url,
          COUNT(qi.id) as quote_count,
          SUM(qi.qty) as total_quantity
        FROM quote_items qi
        JOIN products p ON p.id = qi.product_id
        JOIN quotes q ON q.id = qi.quote_id
        WHERE datetime(q.created_at) >= datetime(?)
        GROUP BY p.id
        ORDER BY quote_count DESC
        LIMIT 10
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching mostQuoted:", err);
    }

    let byCategory = [];
    try {
      byCategory = db.prepare(`
        SELECT
          COALESCE(c.name, 'Sin categoría') as category,
          COUNT(DISTINCT qi.id) as quote_items,
          COUNT(DISTINCT q.id) as quotes
        FROM quote_items qi
        JOIN quotes q ON q.id = qi.quote_id
        LEFT JOIN products p ON p.id = qi.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE datetime(q.created_at) >= datetime(?)
        GROUP BY category
        ORDER BY quote_items DESC
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching byCategory:", err);
    }

    let stockStatus = [];
    try {
      stockStatus = db.prepare(`
        SELECT
          stock_status,
          COUNT(*) as count
        FROM products
        GROUP BY stock_status
      `).all();
    } catch (err) {
      console.error("Error fetching stockStatus:", err);
    }

    res.json({
      mostQuoted: mostQuoted || [],
      byCategory: byCategory || [],
      stockStatus: stockStatus || [],
    });
  } catch (error) {
    console.error("Error in products analytics:", error);
    res.status(500).json({ error: "Error al obtener analíticas de productos" });
  }
});

r.get("/customers-analytics", (req, res) => {
  try {
    const { period = "30" } = req.query;
    const now = dayjs();
    const fromDate = now.subtract(Number(period), "day").format("YYYY-MM-DD HH:mm:ss");

    let topCustomers = [];
    try {
      topCustomers = db.prepare(`
        SELECT
          c.id,
          c.name,
          c.email,
          c.company,
          c.total_quotes,
          c.last_quote_date
        FROM customers c
        WHERE c.total_quotes > 0
        ORDER BY c.total_quotes DESC
        LIMIT 10
      `).all();
    } catch (err) {
      console.error("Error fetching topCustomers:", err);
    }

    let customersByStatus = [];
    try {
      customersByStatus = db.prepare(`
        SELECT
          status,
          COUNT(*) as count
        FROM customers
        GROUP BY status
      `).all();
    } catch (err) {
      console.error("Error fetching customersByStatus:", err);
    }

    let newCustomers = 0;
    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count
        FROM customers
        WHERE datetime(created_at) >= datetime(?)
      `).get(fromDate);
      newCustomers = result?.count || 0;
    } catch (err) {
      console.error("Error fetching newCustomers:", err);
    }

    let customerGrowth = [];
    try {
      customerGrowth = db.prepare(`
        SELECT
          date(created_at) as day,
          COUNT(*) as count
        FROM customers
        WHERE datetime(created_at) >= datetime(?)
        GROUP BY day
        ORDER BY day ASC
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching customerGrowth:", err);
    }

    res.json({
      topCustomers: topCustomers || [],
      customersByStatus: customersByStatus || [],
      newCustomers,
      customerGrowth: customerGrowth || [],
    });
  } catch (error) {
    console.error("Error in customers analytics:", error);
    res.status(500).json({ error: "Error al obtener analíticas de clientes" });
  }
});

r.get("/quotes-analytics", (req, res) => {
  try {
    const { period = "30" } = req.query;
    const now = dayjs();
    const fromDate = now.subtract(Number(period), "day").format("YYYY-MM-DD HH:mm:ss");

    let quotesByStatus = [];
    try {
      quotesByStatus = db.prepare(`
        SELECT
          status,
          COUNT(*) as count
        FROM quotes
        WHERE datetime(created_at) >= datetime(?)
        GROUP BY status
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching quotesByStatus:", err);
    }

    let conversionRate = { total: 0, approved: 0 };
    try {
      conversionRate = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
        FROM quotes
        WHERE datetime(created_at) >= datetime(?)
      `).get(fromDate) || { total: 0, approved: 0 };
    } catch (err) {
      console.error("Error fetching conversionRate:", err);
    }

    let avgResponseTime = { avg_hours: 0 };
    try {
      avgResponseTime = db.prepare(`
        SELECT
          AVG(
            CAST((julianday(status_updated_at) - julianday(created_at)) * 24 AS REAL)
          ) as avg_hours
        FROM quotes
        WHERE status != 'pending'
          AND datetime(created_at) >= datetime(?)
          AND status_updated_at IS NOT NULL
      `).get(fromDate) || { avg_hours: 0 };
    } catch (err) {
      console.error("Error fetching avgResponseTime:", err);
    }

    let quotesTrend = [];
    try {
      quotesTrend = db.prepare(`
        SELECT
          date(created_at) as day,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM quotes
        WHERE datetime(created_at) >= datetime(?)
        GROUP BY day
        ORDER BY day ASC
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching quotesTrend:", err);
    }

    res.json({
      quotesByStatus,
      conversionRate: {
        total: conversionRate.total,
        approved: conversionRate.approved,
        rate: conversionRate.total > 0
          ? ((conversionRate.approved / conversionRate.total) * 100).toFixed(2)
          : 0,
      },
      avgResponseTime: avgResponseTime.avg_hours
        ? avgResponseTime.avg_hours.toFixed(2)
        : 0,
      quotesTrend,
    });
  } catch (error) {
    console.error("Error in quotes analytics:", error);
    res.status(500).json({ error: "Error al obtener analíticas de cotizaciones" });
  }
});

export default r;
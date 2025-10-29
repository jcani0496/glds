 // server/src/routes/stats.routes.js
import { Router } from "express";
import dayjs from "dayjs";
import { db } from "../db.js";

const r = Router();

 // GET /stats/summary  (montado con requireAuth en index.js)
r.get("/summary", async (req, res) => {
  try {
    const now = dayjs();
    const from7  = now.subtract(7,  "day").format("YYYY-MM-DD HH:mm:ss");
    const from14 = now.subtract(13, "day").startOf("day");
    const from30 = now.subtract(30, "day").format("YYYY-MM-DD HH:mm:ss");

    const totalRow = await db.prepare(`SELECT COUNT(*) as c FROM quotes`).get();
    const total = totalRow?.c || 0;

    const pendingRow = await db.prepare(`SELECT COUNT(*) as c FROM quotes WHERE status='pending'`).get();
    const pending = pendingRow?.c || 0;

    const approvedRow = await db.prepare(`SELECT COUNT(*) as c FROM quotes WHERE status='approved'`).get();
    const approved = approvedRow?.c || 0;

    const closedRow = await db.prepare(`SELECT COUNT(*) as c FROM quotes WHERE status='closed'`).get();
    const closed = closedRow?.c || 0;

    const last7Row = await db
      .prepare(`SELECT COUNT(*) as c FROM quotes WHERE created_at >= $1`)
      .get(from7);
    const last7 = last7Row?.c || 0;

    // Serie últimos 14 días
    const rows = await db.prepare(`
      SELECT DATE(created_at) as d, COUNT(*) as c
      FROM quotes
      WHERE DATE(created_at) >= $1
      GROUP BY DATE(created_at)
      ORDER BY d ASC
    `).all(from14.format("YYYY-MM-DD"));

    const series14d = [];
    for (let i = 0; i < 14; i++) {
      const d = from14.add(i, "day").format("YYYY-MM-DD");
      const f = rows.find(r => r.d === d);
      series14d.push({ day: d, count: f ? f.c : 0 });
    }

    // Top productos (30d) por líneas de ítem
    const top_products = await db.prepare(`
      SELECT COALESCE(qi.product_name, 'Producto') AS label, COUNT(*) AS count
      FROM quote_items qi
      JOIN quotes q ON q.id = qi.quote_id
      WHERE q.created_at >= $1
      GROUP BY label
      ORDER BY count DESC
      LIMIT 5
    `).all(from30);

    // Top categorías (30d) — requiere product_id asociado
    const top_categories = await db.prepare(`
      SELECT COALESCE(c.name, 'Sin categoría') AS label, COUNT(*) AS count
      FROM quote_items qi
      JOIN quotes q ON q.id = qi.quote_id
      JOIN products p ON p.id = qi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE q.created_at >= $1
      GROUP BY label
      ORDER BY count DESC
      LIMIT 5
    `).all(from30);

    // Clientes únicos (30d)
    const uniqueCustomersRow = await db.prepare(`
      SELECT COUNT(DISTINCT customer_email) AS c
      FROM quotes
      WHERE created_at >= $1
    `).get(from30);
    const unique_customers_30d = uniqueCustomersRow?.c || 0;

    // PDFs enviados (30d): hay pdf_path
    const pdfsSentRow = await db.prepare(`
      SELECT COUNT(*) AS c
      FROM quotes
      WHERE pdf_path IS NOT NULL AND TRIM(pdf_path) <> ''
        AND created_at >= $1
    `).get(from30);
    const pdfs_sent_30d = pdfsSentRow?.c || 0;

    // Ítems por cotización (promedio, 30d)
    const avgRow = await db.prepare(`
      SELECT AVG(cnt) AS avg_items
      FROM (
        SELECT quote_id, COUNT(*) AS cnt
        FROM quote_items
        GROUP BY quote_id
      ) sub
      JOIN quotes q ON q.id = sub.quote_id
      WHERE q.created_at >= $1
    `).get(from30);
    const avg_items_per_quote = avgRow?.avg_items || 0;

    res.json({
      total,
      pending,
      approved,
      closed,
      last7,
      series14d,
      top_products,
      top_categories,
      unique_customers_30d,
      pdfs_sent_30d,
      avg_items_per_quote,
    });
  } catch (error) {
    console.error("Error in summary stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas", message: error.message });
  }
});

r.get("/products-analytics", async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const now = dayjs();
    const fromDate = now.subtract(Number(period), "day").format("YYYY-MM-DD HH:mm:ss");

    let mostQuoted = [];
    try {
      mostQuoted = await db.prepare(`
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
        WHERE q.created_at >= $1
        GROUP BY p.id, p.name, p.sku, p.image_url
        ORDER BY quote_count DESC
        LIMIT 10
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching mostQuoted:", err);
    }

    let byCategory = [];
    try {
      byCategory = await db.prepare(`
        SELECT
          COALESCE(c.name, 'Sin categoría') as category,
          COUNT(DISTINCT qi.id) as quote_items,
          COUNT(DISTINCT q.id) as quotes
        FROM quote_items qi
        JOIN quotes q ON q.id = qi.quote_id
        LEFT JOIN products p ON p.id = qi.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE q.created_at >= $1
        GROUP BY c.name
        ORDER BY quote_items DESC
      `).all(fromDate);
    } catch (err) {
      console.error("Error fetching byCategory:", err);
    }

    let stockStatus = [];
    try {
      stockStatus = await db.prepare(`
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
    res.status(500).json({ error: "Error al obtener analíticas de productos", message: error.message });
  }
});

r.get("/customers-analytics", async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const now = dayjs();
    const fromDate = now.subtract(Number(period), "day").format("YYYY-MM-DD HH:mm:ss");

    let topCustomers = [];
    try {
      topCustomers = await db.prepare(`
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
      customersByStatus = await db.prepare(`
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
      const result = await db.prepare(`
        SELECT COUNT(*) as count
        FROM customers
        WHERE created_at >= $1
      `).get(fromDate);
      newCustomers = result?.count || 0;
    } catch (err) {
      console.error("Error fetching newCustomers:", err);
    }

    let customerGrowth = [];
    try {
      customerGrowth = await db.prepare(`
        SELECT
          DATE(created_at) as day,
          COUNT(*) as count
        FROM customers
        WHERE created_at >= $1
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
    res.status(500).json({ error: "Error al obtener analíticas de clientes", message: error.message });
  }
});

r.get("/quotes-analytics", async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const now = dayjs();
    const fromDate = now.subtract(Number(period), "day").format("YYYY-MM-DD HH:mm:ss");

    let quotesByStatus = [];
    try {
      quotesByStatus = await db.prepare(`
        SELECT
          status,
          COUNT(*) as count
        FROM quotes
        WHERE created_at >= $1
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
        WHERE created_at >= $1
      `).get(fromDate) || { total: 0, approved: 0 };
    } catch (err) {
      console.error("Error fetching conversionRate:", err);
    }

    let avgResponseTime = { avg_hours: 0 };
    try {
      avgResponseTime = await db.prepare(`
        SELECT
          AVG(
            EXTRACT(EPOCH FROM (status_updated_at - created_at)) / 3600
          ) as avg_hours
        FROM quotes
        WHERE status != 'pending'
          AND created_at >= $1
          AND status_updated_at IS NOT NULL
      `).get(fromDate) || { avg_hours: 0 };
    } catch (err) {
      console.error("Error fetching avgResponseTime:", err);
    }

    let quotesTrend = [];
    try {
      quotesTrend = await db.prepare(`
        SELECT
          DATE(created_at) as day,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM quotes
        WHERE created_at >= $1
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
    res.status(500).json({ error: "Error al obtener analíticas de cotizaciones", message: error.message });
  }
});

export default r;
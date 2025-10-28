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

export default r;
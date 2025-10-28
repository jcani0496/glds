import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { quotes, products } from "../models.js";
import { buildQuotePDF } from "../pdf.js";
import { sendQuoteEmail } from "../mailer.js";
import { requireAuth } from "../auth.js";
import { notifyNewQuote } from "../socket.js";
import { db } from "../db.js";

export default (io) => {
  const r = Router();

  // Pública: crear cotización
  r.post("/", async (req, res) => {
    try {
      const {
        customer_name,
        customer_email,
        customer_phone,
        customer_company, // NUEVO
        notes,
        items,
      } = req.body || {};

      if (
        !customer_name ||
        !customer_email ||
        !Array.isArray(items) ||
        !items.length
      ) {
        return res.status(400).json({ error: "Datos incompletos" });
      }

      const code = "Q" + Date.now();
      const out = quotes.create({
        code,
        customer_name,
        customer_email,
        customer_phone,
        customer_company,
        notes,
      });
      const quote_id = out.lastInsertRowid;

      for (const it of items) {
        let prod = null;
        if (it.product_id) prod = products.get(Number(it.product_id));
        quotes.addItem({
          quote_id,
          product_id: prod?.id || null,
          product_name: prod?.name || it.product_name || "Producto",
          sku: prod?.sku || it.sku || null,
          qty: Number(it.qty || 1),
          color: it.color || null,
          customization: it.customization || null,
        });
      }

      const quote = quotes.get(quote_id);
      const itemsDb = quotes.items(quote_id);

      const { filePath, webPath } = await buildQuotePDF({
        quote,
        items: itemsDb,
      });

      quotes.setPdfPath(quote_id, webPath);

      try {
        await sendQuoteEmail({
          to: customer_email,
          subject: `GLDS – Cotización ${code}`,
          html: `<p>Hola ${customer_name},</p><p>Adjuntamos tu cotización <b>${code}</b>.</p><p>Gracias por cotizar con GLDS.</p>`,
          attachments: [{ filename: `${code}.pdf`, path: filePath }],
        });
      } catch (e) {
        console.error("[mailer] error:", e?.message || e);
      }

      notifyNewQuote(io, { id: quote_id, code, customer_name });

      res.json({ ok: true, id: quote_id, code, pdf_url: webPath });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error al generar la cotización" });
    }
  });

  // Admin: listar
  r.get("/", requireAuth, (req, res) => {
    const { status } = req.query;
    res.json(quotes.list({ status }));
  });

  // Admin: detalle
  r.get("/:id", requireAuth, (req, res) => {
    const q = quotes.get(Number(req.params.id));
    if (!q) return res.status(404).json({ error: "Not found" });
    const items = quotes.items(q.id);
    res.json({ quote: q, items });
  });

  // Admin: cambiar estado (incluye approved)
  r.patch("/:id/status", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const allowed = new Set(["pending", "reviewing", "sent", "approved", "closed"]);
    const next = allowed.has(status) ? status : "pending";
    quotes.setStatus(id, next);
    try {
      io.emit("quote:updated", { id, status: next });
    } catch {}
    res.json({ ok: true, status: next });
  });

  // Admin: eliminar todas (pruebas)
  r.delete("/", requireAuth, (req, res) => {
    try {
      const all = quotes.list();
      for (const q of all) {
        if (q.pdf_path) {
          const rel = q.pdf_path.replace(/^\//, "");
          const filePath = path.join(process.cwd(), rel);
          try { fs.unlinkSync(filePath); } catch {}
        }
      }
      db.prepare("DELETE FROM quote_items").run();
      db.prepare("DELETE FROM quotes").run();
      res.json({ ok: true, deleted: all.length });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "delete_all_failed" });
    }
  });

  return r;
};
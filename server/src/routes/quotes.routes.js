import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { quotes, products, quoteEvents, quoteDrafts } from "../models.js";
import { buildQuotePDF } from "../pdf.js";
import { sendQuoteEmail } from "../mailer.js";
import { requireAuth } from "../auth.js";
import { notifyNewQuote } from "../socket.js";
import { db } from "../db.js";

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

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

      const tracking_token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      quotes.setTrackingToken(quote_id, tracking_token);

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

      quoteEvents.create({
        quote_id,
        type: "created",
        payload: { customer_email, total_items: itemsDb.length },
      });

      const { filePath, webPath } = await buildQuotePDF({
        quote,
        items: itemsDb,
      });

      quotes.setPdfPath(quote_id, webPath);

      try {
        await sendQuoteEmail({
          to: customer_email,
          subject: `GLDS – Cotización ${code}`,
          html: `<p>Hola ${customer_name},</p><p>Adjuntamos tu cotización <b>${code}</b>.</p><p>Puedes hacer seguimiento en cualquier momento: <a href="${process.env.PUBLIC_BASE_URL || "http://localhost:5173"}/track/${tracking_token}">Ver estado</a>.</p><p>Gracias por cotizar con GLDS.</p>`,
          attachments: [{ filename: `${code}.pdf`, path: filePath }],
        });
      } catch (e) {
        console.error("[mailer] error:", e?.message || e);
      }

      notifyNewQuote(io, { id: quote_id, code, customer_name });

      res.json({ ok: true, id: quote_id, code, pdf_url: webPath, tracking_token });
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
    const { status, follow_up_at, expected_delivery, note } = req.body || {};
    const allowed = new Set(["pending", "reviewing", "sent", "approved", "closed"]);
    const next = allowed.has(status) ? status : "pending";
    quotes.setStatus(id, next);
    if (follow_up_at !== undefined) quotes.setFollowUp(id, follow_up_at || null);
    if (expected_delivery !== undefined) quotes.setExpectedDelivery(id, expected_delivery || null);
    if (note) {
      quoteEvents.create({ quote_id: id, type: "status_note", payload: note });
    }
    quoteEvents.create({ quote_id: id, type: "status_changed", payload: { status: next } });
    try {
      io.emit("quote:updated", { id, status: next });
    } catch {}
    const quote = quotes.get(id);
    res.json({ ok: true, status: next, quote });
  });

  // Admin: eliminar todas (pruebas)
  r.delete("/", requireAuth, (req, res) => {
    try {
      const all = quotes.list();
      for (const q of all) {
        if (q.pdf_path) {
          const rel = q.pdf_path.replace(/^\//, "");
          const filePath = path.join(process.cwd(), rel);
          try {
            fs.unlinkSync(filePath);
          } catch {}
        }
        db.prepare("DELETE FROM quote_events WHERE quote_id = ?").run(q.id);
      }
      db.prepare("DELETE FROM quote_items").run();
      db.prepare("DELETE FROM quotes").run();
      res.json({ ok: true, deleted: all.length });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "delete_all_failed" });
    }
  });

  // Admin: registrar recordatorio manual
  r.post("/:id/reminders", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const { channel = "email", note } = req.body || {};
    quotes.incrementReminder(id);
    quoteEvents.create({ quote_id: id, type: "reminder", payload: { channel, note: note || null } });
    res.json({ ok: true });
  });

  // Admin: anotar visitas del cliente
  r.post("/:id/events", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const { type, payload } = req.body || {};
    if (!type) return res.status(400).json({ error: "type_required" });
    quoteEvents.create({ quote_id: id, type, payload: payload || null });
    res.json({ ok: true });
  });

  // Pública: seguimiento por token
  r.get("/track/:token", (req, res) => {
    const { token } = req.params;
    const quote = quotes.getByTrackingToken(token);
    if (!quote) return res.status(404).json({ error: "not_found" });
    const items = quotes.items(quote.id);
    const events = quoteEvents.list(quote.id).map((ev) => ({
      ...ev,
      payload: ev.payload ? safeParseJSON(ev.payload) : null,
    }));
    quotes.touchPortalSeen(quote.id);
    res.json({ quote, items, events });
  });

  // Pública: recuperar borrador
  r.get("/drafts/:token", (req, res) => {
    const draft = quoteDrafts.get(req.params.token);
    if (!draft) return res.status(404).json({ error: "not_found" });
    res.json(draft);
  });

  r.post("/drafts", (req, res) => {
    const { token, payload, customer_email, customer_name, expires_at } = req.body || {};
    if (!payload) return res.status(400).json({ error: "payload_required" });
    const draftToken = token || Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const existing = token ? quoteDrafts.get(token) : null;
    if (existing) {
      quoteDrafts.update(draftToken, { payload, customer_email, customer_name, expires_at });
    } else {
      quoteDrafts.create({ token: draftToken, payload, customer_email, customer_name, expires_at });
    }
    quoteDrafts.pruneExpired();
    res.json({ ok: true, token: draftToken });
  });

  return r;
};
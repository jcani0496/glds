import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { quotes, products, quoteEvents, quoteDrafts } from "../models.js";
import { buildQuotePDF } from "../pdf.js";
import { sendQuoteEmail } from "../mailer.js";
import { quoteEmailWithCloudinary, quoteEmailWithAttachment } from "../templates/quote-email.js";
import { requireAuth } from "../auth.js";
import { db } from "../db.js";

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const router = Router();

// Pública: crear cotización
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_company,
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
    const out = await quotes.create({
      code,
      customer_name,
      customer_email,
      customer_phone,
      customer_company,
      notes,
    });
    const quote_id = out?.id;

    const tracking_token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    await quotes.setTrackingToken(quote_id, tracking_token);

    for (const it of items) {
      let prod = null;
      if (it.product_id) prod = await products.get(Number(it.product_id));
      await quotes.addItem({
        quote_id,
        product_id: prod?.id || null,
        product_name: prod?.name || it.product_name || "Producto",
        sku: prod?.sku || it.sku || null,
        qty: Number(it.qty || 1),
        color: it.color || null,
        customization: it.customization || null,
      });
    }

    const quote = await quotes.get(quote_id);
    const itemsDb = await quotes.items(quote_id);

    await quoteEvents.create({
      quote_id,
      type: "created",
      payload: { customer_email, total_items: itemsDb.length },
    });

    const { filePath, webPath } = await buildQuotePDF({
      quote,
      items: itemsDb,
    });

    await quotes.setPdfPath(quote_id, webPath);

    try {
      const isCloudinaryUrl = webPath.startsWith('http');
      const trackingUrl = `${process.env.PUBLIC_BASE_URL || "http://localhost:5173"}/track/${tracking_token}`;

      if (isCloudinaryUrl) {
        await sendQuoteEmail({
          to: customer_email,
          subject: `GLDS – Cotización ${code}`,
          html: quoteEmailWithCloudinary({
            customer_name,
            code,
            pdfUrl: webPath,
            trackingUrl
          }),
        });
      } else {
        await sendQuoteEmail({
          to: customer_email,
          subject: `GLDS – Cotización ${code}`,
          html: quoteEmailWithAttachment({
            customer_name,
            code,
            trackingUrl
          }),
          attachments: [{ filename: `${code}.pdf`, path: filePath }],
        });
      }
    } catch (e) {
      console.error("[mailer] error:", e?.message || e);
    }

    res.json({ ok: true, id: quote_id, code, pdf_url: webPath, tracking_token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al generar la cotización", message: e.message });
  }
});

// Admin: listar
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const list = await quotes.list({ status, limit: limit ? Number(limit) : undefined });
    res.json(list || []);
  } catch (error) {
    console.error("Error listing quotes:", error);
    res.status(500).json({ error: "Error al obtener cotizaciones", message: error.message });
  }
});

// Admin: detalle
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const q = await quotes.get(Number(req.params.id));
    if (!q) return res.status(404).json({ error: "Not found" });
    const items = await quotes.items(q.id);
    res.json({ quote: q, items });
  } catch (error) {
    console.error("Error getting quote:", error);
    res.status(500).json({ error: "Error al obtener cotización", message: error.message });
  }
});

// Admin: cambiar estado (incluye approved)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, follow_up_at, expected_delivery, note } = req.body || {};
    const allowed = new Set(["pending", "reviewing", "sent", "approved", "closed"]);
    const next = allowed.has(status) ? status : "pending";
    await quotes.setStatus(id, next);
    if (follow_up_at !== undefined) await quotes.setFollowUp(id, follow_up_at || null);
    if (expected_delivery !== undefined) await quotes.setExpectedDelivery(id, expected_delivery || null);
    if (note) {
      await quoteEvents.create({ quote_id: id, type: "status_note", payload: note });
    }
    await quoteEvents.create({ quote_id: id, type: "status_changed", payload: { status: next } });
    const quote = await quotes.get(id);
    res.json({ ok: true, status: next, quote });
  } catch (error) {
    console.error("Error updating quote status:", error);
    res.status(500).json({ error: "Error al actualizar estado", message: error.message });
  }
});

// Admin: eliminar todas (pruebas)
router.delete("/", requireAuth, async (req, res) => {
  try {
    const all = await quotes.list();
    for (const q of all) {
      if (q.pdf_path) {
        const rel = q.pdf_path.replace(/^\//, "");
        const filePath = path.join(process.cwd(), rel);
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
      await db.prepare("DELETE FROM quote_events WHERE quote_id = $1").run(q.id);
    }
    await db.prepare("DELETE FROM quote_items").run();
    await db.prepare("DELETE FROM quotes").run();
    res.json({ ok: true, deleted: all.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "delete_all_failed", message: e.message });
  }
});

// Admin: registrar recordatorio manual
router.post("/:id/reminders", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { channel = "email", note } = req.body || {};
    await quotes.incrementReminder(id);
    await quoteEvents.create({ quote_id: id, type: "reminder", payload: { channel, note: note || null } });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ error: "Error al crear recordatorio", message: error.message });
  }
});

// Admin: anotar visitas del cliente
router.post("/:id/events", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, payload } = req.body || {};
    if (!type) return res.status(400).json({ error: "type_required" });
    await quoteEvents.create({ quote_id: id, type, payload: payload || null });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Error al crear evento", message: error.message });
  }
});

// Pública: seguimiento por token
router.get("/track/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const quote = await quotes.getByTrackingToken(token);
    if (!quote) return res.status(404).json({ error: "not_found" });
    const items = await quotes.items(quote.id);
    const events = await quoteEvents.list(quote.id);
    const parsedEvents = events.map((ev) => ({
      ...ev,
      payload: ev.payload ? safeParseJSON(ev.payload) : null,
    }));
    await quotes.touchPortalSeen(quote.id);
    res.json({ quote, items, events: parsedEvents });
  } catch (error) {
    console.error("Error tracking quote:", error);
    res.status(500).json({ error: "Error al obtener seguimiento", message: error.message });
  }
});

// Pública: recuperar borrador
router.get("/drafts/:token", async (req, res) => {
  try {
    const draft = await quoteDrafts.get(req.params.token);
    if (!draft) return res.status(404).json({ error: "not_found" });
    res.json(draft);
  } catch (error) {
    console.error("Error getting draft:", error);
    res.status(500).json({ error: "Error al obtener borrador", message: error.message });
  }
});

router.post("/drafts", async (req, res) => {
  try {
    const { token, payload, customer_email, customer_name, expires_at } = req.body || {};
    if (!payload) return res.status(400).json({ error: "payload_required" });
    const draftToken = token || Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const existing = token ? await quoteDrafts.get(token) : null;
    if (existing) {
      await quoteDrafts.update(draftToken, { payload, customer_email, customer_name, expires_at });
    } else {
      await quoteDrafts.create({ token: draftToken, payload, customer_email, customer_name, expires_at });
    }
    await quoteDrafts.pruneExpired();
    res.json({ ok: true, token: draftToken });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ error: "Error al guardar borrador", message: error.message });
  }
});

export default router;
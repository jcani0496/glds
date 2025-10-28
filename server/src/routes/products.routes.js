import { Router } from "express";
import { products } from "../models.js";
import { requireAuth } from "../auth.js";

const r = Router();

/* LIST (público) — filtros + paginación opcional + colores */
r.get("/", (req, res) => {
  const { q, category_id, featured, sort, page, pageSize } = req.query;
  const filters = {
    q,
    sort,
    category_id: category_id ? Number(category_id) : undefined,
    featured: featured != null ? Number(featured) === 1 : undefined,
  };

  // Si piden paginación → objeto { items, total, page, pageSize }
  if (page || pageSize) {
    const pg = products.listWithColorsPaged({
      ...filters,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 12,
    });
    return res.json(pg);
  }

  // Si no, compatibilidad: devuelve array simple
  const list = products.listWithColors(filters);
  res.json(list);
});

/* GET one (público) — con colores */
r.get("/:id", (req, res) => {
  const p = products.getWithColors(Number(req.params.id));
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(p);
});

/* CREATE (admin) — admite color_ids */
r.post("/", requireAuth, (req, res) => {
  const { name, sku, description, image_url, featured, category_id, color_ids } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  const r2 = products.create({
    name,
    sku,
    description,
    image_url,
    featured: !!featured,
    category_id: category_id || null,
  });
  const id = r2.lastInsertRowid;

  if (Array.isArray(color_ids)) {
    products.setColors(id, color_ids);
  }
  const full = products.getWithColors(id);
  res.json({ ok: true, id, product: full });
});

/* UPDATE (admin) — admite color_ids */
r.put("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const prev = products.get(id);
  if (!prev) return res.status(404).json({ error: "not found" });

  const { name, sku, description, image_url, featured, category_id, color_ids } = req.body;
  products.update(id, {
    name: name ?? prev.name,
    sku: sku ?? prev.sku,
    description: description ?? prev.description,
    image_url: image_url ?? prev.image_url,
    featured: featured != null ? !!featured : !!prev.featured,
    category_id: category_id !== undefined ? category_id || null : prev.category_id,
  });

  if (Array.isArray(color_ids)) {
    products.setColors(id, color_ids);
  }

  const full = products.getWithColors(id);
  res.json({ ok: true, product: full });
});

/* DELETE (admin) */
r.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  products.remove(id);
  res.json({ ok: true });
});

export default r;
import { Router } from "express";
import { products } from "../models.js";
import { requireAuth } from "../auth.js";

const r = Router();

/* LIST (público) — filtros + paginación opcional + colores */
r.get("/", async (req, res) => {
  try {
    const { q, category_id, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly, sort, page, pageSize } = req.query;
    const filters = {
      q,
      sort,
      category_id: category_id ? Number(category_id) : undefined,
      featured: featured != null ? Number(featured) === 1 : undefined,
      material,
      use_case,
      delivery_time,
      stock_status,
      is_new: is_new != null ? Number(is_new) === 1 : undefined,
      is_popular: is_popular != null ? Number(is_popular) === 1 : undefined,
      is_eco_friendly: is_eco_friendly != null ? Number(is_eco_friendly) === 1 : undefined,
    };

    // Si piden paginación → objeto { items, total, page, pageSize }
    if (page || pageSize) {
      const pg = await products.listWithColorsPaged({
        ...filters,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 12,
      });
      return res.json(pg);
    }

    // Si no, compatibilidad: devuelve array simple
    const list = await products.listWithColors(filters);
    res.json(list || []);
  } catch (error) {
    console.error("Error listing products:", error);
    res.status(500).json({ error: "Error al obtener productos", message: error.message });
  }
});

/* GET one (público) — con colores */
r.get("/:id", async (req, res) => {
  try {
    const p = await products.getWithColors(Number(req.params.id));
    if (!p) return res.status(404).json({ error: "not found" });
    res.json(p);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Error al obtener producto", message: error.message });
  }
});

/* CREATE (admin) — admite color_ids */
r.post("/", requireAuth, async (req, res) => {
  try {
    const { name, sku, description, image_url, featured, category_id, color_ids, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const result = await products.create({
      name,
      sku,
      description,
      image_url,
      featured: !!featured,
      category_id: category_id || null,
      material,
      use_case,
      delivery_time,
      stock_status,
      is_new: !!is_new,
      is_popular: !!is_popular,
      is_eco_friendly: !!is_eco_friendly,
    });
    const id = result?.id;

    if (Array.isArray(color_ids)) {
      await products.setColors(id, color_ids);
    }
    const full = await products.getWithColors(id);
    res.json({ ok: true, id, product: full });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Error al crear producto", message: error.message });
  }
});

/* UPDATE (admin) — admite color_ids */
r.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const prev = await products.get(id);
    if (!prev) return res.status(404).json({ error: "not found" });

    const { name, sku, description, image_url, featured, category_id, color_ids, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly } = req.body;
    await products.update(id, {
      name: name ?? prev.name,
      sku: sku ?? prev.sku,
      description: description ?? prev.description,
      image_url: image_url ?? prev.image_url,
      featured: featured != null ? !!featured : !!prev.featured,
      category_id: category_id !== undefined ? category_id || null : prev.category_id,
      material: material ?? prev.material,
      use_case: use_case ?? prev.use_case,
      delivery_time: delivery_time ?? prev.delivery_time,
      stock_status: stock_status ?? prev.stock_status,
      is_new: is_new != null ? !!is_new : !!prev.is_new,
      is_popular: is_popular != null ? !!is_popular : !!prev.is_popular,
      is_eco_friendly: is_eco_friendly != null ? !!is_eco_friendly : !!prev.is_eco_friendly,
    });

    if (Array.isArray(color_ids)) {
      await products.setColors(id, color_ids);
    }

    const full = await products.getWithColors(id);
    res.json({ ok: true, product: full });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Error al actualizar producto", message: error.message });
  }
});

/* DELETE (admin) */
r.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await products.remove(id);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error al eliminar producto", message: error.message });
  }
});

export default r;
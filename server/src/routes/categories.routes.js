import { Router } from "express";
import { categories } from "../models.js";
import { requireAuth } from "../auth.js";

const r = Router();

// LIST (público)
r.get("/", async (req, res) => {
  try {
    const list = await categories.list();
    res.json(list || []);
  } catch (error) {
    console.error("Error listing categories:", error);
    res.status(500).json({ error: "Error al obtener categorías", message: error.message });
  }
});

// CREATE (admin)
r.post("/", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const result = await categories.create({ name });
    res.json({ ok: true, id: result?.id });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error al crear categoría", message: error.message });
  }
});

// UPDATE (admin)
r.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const exists = await categories.get(id);
    if (!exists) return res.status(404).json({ error: "not found" });
    await categories.update(id, { name: name ?? exists.name });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error al actualizar categoría", message: error.message });
  }
});

// DELETE (admin)
r.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await categories.remove(id);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Error al eliminar categoría", message: error.message });
  }
});

export default r;
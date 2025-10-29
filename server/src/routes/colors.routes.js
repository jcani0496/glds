import { Router } from "express";
import { colors } from "../models.js";
import { requireAuth } from "../auth.js";

const r = Router();

/* Listar colores (admin). Si quisieras que sea público, quita requireAuth */
r.get("/", requireAuth, async (req, res) => {
  try {
    const list = await colors.list({ activeOnly: false });
    res.json(list || []);
  } catch (error) {
    console.error("Error listing colors:", error);
    res.status(500).json({ error: "Error al obtener colores", message: error.message });
  }
});

r.post("/", requireAuth, async (req, res) => {
  try {
    const { name, hex, active = true } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });
    const ret = await colors.create({ name, hex, active: !!active });
    res.json({ ok: true, id: ret?.id });
  } catch (error) {
    console.error("Error creating color:", error);
    res.status(500).json({ error: "Error al crear color", message: error.message });
  }
});

r.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, hex, active } = req.body || {};
    await colors.update(id, { name, hex, active });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error updating color:", error);
    res.status(500).json({ error: "Error al actualizar color", message: error.message });
  }
});

r.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await colors.remove(id);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting color:", error);
    res.status(500).json({ error: "Error al eliminar color", message: error.message });
  }
});

export default r;
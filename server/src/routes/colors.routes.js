import { Router } from "express";
import { colors } from "../models.js";
import { requireAuth } from "../auth.js";

const r = Router();

/* Listar colores (admin). Si quisieras que sea público, quita requireAuth */
r.get("/", requireAuth, (req, res) => {
  const list = colors.list({ activeOnly: false });
  res.json(list);
});

r.post("/", requireAuth, (req, res) => {
  const { name, hex, active = true } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const ret = colors.create({ name, hex, active: !!active });
  res.json({ ok: true, id: ret.lastInsertRowid });
});

r.put("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { name, hex, active } = req.body || {};
  colors.update(id, { name, hex, active });
  res.json({ ok: true });
});

r.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  colors.remove(id);
  res.json({ ok: true });
});

export default r;
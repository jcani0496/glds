import { Router } from "express";
import { categories } from "../models.js";
import { requireAuth } from "../auth.js";

const r = Router();

// LIST (público)
r.get("/", (req, res) => {
  res.json(categories.list());
});

// CREATE (admin)
r.post("/", requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const r2 = categories.create({ name });
  res.json({ ok: true, id: r2.lastInsertRowid });
});

// UPDATE (admin)
r.put("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  const exists = categories.get(id);
  if (!exists) return res.status(404).json({ error: "not found" });
  categories.update(id, { name: name ?? exists.name });
  res.json({ ok: true });
});

// DELETE (admin)
r.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  categories.remove(id);
  res.json({ ok: true });
});

export default r;
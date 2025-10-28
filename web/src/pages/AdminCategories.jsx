import { useEffect, useState } from "react";
import api from "../lib/api";
import { Edit3, Trash2, Save, X } from "lucide-react";

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // edición inline
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  async function load() {
    const { data } = await api.get("/categories");
    setItems(data);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post("/categories", { name: name.trim() });
      setName("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await api.delete("/categories/" + id);
    await load();
  }

  function startEdit(c) {
    setEditId(c.id);
    setEditName(c.name);
  }
  function cancelEdit() {
    setEditId(null);
    setEditName("");
  }
  async function saveEdit() {
    if (!editId) return;
    await api.put(`/categories/${editId}`, { name: editName.trim() });
    cancelEdit();
    await load();
  }

  return (
    <section className="container mx-auto px-6 py-8">
      <h3 className="text-2xl font-semibold mb-4">Categorías</h3>

      <form onSubmit={create} className="flex items-center gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="w-[260px] px-3 py-2 rounded-lg bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className={`rounded-full px-5 py-2.5 font-semibold transition
          ${
            !name.trim() || loading
              ? "bg-white/10 text-white/50 cursor-not-allowed"
              : "bg-glds-primary text-zinc-900 hover:shadow-glow active:scale-[.98]"
          }
          focus:outline-none focus:ring-2 focus:ring-glds-primary/60`}
        >
          Añadir
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((c) => {
          const editing = editId === c.id;
          return (
            <li key={c.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/10">
              {!editing ? (
                <>
                  <span>{c.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 inline-flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Editar
                    </button>
                    <button
                      onClick={() => del(c.id)}
                      className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center gap-3">
                  <input
                    className="flex-1 bg-white/10 rounded px-3 py-2"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nombre"
                  />
                  <button onClick={cancelEdit} className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 inline-flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button onClick={saveEdit} className="px-3 py-2 rounded-full bg-glds-primary text-zinc-900 font-semibold inline-flex items-center gap-2 hover:shadow-glow active:scale-[.98]">
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
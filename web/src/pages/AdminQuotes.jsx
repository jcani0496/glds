import { useEffect, useState } from "react";
import api, { API } from "../lib/api.js";
import { Trash2 } from "lucide-react";

function resolvePdfUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API}${url.startsWith("/") ? url : `/${url}`}`;
}

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pendiente" },
  { value: "reviewing", label: "En revisión" },
  { value: "sent",      label: "Enviada" },
  { value: "approved",  label: "Aprobada" }, // 👈 NUEVO
  { value: "closed",    label: "Cerrada" },
];

export default function AdminQuotes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/quotes");
      setItems(data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDeleteAll() {
    if (!confirm("¿Eliminar TODAS las cotizaciones y sus PDFs?")) return;
    try {
      setDeletingAll(true);
      await api.delete("/quotes");
      await load();
      alert("Cotizaciones eliminadas.");
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    } finally {
      setDeletingAll(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/quotes/${id}/status`, { status });
      setItems((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status } : q))
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el estado.");
    }
  }

  return (
    <section className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold">Cotizaciones</h3>
        <button
          onClick={handleDeleteAll}
          disabled={deletingAll || loading || items.length === 0}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            deletingAll || loading || items.length === 0
              ? "bg-red-900/30 text-red-200/50 cursor-not-allowed"
              : "bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30"
          }`}
          title="Eliminar todas (solo pruebas)"
        >
          <Trash2 className="w-4 h-4" />
          {deletingAll ? "Eliminando..." : "Eliminar todas"}
        </button>
      </div>

      {loading ? (
        <div className="text-white/60">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="text-white/60">No hay cotizaciones.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((q) => (
            <li
              key={q.id}
              className="bg-white/[.06] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {q.code} — {q.customer_name}
                </div>
                <div className="text-xs text-white/60 truncate">
                  {q.customer_email} • {new Date(q.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Estado */}
                <select
                  value={q.status || "pending"}
                  onChange={(e) => updateStatus(q.id, e.target.value)}
                  className="bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-sm"
                  title="Cambiar estado"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                {/* Ver PDF */}
                {q.pdf_path ? (
                  <a
                    href={resolvePdfUrl(q.pdf_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-sm"
                  >
                    Ver PDF
                  </a>
                ) : (
                  <span className="text-xs text-white/50">Sin PDF</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
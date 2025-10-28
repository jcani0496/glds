// web/src/components/QuoteCartModal.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../lib/store.jsx";
import api from "../lib/api.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4002";

export default function QuoteCartModal() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isOpen = pathname === "/cart";

  const { state, dispatch } = useCart();
  const items = state.items || [];

  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && navigate(-1);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const totalQty = useMemo(
    () => items.reduce((a, b) => a + (b.qty || 1), 0),
    [items]
  );

  if (!isOpen) return null;

  const canSend =
    items.length > 0 && form.name && /\S+@\S+\.\S+/.test(form.email);

  async function handleSend() {
    if (!canSend || sending) return;
    try {
      setSending(true);
      const res = await api.post("/quotes", {
        customer_company: form.company || null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        notes: form.notes || null,
        items: items.map((it) => ({
          product_id: it.id || null,
          product_name: it.name,
          sku: it.sku || null,
          qty: it.qty || 1,
          color: it.color || null,
          customization: it.customization || null,
        })),
      });
      dispatch({ type: "CLEAR" });
      navigate(`/thanks?code=${encodeURIComponent(res.data?.code || "")}`);
    } catch (e) {
      console.error(e);
      alert("No se pudo enviar la cotización. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  function setQty(item, next) {
    const qty = Math.max(1, Number(next) || 1);
    dispatch({
      type: "UPDATE_QTY",
      payload: { key: item.key, id: item.id, color: item.color, customization: item.customization, qty },
    });
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => navigate(-1)} />

      <div className="relative w-[min(980px,92vw)] max-h-[86vh] overflow-hidden rounded-2xl border border-white/10 bg-[#101114]/95 text-white shadow-2xl border-beam">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Tu cotización</h3>
          <button className="p-2 rounded-full hover:bg-white/10" onClick={() => navigate(-1)} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_360px] gap-0">
          <div className="p-5 overflow-auto max-h-[70vh] md:max-h-[calc(86vh-140px)]">
            {items.length === 0 ? (
              <div className="text-center py-16 text-white/70">Tu carrito de cotización está vacío.</div>
            ) : (
              items.map((p) => {
                const imgSrc = p.image_url
                  ? p.image_url.startsWith("http")
                    ? p.image_url
                    : `${API_BASE}${p.image_url}`
                  : "/placeholder.svg";
                return (
                  <div key={p.key || p.id || p.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[.06] border border-white/10 mb-3">
                    <img src={imgSrc} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-xs opacity-70 truncate">
                        {p.sku ? `SKU: ${p.sku} • ` : ""}
                        {p.color ? `Color: ${p.color} • ` : ""}
                        Cant: {p.qty || 1}
                        {p.customization ? ` • Marcaje: ${p.customization}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(p, (p.qty || 1) - 1)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Disminuir">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={p.qty || 1}
                        onChange={(e) => setQty(p, e.target.value)}
                        className="w-16 text-center rounded-md bg-white/10 border border-white/10 px-2 py-1"
                      />
                      <button onClick={() => setQty(p, (p.qty || 1) + 1)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Aumentar">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => dispatch({ type: "REMOVE", payload: { key: p.key, id: p.id, color: p.color, customization: p.customization } })}
                      className="p-2 rounded-lg hover:bg-white/10"
                      title="Quitar"
                    >
                      <Trash2 className="w-4 h-4 text-red-300" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-5 border-t md:border-t-0 md:border-l border-white/10">
            <h4 className="font-semibold mb-3">Datos del solicitante ({totalQty} ítems)</h4>

            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded-lg bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                placeholder="Empresa (opcional)"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
              <input
                className="w-full px-3 py-2 rounded-lg bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="w-full px-3 py-2 rounded-lg bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                placeholder="Tu email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <input
                className="w-full px-3 py-2 rounded-lg bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                placeholder="Tu teléfono (opcional)"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                placeholder="Notas o requerimientos (opcional)"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Link to="/catalog" className="text-sm opacity-80 hover:opacity-100 underline underline-offset-4">
                Seguir viendo productos
              </Link>
              <button
                onClick={handleSend}
                disabled={!canSend || sending}
                className={`w-full rounded-full px-4 py-3 font-semibold transition ${
                  !canSend || sending ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-glds-primary text-zinc-900 hover:shadow-glow"
                }`}
              >
                {sending ? "Enviando..." : "Enviar cotización"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
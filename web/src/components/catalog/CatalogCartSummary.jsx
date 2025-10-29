import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store.jsx";

export default function CatalogCartSummary() {
  const { state } = useCart();
  const items = state.items || [];
  const totalQty = items.reduce((acc, item) => acc + Number(item.qty || 1), 0);
  const uniqueCount = items.length;

  if (!items.length) return null;

  return (
    <aside className="hidden xl:block fixed right-8 top-36 z-40 w-72 rounded-2xl border border-white/10 bg-white/[.05] p-5 shadow-[0_10px_40px_rgba(0,0,0,.35)] backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-glds-primary/90">
        <ShoppingCart className="h-4 w-4" />
        Resumen de tu cotización
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="opacity-70">Ítems únicos</span>
          <span className="font-semibold">{uniqueCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-70">Cantidad total</span>
          <span className="font-semibold">{totalQty}</span>
        </div>
        <ul className="mt-3 space-y-2 max-h-40 overflow-auto pr-1">
          {items.map((item) => (
            <li key={item.id || item.key || item.name} className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-2">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-xs opacity-60">SKU {item.sku || "-"} · Cant. {item.qty || 1}</p>
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/cart"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-glds-primary px-4 py-2 font-semibold text-zinc-900 transition hover:shadow-glow"
      >
        Gestionar cotización <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}

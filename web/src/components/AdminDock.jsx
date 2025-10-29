import { NavLink } from "react-router-dom";
import { LayoutGrid, Package, Tags, FileSpreadsheet } from "lucide-react";

export default function AdminDock() {
  const items = [
    { to: "/admin", label: "Dashboard", Icon: LayoutGrid, end: true },
    { to: "/admin/products", label: "Productos", Icon: Package },
    { to: "/admin/categories", label: "Categorías", Icon: Tags },
    { to: "/admin/quotes", label: "Cotizaciones", Icon: FileSpreadsheet },
  ];

  const baseBtn =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm " +
    "bg-zinc-900/60 hover:bg-zinc-900/80 text-zinc-200/90 hover:text-white " +
    "border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,.04)] " +
    "transition-colors focus:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  return (
    <div
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
      aria-label="Navegación de administración"
    >
      <nav
        className="backdrop-blur-md bg-zinc-900/30 border border-white/10 rounded-2xl p-1.5
                   shadow-[0_8px_30px_rgba(0,0,0,.35)]"
      >
        {/* Más separación entre botones */}
        <ul className="flex items-center gap-3 md:gap-4">
          {items.map(({ to, label, Icon, end }) => (
            <li key={to} className="shrink-0">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${baseBtn} ${isActive ? "ring-2 ring-violet-400/70" : ""}`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
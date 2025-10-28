// src/components/AdminDock.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Tag, FileText } from "lucide-react";

export default function AdminDock() {
  const { pathname } = useLocation();
  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, match: "/admin" },
    { to: "/admin/products", label: "Productos", icon: Package, match: "/admin/products" },
    { to: "/admin/categories", label: "Categorías", icon: Tag, match: "/admin/categories" },
    { to: "/admin/quotes", label: "Cotizaciones", icon: FileText, match: "/admin/quotes" },
  ];

  return (
    <nav
      aria-label="Secciones del administrador"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/[.06] border border-white/10 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.25)]">
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = pathname === match;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                active
                  ? "bg-white/[.08] text-white shadow-glow"
                  : "text-white/80 hover:text-white hover:bg-white/[.06]",
              ].join(" ")}
            >
              <Icon className="w-4 h-4 opacity-90" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
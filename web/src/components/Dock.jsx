import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Sparkles,
  Mail,
  Boxes,
  Users,
  Star,
  ShoppingCart,
} from "lucide-react";

export default function Dock() {
  const { pathname } = useLocation();

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/about", label: "Acerca de", icon: Sparkles },
    { to: "/contact", label: "Contáctanos", icon: Mail },
    { to: "/catalog", label: "Catálogo", icon: Boxes },
    { to: "/clients", label: "Clientes", icon: Users },
    { to: "/featured", label: "Destacados", icon: Star },
    { to: "/cart", label: "Carrito", icon: ShoppingCart },
  ];

  return (
    <nav
      aria-label="Secciones del sitio"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div
        className="
          pointer-events-auto inline-flex items-center gap-2
          rounded-2xl px-3 py-2
          bg-white/[.06] border border-white/10 backdrop-blur-md
          shadow-[0_10px_40px_rgba(0,0,0,.25)]"
      >
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            pathname === to ||
            (to !== "/" && pathname.startsWith(to));
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
import { NavLink } from "react-router-dom";
import { LayoutGrid, Package, Tags, FileSpreadsheet, Users, BarChart3, Palette } from "lucide-react";

export default function AdminDock() {
  const items = [
    { to: "/admin", label: "Dashboard", Icon: LayoutGrid, end: true },
    { to: "/admin/products", label: "Productos", Icon: Package },
    { to: "/admin/categories", label: "Categorías", Icon: Tags },
    { to: "/admin/colors", label: "Colores", Icon: Palette },
    { to: "/admin/quotes", label: "Cotizaciones", Icon: FileSpreadsheet },
    { to: "/admin/customers", label: "Clientes", Icon: Users },
    { to: "/admin/reports", label: "Reportes", Icon: BarChart3 },
  ];

  return (
    <div
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 -translate-x-1/2
                 max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:translate-x-0
                 max-md:w-full max-md:px-2 max-md:pb-2"
      aria-label="Navegación de administración"
    >
      <nav
        className="backdrop-blur-md bg-glds-paper/90 border border-white/20 rounded-2xl
                   max-md:rounded-b-none p-1.5 shadow-card
                   motion-safe:transition-all motion-safe:duration-normal"
      >
        <ul className="flex items-center justify-center gap-1.5 md:gap-2 overflow-x-auto">
          {items.map(({ to, label, Icon, end }) => (
            <li key={to} className="shrink-0">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center gap-2 px-2.5 py-2 md:px-3 rounded-xl text-xs md:text-sm font-medium
                   transition-all duration-normal
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                   focus-visible:ring-offset-2 focus-visible:ring-offset-glds-bg
                   ${
                     isActive
                       ? "bg-glds-primary/20 border-2 border-glds-primary text-glds-primaryLight shadow-glow"
                       : "bg-glds-paper hover:bg-glds-paperLight text-secondary hover:text-primary border-2 border-transparent"
                   }
                   active:scale-95 motion-safe:transition-transform`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="max-md:hidden">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
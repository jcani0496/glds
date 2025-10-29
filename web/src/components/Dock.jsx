import { NavLink } from "react-router-dom";
import { Home, Grid2X2 as Grid, Users, Phone, ShoppingCart } from "lucide-react";

export default function Dock() {
  const items = [
    { to: "/", label: "Inicio", Icon: Home },
    { to: "/catalog", label: "Catálogo", Icon: Grid },
    { to: "/clients", label: "Clientes", Icon: Users },
    { to: "/contact", label: "Contacto", Icon: Phone },
    { to: "/cart", label: "Cotizar", Icon: ShoppingCart },
  ];

  return (
    <div
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 -translate-x-1/2
                 max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:translate-x-0
                 max-md:w-full max-md:px-2 max-md:pb-2"
      aria-label="Navegación principal"
    >
      <nav
        className="backdrop-blur-md bg-glds-paper/90 border border-white/20 rounded-2xl
                   max-md:rounded-b-none p-1.5 shadow-card
                   motion-safe:transition-all motion-safe:duration-normal"
      >
        <ul className="flex items-center justify-center gap-2 md:gap-3">
          {items.map(({ to, label, Icon }) => (
            <li key={to} className="shrink-0 flex-1 md:flex-initial">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 rounded-xl text-sm font-medium
                   transition-all duration-normal
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                   focus-visible:ring-offset-2 focus-visible:ring-offset-glds-bg
                   ${
                     isActive
                       ? "bg-glds-primary/20 border-2 border-glds-primary text-glds-primaryLight shadow-glow"
                       : "bg-glds-paper hover:bg-glds-paperLight text-secondary hover:text-primary border-2 border-transparent"
                   }
                   active:scale-95 motion-safe:transition-transform
                   w-full md:w-auto`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="max-md:text-xs">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
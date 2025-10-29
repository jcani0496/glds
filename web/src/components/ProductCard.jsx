import { useState } from "react";
import { Download, Eye, Sparkles, Star, Leaf, Clock, Package, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useCart } from "../lib/store.jsx";
import Badge from "./ui/Badge";

const STOCK_STATUS_CONFIG = {
  available: { label: "Disponible", color: "bg-green-500/20 text-green-300 border-green-500/40" },
  low_stock: { label: "Poco stock", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  on_order: { label: "Bajo pedido", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  coming_soon: { label: "Próximamente", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
};

export default function ProductCard(props) {
  const { dispatch } = useCart();
  const [open, setOpen] = useState(false);

  const product = props?.product && typeof props.product === "object"
    ? props.product
    : props;

  if (!product || typeof product !== "object") return null;

  const {
    id,
    name,
    sku,
    image_url,
    description,
    colors = [],
    spec_sheet_url,
    category_name,
    is_new,
    is_popular,
    is_eco_friendly,
    delivery_time,
    stock_status
  } = product;

  function addToCart() {
    if (!id) return;
    dispatch({
      type: "ADD",
      payload: {
        id,
        name: name ?? "Producto",
        sku: sku ?? null,
        image_url: image_url ?? null,
        qty: 1,
        color: null,
        customization: null,
      },
    });
  }

  const hasVariants = Array.isArray(colors) && colors.length > 0;
  const stockConfig = STOCK_STATUS_CONFIG[stock_status] || STOCK_STATUS_CONFIG.available;

  return (
    <div className="group rounded-2xl bg-glds-paper border-2 border-white/20 p-3 flex flex-col
                    hover:bg-glds-paperLight hover:border-white/30 hover:shadow-card-hover
                    transition-all duration-normal">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-glds-paperLight mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name || "Producto"}
            className="w-full h-full object-cover
                       motion-safe:transition-transform motion-safe:duration-slow
                       group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted">
            <Package className="w-12 h-12" aria-hidden="true" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {is_new && (
            <Badge variant="new" icon={Sparkles}>
              Nuevo
            </Badge>
          )}
          {is_popular && (
            <Badge variant="popular" icon={TrendingUp}>
              Popular
            </Badge>
          )}
          {is_eco_friendly && (
            <Badge variant="eco" icon={Leaf}>
              Eco
            </Badge>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex justify-between gap-2
                        opacity-0 group-hover:opacity-100
                        motion-safe:transition-opacity motion-safe:duration-normal">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 rounded-xl
                           bg-glds-bg/90 backdrop-blur-sm px-3 py-2
                           text-xs font-semibold text-secondary hover:text-primary
                           border border-white/20 hover:border-white/40
                           transition-all duration-normal
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary"
                aria-label={`Ver detalles de ${name}`}
              >
                <Eye className="h-3 w-3" aria-hidden="true" />
                Ficha rápida
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-glds-paper text-white border-2 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-h3 text-primary">{name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                <div className="rounded-xl border-2 border-white/20 bg-glds-paperLight overflow-hidden">
                  {image_url ? (
                    <img src={image_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full grid place-items-center text-sm text-muted">
                      <Package className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 text-body-sm">
                  <div className="flex flex-wrap gap-2">
                    {sku && (
                      <span className="text-tertiary">SKU: <span className="text-secondary">{sku}</span></span>
                    )}
                    {category_name && (
                      <Badge variant="default">{category_name}</Badge>
                    )}
                    <Badge variant={stock_status}>{stockConfig.label}</Badge>
                  </div>

                  {description ? (
                    <p className="leading-relaxed whitespace-pre-line text-secondary">{description}</p>
                  ) : (
                    <p className="text-muted">Sin descripción detallada.</p>
                  )}

                  {hasVariants && (
                    <div>
                      <p className="font-semibold text-secondary mb-2">Colores disponibles:</p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                       bg-glds-paperLight border border-white/20"
                          >
                            {c.hex && (
                              <span
                                className="w-4 h-4 rounded-full border border-white/30"
                                style={{ backgroundColor: c.hex }}
                                aria-label={`Color ${c.name}`}
                              />
                            )}
                            <span className="text-xs text-secondary">{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {delivery_time && (
                    <div className="flex items-center gap-2 text-tertiary">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      <span>Entrega: {delivery_time} días</span>
                    </div>
                  )}

                  {spec_sheet_url && (
                    <a
                      href={spec_sheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                                 bg-glds-paperLight hover:bg-glds-paperHover
                                 border border-white/20 hover:border-white/30
                                 text-sm font-medium text-secondary hover:text-primary
                                 transition-all duration-normal
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Descargar ficha técnica
                    </a>
                  )}

                  <button
                    onClick={() => {
                      addToCart();
                      setOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl
                               bg-glds-primary hover:bg-glds-primaryHover active:bg-glds-primaryDark
                               text-black font-bold
                               shadow-glow hover:shadow-glow-hover
                               transition-all duration-normal
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                               active:scale-95"
                  >
                    Agregar a cotización
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {spec_sheet_url && (
            <a
              href={spec_sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl
                         bg-glds-bg/90 backdrop-blur-sm px-3 py-2
                         text-xs font-semibold text-secondary hover:text-primary
                         border border-white/20 hover:border-white/40
                         transition-all duration-normal
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary"
              aria-label={`Descargar ficha técnica de ${name}`}
            >
              <Download className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-body font-semibold text-primary line-clamp-2 flex-1">
            {name || "Sin nombre"}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${stockConfig.color}`}>
            {stockConfig.label}
          </span>
        </div>

        {sku && (
          <p className="text-caption text-tertiary mb-2">SKU: {sku}</p>
        )}

        {description && (
          <p className="text-body-sm text-tertiary line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {category_name && (
            <Badge variant="default">{category_name}</Badge>
          )}
          {delivery_time && (
            <Badge variant="default" icon={Clock}>
              {delivery_time}d
            </Badge>
          )}
          {hasVariants && (
            <Badge variant="default">
              {colors.length} color{colors.length !== 1 ? "es" : ""}
            </Badge>
          )}
        </div>

        <button
          onClick={addToCart}
          className="mt-auto w-full px-4 py-2.5 rounded-xl
                     bg-glds-primary hover:bg-glds-primaryHover active:bg-glds-primaryDark
                     text-black font-bold text-sm
                     shadow-glow hover:shadow-glow-hover
                     transition-all duration-normal
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                     active:scale-95"
        >
          Agregar a cotización
        </button>
      </div>
    </div>
  );
}
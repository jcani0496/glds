import { useState } from "react";
import { Download, Eye, Sparkles, Star, Leaf, Clock, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useCart } from "../lib/store.jsx";

export default function ProductCard(props) {
  const { dispatch } = useCart();

  const [open, setOpen] = useState(false);

  const product = props?.product && typeof props.product === "object"
    ? props.product
    : props;

  if (!product || typeof product !== "object") return null;

  const { id, name, sku, image_url, description, colors = [], spec_sheet_url, category_name, is_new, is_popular, is_eco_friendly, delivery_time, stock_status } = product;

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

  return (
    <div className="group rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col">
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/10 mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name || "Producto"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
            Sin imagen
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {is_new && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-glds-primary text-zinc-900 text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              Nuevo
            </span>
          )}
          {is_popular && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500 text-zinc-900 text-xs font-semibold">
              <Star className="w-3 h-3" />
              Popular
            </span>
          )}
          {is_eco_friendly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold">
              <Leaf className="w-3 h-3" />
              Eco
            </span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">
                <Eye className="h-3 w-3" /> Ficha rápida
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[#111217] text-white border border-white/10">
              <DialogHeader>
                <DialogTitle>{name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div className="rounded-xl border border-white/10 bg-white/[.04] overflow-hidden">
                  {image_url ? (
                    <img src={image_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full grid place-items-center text-sm opacity-60">Sin imagen</div>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <p className="opacity-80">SKU {sku || "-"}</p>
                  {category_name && <p className="opacity-80">Categoría {category_name}</p>}
                  {description ? (
                    <p className="leading-relaxed whitespace-pre-line opacity-90">{description}</p>
                  ) : (
                    <p className="opacity-60">Sin descripción detallada.</p>
                  )}
                  {hasVariants && (
                    <div>
                      <p className="text-xs font-semibold uppercase opacity-70">Colores disponibles</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <span
                            key={color.id || color.hex || color.name}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-xs"
                          >
                            {color.name}
                            {color.hex ? (
                              <span className="h-3 w-3 rounded-full border border-white/10" style={{ background: color.hex }} />
                            ) : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        addToCart();
                        setOpen(false);
                      }}
                      className="rounded-full bg-glds-primary px-4 py-2 text-sm font-semibold text-zinc-900 hover:shadow-glow"
                    >
                      Agregar a cotización
                    </button>
                    {spec_sheet_url && (
                      <a
                        href={spec_sheet_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/[.06]"
                      >
                        <Download className="h-4 w-4" /> Descargar ficha técnica
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {spec_sheet_url ? (
            <a
              href={spec_sheet_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold"
            >
              <Download className="h-3 w-3" /> Descargar
            </a>
          ) : null}
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-semibold truncate">{name ?? "Producto"}</div>
        <div className="text-xs opacity-60">SKU {sku || "-"}</div>
        {hasVariants ? (
          <div className="text-xs opacity-60">{colors.length} colores disponibles</div>
        ) : null}

        <div className="flex flex-wrap gap-2 mt-2">
          {delivery_time && (
            <span className="inline-flex items-center gap-1 text-xs opacity-70">
              <Clock className="w-3 h-3" />
              {delivery_time}
            </span>
          )}
          {stock_status && (
            <span className={[
              "inline-flex items-center gap-1 text-xs",
              stock_status === 'available' ? 'text-green-400' :
              stock_status === 'low_stock' ? 'text-yellow-400' :
              stock_status === 'on_order' ? 'text-blue-400' :
              'text-gray-400'
            ].join(' ')}>
              <Package className="w-3 h-3" />
              {stock_status === 'available' ? 'Disponible' :
               stock_status === 'low_stock' ? 'Poco stock' :
               stock_status === 'on_order' ? 'Bajo pedido' :
               'Próximamente'}
            </span>
          )}
        </div>

        {description ? (
          <p className="text-xs opacity-70 line-clamp-3">{description}</p>
        ) : (
          <p className="text-xs opacity-50">Descripción breve no disponible.</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={addToCart}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow active:scale-[.98]"
        >
          Agregar a cotización
        </button>
        {spec_sheet_url ? (
          <a
            href={spec_sheet_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 transition hover:bg-white/[.08]"
            aria-label="Descargar ficha técnica"
          >
            <Download className="w-4 h-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
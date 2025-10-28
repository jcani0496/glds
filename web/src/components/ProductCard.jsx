import { useCart } from "../lib/store.jsx";

export default function ProductCard(props) {
  const { dispatch } = useCart();

  // Soporta <ProductCard product={p} /> y <ProductCard {...p} />
  const product = props?.product && typeof props.product === "object"
    ? props.product
    : props;

  if (!product || typeof product !== "object") return null;

  const { id, name, sku, image_url } = product;

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
        color: null,           // Fase 1: sin selector, color nulo
        customization: null,   // reservado para futuras opciones
      },
    });
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col">
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white/10 mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name || "Producto"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
            Sin imagen
          </div>
        )}
      </div>

      <div className="font-semibold truncate">{name ?? "Producto"}</div>
      <div className="text-xs opacity-60 mb-3">SKU {sku || "-"}</div>

      <button
        onClick={addToCart}
        className="mt-auto rounded-full px-4 py-2 bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow active:scale-[.98]"
      >
        Agregar a cotización
      </button>
    </div>
  );
}
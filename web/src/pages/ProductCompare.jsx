import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { X, ArrowLeft, Plus } from "lucide-react";
import api from "@/lib/api";

export default function ProductCompare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadProducts();
    loadAllProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const responses = await Promise.all(
        ids.map((id) => api.get(`/products/${id}`).catch(() => null))
      );
      setProducts(responses.filter(Boolean).map((r) => r.data));
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setAllProducts(data);
    } catch (error) {
      console.error("Error loading all products:", error);
    }
  };

  const removeProduct = (productId) => {
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    const newIds = ids.filter((id) => id !== String(productId));
    if (newIds.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ ids: newIds.join(",") });
    }
  };

  const addProduct = (productId) => {
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    if (ids.length >= 4) return;
    if (!ids.includes(String(productId))) {
      ids.push(String(productId));
      setSearchParams({ ids: ids.join(",") });
    }
    setShowAddModal(false);
  };

  const availableProducts = allProducts.filter(
    (p) => !products.find((cp) => cp.id === p.id)
  );

  const canAddMore = products.length < 4;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glds-primary mx-auto mb-4"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-white/80 hover:text-glds-primary transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a productos
            </Link>
            <h1 className="text-3xl font-bold">Comparar Productos</h1>
          </div>
          {canAddMore && products.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow transition"
            >
              <Plus className="w-5 h-5" />
              Agregar producto
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-white/60 mb-6">
              No hay productos para comparar
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow transition"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(280px, 1fr))` }}>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-white/10 bg-white/[.05] overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={product.image_url || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-red-500/90 hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                        {product.sku && (
                          <p className="text-sm text-white/60">SKU: {product.sku}</p>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-white/60 mb-1">Descripción</p>
                          <p className="text-white/90">
                            {product.description || "Sin descripción"}
                          </p>
                        </div>

                        {product.material && (
                          <div>
                            <p className="text-white/60 mb-1">Material</p>
                            <p className="text-white/90">{product.material}</p>
                          </div>
                        )}

                        {product.use_case && (
                          <div>
                            <p className="text-white/60 mb-1">Uso recomendado</p>
                            <p className="text-white/90">{product.use_case}</p>
                          </div>
                        )}

                        {product.delivery_time && (
                          <div>
                            <p className="text-white/60 mb-1">Tiempo de entrega</p>
                            <p className="text-white/90">{product.delivery_time}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-white/60 mb-1">Disponibilidad</p>
                          <p className="text-white/90">
                            {product.stock_status === "available"
                              ? "Disponible"
                              : product.stock_status === "low"
                              ? "Stock bajo"
                              : "Agotado"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {product.is_new === 1 && (
                            <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                              Nuevo
                            </span>
                          )}
                          {product.is_popular === 1 && (
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                              Popular
                            </span>
                          )}
                          {product.is_eco_friendly === 1 && (
                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                              Eco-friendly
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/products/${product.id}`}
                        className="block w-full text-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Agregar producto</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product.id)}
                    className="text-left rounded-xl border border-white/10 bg-white/[.05] hover:bg-white/10 transition overflow-hidden"
                  >
                    <img
                      src={product.image_url || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      {product.sku && (
                        <p className="text-sm text-white/60">SKU: {product.sku}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {availableProducts.length === 0 && (
                <p className="text-center text-white/60 py-8">
                  No hay más productos disponibles para comparar
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

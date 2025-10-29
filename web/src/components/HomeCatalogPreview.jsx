import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Star } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 6;

export default function HomeCatalogPreview() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get("/categories");
        setCategories(data || []);
      } catch {
        setCategories([]);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {
          q: q || undefined,
          category_id: categoryId || undefined,
          featured: featuredOnly ? 1 : undefined,
          sort: featuredOnly ? "featured" : "new",
          page: 1,
          pageSize: PAGE_SIZE,
        };
        const { data } = await api.get("/products", { params });
        const list = Array.isArray(data) ? data : data?.items || [];
        setItems(list.slice(0, PAGE_SIZE));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [q, categoryId, featuredOnly]);

  const shownCategories = useMemo(() => categories.slice(0, 6), [categories]);

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-glds-primary/90">
            <Sparkles className="h-4 w-4" /> Descubre catálogo
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">Conoce nuestros imprescindibles</h2>
          <p className="mt-2 max-w-2xl text-sm opacity-80">
            Filtra por categoría o busca por nombre para previsualizar productos antes de crear tu cotización.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-sm font-semibold transition hover:bg-white/[.1]"
        >
          Ver catálogo completo
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4 rounded-2xl border border-white/10 bg-white/[.05] p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase opacity-70">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Nombre o SKU"
                className="w-full rounded-xl border border-white/10 bg-white/[.06] py-2 pl-9 pr-3 outline-none transition focus:ring-2 focus:ring-glds-primary/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase opacity-70">Categorías</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId("")}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  categoryId === ""
                    ? "bg-glds-primary text-zinc-900"
                    : "border border-white/10 bg-white/[.04] hover:bg-white/[.08]"
                }`}
              >
                Todas
              </button>
              {shownCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(String(cat.id))}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    categoryId === String(cat.id)
                      ? "bg-glds-primary text-zinc-900"
                      : "border border-white/10 bg-white/[.04] hover:bg-white/[.08]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4" /> Solo destacados
            </div>
            <button
              type="button"
              onClick={() => setFeaturedOnly((value) => !value)}
              className={`relative h-6 w-11 rounded-full transition ${
                featuredOnly ? "bg-glds-primary" : "bg-white/[.15]"
              }`}
              aria-pressed={featuredOnly}
            >
              <span
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition ${
                  featuredOnly ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between text-sm opacity-70">
            <span>
              {loading ? "Cargando productos…" : `${items.length} resultados`}
            </span>
            <Link to="/catalog" className="underline transition hover:opacity-100">
              Abrir catálogo avanzado
            </Link>
          </div>

          {loading ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[.04] py-16 text-sm opacity-70">
              Actualizando selección…
            </div>
          ) : items.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[.04] py-16 text-sm opacity-70">
              No encontramos coincidencias. Ajusta los filtros para ver más opciones.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

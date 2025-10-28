import { useEffect, useMemo, useState } from "react";
import api, { API } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function Catalog() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [cats, setCats] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sort, setSort] = useState("new");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  async function loadCategories() {
    try {
      const { data } = await api.get("/categories");
      setCats(data || []);
    } catch {
      setCats([]);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const params = {
        q: q || undefined,
        category_id: categoryId || undefined,
        featured: featured ? 1 : undefined,
        sort,
        page,
        pageSize,
      };
      const { data } = await api.get("/products", { params });

      // Soporte dual: array (legacy) o objeto paginado { items, total, page, pageSize }
      const list = Array.isArray(data) ? data : data?.items || [];
      const tot = Array.isArray(data) ? data.length : data?.total || 0;
      setItems(list);
      setTotal(tot);
    } catch (e) {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId, featured, sort, page, pageSize]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((total || 0) / (pageSize || 12)));
  }, [total, pageSize]);

  function resetPage() {
    setPage(1);
  }

  return (
    <section className="container mx-auto px-6 py-10">
      <header className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold">Catálogo</h1>

        {/* Controles */}
        <div className="grid md:grid-cols-12 gap-3 items-end">
          {/* Buscador */}
          <div className="md:col-span-5">
            <label className="text-sm opacity-80 mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); resetPage(); }}
                placeholder="Nombre o SKU…"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="md:col-span-3">
            <label className="text-sm opacity-80 mb-1 block">Categoría</label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); resetPage(); }}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60 appearance-none"
              >
                <option value="">Todas</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destacados */}
          <div className="md:col-span-2">
            <label className="text-sm opacity-80 mb-1 block">Solo destacados</label>
            <button
              onClick={() => { setFeatured((v) => !v); resetPage(); }}
              className={[
                "w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 transition",
                featured
                  ? "bg-glds-primary text-zinc-900 shadow-glow"
                  : "bg-white/[.06] border border-white/10 hover:bg-white/[.08]"
              ].join(" ")}
              aria-pressed={featured}
              type="button"
            >
              <Star className="w-4 h-4" />
              <span>{featured ? "Sí" : "No"}</span>
            </button>
          </div>

          {/* Orden */}
          <div className="md:col-span-2">
            <label className="text-sm opacity-80 mb-1 block">Ordenar por</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); resetPage(); }}
              className="w-full px-3 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
            >
              <option value="new">Más nuevo</option>
              <option value="name_asc">Nombre (A–Z)</option>
              <option value="name_desc">Nombre (Z–A)</option>
              <option value="featured">Destacados</option>
              <option value="category">Categoría</option>
            </select>
          </div>
        </div>
      </header>

      {/* Resultados */}
      {loading ? (
        <div className="py-16 text-center opacity-80">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center opacity-80">Sin resultados</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/[.06] border border-white/10 disabled:opacity-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="px-3 py-2 text-sm opacity-80">
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/[.06] border border-white/10 disabled:opacity-50"
              aria-label="Página siguiente"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
              className="ml-3 px-2 py-2 rounded-xl bg-white/[.06] border border-white/10 text-sm"
              aria-label="Items por página"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </>
      )}
    </section>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, Star, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import CatalogCartSummary from "@/components/catalog/CatalogCartSummary.jsx";

const LOCAL_STORAGE_FILTERS_KEY = "glds_catalog_filters";
const PAGE_SIZE_DEFAULT = 12;

const SORT_OPTIONS = [
  { value: "new", label: "Más nuevo" },
  { value: "name_asc", label: "Nombre (A–Z)" },
  { value: "name_desc", label: "Nombre (Z–A)" },
  { value: "featured", label: "Destacados" },
  { value: "category", label: "Categoría" },
];

function readSavedFilters() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FILTERS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistFilters(filters) {
  try {
    localStorage.setItem(LOCAL_STORAGE_FILTERS_KEY, JSON.stringify(filters));
  } catch {}
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = readSavedFilters();
    if (!saved) return;

    const current = Object.fromEntries(searchParams.entries());
    if (Object.keys(current).length > 0) return;

    const next = new URLSearchParams();
    if (saved.q) next.set("q", saved.q);
    if (saved.category_id) next.set("category_id", saved.category_id);
    if (saved.featured) next.set("featured", "true");
    if (saved.sort && saved.sort !== "new") next.set("sort", saved.sort);
    if (saved.page && saved.page !== 1) next.set("page", String(saved.page));
    if (saved.pageSize && saved.pageSize !== PAGE_SIZE_DEFAULT) next.set("pageSize", String(saved.pageSize));
    setSearchParams(next, { replace: true });
  }, []);

  const filters = useMemo(() => {
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("category_id") || "";
    const featured = searchParams.get("featured") === "true";
    const sort = searchParams.get("sort") || "new";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.max(6, Number(searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT);
    const next = { q, categoryId, featured, sort, page, pageSize };
    persistFilters({
      q,
      category_id: categoryId,
      featured,
      sort,
      page,
      pageSize,
    });
    return next;
  }, [searchParams]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get("/categories");
        setCats(Array.isArray(data) ? data : []);
      } catch {
        setCats([]);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {
          q: filters.q || undefined,
          category_id: filters.categoryId || undefined,
          featured: filters.featured ? 1 : undefined,
          sort: filters.sort,
          page: filters.page,
          pageSize: filters.pageSize,
        };
        const { data } = await api.get("/products", { params });
        const list = Array.isArray(data) ? data : data?.items || [];
        const tot = Array.isArray(data) ? data.length : data?.total || 0;
        setItems(list);
        setTotal(tot);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [filters]);

  const totalPages = useMemo(() => {
    if (!filters.pageSize) return 1;
    return Math.max(1, Math.ceil((total || 0) / filters.pageSize));
  }, [total, filters.pageSize]);

  function updateSearchParams(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    if (!params.get("page")) params.set("page", "1");
    setSearchParams(params);
  }

  function setFilter(key, value) {
    updateSearchParams({ [key]: value, page: 1 });
  }

  function setPage(value) {
    updateSearchParams({ page: value });
  }

  function setPageSize(value) {
    updateSearchParams({ pageSize: value, page: 1 });
  }

  return (
    <section className="container mx-auto px-6 py-10">
      <nav className="mb-6" aria-label="breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-sm text-gray-400">
          <li className="inline-flex items-center gap-2">
            <Link to="/" className="font-medium text-gray-200 hover:text-white">
              Inicio
            </Link>
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="text-gray-500">/</span>
            <span className="font-medium text-gray-300">Catálogo</span>
          </li>
        </ol>
      </nav>

      <header className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold">Catálogo</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Explora los productos, filtra por categoría o destacados y guarda tus preferencias para volver donde te quedaste.
        </p>

        <div className="grid gap-3 items-end md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="text-sm opacity-80 mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
              <input
                value={filters.q}
                onChange={(event) => setFilter("q", event.target.value)}
                placeholder="Nombre o SKU…"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-sm opacity-80 mb-1 block">Categoría</label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
              <select
                value={filters.categoryId}
                onChange={(event) => setFilter("category_id", event.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60 appearance-none"
              >
                <option value="">Todas</option>
                {cats.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm opacity-80 mb-1 block">Solo destacados</label>
            <button
              onClick={() => setFilter("featured", filters.featured ? null : "true")}
              className={[
                "w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 transition",
                filters.featured
                  ? "bg-glds-primary text-zinc-900 shadow-glow"
                  : "bg-white/[.06] border border-white/10 hover:bg-white/[.08]",
              ].join(" ")}
              aria-pressed={filters.featured}
              type="button"
            >
              <Star className="w-4 h-4" />
              <span>{filters.featured ? "Sí" : "No"}</span>
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm opacity-80 mb-1 block">Ordenar por</label>
            <select
              value={filters.sort}
              onChange={(event) => setFilter("sort", event.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-16 text-center opacity-80">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center opacity-80">Sin resultados</div>
      ) : (
        <>
          <div className="relative">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <CatalogCartSummary />
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, filters.page - 1))}
              disabled={filters.page <= 1}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/[.06] border border-white/10 disabled:opacity-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="px-3 py-2 text-sm opacity-80">
              Página {filters.page} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, filters.page + 1))}
              disabled={filters.page >= totalPages}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/[.06] border border-white/10 disabled:opacity-50"
              aria-label="Página siguiente"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={filters.pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="ml-3 px-2 py-2 rounded-xl bg-white/[.06] border border-white/10 text-sm"
              aria-label="Items por página"
            >
              {[6, 12, 24, 48].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </section>
  );
}
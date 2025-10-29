import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Filter, Star, ChevronLeft, ChevronRight, X, Package, Clock, Sparkles, Leaf, GitCompare } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import CatalogCartSummary from "@/components/catalog/CatalogCartSummary.jsx";
import { SkeletonCard } from "@/components/ui/Skeleton";

const LOCAL_STORAGE_FILTERS_KEY = "glds_catalog_filters";
const LOCAL_STORAGE_COMPARE_KEY = "glds_compare_products";
const PAGE_SIZE_DEFAULT = 12;

const SORT_OPTIONS = [
  { value: "new", label: "Más nuevo" },
  { value: "name_asc", label: "Nombre (A–Z)" },
  { value: "name_desc", label: "Nombre (Z–A)" },
  { value: "featured", label: "Destacados" },
  { value: "category", label: "Categoría" },
];

const MATERIAL_OPTIONS = [
  { value: "", label: "Todos los materiales" },
  { value: "tela", label: "Tela" },
  { value: "plastico", label: "Plástico" },
  { value: "metal", label: "Metal" },
  { value: "vidrio", label: "Vidrio" },
  { value: "papel", label: "Papel" },
  { value: "madera", label: "Madera" },
  { value: "silicona", label: "Silicona" },
  { value: "cuero", label: "Cuero" },
];

const USE_CASE_OPTIONS = [
  { value: "", label: "Todos los usos" },
  { value: "eventos", label: "Eventos" },
  { value: "oficina", label: "Oficina" },
  { value: "deportivo", label: "Deportivo" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "hogar", label: "Hogar" },
  { value: "viaje", label: "Viaje" },
  { value: "promocional", label: "Promocional" },
];

const DELIVERY_TIME_OPTIONS = [
  { value: "", label: "Cualquier tiempo" },
  { value: "1-3", label: "1-3 días" },
  { value: "3-7", label: "3-7 días" },
  { value: "7-15", label: "7-15 días" },
  { value: "15+", label: "Más de 15 días" },
];

const STOCK_STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "available", label: "Disponible" },
  { value: "low_stock", label: "Poco stock" },
  { value: "on_order", label: "Bajo pedido" },
  { value: "coming_soon", label: "Próximamente" },
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
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compareIds, setCompareIds] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COMPARE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    const material = searchParams.get("material") || "";
    const use_case = searchParams.get("use_case") || "";
    const delivery_time = searchParams.get("delivery_time") || "";
    const stock_status = searchParams.get("stock_status") || "";
    const is_new = searchParams.get("is_new") === "true";
    const is_popular = searchParams.get("is_popular") === "true";
    const is_eco_friendly = searchParams.get("is_eco_friendly") === "true";
    const sort = searchParams.get("sort") || "new";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.max(6, Number(searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT);
    const next = { q, categoryId, featured, material, use_case, delivery_time, stock_status, is_new, is_popular, is_eco_friendly, sort, page, pageSize };
    persistFilters({
      q,
      category_id: categoryId,
      featured,
      material,
      use_case,
      delivery_time,
      stock_status,
      is_new,
      is_popular,
      is_eco_friendly,
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
          material: filters.material || undefined,
          use_case: filters.use_case || undefined,
          delivery_time: filters.delivery_time || undefined,
          stock_status: filters.stock_status || undefined,
          is_new: filters.is_new ? 1 : undefined,
          is_popular: filters.is_popular ? 1 : undefined,
          is_eco_friendly: filters.is_eco_friendly ? 1 : undefined,
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
        <ol className="inline-flex items-center space-x-1 text-sm text-tertiary">
          <li className="inline-flex items-center gap-2">
            <Link
              to="/"
              className="font-medium text-secondary hover:text-primary transition-colors duration-normal
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary rounded"
            >
              Inicio
            </Link>
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="text-muted">/</span>
            <span className="font-medium text-primary">Catálogo</span>
          </li>
        </ol>
      </nav>

      <header className="mb-8 flex flex-col gap-6">
        <div>
          <h1 className="text-h1 font-extrabold text-primary mb-2">Catálogo</h1>
          <p className="max-w-2xl text-body text-tertiary leading-relaxed">
            Explora los productos, filtra por categoría o destacados y guarda tus preferencias para volver donde te quedaste.
          </p>
        </div>

        <div className="grid gap-4 items-end md:grid-cols-12">
          <div className="md:col-span-5">
            <label htmlFor="search-input" className="text-sm text-secondary font-medium mb-2 block">
              Buscar
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="search-input"
                value={filters.q}
                onChange={(event) => setFilter("q", event.target.value)}
                placeholder="Nombre o SKU…"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl
                           bg-glds-paper border-2 border-white/20
                           text-primary placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                           transition-all duration-normal"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="category-select" className="text-sm text-secondary font-medium mb-2 block">
              Categoría
            </label>
            <select
              id="category-select"
              value={filters.categoryId}
              onChange={(event) => setFilter("category_id", event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl
                         bg-glds-paper border-2 border-white/20
                         text-primary
                         focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                         transition-all duration-normal"
            >
              <option value="">Todas</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="sort-select" className="text-sm text-secondary font-medium mb-2 block">
              Ordenar
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(event) => setFilter("sort", event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl
                         bg-glds-paper border-2 border-white/20
                         text-primary
                         focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                         transition-all duration-normal"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => setFilter("featured", filters.featured ? null : "true")}
              className={`
                w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-normal
                focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                active:scale-95
                ${
                  filters.featured
                    ? "bg-glds-primary text-black shadow-glow border-2 border-transparent"
                    : "bg-glds-paper text-secondary hover:text-primary border-2 border-white/20 hover:border-white/30"
                }
              `}
              aria-pressed={filters.featured}
            >
              <Star className="w-4 h-4" aria-hidden="true" />
              Destacados
            </button>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-white/20 bg-glds-paper p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" aria-hidden="true" />
              Filtros Avanzados
            </h3>
            {(filters.material || filters.use_case || filters.delivery_time || filters.stock_status || filters.is_new || filters.is_popular || filters.is_eco_friendly) && (
              <button
                onClick={() => {
                  updateSearchParams({
                    material: null,
                    use_case: null,
                    delivery_time: null,
                    stock_status: null,
                    is_new: null,
                    is_popular: null,
                    is_eco_friendly: null,
                    page: 1,
                  });
                }}
                className="text-xs text-glds-primary hover:text-glds-primary/80 font-medium flex items-center gap-1
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary rounded
                           transition-colors duration-normal"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="material-select" className="text-xs text-secondary font-medium mb-2 block">
                Material
              </label>
              <select
                id="material-select"
                value={filters.material}
                onChange={(event) => setFilter("material", event.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl
                           bg-glds-bg border-2 border-white/20
                           text-primary
                           focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                           transition-all duration-normal"
              >
                {MATERIAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="use-case-select" className="text-xs text-secondary font-medium mb-2 block">
                Uso/Ocasión
              </label>
              <select
                id="use-case-select"
                value={filters.use_case}
                onChange={(event) => setFilter("use_case", event.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl
                           bg-glds-bg border-2 border-white/20
                           text-primary
                           focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                           transition-all duration-normal"
              >
                {USE_CASE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="delivery-time-select" className="text-xs text-secondary font-medium mb-2 block">
                Tiempo de entrega
              </label>
              <select
                id="delivery-time-select"
                value={filters.delivery_time}
                onChange={(event) => setFilter("delivery_time", event.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl
                           bg-glds-bg border-2 border-white/20
                           text-primary
                           focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                           transition-all duration-normal"
              >
                {DELIVERY_TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="stock-status-select" className="text-xs text-secondary font-medium mb-2 block">
                Disponibilidad
              </label>
              <select
                id="stock-status-select"
                value={filters.stock_status}
                onChange={(event) => setFilter("stock_status", event.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl
                           bg-glds-bg border-2 border-white/20
                           text-primary
                           focus:outline-none focus:ring-2 focus:ring-glds-primary focus:border-transparent
                           transition-all duration-normal"
              >
                {STOCK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilter("is_new", filters.is_new ? null : "true")}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
                transition-all duration-normal
                focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                active:scale-95
                ${
                  filters.is_new
                    ? "bg-glds-primary text-black shadow-glow"
                    : "bg-glds-bg border-2 border-white/20 text-secondary hover:text-primary hover:border-white/30"
                }
              `}
              aria-pressed={filters.is_new}
            >
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Nuevo
            </button>

            <button
              onClick={() => setFilter("is_popular", filters.is_popular ? null : "true")}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
                transition-all duration-normal
                focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                active:scale-95
                ${
                  filters.is_popular
                    ? "bg-glds-primary text-black shadow-glow"
                    : "bg-glds-bg border-2 border-white/20 text-secondary hover:text-primary hover:border-white/30"
                }
              `}
              aria-pressed={filters.is_popular}
            >
              <Star className="w-3 h-3" aria-hidden="true" />
              Popular
            </button>

            <button
              onClick={() => setFilter("is_eco_friendly", filters.is_eco_friendly ? null : "true")}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
                transition-all duration-normal
                focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                active:scale-95
                ${
                  filters.is_eco_friendly
                    ? "bg-glds-primary text-black shadow-glow"
                    : "bg-glds-bg border-2 border-white/20 text-secondary hover:text-primary hover:border-white/30"
                }
              `}
              aria-pressed={filters.is_eco_friendly}
            >
              <Leaf className="w-3 h-3" aria-hidden="true" />
              Eco-Friendly
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: filters.pageSize }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted" aria-hidden="true" />
          <h2 className="text-h3 font-bold text-primary mb-2">Sin resultados</h2>
          <p className="text-body text-tertiary">
            No se encontraron productos con los filtros seleccionados
          </p>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <label className="absolute top-5 right-5 z-10 flex items-center gap-2 px-3 py-2 rounded-full
                                    bg-glds-bg/90 backdrop-blur-sm border-2 border-white/20
                                    cursor-pointer hover:bg-glds-paper hover:border-white/30
                                    transition-all duration-normal
                                    focus-within:ring-2 focus-within:ring-glds-primary">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (compareIds.length >= 4) {
                            alert("Máximo 4 productos para comparar");
                            return;
                          }
                          const newIds = [...compareIds, product.id];
                          setCompareIds(newIds);
                          localStorage.setItem(LOCAL_STORAGE_COMPARE_KEY, JSON.stringify(newIds));
                        } else {
                          const newIds = compareIds.filter(id => id !== product.id);
                          setCompareIds(newIds);
                          localStorage.setItem(LOCAL_STORAGE_COMPARE_KEY, JSON.stringify(newIds));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/30 bg-white/10 text-glds-primary focus:ring-glds-primary focus:ring-offset-0"
                    />
                    <span className="text-xs font-medium text-white">Comparar</span>
                  </label>
                </div>
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

      {compareIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              localStorage.setItem(LOCAL_STORAGE_COMPARE_KEY, JSON.stringify(compareIds));
              navigate(`/compare?ids=${compareIds.join(",")}`);
            }}
            className="flex items-center gap-3 px-6 py-4 rounded-full bg-glds-primary text-zinc-900 font-semibold shadow-lg hover:shadow-glow transition"
          >
            <GitCompare className="w-5 h-5" />
            <span>Comparar ({compareIds.length})</span>
          </button>
        </div>
      )}
    </section>
  );
}

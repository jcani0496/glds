import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Package, FileText, Calendar } from "lucide-react";
import api from "@/lib/api";

export default function AdminReports() {
  const [period, setPeriod] = useState("30");
  const [productsData, setProductsData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  const [quotesData, setQuotesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [products, customers, quotes] = await Promise.all([
        api.get("/stats/products-analytics", { params: { period } }),
        api.get("/stats/customers-analytics", { params: { period } }),
        api.get("/stats/quotes-analytics", { params: { period } }),
      ]);
      setProductsData(products.data);
      setCustomersData(customers.data);
      setQuotesData(quotes.data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glds-primary mx-auto mb-4"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
        </select>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-glds-primary" />
            <h2 className="text-2xl font-bold">Cotizaciones</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-1">Tasa de conversión</p>
              <p className="text-3xl font-bold text-glds-primary">
                {quotesData?.conversionRate?.rate}%
              </p>
              <p className="text-xs text-white/60 mt-1">
                {quotesData?.conversionRate?.approved} de {quotesData?.conversionRate?.total} aprobadas
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-1">Tiempo promedio de respuesta</p>
              <p className="text-3xl font-bold">{quotesData?.avgResponseTime}h</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-1">Por estado</p>
              <div className="space-y-1 mt-2">
                {quotesData?.quotesByStatus?.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{item.status}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {quotesData?.quotesTrend && quotesData.quotesTrend.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Tendencia de cotizaciones</h3>
              <div className="h-64 flex items-end gap-2">
                {quotesData.quotesTrend.map((item, i) => {
                  const maxValue = Math.max(...quotesData.quotesTrend.map(d => d.total));
                  const height = (item.total / maxValue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-1">
                        <div
                          className="w-full bg-green-500/50 rounded-t"
                          style={{ height: `${(item.approved / item.total) * height * 2}px` }}
                          title={`Aprobadas: ${item.approved}`}
                        />
                        <div
                          className="w-full bg-yellow-500/50 rounded-t"
                          style={{ height: `${(item.pending / item.total) * height * 2}px` }}
                          title={`Pendientes: ${item.pending}`}
                        />
                      </div>
                      <span className="text-xs text-white/60 rotate-45 origin-left whitespace-nowrap">
                        {new Date(item.day).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-glds-primary" />
            <h2 className="text-2xl font-bold">Productos</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Más cotizados</h3>
              <div className="space-y-3">
                {productsData?.mostQuoted?.slice(0, 5).map((product, i) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-glds-primary/20 flex items-center justify-center font-bold text-glds-primary">
                      {i + 1}
                    </div>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-white/60">
                        {product.quote_count} cotizaciones • {product.total_quantity} unidades
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Por categoría</h3>
              <div className="space-y-3">
                {productsData?.byCategory?.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <span className="font-medium">{cat.category}</span>
                    <div className="text-right">
                      <p className="font-semibold">{cat.quotes} cotizaciones</p>
                      <p className="text-sm text-white/60">{cat.quote_items} items</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Estado de inventario</h3>
                <div className="space-y-2">
                  {productsData?.stockStatus?.map((status) => (
                    <div
                      key={status.stock_status}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <span className="capitalize text-sm">
                        {status.stock_status === "available"
                          ? "Disponible"
                          : status.stock_status === "low"
                          ? "Stock bajo"
                          : "Agotado"}
                      </span>
                      <span className="font-semibold">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-glds-primary" />
            <h2 className="text-2xl font-bold">Clientes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-1">Nuevos clientes</p>
              <p className="text-3xl font-bold text-glds-primary">
                {customersData?.newCustomers}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-1">Por estado</p>
              <div className="space-y-1 mt-2">
                {customersData?.customersByStatus?.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{item.status}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-1">Crecimiento</p>
              {customersData?.customerGrowth && customersData.customerGrowth.length > 0 && (
                <div className="h-16 flex items-end gap-1 mt-2">
                  {customersData.customerGrowth.map((item, i) => {
                    const maxValue = Math.max(...customersData.customerGrowth.map(d => d.count));
                    const height = (item.count / maxValue) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-glds-primary/50 rounded-t"
                        style={{ height: `${height}%` }}
                        title={`${item.day}: ${item.count}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Top clientes</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {customersData?.topCustomers?.slice(0, 10).map((customer, i) => (
                <div
                  key={customer.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-glds-primary/20 flex items-center justify-center font-bold text-glds-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{customer.name}</p>
                    <p className="text-sm text-white/60 truncate">
                      {customer.company || customer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{customer.total_quotes}</p>
                    <p className="text-xs text-white/60">cotizaciones</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

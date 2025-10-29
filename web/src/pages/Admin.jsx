 // web/src/pages/Admin.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileText,
  Trophy,
  Boxes,
  Activity,
} from "lucide-react";

/* --------- Util: Sparkline simple (SVG) --------- */
function Sparkline({ data = [], width = 320, height = 80 }) {
  if (!data.length) return <div className="text-sm opacity-60">Sin datos</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data
    .map((d, i) => {
      const x = i * step;
      const y = height - (d.value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="block">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        className="text-glds-primary"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* --------- Animated List (estilo MagicUI) --------- */
function AnimatedList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li
          key={n.id}
          className="p-3 rounded-xl bg-white/[.06] dark:bg-white/[.05] border border-white/10 hover:bg-white/10 transition"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold">{n.title}</p>
              <p className="opacity-70">{n.subtitle}</p>
            </div>
            <span className="text-xs opacity-60 whitespace-nowrap">
              {n.when}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* --------- Tarjeta Bento --------- */
function Bento({ title, icon: Icon, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 bg-white/[.06] dark:bg-white/[.05] border border-white/10 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-glds-primary" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  const fetchData = async () => {
    try {
      const [{ data: s }, { data: q }] = await Promise.all([
        api.get("/stats/summary"),
        api.get("/quotes", { params: { limit: 10 } }),
      ]);
      setStats(s);
      const items = (q || []).slice(0, 10).map((it) => ({
        id: it.id,
        title: `${it.customer_name} • ${it.code}`,
        subtitle: it.customer_email,
        when: new Date(it.created_at).toLocaleString(),
      }));
      setRecent(items);
    } catch (e) {
      console.error(e);
      setStats(null);
      setRecent([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailySeries = useMemo(() => {
    if (!stats?.series14d) return [];
    return stats.series14d.map((d) => ({ label: d.day, value: d.count }));
  }, [stats]);

  const kpiCards = useMemo(
    () => [
      {
        id: "total",
        title: "Cotizaciones totales",
        icon: Activity,
        value: stats?.total ?? "—",
        description: "Histórico registrado",
      },
      {
        id: "last7",
        title: "Nuevas (7 días)",
        icon: TrendingUp,
        value: stats?.last7 ?? "—",
        description: "Ingresaron esta semana",
      },
      {
        id: "pending",
        title: "Pendientes",
        icon: Clock,
        value: stats?.pending ?? "—",
        description: "En seguimiento",
      },
      {
        id: "approved",
        title: "Aprobadas",
        icon: CheckCircle2,
        value: stats?.approved ?? "—",
        description: "Con luz verde",
      },
      {
        id: "closed",
        title: "Cerradas",
        icon: XCircle,
        value: stats?.closed ?? "—",
        description: "Finalizadas",
      },
    ],
    [stats]
  );

  return (
    <section className="mx-auto max-w-7xl px-6">
      <h1 className="text-3xl font-extrabold mb-6">Panel Administrador</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda (Bento Grid) */}
        <div
          className="lg:col-span-2 grid gap-6"
          style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
        >
          {/* Métricas rápidas */}
          {kpiCards.map(({ id, title, icon, value, description }) => (
            <Bento
              key={id}
              title={title}
              icon={icon}
              className="col-span-12 sm:col-span-3"
            >
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs opacity-70">{description}</p>
            </Bento>
          ))}

          {/* Gráfica pequeña */}
          <Bento
            title="Cotizaciones por día (14d)"
            icon={TrendingUp}
            className="col-span-12"
          >
            <Sparkline data={dailySeries} />
          </Bento>

          {stats?.top_products?.length ? (
            <Bento
              title="Top productos (30d)"
              icon={Trophy}
              className="col-span-12 sm:col-span-6"
            >
              <ul className="text-sm space-y-2">
                {stats.top_products.map((p) => (
                  <li key={p.label} className="flex justify-between">
                    <span className="opacity-90">{p.label}</span>
                    <span className="opacity-70">{p.count ?? 0}</span>
                  </li>
                ))}
              </ul>
            </Bento>
          ) : (
            <Bento
              title="Top productos (30d)"
              icon={Trophy}
              className="col-span-12 sm:col-span-6"
            >
              <p className="text-sm opacity-60">Reúne más cotizaciones para ver este ranking.</p>
            </Bento>
          )}
          {stats?.top_categories?.length ? (
            <Bento
              title="Top categorías (30d)"
              icon={FileText}
              className="col-span-12 sm:col-span-6"
            >
              <ul className="text-sm space-y-2">
                {stats.top_categories.map((c) => (
                  <li key={c.label} className="flex justify-between">
                    <span className="opacity-90">{c.label}</span>
                    <span className="opacity-70">{c.count ?? 0}</span>
                  </li>
                ))}
              </ul>
            </Bento>
          ) : (
            <Bento
              title="Top categorías (30d)"
              icon={FileText}
              className="col-span-12 sm:col-span-6"
            >
              <p className="text-sm opacity-60">Aún no hay suficientes datos para mostrar categorías destacadas.</p>
            </Bento>
          )}

          {/* Otras KPIs (opcionales) */}
          <Bento
            title="Clientes únicos (30d)"
            icon={Users}
            className="col-span-12 sm:col-span-4"
          >
            <p className="text-2xl font-bold">
              {stats?.unique_customers_30d ?? "—"}
            </p>
          </Bento>
          <Bento
            title="PDFs enviados (30d)"
            icon={FileText}
            className="col-span-12 sm:col-span-4"
          >
            <p className="text-2xl font-bold">{stats?.pdfs_sent_30d ?? "—"}</p>
          </Bento>
          <Bento
            title="Ítems por cotización (prom.)"
            icon={Boxes}
            className="col-span-12 sm:col-span-4"
          >
            <p className="text-2xl font-bold">
              {stats?.avg_items_per_quote?.toFixed?.(1) ?? "—"}
            </p>
          </Bento>

        </div>

        {/* Columna derecha: Notificaciones (Animated List) */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notificaciones</h3>
            <Link
              to="/admin/quotes"
              className="text-sm opacity-70 hover:opacity-100"
            >
              ver todo
            </Link>
          </div>
          <AnimatedList items={recent} />
        </div>
      </div>
    </section>
  );
}
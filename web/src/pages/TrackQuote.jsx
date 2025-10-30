import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { quotesApi } from "../lib/api.js";

export default function TrackQuote() {
  const { token } = useParams();
  const [data, setData] = useState({ loading: true, error: null, quote: null, items: [], events: [] });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data } = await quotesApi.track(token);
        if (!active) return;
        setData({ loading: false, error: null, quote: data.quote, items: data.items || [], events: data.events || [] });
      } catch (e) {
        if (!active) return;
        setData({ loading: false, error: "No encontramos esta cotización.", quote: null, items: [], events: [] });
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [token]);

  if (data.loading) {
    return (
      <section className="container mx-auto px-6 py-16 text-center">
        <p className="text-white/70">Consultando estado...</p>
      </section>
    );
  }

  if (data.error || !data.quote) {
    return (
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Seguimiento de cotización</h1>
        <p className="text-white/60">{data.error || "No encontramos información para este enlace."}</p>
      </section>
    );
  }

  const { quote, items, events } = data;
  const statusMap = {
    pending: "Pendiente",
    reviewing: "En revisión",
    sent: "Enviada",
    approved: "Aprobada",
    closed: "Cerrada",
  };

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <p className="text-sm uppercase tracking-wide text-glds-primary/90">Seguimiento</p>
          <h1 className="text-3xl font-extrabold">Cotización {quote.code}</h1>
          <p className="text-white/70 mt-2">
            Estado actual: <span className="font-semibold text-white">{statusMap[quote.status] || quote.status}</span>
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <h2 className="font-semibold mb-3">Detalle de la solicitud</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="opacity-60">Solicitante</dt>
                  <dd>{quote.customer_name}</dd>
                </div>
                <div>
                  <dt className="opacity-60">Empresa</dt>
                  <dd>{quote.customer_company || "—"}</dd>
                </div>
                <div>
                  <dt className="opacity-60">Correo</dt>
                  <dd>{quote.customer_email}</dd>
                </div>
                <div>
                  <dt className="opacity-60">Teléfono</dt>
                  <dd>{quote.customer_phone || "—"}</dd>
                </div>
                <div>
                  <dt className="opacity-60">Notas</dt>
                  <dd>{quote.notes || "Sin notas adicionales."}</dd>
                </div>
                <div>
                  <dt className="opacity-60">Última actualización</dt>
                  <dd>{new Date(quote.status_updated_at || quote.created_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <h2 className="font-semibold mb-3">Productos solicitados ({items.length})</h2>
              {items.length === 0 ? (
                <p className="text-sm text-white/60">Sin productos registrados.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-4">
                      <div>
                        <p className="font-medium">{it.product_name}</p>
                        <p className="text-xs text-white/60">
                          {it.sku ? `SKU ${it.sku} • ` : ""}
                          Cantidad: {it.qty}
                          {it.color ? ` • Color ${it.color}` : ""}
                          {it.customization ? ` • Marcaje ${it.customization}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-white/50">#{it.product_id || "custom"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-glds-primary/30 bg-glds-primary/10 p-5">
              <h3 className="font-semibold mb-3">Siguientes pasos</h3>
              <p className="text-sm text-white/80">
                Nuestro equipo revisará esta solicitud y se pondrá en contacto muy pronto. Puedes volver a este enlace para ver actualizaciones en tiempo real.
              </p>
              <p className="text-xs text-white/60 mt-3">
                Último acceso: {quote.customer_portal_last_seen ? new Date(quote.customer_portal_last_seen).toLocaleString() : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">📋</span>
                Línea de tiempo
              </h3>
              {events.length === 0 ? (
                <p className="text-sm text-white/60">Aún no hay actividad registrada.</p>
              ) : (
                <ol className="relative border-l-2 border-white/10 ml-2 space-y-6">
                  {events.map((ev, idx) => (
                    <li key={ev.id} className="ml-6 relative">
                      <span className="absolute -left-[29px] flex items-center justify-center w-6 h-6 bg-glds-primary rounded-full ring-4 ring-[#0a0a0a]">
                        {getEventIcon(ev.type)}
                      </span>
                      <div className="bg-white/[.03] rounded-lg p-3 border border-white/5">
                        <time className="text-xs text-white/50 font-medium">
                          {formatEventDate(ev.created_at)}
                        </time>
                        <h4 className="text-sm font-semibold mt-1 text-white">
                          {eventLabel(ev.type)}
                        </h4>
                        {ev.payload && (
                          <div className="mt-2 text-sm text-white/70">
                            {formatEventPayload(ev.type, ev.payload)}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function getEventIcon(type) {
  const icons = {
    created: "✨",
    status_changed: "🔄",
    status_note: "💬",
    reminder: "🔔",
  };
  return <span className="text-xs">{icons[type] || "📌"}</span>;
}

function formatEventDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatEventPayload(type, payload) {
  if (typeof payload === 'string') {
    return <p className="leading-relaxed">{payload}</p>;
  }

  switch (type) {
    case "created":
      return (
        <div className="space-y-1">
          {payload.customer_email && (
            <p>📧 Cliente: <span className="font-medium">{payload.customer_email}</span></p>
          )}
          {payload.total_items && (
            <p>📦 Productos solicitados: <span className="font-medium">{payload.total_items}</span></p>
          )}
        </div>
      );

    case "status_changed":
      const statusLabels = {
        pending: "Pendiente",
        reviewing: "En Revisión",
        sent: "Enviada",
        approved: "Aprobada",
        closed: "Cerrada",
      };
      const statusEmojis = {
        pending: "⏳",
        reviewing: "🔍",
        sent: "📤",
        approved: "✅",
        closed: "🔒",
      };
      return (
        <p className="flex items-center gap-2">
          <span className="text-base">{statusEmojis[payload.status] || "📋"}</span>
          <span>Nuevo estado: <span className="font-semibold text-glds-primary">{statusLabels[payload.status] || payload.status}</span></span>
        </p>
      );

    case "reminder":
      return (
        <div className="space-y-1">
          {payload.channel && (
            <p>📢 Canal: <span className="font-medium capitalize">{payload.channel}</span></p>
          )}
          {payload.note && (
            <p className="text-white/60 italic">"{payload.note}"</p>
          )}
        </div>
      );

    case "status_note":
      return (
        <p className="bg-white/5 border-l-2 border-glds-primary/50 pl-3 py-2 italic">
          "{payload}"
        </p>
      );

    default:
      // Para cualquier otro tipo, intentar mostrar de forma legible
      if (typeof payload === 'object') {
        return (
          <div className="space-y-1">
            {Object.entries(payload).map(([key, value]) => (
              <p key={key}>
                <span className="text-white/50 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                <span className="font-medium">{String(value)}</span>
              </p>
            ))}
          </div>
        );
      }
      return <p>{String(payload)}</p>;
  }
}

function eventLabel(type) {
  switch (type) {
    case "created":
      return "Cotización creada";
    case "status_changed":
      return "Estado actualizado";
    case "status_note":
      return "Nota del equipo";
    case "reminder":
      return "Recordatorio enviado";
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

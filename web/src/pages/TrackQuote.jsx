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
              <h3 className="font-semibold mb-3">Línea de tiempo</h3>
              {events.length === 0 ? (
                <p className="text-sm text-white/60">Aún no hay actividad registrada.</p>
              ) : (
                <ol className="space-y-3 text-sm">
                  {events.map((ev) => (
                    <li key={ev.id} className="border-l border-white/10 pl-3">
                      <p className="text-xs text-white/50">{new Date(ev.created_at).toLocaleString()}</p>
                      <p className="font-medium">{eventLabel(ev.type)}</p>
                      {ev.payload && (
                        <p className="text-xs text-white/60 whitespace-pre-wrap">
                          {typeof ev.payload === "string" ? ev.payload : JSON.stringify(ev.payload, null, 2)}
                        </p>
                      )}
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
      return type;
  }
}

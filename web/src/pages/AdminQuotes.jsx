import { useEffect, useState } from "react";
import api, { API } from "../lib/api.js";
import { Trash2, Search, FileText, Calendar, User, Mail, Building2, GripVertical, CheckCircle2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function resolvePdfUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API}${url.startsWith("/") ? url : `/${url}`}`;
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-up z-[9999] border-2 border-green-400">
      <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
      <span className="font-semibold text-base">{message}</span>
    </div>
  );
}
// ... existing code ...


const COLUMNS = [
  { id: "pending", label: "Pendiente", color: "bg-yellow-500/20 border-yellow-500/30" },
  { id: "reviewing", label: "En Revisión", color: "bg-blue-500/20 border-blue-500/30" },
  { id: "sent", label: "Enviada", color: "bg-purple-500/20 border-purple-500/30" },
  { id: "approved", label: "Aprobada", color: "bg-green-500/20 border-green-500/30" },
  { id: "closed", label: "Cerrada", color: "bg-gray-500/20 border-gray-500/30" },
];

function QuoteCard({ quote, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: quote.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-400",
      reviewing: "text-blue-400",
      sent: "text-purple-400",
      approved: "text-green-400",
      closed: "text-gray-400",
    };
    return colors[status] || "text-white/60";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      reviewing: "En Revisión",
      sent: "Enviada",
      approved: "Aprobada",
      closed: "Cerrada",
    };
    return labels[status] || status;
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`bg-white/[.08] border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing
                  hover:bg-white/[.12] transition-all duration-200
                  focus-within:ring-2 focus-within:ring-glds-primary
                  ${isDragging ? "shadow-2xl ring-2 ring-white/30 scale-105" : ""}`}
      aria-label={`Cotización ${quote.code}`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-white/40 hover:text-white/60 transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{quote.code}</span>
              <span className={`text-xs ${getStatusColor(quote.status)}`}>●</span>
            </div>
            {quote.pdf_path && (
              <a
                href={resolvePdfUrl(quote.pdf_path)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Ver PDF"
              >
                <FileText className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-white/70">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate font-medium">{quote.customer_name}</span>
            </div>

            {quote.customer_email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{quote.customer_email}</span>
              </div>
            )}

            {quote.customer_company && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{quote.customer_company}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 text-white/50 pt-1 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>{new Date(quote.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}</span>
              </div>
              <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded">
                {getTimeAgo(quote.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
// ... existing code ...

function KanbanColumn({ column, quotes, activeId }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const getColumnIcon = (columnId) => {
    const icons = {
      pending: "⏳",
      reviewing: "🔍",
      sent: "📤",
      approved: "✅",
      closed: "🔒",
    };
    return icons[columnId] || "📋";
  };

  return (
    <div className="flex-shrink-0 w-[320px] md:w-[340px]">
      <div className={`rounded-xl border ${column.color} p-4 h-full flex flex-col backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">{getColumnIcon(column.id)}</span>
            <h3 className="font-semibold text-white">{column.label}</h3>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
            {quotes.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className="flex-1 space-y-2.5 overflow-y-auto min-h-[200px] pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          <SortableContext items={quotes.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} isDragging={activeId === quote.id} />
            ))}
          </SortableContext>

          {quotes.length === 0 && (
            <div className="text-center text-white/30 text-sm py-12 border-2 border-dashed border-white/10 rounded-lg">
              <div className="text-2xl mb-2" aria-hidden="true">📭</div>
              <div>Sin cotizaciones</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminQuotes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [originalStatus, setOriginalStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/quotes");
      setItems(data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDeleteAll() {
    if (!confirm("¿Eliminar TODAS las cotizaciones y sus PDFs?")) return;
    try {
      setDeletingAll(true);
      await api.delete("/quotes");
      await load();
      alert("Cotizaciones eliminadas.");
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    } finally {
      setDeletingAll(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/quotes/${id}/status`, { status: newStatus });

      await load();

      const statusLabels = {
        pending: "Pendiente",
        reviewing: "En Revisión",
        sent: "Enviada",
        approved: "Aprobada",
        closed: "Cerrada",
      };

      setToast(`Estado actualizado a: ${statusLabels[newStatus]}`);
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el estado.");
    }
  }

  function handleDragStart(event) {
    const quote = items.find((q) => q.id === event.active.id);
    setActiveId(event.active.id);
    setOriginalStatus(quote?.status || "pending");
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeQuote = items.find((q) => q.id === activeId);
    if (!activeQuote) return;

    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && activeQuote.status !== overColumn.id) {
      setItems((prev) =>
        prev.map((q) => (q.id === activeId ? { ...q, status: overColumn.id } : q))
      );
    }

    const overQuote = items.find((q) => q.id === overId);
    if (overQuote && activeQuote.status !== overQuote.status) {
      setItems((prev) =>
        prev.map((q) => (q.id === activeId ? { ...q, status: overQuote.status } : q))
      );
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const draggedQuote = items.find((q) => q.id === active.id);

    setActiveId(null);

    if (!over || !draggedQuote) {
      setOriginalStatus(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeQuote = items.find((q) => q.id === activeId);
    if (!activeQuote) {
      setOriginalStatus(null);
      return;
    }

    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      // Solo actualizar si el estado realmente cambió
      if (originalStatus !== overColumn.id) {
        updateStatus(activeId, overColumn.id);
      }
      setOriginalStatus(null);
      return;
    }

    const overQuote = items.find((q) => q.id === overId);
    if (overQuote && activeQuote?.status === overQuote.status) {
      const oldIndex = items.findIndex((q) => q.id === activeId);
      const newIndex = items.findIndex((q) => q.id === overId);
      setItems(arrayMove(items, oldIndex, newIndex));
      setOriginalStatus(null);
    } else if (overQuote) {
      // Solo actualizar si el estado realmente cambió
      if (originalStatus !== overQuote.status) {
        updateStatus(activeId, overQuote.status);
      }
      setOriginalStatus(null);
    }
  }

  const filteredItems = items.filter((q) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      q.code?.toLowerCase().includes(term) ||
      q.customer_name?.toLowerCase().includes(term) ||
      q.customer_email?.toLowerCase().includes(term) ||
      q.customer_company?.toLowerCase().includes(term)
    );
  });

  const quotesByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredItems.filter((q) => (q.status || "pending") === col.id);
    return acc;
  }, {});

  const activeQuote = activeId ? items.find((q) => q.id === activeId) : null;

  const stats = {
    total: items.length,
    pending: items.filter((q) => (q.status || "pending") === "pending").length,
    reviewing: items.filter((q) => q.status === "reviewing").length,
    sent: items.filter((q) => q.status === "sent").length,
    approved: items.filter((q) => q.status === "approved").length,
    closed: items.filter((q) => q.status === "closed").length,
  };

  return (
    <section className="container mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2 font-semibold text-primary">Pipeline de Cotizaciones</h1>
          <p className="text-body-sm text-tertiary mt-1">
            Arrastra las tarjetas para cambiar su estado
          </p>
        </div>
        <button
          onClick={handleDeleteAll}
          disabled={deletingAll || loading || items.length === 0}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition
                      focus:outline-none focus:ring-2 focus:ring-glds-error
                      ${
            deletingAll || loading || items.length === 0
              ? "bg-red-900/30 text-red-200/50 cursor-not-allowed"
              : "bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30"
          }`}
          title="Eliminar todas las cotizaciones (solo para pruebas)"
          aria-label="Eliminar todas las cotizaciones"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          {deletingAll ? "Eliminando..." : "Eliminar todas"}
        </button>
      </div>
      <div className="mb-6">
        <label htmlFor="search-quotes" className="sr-only">
          Buscar cotizaciones
        </label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
          <input
            id="search-quotes"
            type="search"
            placeholder="Buscar por código, cliente, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[.06] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-glds-primary"
            aria-label="Buscar cotizaciones por código, cliente, email o empresa"
          />
        </div>
      </div>


      {loading ? (
        <div className="text-white/60 text-center py-12">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="text-white/60 text-center py-12">No hay cotizaciones.</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex gap-4 min-w-min">
              <SortableContext items={COLUMNS.map((col) => col.id)}>
                {COLUMNS.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    quotes={quotesByStatus[column.id] || []}
                    activeId={activeId}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          <DragOverlay>
            {activeQuote ? (
              <div className="rotate-3 scale-105 opacity-90">
                <QuoteCard quote={activeQuote} isDragging={true} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
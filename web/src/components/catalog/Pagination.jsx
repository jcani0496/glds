import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPrev, onNext, pageSize, onPageSize }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        onClick={onPrev}
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
        onClick={onNext}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/[.06] border border-white/10 disabled:opacity-50"
        aria-label="Página siguiente"
      >
        Siguiente <ChevronRight className="w-4 h-4" />
      </button>

      <select
        value={pageSize}
        onChange={(e) => onPageSize?.(Number(e.target.value))}
        className="ml-3 px-2 py-2 rounded-xl bg-white/[.06] border border-white/10 text-sm"
        aria-label="Items por página"
      >
        <option value={6}>6</option>
        <option value={12}>12</option>
        <option value={24}>24</option>
        <option value={48}>48</option>
      </select>
    </div>
  );
}
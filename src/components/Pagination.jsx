import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-3 mt-2 border-t border-divider">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} /> Anterior
      </button>
      <span className="text-xs text-text-muted">
        Página {page + 1} de {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente <ChevronRight size={14} />
      </button>
    </div>
  );
}

import { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import ModalPortal from "./ModalPortal";
import { useCategories } from "../hooks/useCategories";
import { parseLocalDate } from "../utils/date";

const formatCurrency = (value) =>
  `$${Math.round(Number(value || 0)).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

function formatDateLabel(dateString) {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// Modal que aparece cuando `useRecurrenceSync` detecta ocurrencias
// recurrentes vencidas: en vez de agregarlas solas, el usuario decide una
// por una (o en bloque) si se registran como movimiento real o se descartan.
export default function RecurringDueModal({ pending, acceptOccurrence, declineOccurrence, acceptAll, declineAll }) {
  const { getCategoriesByType } = useCategories();
  const [dismissed, setDismissed] = useState(false);
  const [processingKeys, setProcessingKeys] = useState(() => new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const isOpen = pending.length > 0 && !dismissed;

  const items = useMemo(
    () =>
      pending.map((occurrence) => {
        const { template } = occurrence;
        const categories = getCategoriesByType(template.type);
        const category = categories.find((c) => c.id === template.category) || null;
        const IconComponent =
          (category?.icon && LucideIcons[category.icon]) ||
          (template.type === "expense" ? LucideIcons.ArrowDownCircle : LucideIcons.ArrowUpCircle);
        const accent = category?.color || (template.type === "expense" ? "#ef4444" : "#10b981");
        const label = template.name || category?.name || "Sin categoría";

        return { occurrence, category, IconComponent, accent, label };
      }),
    [pending, getCategoriesByType]
  );

  if (!isOpen) return null;

  const withProcessing = async (key, fn) => {
    setProcessingKeys((prev) => new Set(prev).add(key));
    try {
      await fn();
    } finally {
      setProcessingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleAccept = (occurrence) => withProcessing(occurrence.key, () => acceptOccurrence(occurrence));
  const handleDecline = (occurrence) => withProcessing(occurrence.key, () => declineOccurrence(occurrence));

  const handleAcceptAll = async () => {
    setBulkProcessing(true);
    try {
      await acceptAll(pending);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleDeclineAll = () => {
    declineAll(pending);
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="w-full self-end rounded-t-3xl pb-8 pt-3 md:self-auto md:max-w-md md:mx-auto md:rounded-2xl md:py-6 bg-surface border border-divider shadow-2xl px-6 animate-slide-up md:animate-fade-in max-h-[85vh] flex flex-col">
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-5 md:hidden shrink-0" />

        <h2 className="text-xl font-extrabold text-[var(--color-primary)] mb-1 shrink-0">
          Movimientos recurrentes
        </h2>
        <p className="text-sm text-text-secondary mb-4 shrink-0">
          {pending.length === 1
            ? "Hay 1 movimiento recurrente pendiente. ¿Lo registras?"
            : `Hay ${pending.length} movimientos recurrentes pendientes. ¿Cuáles registras?`}
        </p>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2 mb-4">
          {items.map((item) => {
            const { occurrence, accent, label } = item;
            const Icon = item.IconComponent;
            const isProcessing = processingKeys.has(occurrence.key) || bulkProcessing;
            return (
              <div
                key={occurrence.key}
                className="flex items-center gap-3 py-2 px-2 rounded-xl border border-divider"
              >
                <span className="p-2 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
                  <Icon size={18} style={{ color: accent }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">{label}</p>
                  <p className="text-xs text-text-tertiary truncate">
                    {formatDateLabel(occurrence.date)} · {formatCurrency(occurrence.template.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecline(occurrence)}
                    aria-label="Rechazar movimiento"
                    className="cursor-pointer p-2 rounded-lg text-text-secondary border border-divider hover:bg-hover transition disabled:opacity-50"
                  >
                    <LucideIcons.X size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAccept(occurrence)}
                    aria-label="Aceptar movimiento"
                    className="cursor-pointer p-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    <LucideIcons.Check size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end shrink-0">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg text-text-secondary font-medium hover:bg-hover transition"
          >
            Ahora no
          </button>
          <button
            type="button"
            disabled={bulkProcessing}
            onClick={handleDeclineAll}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg text-text-secondary font-medium border border-divider hover:bg-hover transition disabled:opacity-50"
          >
            Rechazar todos
          </button>
          <button
            type="button"
            disabled={bulkProcessing}
            onClick={handleAcceptAll}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            Aceptar todos
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

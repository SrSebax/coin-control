import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import ModalPortal from "./ModalPortal";
import RecurrenceFields from "./RecurrenceFields";
import { parseLocalDate } from "../utils/date";

function buildDefault(transactionDate) {
  const date = parseLocalDate(transactionDate) || new Date();
  return {
    frequency: "monthly",
    interval: 1,
    dayOfMonth: date.getDate(),
    endDate: null,
  };
}

export default function RecurrenceSheet({ open, onClose, value, transactionDate, onApply, onRemove }) {
  const [draft, setDraft] = useState(() => value || buildDefault(transactionDate));
  const [endEnabled, setEndEnabled] = useState(() => Boolean(value?.endDate));

  useEffect(() => {
    if (open) {
      setDraft(value || buildDefault(transactionDate));
      setEndEnabled(Boolean(value?.endDate));
    }
  }, [open, value, transactionDate]);

  const toggleEndDate = () => {
    setEndEnabled((prev) => {
      const next = !prev;
      if (!next) setDraft((d) => ({ ...d, endDate: null }));
      return next;
    });
  };

  const handleApply = () => {
    onApply({ ...draft, endDate: endEnabled ? draft.endDate : null });
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  return (
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full self-end rounded-t-3xl bg-surface border-t border-divider shadow-2xl px-5 pb-8 max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mt-4 mb-4 sticky top-0" />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-divider">
          <h2 className="text-lg font-bold text-text">Configurar programación</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text-tertiary hover:text-text hover:bg-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <RecurrenceFields draft={draft} setDraft={setDraft} endEnabled={endEnabled} toggleEndDate={toggleEndDate} />

        <div className="space-y-2 mt-6">
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer w-full py-3.5 rounded-2xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition"
          >
            Confirmar
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-hover transition-colors"
            >
              <Trash2 size={14} /> Quitar programación
            </button>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}

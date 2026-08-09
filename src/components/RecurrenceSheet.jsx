import { useEffect, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import ModalPortal from "./ModalPortal";
import DateInput from "./inputs/DateInput";
import { parseLocalDate } from "../utils/date";
import { describeRecurrence, unitLabel } from "../utils/recurrence";

const FREQUENCIES = [
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
  { id: "biweekly", label: "Quincenal" },
  { id: "monthly", label: "Mensual" },
  { id: "yearly", label: "Anual" },
];

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

  const setInterval_ = (delta) => {
    setDraft((prev) => ({ ...prev, interval: Math.max(1, Math.min(99, prev.interval + delta)) }));
  };

  const setDayOfMonth = (delta) => {
    setDraft((prev) => {
      const max = prev.frequency === "biweekly" ? 16 : 31;
      return { ...prev, dayOfMonth: Math.max(1, Math.min(max, prev.dayOfMonth + delta)) };
    });
  };

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

        <div className="space-y-6">
          <div>
            <p className="text-sm text-text-tertiary mb-2">Frecuencia</p>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => {
                const isSelected = draft.frequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        frequency: f.id,
                        interval: f.id === "biweekly" ? 1 : prev.interval,
                        dayOfMonth: f.id === "biweekly" ? Math.min(prev.dayOfMonth, 16) : prev.dayOfMonth,
                      }))
                    }
                    className={`cursor-pointer py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isSelected ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-secondary"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {draft.frequency !== "biweekly" && (
            <div>
              <p className="text-sm text-text-tertiary mb-2">Cada cuánto</p>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInterval_(-1)}
                  aria-label="Reducir"
                  className="cursor-pointer w-11 h-11 rounded-xl bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
                >
                  <Minus size={16} />
                </button>
                <p className="text-lg text-text">
                  <span className="text-2xl font-bold mr-1.5">{draft.interval}</span>
                  {unitLabel(draft.frequency, draft.interval)}
                </p>
                <button
                  type="button"
                  onClick={() => setInterval_(1)}
                  aria-label="Aumentar"
                  className="cursor-pointer w-11 h-11 rounded-xl bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {(draft.frequency === "monthly" || draft.frequency === "biweekly") && (
            <div>
              <p className="text-sm text-text-tertiary mb-2">
                {draft.frequency === "biweekly" ? "Día inicial" : "Día del mes"}
              </p>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDayOfMonth(-1)}
                  aria-label="Reducir"
                  className="cursor-pointer w-11 h-11 rounded-xl bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
                >
                  <Minus size={16} />
                </button>
                <p className="text-lg text-text">
                  <span className="text-2xl font-bold mr-1.5">{draft.dayOfMonth}</span>
                  del mes
                </p>
                <button
                  type="button"
                  onClick={() => setDayOfMonth(1)}
                  aria-label="Aumentar"
                  className="cursor-pointer w-11 h-11 rounded-xl bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1.5">
                {draft.frequency === "biweekly"
                  ? `Se generará los días ${draft.dayOfMonth} y ${Math.min(draft.dayOfMonth + 15, 31)} de cada mes.`
                  : "Si el mes tiene menos días, se usará el último día del mes."}
              </p>
            </div>
          )}

          <div className="bg-surface-alt rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">Fecha de fin</p>
              <button
                type="button"
                role="switch"
                aria-checked={endEnabled}
                onClick={toggleEndDate}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  endEnabled ? "bg-emerald-500" : "bg-hover"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    endEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {endEnabled && (
              <div className="flex justify-center mt-4">
                <DateInput
                  variant="pill"
                  name="recurrenceEndDate"
                  value={draft.endDate || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Esta transacción se generará automáticamente {describeRecurrence(draft)}.
            </p>
          </div>
        </div>

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

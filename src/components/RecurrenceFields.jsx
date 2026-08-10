import { Minus, Plus } from "lucide-react";
import DateInput from "./inputs/DateInput";
import { describeRecurrence, unitLabel } from "../utils/recurrence";

const FREQUENCIES = [
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
  { id: "biweekly", label: "Quincenal" },
  { id: "monthly", label: "Mensual" },
  { id: "yearly", label: "Anual" },
];

export default function RecurrenceFields({ draft, setDraft, endEnabled, toggleEndDate }) {
  const setInterval_ = (delta) => {
    setDraft((prev) => ({ ...prev, interval: Math.max(1, Math.min(99, prev.interval + delta)) }));
  };

  const setDayOfMonth = (delta) => {
    setDraft((prev) => {
      const max = prev.frequency === "biweekly" ? 16 : 31;
      return { ...prev, dayOfMonth: Math.max(1, Math.min(max, prev.dayOfMonth + delta)) };
    });
  };

  return (
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
  );
}

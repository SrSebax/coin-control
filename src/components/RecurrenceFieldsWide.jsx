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

function Stepper({ label, value, unit, onDecrease, onIncrease }) {
  return (
    <div>
      <p className="text-sm text-text-tertiary mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrease}
          aria-label="Reducir"
          className="cursor-pointer w-9 h-9 rounded-lg bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
        >
          <Minus size={14} />
        </button>
        <p className="text-text w-28 text-center">
          <span className="text-xl font-bold mr-1">{value}</span>
          {unit}
        </p>
        <button
          type="button"
          onClick={onIncrease}
          aria-label="Aumentar"
          className="cursor-pointer w-9 h-9 rounded-lg bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function RecurrenceFieldsWide({ draft, setDraft, endEnabled, toggleEndDate }) {
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
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-tertiary mb-2">Frecuencia</p>
        <div className="flex flex-wrap gap-2">
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
                className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isSelected ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-secondary hover:bg-hover"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-10">
        {draft.frequency !== "biweekly" && (
            <Stepper
              label="Cada cuánto"
              value={draft.interval}
              unit={unitLabel(draft.frequency, draft.interval)}
              onDecrease={() => setInterval_(-1)}
              onIncrease={() => setInterval_(1)}
            />
          )}

          {(draft.frequency === "monthly" || draft.frequency === "biweekly") && (
            <Stepper
              label={draft.frequency === "biweekly" ? "Día inicial" : "Día del mes"}
              value={draft.dayOfMonth}
              unit="del mes"
              onDecrease={() => setDayOfMonth(-1)}
              onIncrease={() => setDayOfMonth(1)}
            />
          )}
      </div>

      {(draft.frequency === "monthly" || draft.frequency === "biweekly") && (
        <p className="text-xs text-text-muted -mt-3">
          {draft.frequency === "biweekly"
            ? `Se generará los días ${draft.dayOfMonth} y ${Math.min(draft.dayOfMonth + 15, 31)} de cada mes.`
            : "Si el mes tiene menos días, se usará el último día del mes."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-6 bg-surface-alt rounded-xl p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={endEnabled}
            onClick={toggleEndDate}
            className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
              endEnabled ? "bg-emerald-500" : "bg-hover"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                endEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <p className="text-sm font-medium text-text">Fecha de fin</p>
        </div>
        {endEnabled && (
          <div className="w-56">
            <DateInput
              variant="wide"
              name="recurrenceEndDate"
              value={draft.endDate || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Esta transacción se generará automáticamente {describeRecurrence(draft)}.
        </p>
      </div>
    </div>
  );
}

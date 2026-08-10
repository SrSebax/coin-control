import { useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import RecurrenceFieldsWide from "./RecurrenceFieldsWide";
import { parseLocalDate } from "../utils/date";
import { describeRecurrence } from "../utils/recurrence";

function buildDefault(transactionDate) {
  const date = parseLocalDate(transactionDate) || new Date();
  return {
    frequency: "monthly",
    interval: 1,
    dayOfMonth: date.getDate(),
    endDate: null,
  };
}

export default function RecurrencePanel({ value, transactionDate, onChange, onRemove }) {
  const enabled = Boolean(value);
  const [draft, setDraft] = useState(() => value || buildDefault(transactionDate));
  const [endEnabled, setEndEnabled] = useState(() => Boolean(value?.endDate));

  useEffect(() => {
    if (value) {
      setDraft(value);
      setEndEnabled(Boolean(value.endDate));
    }
  }, [value]);

  const updateDraft = (updater) => {
    setDraft((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onChange(next);
      return next;
    });
  };

  const toggleEndDate = () => {
    setEndEnabled((prev) => {
      const next = !prev;
      updateDraft((d) => ({ ...d, endDate: next ? d.endDate : null }));
      return next;
    });
  };

  const handleToggle = () => {
    if (enabled) {
      onRemove();
      return;
    }
    const initial = buildDefault(transactionDate);
    setDraft(initial);
    setEndEnabled(false);
    onChange(initial);
  };

  return (
    <div className="rounded-xl border border-divider bg-surface overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <span className="inline-flex p-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Repeat size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-text">Recurrente</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {enabled ? describeRecurrence(draft) : "Configura este movimiento para que se repita"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activar recurrencia"
          onClick={handleToggle}
          className={`shrink-0 cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-emerald-500" : "bg-hover"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="border-t border-divider p-4">
          <RecurrenceFieldsWide draft={draft} setDraft={updateDraft} endEnabled={endEnabled} toggleEndDate={toggleEndDate} />
        </div>
      )}
    </div>
  );
}

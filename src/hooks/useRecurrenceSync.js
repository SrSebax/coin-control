import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useTransactions } from "./useTransactions";
import { generateDueOccurrences } from "../utils/recurrence";

const DECLINED_KEY = "coinControl_recurrenceDeclinedKeys";

const listeners = new Set();
function emitChange() {
  listeners.forEach((listener) => listener());
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readDeclined() {
  try {
    const raw = localStorage.getItem(DECLINED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

let declinedKeys = readDeclined();

function declineKey(key) {
  declinedKeys = new Set(declinedKeys).add(key);
  localStorage.setItem(DECLINED_KEY, JSON.stringify(Array.from(declinedKeys)));
  emitChange();
}

function getDeclinedSnapshot() {
  return declinedKeys;
}

const occurrenceKey = (templateId, date) => `${templateId}|${date}`;

// Motor de recurrencias: detecta ocurrencias vencidas de cada plantilla
// (`recurring: true`) y las deja pendientes de decisión del usuario en vez
// de agregarlas solas — `RecurringDueModal` es quien las acepta o rechaza.
// Una vez decidida una ocurrencia (aceptada -> ya existe como transacción
// real con `generatedFrom`; rechazada -> queda en `declinedKeys`), el
// prefijo contiguo de ocurrencias resueltas avanza `lastGeneratedDate` de
// la plantilla, así no se recalculan en cada sync. Ocurrencias pendientes
// más allá del primer hueco sin decidir se siguen mostrando (no se pierden).
export function useRecurrenceSync(enabled) {
  const declined = useSyncExternalStore(subscribe, getDeclinedSnapshot);
  const { transactions, addTransaction, applyRecurrenceUpdates } = useTransactions();

  const templates = useMemo(
    () => transactions.filter((t) => t.recurring && t.recurrence),
    [transactions]
  );

  const { pending, resolvedTemplateUpdates } = useMemo(() => {
    const pendingList = [];
    const templateUpdates = [];

    templates.forEach((t) => {
      const { occurrences } = generateDueOccurrences(t);
      if (occurrences.length === 0) return;

      let resolvedUntil = null;
      let sawUnresolved = false;

      occurrences.forEach((date) => {
        const key = occurrenceKey(t.id, date);
        const alreadyGenerated = transactions.some((tx) => tx.generatedFrom === t.id && tx.date === date);
        const isDeclined = declined.has(key);

        if (alreadyGenerated || isDeclined) {
          if (!sawUnresolved) resolvedUntil = date;
          return;
        }

        sawUnresolved = true;
        pendingList.push({ key, template: t, date });
      });

      if (resolvedUntil && resolvedUntil !== t.recurrence.lastGeneratedDate) {
        templateUpdates.push({
          ...t,
          recurrence: { ...t.recurrence, lastGeneratedDate: resolvedUntil },
        });
      }
    });

    return { pending: pendingList, resolvedTemplateUpdates: templateUpdates };
  }, [templates, transactions, declined]);

  useEffect(() => {
    if (!enabled || resolvedTemplateUpdates.length === 0) return;
    applyRecurrenceUpdates({ templateUpdates: resolvedTemplateUpdates });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, resolvedTemplateUpdates]);

  const acceptOccurrence = ({ template, date }) =>
    addTransaction({
      type: template.type,
      amount: template.amount,
      name: template.name,
      category: template.category,
      date,
      note: template.note,
      recurring: false,
      generatedFrom: template.id,
    });

  const declineOccurrence = (occurrence) => declineKey(occurrence.key);

  const acceptAll = (occurrences) => Promise.all(occurrences.map(acceptOccurrence));
  const declineAll = (occurrences) => occurrences.forEach(declineOccurrence);

  return { pending: enabled ? pending : [], acceptOccurrence, declineOccurrence, acceptAll, declineAll };
}

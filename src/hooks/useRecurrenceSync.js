import { useEffect, useRef } from "react";
import { useTransactions } from "./useTransactions";
import { generateDueOccurrences } from "../utils/recurrence";

// Al cargar la app (una sola vez por sesión), genera las transacciones que
// las plantillas recurrentes deberían haber creado hasta hoy. No hay backend
// ni cron: esto es el "ponerse al día" que corre en el cliente.
export function useRecurrenceSync(enabled) {
  const { transactions, applyRecurrenceUpdates } = useTransactions();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!enabled || ranRef.current) return;
    ranRef.current = true;

    const updatedTemplates = new Map();
    const additions = [];

    transactions.forEach((t) => {
      if (!t.recurring || !t.recurrence) return;

      const { occurrences, lastDate } = generateDueOccurrences(t);
      if (occurrences.length === 0) return;

      occurrences.forEach((date, idx) => {
        additions.push({
          id: `${t.id}-rec-${Date.now()}-${idx}`,
          type: t.type,
          amount: t.amount,
          name: t.name,
          category: t.category,
          date,
          note: t.note,
          recurring: false,
          generatedFrom: t.id,
        });
      });

      updatedTemplates.set(t.id, { ...t, recurrence: { ...t.recurrence, lastGeneratedDate: lastDate } });
    });

    if (additions.length === 0) return;

    applyRecurrenceUpdates({ additions, templateUpdates: Array.from(updatedTemplates.values()) });
    // Corre una sola vez por sesión; no debe reaccionar a cambios posteriores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

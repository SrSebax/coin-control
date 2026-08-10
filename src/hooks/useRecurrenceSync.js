import { useEffect } from "react";
import { useTransactions } from "./useTransactions";
import { generateDueOccurrences } from "../utils/recurrence";

// Genera las transacciones que las plantillas recurrentes deberían haber
// creado hasta hoy. No hay backend ni cron: esto es el "ponerse al día" que
// corre en el cliente. Reacciona a cada cambio de `transactions` (no solo al
// cargar la app) para que una recurrente creada hoy mismo se materialice de
// inmediato — es idempotente (una vez al día por plantilla, gracias a
// `lastGeneratedDate`), así que no genera escrituras de más en los re-runs.
export function useRecurrenceSync(enabled) {
  const { transactions, applyRecurrenceUpdates } = useTransactions();

  useEffect(() => {
    if (!enabled) return;

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
    // `applyRecurrenceUpdates` es una nueva referencia en cada render de
    // useTransactions; solo debe reaccionar a cambios reales de `transactions`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, transactions]);
}

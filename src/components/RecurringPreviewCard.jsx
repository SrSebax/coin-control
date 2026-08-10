import { Link } from "react-router-dom";
import { ArrowRight, Repeat } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { describeRecurrence, previewNextOccurrence } from "../utils/recurrence";
import { parseLocalDate } from "../utils/date";
import MovementRow from "./MovementRow";

const PREVIEW_SIZE = 4;

const formatNextDate = (dateString) => {
  if (!dateString) return "Sin próxima fecha";
  return `Próxima: ${parseLocalDate(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })}`;
};

export default function RecurringPreviewCard() {
  const { transactions } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");
  const getCategory = (t) =>
    (t.type === "expense" ? expenseCategories : incomeCategories).find((c) => c.id === t.category) || null;

  const templates = transactions
    .filter((t) => t.recurring && t.recurrence)
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
    .slice(0, PREVIEW_SIZE);

  return (
    <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-text">Movimientos recurrentes</h3>
        </div>
        <Link
          to="/recurring-movements"
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-text-tertiary mb-3">
            Marca un movimiento como recurrente al crearlo para verlo aquí.
          </p>
          <Link
            to="/new-entry"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
          >
            Registrar movimiento
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {templates.map((t) => (
            <MovementRow
              key={t.id}
              transaction={t}
              category={getCategory(t)}
              dateLabel=""
              subtitle={`${describeRecurrence(t.recurrence)} · ${formatNextDate(previewNextOccurrence(t))}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

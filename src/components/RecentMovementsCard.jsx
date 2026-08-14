import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ListChecks } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { parseLocalDate } from "../utils/date";
import MovementRow from "./MovementRow";
import Pagination from "./Pagination";

// Solo se guarda la fecha (sin hora), así que mostramos "Hoy"/"Ayer"/fecha corta.
function formatRelativeDate(dateString) {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "expense", label: "Gastos" },
  { key: "income", label: "Ingresos" },
];

const PAGE_SIZE = 5;

// createdAt es un Timestamp de Firestore (existe desde que se agregó el
// campo); los movimientos viejos no lo tienen, así que caen a `date`.
function getSortKey(transaction) {
  return transaction.createdAt?.toMillis?.() ?? parseLocalDate(transaction.date).getTime();
}

export default function RecentMovementsCard() {
  const [filter, setFilter] = useState("todos");
  const [page, setPage] = useState(0);
  const { transactions } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");

  const getCategory = (transaction) => {
    const list = transaction.type === "expense" ? expenseCategories : incomeCategories;
    return list.find((c) => c.id === transaction.category) || null;
  };

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(0);
  };

  const filtered = transactions
    .filter((t) => !t.recurring && (filter === "todos" || t.type === filter))
    .sort((a, b) => getSortKey(b) - getSortKey(a));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-text">Movimientos recientes</h3>
        </div>
        <Link
          to="/select-entry"
          data-tour="history-link-desktop"
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === key
                ? "bg-emerald-600 text-white"
                : "bg-hover text-text-secondary hover:bg-active"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pageItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-tertiary">Sin movimientos registrados.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {pageItems.map((transaction) => (
            <MovementRow
              key={transaction.id}
              transaction={transaction}
              category={getCategory(transaction)}
              dateLabel={formatRelativeDate(transaction.date)}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

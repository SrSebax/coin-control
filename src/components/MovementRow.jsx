import * as LucideIcons from "lucide-react";
import { useHiddenBalances } from "../hooks/useHiddenBalances";

const formatCurrency = (value) =>
  `$${Math.round(Number(value || 0)).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

export default function MovementRow({ transaction, category, dateLabel }) {
  const { hidden } = useHiddenBalances();
  const isExpense = transaction.type === "expense";
  const IconComponent =
    (category?.icon && LucideIcons[category.icon]) ||
    (isExpense ? LucideIcons.ArrowDownCircle : LucideIcons.ArrowUpCircle);
  const accent = category?.color || (isExpense ? "#ef4444" : "#10b981");

  return (
    <div className="flex items-center gap-3 py-2.5 rounded-xl hover:bg-hover transition-colors -mx-2 px-2">
      <span className="p-2 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
        <IconComponent size={18} style={{ color: accent }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text truncate">{transaction.name || "Sin nombre"}</p>
        <p className="text-xs text-text-tertiary truncate">{category?.name || "Sin categoría"}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-text-muted">{dateLabel}</p>
        <p
          className={`text-sm font-semibold ${
            isExpense ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }`}
        >
          {isExpense ? "-" : "+"}
          {hidden ? "••••••" : formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  );
}

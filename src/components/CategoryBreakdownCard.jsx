import { useMemo, useState } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { useTransactions } from "../hooks/useLocalStorage";
import { useCategories } from "../hooks/useCategories";
import ExpenseDonutChart from "./charts/ExpenseDonutChart";

const PERIODS = [
  { key: "month", label: "Este mes" },
  { key: "prevMonth", label: "Mes anterior" },
  { key: "year", label: "Este año" },
];

export default function CategoryBreakdownCard() {
  const [period, setPeriod] = useState("month");
  const { getTransactionsByPeriod } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const expenses = useMemo(() => {
    const now = new Date();
    if (period === "month") {
      return getTransactionsByPeriod(
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0)
      ).filter((t) => t.type === "expense");
    }
    if (period === "prevMonth") {
      return getTransactionsByPeriod(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
        new Date(now.getFullYear(), now.getMonth(), 0)
      ).filter((t) => t.type === "expense");
    }
    return getTransactionsByPeriod(
      new Date(now.getFullYear(), 0, 1),
      new Date(now.getFullYear(), 11, 31)
    ).filter((t) => t.type === "expense");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const expenseCategories = getCategoriesByType("expense");

  return (
    <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-text">Gastos por categoría</h3>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs font-medium text-text-secondary bg-surface-alt border border-divider rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <ExpenseDonutChart transactions={expenses} categories={expenseCategories} />
    </div>
  );
}

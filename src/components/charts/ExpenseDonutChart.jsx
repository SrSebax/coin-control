import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useHiddenBalances } from "../../hooks/useHiddenBalances";
import ChartTooltip from "./ChartTooltip";

const FALLBACK_COLORS = [
  "#0f9c8f", "#f59e0b", "#6366f1", "#ec4899",
  "#3b82f6", "#84cc16", "#f43f5e", "#94a3b8",
];

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

export default function ExpenseDonutChart({ transactions, categories }) {
  const { hidden } = useHiddenBalances();
  const mask = (value) => (hidden ? "••••••" : formatCurrency(value));
  const data = useMemo(() => {
    const totals = new Map();

    transactions.forEach((t) => {
      const category = categories.find((c) => c.id === t.category);
      const key = category?.id || "sin-categoria";
      const current = totals.get(key) || {
        name: category?.name || "Sin categoría",
        value: 0,
        color: category?.color,
      };
      current.value += t.amount;
      totals.set(key, current);
    });

    return Array.from(totals.values())
      .sort((a, b) => b.value - a.value)
      .map((item, idx) => ({
        ...item,
        color: item.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
      }));
  }, [transactions, categories]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 text-center">
        <PieChartIcon size={36} className="text-text-muted mb-2" />
        <p className="text-sm text-text-secondary">
          Aún no hay gastos este período.
        </p>
        <p className="text-xs text-text-muted mt-1">
          Registra un gasto para ver la distribución por categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full sm:w-1/2 h-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={data.length > 1 ? 3 : 0}
              stroke="none"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-text-tertiary">Total</span>
          <span className="text-lg font-bold text-text">
            {mask(total)}
          </span>
        </div>
      </div>

      <div className="w-full sm:w-1/2 space-y-2 max-h-52 overflow-y-auto pr-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-secondary truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="font-medium text-text">
                {mask(item.value)}
              </span>
              <span className="text-xs text-text-muted w-10 text-right">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { BarChart3 } from "lucide-react";
import ChartTooltip from "./ChartTooltip";
import { parseLocalDate } from "../../utils/date";

const DAYS_TO_SHOW = 7;
const INCOME_COLOR = "#10b981";
const EXPENSE_COLOR = "#ef4444";

export default function TrendChart({ transactions }) {
  const data = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        key: date.toDateString(),
        label: date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
        Ingresos: 0,
        Gastos: 0,
      });
    }

    const dayByKey = new Map(days.map((d) => [d.key, d]));

    transactions.forEach((t) => {
      const date = parseLocalDate(t.date);
      const key = date.toDateString();
      const day = dayByKey.get(key);
      if (!day) return;
      if (t.type === "income") day.Ingresos += t.amount;
      else day.Gastos += t.amount;
    });

    return days;
  }, [transactions]);

  const hasMovement = data.some((d) => d.Ingresos > 0 || d.Gastos > 0);

  if (!hasMovement) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 text-center">
        <BarChart3 size={36} className="text-text-muted mb-2" />
        <p className="text-sm text-text-secondary">
          Sin movimientos en los últimos {DAYS_TO_SHOW} días.
        </p>
        <p className="text-xs text-text-muted mt-1">
          Tus ingresos y gastos recientes aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-divider)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={0}
            tick={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-hover)" }} />
          <Bar dataKey="Ingresos" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="Gastos" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

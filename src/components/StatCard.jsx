import React from "react";
import { useHiddenBalances } from "../hooks/useHiddenBalances";

const formatCurrency = (value) => {
  const n = Number(value || 0);
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;
};

const TONES = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    iconBg: "bg-rose-500",
  },
};

export default function StatCard({
  title,
  icon,
  value,
  deltaPercent,
  deltaLabel = "vs mes anterior",
  tone = "emerald",
}) {
  const t = TONES[tone];
  const { hidden } = useHiddenBalances();

  const isPositiveChange = deltaPercent >= 0;
  // Para gastos, subir es "malo" (rojo); para ingresos y ahorro, subir es "bueno" (verde).
  const deltaIsGood = tone === "rose" ? !isPositiveChange : isPositiveChange;

  return (
    <div className={`rounded-2xl border border-divider shadow-md p-5 ${t.bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`p-2 rounded-full ${t.iconBg}`}>{icon}</span>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
      </div>

      <p className="text-2xl font-extrabold text-text">{hidden ? "••••••" : formatCurrency(value)}</p>

      {deltaPercent !== null && deltaPercent !== undefined && (
        <p
          className={`text-xs font-medium mt-1 ${
            deltaIsGood
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isPositiveChange ? "↑" : "↓"} {Math.abs(deltaPercent).toFixed(1)}% {deltaLabel}
        </p>
      )}
    </div>
  );
}

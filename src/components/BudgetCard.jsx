import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Check, X, ChevronRight, Minus, Plus } from "lucide-react";
import { useBudget, resolveActiveBudgetAmount } from "../hooks/useBudget";
import { useHiddenBalances } from "../hooks/useHiddenBalances";
import { useTransactions } from "../hooks/useTransactions";
import { useSelectedMonth } from "../hooks/useSelectedMonth";
import {
  budgetPeriodHalves,
  budgetPeriodRange,
  estimateRecurringExpenseForPeriod,
  formatBudgetRangeLabel,
  sumRecurringExpenseInRange,
} from "../utils/recurrence";
import AmountInput from "./inputs/AmountInput";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

const PERIOD_OPTIONS = [
  { id: "monthly", label: "Mensual", noun: "mensual" },
  { id: "biweekly", label: "Quincenal", noun: "quincenal" },
];

export default function BudgetCard({ tourId = "budget-card" }) {
  const budget = useBudget();
  const { period, biweeklyAnchorDay, biweeklyAmounts, updateBudget } = budget;
  const { transactions } = useTransactions();
  const { hidden } = useHiddenBalances();
  const selectedMonth = useSelectedMonth();
  const mask = (value) => (hidden ? "••••••" : formatCurrency(value));

  const [editing, setEditing] = useState(false);
  const [periodDraft, setPeriodDraft] = useState(period || "monthly");
  const [monthlyDraft, setMonthlyDraft] = useState(budget.amount ?? "");
  const [anchorDayDraft, setAnchorDayDraft] = useState(biweeklyAnchorDay || 15);
  const [firstDraft, setFirstDraft] = useState(biweeklyAmounts?.first ?? "");
  const [secondDraft, setSecondDraft] = useState(biweeklyAmounts?.second ?? "");

  const isBiweekly = period === "biweekly";
  const anchorDay = biweeklyAnchorDay || 15;
  // Mes en curso: la fecha real de hoy (así se resalta la quincena activa).
  // Mes pasado: día 1 de ese mes, solo para ubicar el rango — no hay "hoy".
  const referenceDate = selectedMonth.isCurrentMonth ? new Date() : selectedMonth.date;
  const currentPeriod = PERIOD_OPTIONS.find((p) => p.id === period) || PERIOD_OPTIONS[0];
  const range = budgetPeriodRange(period || "monthly", referenceDate, anchorDay);
  const rangeLabel = formatBudgetRangeLabel(period || "monthly", range);
  const activeAmount = resolveActiveBudgetAmount(budget, referenceDate);
  const spent = estimateRecurringExpenseForPeriod(transactions, period || "monthly", referenceDate, anchorDay);

  const todayMid = new Date();
  todayMid.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.round((range.end - todayMid) / 86400000) + 1);

  const halves = isBiweekly ? budgetPeriodHalves(referenceDate, anchorDay) : null;
  const firstTotal = halves ? sumRecurringExpenseInRange(transactions, halves.first.start, halves.first.end) : 0;
  const secondTotal = halves ? sumRecurringExpenseInRange(transactions, halves.second.start, halves.second.end) : 0;

  const startEdit = () => {
    setPeriodDraft(period || "monthly");
    setMonthlyDraft(budget.amount ?? "");
    setAnchorDayDraft(biweeklyAnchorDay || 15);
    setFirstDraft(biweeklyAmounts?.first ?? "");
    setSecondDraft(biweeklyAmounts?.second ?? "");
    setEditing(true);
  };

  const toPositiveOrNull = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  };

  const save = () => {
    if (periodDraft === "biweekly") {
      updateBudget({
        period: "biweekly",
        biweeklyAnchorDay: anchorDayDraft,
        biweeklyAmounts: { first: toPositiveOrNull(firstDraft), second: toPositiveOrNull(secondDraft) },
      });
    } else {
      updateBudget({ period: "monthly", amount: toPositiveOrNull(monthlyDraft) });
    }
    setEditing(false);
  };

  const hasBudget = activeAmount !== null && activeAmount !== undefined;
  const percent = hasBudget ? Math.min(100, Math.round((spent / activeAmount) * 100)) : 0;
  const remaining = hasBudget ? activeAmount - spent : 0;
  const overBudget = hasBudget && spent > activeAmount;

  return (
    <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-5" data-tour={tourId}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text">Presupuesto {currentPeriod.noun}</h3>
          <p className="text-xs text-text-tertiary mt-0.5 capitalize">{rangeLabel}</p>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
          >
            <Pencil size={12} /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodDraft(p.id)}
                className={`cursor-pointer py-2 rounded-lg text-sm font-semibold transition-colors ${
                  periodDraft === p.id
                    ? "bg-emerald-500 text-white"
                    : "bg-surface-alt text-text-secondary hover:bg-hover"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {periodDraft === "biweekly" ? (
            <>
              <div>
                <p className="text-xs text-text-tertiary mb-1.5">
                  Día de corte: 1–{anchorDayDraft} y {anchorDayDraft + 1}–fin de mes
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAnchorDayDraft((d) => Math.max(2, d - 1))}
                    aria-label="Reducir día de corte"
                    className="cursor-pointer w-9 h-9 rounded-lg bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <p className="text-text w-10 text-center text-lg font-bold">{anchorDayDraft}</p>
                  <button
                    type="button"
                    onClick={() => setAnchorDayDraft((d) => Math.min(27, d + 1))}
                    aria-label="Aumentar día de corte"
                    className="cursor-pointer w-9 h-9 rounded-lg bg-surface-alt text-text flex items-center justify-center hover:bg-hover transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <AmountInput
                label={`Presupuesto días 1–${anchorDayDraft}`}
                name="firstAmount"
                value={firstDraft}
                onChange={(e) => setFirstDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                placeholder="Ej: 700.000"
              />
              <AmountInput
                label={`Presupuesto días ${anchorDayDraft + 1}–fin`}
                name="secondAmount"
                value={secondDraft}
                onChange={(e) => setSecondDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                placeholder="Ej: 700.000"
              />
            </>
          ) : (
            <AmountInput
              label={null}
              name="monthlyAmount"
              value={monthlyDraft}
              onChange={(e) => setMonthlyDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Ej: 1.500.000"
              autoFocus
            />
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="cursor-pointer p-2 rounded-lg bg-hover text-text-secondary hover:bg-active"
              aria-label="Cancelar"
            >
              <X size={16} />
            </button>
            <button
              onClick={save}
              className="cursor-pointer p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              aria-label="Guardar"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      ) : hasBudget ? (
        <>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm text-text-secondary">
              Tus recurrentes suman{" "}
              <span className="font-semibold text-text">{mask(spent)}</span> de{" "}
              {mask(activeAmount)}
            </p>
            <span
              className={`text-sm font-bold shrink-0 ${
                overBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {percent}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-hover overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overBudget ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <p
              className={`text-xs ${
                overBudget
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-text-tertiary"
              }`}
            >
              {overBudget
                ? `Te pasaste por ${mask(Math.abs(remaining))}`
                : `Te quedan ${mask(remaining)} libres`}
            </p>
            <p className="text-xs text-text-tertiary shrink-0">
              {selectedMonth.isCurrentMonth
                ? `${daysRemaining} ${daysRemaining === 1 ? "día" : "días"} restantes`
                : "Período cerrado"}
            </p>
          </div>

          {isBiweekly && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-divider">
              {["first", "second"].map((halfKey) => {
                const halfAmount = biweeklyAmounts?.[halfKey] ?? null;
                const halfTotal = halfKey === "first" ? firstTotal : secondTotal;
                const halfHasBudget = halfAmount !== null && halfAmount !== undefined;
                const halfPercent = halfHasBudget ? Math.min(100, Math.round((halfTotal / halfAmount) * 100)) : 0;
                const halfOver = halfHasBudget && halfTotal > halfAmount;
                const isToday = selectedMonth.isCurrentMonth && range.half === halfKey;

                return (
                  <div
                    key={halfKey}
                    className={`rounded-lg p-2 ${isToday ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-surface-alt"}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                        Días {halfKey === "first" ? `1–${anchorDay}` : `${anchorDay + 1}–fin`}
                      </p>
                      {isToday && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          HOY
                        </span>
                      )}
                    </div>
                    {halfHasBudget ? (
                      <>
                        <p className="text-xs font-semibold text-text">
                          {mask(halfTotal)}{" "}
                          <span className="font-normal text-text-tertiary">de {mask(halfAmount)}</span>
                        </p>
                        <div className="w-full h-1 rounded-full bg-hover overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${halfOver ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${halfPercent}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-text-tertiary">Sin presupuesto</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Link
            to="/budget"
            className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline mt-3"
          >
            Ver detalle <ChevronRight size={12} />
          </Link>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-text-tertiary mb-3">
            {period === "biweekly"
              ? "Configura el presupuesto de esta quincena para hacerle seguimiento."
              : "Configura un presupuesto para hacerle seguimiento a tus recurrentes."}
          </p>
          <button
            onClick={startEdit}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
          >
            <Pencil size={14} /> Configurar presupuesto
          </button>
        </div>
      )}
    </div>
  );
}

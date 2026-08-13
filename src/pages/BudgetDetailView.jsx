import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowDownCircle, ChevronLeft, PiggyBank, Pencil, Check, X, Minus, Plus, Repeat, Tag } from "lucide-react";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import AmountInput from "../components/inputs/AmountInput";
import { useBudget } from "../hooks/useBudget";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { useHiddenBalances } from "../hooks/useHiddenBalances";
import { useSelectedMonth } from "../hooks/useSelectedMonth";
import {
  breakdownRecurringExpenseInRange,
  budgetPeriodHalves,
  budgetPeriodRange,
  formatBudgetRangeLabel,
  sumRecurringExpenseInRange,
  describeRecurrence,
} from "../utils/recurrence";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

const PERIOD_OPTIONS = [
  { id: "monthly", label: "Mensual", noun: "mensual" },
  { id: "biweekly", label: "Quincenal", noun: "quincenal" },
];

export default function BudgetDetailView() {
  const navigate = useNavigate();
  const budget = useBudget();
  const { period, biweeklyAnchorDay, biweeklyAmounts, updateBudget } = budget;
  const { transactions } = useTransactions();
  const { getCategoriesByType } = useCategories();
  const { hidden } = useHiddenBalances();
  const selectedMonth = useSelectedMonth();
  const mask = (value) => (hidden ? "••••••" : formatCurrency(value));

  const [editing, setEditing] = useState(false);
  const [periodDraft, setPeriodDraft] = useState(period || "monthly");
  const [monthlyDraft, setMonthlyDraft] = useState(budget.amount ?? "");
  const [anchorDayDraft, setAnchorDayDraft] = useState(biweeklyAnchorDay || 15);
  const [firstDraft, setFirstDraft] = useState(biweeklyAmounts?.first ?? "");
  const [secondDraft, setSecondDraft] = useState(biweeklyAmounts?.second ?? "");
  const [selectedHalf, setSelectedHalf] = useState(null);

  const anchorDay = biweeklyAnchorDay || 15;
  // Mes en curso: fecha real de hoy (resalta la quincena activa). Mes
  // pasado (elegido en el filtro del header): día 1 de ese mes, solo para
  // ubicar el rango — no hay "hoy" en un mes que ya pasó.
  const referenceDate = useMemo(
    () => (selectedMonth.isCurrentMonth ? new Date() : selectedMonth.date),
    [selectedMonth.isCurrentMonth, selectedMonth.date]
  );
  const todayRange = useMemo(
    () => budgetPeriodRange(period || "monthly", referenceDate, anchorDay),
    [period, anchorDay, referenceDate]
  );
  const halves = useMemo(() => budgetPeriodHalves(referenceDate, anchorDay), [anchorDay, referenceDate]);

  // Al cambiar de quincena en curso, de período, o de mes elegido en el
  // header, vuelve a seguir "hoy" en vez de quedarse pegado a la mitad que
  // el usuario haya tocado antes.
  useEffect(() => {
    setSelectedHalf(null);
  }, [period, todayRange.half, selectedMonth.year, selectedMonth.month]);

  const isBiweekly = period === "biweekly";
  const activeHalf = isBiweekly ? selectedHalf || todayRange.half : null;
  const effectiveRange = isBiweekly ? halves[activeHalf] : todayRange;
  const effectiveAmount = isBiweekly ? biweeklyAmounts?.[activeHalf] ?? null : budget.amount ?? null;

  const currentPeriod = PERIOD_OPTIONS.find((p) => p.id === period) || PERIOD_OPTIONS[0];
  const rangeLabel = formatBudgetRangeLabel(period || "monthly", effectiveRange);

  const startEdit = () => {
    setPeriodDraft(period || "monthly");
    setMonthlyDraft(budget.amount ?? "");
    setAnchorDayDraft(anchorDay);
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

  const expenseCategories = getCategoriesByType("expense");
  const getCategoryFor = (t) => expenseCategories.find((c) => c.id === t.category) || null;

  const breakdown = useMemo(
    () => breakdownRecurringExpenseInRange(transactions, effectiveRange.start, effectiveRange.end),
    [transactions, effectiveRange]
  );
  const total = breakdown.reduce((sum, entry) => sum + entry.subtotal, 0);

  const firstTotal = useMemo(
    () => sumRecurringExpenseInRange(transactions, halves.first.start, halves.first.end),
    [transactions, halves]
  );
  const secondTotal = useMemo(
    () => sumRecurringExpenseInRange(transactions, halves.second.start, halves.second.end),
    [transactions, halves]
  );

  const hasBudget = effectiveAmount !== null && effectiveAmount !== undefined;
  const percent = hasBudget ? Math.min(100, Math.round((total / effectiveAmount) * 100)) : 0;
  const remaining = hasBudget ? effectiveAmount - total : 0;
  const overBudget = hasBudget && total > effectiveAmount;

  return (
    <Layout title="Presupuesto" subtitle="Presupuesto vs. recurrentes esperados">
      <div className="md:hidden flex items-center gap-3 -mx-4 px-4 pb-4 mb-4 border-b border-divider">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text hover:bg-hover transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-text flex-1">Presupuesto</h1>
      </div>

      <div className="space-y-4 pb-4">
        <div
          className={
            isBiweekly && !editing
              ? "space-y-4 md:space-y-0 md:grid md:grid-cols-[1.3fr_1fr] md:gap-4 md:items-stretch"
              : ""
          }
        >
        {/* Hero: resumen del período seleccionado */}
        <div className="rounded-3xl border border-divider bg-surface p-6 flex flex-col md:h-full">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex p-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <PiggyBank size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-text">Presupuesto {currentPeriod.noun}</h2>
                <p className="text-xs text-text-tertiary mt-0.5 capitalize">{rangeLabel}</p>
              </div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <AmountInput
                      label={`Días 1–${anchorDayDraft}`}
                      name="firstAmount"
                      value={firstDraft}
                      onChange={(e) => setFirstDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && save()}
                      placeholder="Ej: 700.000"
                    />
                    <AmountInput
                      label={`Días ${anchorDayDraft + 1}–fin`}
                      name="secondAmount"
                      value={secondDraft}
                      onChange={(e) => setSecondDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && save()}
                      placeholder="Ej: 700.000"
                    />
                  </div>
                </>
              ) : (
                <AmountInput
                  label={null}
                  name="monthlyAmount"
                  autoFocus
                  value={monthlyDraft}
                  onChange={(e) => setMonthlyDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  placeholder="Ej: 1.500.000"
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
            <div className="flex-1 flex flex-col justify-center">
              <p
                className={`text-4xl font-extrabold tracking-tight mb-1 ${
                  overBudget ? "text-red-600 dark:text-red-400" : "text-text"
                }`}
              >
                {overBudget ? `-${mask(Math.abs(remaining))}` : mask(remaining)}
              </p>
              <p className="text-sm text-text-tertiary mb-4">
                {overBudget ? "te pasaste del presupuesto" : "disponible tras tus recurrentes"}
              </p>
              <div className="w-full h-3 rounded-full bg-hover overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${overBudget ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-text-tertiary">
                <span>
                  <span className="font-semibold text-text">{mask(total)}</span> comprometido
                </span>
                <span className="text-right">de {mask(effectiveAmount)}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
              <p className="text-sm text-text-tertiary mb-3">
                {isBiweekly
                  ? "Configura el presupuesto de esta quincena para compararlo con tus recurrentes."
                  : "Configura un presupuesto para compararlo con tus recurrentes."}
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

        {/* Comparativo de ambas quincenas: toca una pa ver su desglose abajo.
            Siempre apiladas (mobile y desktop) para que el texto tenga ancho
            de sobra y no necesite cortarse. */}
        {isBiweekly && !editing && (
          <div className="flex flex-col gap-3 md:h-full">
            {["first", "second"].map((halfKey) => {
              const halfAmount = biweeklyAmounts?.[halfKey] ?? null;
              const halfTotal = halfKey === "first" ? firstTotal : secondTotal;
              const halfHasBudget = halfAmount !== null && halfAmount !== undefined;
              const halfPercent = halfHasBudget ? Math.min(100, Math.round((halfTotal / halfAmount) * 100)) : 0;
              const halfOver = halfHasBudget && halfTotal > halfAmount;
              const isActive = activeHalf === halfKey;
              const isToday = selectedMonth.isCurrentMonth && todayRange.half === halfKey;

              return (
                <button
                  key={halfKey}
                  type="button"
                  onClick={() => setSelectedHalf(halfKey)}
                  className={`cursor-pointer flex-1 text-left rounded-2xl border p-4 flex flex-col justify-center transition-colors ${
                    isActive
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                      : "border-divider bg-surface hover:bg-surface-alt"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                      Días {halfKey === "first" ? `1–${anchorDay}` : `${anchorDay + 1}–fin`}
                    </p>
                    {isToday && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        HOY
                      </span>
                    )}
                  </div>
                  {halfHasBudget ? (
                    <>
                      <p className="text-sm font-bold text-text">
                        {mask(halfTotal)}{" "}
                        <span className="font-normal text-text-tertiary">de {mask(halfAmount)}</span>
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-hover overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full ${halfOver ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{ width: `${halfPercent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-text-tertiary">Sin presupuesto</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
        </div>

        {/* Desglose de recurrentes del período (o quincena) elegido */}
        <div className="rounded-2xl border border-divider bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <p className="text-sm font-semibold text-text">Recurrentes que componen el período</p>
            <span className="text-sm font-bold text-text">{mask(total)}</span>
          </div>

          {breakdown.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="Sin recurrentes en este período"
              message="Los gastos recurrentes que caigan en este período aparecerán aquí"
              buttonText="Crear recurrente"
              buttonPath="/new-recurring"
              iconSize={36}
            />
          ) : (
            <div className="divide-y divide-divider">
              {breakdown.map(({ template, occurrences, subtotal }) => {
                const category = getCategoryFor(template);
                const IconComponent = (category?.icon && LucideIcons[category.icon]) || ArrowDownCircle;
                const accent = category?.color || "#ef4444";

                return (
                  <div key={template.id} className="flex items-center gap-3 p-4">
                    <span className="p-2.5 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
                      <IconComponent size={18} style={{ color: accent }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text truncate">
                        {template.name || category?.name || "Gasto"}
                      </p>
                      <p className="text-xs text-text-tertiary truncate flex items-center gap-1">
                        <Tag size={10} className="shrink-0" />
                        {category?.name || "Sin categoría"} · {describeRecurrence(template.recurrence)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{mask(subtotal)}</p>
                      {occurrences > 1 && (
                        <p className="text-xs text-text-tertiary">
                          {occurrences}x {mask(template.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

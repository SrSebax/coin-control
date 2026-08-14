import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight, Eye, EyeOff, EyeClosed, Wallet } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { usePockets } from "../hooks/usePockets";
import { useCategories } from "../hooks/useCategories";
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import { useBudget, resolveActiveBudgetAmount } from "../hooks/useBudget";
import { useMoneyVisibility } from "../hooks/useHiddenBalances";
import { useSelectedMonth } from "../hooks/useSelectedMonth";
import { parseLocalDate } from "../utils/date";
import { estimateRecurringExpenseForPeriod } from "../utils/recurrence";
import walletImage from "../assets/wallet_transparent.png";
import MovementRow from "./MovementRow";
import SwipeableRow from "./SwipeableRow";
import ConfirmModal from "./ConfirmModal";
import ToastMessage from "./ToastMessage";

const formatCurrency = (value) => `$${Math.round(Number(value || 0)).toLocaleString("es-CO")}`;

const VISIBILITY_ICON = [Eye, EyeOff, EyeClosed];
const VISIBILITY_LABEL = ["Ocultar saldo", "Ocultar todo el dinero de Inicio", "Mostrar valores"];

function formatRelativeDay(dateString) {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// createdAt es un Timestamp de Firestore (existe desde que se agregó el
// campo); los movimientos viejos no lo tienen, así que caen a `date`.
function getCreatedAtMs(transaction) {
  return transaction.createdAt?.toMillis?.() ?? parseLocalDate(transaction.date).getTime();
}

function groupByDay(transactions) {
  const groups = [];
  const byLabel = new Map();

  transactions.forEach((t) => {
    const label = formatRelativeDay(t.date);
    if (!byLabel.has(label)) {
      const group = { label, total: 0, items: [] };
      byLabel.set(label, group);
      groups.push(group);
    }
    const group = byLabel.get(label);
    group.items.push(t);
    group.total += t.type === "income" ? t.amount : -t.amount;
  });

  return groups;
}

export default function MobileHomeCards() {
  const navigate = useNavigate();
  const { transactions, summary, deleteTransaction } = useTransactions();
  const { totalInPockets } = usePockets();
  const { getCategoriesByType } = useCategories();
  const selectedMonth = useSelectedMonth();
  const { monthIncome, monthExpense } = useMonthlyStats(selectedMonth.date);
  const budget = useBudget();
  const { biweeklyAnchorDay } = budget;
  // Mes en curso: fecha real de hoy. Mes pasado elegido en el header: día 1
  // de ese mes, solo para ubicar el rango del presupuesto.
  const budgetReferenceDate = useMemo(
    () => (selectedMonth.isCurrentMonth ? new Date() : selectedMonth.date),
    [selectedMonth.isCurrentMonth, selectedMonth.date]
  );
  const { level, cycle, cardHidden, allHidden } = useMoneyVisibility();
  const [confirmModal, setConfirmModal] = useState({ open: false, entry: null });
  const [toast, setToast] = useState(null);

  const handleEdit = (entryId) => navigate(`/edit-entry/${entryId}`);
  const handleDeleteClick = (entry) => setConfirmModal({ open: true, entry });
  const handleConfirmDelete = () => {
    if (confirmModal.entry) {
      deleteTransaction(confirmModal.entry.id);
      setToast({ message: "Movimiento eliminado", type: "success" });
    }
    setConfirmModal({ open: false, entry: null });
  };
  const VisibilityIcon = VISIBILITY_ICON[level];
  const cardMask = (value, sign = "") => (cardHidden ? "••••••" : `${sign}${formatCurrency(value)}`);
  const mask = (value, sign = "") => (allHidden ? "••••••" : `${sign}${formatCurrency(value)}`);

  // "total" = saldo completo (ingresos - gastos). "libre" = lo que queda
  // afuera de los bolsillos, que son solo un apartado interno del mismo
  // saldo (no ingreso ni gasto real).
  const [saldoViewMode, setSaldoViewMode] = useState("total");
  const saldoTotal = summary.ingresos - summary.gastos;
  const saldoLibre = saldoTotal - totalInPockets;
  const saldo = saldoViewMode === "total" ? saldoTotal : saldoLibre;
  const budgetAmount = resolveActiveBudgetAmount(budget, budgetReferenceDate);
  const hasBudget = budgetAmount !== null && budgetAmount !== undefined;
  const expectedRecurringExpense = useMemo(
    () => estimateRecurringExpenseForPeriod(transactions, budget.period, budgetReferenceDate, biweeklyAnchorDay),
    [transactions, budget.period, biweeklyAnchorDay, budgetReferenceDate]
  );
  const disponiblePercent = hasBudget
    ? Math.max(0, Math.min(100, Math.round(((budgetAmount - expectedRecurringExpense) / budgetAmount) * 100)))
    : null;

  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");
  const getCategoryFor = (t) =>
    (t.type === "expense" ? expenseCategories : incomeCategories).find((c) => c.id === t.category) ||
    null;

  // Movimientos del mes elegido en el header; el resto se ve en "Ver
  // historial completo". Las plantillas recurrentes (aún no ocurridas) no
  // cuentan como movimiento.
  const currentMonth = transactions.filter((t) => {
    if (t.recurring) return false;
    const d = parseLocalDate(t.date);
    return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month;
  });
  // De más nuevo a más antiguo; empates del mismo día se desempatan por
  // orden de creación real (createdAt), no por orden arbitrario de Firestore.
  const sorted = [...currentMonth].sort((a, b) => {
    const dateDiff = parseLocalDate(b.date) - parseLocalDate(a.date);
    return dateDiff !== 0 ? dateDiff : getCreatedAtMs(b) - getCreatedAtMs(a);
  });
  const groups = groupByDay(sorted);

  return (
    <div className="md:hidden space-y-4">
      {/* Saldo disponible */}
      <div
        data-tour="balance-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1f1a] to-[#0d2b22] text-white p-6 shadow-lg"
      >
        <img
          src={walletImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute z-0 -right-0  top-1/2 -translate-y-1/2 w-[105%] max-w-[520px] opacity-10 blur-[0.5px]"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/70 text-sm font-medium">
              {saldoViewMode === "total" ? "Saldo disponible" : "Saldo fuera de bolsillos"}
            </p>
            <button
              onClick={cycle}
              aria-label={VISIBILITY_LABEL[level]}
              className="cursor-pointer p-1.5 -m-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <VisibilityIcon size={16} />
            </button>
          </div>
          <p className="text-4xl font-extrabold tracking-tight mb-3">{cardMask(saldo)}</p>

          {totalInPockets > 0 && (
            <div className="flex items-center gap-2 mb-5 text-xs flex-wrap">
              <div className="inline-flex rounded-full bg-white/10 p-0.5">
                <button
                  onClick={() => setSaldoViewMode("total")}
                  className={`cursor-pointer px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    saldoViewMode === "total" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setSaldoViewMode("libre")}
                  className={`cursor-pointer px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    saldoViewMode === "libre" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Fuera de bolsillos
                </button>
              </div>
              <Link
                to="/pockets"
                className="inline-flex items-center gap-1 text-white/60 hover:text-white transition-colors"
              >
                <Wallet size={13} />
                {cardHidden ? "••••••" : formatCurrency(totalInPockets)} en bolsillos
              </Link>
            </div>
          )}

          {hasBudget && (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-white/50 tracking-wide">DISPONIBLE</span>
                <span className="text-[11px] font-semibold text-white/70">{disponiblePercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                  style={{ width: `${disponiblePercent}%` }}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex p-1 rounded-lg bg-emerald-400/20 text-emerald-300 shrink-0">
                  <TrendingUp size={13} />
                </span>
                <p className="text-[10px] font-semibold text-white/50 tracking-wide truncate">INGRESOS</p>
              </div>
              <p className="text-sm font-bold text-white truncate">{cardMask(monthIncome, "+")}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex p-1 rounded-lg bg-rose-400/20 text-rose-300 shrink-0">
                  <TrendingDown size={13} />
                </span>
                <p className="text-[10px] font-semibold text-white/50 tracking-wide truncate">GASTOS</p>
              </div>
              <p className="text-sm font-bold text-white truncate">{cardMask(monthExpense, "-")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ver historial completo */}
      <Link
        to="/select-entry"
        data-tour="history-link"
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 px-1"
      >
        Ver historial completo <ChevronRight size={16} />
      </Link>

      {/* Movimientos agrupados por día */}
      {groups.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-divider p-6 text-center">
          <p className="text-sm text-text-tertiary">
            {selectedMonth.isCurrentMonth
              ? "Sin movimientos registrados."
              : `Sin movimientos en ${selectedMonth.label.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-sm font-semibold text-text">{group.label}</p>
              <p
                className={`text-sm font-semibold ${
                  group.total >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {mask(Math.abs(group.total), group.total >= 0 ? "+" : "-")}
              </p>
            </div>
            <div className="bg-surface rounded-2xl border border-divider p-2 shadow-sm space-y-1">
              {group.items.map((t) => (
                <SwipeableRow
                  key={t.id}
                  onEdit={() => handleEdit(t.id)}
                  onDelete={() => handleDeleteClick(t)}
                  className="rounded-xl"
                >
                  <MovementRow transaction={t} category={getCategoryFor(t)} dateLabel="" />
                </SwipeableRow>
              ))}
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        open={confirmModal.open}
        title="¿Eliminar movimiento?"
        message={`¿Estás seguro de eliminar el movimiento "${confirmModal.entry?.name || "sin nombre"}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ open: false, entry: null })}
      />

      <ToastMessage
        open={!!toast}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

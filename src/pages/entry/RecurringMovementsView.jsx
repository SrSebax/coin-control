import * as LucideIcons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, Pencil, Repeat, Search, Tag, Trash2 } from "lucide-react";
import Layout from "../../components/Layout";
import EmptyState from "../../components/EmptyState";
import SwipeableRow from "../../components/SwipeableRow";
import MovementRow from "../../components/MovementRow";
import ConfirmModal from "../../components/ConfirmModal";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { describeRecurrence, previewNextOccurrence } from "../../utils/recurrence";
import { parseLocalDate } from "../../utils/date";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatNextDate = (dateString) => {
  if (!dateString) return "Sin próxima fecha";
  return `Próxima: ${parseLocalDate(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })}`;
};

export default function RecurringMovementsView() {
  const navigate = useNavigate();
  const { transactions, deleteTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const [confirmModal, setConfirmModal] = useState({ open: false, entry: null });
  const [search, setSearch] = useState("");

  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");
  const getCategoryFor = (t) =>
    (t.type === "expense" ? expenseCategories : incomeCategories).find((c) => c.id === t.category) || null;

  const templates = useMemo(
    () =>
      transactions
        .filter((t) => t.recurring && t.recurrence)
        .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date)),
    [transactions]
  );

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((t) => {
      const category = getCategoryFor(t);
      return (
        (t.name || "").toLowerCase().includes(term) ||
        (category?.name || "").toLowerCase().includes(term)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, search, expenseCategories, incomeCategories]);

  const handleEdit = (entryId) => navigate(`/edit-entry/${entryId}`);
  const handleDeleteClick = (entry) => setConfirmModal({ open: true, entry });
  const handleConfirmDelete = () => {
    if (confirmModal.entry) deleteTransaction(confirmModal.entry.id);
    setConfirmModal({ open: false, entry: null });
  };

  return (
    <Layout title="Movimientos recurrentes" subtitle="Revisa y edita tus programaciones automáticas">
      <div className="md:hidden pb-4">
        <div className="flex items-center gap-3 -mx-4 px-4 pb-4 mb-4 border-b border-divider">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text hover:bg-hover transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text">Movimientos recurrentes</h1>
        </div>

        {templates.length > 0 && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar movimiento recurrente..."
              className="w-full rounded-xl border border-divider bg-surface pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>
        )}

        {templates.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Sin movimientos recurrentes"
            message="Marca un movimiento como recurrente al crearlo para verlo aquí"
            buttonText="Registrar movimiento"
            buttonPath="/new-entry"
          />
        ) : filteredTemplates.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-10">
            Sin resultados para "{search}".
          </p>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((t) => {
              const category = getCategoryFor(t);
              const isExpense = t.type === "expense";
              const IconComponent =
                (category?.icon && LucideIcons[category.icon]) ||
                (isExpense ? ArrowDownCircle : ArrowUpCircle);
              const accent = category?.color || (isExpense ? "#ef4444" : "#10b981");
              const nextDate = previewNextOccurrence(t);

              return (
                <SwipeableRow
                  key={t.id}
                  onEdit={() => handleEdit(t.id)}
                  onDelete={() => handleDeleteClick(t)}
                  className="rounded-2xl border border-divider/60"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEdit(t.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleEdit(t.id)}
                    className="w-full flex items-center gap-3 p-3 bg-surface active:bg-hover transition-colors cursor-pointer"
                  >
                    <span className="p-2.5 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
                      <IconComponent size={20} style={{ color: accent }} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text truncate">
                        {t.name || category?.name || (isExpense ? "Gasto" : "Ingreso")}
                      </p>
                      <p className="text-xs text-text-tertiary truncate flex items-center gap-1">
                        <Tag size={11} className="shrink-0" />
                        {category?.name || "Sin categoría"}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1 mt-0.5">
                        <Repeat size={11} className="shrink-0" />
                        {describeRecurrence(t.recurrence)} · {formatNextDate(nextDate)}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-bold shrink-0 ${
                        isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </SwipeableRow>
              );
            })}
          </div>
        )}
      </div>

      {/* Escritorio */}
      <div className="hidden md:block bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-sm text-text-tertiary">
            {templates.length} {templates.length === 1 ? "movimiento programado" : "movimientos programados"}
          </p>
          {templates.length > 0 && (
            <div className="relative w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar movimiento recurrente..."
                className="w-full rounded-xl border border-divider bg-surface-alt pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
              />
            </div>
          )}
        </div>

        {templates.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Sin movimientos recurrentes"
            message="Marca un movimiento como recurrente al crearlo para verlo aquí"
            buttonText="Registrar movimiento"
            buttonPath="/new-entry"
          />
        ) : filteredTemplates.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-10">
            Sin resultados para "{search}".
          </p>
        ) : (
          <div className="rounded-2xl border border-divider divide-y divide-divider overflow-hidden">
            {filteredTemplates.map((t) => {
              const category = getCategoryFor(t);
              const nextDate = previewNextOccurrence(t);

              return (
                <div key={t.id} className="group flex items-center gap-2 px-3 hover:bg-hover transition-colors">
                  <div className="flex-1 min-w-0">
                    <MovementRow
                      transaction={t}
                      category={category}
                      dateLabel=""
                      subtitle={`${describeRecurrence(t.recurrence)} · ${formatNextDate(nextDate)}`}
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(t.id)}
                      title="Editar"
                      aria-label="Editar"
                      className="cursor-pointer p-2 rounded-full text-text-tertiary hover:text-emerald-600 hover:bg-active transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(t)}
                      title="Eliminar"
                      aria-label="Eliminar"
                      className="cursor-pointer p-2 rounded-full text-text-tertiary hover:text-red-500 hover:bg-active transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title="¿Eliminar movimiento recurrente?"
        message={`¿Estás seguro de eliminar "${confirmModal.entry?.name || "sin nombre"}"? Esto no elimina los movimientos ya generados, solo detiene la programación.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ open: false, entry: null })}
      />
    </Layout>
  );
}

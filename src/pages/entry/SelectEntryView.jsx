import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowDownCircle, ArrowUpCircle, Check, ChevronLeft, Search, SlidersHorizontal, Tag, Trash2, X, XCircle } from "lucide-react";
import Layout from "../../components/Layout";
import PageHeading from "../../components/PageHeading";
import TabsSwitcher from "../../components/TabsSwitcher";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import EntryCard from "../../components/EntryCard";
import ModalPortal from "../../components/ModalPortal";
import DateInput from "../../components/inputs/DateInput";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { parseLocalDate } from "../../utils/date";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString) => {
  if (!dateString) return "";
  return parseLocalDate(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatGroupLabel = (dateString) => {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";

  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: sameYear ? undefined : "numeric",
  });
};

const groupByDate = (entries) => {
  const groups = [];
  let currentLabel = null;
  let currentItems = null;

  for (const entry of entries) {
    const label = formatGroupLabel(entry.date);
    if (label !== currentLabel) {
      currentLabel = label;
      currentItems = [];
      groups.push({ label, items: currentItems });
    }
    currentItems.push(entry);
  }

  return groups;
};

export default function SelectEntryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, deleteTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();

  // Determinar el tipo basado en el estado de navegación o el tab activo
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.type === "income" ? "ingresos" : "gastos";
  });

  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? "expense" : "income";

  const [search, setSearch] = useState("");
  const [filterCategoryIds, setFilterCategoryIds] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    entryId: null,
  });

  const handleEditEntry = (entryId) => {
    navigate(`/edit-entry/${entryId}`);
  };

  const handleDeleteClick = (entry) => {
    setConfirmModal({
      open: true,
      title: "¿Eliminar movimiento?",
      message: `¿Estás seguro de eliminar el movimiento "${entry.name || "sin nombre"}"? Esta acción no se puede deshacer.`,
      entryId: entry.id,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.entryId) {
      deleteTransaction(confirmModal.entryId);
      setConfirmModal({ open: false, title: "", message: "", entryId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ open: false, title: "", message: "", entryId: null });
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFilterCategoryIds([]);
  };

  const toggleFilterCategory = (categoryId) => {
    setFilterCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const activeFilterCount = filterCategoryIds.length + (filterDate ? 1 : 0);

  const handleClearFilters = () => {
    setFilterCategoryIds([]);
    setFilterDate("");
  };

  const categorias = getCategoriesByType(typeKey);
  const getCategoryFor = (entry) => categorias.find((c) => c.id === entry.category) || null;

  // Filtrar y ordenar transacciones por tipo (más recientes primero)
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.type === typeKey)
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
  }, [transactions, typeKey]);

  const searchedTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return filteredTransactions.filter((entry) => {
      if (filterCategoryIds.length > 0 && !filterCategoryIds.includes(entry.category)) return false;
      if (filterDate && entry.date.split("T")[0] !== filterDate) return false;
      if (!term) return true;

      const category = getCategoryFor(entry);
      return (
        (entry.name || "").toLowerCase().includes(term) ||
        (entry.note || "").toLowerCase().includes(term) ||
        (category?.name || "").toLowerCase().includes(term)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTransactions, search, categorias, filterCategoryIds, filterDate]);

  const totalAmount = useMemo(
    () => searchedTransactions.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
    [searchedTransactions]
  );

  const groupedTransactions = useMemo(() => groupByDate(searchedTransactions), [searchedTransactions]);

  // Renderizar contenido adicional para cada movimiento (vista de escritorio)
  const renderEntryContent = (entry) => {
    return (
      <>
        {entry.note && (
          <p className="text-sm text-text-secondary italic">{entry.note}</p>
        )}
      </>
    );
  };

  // Modificar los datos de entrada para que sean compatibles con EntryCard (vista de escritorio)
  const prepareEntryData = (entry) => {
    return {
      ...entry,
      titleInfo: (
        <p className="text-sm text-text-tertiary flex items-center gap-1">
          <span className="font-medium">{formatDate(entry.date)}</span>
          <span className="text-text-muted">•</span>
          <span>{entry.category}</span>
        </p>
      ),
      rightContent: <span>{formatCurrency(entry.amount)}</span>,
      icon: isExpense ? "ArrowDownCircle" : "ArrowUpCircle",
    };
  };

  return (
    <Layout>
      {/* Vista mobile: lista compacta con búsqueda y filtro por tipo */}
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
          <h1 className="text-lg font-bold text-text">Movimientos</h1>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTabChange("gastos")}
            className={`cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isExpense
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : "bg-surface-alt text-text-tertiary"
            }`}
          >
            <ArrowDownCircle size={16} /> Gastos
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("ingresos")}
            className={`cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              !isExpense
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-surface-alt text-text-tertiary"
            }`}
          >
            <ArrowUpCircle size={16} /> Ingresos
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar movimiento..."
              className="w-full rounded-xl border border-divider bg-surface-alt pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            aria-label="Filtros"
            className={`cursor-pointer relative shrink-0 p-2.5 rounded-xl border transition-colors ${
              activeFilterCount > 0
                ? "border-[var(--color-primary)] bg-surface-alt text-[var(--color-primary)]"
                : "border-divider bg-surface-alt text-text-tertiary hover:bg-hover"
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {filterCategoryIds.map((categoryId) => (
              <span
                key={categoryId}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface-alt border border-divider rounded-full pl-3 pr-2 py-1.5"
              >
                {categorias.find((c) => c.id === categoryId)?.name || "Categoría"}
                <button
                  type="button"
                  onClick={() => toggleFilterCategory(categoryId)}
                  aria-label="Quitar filtro de categoría"
                  className="cursor-pointer p-0.5 rounded-full hover:bg-hover"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {filterDate && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface-alt border border-divider rounded-full pl-3 pr-2 py-1.5">
                {formatDate(filterDate)}
                <button
                  type="button"
                  onClick={() => setFilterDate("")}
                  aria-label="Quitar filtro de fecha"
                  className="cursor-pointer p-0.5 rounded-full hover:bg-hover"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="cursor-pointer text-xs font-medium text-text-tertiary hover:text-text underline underline-offset-2"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {searchedTransactions.length > 0 && (
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs text-text-tertiary">
              {searchedTransactions.length} {searchedTransactions.length === 1 ? "movimiento" : "movimientos"}
            </p>
            <p
              className={`text-sm font-bold ${
                isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isExpense ? "-" : "+"}
              {formatCurrency(totalAmount)}
            </p>
          </div>
        )}

        {searchedTransactions.length === 0 ? (
          <EmptyState
            icon={isExpense ? ArrowDownCircle : ArrowUpCircle}
            title={
              search || activeFilterCount > 0
                ? "Sin resultados"
                : `No hay ${isExpense ? "gastos" : "ingresos"} registrados`
            }
            message={
              search
                ? `No encontramos movimientos para "${search}"`
                : activeFilterCount > 0
                ? "No hay movimientos que coincidan con los filtros aplicados"
                : `No has registrado ningún ${isExpense ? "gasto" : "ingreso"} todavía`
            }
            buttonText={`Registrar ${isExpense ? "gasto" : "ingreso"}`}
            buttonPath="/new-entry"
            buttonColor={isExpense ? "bg-[var(--color-button-expense)]" : "bg-[var(--color-button-income)]"}
            iconColor={isExpense ? "text-[var(--color-expense)]" : "text-[var(--color-income)]"}
          />
        ) : (
          <div className="space-y-5">
            {groupedTransactions.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide px-1 mb-2">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((entry) => {
                    const category = getCategoryFor(entry);
                    const IconComponent =
                      (category?.icon && LucideIcons[category.icon]) ||
                      (isExpense ? ArrowDownCircle : ArrowUpCircle);
                    const accent = category?.color || (isExpense ? "#ef4444" : "#10b981");

                    return (
                      <div
                        key={entry.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleEditEntry(entry.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleEditEntry(entry.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-surface border border-divider/60 active:bg-hover transition-colors cursor-pointer"
                      >
                        <span className="p-2.5 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
                          <IconComponent size={20} style={{ color: accent }} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text truncate">
                            {entry.name || category?.name || (isExpense ? "Gasto" : "Ingreso")}
                          </p>
                          <p className="text-xs text-text-tertiary truncate flex items-center gap-1">
                            <Tag size={11} className="shrink-0" />
                            {category?.name || "Sin categoría"}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-text-muted italic truncate mt-0.5">{entry.note}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-sm font-bold ${
                              isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isExpense ? "-" : "+"}
                            {formatCurrency(entry.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(entry);
                            }}
                            aria-label="Eliminar movimiento"
                            className="cursor-pointer p-2 -mr-1 rounded-full text-text-tertiary hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vista de escritorio: sin cambios */}
      <div className="hidden md:block bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Seleccionar movimiento" />
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={isExpense ? ArrowDownCircle : ArrowUpCircle}
            title={`No hay ${isExpense ? "gastos" : "ingresos"} registrados`}
            message={`No has registrado ningún ${isExpense ? "gasto" : "ingreso"} todavía`}
            buttonText={`Registrar ${isExpense ? "gasto" : "ingreso"}`}
            buttonPath="/new-entry"
            buttonColor={isExpense ? "bg-[var(--color-button-expense)]" : "bg-[var(--color-button-income)]"}
            iconColor={isExpense ? "text-[var(--color-expense)]" : "text-[var(--color-income)]"}
          />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((entry) => {
              const preparedEntry = prepareEntryData(entry);

              return (
                <EntryCard
                  key={entry.id}
                  item={preparedEntry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteClick}
                  renderContent={entry.note ? renderEntryContent : null}
                  defaultIconName={isExpense ? "ArrowDownCircle" : "ArrowUpCircle"}
                  defaultColor={isExpense ? "var(--color-expense)" : "var(--color-income)"}
                  isExpense={isExpense}
                />
              );
            })}
          </div>
        )}
      </div>

      <ModalPortal isOpen={filterSheetOpen}>
        <div className="absolute inset-0" onClick={() => setFilterSheetOpen(false)} />
        <div
          className="relative w-full self-end rounded-t-3xl bg-surface border-t border-divider shadow-2xl p-5 pb-8 max-h-[80vh] flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-4 shrink-0" />

          <div className="flex items-center justify-between mb-5 shrink-0">
            <h2 className="text-base font-bold text-text">Filtros</h2>
            <button
              onClick={() => setFilterSheetOpen(false)}
              aria-label="Cerrar"
              className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text-tertiary hover:text-text hover:bg-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-text-secondary">Categoría</p>
                {filterCategoryIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterCategoryIds([])}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text"
                  >
                    <XCircle size={12} /> Limpiar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {categorias.map((category) => {
                  const Icon = (category.icon && LucideIcons[category.icon]) || Tag;
                  const isSelected = filterCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleFilterCategory(category.id)}
                      className={`cursor-pointer relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors ${
                        isSelected ? "border-[var(--color-primary)] bg-surface-alt" : "border-transparent hover:bg-hover"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                      <span
                        className="p-2.5 rounded-full"
                        style={{ backgroundColor: `${category.color || "#94a3b8"}20`, color: category.color || "#94a3b8" }}
                      >
                        <Icon size={20} />
                      </span>
                      <span className="text-xs font-medium text-text text-center leading-tight truncate w-full">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-text-secondary">Día</p>
                {filterDate && (
                  <button
                    type="button"
                    onClick={() => setFilterDate("")}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text"
                  >
                    <XCircle size={12} /> Limpiar
                  </button>
                )}
              </div>
              <DateInput
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                name="filterDate"
                label=""
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterSheetOpen(false)}
            className="cursor-pointer w-full mt-6 py-3.5 rounded-2xl font-semibold text-white shadow transition bg-[var(--color-primary)] hover:opacity-90 shrink-0"
          >
            Ver resultados
          </button>
        </div>
      </ModalPortal>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Layout>
  );
}

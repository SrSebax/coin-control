import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Layout from "../../components/Layout";
import AmountInput from "../../components/inputs/AmountInput";
import NameInput from "../../components/inputs/NameInput";
import SelectInput from "../../components/inputs/SelectInput";
import DateInput from "../../components/inputs/DateInput";
import NoteTextarea from "../../components/inputs/NoteTextarea";
import ConfirmModal from "../../components/ConfirmModal";
import ToastMessage from "../../components/ToastMessage";
import CategoryPickerSheet from "../../components/CategoryPickerSheet";
import RecurrenceSheet from "../../components/RecurrenceSheet";
import RecurrencePanel from "../../components/RecurrencePanel";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Save,
  X,
  Loader2,
  History,
  ChevronLeft,
  ChevronRight,
  Tag,
  Plus,
  Repeat,
  Wallet,
  Check,
  Pencil,
  StickyNote,
  Lightbulb,
} from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { parseLocalDate } from "../../utils/date";
import { describeRecurrence } from "../../utils/recurrence";

const formatRelativeDate = (dateString) => {
  const date = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

export default function NewEntryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const isEditing = location.state?.isEditing || false;
  const existingTransaction = location.state?.transaction || null;

  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.type === "expense") return "gastos";
    if (location.state?.type === "income") return "ingresos";
    return "gastos";
  });

  const isExpense = activeTab === "gastos";

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFormData((prev) => ({ ...prev, category: "" }));
  };

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
  });

  const [formData, setFormData] = useState(() => {
    if (existingTransaction) {
      return {
        amount: existingTransaction.amount.toString(),
        name: existingTransaction.name || "",
        category: existingTransaction.category || "",
        date: existingTransaction.date.split("T")[0] || "",
        note: existingTransaction.note || "",
        recurring: existingTransaction.recurring || false,
        recurrence: existingTransaction.recurrence || null,
      };
    }
    if (location.state?.restoredFormData) return location.state.restoredFormData;
    return { amount: "", name: "", category: "", date: "", note: "", recurring: false, recurrence: null };
  });

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurrenceSheetOpen, setRecurrenceSheetOpen] = useState(false);
  const [mobileNoteOpen, setMobileNoteOpen] = useState(() =>
    Boolean(existingTransaction?.note || location.state?.restoredFormData?.note)
  );
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEmpty = (field) =>
    touched[field] && (!formData[field] || formData[field].trim() === "");

  const isFormValid = formData.amount && formData.category && formData.date;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const transaction = {
      type: isExpense ? "expense" : "income",
      amount: parseFloat(formData.amount),
      name: formData.name.trim() || selectedCategory?.name || "",
      category: formData.category,
      date: formData.date,
      note: formData.note.trim() || null,
      recurring: formData.recurring,
      recurrence: formData.recurring ? formData.recurrence : null,
    };

    setConfirmModal({
      open: true,
      title: isEditing ? "¿Actualizar movimiento?" : "¿Guardar movimiento?",
      message: isEditing
        ? "¿Estás seguro de actualizar este movimiento?"
        : "¿Estás seguro de guardar este movimiento?",
      data: transaction,
    });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (isEditing && existingTransaction) {
        updateTransaction(existingTransaction.id, confirmModal.data);
        navigate("/", {
          state: {
            message: `${isExpense ? "Gasto" : "Ingreso"} actualizado exitosamente`,
            type: "success",
          },
        });
      } else {
        addTransaction(confirmModal.data);
        if (saveAndAddAnother) {
          setFormData((prev) => ({
            amount: "",
            name: "",
            category: "",
            date: prev.date,
            note: "",
            recurring: false,
            recurrence: null,
          }));
          setTouched({});
          setMobileNoteOpen(false);
          setToast({ message: `${isExpense ? "Gasto" : "Ingreso"} guardado`, type: "success" });
        } else {
          navigate("/", {
            state: {
              message: `${isExpense ? "Gasto" : "Ingreso"} registrado exitosamente`,
              type: "success",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error al guardar la transacción:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, title: "", message: "", data: null });
    }
  };

  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };

  const handleCancel = () => navigate(-1);

  const handleAddNewCategory = () => navigate("/categories");

  useEffect(() => {
    if (location.state?.restoredFormData) {
      setToast({ message: "Categoría creada y seleccionada", type: "success" });
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!formData.date) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      handleChange({ target: { name: "date", value: `${yyyy}-${mm}-${dd}` } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  const categorias = getCategoriesByType(isExpense ? "expense" : "income");
  const selectedCategory = categorias.find((c) => c.id === formData.category) || null;
  const SelectedCategoryIcon = selectedCategory?.icon ? LucideIcons[selectedCategory.icon] : null;

  // Datos para "Movimientos recientes" y "Repetir movimiento"
  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");
  const getCategoryFor = (t) =>
    (t.type === "expense" ? expenseCategories : incomeCategories).find((c) => c.id === t.category) ||
    null;

  const sortedTransactions = transactions
    .filter((t) => !t.recurring)
    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
  const recentTransactions = sortedTransactions.slice(0, 6);

  const pageTitle = isEditing ? "Editar movimiento" : "Registrar movimiento";
  const pageSubtitle = isEditing
    ? "Actualiza los datos de tu movimiento"
    : "Agrega tus ingresos o gastos fácilmente";
  const mobileTitle = isEditing
    ? isExpense
      ? "Editar Gasto"
      : "Editar Ingreso"
    : isExpense
    ? "Nuevo Gasto"
    : "Nuevo Ingreso";

  return (
    <Layout title={pageTitle} subtitle={pageSubtitle}>
      <ToastMessage
        open={!!toast}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Formulario mobile: pantalla dedicada, distinta del layout de escritorio */}
      <form onSubmit={handleSubmit} className="md:hidden pb-32">
        <div className="flex items-center gap-3 -mx-4 px-4 pb-4 mb-2 border-b border-divider">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Volver"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text hover:bg-hover transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text">{mobileTitle}</h1>
        </div>

        <AmountInput
          variant="hero"
          className="py-6"
          value={formData.amount}
          onChange={handleChange}
          onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
          placeholder="0"
        />

        <div className="flex justify-center mb-6">
          <DateInput
            variant="pill"
            value={formData.date}
            onChange={handleChange}
            onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
            name="date"
          />
        </div>

        <div className="space-y-5">
          <NameInput
            variant="flat"
            value={formData.name}
            onChange={handleChange}
            label="Descripción (opcional)"
            placeholder={isExpense ? "¿En qué gastaste?" : "¿De dónde proviene?"}
            maxLength={100}
          />

          <div className="border-t border-divider" />

          <div>
            <p className="text-sm text-text-tertiary mb-1.5">Categoría</p>
            <button
              type="button"
              onClick={() => setCategorySheetOpen(true)}
              className="cursor-pointer w-full flex items-center justify-between py-1"
            >
              <span className="flex items-center gap-2 min-w-0">
                {selectedCategory ? (
                  <>
                    <span className="shrink-0" style={{ color: selectedCategory.color }}>
                      {SelectedCategoryIcon ? <SelectedCategoryIcon size={18} /> : <Tag size={18} />}
                    </span>
                    <span className="text-text truncate">{selectedCategory.name}</span>
                  </>
                ) : (
                  <>
                    <Tag size={18} className="text-text-muted shrink-0" />
                    <span className="text-text-muted">Seleccionar categoría</span>
                  </>
                )}
              </span>
              <ChevronRight size={18} className="text-text-muted shrink-0" />
            </button>
          </div>

          <div className="border-t border-divider" />

          <div className="flex flex-wrap gap-2">
            {!mobileNoteOpen && (
              <button
                type="button"
                onClick={() => setMobileNoteOpen(true)}
                className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary border border-divider rounded-full px-4 py-2 hover:bg-hover transition-colors"
              >
                <Plus size={14} /> Agregar nota
              </button>
            )}

            {formData.recurring ? (
              <div className="inline-flex items-center gap-1 rounded-full pl-1 pr-1 py-1 bg-emerald-500 text-white">
                <button
                  type="button"
                  onClick={() => setRecurrenceSheetOpen(true)}
                  className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium pl-3 pr-1 py-1"
                >
                  <Repeat size={14} />
                  {describeRecurrence(formData.recurrence)}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, recurring: false, recurrence: null }))}
                  aria-label="Quitar recurrencia"
                  className="cursor-pointer p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRecurrenceSheetOpen(true)}
                className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary border border-divider rounded-full px-4 py-2 hover:bg-hover transition-colors"
              >
                <Repeat size={14} /> Recurrente
              </button>
            )}
          </div>

          <RecurrenceSheet
            open={recurrenceSheetOpen}
            onClose={() => setRecurrenceSheetOpen(false)}
            value={formData.recurrence}
            transactionDate={formData.date}
            onApply={(recurrence) => setFormData((prev) => ({ ...prev, recurring: true, recurrence }))}
            onRemove={() => setFormData((prev) => ({ ...prev, recurring: false, recurrence: null }))}
          />

          {mobileNoteOpen && (
            <NoteTextarea value={formData.note} onChange={handleChange} className="" maxLength={200} />
          )}
        </div>

        {/* Footer fijo */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-divider p-4 pb-6 space-y-3">
          {!isEditing && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-text">Guardar y agregar otro</span>
              <button
                type="button"
                role="switch"
                aria-checked={saveAndAddAnother}
                onClick={() => setSaveAndAddAnother((v) => !v)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  saveAndAddAnother ? "bg-emerald-500" : "bg-hover"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    saveAndAddAnother ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`cursor-pointer w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed transition ${
              isExpense
                ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
            }`}
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <CategoryPickerSheet
        open={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        categories={categorias}
        selectedId={formData.category}
        onSelect={(id) => handleChange({ target: { name: "category", value: id } })}
        type={isExpense ? "expense" : "income"}
        draft={formData}
      />

      {/* Escritorio: form ancho arriba, movimientos recientes abajo */}
      <div className="hidden md:block space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl shadow-md border border-divider p-8 space-y-8"
        >
          <div className="flex items-center gap-3 pb-6 border-b border-divider">
            <span className="inline-flex p-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Wallet size={22} />
            </span>
            <div>
              <h2 className="font-bold text-text text-lg leading-tight">Detalles del movimiento</h2>
              <p className="text-sm text-text-tertiary mt-0.5">Completa la información para registrar tu movimiento</p>
            </div>
          </div>

          {/* Monto + fecha */}
          <div className="grid grid-cols-2 gap-10">
            <AmountInput
              variant="wide"
              label="Monto"
              value={formData.amount}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
              error={isEmpty("amount") ? "Ingresa un monto" : undefined}
              placeholder="0"
            />
            <DateInput
              variant="wide"
              label="Fecha"
              value={formData.date}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
              name="date"
            />
          </div>

          {/* Tipo de movimiento */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTabChange("gastos")}
              className={`relative cursor-pointer text-left rounded-2xl border-2 p-5 transition-all ${
                isExpense
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30 shadow-sm"
                  : "border-divider bg-surface hover:bg-surface-alt"
              }`}
            >
              <span
                className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
                  isExpense ? "bg-rose-500 text-white" : "border-2 border-divider"
                }`}
              >
                {isExpense && <Check size={12} strokeWidth={3} />}
              </span>
              <span
                className={`inline-flex p-2.5 rounded-full mb-3 ${
                  isExpense ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-surface-alt text-text-tertiary"
                }`}
              >
                <ArrowDownCircle size={20} />
              </span>
              <p className={`font-semibold ${isExpense ? "text-rose-600 dark:text-rose-400" : "text-text"}`}>
                Gasto
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">Dinero que sale</p>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ingresos")}
              className={`relative cursor-pointer text-left rounded-2xl border-2 p-5 transition-all ${
                !isExpense
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                  : "border-divider bg-surface hover:bg-surface-alt"
              }`}
            >
              <span
                className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
                  !isExpense ? "bg-emerald-500 text-white" : "border-2 border-divider"
                }`}
              >
                {!isExpense && <Check size={12} strokeWidth={3} />}
              </span>
              <span
                className={`inline-flex p-2.5 rounded-full mb-3 ${
                  !isExpense ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-surface-alt text-text-tertiary"
                }`}
              >
                <ArrowUpCircle size={20} />
              </span>
              <p className={`font-semibold ${!isExpense ? "text-emerald-600 dark:text-emerald-400" : "text-text"}`}>
                Ingreso
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">Dinero que entra</p>
            </button>
          </div>

          {/* Categoría + descripción */}
          <div className="grid grid-cols-2 gap-6">
            <SelectInput
              options={categorias}
              value={formData.category}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
              error={isEmpty("category")}
              label="Categoría"
              name="category"
              placeholder="Selecciona una categoría"
              onAddNew={() => handleAddNewCategory()}
              addNewLabel="Agregar categoría"
              isObjectOptions={true}
              icon={Tag}
            />

            <NameInput
              value={formData.name}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              label="Descripción (opcional)"
              placeholder={isExpense ? "¿En qué gastaste?" : "¿De dónde proviene?"}
              maxLength={100}
              icon={Pencil}
            />
          </div>

          {/* Nota */}
          <NoteTextarea
            value={formData.note}
            onChange={handleChange}
            className=""
            maxLength={200}
            icon={StickyNote}
          />

          {/* Recurrente: card propia, debajo de la nota. Al activarla despliega las opciones ahí mismo (nada de bottom sheet en desktop) */}
          <RecurrencePanel
            value={formData.recurring ? formData.recurrence : null}
            transactionDate={formData.date}
            onChange={(recurrence) => setFormData((prev) => ({ ...prev, recurring: true, recurrence }))}
            onRemove={() => setFormData((prev) => ({ ...prev, recurring: false, recurrence: null }))}
          />

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isEditing && (
              <button
                type="submit"
                onClick={() => setSaveAndAddAnother(true)}
                disabled={!isFormValid || isSubmitting}
                className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold text-sm text-text-secondary bg-hover border border-divider hover:bg-active transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> Guardar y agregar otro
              </button>
            )}

            <button
              type="submit"
              onClick={() => setSaveAndAddAnother(false)}
              disabled={!isFormValid || isSubmitting}
              className={`cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-sm text-white shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }`}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Actualizar movimiento"
                : "Guardar movimiento"}
            </button>
          </div>
        </form>

        {/* Consejo: entre el form y los movimientos recientes */}
        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4">
          <span className="text-emerald-600 dark:text-emerald-400 shrink-0">
            <Lightbulb size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-text">Consejo</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Lleva un registro constante de tus movimientos para tener un mejor control de tus finanzas.
            </p>
          </div>
        </div>

        {/* Movimientos recientes: abajo, a todo el ancho, como tarjetas clickeables */}
        <div className="bg-surface rounded-2xl shadow-md border border-divider p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-text">Movimientos recientes</h3>
            </div>
            <Link
              to="/select-entry"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">Sin movimientos registrados.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recentTransactions.map((t) => {
                const category = getCategoryFor(t);
                const isTExpense = t.type === "expense";
                const TIcon = (category?.icon && LucideIcons[category.icon]) || (isTExpense ? ArrowDownCircle : ArrowUpCircle);
                const accent = category?.color || (isTExpense ? "#ef4444" : "#10b981");

                return (
                  <Link
                    key={t.id}
                    to={`/edit-entry/${t.id}`}
                    className="flex items-center gap-3 rounded-xl border border-divider p-3 hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
                  >
                    <span className="p-2 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
                      <TIcon size={16} style={{ color: accent }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">{t.name || category?.name || "Sin nombre"}</p>
                      <p className="text-xs text-text-tertiary truncate">{formatRelativeDate(t.date)}</p>
                    </div>
                    <span
                      className={`text-sm font-semibold shrink-0 ${
                        isTExpense ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {isTExpense ? "-" : "+"}
                      {Math.round(t.amount).toLocaleString("es-CO")}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </Layout>
  );
}

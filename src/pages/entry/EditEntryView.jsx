import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  Tag,
  Plus,
  Repeat,
  X,
  Check,
  Pencil,
  StickyNote,
  Lightbulb,
  History,
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

export default function EditEntryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entryId } = useParams();
  const { transactions, updateTransaction, loading } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const originalTransaction = transactions.find((t) => t.id === entryId) || null;

  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.type === "expense") return "gastos";
    if (location.state?.type === "income") return "ingresos";
    return "gastos";
  });
  const isExpense = activeTab === "gastos";

  const [formData, setFormData] = useState(() => {
    if (location.state?.restoredFormData) return location.state.restoredFormData;
    return { amount: "", name: "", category: "", date: "", note: "", recurring: false, recurrence: null };
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
  });

  const [touched, setTouched] = useState({});
  const [recurrenceSheetOpen, setRecurrenceSheetOpen] = useState(false);
  const [mobileNoteOpen, setMobileNoteOpen] = useState(() => Boolean(formData.note));
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const hydratedRef = useRef(false);

  // Firestore tarda un instante en entregar el primer snapshot (`loading`).
  // Apenas llega el movimiento, cargamos sus datos en el formulario — una
  // sola vez, para no pisar lo que el usuario ya escribió ni lo que vino de
  // "restoredFormData" (categoría creada al vuelo).
  useEffect(() => {
    if (hydratedRef.current || loading || !originalTransaction) return;
    hydratedRef.current = true;

    if (!location.state?.restoredFormData) {
      setFormData({
        amount: originalTransaction.amount.toString(),
        name: originalTransaction.name || "",
        category: originalTransaction.category || "",
        date: originalTransaction.date.split("T")[0] || "",
        note: originalTransaction.note || "",
        recurring: originalTransaction.recurring || false,
        recurrence: originalTransaction.recurrence || null,
      });
      setMobileNoteOpen(Boolean(originalTransaction.note));
    }
    if (!location.state?.type) {
      setActiveTab(originalTransaction.type === "income" ? "ingresos" : "gastos");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, originalTransaction]);

  // Sólo si ya terminó de cargar y el movimiento realmente no existe.
  useEffect(() => {
    if (!loading && !originalTransaction) navigate("/select-entry");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, originalTransaction]);

  useEffect(() => {
    if (location.state?.restoredFormData) {
      setToast({ message: "Categoría creada y seleccionada", type: "success" });
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      name: formData.name.trim(),
      category: formData.category,
      date: formData.date,
      note: formData.note.trim() || null,
      recurring: formData.recurring,
      recurrence: formData.recurring ? formData.recurrence : null,
    };

    setConfirmModal({
      open: true,
      title: "¿Actualizar movimiento?",
      message: "¿Estás seguro de actualizar este movimiento?",
      data: transaction,
    });
  };

  const handleConfirmSubmit = () => {
    // No se espera el ack del servidor: con persistencia offline, la
    // promesa de Firestore no resuelve hasta reconectar. El cambio ya se
    // aplicó en caché local (y en la UI vía onSnapshot), así que navegamos
    // de una vez; si la escritura falla de verdad, solo se loguea.
    updateTransaction(entryId, confirmModal.data).catch((error) => {
      console.error("Error al actualizar la transacción:", error);
    });
    navigate("/home", {
      state: {
        message: `${isExpense ? "Gasto" : "Ingreso"} actualizado exitosamente`,
        type: "success",
      },
    });
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };

  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };

  const handleCancel = () => navigate(-1);

  const handleAddNewCategory = () => navigate("/categories");

  const categorias = getCategoriesByType(isExpense ? "expense" : "income");
  const selectedCategory = categorias.find((c) => c.id === formData.category) || null;
  const SelectedCategoryIcon = selectedCategory?.icon ? LucideIcons[selectedCategory.icon] : null;

  // Datos para "Movimientos recientes"
  const expenseCategories = getCategoriesByType("expense");
  const incomeCategories = getCategoriesByType("income");
  const getCategoryFor = (t) =>
    (t.type === "expense" ? expenseCategories : incomeCategories).find((c) => c.id === t.category) ||
    null;

  const recentTransactions = transactions
    .filter((t) => !t.recurring && t.id !== entryId)
    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
    .slice(0, 6);

  const mobileTitle = isExpense ? "Editar Gasto" : "Editar Ingreso";

  return (
    <Layout title="Editar movimiento" subtitle="Actualiza los datos de tu movimiento">
      <ToastMessage
        open={!!toast}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Formulario mobile: misma experiencia visual que "Registrar movimiento" */}
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
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-divider p-4 pb-6">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`cursor-pointer w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed transition ${
              isExpense
                ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
            }`}
          >
            Actualizar
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
        returnTo={`/edit-entry/${entryId}`}
      />

      {/* Escritorio: mismo diseño que "Registrar movimiento", solo cambia la ruta/acción */}
      <div className="hidden md:block space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl shadow-md border border-divider p-8 space-y-8"
        >
          <div className="flex items-center gap-3 pb-6 border-b border-divider">
            <span
              className={`inline-flex p-2.5 rounded-full ${
                isExpense
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isExpense ? <ArrowDownCircle size={22} /> : <ArrowUpCircle size={22} />}
            </span>
            <div>
              <h2 className="font-bold text-text text-lg leading-tight">
                Editando {isExpense ? "gasto" : "ingreso"}
              </h2>
              <p className="text-sm text-text-tertiary mt-0.5">Actualiza los datos y guarda los cambios</p>
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
              onClick={() => setActiveTab("gastos")}
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
              onClick={() => setActiveTab("ingresos")}
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
          <NoteTextarea value={formData.note} onChange={handleChange} className="" maxLength={200} icon={StickyNote} />

          {/* Recurrente: card propia, debajo de la nota, opciones inline (sin bottom sheet) */}
          <RecurrencePanel
            value={formData.recurring ? formData.recurrence : null}
            transactionDate={formData.date}
            onChange={(recurrence) => setFormData((prev) => ({ ...prev, recurring: true, recurrence }))}
            onRemove={() => setFormData((prev) => ({ ...prev, recurring: false, recurrence: null }))}
          />

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-sm text-white shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }`}
            >
              <Save size={18} />
              Actualizar movimiento
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

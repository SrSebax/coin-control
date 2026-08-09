import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import PageHeading from "../../components/PageHeading";
import SubmitButton from "../../components/SubmitButton";
import AmountInput from "../../components/inputs/AmountInput";
import NameInput from "../../components/inputs/NameInput";
import SelectInput from "../../components/inputs/SelectInput";
import DateInput from "../../components/inputs/DateInput";
import NoteTextarea from "../../components/inputs/NoteTextarea";
import ConfirmModal from "../../components/ConfirmModal";
import ToastMessage from "../../components/ToastMessage";
import CategoryPickerSheet from "../../components/CategoryPickerSheet";
import RecurrenceSheet from "../../components/RecurrenceSheet";
import { Save, ChevronLeft, ChevronRight, Tag, Plus, Repeat, X, Loader2 } from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { describeRecurrence } from "../../utils/recurrence";
import CancelButton from "../../components/CancelButton";

export default function EditEntryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entryId } = useParams();
  const { transactions, updateTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const originalTransaction = transactions.find((t) => t.id === entryId) || null;

  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.type === "expense") return "gastos";
    if (location.state?.type === "income") return "ingresos";
    return originalTransaction?.type === "income" ? "ingresos" : "gastos";
  });
  const isExpense = activeTab === "gastos";

  const [formData, setFormData] = useState(() => {
    if (location.state?.restoredFormData) return location.state.restoredFormData;
    if (originalTransaction) {
      return {
        amount: originalTransaction.amount.toString(),
        name: originalTransaction.name || "",
        category: originalTransaction.category || "",
        date: originalTransaction.date.split("T")[0] || "",
        note: originalTransaction.note || "",
        recurring: originalTransaction.recurring || false,
        recurrence: originalTransaction.recurrence || null,
      };
    }
    return { amount: "", name: "", category: "", date: "", note: "", recurring: false, recurrence: null };
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
  });

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurrenceSheetOpen, setRecurrenceSheetOpen] = useState(false);
  const [mobileNoteOpen, setMobileNoteOpen] = useState(() => Boolean(formData.note));
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Si el movimiento no existe, volver al listado
  useEffect(() => {
    if (!originalTransaction) navigate("/select-entry");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      updateTransaction(entryId, confirmModal.data);
      navigate("/home", {
        state: {
          message: `${isExpense ? "Gasto" : "Ingreso"} actualizado exitosamente`,
          type: "success",
        },
      });
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, title: "", message: "", data: null });
    }
  };

  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };

  const handleCancel = () => navigate(-1);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFormData((prev) => ({ ...prev, category: "" }));
  };

  const handleAddNewCategory = () => navigate("/categories");

  const categorias = getCategoriesByType(isExpense ? "expense" : "income");
  const selectedCategory = categorias.find((c) => c.id === formData.category) || null;
  const SelectedCategoryIcon = selectedCategory?.icon ? LucideIcons[selectedCategory.icon] : null;

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
            disabled={!isFormValid || isSubmitting}
            className={`cursor-pointer w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed transition ${
              isExpense
                ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
            }`}
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting ? "Actualizando..." : "Actualizar"}
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

      {/* Escritorio: layout sin cambios */}
      <form
        onSubmit={handleSubmit}
        className="hidden md:block bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6"
      >
        <div className="text-center sm:text-left">
          <PageHeading title="Editar movimiento" />
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        <div className="space-y-6">
          {/* Agrupar Monto y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AmountInput
              value={formData.amount}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
              error={isEmpty("amount")}
            />

            <NameInput
              value={formData.name}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              error={isEmpty("name")}
            />
          </div>

          {/* Agrupar Categoría y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            />

            <DateInput
              value={formData.date}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
              error={isEmpty("date")}
              label="Fecha"
              name="date"
            />
          </div>

          <NoteTextarea value={formData.note} onChange={handleChange} />

          <div className="flex flex-col w-full space-y-2">
            <CancelButton onClick={handleCancel} sizeClass="w-full mb-2" />

            <SubmitButton
              label={isExpense ? "Actualizar gasto" : "Actualizar ingreso"}
              Icon={Save}
              color={
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }
              text="text-white"
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
            />
          </div>
        </div>
      </form>

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

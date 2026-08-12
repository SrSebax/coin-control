import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Layout from "../../components/Layout";
import AmountInput from "../../components/inputs/AmountInput";
import NameInput from "../../components/inputs/NameInput";
import SelectInput from "../../components/inputs/SelectInput";
import DateInput from "../../components/inputs/DateInput";
import NoteTextarea from "../../components/inputs/NoteTextarea";
import ConfirmModal from "../../components/ConfirmModal";
import CategoryPickerSheet from "../../components/CategoryPickerSheet";
import RecurrenceFields from "../../components/RecurrenceFields";
import RecurrenceFieldsWide from "../../components/RecurrenceFieldsWide";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Plus,
  Repeat,
  Check,
  Pencil,
  StickyNote,
} from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function defaultRecurrence() {
  return { frequency: "monthly", interval: 1, dayOfMonth: new Date().getDate(), endDate: null };
}

export default function NewRecurringEntryView() {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const [activeTab, setActiveTab] = useState("gastos");
  const isExpense = activeTab === "gastos";

  const [formData, setFormData] = useState({ amount: "", name: "", category: "", date: todayISO(), note: "" });
  const [recurrence, setRecurrence] = useState(defaultRecurrence());
  const [endEnabled, setEndEnabled] = useState(false);
  const [registerNow, setRegisterNow] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileNoteOpen, setMobileNoteOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, data: null });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData((prev) => ({ ...prev, category: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEmpty = (field) => touched[field] && (!formData[field] || formData[field].trim() === "");
  const isFormValid = formData.amount && formData.category && (!registerNow || formData.date);

  const toggleEndDate = () => {
    setEndEnabled((prev) => {
      const next = !prev;
      if (!next) setRecurrence((r) => ({ ...r, endDate: null }));
      return next;
    });
  };

  const handleToggleRegisterNow = () => {
    setRegisterNow((prev) => !prev);
  };

  const handleCancel = () => navigate(-1);
  const handleAddNewCategory = () => navigate("/categories");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const anchorDate = registerNow ? formData.date : todayISO();
    const baseRecurrence = { ...recurrence, endDate: endEnabled ? recurrence.endDate : null };

    const transaction = {
      type: isExpense ? "expense" : "income",
      amount: parseFloat(formData.amount),
      name: formData.name.trim(),
      category: formData.category,
      date: anchorDate,
      note: formData.note.trim() || null,
      recurring: true,
      // Si no se registra de inmediato, el ancla queda como "ya generada"
      // hoy: la plantilla solo programa ocurrencias futuras, sin crear un
      // movimiento real en el momento de guardarla.
      recurrence: registerNow ? baseRecurrence : { ...baseRecurrence, lastGeneratedDate: anchorDate },
    };

    setConfirmModal({ open: true, data: transaction });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addTransaction(confirmModal.data);
      navigate("/recurring-movements", {
        state: { message: "Movimiento recurrente creado", type: "success" },
      });
    } catch (error) {
      console.error("Error al crear el movimiento recurrente:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, data: null });
    }
  };

  const handleCancelSubmit = () => setConfirmModal({ open: false, data: null });

  const categorias = getCategoriesByType(isExpense ? "expense" : "income");
  const selectedCategory = categorias.find((c) => c.id === formData.category) || null;
  const SelectedCategoryIcon = selectedCategory?.icon ? LucideIcons[selectedCategory.icon] : null;

  const RegisterToggle = () => (
    <div className="flex items-center gap-3 rounded-xl bg-surface-alt p-4">
      <button
        type="button"
        role="switch"
        aria-checked={registerNow}
        aria-label="Registrar movimiento"
        onClick={handleToggleRegisterNow}
        className={`shrink-0 cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          registerNow ? "bg-emerald-500" : "bg-hover"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            registerNow ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text">Registrar movimiento</p>
        <p className="text-xs text-text-tertiary mt-0.5">
          {registerNow
            ? "Se crea también como movimiento de hoy, además de programarse"
            : "Solo se guarda la programación, sin registrar un movimiento ahora"}
        </p>
      </div>
    </div>
  );

  return (
    <Layout title="Nuevo movimiento recurrente" subtitle="Programa un gasto o ingreso que se repite">
      {/* Mobile */}
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
          <h1 className="text-lg font-bold text-text">Nuevo recurrente</h1>
        </div>

        <AmountInput
          variant="hero"
          className="py-6"
          value={formData.amount}
          onChange={handleChange}
          onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
          placeholder="0"
        />

        <div className="px-1 mb-6">
          <RegisterToggle />
        </div>

        {registerNow && (
          <div className="flex justify-center mb-6">
            <DateInput
              variant="pill"
              value={formData.date}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
              name="date"
            />
          </div>
        )}

        <div className="space-y-5">
          <NameInput
            variant="flat"
            value={formData.name}
            onChange={handleChange}
            label="Descripción (opcional)"
            placeholder={isExpense ? "¿En qué gastarás?" : "¿De dónde proviene?"}
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

          <div className="rounded-xl border border-divider bg-surface overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-divider">
              <span className="inline-flex p-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Repeat size={18} />
              </span>
              <p className="font-semibold text-sm text-text">Programación</p>
            </div>
            <div className="p-4">
              <RecurrenceFields
                draft={recurrence}
                setDraft={setRecurrence}
                endEnabled={endEnabled}
                toggleEndDate={toggleEndDate}
              />
            </div>
          </div>

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
          </div>

          {mobileNoteOpen && (
            <NoteTextarea value={formData.note} onChange={handleChange} className="" maxLength={200} />
          )}
        </div>

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

      {/* Desktop */}
      <div className="hidden md:block space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl shadow-md border border-divider p-8 space-y-8"
        >
          <div className="flex items-center gap-3 pb-6 border-b border-divider">
            <span className="inline-flex p-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Repeat size={22} />
            </span>
            <div>
              <h2 className="font-bold text-text text-lg leading-tight">Nuevo movimiento recurrente</h2>
              <p className="text-sm text-text-tertiary mt-0.5">Programa un gasto o ingreso que se repite automáticamente</p>
            </div>
          </div>

          <div className={`grid ${registerNow ? "grid-cols-2 gap-10" : "grid-cols-1"}`}>
            <AmountInput
              variant="wide"
              label="Monto"
              value={formData.amount}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
              error={isEmpty("amount") ? "Ingresa un monto" : undefined}
              placeholder="0"
            />
            {registerNow && (
              <DateInput
                variant="wide"
                label="Fecha"
                value={formData.date}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
                name="date"
              />
            )}
          </div>

          <RegisterToggle />

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
              placeholder={isExpense ? "¿En qué gastarás?" : "¿De dónde proviene?"}
              maxLength={100}
              icon={Pencil}
            />
          </div>

          <NoteTextarea
            value={formData.note}
            onChange={handleChange}
            className=""
            maxLength={200}
            icon={StickyNote}
          />

          <div className="rounded-xl border border-divider bg-surface overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-divider">
              <span className="inline-flex p-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Repeat size={18} />
              </span>
              <p className="font-semibold text-sm text-text">Programación</p>
            </div>
            <div className="p-4">
              <RecurrenceFieldsWide
                draft={recurrence}
                setDraft={setRecurrence}
                endEnabled={endEnabled}
                toggleEndDate={toggleEndDate}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-sm text-white shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }`}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Guardando..." : "Guardar recurrente"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title="¿Guardar movimiento recurrente?"
        message={
          registerNow
            ? "Se registrará como movimiento de hoy y quedará programado para repetirse."
            : "Solo quedará programado; no se registra ningún movimiento ahora."
        }
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </Layout>
  );
}

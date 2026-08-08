import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Layout from "../../components/Layout";
import IconColorPickerSheet from "../../components/IconColorPickerSheet";
import ConfirmModal from "../../components/ConfirmModal";
import { ChevronLeft, ChevronDown, Tag } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";

const DEFAULT_COLOR = "#10b981";
const DEFAULT_ICON = "Tag";

export default function NewCategoryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addCategory } = useCategories();

  const [isExpense, setIsExpense] = useState(() => location.state?.type !== "income");
  const [formData, setFormData] = useState({ name: "", color: DEFAULT_COLOR, icon: DEFAULT_ICON });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, data: null });

  const isFormValid = Boolean(formData.name.trim());

  const handleCancel = () => navigate(-1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setConfirmModal({
      open: true,
      data: {
        type: isExpense ? "expense" : "income",
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
      },
    });
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    const newCategory = addCategory(confirmModal.data);
    setIsSubmitting(false);
    setConfirmModal({ open: false, data: null });

    const returnTo = location.state?.returnTo;
    if (returnTo) {
      navigate(returnTo, {
        state: {
          type: confirmModal.data.type,
          restoredFormData: { ...(location.state?.draft || {}), category: newCategory.id },
        },
      });
    } else {
      navigate("/categories", { state: { type: confirmModal.data.type } });
    }
  };

  const handleCancelSubmit = () => setConfirmModal({ open: false, data: null });

  const PreviewIcon = LucideIcons[formData.icon] || Tag;

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="pb-28">
        <div className="flex items-center gap-3 -mx-4 px-4 pb-4 mb-2 border-b border-divider">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Volver"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text hover:bg-hover transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text">Nueva Categoría</h1>
        </div>

        <div className="flex justify-center pt-6 pb-8">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <PreviewIcon size={40} style={{ color: formData.color }} />
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="Elegir ícono y color"
              className="cursor-pointer absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0a1f1a] text-white flex items-center justify-center shadow-md hover:bg-[#0d2b22] transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-2xl border border-divider p-4">
            <p className="text-sm text-text-tertiary mb-1">Nombre</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre de la categoría"
              maxLength={40}
              autoFocus
              className="w-full bg-transparent border-none outline-none text-base text-text placeholder-text-muted"
            />
          </div>

          <div className="bg-surface rounded-2xl border border-divider p-4">
            <p className="text-sm text-text-tertiary mb-2">Tipo</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsExpense(true)}
                className={`cursor-pointer py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isExpense ? "text-white" : "bg-surface-alt text-text-secondary"
                }`}
                style={isExpense ? { backgroundColor: "var(--color-button-expense)" } : undefined}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setIsExpense(false)}
                className={`cursor-pointer py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  !isExpense ? "text-white" : "bg-surface-alt text-text-secondary"
                }`}
                style={!isExpense ? { backgroundColor: "var(--color-button-income)" } : undefined}
              >
                Ingreso
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-divider p-4 pb-6">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            style={!isFormValid || isSubmitting ? undefined : { backgroundColor: isExpense ? "var(--color-button-expense)" : "var(--color-button-income)" }}
            className="cursor-pointer w-full py-3.5 rounded-2xl font-semibold text-white disabled:bg-hover disabled:text-text-tertiary disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <IconColorPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        icon={formData.icon}
        color={formData.color}
        onApply={(icon, color) => setFormData((prev) => ({ ...prev, icon, color }))}
      />

      <ConfirmModal
        open={confirmModal.open}
        title="¿Guardar categoría?"
        message="¿Estás seguro de guardar esta categoría?"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </Layout>
  );
}

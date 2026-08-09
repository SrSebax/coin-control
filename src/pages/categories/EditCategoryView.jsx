import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import PageHeading from "../../components/PageHeading";
import NameInput from "../../components/inputs/NameInput";
import ColorInput from "../../components/inputs/ColorInput";
import IconInput from "../../components/inputs/IconInput";
import SubmitButton from "../../components/SubmitButton";
import ConfirmModal from "../../components/ConfirmModal";
import IconColorPickerSheet from "../../components/IconColorPickerSheet";
import { ChevronLeft, ChevronDown, Save, Tag } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import CancelButton from "../../components/CancelButton";

export default function EditCategoryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  const { categories, updateCategory, loading } = useCategories();

  // Determinar el tipo basado en el estado de navegación
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.type === "income" ? "ingresos" : "gastos";
  });

  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? "expense" : "income";

  const originalCategory = (categories[typeKey] || []).find((c) => c.id === categoryId) || null;

  const [formData, setFormData] = useState({ name: "", color: "", icon: "" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hydratedRef = useRef(false);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
  });

  // Firestore tarda un instante en entregar el primer snapshot (`loading`).
  // Sólo cuando llega la categoría cargamos sus datos en el formulario, y
  // sólo si de verdad no existe (ya cargó y no está) volvemos al listado.
  useEffect(() => {
    if (loading) return;

    if (originalCategory && !hydratedRef.current) {
      hydratedRef.current = true;
      setFormData({
        name: originalCategory.name,
        color: originalCategory.color,
        icon: originalCategory.icon,
      });
    } else if (!originalCategory && !hydratedRef.current) {
      navigate("/categories");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, originalCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEmpty = (field) =>
    touched[field] && (!formData[field] || formData[field].trim() === "");

  const isFormValid = formData.name && formData.color && formData.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const categoryData = {
      type: typeKey,
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon,
    };

    setConfirmModal({
      open: true,
      title: "¿Actualizar categoría?",
      message: "¿Estás seguro de actualizar esta categoría?",
      data: categoryData,
    });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      updateCategory(categoryId, typeKey, confirmModal.data);
      navigate("/categories", {
        state: {
          message: "Categoría actualizada exitosamente",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, title: "", message: "", data: null });
    }
  };

  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };

  const handleCancel = () => navigate(-1);

  const PreviewIcon = LucideIcons[formData.icon] || Tag;

  return (
    <Layout>
      {/* Mobile: misma experiencia visual que "Nueva categoría" */}
      <form onSubmit={handleSubmit} className="md:hidden pb-28">
        <div className="flex items-center gap-3 -mx-4 px-4 pb-4 mb-2 border-b border-divider">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Volver"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text hover:bg-hover transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text">Editar categoría</h1>
        </div>

        <div className="flex justify-center pt-6 pb-8">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: `${formData.color || "#94a3b8"}20` }}
            >
              <PreviewIcon size={40} style={{ color: formData.color || "#94a3b8" }} />
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
              className="w-full bg-transparent border-none outline-none text-base text-text placeholder-text-muted"
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-divider p-4 pb-6">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            style={!isFormValid || isSubmitting ? undefined : { backgroundColor: isExpense ? "var(--color-button-expense)" : "var(--color-button-income)" }}
            className="cursor-pointer w-full py-3.5 rounded-2xl font-semibold text-white disabled:bg-hover disabled:text-text-tertiary disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Actualizando..." : "Actualizar"}
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

      {/* Escritorio: sin cambios */}
      <div className="hidden md:block bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Editar categoría" />
          <TabsSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-6">
            <NameInput
              value={formData.name}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              error={isEmpty("name")}
              label="Nombre de categoría"
              placeholder="Ej: Salud"
            />

            <ColorInput
              value={formData.color}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, color: true }))}
              error={isEmpty("color")}
            />

            <IconInput
              value={formData.icon}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, icon: true }))}
              error={isEmpty("icon")}
            />
          </div>

          <div className="flex flex-col w-full space-y-2">
            <CancelButton onClick={handleCancel} sizeClass="w-full mb-2" />

            <SubmitButton
              label="Actualizar categoría"
              Icon={Save}
              color={
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }
              text="text-white"
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              sizeClass="w-full"
            />
          </div>
        </form>
      </div>

      {/* Modal de confirmación */}
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

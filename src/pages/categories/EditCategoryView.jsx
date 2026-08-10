import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import CategoryPreview from "../../components/CategoryPreview";
import NameInput from "../../components/inputs/NameInput";
import IconColorInput from "../../components/inputs/IconColorInput";
import ConfirmModal from "../../components/ConfirmModal";
import IconColorPickerSheet from "../../components/IconColorPickerSheet";
import { ChevronLeft, ChevronDown, Layers, Loader2, Pencil, Save, Search, Tag, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useCategories } from "../../hooks/useCategories";

export default function EditCategoryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  const { categories, updateCategory, deleteCategory, loading } = useCategories();

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

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredCategories = (categories[typeKey] || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

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

  const handleEditOther = (category) =>
    navigate(`/edit-category/${category.id}`, { state: { type: typeKey } });

  const handleDeleteClick = (category) => setDeleteTarget(category);

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteCategory(deleteTarget.id, typeKey);
    setDeleteTarget(null);
  };

  const PreviewIcon = LucideIcons[formData.icon] || Tag;

  return (
    <Layout title="Editar categoría" subtitle="Actualiza los datos y guarda los cambios">
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

      {/* Escritorio: mismo diseño que "Nueva categoría", solo cambia la ruta/acción */}
      <div className="hidden md:block space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl shadow-md border border-divider p-8 space-y-8"
        >
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-divider">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex p-2.5 rounded-full ${
                  isExpense
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <Pencil size={22} />
              </span>
              <div>
                <h2 className="font-bold text-text text-lg leading-tight">Editar categoría</h2>
                <p className="text-sm text-text-tertiary mt-0.5">Actualiza los datos y guarda los cambios</p>
              </div>
            </div>
            <TabsSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="flex items-center gap-6">
            <CategoryPreview icon={formData.icon} color={formData.color} />
            <div className="flex-1 min-w-0">
              <NameInput
                value={formData.name}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                error={isEmpty("name")}
                label="Nombre de categoría"
                placeholder="Ej: Salud"
                icon={Tag}
              />
            </div>
          </div>

          <IconColorInput
            icon={formData.icon}
            color={formData.color}
            onChange={handleChange}
            error={isEmpty("color") || isEmpty("icon")}
          />

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
              {isSubmitting ? "Guardando..." : "Actualizar categoría"}
            </button>
          </div>
        </form>

        {/* Categorías existentes */}
        <div className="bg-surface rounded-2xl shadow-md border border-divider p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-text">
              Categorías existentes <span className="text-text-tertiary font-normal">({filteredCategories.length})</span>
            </h3>
          </div>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full rounded-xl border border-divider bg-surface-alt pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-10">
              {searchTerm ? `Sin resultados para "${searchTerm}".` : "Sin categorías todavía."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((category) => {
                const Icon = (category.icon && LucideIcons[category.icon]) || Tag;
                const accent = category.color || "#94a3b8";
                return (
                  <div
                    key={category.id}
                    className="group inline-flex items-center gap-2 rounded-full border border-divider bg-surface-alt pl-1.5 pr-1 py-1 hover:border-[var(--color-primary)] transition-colors"
                  >
                    <span className="p-1.5 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
                      <Icon size={14} style={{ color: accent }} />
                    </span>
                    <span className="text-sm font-medium text-text">{category.name}</span>
                    <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEditOther(category)}
                        aria-label={`Editar ${category.name}`}
                        className="cursor-pointer p-1 rounded-full text-text-tertiary hover:text-emerald-600 hover:bg-active transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(category)}
                        aria-label={`Eliminar ${category.name}`}
                        className="cursor-pointer p-1 rounded-full text-text-tertiary hover:text-red-500 hover:bg-active transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="¿Eliminar categoría?"
        message={`¿Estás seguro de eliminar la categoría "${deleteTarget?.name || ""}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

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

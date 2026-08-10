import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import CategoryPreview from "../../components/CategoryPreview";
import NameInput from "../../components/inputs/NameInput";
import IconColorInput from "../../components/inputs/IconColorInput";
import ConfirmModal from "../../components/ConfirmModal";
import { ChevronLeft, FolderPlus, Layers, Loader2, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";

const DEFAULT_COLOR = "#10b981";
const DEFAULT_ICON = "Tag";

export default function CategoriesView() {
  const navigate = useNavigate();
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();

  const [activeTab, setActiveTab] = useState("gastos");
  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? "expense" : "income";

  const [formData, setFormData] = useState({
    name: "",
    color: DEFAULT_COLOR,
    icon: DEFAULT_ICON,
  });

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
    action: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = (categories[typeKey] || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEmpty = (field) =>
    touched[field] && (!formData[field] || formData[field].trim() === "");

  const isFormValid = formData.name.trim() && formData.color && formData.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const categoryData = {
      type: typeKey,
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon,
    };

    // Mostrar modal de confirmación
    setConfirmModal({
      open: true,
      title: isEditing ? "¿Actualizar categoría?" : "¿Guardar categoría?",
      message: isEditing
        ? "¿Estás seguro de actualizar esta categoría?"
        : "¿Estás seguro de guardar esta categoría?",
      data: categoryData,
      action: isEditing ? "update" : "add",
    });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (confirmModal.action === "update" && editingId) {
        // Actualizar categoría existente
        updateCategory(editingId, typeKey, confirmModal.data);
      } else if (confirmModal.action === "add") {
        // Crear nueva categoría
        addCategory(confirmModal.data);
      } else if (confirmModal.action === "delete" && confirmModal.data) {
        // Eliminar categoría
        deleteCategory(confirmModal.data, typeKey);
      }

      // Limpiar formulario
      resetForm();
    } catch (error) {
      console.error("Error al procesar la categoría:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({
        open: false,
        title: "",
        message: "",
        data: null,
        action: "",
      });
    }
  };

  const handleCancelSubmit = () => {
    setConfirmModal({
      open: false,
      title: "",
      message: "",
      data: null,
      action: "",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: DEFAULT_COLOR,
      icon: DEFAULT_ICON,
    });
    setTouched({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    resetForm();
    setSearchTerm("");
  };

  const handleAddCategory = () => navigate("/new-category", { state: { type: typeKey } });

  const handleEditCategory = (category) =>
    navigate(`/edit-category/${category.id}`, { state: { type: typeKey } });

  const handleDeleteClick = (category) => {
    setConfirmModal({
      open: true,
      title: "¿Eliminar categoría?",
      message: `¿Estás seguro de eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
      data: category.id,
      action: "delete",
    });
  };

  return (
    <Layout title={isEditing ? "Editar categoría" : "Nueva categoría"} subtitle="Crea y administra tus categorías de ingresos y gastos">
      {/* Mobile: lista de categorías con buscador */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 -mx-4 px-4 pb-4 mb-4 border-b border-divider">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text hover:bg-hover transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text flex-1">Categorías</h1>
          <button
            type="button"
            onClick={handleAddCategory}
            aria-label="Nueva categoría"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-hover transition-colors"
          >
            <Plus size={22} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full rounded-xl border border-divider bg-surface pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
          />
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => handleTabChange("gastos")}
            className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isExpense ? "text-white" : "bg-surface-alt text-text-secondary"
            }`}
            style={isExpense ? { backgroundColor: "var(--color-button-expense)" } : undefined}
          >
            Gastos
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("ingresos")}
            className={`cursor-pointer flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              !isExpense ? "text-white" : "bg-surface-alt text-text-secondary"
            }`}
            style={!isExpense ? { backgroundColor: "var(--color-button-income)" } : undefined}
          >
            Ingresos
          </button>
        </div>

        {filteredCategories.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-10">
            {searchTerm ? `Sin resultados para "${searchTerm}".` : "Sin categorías todavía."}
          </p>
        ) : (
          <div className="space-y-1">
            {filteredCategories.map((category) => {
              const Icon = (category.icon && LucideIcons[category.icon]) || Tag;
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 py-2 rounded-xl hover:bg-hover transition-colors -mx-2 px-2"
                >
                  <button
                    type="button"
                    onClick={() => handleEditCategory(category)}
                    className="cursor-pointer flex items-center gap-3 flex-1 min-w-0 text-left py-0.5"
                  >
                    <span
                      className="p-2 rounded-full shrink-0"
                      style={{ backgroundColor: `${category.color || "#94a3b8"}20`, color: category.color || "#94a3b8" }}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-medium text-text truncate">{category.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditCategory(category)}
                    aria-label={`Editar ${category.name}`}
                    className="cursor-pointer p-2 rounded-full text-text-tertiary hover:text-emerald-600 hover:bg-hover transition-colors shrink-0"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(category)}
                    aria-label={`Eliminar ${category.name}`}
                    className="cursor-pointer p-2 rounded-full text-text-tertiary hover:text-red-500 hover:bg-hover transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Escritorio: mismo lenguaje visual que "Registrar movimiento" */}
      <div className="hidden md:block space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl shadow-md border border-divider p-8 space-y-8"
        >
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-divider">
            <div className="flex items-center gap-3">
              <span className="inline-flex p-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <FolderPlus size={22} />
              </span>
              <div>
                <h2 className="font-bold text-text text-lg leading-tight">
                  {isEditing ? "Editar categoría" : "Nueva categoría"}
                </h2>
                <p className="text-sm text-text-tertiary mt-0.5">Completa la información para {isEditing ? "actualizarla" : "crearla"}</p>
              </div>
            </div>
            <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
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
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold text-sm text-text-secondary bg-hover border border-divider hover:bg-active transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-sm text-white shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }`}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar categoría" : "Guardar categoría"}
            </button>
          </div>
        </form>

        {/* Categorías existentes */}
        <div className="bg-surface rounded-2xl shadow-md border border-divider p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-text">
                Categorías existentes <span className="text-text-tertiary font-normal">({filteredCategories.length})</span>
              </h3>
            </div>
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
                        onClick={() => handleEditCategory(category)}
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import PageHeading from "../../components/PageHeading";
import NameInput from "../../components/inputs/NameInput";
import ColorInput from "../../components/inputs/ColorInput";
import IconInput from "../../components/inputs/IconInput";
import SubmitButton from "../../components/SubmitButton";
import CancelButton from "../../components/CancelButton";
import ConfirmModal from "../../components/ConfirmModal";
import { Plus, Search, Tag, Trash2 } from "lucide-react";
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
    <Layout>
      {/* Mobile: lista de categorías con buscador */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4 px-1">
          <h1 className="text-xl font-extrabold text-text tracking-tight">Categorías</h1>
          <button
            type="button"
            onClick={handleAddCategory}
            aria-label="Nueva categoría"
            className="cursor-pointer p-2 -m-2 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-hover transition-colors"
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

      {/* Escritorio: sin cambios */}
      <div className="hidden md:block bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading
            title={isEditing ? "Editar categoría" : "Registrar nueva categoría"}
          />
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
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

          <div className="flex flex-col w-full">
            {isEditing && (
              <CancelButton
                onClick={resetForm}
                sizeClass="w-full mb-2"
              />
            )}

            <SubmitButton
              label={isEditing ? "Actualizar categoría" : "Guardar categoría"}
              Icon={Plus}
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import PageHeading from "../../components/PageHeading";
import NameInput from "../../components/inputs/NameInput";
import ColorInput from "../../components/inputs/ColorInput";
import IconInput from "../../components/inputs/IconInput";
import SubmitButton from "../../components/SubmitButton";
import CancelButton from "../../components/CancelButton";
import ConfirmModal from "../../components/ConfirmModal";
import { Plus } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";

export default function CategoriesView() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { addCategory, deleteCategory, updateCategory } = useCategories();

  const [activeTab, setActiveTab] = useState("gastos");
  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? "expense" : "income";

  const [formData, setFormData] = useState({
    name: "",
    color: "",
    icon: "",
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

  // Estado para la búsqueda
  const [, setSearchTerm] = useState("");

  // Lista de categorías según el tipo activo

  // Lista filtrada según el término de búsqueda

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

        // Mostrar mensaje de éxito
        // Aquí podrías implementar un sistema de notificaciones
      } else if (confirmModal.action === "add") {
        // Crear nueva categoría
        addCategory(confirmModal.data);

        // Mostrar mensaje de éxito
        // Aquí podrías implementar un sistema de notificaciones
      } else if (confirmModal.action === "delete" && confirmModal.data) {
        // Eliminar categoría
        deleteCategory(confirmModal.data, typeKey);

        // Mostrar mensaje de éxito
        // Aquí podrías implementar un sistema de notificaciones
      }

      // Limpiar formulario
      resetForm();
    } catch (error) {
      console.error("Error al procesar la categoría:", error);
      // Aquí podrías mostrar un mensaje de error
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
      color: "",
      icon: "",
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

  // Función para renderizar el icono de la categoría

  return (
    <Layout>
      <div className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
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

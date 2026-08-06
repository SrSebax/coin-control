import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import PageHeading from "../../components/PageHeading";
import NameInput from "../../components/inputs/NameInput";
import ColorInput from "../../components/inputs/ColorInput";
import IconInput from "../../components/inputs/IconInput";
import SubmitButton from "../../components/SubmitButton";
import ConfirmModal from "../../components/ConfirmModal";
import { Save } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import CancelButton from "../../components/CancelButton";


export default function EditCategoryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  const { categories, updateCategory } = useCategories();

  // Determinar el tipo basado en el estado de navegación
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.type === "income" ? "ingresos" : "gastos";
  });

  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? "expense" : "income";

  const [formData, setFormData] = useState({
    name: "",
    color: "",
    icon: "",
  });

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
  });

  // Cargar los datos de la categoría a editar
  useEffect(() => {
    if (categoryId) {
      const categoryList = categories[typeKey] || [];
      const category = categoryList.find((cat) => cat.id === categoryId);

      if (category) {
        setFormData({
          name: category.name,
          color: category.color,
          icon: category.icon,
        });
      } else {
        // Si no se encuentra la categoría, redirigir a la vista de categorías
        navigate("/categories");
      }
    }
  }, [categoryId, categories, typeKey, navigate]);

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
      title: "¿Actualizar categoría?",
      message: "¿Estás seguro de actualizar esta categoría?",
      data: categoryData,
    });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Actualizar categoría existente
      updateCategory(categoryId, typeKey, confirmModal.data);

      // Redirigir a la vista de categorías
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

  const handleCancel = () => {
    navigate("/categories");
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Aquí podrías actualizar el tipo de categoría si es necesario
  };

  return (
    <Layout>
      <div className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Editar categoría" />
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

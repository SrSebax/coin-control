import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Folder } from "lucide-react";
import Layout from "../../components/Layout";
import PageHeading from "../../components/PageHeading";
import TabsSwitcher from "../../components/TabsSwitcher";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import SelectItemCard from "../../components/SelectItemCard";
import { useCategories } from "../../hooks/useCategories";

export default function SelectCategoryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, deleteCategory } = useCategories();
  
  // Determinar el tipo basado en el estado de navegación o el tab activo
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.type === 'income' ? "ingresos" : "gastos";
  });
  
  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? "expense" : "income";
  
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    categoryId: null
  });
  
  const handleEditCategory = (categoryId) => {
    navigate(`/edit-category/${categoryId}`, { 
      state: { type: isExpense ? 'expense' : 'income' }
    });
  };
  
  const handleDeleteClick = (category) => {
    setConfirmModal({
      open: true,
      title: "¿Eliminar categoría?",
      message: `¿Estás seguro de eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
      categoryId: category.id
    });
  };
  
  const handleConfirmDelete = () => {
    if (confirmModal.categoryId) {
      deleteCategory(confirmModal.categoryId, typeKey);
      setConfirmModal({ open: false, title: "", message: "", categoryId: null });
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmModal({ open: false, title: "", message: "", categoryId: null });
  };
  
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleAddCategory = () => {
    navigate('/categories', { state: { type: isExpense ? 'expense' : 'income' } });
  };
  
  const categoryList = categories[typeKey] || [];
  
  return (
    <Layout>
      <div className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Seleccionar categoría" />
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
        
        {categoryList.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No hay categorías registradas"
            message={`No has creado ninguna categoría de ${isExpense ? 'gastos' : 'ingresos'} todavía`}
            buttonText="Crear categoría"
            buttonPath="/categories"
            buttonColor={isExpense ? "bg-[var(--color-button-expense)]" : "bg-[var(--color-button-income)]"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoryList.map((category) => (
              <SelectItemCard
                key={category.id}
                item={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteClick}
                defaultIconName="Folder"
                defaultColor={isExpense ? "var(--color-expense)" : "var(--color-income)"}
              />
            ))}
            
            {/* Botón para añadir nueva categoría */}
            <SelectItemCard
              isAddButton={true}
              onAdd={handleAddCategory}
              addText="Añadir categoría"
            />
          </div>
        )}
      </div>
      
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Layout>
  );
}
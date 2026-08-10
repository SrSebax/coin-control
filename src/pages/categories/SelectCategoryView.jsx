import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Folder, Search } from "lucide-react";
import Layout from "../../components/Layout";
import PageHeading from "../../components/PageHeading";
import TabsSwitcher from "../../components/TabsSwitcher";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import CategoryGridCard from "../../components/CategoryGridCard";
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
  
  const [searchTerm, setSearchTerm] = useState("");

  const categoryList = categories[typeKey] || [];
  const filteredCategoryList = categoryList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <Layout title="Seleccionar categoría" subtitle="Elegí una categoría para editarla o eliminarla">
      {/* Mobile: sin cambios */}
      <div className="md:hidden bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryList.map((category) => (
              <CategoryGridCard
                key={category.id}
                item={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteClick}
                defaultIconName="Folder"
                defaultColor={isExpense ? "var(--color-expense)" : "var(--color-income)"}
              />
            ))}

            {/* Botón para añadir nueva categoría */}
            <CategoryGridCard
              isAddButton={true}
              onAdd={handleAddCategory}
              addText="Añadir categoría"
            />
          </div>
        )}
      </div>

      {/* Escritorio: mismo lenguaje visual que "Movimientos" */}
      <div className="hidden md:block bg-surface/90 backdrop-blur-sm rounded-3xl shadow-md border border-divider p-8">
        <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-divider">
          <div className="flex items-center gap-3">
            <span className="inline-flex p-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Folder size={22} />
            </span>
            <div>
              <h2 className="font-bold text-text text-lg leading-tight">Seleccionar categoría</h2>
              <p className="text-sm text-text-tertiary mt-0.5">Elegí una categoría para editarla o eliminarla</p>
            </div>
          </div>
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full rounded-xl border border-divider bg-surface-alt pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
          />
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
        ) : filteredCategoryList.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-10">
            Sin resultados para "{searchTerm}".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredCategoryList.map((category) => (
              <CategoryGridCard
                key={category.id}
                item={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteClick}
                defaultIconName="Folder"
                defaultColor={isExpense ? "var(--color-expense)" : "var(--color-income)"}
              />
            ))}

            <CategoryGridCard
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
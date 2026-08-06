import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import Layout from "../../components/Layout";
import PageHeading from "../../components/PageHeading";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import SelectItemCard from "../../components/SelectItemCard";
import { usePockets } from "../../hooks/usePockets";

export default function SelectPocketView() {
  const navigate = useNavigate();
  const { pockets, deletePocket, loading } = usePockets();
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    pocketId: null
  });

  const handleEditPocket = (pocketId) => {
    navigate(`/edit-pocket/${pocketId}`);
  };

  const handleDeleteClick = (pocket) => {
    setConfirmModal({
      open: true,
      title: "¿Eliminar bolsillo?",
      message: `¿Estás seguro de eliminar el bolsillo "${pocket.name}"? Esta acción no se puede deshacer.`,
      pocketId: pocket.id
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.pocketId) {
      deletePocket(confirmModal.pocketId);
      setConfirmModal({ open: false, title: "", message: "", pocketId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ open: false, title: "", message: "", pocketId: null });
  };

  const handleAddPocket = () => {
    navigate('/pockets');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calcular el progreso del ahorro
  const calculateProgress = (savedAmount, targetAmount) => {
    if (!targetAmount) return 0;
    const progress = (savedAmount / targetAmount) * 100;
    return Math.min(progress, 100); // No permitir que supere el 100%
  };

  // Renderizar contenido adicional para cada bolsillo
  const renderPocketContent = (pocket) => {
    const progress = calculateProgress(pocket.savedAmount || 0, pocket.targetAmount);
    
    return (
      <>
        {pocket.targetAmount && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-active rounded-full h-2">
              <div
                className="bg-[var(--color-primary)] h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{formatCurrency(pocket.savedAmount || 0)}</span>
              <span>{formatCurrency(pocket.targetAmount)}</span>
            </div>
          </div>
        )}

        {pocket.scheduledAmount && (
          <div className="text-sm text-text-secondary mt-2">
            <p>Ahorro programado: {formatCurrency(pocket.scheduledAmount)} ({pocket.frequency})</p>
            {pocket.nextSavingDate && (
              <p>Próximo ahorro: {formatDate(pocket.nextSavingDate)}</p>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <Layout>
      <div className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Seleccionar bolsillo" />
          <p className="text-text-secondary mt-2">Selecciona un bolsillo para editar o eliminar</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : pockets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No hay bolsillos registrados"
            message="No has creado ningún bolsillo de ahorro todavía"
            buttonText="Crear bolsillo"
            buttonPath="/pockets"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pockets.map((pocket) => (
              <SelectItemCard
                key={pocket.id}
                item={pocket}
                onEdit={handleEditPocket}
                onDelete={handleDeleteClick}
                renderContent={renderPocketContent}
                defaultIconName="PiggyBank"
                defaultColor="#36A2EB"
              />
            ))}
            
            {/* Botón para añadir nuevo bolsillo */}
            <SelectItemCard
              isAddButton={true}
              onAdd={handleAddPocket}
              addText="Añadir bolsillo"
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
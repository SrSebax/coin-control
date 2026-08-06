import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Layout from "../../components/Layout";
import PageHeading from "../../components/PageHeading";
import TabsSwitcher from "../../components/TabsSwitcher";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import EntryCard from "../../components/EntryCard";
import { useTransactions } from "../../hooks/useLocalStorage";
import { parseLocalDate } from "../../utils/date";

export default function SelectEntryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, deleteTransaction } = useTransactions();
  
  // Determinar el tipo basado en el estado de navegación o el tab activo
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.type === 'income' ? "ingresos" : "gastos";
  });
  
  const isExpense = activeTab === "gastos";
  const typeKey = isExpense ? 'expense' : 'income';
  
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    entryId: null
  });
  
  const handleEditEntry = (entryId) => {
    navigate(`/edit-entry/${entryId}`);
  };
  
  const handleDeleteClick = (entry) => {
    setConfirmModal({
      open: true,
      title: "¿Eliminar movimiento?",
      message: `¿Estás seguro de eliminar el movimiento "${entry.name}"? Esta acción no se puede deshacer.`,
      entryId: entry.id
    });
  };
  
  const handleConfirmDelete = () => {
    if (confirmModal.entryId) {
      deleteTransaction(confirmModal.entryId);
      setConfirmModal({ open: false, title: "", message: "", entryId: null });
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmModal({ open: false, title: "", message: "", entryId: null });
  };
  
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
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
    if (!dateString) return "";
    
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Filtrar transacciones por tipo
  const filteredTransactions = transactions.filter(transaction => transaction.type === typeKey);
  
  // Renderizar contenido adicional para cada movimiento
  const renderEntryContent = (entry) => {
    return (
      <>
        {entry.note && (
          <p className="text-sm text-text-secondary italic">{entry.note}</p>
        )}
      </>
    );
  };

  // Modificar los datos de entrada para que sean compatibles con EntryCard
  const prepareEntryData = (entry) => {
    return {
      ...entry,
      // Añadir información adicional para mostrar en el título
      titleInfo: (
        <p className="text-sm text-text-tertiary flex items-center gap-1">
          <span className="font-medium">{formatDate(entry.date)}</span>
          <span className="text-text-muted">•</span>
          <span>{entry.category}</span>
        </p>
      ),
      // Añadir información adicional para mostrar a la derecha
      rightContent: (
        <span>
          {formatCurrency(entry.amount)}
        </span>
      ),
      // Usar icono según el tipo
      icon: isExpense ? "ArrowDownCircle" : "ArrowUpCircle"
    };
  };
  
  return (
    <Layout>
      <div className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Seleccionar movimiento" />
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
        
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={isExpense ? ArrowDownCircle : ArrowUpCircle}
            title={`No hay ${isExpense ? 'gastos' : 'ingresos'} registrados`}
            message={`No has registrado ningún ${isExpense ? 'gasto' : 'ingreso'} todavía`}
            buttonText={`Registrar ${isExpense ? 'gasto' : 'ingreso'}`}
            buttonPath="/new-entry"
            buttonColor={isExpense ? "bg-[var(--color-button-expense)]" : "bg-[var(--color-button-income)]"}
            iconColor={isExpense ? "text-[var(--color-expense)]" : "text-[var(--color-income)]"}
          />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((entry) => {
              const preparedEntry = prepareEntryData(entry);
              
              return (
                <EntryCard
                  key={entry.id}
                  item={preparedEntry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteClick}
                  renderContent={entry.note ? renderEntryContent : null}
                  defaultIconName={isExpense ? "ArrowDownCircle" : "ArrowUpCircle"}
                  defaultColor={isExpense ? "var(--color-expense)" : "var(--color-income)"}
                  isExpense={isExpense}
                />
              );
            })}
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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import TabsSwitcher from "../../components/TabsSwitcher";
import PageHeading from "../../components/PageHeading";
import SubmitButton from "../../components/SubmitButton";
import AmountInput from "../../components/inputs/AmountInput";
import NameInput from "../../components/inputs/NameInput";
import SelectInput from "../../components/inputs/SelectInput";
import DateInput from "../../components/inputs/DateInput";
import NoteTextarea from "../../components/inputs/NoteTextarea";
import ConfirmModal from "../../components/ConfirmModal";
import { ArrowDownCircle, ArrowUpCircle, Save } from "lucide-react";
import { useTransactions } from "../../hooks/useLocalStorage";
import { useCategories } from "../../hooks/useCategories";
import CancelButton from "../../components/CancelButton";


export default function EditEntryView() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const { transactions, updateTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    category: "",
    date: "",
    note: "",
  });
  
  // Estado para el tipo de transacción
  const [activeTab, setActiveTab] = useState("gastos");
  const isExpense = activeTab === "gastos";
  
  // Estado para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null
  });
  
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cargar los datos de la transacción a editar
  useEffect(() => {
    if (entryId) {
      const transaction = transactions.find(t => t.id === entryId);
      
      if (transaction) {
        setFormData({
          amount: transaction.amount.toString(),
          name: transaction.name || "",
          category: transaction.category || "",
          date: transaction.date.split('T')[0] || "",
          note: transaction.note || "",
        });
        
        // Establecer el tipo correcto de transacción
        setActiveTab(transaction.type === 'expense' ? "gastos" : "ingresos");
      } else {
        // Si no se encuentra la transacción, redirigir a la vista principal
        navigate('/home');
      }
    }
  }, [entryId, transactions, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const isEmpty = (field) =>
    touched[field] && (!formData[field] || formData[field].trim() === "");
  
  const isFormValid = formData.amount && formData.name && formData.category && formData.date;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const transaction = {
      type: isExpense ? 'expense' : 'income',
      amount: parseFloat(formData.amount),
      name: formData.name.trim(),
      category: formData.category,
      date: formData.date,
      note: formData.note.trim() || null
    };
    
    // Mostrar modal de confirmación
    setConfirmModal({
      open: true,
      title: "¿Actualizar movimiento?",
      message: "¿Estás seguro de actualizar este movimiento?",
      data: transaction
    });
  };
  
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Actualizar transacción existente
      updateTransaction(entryId, confirmModal.data);
      
      // Redirigir a la vista principal
      navigate('/home', { 
        state: { 
          message: `${isExpense ? 'Gasto' : 'Ingreso'} actualizado exitosamente`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error al actualizar la transacción:', error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, title: "", message: "", data: null });
    }
  };
  
  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };
  
  const handleCancel = () => {
    navigate('/home');
  };
  
  // Manejador personalizado para cambiar el tipo de transacción
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Limpiar la categoría seleccionada al cambiar de tipo de transacción
    setFormData(prev => ({
      ...prev,
      category: ""
    }));
  };
  
  // Función para manejar la adición de una nueva categoría
  const handleAddNewCategory = () => {
    // Navegar a la página de categorías
    navigate('/categories');
  };
  
  // Obtener las categorías según el tipo seleccionado
  const categorias = getCategoriesByType(isExpense ? 'expense' : 'income');
  
  return (
    <Layout>
      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Editar movimiento" />
          <TabsSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        <div className="space-y-6">
          {/* Agrupar Monto y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AmountInput
              value={formData.amount}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
              error={isEmpty("amount")}
            />
            
            <NameInput
              value={formData.name}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              error={isEmpty("name")}
            />
          </div>

          {/* Agrupar Categoría y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput
              options={categorias}
              value={formData.category}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
              error={isEmpty("category")}
              label="Categoría"
              name="category"
              placeholder="Selecciona una categoría"
              onAddNew={() => handleAddNewCategory()}
              addNewLabel="Agregar categoría"
              isObjectOptions={true}
            />

            <DateInput
              value={formData.date}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
              error={isEmpty("date")}
              label="Fecha"
              name="date"
            />
          </div>

          <NoteTextarea value={formData.note} onChange={handleChange} />

          <div className="flex flex-col w-full space-y-2">
          <CancelButton
                onClick={handleCancel}
                sizeClass="w-full mb-2"
              />
            
            <SubmitButton
              label={isExpense ? "Actualizar gasto" : "Actualizar ingreso"}
              Icon={Save}
              color={
                isExpense
                  ? "bg-[var(--color-button-expense)] hover:bg-[var(--color-button-expense-hover)]"
                  : "bg-[var(--color-button-income)] hover:bg-[var(--color-button-income-hover)]"
              }
              text="text-white"
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
            />
          </div>
        </div>
      </form>
      
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
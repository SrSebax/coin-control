import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useTransactions } from "../../hooks/useLocalStorage";
import { useCategories } from "../../hooks/useCategories";

export default function NewEntryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTransaction, updateTransaction } = useTransactions();
  const { getCategoriesByType } = useCategories();
  
  // Verificar si estamos editando una transacción existente
  const isEditing = location.state?.isEditing || false;
  const existingTransaction = location.state?.transaction || null;
  
  // Determinar el tipo basado en el estado de navegación o el tab activo
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.type === 'expense') return "gastos";
    if (location.state?.type === 'income') return "ingresos";
    return "gastos";
  });
  
  const isExpense = activeTab === "gastos";
  
  // Manejador personalizado para cambiar el tipo de transacción
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Limpiar la categoría seleccionada al cambiar de tipo de transacción
    setFormData(prev => ({
      ...prev,
      category: ""
    }));
  };
  
  // Estado para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null
  });

  // Inicializar el formulario con datos existentes si estamos editando
  const [formData, setFormData] = useState(() => {
    if (existingTransaction) {
      return {
        amount: existingTransaction.amount.toString(),
        name: existingTransaction.name || "",
        category: existingTransaction.category || "",
        date: existingTransaction.date.split('T')[0] || "",
        note: existingTransaction.note || "",
      };
    }
    return {
      amount: "",
      name: "",
      category: "",
      date: "",
      note: "",
    };
  });

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      title: isEditing ? "¿Actualizar movimiento?" : "¿Guardar movimiento?",
      message: isEditing 
        ? "¿Estás seguro de actualizar este movimiento?"
        : "¿Estás seguro de guardar este movimiento?",
      data: transaction
    });
  };
  
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && existingTransaction) {
        // Actualizar transacción existente
        updateTransaction(existingTransaction.id, confirmModal.data);
        
        navigate('/', { 
          state: { 
            message: `${isExpense ? 'Gasto' : 'Ingreso'} actualizado exitosamente`,
            type: 'success'
          }
        });
      } else {
        // Crear nueva transacción
        addTransaction(confirmModal.data);
        
        navigate('/', { 
          state: { 
            message: `${isExpense ? 'Gasto' : 'Ingreso'} registrado exitosamente`,
            type: 'success'
          }
        });
      }
    } catch (error) {
      console.error('Error al guardar la transacción:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, title: "", message: "", data: null });
    }
  };
  
  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };
  
  // Función para manejar la adición de una nueva categoría
  const handleAddNewCategory = () => {
    // Navegar a la página de categorías
    navigate('/categories');
  };

  useEffect(() => {
    if (!formData.date) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;
      handleChange({ target: { name: "date", value: localDate } });
    }
  }, [formData.date]);

  // Obtener las categorías según el tipo seleccionado
  const categorias = getCategoriesByType(isExpense ? 'expense' : 'income');

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-md border border-divider p-6 space-y-6">
        <div className="text-center sm:text-left">
          <PageHeading title={isEditing ? "Editar movimiento" : "Registrar nuevo movimiento"} />
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

          <SubmitButton
            label={isEditing 
              ? (isExpense ? "Actualizar gasto" : "Actualizar ingreso")
              : (isExpense ? "Guardar gasto" : "Guardar ingreso")
            }
            Icon={isExpense ? ArrowDownCircle : ArrowUpCircle}
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
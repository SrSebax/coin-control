import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageHeading from "../../components/PageHeading";
import IconInput from "../../components/inputs/IconInput";
import ColorInput from "../../components/inputs/ColorInput";
import NameInput from "../../components/inputs/NameInput";
import AmountInput from "../../components/inputs/AmountInput";
import DateInput from "../../components/inputs/DateInput";
import SelectInput from "../../components/inputs/SelectInput";
import SubmitButton from "../../components/SubmitButton";
import ConfirmModal from "../../components/ConfirmModal";
import { PiggyBank, Plus } from "lucide-react";
import { usePockets } from "../../hooks/usePockets";
import { parseLocalDate } from "../../utils/date";

export default function PocketsView() {
  const navigate = useNavigate();
  const { addPocket } = usePockets();

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    color: "",
    targetAmount: "",
    scheduledAmount: "",
    frequency: "",
    startDate: "",
  });

  const [errors, setErrors] = useState({});
  const [savingMessage, setSavingMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    data: null,
  });

  const frequencyOptions = ["Semanal", "Quincenal", "Mensual"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error cuando el campo se modifica
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Calcular la próxima fecha de ahorro y el mensaje de programación
  useEffect(() => {
    if (formData.scheduledAmount && formData.frequency && formData.startDate) {
      const startDate = parseLocalDate(formData.startDate);
      let nextDate = new Date(startDate);
      let frequencyText = "";

      switch (formData.frequency.toLowerCase()) {
        case "semanal":
          nextDate.setDate(startDate.getDate() + 7);
          frequencyText = "cada semana";
          break;
        case "quincenal":
          nextDate.setDate(startDate.getDate() + 15);
          frequencyText = "cada 15 días";
          break;
        case "mensual":
          nextDate.setMonth(startDate.getMonth() + 1);
          frequencyText = "cada mes";
          break;
        default:
          return;
      }

      // Formatear la fecha para mostrarla
      const formattedNextDate = nextDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Crear mensaje de programación
      const amount = formData.scheduledAmount
        ? `$${parseInt(formData.scheduledAmount).toLocaleString("es-CO")}`
        : "una cantidad";

      setSavingMessage(
        `Tu ahorro será de ${amount} ${frequencyText}, con el próximo ahorro el ${formattedNextDate}.`
      );
    } else {
      setSavingMessage("");
    }
  }, [formData.frequency, formData.startDate, formData.scheduledAmount]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.icon) {
      newErrors.icon = "Selecciona un icono";
    }

    if (!formData.color) {
      newErrors.color = "Selecciona un color";
    }

    // Validar campos de programación solo si hay monto programado
    if (formData.scheduledAmount) {
      if (!formData.frequency) {
        newErrors.frequency = "Selecciona una frecuencia";
      }

      if (!formData.startDate) {
        newErrors.startDate = "Selecciona una fecha de inicio";
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar los datos para guardar
    const pocketData = {
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      targetAmount: formData.targetAmount
        ? parseFloat(formData.targetAmount)
        : null,
      scheduledAmount: formData.scheduledAmount
        ? parseFloat(formData.scheduledAmount)
        : null,
      frequency: formData.frequency,
      startDate: formData.startDate,
    };

    // Mostrar modal de confirmación
    setConfirmModal({
      open: true,
      title: "¿Guardar bolsillo?",
      message: "¿Estás seguro de guardar este bolsillo?",
      data: pocketData,
    });
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);

    try {
      // Guardar el bolsillo usando el hook
      addPocket(confirmModal.data);

      // Reiniciar el formulario después de guardar
      setFormData({
        name: "",
        icon: "",
        color: "",
        targetAmount: "",
        scheduledAmount: "",
        frequency: "",
        startDate: "",
      });

      // Mostrar mensaje de éxito y redirigir a la lista de bolsillos
      navigate("/select-pocket", {
        state: {
          message: "Bolsillo creado exitosamente",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Error al guardar el bolsillo:", error);
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ open: false, title: "", message: "", data: null });
    }
  };

  const handleCancelSubmit = () => {
    setConfirmModal({ open: false, title: "", message: "", data: null });
  };

  // Verificar si el formulario es válido para habilitar el botón
  const isFormValid =
    formData.name &&
    formData.icon &&
    formData.color &&
    (!formData.scheduledAmount ||
      (formData.scheduledAmount && formData.frequency && formData.startDate));

  return (
    <Layout>
      <div className="bg-surface rounded-2xl shadow-md border border-divider p-6">
        <div className="text-center sm:text-left">
          <PageHeading title="Registrar bolsillos" />
          <p className="text-text-secondary mt-2">
            Crea bolsillos de ahorro para tus metas financieras
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* Sección de información básica */}
          <div className="border-b border-divider pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <NameInput
                  label="Nombre del bolsillo *"
                  name="name"
                  placeholder="Ej: Vacaciones, Emergencias, etc."
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  autoFocus={true}
                />
              </div>

              <IconInput
                label="Icono *"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                error={errors.icon}
              />

              <ColorInput
                label="Color *"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                error={errors.color}
              />
            </div>
          </div>

          {/* Sección de metas de ahorro */}
          <div
            className={
              formData.scheduledAmount ? "border-b border-divider pb-6" : ""
            }
          >
            <h3 className="text-lg font-medium text-text mb-4">
              Metas de ahorro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AmountInput
                label="Meta de ahorro (opcional)"
                name="targetAmount"
                placeholder="Ej: 1.000.000"
                value={formData.targetAmount}
                onChange={handleInputChange}
                error={errors.targetAmount}
              />

              <AmountInput
                label="Ahorro programado (opcional)"
                name="scheduledAmount"
                placeholder="Ej: 50.000"
                value={formData.scheduledAmount}
                onChange={handleInputChange}
                error={errors.scheduledAmount}
              />
            </div>
          </div>

          {/* Sección de programación - solo visible si hay monto programado */}
          {formData.scheduledAmount && (
            <div>
              <h3 className="text-lg font-medium text-text mb-4">
                Programación de ahorro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectInput
                  label="Frecuencia"
                  name="frequency"
                  placeholder="Selecciona la frecuencia"
                  options={frequencyOptions}
                  value={formData.frequency}
                  onChange={handleInputChange}
                  error={errors.frequency}
                />

                <DateInput
                  label="Fecha de inicio"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  error={errors.startDate}
                />
              </div>

              {/* Mensaje de programación */}
              {savingMessage && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg text-blue-800 dark:text-blue-200">
                  <div className="flex items-center">
                    <PiggyBank className="mr-2 text-blue-500 dark:text-blue-300" size={20} />
                    <p>{savingMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            <SubmitButton
              label="Guardar bolsillo"
              Icon={Plus}
              color="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              text="text-white"
              disabled={!isFormValid}
              loading={isSubmitting}
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

import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente para mostrar un estado vacío cuando no hay elementos registrados
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.icon - Icono a mostrar (componente de Lucide)
 * @param {string} props.title - Título del mensaje
 * @param {string} props.message - Mensaje descriptivo
 * @param {string} props.buttonText - Texto del botón de acción
 * @param {string} props.buttonPath - Ruta a la que navegar al hacer clic en el botón
 * @param {string} props.buttonColor - Color del botón (clase de Tailwind)
 * @param {number} props.iconSize - Tamaño del icono
 * @param {string} props.iconColor - Color del icono (clase de Tailwind)
 */
export default function EmptyState({
  icon: Icon,
  title = "No hay elementos registrados",
  message = "No se encontraron elementos para mostrar",
  buttonText = "Crear nuevo",
  buttonPath = "/",
  buttonColor = "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
  iconSize = 48,
  iconColor = "text-text-muted"
}) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-10">
      <Icon size={iconSize} className={`mx-auto ${iconColor} mb-3`} />
      <h3 className="text-lg font-medium text-text-secondary mb-1">{title}</h3>
      <p className="text-text-tertiary">{message}</p>
      <button
        onClick={() => navigate(buttonPath)}
        className={`cursor-pointer mt-4 px-4 py-2 ${buttonColor} text-white rounded-md transition hover:opacity-90`}
      >
        {buttonText}
      </button>
    </div>
  );
}

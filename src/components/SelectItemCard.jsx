import React from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";

/**
 * Componente reutilizable para mostrar elementos seleccionables (categorías, bolsillos, etc.)
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - El elemento a mostrar (categoría, bolsillo, etc.)
 * @param {Function} props.onEdit - Función para editar el elemento
 * @param {Function} props.onDelete - Función para eliminar el elemento
 * @param {Function} props.renderContent - Función para renderizar contenido adicional del elemento
 * @param {string} props.defaultIconName - Nombre del icono predeterminado si no hay icono en el elemento
 * @param {string} props.defaultColor - Color predeterminado si no hay color en el elemento
 * @param {boolean} props.showRightContent - Si se debe mostrar contenido adicional a la derecha
 * @param {boolean} props.isAddButton - Si es un botón para añadir un nuevo elemento
 * @param {Function} props.onAdd - Función a ejecutar al hacer clic en el botón de añadir
 * @param {string} props.addText - Texto a mostrar en el botón de añadir
 * @param {string} props.addIconColor - Color del icono de añadir
 * @param {string} props.addIconBgColor - Color de fondo del icono de añadir
 */
export default function SelectItemCard({
  item,
  onEdit,
  onDelete,
  renderContent,
  defaultIconName = "Folder",
  defaultColor = "#36A2EB",
  showRightContent = false,
  isAddButton = false,
  onAdd,
  addText = "Añadir",
  addIconColor = "text-[var(--color-text)]",
  addIconBgColor = "bg-[var(--color-sidebar-border)]",
}) {
  // Si es un botón para añadir
  if (isAddButton) {
    return (
      <div
        onClick={onAdd}
        className="border border-dashed border-divider rounded-lg flex items-center justify-center p-4 hover:bg-surface-alt cursor-pointer transition"
      >
        <div className="flex flex-col items-center">
          <div className={`p-2 rounded-full mb-2 ${addIconBgColor}`}>
            <Plus size={18} className={addIconColor} />
          </div>
          <span className="text-sm font-medium text-text-secondary">{addText}</span>
        </div>
      </div>
    );
  }

  // Obtener el componente de icono dinámicamente
  const getIconComponent = (iconName) => {
    if (!iconName) return LucideIcons[defaultIconName];

    // Intentar obtener el icono de Lucide
    const IconComponent = LucideIcons[iconName];

    // Si el icono existe, devolverlo; de lo contrario, devolver un icono predeterminado
    return IconComponent || LucideIcons[defaultIconName];
  };

  const IconComponent = getIconComponent(item.icon);

  return (
    <div className="border border-divider rounded-lg shadow-sm hover:shadow-md transition p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div
            className="p-2 rounded-full mr-3"
            style={{
              backgroundColor: item.color || defaultColor,
              color: "white",
            }}
          >
            <IconComponent size={20} />
          </div>
          <div>
            <h3 className="font-medium text-text">{item.name}</h3>
            {item.titleInfo && item.titleInfo}
          </div>
        </div>
        <div className="flex items-center">
          {showRightContent && item.rightContent && (
            <div className="mr-4">{item.rightContent}</div>
          )}
          <div className="flex space-x-2">
            {/* Botón Editar */}
            <div className="relative group">
              <button
                onClick={() => onEdit(item.id)}
                className="cursor-pointer p-2 text-white hover:opacity-85 rounded-full transition shadow-sm"
                style={{ backgroundColor: item.color || defaultColor }}
                aria-label="Editar"
              >
                <Edit size={18} />
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                Editar
              </span>
            </div>

            {/* Botón Eliminar */}
            <div className="relative group">
              <button
                onClick={() => onDelete(item)}
                className="cursor-pointer p-2 bg-active text-text-secondary hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 rounded-full transition shadow-sm"
                aria-label="Eliminar"
              >
                <Trash2 size={18} />
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                Eliminar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar contenido adicional si existe */}
      {renderContent && renderContent(item)}
    </div>
  );
}

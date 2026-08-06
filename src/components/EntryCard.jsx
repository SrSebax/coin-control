import React from "react";
import { Edit, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

/**
 * Componente especializado para mostrar movimientos (transacciones)
 * con un diseño mejorado específicamente para la vista de selección de movimientos
 */
export default function EntryCard({
  item,
  onEdit,
  onDelete,
  renderContent,
  defaultIconName = "ArrowDownCircle",
  isExpense = true,
}) {
  // Obtener el componente de icono dinámicamente
  const getIconComponent = (iconName) => {
    if (!iconName) return LucideIcons[defaultIconName];

    // Intentar obtener el icono de Lucide
    const IconComponent = LucideIcons[iconName];

    // Si el icono existe, devolverlo; de lo contrario, devolver un icono predeterminado
    return IconComponent || LucideIcons[defaultIconName];
  };

  const IconComponent = getIconComponent(item.icon);

  // Clases de color según el tipo de transacción
  const accentColor = isExpense
    ? "var(--color-button-expense)"
    : "var(--color-button-income)";
  const bgGradient = isExpense
    ? "bg-gradient-to-r from-[var(--color-expense)] to-[var(--color-expense-hover)]"
    : "bg-gradient-to-r from-[var(--color-income)] to-[var(--color-income-hover)]";

  return (
    <div className="bg-surface rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      {/* Barra superior de color */}
      <div className={`h-2 ${bgGradient}`}></div>

      <div className="p-5">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          {/* Lado izquierdo: Icono y título */}
          <div className="flex items-center space-x-4">
            <div
              className="p-3 rounded-full shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <IconComponent size={22} className="text-white" />
            </div>

            <div>
              <h3 className="font-semibold text-text text-lg">
                {item.name}
              </h3>
              {item.titleInfo && <div className="mt-0.5">{item.titleInfo}</div>}
            </div>
          </div>

          {/* Lado derecho: Monto y acciones */}
          <div className="flex items-center space-x-5 ml-auto">
            {item.rightContent && (
              <div className="text-xl font-bold" style={{ color: accentColor }}>
                {item.rightContent}
              </div>
            )}

            <div className="flex space-x-2">
              {/* Botón Editar */}
              <div className="relative group">
                <button
                  onClick={() => onEdit(item.id)}
                  className="cursor-pointer p-2 text-white rounded-full transition-all hover:opacity-85 hover:shadow-md"
                  style={{ backgroundColor: accentColor }}
                  aria-label="Editar"
                >
                  <Edit size={16} />
                </button>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  Editar
                </span>
              </div>

              {/* Botón Eliminar */}
              <div className="relative group">
                <button
                  onClick={() => onDelete(item)}
                  className="cursor-pointer p-2 bg-active text-text-secondary rounded-full transition-all hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  Eliminar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Renderizar contenido adicional si existe */}
        {renderContent && (
          <div
            className="mt-4 ml-14 p-3 bg-surface-alt rounded-lg border-l-2"
            style={{ borderColor: accentColor }}
          >
            {renderContent(item)}
          </div>
        )}
      </div>
    </div>
  );
}

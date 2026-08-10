import { Pencil, Plus, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function CategoryGridCard({
  item,
  onEdit,
  onDelete,
  defaultIconName = "Folder",
  defaultColor = "#94a3b8",
  isAddButton = false,
  onAdd,
  addText = "Añadir",
}) {
  if (isAddButton) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-divider p-4 hover:bg-hover transition-colors"
      >
        <span className="p-2 rounded-full bg-surface-alt text-text-tertiary">
          <Plus size={18} />
        </span>
        <span className="text-sm font-medium text-text-secondary">{addText}</span>
      </button>
    );
  }

  const IconComponent = (item.icon && LucideIcons[item.icon]) || LucideIcons[defaultIconName] || LucideIcons.Folder;
  const accent = item.color || defaultColor;

  return (
    <div className="group flex items-center gap-2 rounded-xl border border-divider p-3 hover:bg-hover transition-colors">
      <span className="p-2 rounded-full shrink-0" style={{ backgroundColor: `${accent}20` }}>
        <IconComponent size={18} style={{ color: accent }} />
      </span>
      <span className="flex-1 min-w-0 text-sm font-medium text-text truncate">{item.name}</span>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(item.id)}
          title="Editar"
          aria-label="Editar"
          className="cursor-pointer p-1.5 rounded-full text-text-tertiary hover:text-emerald-600 hover:bg-active transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          title="Eliminar"
          aria-label="Eliminar"
          className="cursor-pointer p-1.5 rounded-full text-text-tertiary hover:text-red-500 hover:bg-active transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

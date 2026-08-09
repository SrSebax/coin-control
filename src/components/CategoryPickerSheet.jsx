import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { X, Plus, Tag, Search } from "lucide-react";
import ModalPortal from "./ModalPortal";

export default function CategoryPickerSheet({ open, onClose, categories, selectedId, onSelect, type, draft, returnTo = "/new-entry" }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleSelect = (id) => {
    onSelect(id);
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    navigate("/new-category", { state: { type, returnTo, draft } });
  };

  return (
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full self-end rounded-t-3xl bg-surface border-t border-divider shadow-2xl p-5 pb-8 max-h-[75vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-4 shrink-0" />

        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base font-bold text-text">Selecciona una categoría</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text-tertiary hover:text-text hover:bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-4 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full rounded-xl border border-divider bg-surface-alt pl-10 pr-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
          />
        </div>

        <div className="overflow-y-auto grid grid-cols-4 gap-3">
          {filteredCategories.length === 0 && (
            <p className="col-span-4 text-sm text-text-tertiary text-center py-6">
              Sin resultados para "{search}"
            </p>
          )}
          {filteredCategories.map((category) => {
            const Icon = (category.icon && LucideIcons[category.icon]) || Tag;
            const isSelected = category.id === selectedId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.id)}
                className={`cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors ${
                  isSelected ? "border-[var(--color-primary)] bg-surface-alt" : "border-transparent hover:bg-hover"
                }`}
              >
                <span
                  className="p-2.5 rounded-full"
                  style={{ backgroundColor: `${category.color || "#94a3b8"}20`, color: category.color || "#94a3b8" }}
                >
                  <Icon size={20} />
                </span>
                <span className="text-xs font-medium text-text text-center leading-tight truncate w-full">
                  {category.name}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAddNew}
            className="cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-dashed border-divider hover:bg-hover transition-colors"
          >
            <span className="p-2.5 rounded-full bg-surface-alt text-[var(--color-primary)]">
              <Plus size={20} />
            </span>
            <span className="text-xs font-medium text-text-secondary text-center leading-tight">Nueva</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

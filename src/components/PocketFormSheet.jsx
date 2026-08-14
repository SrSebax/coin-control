import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { ChevronDown, Tag } from "lucide-react";
import ModalPortal from "./ModalPortal";
import IconColorPickerSheet from "./IconColorPickerSheet";
import AmountInput from "./inputs/AmountInput";

const DEFAULT_COLOR = "#10b981";
const DEFAULT_ICON = "Wallet";

// Sheet de alta/edición de un bolsillo: nombre, ícono+color (picker con tabs,
// responsive en IconColorPickerSheet) y meta de ahorro opcional. Misma UI en
// mobile y desktop — solo cambia el tamaño del diálogo.
export default function PocketFormSheet({ open, onClose, pocket, onSubmit }) {
  const isEditing = Boolean(pocket);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [targetAmount, setTargetAmount] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(pocket?.name || "");
    setIcon(pocket?.icon || DEFAULT_ICON);
    setColor(pocket?.color || DEFAULT_COLOR);
    setTargetAmount(pocket?.targetAmount ? String(pocket.targetAmount) : "");
    setPickerOpen(false);
  }, [open, pocket]);

  const isFormValid = Boolean(name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const PreviewIcon = LucideIcons[icon] || Tag;

  return (
    <>
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full self-end rounded-t-3xl pb-8 pt-3 md:self-auto md:max-w-md md:mx-auto md:rounded-2xl md:py-6 bg-surface border border-divider shadow-2xl px-6 animate-slide-up md:animate-fade-in"
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-5 md:hidden" />

        <h2 className="text-xl font-extrabold text-[var(--color-primary)] mb-4">
          {isEditing ? "Editar bolsillo" : "Nuevo bolsillo"}
        </h2>

        <div className="flex justify-center pb-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <PreviewIcon size={32} style={{ color }} />
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="Elegir ícono y color"
              className="cursor-pointer absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a1f1a] text-white flex items-center justify-center shadow-md hover:bg-[#0d2b22] transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-surface-alt rounded-2xl border border-divider p-4">
            <p className="text-sm text-text-tertiary mb-1">Nombre</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Vacaciones"
              maxLength={40}
              autoFocus
              className="w-full bg-transparent border-none outline-none text-base text-text placeholder-text-muted"
            />
          </div>

          <AmountInput
            label="Meta de ahorro (opcional)"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Ej: 1.000.000"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg text-text-secondary font-medium border border-divider hover:bg-hover transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </ModalPortal>

    <IconColorPickerSheet
      open={pickerOpen}
      onClose={() => setPickerOpen(false)}
      icon={icon}
      color={color}
      onApply={(nextIcon, nextColor) => {
        setIcon(nextIcon);
        setColor(nextColor);
      }}
    />
    </>
  );
}

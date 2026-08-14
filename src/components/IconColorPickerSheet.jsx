import { useEffect, useState } from "react";
import { Check, Tag } from "lucide-react";
import ModalPortal from "./ModalPortal";
import { CATEGORY_ICONS as ICONS, CATEGORY_COLORS as COLORS } from "../utils/categoryOptions";

export default function IconColorPickerSheet({ open, onClose, icon, color, onApply }) {
  const [tab, setTab] = useState("icon");
  const [draftIcon, setDraftIcon] = useState(icon);
  const [draftColor, setDraftColor] = useState(color);

  useEffect(() => {
    if (open) {
      setDraftIcon(icon);
      setDraftColor(color);
      setTab("icon");
    }
  }, [open, icon, color]);

  const handleApply = () => {
    onApply(draftIcon, draftColor);
    onClose();
  };

  const DraftIcon = ICONS.find((i) => i.englishName === draftIcon)?.component || Tag;

  return (
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full self-end rounded-t-3xl border-t md:self-auto md:max-w-sm md:mx-auto md:rounded-2xl md:border bg-surface border-divider shadow-2xl pt-5 px-5 pb-8 max-h-[75vh] flex flex-col animate-slide-up md:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-4 shrink-0" />

        <div className="flex justify-center mb-4 shrink-0">
          <span
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${draftColor}20` }}
          >
            <DraftIcon size={28} style={{ color: draftColor }} />
          </span>
        </div>

        <div className="flex items-center gap-6 border-b border-divider mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setTab("icon")}
            className={`cursor-pointer pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "icon"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-tertiary"
            }`}
          >
            Ícono
          </button>
          <button
            type="button"
            onClick={() => setTab("color")}
            className={`cursor-pointer pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "color"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-tertiary"
            }`}
          >
            Color
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-1">
          {tab === "icon" ? (
            <div className="grid grid-cols-5 gap-3 pb-2">
              {ICONS.map((item) => {
                const IconComp = item.component;
                const isSelected = item.englishName === draftIcon;
                return (
                  <button
                    key={item.englishName}
                    type="button"
                    onClick={() => setDraftIcon(item.englishName)}
                    className={`cursor-pointer aspect-square rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected ? "bg-surface-alt ring-2 ring-[var(--color-primary)]" : "hover:bg-hover"
                    }`}
                  >
                    <IconComp size={20} style={{ color: isSelected ? draftColor : undefined }} className={isSelected ? "" : "text-text-secondary"} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3 pb-2">
              {COLORS.map((hex) => {
                const isSelected = hex === draftColor;
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setDraftColor(hex)}
                    aria-label={hex}
                    className="cursor-pointer aspect-square rounded-full flex items-center justify-center"
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 shrink-0">
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer text-sm font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-1"
          >
            Aplicar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

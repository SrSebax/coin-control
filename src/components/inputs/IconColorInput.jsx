import { Check, Palette, Shapes } from "lucide-react";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "../../utils/categoryOptions";

export default function IconColorInput({ icon, color, onChange, error = false }) {
  const handleIconSelect = (englishName) => onChange({ target: { name: "icon", value: englishName } });
  const handleColorSelect = (hex) => onChange({ target: { name: "color", value: hex } });

  return (
    <div className="w-full grid grid-cols-2 gap-6">
      <div className="rounded-2xl bg-surface-alt border border-divider p-4">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary mb-3 tracking-wide">
          <Palette size={14} />
          Color
        </label>
        <div className="flex flex-wrap gap-2.5 p-1.5">
          {CATEGORY_COLORS.map((hex) => {
            const isSelected = hex === color;
            return (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => handleColorSelect(hex)}
                className={`cursor-pointer relative w-8 h-8 rounded-full shrink-0 transition-transform hover:scale-110 ${
                  isSelected ? "ring-2 ring-offset-2 ring-offset-surface-alt ring-[var(--color-primary)] scale-110" : ""
                }`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-alt border border-divider p-4">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary mb-3 tracking-wide">
          <Shapes size={14} />
          Ícono
        </label>
        <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1.5">
          {CATEGORY_ICONS.map((item) => {
            const isSelected = item.englishName === icon;
            return (
              <button
                key={item.englishName}
                type="button"
                title={item.englishName}
                onClick={() => handleIconSelect(item.englishName)}
                className={`cursor-pointer flex items-center justify-center aspect-square rounded-xl transition-all hover:scale-110 ${
                  isSelected ? "bg-[var(--color-primary)] text-white shadow-sm" : "bg-surface text-text-secondary hover:bg-hover"
                }`}
              >
                <item.component size={17} />
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="col-span-2 text-xs text-red-500">Selecciona un ícono y un color</p>}
    </div>
  );
}

import { Tag } from "lucide-react";
import { CATEGORY_ICONS } from "../utils/categoryOptions";

export default function CategoryPreview({ icon, color }) {
  const SelectedIcon = CATEGORY_ICONS.find((i) => i.englishName === icon)?.component || Tag;

  return (
    <span
      className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors"
      style={{ backgroundColor: `${color || "#94a3b8"}20` }}
    >
      <SelectedIcon size={32} style={{ color: color || "#94a3b8" }} />
    </span>
  );
}

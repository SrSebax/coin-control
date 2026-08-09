import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

const BUTTON_SIZE = 44;
const GAP = 8;
const PADDING = 12;
const REVEAL = PADDING + BUTTON_SIZE * 2 + GAP;

// Sólo una fila abierta a la vez en toda la app: al arrancar a arrastrar una,
// se cierra la que haya quedado abierta antes (vive a nivel de módulo, no
// hay que coordinar ids entre listas distintas).
let activeClose = null;

export default function SwipeableRow({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Borrar",
  className = "",
  children,
}) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleDragStart = () => {
    if (activeClose && activeClose !== close) activeClose();
    activeClose = close;
  };

  const handleDragEnd = (_, info) => {
    setOpen(info.offset.x < -REVEAL / 2 || info.velocity.x < -600);
  };

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <div
        className="absolute inset-y-0 right-0 flex items-center gap-2"
        style={{ paddingRight: PADDING }}
      >
        <button
          type="button"
          onClick={() => {
            close();
            onEdit?.();
          }}
          aria-label={editLabel}
          style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
          className="cursor-pointer shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <Pencil size={17} />
        </button>
        <button
          type="button"
          onClick={() => {
            close();
            onDelete?.();
          }}
          aria-label={deleteLabel}
          style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
          className="cursor-pointer shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <Motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        animate={{ x: open ? -REVEAL : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClickCapture={(e) => {
          if (open) {
            e.stopPropagation();
            e.preventDefault();
            close();
          }
        }}
        className="relative bg-surface touch-pan-y"
      >
        {children}
      </Motion.div>
    </div>
  );
}

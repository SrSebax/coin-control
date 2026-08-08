import { useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import ModalPortal from "./ModalPortal";

export default function AddMovementSheet({ open, onClose }) {
  const navigate = useNavigate();

  const choose = (type) => {
    onClose();
    navigate("/new-entry", { state: { type } });
  };

  return (
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full self-end rounded-t-3xl bg-surface border-t border-divider shadow-2xl p-5 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-4" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-text">¿Qué quieres registrar?</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer p-1.5 -m-1.5 rounded-full text-text-tertiary hover:text-text hover:bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => choose("expense")}
            className="cursor-pointer flex flex-col items-center gap-2 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-divider hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
          >
            <span className="p-3 rounded-full bg-rose-500 text-white">
              <ArrowDownCircle size={22} />
            </span>
            <span className="text-sm font-semibold text-text">Gasto</span>
          </button>

          <button
            onClick={() => choose("income")}
            className="cursor-pointer flex flex-col items-center gap-2 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-divider hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <span className="p-3 rounded-full bg-emerald-500 text-white">
              <ArrowUpCircle size={22} />
            </span>
            <span className="text-sm font-semibold text-text">Ingreso</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

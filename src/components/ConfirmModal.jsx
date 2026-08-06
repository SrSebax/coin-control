import React from "react";
import ModalPortal from "./ModalPortal";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  return (
    <ModalPortal isOpen={open}>
      <div className="w-full max-w-md mx-auto bg-surface border border-divider rounded-2xl shadow-2xl p-6 animate-fade-in">
        {/* Título */}
        <h2 className="text-xl font-extrabold text-[var(--color-primary)] mb-1">{title}</h2>

        {/* Mensaje */}
        <p className="text-sm text-text-secondary mb-4">{message}</p>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-text-secondary font-medium border border-divider hover:bg-hover transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
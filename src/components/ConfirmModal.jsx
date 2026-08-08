import React from "react";
import ModalPortal from "./ModalPortal";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  return (
    <ModalPortal isOpen={open}>
      <div
        className="w-full self-end rounded-t-3xl pb-8 pt-3 md:self-auto md:max-w-md md:mx-auto md:rounded-2xl md:py-6 bg-surface border border-divider shadow-2xl px-6 animate-slide-up md:animate-fade-in"
      >
        {/* Handle: solo mobile */}
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-5 md:hidden" />

        {/* Título */}
        <h2 className="text-xl font-extrabold text-[var(--color-primary)] mb-1">{title}</h2>

        {/* Mensaje */}
        <p className="text-sm text-text-secondary mb-6 md:mb-4">{message}</p>

        {/* Botones: en mobile, apilados con la acción principal arriba */}
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <button
            onClick={onCancel}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg text-text-secondary font-medium border border-divider hover:bg-hover transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer w-full md:w-auto px-4 py-3 md:py-2 rounded-xl md:rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
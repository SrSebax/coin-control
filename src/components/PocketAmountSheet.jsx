import { useEffect, useState } from "react";
import ModalPortal from "./ModalPortal";
import AmountInput from "./inputs/AmountInput";

const formatCurrency = (value) => `$${Math.round(Number(value || 0)).toLocaleString("es-CO")}`;

// Sheet para transferir dinero hacia/desde un bolsillo. No es un ingreso ni
// un gasto: solo mueve saldo entre "disponible libre" y el bolsillo, por eso
// el tope (`maxAmount`) es el disponible libre al depositar, o el saldo del
// propio bolsillo al retirar.
export default function PocketAmountSheet({ open, onClose, mode, pocket, maxAmount, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setAmount("");
  }, [open]);

  if (!open) return null;

  const isDeposit = mode === "deposit";
  const numericAmount = parseFloat(amount) || 0;
  const exceedsMax = numericAmount > maxAmount;
  const isFormValid = numericAmount > 0 && !exceedsMax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(numericAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal isOpen={open}>
      <div className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full self-end rounded-t-3xl pb-8 pt-3 md:self-auto md:max-w-sm md:mx-auto md:rounded-2xl md:py-6 bg-surface border border-divider shadow-2xl px-6 animate-slide-up md:animate-fade-in"
      >
        <div className="w-10 h-1.5 rounded-full bg-divider mx-auto mb-5 md:hidden" />

        <h2 className="text-xl font-extrabold text-[var(--color-primary)] mb-1">
          {isDeposit ? "Agregar dinero" : "Retirar dinero"}
        </h2>
        <p className="text-sm text-text-secondary mb-5">
          {isDeposit
            ? `A "${pocket?.name}". Disponible fuera de bolsillos: ${formatCurrency(maxAmount)}.`
            : `De "${pocket?.name}". Saldo del bolsillo: ${formatCurrency(maxAmount)}.`}
        </p>

        <AmountInput
          variant="wide"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          error={exceedsMax ? "No puedes superar el disponible" : undefined}
        />

        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end mt-6">
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
            {isSubmitting ? "Guardando..." : isDeposit ? "Agregar" : "Retirar"}
          </button>
        </div>
      </form>
    </ModalPortal>
  );
}

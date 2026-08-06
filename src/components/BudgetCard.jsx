import React, { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useBudget } from "../hooks/useBudget";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

export default function BudgetCard({ spent }) {
  const { amount, setBudgetAmount } = useBudget();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(amount ?? "");

  const startEdit = () => {
    setDraft(amount ?? "");
    setEditing(true);
  };

  const save = () => {
    const parsed = parseFloat(draft);
    setBudgetAmount(isNaN(parsed) || parsed <= 0 ? null : parsed);
    setEditing(false);
  };

  const hasBudget = amount !== null && amount !== undefined;
  const percent = hasBudget ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
  const remaining = hasBudget ? amount - spent : 0;
  const overBudget = hasBudget && spent > amount;

  return (
    <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text">Presupuesto mensual</h3>
        {hasBudget && !editing && (
          <button
            onClick={startEdit}
            className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Pencil size={12} /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Ej: 1500000"
            className="w-full rounded-lg border border-divider bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={save}
            className="cursor-pointer p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
            aria-label="Guardar"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => setEditing(false)}
            className="cursor-pointer p-2 rounded-lg bg-hover text-text-secondary hover:bg-active"
            aria-label="Cancelar"
          >
            <X size={16} />
          </button>
        </div>
      ) : hasBudget ? (
        <>
          <p className="text-sm text-text-secondary mb-2">
            Has gastado{" "}
            <span className="font-semibold text-text">{formatCurrency(spent)}</span> de{" "}
            {formatCurrency(amount)}
          </p>
          <div className="w-full h-2.5 rounded-full bg-hover overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overBudget ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p
            className={`text-xs mt-2 ${
              overBudget
                ? "text-red-600 dark:text-red-400 font-medium"
                : "text-text-tertiary"
            }`}
          >
            {overBudget
              ? `Te pasaste por ${formatCurrency(Math.abs(remaining))}`
              : `Te quedan ${formatCurrency(remaining)} para gastar`}
          </p>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-text-tertiary mb-3">
            Configura un presupuesto mensual para hacerle seguimiento a tus gastos.
          </p>
          <button
            onClick={startEdit}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
          >
            <Pencil size={14} /> Configurar presupuesto
          </button>
        </div>
      )}
    </div>
  );
}

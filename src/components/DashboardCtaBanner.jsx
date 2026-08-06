import { useNavigate } from "react-router-dom";
import { PiggyBank } from "lucide-react";

export default function DashboardCtaBanner() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-divider p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="p-3 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
          <PiggyBank size={26} />
        </span>
        <div>
          <p className="font-semibold text-text">Lleva el control de tus finanzas</p>
          <p className="text-sm text-text-secondary">
            Agrega tus ingresos y gastos diariamente para tener un mejor control de tu dinero.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/new-entry", { state: { type: "expense" } })}
        className="cursor-pointer shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d2b22] hover:bg-[#0a1f1a] text-white font-medium transition-colors"
      >
        Agregar movimiento
      </button>
    </div>
  );
}

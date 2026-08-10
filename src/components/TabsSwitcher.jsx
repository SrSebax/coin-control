import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function TabsSwitcher({ activeTab, setActiveTab }) {
  const isGastos = activeTab === "gastos";

  return (
    <div className="relative inline-flex p-1 bg-surface-alt rounded-xl border border-divider">
      <span
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-200 ease-out ${
          isGastos ? "left-1 bg-rose-500" : "left-[calc(50%+3px)] bg-emerald-500"
        }`}
      />

      <button
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("gastos");
        }}
        type="button"
        className={`relative z-10 cursor-pointer px-5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 ${
          isGastos ? "text-white" : "text-text-secondary hover:text-text"
        }`}
      >
        <ArrowDownCircle size={16} />
        Gastos
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("ingresos");
        }}
        type="button"
        className={`relative z-10 cursor-pointer px-5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 ${
          !isGastos ? "text-white" : "text-text-secondary hover:text-text"
        }`}
      >
        <ArrowUpCircle size={16} />
        Ingresos
      </button>
    </div>
  );
}

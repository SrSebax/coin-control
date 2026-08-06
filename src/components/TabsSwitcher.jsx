import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function TabsSwitcher({ activeTab, setActiveTab }) {
  const isGastos = activeTab === "gastos";
  const isIngresos = activeTab === "ingresos";

  return (
    <div className="relative inline-flex p-1.5 bg-surface/70 backdrop-blur-md rounded-2xl shadow-xl border border-divider/50 mb-8 overflow-hidden">
      {/* Fondo con efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-70"></div>
      
      {/* Indicador deslizante con sombra interna y gradiente */}
      <span
        className={`absolute top-1.5 bottom-1.5 w-1/2 rounded-xl transition-all duration-300 ease-out shadow-inner ${
          isGastos
            ? "left-1.5 bg-gradient-to-br from-red-50 to-red-200 dark:from-red-950/60 dark:to-red-900/40"
            : "left-[calc(50%-1.5px)] bg-gradient-to-br from-green-50 to-green-200 dark:from-green-950/60 dark:to-green-900/40"
        }`}
      >
        {/* Efecto de brillo en el indicador */}
        <span className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-surface/40 rounded-full blur-sm"></span>
      </span>

      {/* Botón Gastos */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("gastos");
        }}
        type="button"
        className={`group relative z-10 cursor-pointer px-6 py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all duration-300 ${
          isGastos
            ? "text-red-700 dark:text-red-300"
            : "text-text-tertiary hover:text-red-600 dark:hover:text-red-400"
        }`}
      >
        <ArrowDownCircle
          size={20}
          className={`transition-all duration-300 ${
            isGastos ? "scale-110 text-red-600" : "group-hover:scale-105 group-hover:text-red-500"
          }`}
          strokeWidth={isGastos ? 2.5 : 2}
        />
        <span className={`${isGastos ? "font-bold" : ""}`}>Gastos</span>
      </button>

      {/* Botón Ingresos */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("ingresos");
        }}
        type="button"
        className={`group relative z-10 cursor-pointer px-6 py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all duration-300 ${
          isIngresos
            ? "text-green-700 dark:text-green-300"
            : "text-text-tertiary hover:text-green-600 dark:hover:text-green-400"
        }`}
      >
        <ArrowUpCircle
          size={20}
          className={`transition-all duration-300 ${
            isIngresos ? "scale-110 text-green-600" : "group-hover:scale-105 group-hover:text-green-500"
          }`}
          strokeWidth={isIngresos ? 2.5 : 2}
        />
        <span className={`${isIngresos ? "font-bold" : ""}`}>Ingresos</span>
      </button>
    </div>
  );
}

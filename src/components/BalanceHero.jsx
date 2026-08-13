import { useNavigate } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  EyeOff,
  EyeClosed,
} from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useMoneyVisibility } from "../hooks/useHiddenBalances";
import { parseLocalDate } from "../utils/date";
import walletImage from "../assets/wallet_transparent.png";

const VISIBILITY_ICON = [Eye, EyeOff, EyeClosed];
const VISIBILITY_LABEL = [
  "Ocultar saldo",
  "Ocultar todo el dinero de Inicio",
  "Mostrar valores",
];

const formatCurrency = (value) => {
  const n = Number(value || 0);
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;
};

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function BalanceHero() {
  const navigate = useNavigate();
  const { transactions, summary } = useTransactions();
  const { level, cycle, cardHidden } = useMoneyVisibility();
  const hideBalance = cardHidden;
  const VisibilityIcon = VISIBILITY_ICON[level];

  const saldo = summary.ingresos - summary.gastos;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNet = transactions
    .filter(
      (t) => parseLocalDate(t.date).toDateString() === today.toDateString(),
    )
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
  const saldoAyer = saldo - todayNet;
  const deltaPercent = percentChange(saldo, saldoAyer);

  const quickAdd = (type) => navigate("/new-entry", { state: { type } });

  return (
    <div
      className="
    relative
    overflow-hidden
    rounded-2xl
    bg-gradient-to-br from-[#071c17] via-[#09251e] to-[#0d3025]
    text-white
    p-5 sm:p-6
    shadow-lg
    flex flex-col justify-between
    min-h-[280px]
  "
      data-tour="balance-card-desktop"
    >
      <img
        src={walletImage}
        alt=""
        aria-hidden="true"
        className="
    pointer-events-none
    select-none
    absolute
    z-0
    right-[-0%]
    top-1/2
    -translate-y-1/2
    w-[78%]
    max-w-[720px]
    opacity-10
    blur-[1px]
    r
  "
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <p className="text-white/70 text-sm font-medium">Saldo disponible</p>
          <button
            onClick={cycle}
            className="cursor-pointer text-white/50 hover:text-white transition-colors"
            aria-label={VISIBILITY_LABEL[level]}
          >
            <VisibilityIcon size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {hideBalance ? "••••••••" : formatCurrency(saldo)}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              deltaPercent >= 0
                ? "bg-emerald-400/20 text-emerald-300"
                : "bg-rose-400/20 text-rose-300"
            }`}
          >
            {deltaPercent >= 0 ? "↑" : "↓"} {Math.abs(deltaPercent).toFixed(1)}%
            vs ayer
          </span>
        </div>
      </div>

      <div className="relative z-10 flex gap-2 mt-5" data-tour="add-desktop">
        <button
          onClick={() => quickAdd("income")}
          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors"
        >
          <ArrowUpCircle size={16} /> Agregar ingreso
        </button>
        <button
          onClick={() => quickAdd("expense")}
          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-colors"
        >
          <ArrowDownCircle size={16} /> Agregar gasto
        </button>
      </div>
    </div>
  );
}

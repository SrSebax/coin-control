import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Layout from "../components/Layout";
import MobileHomeCards from "../components/MobileHomeCards";
import BalanceHero from "../components/BalanceHero";
import StatCard from "../components/StatCard";
import BudgetCard from "../components/BudgetCard";
import RecentMovementsCard from "../components/RecentMovementsCard";
import CategoryBreakdownCard from "../components/CategoryBreakdownCard";
import DashboardCtaBanner from "../components/DashboardCtaBanner";
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ToastMessage from "../components/ToastMessage";

export default function HomeView() {
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const { displayName } = useCurrentUser();
  const { monthIncome, monthExpense, incomeDelta, expenseDelta } = useMonthlyStats();

  const firstName = displayName ? displayName.split(" ")[0] : "";
  const initial = firstName ? firstName[0].toUpperCase() : "👋";

  useEffect(() => {
    if (location.state?.message) {
      setToast({ message: location.state.message, type: location.state.type || "success" });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Layout>
      {toast && (
        <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="space-y-5">
        {/* Saludo: mismo diseño en mobile y desktop, ya no vive en el navbar */}
        <div className="flex items-center gap-3 px-1">
          <span className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
            {initial}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-extrabold text-text tracking-tight truncate">
              ¡Hola! {" "}
              {firstName && (
                <span className="text-emerald-600 dark:text-emerald-400">{firstName}</span>
              )}
            </h1>
            <p className="text-sm text-text-tertiary mt-0.5 truncate">Este es el resumen de tus finanzas</p>
          </div>
        </div>

        <MobileHomeCards />

        <div className="md:hidden space-y-5">
          <CategoryBreakdownCard />
          <BudgetCard spent={monthExpense} />
        </div>

        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-5">
          <BalanceHero />

          <StatCard
            title="Ingresos del mes"
            icon={<ArrowUpCircle size={18} className="text-white" />}
            value={monthIncome}
            deltaPercent={incomeDelta}
            tone="emerald"
          />

          <StatCard
            title="Gastos del mes"
            icon={<ArrowDownCircle size={18} className="text-white" />}
            value={monthExpense}
            deltaPercent={expenseDelta}
            tone="rose"
          />
        </div>

        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
          <RecentMovementsCard />

          <div className="space-y-5">
            <CategoryBreakdownCard />
            <BudgetCard spent={monthExpense} />
          </div>
        </div>

        <DashboardCtaBanner />
      </div>
    </Layout>
  );
}

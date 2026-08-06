import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Layout from "../components/Layout";
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

  const greeting = displayName ? (
    <>
      Bienvenido de vuelta,{" "}
      <span className="text-emerald-600 dark:text-emerald-400">{displayName}</span> 👋
    </>
  ) : (
    "Bienvenido de vuelta 👋"
  );

  useEffect(() => {
    if (location.state?.message) {
      setToast({ message: location.state.message, type: location.state.type || "success" });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Layout title={greeting} subtitle="Este es el resumen de tus finanzas">
      {toast && (
        <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="space-y-5">
        {/* En mobile el header no muestra el saludo (no le cabe bien); va aquí */}
        <div className="md:hidden">
          <h1 className="text-lg font-bold text-text">{greeting}</h1>
          <p className="text-xs text-text-tertiary">Este es el resumen de tus finanzas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
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

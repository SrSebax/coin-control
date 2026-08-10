import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Tag, Activity, ListChecks, Flame } from "lucide-react";
import Layout from "../components/Layout";
import MobileHomeCards from "../components/MobileHomeCards";
import BalanceHero from "../components/BalanceHero";
import StatCard from "../components/StatCard";
import MiniStatCard from "../components/MiniStatCard";
import BudgetCard from "../components/BudgetCard";
import RecentMovementsCard from "../components/RecentMovementsCard";
import CategoryBreakdownCard from "../components/CategoryBreakdownCard";
import RecurringPreviewCard from "../components/RecurringPreviewCard";
import DashboardCtaBanner from "../components/DashboardCtaBanner";
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import ToastMessage from "../components/ToastMessage";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

export default function HomeView() {
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const { user, displayName } = useCurrentUser();
  const { monthIncome, monthExpense, incomeDelta, expenseDelta } = useMonthlyStats();
  const { getTransactionsByPeriod } = useTransactions();
  const { getCategoriesByType } = useCategories();

  const firstName = displayName ? displayName.split(" ")[0] : "";
  const initial = firstName ? firstName[0].toUpperCase() : "👋";

  const { topCategory, dailyAvgExpense, transactionCount, biggestExpense } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthAll = getTransactionsByPeriod(start, end);
    const monthExpenses = monthAll.filter((t) => t.type === "expense");
    const expenseCategories = getCategoriesByType("expense");

    const totalsByCategory = {};
    monthExpenses.forEach((t) => {
      totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + t.amount;
    });
    const topEntry = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1])[0];
    const top = topEntry
      ? { category: expenseCategories.find((c) => c.id === topEntry[0]) || null, amount: topEntry[1] }
      : null;

    const biggest = monthExpenses.reduce(
      (max, t) => (!max || t.amount > max.amount ? t : max),
      null
    );
    const biggestCategory = biggest
      ? expenseCategories.find((c) => c.id === biggest.category) || null
      : null;

    const daysElapsed = Math.max(1, now.getDate());

    return {
      topCategory: top,
      dailyAvgExpense: monthExpense / daysElapsed,
      transactionCount: monthAll.length,
      biggestExpense: biggest ? { amount: biggest.amount, label: biggest.name || biggestCategory?.name || "Gasto" } : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthExpense]);

  useEffect(() => {
    if (location.state?.message) {
      setToast({ message: location.state.message, type: location.state.type || "success" });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Layout title={`¡Hola${firstName ? `, ${firstName}` : ""}!`} subtitle="Este es el resumen de tus finanzas">
      <ToastMessage
        open={!!toast}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="space-y-5">
        {/* Saludo: en desktop el título ya vive en el header (Navbar), acá solo queda para mobile */}
        <div className="md:hidden flex items-center gap-3 px-1">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="shrink-0 w-11 h-11 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
              {initial}
            </span>
          )}
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

        {/* Bento desktop: saldo destacado + ingresos/gastos apilados */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
          <BalanceHero />

          <div className="flex flex-col gap-5">
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
        </div>

        {/* Mini stats */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          <MiniStatCard
            icon={<Tag size={18} className="text-white" />}
            iconBg="bg-violet-500"
            label="Categoría top del mes"
            value={topCategory?.category?.name || "Sin datos"}
            caption={topCategory ? formatCurrency(topCategory.amount) : undefined}
          />
          <MiniStatCard
            icon={<Activity size={18} className="text-white" />}
            iconBg="bg-amber-500"
            label="Promedio diario de gasto"
            value={formatCurrency(dailyAvgExpense)}
            caption="En lo que va del mes"
          />
          <MiniStatCard
            icon={<ListChecks size={18} className="text-white" />}
            iconBg="bg-sky-500"
            label="Movimientos del mes"
            value={transactionCount}
            caption="Ingresos y gastos"
          />
          <MiniStatCard
            icon={<Flame size={18} className="text-white" />}
            iconBg="bg-orange-500"
            label="Mayor gasto del mes"
            value={biggestExpense ? formatCurrency(biggestExpense.amount) : "Sin datos"}
            caption={biggestExpense?.label}
          />
        </div>

        {/* Categorías + movimientos recientes (misma altura en la fila) */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-5">
          <CategoryBreakdownCard />
          <RecentMovementsCard />
        </div>

        <div className="hidden md:block">
          <RecurringPreviewCard />
        </div>

        <DashboardCtaBanner />
      </div>
    </Layout>
  );
}

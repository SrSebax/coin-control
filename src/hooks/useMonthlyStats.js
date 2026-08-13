import { useMemo } from "react";
import { useTransactions } from "./useTransactions";

function sumByType(transactions, type) {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function useMonthlyStats(referenceDate = new Date()) {
  const { transactions, getTransactionsByPeriod } = useTransactions();
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  return useMemo(() => {
    const currentStart = new Date(year, month, 1);
    const currentEnd = new Date(year, month + 1, 0);
    const prevStart = new Date(year, month - 1, 1);
    const prevEnd = new Date(year, month, 0);

    const current = getTransactionsByPeriod(currentStart, currentEnd);
    const previous = getTransactionsByPeriod(prevStart, prevEnd);

    const monthIncome = sumByType(current, "income");
    const monthExpense = sumByType(current, "expense");
    const prevIncome = sumByType(previous, "income");
    const prevExpense = sumByType(previous, "expense");

    return {
      monthIncome,
      monthExpense,
      incomeDelta: percentChange(monthIncome, prevIncome),
      expenseDelta: percentChange(monthExpense, prevExpense),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, year, month]);
}

import { useLocalStorage } from "./useLocalStorage";

export function useBudget() {
  const [budget, setBudget] = useLocalStorage("coinControl_budget", { amount: null });

  const setBudgetAmount = (amount) => {
    setBudget({ amount });
  };

  return { amount: budget.amount, setBudgetAmount };
}

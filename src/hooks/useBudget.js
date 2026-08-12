import { useEffect, useSyncExternalStore } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";
import { budgetPeriodRange } from "../utils/recurrence";

const DEFAULT_BUDGET = {
  amount: null,
  period: "monthly",
  biweeklyAnchorDay: 15,
  biweeklyAmounts: { first: null, second: null },
};

// Mismo store compartido a nivel de módulo que useTransactions/useCategories.
let cachedBudget = DEFAULT_BUDGET;
let cachedLoading = true;
let unsubscribeFn = null;
let subscribedUid = undefined;
let currentUid = null;
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getBudgetSnapshot() {
  return cachedBudget;
}

function getLoadingSnapshot() {
  return cachedLoading;
}

function ensureSubscription(uid) {
  currentUid = uid;
  if (subscribedUid === uid) return;
  subscribedUid = uid;

  if (unsubscribeFn) {
    unsubscribeFn();
    unsubscribeFn = null;
  }

  if (!uid) {
    cachedBudget = DEFAULT_BUDGET;
    cachedLoading = false;
    emitChange();
    return;
  }

  cachedLoading = true;
  emitChange();

  const ref = doc(db, "users", uid, "meta", "budget");
  unsubscribeFn = onSnapshot(ref, (snapshot) => {
    const data = snapshot.exists() ? snapshot.data() : {};
    cachedBudget = {
      amount: data.amount ?? null,
      period: data.period || "monthly",
      biweeklyAnchorDay: data.biweeklyAnchorDay || 15,
      biweeklyAmounts: {
        first: data.biweeklyAmounts?.first ?? null,
        second: data.biweeklyAmounts?.second ?? null,
      },
    };
    cachedLoading = false;
    emitChange();
  });
}

// Monto de presupuesto vigente ahora mismo, según el período configurado. En
// "biweekly" depende de en qué mitad del mes cae `referenceDate` (definida
// por `biweeklyAnchorDay`, el día de corte entre la primera y la segunda
// quincena) — cada mitad tiene su propio monto porque suelen financiarse con
// ingresos distintos (p. ej. el pago del 30 cubre el 1-15, el del 15 cubre el
// 16-30).
export function resolveActiveBudgetAmount(budget, referenceDate = new Date()) {
  if (!budget) return null;
  if (budget.period === "biweekly") {
    const { half } = budgetPeriodRange("biweekly", referenceDate, budget.biweeklyAnchorDay);
    const amounts = budget.biweeklyAmounts || {};
    return half === "first" ? amounts.first ?? null : amounts.second ?? null;
  }
  return budget.amount ?? null;
}

export function useBudget() {
  const { user, authLoading } = useCurrentUser();

  useEffect(() => {
    if (authLoading) return;
    ensureSubscription(user?.uid || null);
  }, [user, authLoading]);

  const budget = useSyncExternalStore(subscribe, getBudgetSnapshot);
  const storeLoading = useSyncExternalStore(subscribe, getLoadingSnapshot);
  const loading = authLoading || storeLoading;

  // Escribe el doc completo (merge implícito vía spread del cache local) para
  // no perder el resto de campos al cambiar solo uno.
  const updateBudget = (patch) => {
    cachedBudget = { ...cachedBudget, ...patch };
    emitChange();
    if (currentUid) setDoc(doc(db, "users", currentUid, "meta", "budget"), cachedBudget);
  };

  return {
    amount: budget.amount,
    period: budget.period,
    biweeklyAnchorDay: budget.biweeklyAnchorDay,
    biweeklyAmounts: budget.biweeklyAmounts,
    loading,
    updateBudget,
  };
}

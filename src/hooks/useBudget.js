import { useEffect, useSyncExternalStore } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";

// Mismo store compartido a nivel de módulo que useTransactions/useCategories.
let cachedAmount = null;
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

function getAmountSnapshot() {
  return cachedAmount;
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
    cachedAmount = null;
    cachedLoading = false;
    emitChange();
    return;
  }

  cachedLoading = true;
  emitChange();

  const ref = doc(db, "users", uid, "meta", "budget");
  unsubscribeFn = onSnapshot(ref, (snapshot) => {
    cachedAmount = snapshot.exists() ? snapshot.data().amount : null;
    cachedLoading = false;
    emitChange();
  });
}

export function useBudget() {
  const { user, authLoading } = useCurrentUser();

  useEffect(() => {
    if (authLoading) return;
    ensureSubscription(user?.uid || null);
  }, [user, authLoading]);

  const amount = useSyncExternalStore(subscribe, getAmountSnapshot);
  const storeLoading = useSyncExternalStore(subscribe, getLoadingSnapshot);
  const loading = authLoading || storeLoading;

  const setBudgetAmount = (newAmount) => {
    cachedAmount = newAmount;
    emitChange();
    if (currentUid) setDoc(doc(db, "users", currentUid, "meta", "budget"), { amount: newAmount });
  };

  return { amount, loading, setBudgetAmount };
}

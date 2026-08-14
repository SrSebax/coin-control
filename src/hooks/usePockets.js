import { useEffect, useSyncExternalStore } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";

// Store a nivel de módulo, mismo patrón que useTransactions/useCategories:
// un solo listener de Firestore compartido por toda la app.
let cachedPockets = [];
let cachedLoading = true;
let unsubscribeFn = null;
let subscribedUid = undefined;
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getPocketsSnapshot() {
  return cachedPockets;
}

function getLoadingSnapshot() {
  return cachedLoading;
}

function ensureSubscription(uid) {
  if (subscribedUid === uid) return;
  subscribedUid = uid;

  if (unsubscribeFn) {
    unsubscribeFn();
    unsubscribeFn = null;
  }

  if (!uid) {
    cachedPockets = [];
    cachedLoading = false;
    emitChange();
    return;
  }

  cachedLoading = true;
  emitChange();

  const ref = collection(db, "users", uid, "pockets");
  unsubscribeFn = onSnapshot(ref, (snapshot) => {
    cachedPockets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    cachedLoading = false;
    emitChange();
  });
}

// Bolsillos: apartados de dinero dentro del saldo existente (como los
// "bolsillos" de Bancolombia). No son ingresos ni gastos — mover plata a un
// bolsillo es una transferencia interna, así que `balance` de cada bolsillo
// se resta del saldo total para mostrar el "disponible fuera de bolsillos".
export function usePockets() {
  const { user, authLoading } = useCurrentUser();

  useEffect(() => {
    if (authLoading) return;
    ensureSubscription(user?.uid || null);
  }, [user, authLoading]);

  const pockets = useSyncExternalStore(subscribe, getPocketsSnapshot);
  const storeLoading = useSyncExternalStore(subscribe, getLoadingSnapshot);
  const loading = authLoading || storeLoading;

  const totalInPockets = pockets.reduce((sum, p) => sum + (p.balance || 0), 0);

  const addPocket = async ({ name, icon, color, targetAmount }) => {
    const payload = {
      name,
      icon,
      color,
      targetAmount: targetAmount || null,
      balance: 0,
      createdAt: serverTimestamp(),
    };
    const ref = collection(db, "users", user.uid, "pockets");
    await addDoc(ref, payload);
  };

  const updatePocket = async (pocketId, { name, icon, color, targetAmount }) => {
    await updateDoc(doc(db, "users", user.uid, "pockets", pocketId), {
      name,
      icon,
      color,
      targetAmount: targetAmount || null,
    });
  };

  const deletePocket = async (pocketId) => {
    await deleteDoc(doc(db, "users", user.uid, "pockets", pocketId));
  };

  const deposit = async (pocketId, amount) => {
    await updateDoc(doc(db, "users", user.uid, "pockets", pocketId), {
      balance: increment(amount),
    });
  };

  const withdraw = async (pocketId, amount) => {
    await updateDoc(doc(db, "users", user.uid, "pockets", pocketId), {
      balance: increment(-amount),
    });
  };

  return { pockets, loading, totalInPockets, addPocket, updatePocket, deletePocket, deposit, withdraw };
}

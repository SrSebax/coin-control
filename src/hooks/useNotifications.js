import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useTransactions } from "./useTransactions";
import { useCategories } from "./useCategories";
import { getRecurringPaymentsDueOn } from "../utils/recurrence";

const ENABLED_KEY = "coinControl_notificationsEnabled";
const READ_KEY = "coinControl_notificationReadIds";
const DISMISSED_KEY = "coinControl_notificationDismissedIds";
const NOTIFIED_KEY = "coinControl_notificationNotifiedIds";

const listeners = new Set();
function emitChange() {
  listeners.forEach((listener) => listener());
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readBool(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "1";
}
function readSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
function writeSet(key, set) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

// Estado compartido a nivel de módulo, mismo patrón que useTheme/useHiddenBalances:
// persiste en localStorage, no depende de Firestore (es preferencia local del
// dispositivo, no dato financiero que deba sincronizarse entre dispositivos).
//
// `useSyncExternalStore` compara el snapshot con Object.is: si getSnapshot()
// devolviera un objeto literal nuevo en cada llamada, React lo vería como
// "cambió" en cada render y entraría en loop infinito. Por eso el snapshot
// se cachea en `snapshot` y solo se reemplaza (referencia nueva) cuando algo
// realmente cambia.
let enabledState = readBool(ENABLED_KEY, true);
let readIds = readSet(READ_KEY);
let dismissedIds = readSet(DISMISSED_KEY);
let notifiedIds = readSet(NOTIFIED_KEY);
let snapshot = { enabled: enabledState, readIds, dismissedIds, notifiedIds };

function persistEnabled(next) {
  enabledState = next;
  localStorage.setItem(ENABLED_KEY, next ? "1" : "0");
  snapshot = { ...snapshot, enabled: enabledState };
  emitChange();
}
function markReadIds(ids) {
  readIds = new Set([...readIds, ...ids]);
  writeSet(READ_KEY, readIds);
  snapshot = { ...snapshot, readIds };
  emitChange();
}
function dismissId(id) {
  dismissedIds = new Set(dismissedIds).add(id);
  writeSet(DISMISSED_KEY, dismissedIds);
  snapshot = { ...snapshot, dismissedIds };
  emitChange();
}
function markNotifiedIds(ids) {
  notifiedIds = new Set([...notifiedIds, ...ids]);
  writeSet(NOTIFIED_KEY, notifiedIds);
  snapshot = { ...snapshot, notifiedIds };
}

function getSnapshot() {
  return snapshot;
}

const formatCurrency = (value) => `$${Math.round(Number(value || 0)).toLocaleString("es-CO")}`;

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const hasNotificationApi = typeof window !== "undefined" && "Notification" in window;

// Recordatorios de pagos recurrentes que vencen hoy o mañana + disparo de
// notificaciones nativas del sistema mientras la app está abierta (sin
// backend no hay push con la app cerrada). El estado leído/descartado y qué
// recordatorios ya se notificaron vive en localStorage, así no se repiten en
// cada recarga.
export function useNotifications() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const { transactions } = useTransactions();
  const { getCategoriesByType } = useCategories();
  const expenseCategories = getCategoriesByType("expense");

  const reminders = useMemo(() => {
    const todayStr = isoDate(0);
    const tomorrowStr = isoDate(1);

    const dueToday = getRecurringPaymentsDueOn(transactions, todayStr).map((t) => ({ t, when: "hoy", date: todayStr }));
    const dueTomorrow = getRecurringPaymentsDueOn(transactions, tomorrowStr).map((t) => ({
      t,
      when: "mañana",
      date: tomorrowStr,
    }));

    return [...dueToday, ...dueTomorrow].map(({ t, when, date }) => {
      const category = expenseCategories.find((c) => c.id === t.category) || null;
      const label = t.name || category?.name || null;
      return {
        id: `${t.id}:${date}`,
        title: "Recordatorio de pago",
        message: `${when === "hoy" ? "Hoy" : "Mañana"} tienes un pago recurrente de ${formatCurrency(t.amount)}${
          label ? ` (${label})` : ""
        }.`,
        time: when === "hoy" ? "Vence hoy" : "Vence mañana",
        type: "warning",
        amount: t.amount,
      };
    });
  }, [transactions, expenseCategories]);

  const notifications = reminders
    .filter((r) => !state.dismissedIds.has(r.id))
    .map((r) => ({ ...r, read: state.readIds.has(r.id) }));
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!state.enabled || !hasNotificationApi || Notification.permission !== "granted") return;

    const pending = reminders.filter((r) => !state.notifiedIds.has(r.id));
    if (pending.length === 0) return;

    pending.forEach((r) => {
      new Notification(r.title, { body: r.message, icon: "/pwa/icon-192.png", tag: r.id });
    });
    markNotifiedIds(pending.map((r) => r.id));
  }, [reminders, state.enabled, state.notifiedIds]);

  const requestPermission = useCallback(async () => {
    if (!hasNotificationApi) return "unsupported";
    const result = await Notification.requestPermission();
    emitChange();
    return result;
  }, []);

  const setEnabled = useCallback(async (next) => {
    if (next && hasNotificationApi && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    persistEnabled(next);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead: (id) => markReadIds([id]),
    markAllAsRead: () => markReadIds(notifications.map((n) => n.id)),
    removeNotification: dismissId,
    enabled: state.enabled,
    setEnabled,
    permission: hasNotificationApi ? Notification.permission : "unsupported",
    requestPermission,
  };
}

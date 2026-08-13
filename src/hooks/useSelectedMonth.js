import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "coinControl_selectedMonth";
const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const listeners = new Set();

function todayYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function toIndex({ year, month }) {
  return year * 12 + month;
}

function fromIndex(index) {
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

// No se permite navegar a meses futuros: sin movimientos reales que mostrar ahí.
function clampToToday(value) {
  const todayIndex = toIndex(todayYearMonth());
  return toIndex(value) > todayIndex ? fromIndex(todayIndex) : value;
}

function readStored() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const [y, m] = raw.split("-").map(Number);
    if (Number.isInteger(y) && Number.isInteger(m)) return clampToToday({ year: y, month: m });
  }
  return todayYearMonth();
}

// Estado compartido: cualquier componente que lo use ve el mismo mes elegido
// y se mantiene al navegar entre vistas (vive en el módulo, no en un
// componente), porque persiste en localStorage — mismo patrón que
// useTheme/useHiddenBalances.
let current = readStored();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return current;
}

function persist(next) {
  current = next;
  localStorage.setItem(STORAGE_KEY, `${next.year}-${next.month}`);
  emitChange();
}

export function useSelectedMonth() {
  const value = useSyncExternalStore(subscribe, getSnapshot);
  const today = todayYearMonth();
  const isCurrentMonth = value.year === today.year && value.month === today.month;

  const goToPrevMonth = useCallback(() => persist(fromIndex(toIndex(current) - 1)), []);
  const goToNextMonth = useCallback(() => persist(clampToToday(fromIndex(toIndex(current) + 1))), []);
  const goToCurrentMonth = useCallback(() => persist(todayYearMonth()), []);
  const goToMonth = useCallback((year, month) => persist(clampToToday({ year, month })), []);

  const date = new Date(value.year, value.month, 1);
  const monthName = MONTH_NAMES[value.month];
  const label = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${value.year}`;
  const shortLabel = `${monthName.slice(0, 3).charAt(0).toUpperCase()}${monthName.slice(1, 3)} ${value.year}`;

  return {
    year: value.year,
    month: value.month,
    date,
    isCurrentMonth,
    canGoNext: !isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    goToMonth,
    label,
    shortLabel,
  };
}

// Últimos `count` meses (el elegido incluido, más recientes primero) — para
// listarlos en el desplegable del selector de mes.
export function recentMonths(count = 12) {
  const todayIndex = toIndex(todayYearMonth());
  return Array.from({ length: count }, (_, i) => fromIndex(todayIndex - i));
}

export { MONTH_NAMES };

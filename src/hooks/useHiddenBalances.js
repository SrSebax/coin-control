import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "coinControl_moneyVisibility";
const LEVELS = 3; // 0 = todo visible, 1 = solo tapa la card de saldo, 2 = tapa todo el dinero de Inicio
const listeners = new Set();

function readLevel() {
  const n = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isInteger(n) && n >= 0 && n < LEVELS ? n : 0;
}

// Estado compartido: cualquier componente que lo use ve el mismo valor y se
// mantiene al navegar entre vistas (vive en el módulo, no en un componente),
// porque persiste en localStorage.
let current = readLevel();

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

function setLevel(next) {
  current = next;
  localStorage.setItem(STORAGE_KEY, String(next));
  emitChange();
}

// Ícono ojo con 3 estados: abierto (nada oculto) -> off (tapa solo la card
// de saldo) -> cerrado (tapa todo el dinero de Inicio) -> abierto...
export function useMoneyVisibility() {
  const level = useSyncExternalStore(subscribe, getSnapshot);
  const cycle = useCallback(() => setLevel((current + 1) % LEVELS), []);

  return { level, cycle, cardHidden: level >= 1, allHidden: level >= 2 };
}

// Compat: "hidden" global, usado por componentes que solo necesitan saber si
// se debe tapar TODO el dinero de Inicio (nivel 2).
export function useHiddenBalances() {
  const level = useSyncExternalStore(subscribe, getSnapshot);
  return { hidden: level >= 2 };
}

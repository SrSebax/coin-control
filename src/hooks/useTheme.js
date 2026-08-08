import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "coinControl_theme";
const listeners = new Set();

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getIsDark(theme) {
  return theme === "dark" || (theme === "system" && getSystemPrefersDark());
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", getIsDark(theme));
}

function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || "system";
}

// Estado compartido entre todos los componentes que llamen useTheme(),
// así un cambio en cualquiera de ellos se refleja en los demás.
let currentTheme = getStoredTheme();

// Se ejecuta apenas se importa el módulo (antes del primer render) para
// evitar el parpadeo de tema claro al cargar la app.
applyTheme(currentTheme);

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentTheme;
}

function setGlobalTheme(next) {
  currentTheme = next;
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  emitChange();
}

// Cuando el tema activo es "system", reacciona a cambios del SO en vivo.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (currentTheme !== "system") return;
  applyTheme("system");
  emitChange();
});

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);
  const setTheme = useCallback((next) => setGlobalTheme(next), []);

  return { theme, setTheme, isDark: getIsDark(theme) };
}

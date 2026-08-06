import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "coinControl_theme";

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme) {
  const isDark = theme === "dark" || (theme === "system" && getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || "system";
}

// Se ejecuta apenas se importa el módulo (antes del primer render) para
// evitar el parpadeo de tema claro al cargar la app.
applyTheme(getStoredTheme());

export function useTheme() {
  // Lectura perezosa: cada montaje (cada página/ruta) debe leer el valor
  // persistido actual, no una constante capturada en el primer import.
  const [theme, setThemeState] = useState(getStoredTheme);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, setTheme };
}

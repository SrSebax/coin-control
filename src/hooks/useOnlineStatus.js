import { useEffect, useState } from "react";

// Detecta transiciones de conexión: además del estado actual, expone
// `justReconnected` (true por un momento al volver de offline a online) para
// que la UI pueda mostrar "sincronizando..." una sola vez.
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const clearJustReconnected = () => setJustReconnected(false);

  return { isOnline, justReconnected, clearJustReconnected };
}

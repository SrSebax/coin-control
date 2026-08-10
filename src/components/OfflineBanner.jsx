import { useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const { isOnline, justReconnected, clearJustReconnected } = useOnlineStatus();

  useEffect(() => {
    if (!justReconnected) return;
    const timer = setTimeout(clearJustReconnected, 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justReconnected]);

  if (isOnline && !justReconnected) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-30 px-3 pt-[calc(env(safe-area-inset-top)+8px)] pb-2">
      {!isOnline ? (
        <div className="flex items-center gap-2 rounded-full bg-amber-500 text-[#2a1a00] text-xs font-semibold px-4 py-2 shadow-lg mx-auto w-fit">
          <WifiOff size={14} className="shrink-0" />
          Sin conexión: tus movimientos se guardan igual y se sincronizan al volver internet
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-full bg-emerald-500 text-white text-xs font-semibold px-4 py-2 shadow-lg mx-auto w-fit">
          <RefreshCw size={14} className="shrink-0 animate-spin" />
          Conexión restablecida, sincronizando tus datos...
        </div>
      )}
    </div>
  );
}

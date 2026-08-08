import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { itemsRoutes } from "../routes/itemsRoutes";

const ADD_ENTRY_PATH = "/new-entry";

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const tabItems = itemsRoutes.filter(({ path }) => path !== ADD_ENTRY_PATH);

  return (
    <>
      {/* Botón flotante: registrar movimiento, solo en Inicio */}
      {pathname === "/home" && (
        <Link
          to={ADD_ENTRY_PATH}
          aria-label="Registrar movimiento"
          className="md:hidden fixed bottom-24 right-5 z-40 w-16 h-16 rounded-full bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.5)] flex items-center justify-center text-[#081310] transition-colors"
        >
          <Plus size={28} strokeWidth={2.5} />
        </Link>
      )}

      {/* Tabbar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-1 px-6 py-2 rounded-full bg-white dark:bg-gradient-to-b dark:from-[#0b1a15] dark:to-[#081310] border border-slate-900/10 dark:border-white/5 shadow-[0_10px_30px_-6px_rgba(15,23,42,0.28)] dark:shadow-lg">
        {tabItems.map(({ path, label, icon }) => {
          const isActive = pathname === path || pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "text-text-tertiary hover:text-text dark:text-white/50 dark:hover:text-white"
              }`}
            >
              {icon}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

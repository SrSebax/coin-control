import { Link } from "react-router-dom";
import SidebarToggle from "./SidebarToggle";
import UserActions from "./UserActions";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import logoIconDark from "../assets/favicon-dark.svg";
import logoIconLight from "../assets/favicon-light.svg";

export default function Navbar({ toggleSidebar, title, subtitle, showTitleOnMobile, hideHeaderActions, scrolled }) {
  const { isDark } = useTheme();

  // Mobile: transparente arriba del todo, efecto "liquid glass" al hacer scroll.
  // Desktop mantiene el fondo sólido de siempre (los md: pisan lo anterior).
  const glassClasses = scrolled
    ? "bg-[var(--color-surface)]/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/20 dark:border-white/10 shadow-[0_1px_24px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_24px_rgba(0,0,0,0.35)]"
    : "bg-transparent backdrop-blur-0 border-b border-transparent shadow-none";

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-20 h-16 px-4 md:px-6 flex items-center gap-4 transition-all duration-300 ${glassClasses} md:bg-[var(--color-background)]/90 md:backdrop-blur-md md:border-divider/60 md:shadow-none`}
    >
      {/* Lado izquierdo */}
      <div className="flex items-center gap-2 shrink-0">
        <SidebarToggle toggleSidebar={toggleSidebar} />
        <Link to="/home" className="md:hidden shrink-0" aria-label="Inicio">
          <img src={isDark ? logoIconDark : logoIconLight} alt="CoinControl" className="w-10 h-10 rounded-xl" />
        </Link>
        {!showTitleOnMobile && (
          <span className="md:hidden text-lg font-bold text-text">CoinControl</span>
        )}
      </div>

      {/* Título contextual: en mobile va en el body salvo que showTitleOnMobile lo pida acá */}
      {title && (
        <div className={`min-w-0 ${showTitleOnMobile ? "" : "hidden md:block"}`}>
          <h1 className="text-sm md:text-lg font-bold text-text truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[10px] md:text-xs text-text-tertiary truncate leading-tight">{subtitle}</p>
          )}
        </div>
      )}

      {/* Tema + Usuario */}
      {!hideHeaderActions && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <ThemeToggle />
          <UserActions />
        </div>
      )}
    </header>
  );
}

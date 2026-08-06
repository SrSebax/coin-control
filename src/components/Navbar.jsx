import SidebarToggle from "./SidebarToggle";
import NavigationControls from "./NavigationControls";
import UserActions from "./UserActions";
import NotificationAlert from "./NotificationAlert";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ toggleSidebar, mobileOpen, toggleMobile, title, subtitle }) {
  return (
    <header className="sticky top-0 z-20 px-4 py-3 md:px-6 flex items-center gap-4">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-2 shrink-0">
        <SidebarToggle toggleSidebar={toggleSidebar} />
        <NavigationControls mobileOpen={mobileOpen} toggleMobile={toggleMobile} />
      </div>

      {/* Título contextual: solo desde md+, en mobile va en el body */}
      {title && (
        <div className="min-w-0 hidden md:block">
          <h1 className="text-lg font-bold text-text truncate">{title}</h1>
          {subtitle && <p className="text-xs text-text-tertiary truncate">{subtitle}</p>}
        </div>
      )}

      {/* Tema + Notificación + Usuario */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <ThemeToggle />
        <NotificationAlert />
        <UserActions />
      </div>
    </header>
  );
}

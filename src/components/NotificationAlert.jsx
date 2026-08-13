import { useRef, useState, useEffect } from "react";
import { Bell, X, CheckCheck, Wallet } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Notificaciones"
        className={`relative cursor-pointer p-2 rounded-full transition-colors ${
          isOpen ? "bg-hover text-text" : "text-text-secondary hover:bg-hover hover:text-text"
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-4 min-w-4 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed md:absolute left-2 right-2 md:left-auto top-16 md:top-auto md:right-0 md:mt-2 md:w-80 z-50 rounded-2xl border border-divider bg-surface shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-divider">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex p-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bell size={14} />
                </span>
                <h3 className="text-sm font-bold text-text truncate">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                >
                  <CheckCheck size={13} />
                  <span className="hidden sm:inline">Marcar todas</span>
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <span className="inline-flex p-3 rounded-full bg-surface-alt text-text-muted mb-3">
                    <Bell size={22} />
                  </span>
                  <p className="text-sm font-medium text-text-secondary">Sin notificaciones</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Los recordatorios de pagos recurrentes próximos aparecerán acá.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-divider">
                  {notifications.map((notif) => {
                    const isToday = notif.time === "Vence hoy";
                    const accent = isToday ? "#f43f5e" : "#f59e0b";

                    return (
                      <div
                        key={notif.id}
                        className={`group relative flex items-start gap-3 p-3.5 transition-colors ${
                          !notif.read ? "bg-emerald-500/5" : "hover:bg-hover"
                        }`}
                      >
                        <span
                          className="inline-flex p-2 rounded-full shrink-0"
                          style={{ backgroundColor: `${accent}1A`, color: accent }}
                        >
                          <Wallet size={16} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-text leading-snug">{notif.title}</p>
                            {!notif.read && (
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed mt-0.5">{notif.message}</p>

                          <div className="flex items-center justify-between gap-2 mt-2">
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `${accent}1A`, color: accent }}
                            >
                              {notif.time}
                            </span>
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => markAsRead(notif.id)}
                                className="cursor-pointer text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                Marcar leída
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeNotification(notif.id)}
                          aria-label="Descartar notificación"
                          className="cursor-pointer shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-active transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

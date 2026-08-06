import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, CircleAlert, CircleCheck, Clock } from "lucide-react";

// Datos de ejemplo para notificaciones
const notificationsData = [
  {
    id: 1,
    title: "Nuevo ingreso registrado",
    message: "Has registrado un nuevo ingreso de $500.000",
    time: "Hace 5 minutos",
    read: false,
    type: "success"
  },
  {
    id: 2,
    title: "Recordatorio de pago",
    message: "Tienes un pago programado para mañana",
    time: "Hace 3 horas",
    read: false,
    type: "warning"
  },
  {
    id: 3,
    title: "Límite de gastos alcanzado",
    message: "Has alcanzado el 80% de tu límite de gastos mensuales",
    time: "Hace 1 día",
    read: true,
    type: "danger"
  }
];

export default function NotificationAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsData);
  const dropdownRef = useRef(null);
  
  // Contador de notificaciones no leídas
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  // Cerrar el dropdown al hacer clic fuera
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
  
  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };
  
  // Marcar una notificación como leída
  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };
  
  // Eliminar una notificación
  const removeNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };
  
  // Los colores de fondo se aplican directamente en el JSX

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className={`relative p-2 rounded-full cursor-pointer ${
          isOpen 
            ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-300' 
            : 'hover:bg-hover'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <Bell size={18} className={isOpen ? 'text-teal-600' : 'text-text-secondary'} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="fixed md:absolute right-0 left-0 md:left-auto top-12 md:top-auto md:mt-2 mx-2 md:mx-0 md:w-80 bg-surface rounded-lg shadow-md border border-divider overflow-hidden z-50">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-4 py-2 bg-surface-alt border-b border-divider">
            <h3 className="font-semibold text-text flex items-center gap-2 mb-1 md:mb-0">
              <Bell size={16} className="text-teal-600" />
              Notificaciones
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 py-1 px-2 self-end md:self-auto"
              >
                <CheckCheck size={14} />
                <span className="whitespace-nowrap">Marcar todas como leídas</span>
              </button>
            )}
          </div>
          
          {/* Lista de notificaciones */}
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notif) => {
                  // Iconos según el tipo de notificación
                  let NotifIcon;
                  let iconColor;
                  
                  switch(notif.type) {
                    case 'success':
                      NotifIcon = CircleCheck;
                      iconColor = 'text-green-500';
                      break;
                    case 'warning':
                      NotifIcon = CircleAlert;
                      iconColor = 'text-amber-500';
                      break;
                    case 'danger':
                      NotifIcon = CircleAlert;
                      iconColor = 'text-red-500';
                      break;
                    default:
                      NotifIcon = Bell;
                      iconColor = 'text-blue-500';
                  }
                  
                  return (
                    <div 
                      key={notif.id} 
                      className={`relative p-3 border-b border-divider ${
                        !notif.read 
                          ? 'bg-blue-50 dark:bg-blue-950/30' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${iconColor}`}>
                          <NotifIcon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-text pr-6">{notif.title}</h4>
                            <button 
                              onClick={() => removeNotification(notif.id)}
                              className="absolute top-3 right-3 text-text-muted hover:text-text-secondary p-1"
                              aria-label="Eliminar notificación"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{notif.message}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-2">
                            <div className="flex items-center text-[11px] text-text-tertiary gap-1">
                              <Clock size={12} />
                              {notif.time}
                            </div>
                            {!notif.read && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="text-xs text-teal-600 hover:text-teal-800 font-medium py-1 px-0 sm:px-2 flex items-center gap-1"
                              >
                                <CheckCheck size={12} />
                                <span className="whitespace-nowrap">Marcar como leída</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-text-tertiary">
                <p>No tienes notificaciones</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

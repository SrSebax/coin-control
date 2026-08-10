import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function ToastMessage({ open = false, message, type = 'success', onClose, duration = 5000 }) {
  useEffect(() => {
    if (!open) return;
    
    // Auto-cerrar después del tiempo especificado
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <CheckCircle size={20} className="text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  if (!open) return null;

  return (
    // Mobile: debajo del navbar (h-16) + safe-area, para no montarse encima
    // del header. Desktop: esquina superior derecha, como antes.
    <div className="fixed z-50 inset-x-4 top-[calc(env(safe-area-inset-top)+76px)] md:inset-x-auto md:top-4 md:right-4 md:w-96 animate-in fade-in zoom-in-95 duration-200">
      <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg ${getStyles()}`}>
        {getIcon()}
        <span className="font-medium flex-1 min-w-0">{message}</span>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="cursor-pointer shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

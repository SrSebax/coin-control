// src/components/AlertMessage.jsx
export default function AlertMessage({ open, message, severity = "info", onClose }) {
  if (!open) return null;

  const styles = {
    success: "bg-green-100 dark:bg-green-950/60 border-green-400 dark:border-green-700 text-green-800 dark:text-green-200",
    error: "bg-red-100 dark:bg-red-950/60 border-red-400 dark:border-red-700 text-red-800 dark:text-red-200",
    info: "bg-blue-100 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-800 dark:text-blue-200",
    warning: "bg-yellow-100 dark:bg-yellow-950/60 border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
  };

  return (
    <div
      className={`w-full border-l-4 p-4 rounded-md text-sm shadow-sm flex items-start justify-between gap-4 animate-fade-in ${styles[severity]}`}
    >
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-sm font-bold px-2 hover:text-black opacity-60 hover:opacity-100 transition"
        >
          ✕
        </button>
      )}
    </div>
  );
}

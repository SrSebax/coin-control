export default function NoteTextarea({ 
  value, 
  onChange, 
  onBlur,
  error,
  label = "Nota (opcional)",
  name = "note",
  placeholder = "Ej: Descripción breve...",
  className = "col-span-2",
  rows = 3,
  maxLength,
  minLength,
  required = false,
  disabled = false,
  autoFocus = false,
  readOnly = false,
  resize = false
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-text-secondary mb-2 tracking-wide">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        readOnly={readOnly}
        className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition min-h-[80px] ${
          error ? "border-red-400" : "border-divider"
        } ${disabled ? "bg-hover cursor-not-allowed" : ""} ${
          resize ? "resize" : "resize-none"
        }`}
      />
      {maxLength && (
        <p className="mt-1 text-xs text-text-muted text-right">{(value || "").length}/{maxLength}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
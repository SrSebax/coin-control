export default function NameInput({ 
  value, 
  onChange, 
  onBlur, 
  error,
  label = "Nombre *",
  name = "name",
  placeholder = "Ej: Compra supermercado",
  type = "text",
  className = "",
  required = false,
  disabled = false,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  readOnly = false,
  variant = "default"
}) {
  if (variant === "flat") {
    return (
      <div className={className}>
        {label && <label className="block text-sm text-text-tertiary mb-1.5">{label}</label>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          readOnly={readOnly}
          className="w-full bg-transparent border-none outline-none text-base text-text placeholder-text-muted py-1"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-text-secondary mb-2 tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        readOnly={readOnly}
        className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition ${
          error ? "border-red-400" : "border-divider"
        } ${disabled ? "bg-hover cursor-not-allowed" : ""}`}
      />
      {maxLength && (
        <p className="mt-1 text-xs text-text-muted text-right">{(value || "").length}/{maxLength}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
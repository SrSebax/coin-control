import { useState, useEffect, useCallback } from "react";

export default function AmountInput({ 
  value, 
  onChange, 
  onBlur, 
  error,
  label = "Monto *",
  name = "amount",
  placeholder = "Ej: 50.000",
  className = "",
  locale = "es-CO",
  required = false,
  disabled = false,
  autoFocus = false,
  readOnly = false,
  currencySymbol = "$",
  showCurrency = true,
  maxValue,
  minValue,
  variant = "default"
}) {
  const [amountFormatted, setAmountFormatted] = useState("");

  const formatToCurrency = useCallback((value) => {
    const number = parseFloat(value.replace(/[.,]/g, ""));
    if (isNaN(number)) return "";
    return number.toLocaleString(locale);
  }, [locale]);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    const formatted = formatToCurrency(rawValue);
    setAmountFormatted(formatted);
    
    // Validar límites si están definidos
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      if (maxValue && numValue > maxValue) return;
      if (minValue && numValue < minValue) return;
    }
    
    onChange({ target: { name, value: rawValue } });
  };

  useEffect(() => {
    if (value) setAmountFormatted(formatToCurrency(value));
  }, [value, locale, formatToCurrency]);

  if (variant === "hero") {
    return (
      <div className={className}>
        <div className="flex items-center justify-center gap-2">
          {currencySymbol && (
            <span className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">
              {currencySymbol}
            </span>
          )}
          <input
            type="text"
            inputMode="numeric"
            name={name}
            value={amountFormatted}
            onChange={handleAmountChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoFocus={autoFocus}
            size={Math.max((amountFormatted || placeholder).length, 1)}
            className="bg-transparent border-none outline-none text-5xl font-semibold text-text placeholder-text-muted/50 text-left min-w-[1ch]"
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-text-secondary mb-2 tracking-wide">
        {label}
      </label>
      <div className="relative">
        {currencySymbol && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
            {currencySymbol}
          </span>
        )}
        <input
          type="text"
          name={name}
          value={amountFormatted}
          onChange={handleAmountChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          readOnly={readOnly}
          className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition ${
            error ? "border-red-400" : "border-divider"
          } ${disabled ? "bg-hover cursor-not-allowed" : ""} ${
            currencySymbol ? "pl-8" : ""
          } ${showCurrency ? "pr-14" : ""}`}
        />
        {showCurrency && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary font-medium">
            COP
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
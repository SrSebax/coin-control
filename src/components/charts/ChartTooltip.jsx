import React from "react";

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-surface border border-divider rounded-lg shadow-lg px-3 py-2 text-sm">
      {label && <p className="font-medium text-text mb-1">{label}</p>}
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color || entry.payload?.color }}
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-semibold text-text">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

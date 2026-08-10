export default function MiniStatCard({ icon, iconBg = "bg-emerald-500", label, value, caption }) {
  return (
    <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-4 flex items-center gap-3">
      <span className={`p-2.5 rounded-full shrink-0 ${iconBg}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-tertiary truncate">{label}</p>
        <p className="text-base font-bold text-text truncate">{value}</p>
        {caption && <p className="text-xs text-text-muted truncate">{caption}</p>}
      </div>
    </div>
  );
}

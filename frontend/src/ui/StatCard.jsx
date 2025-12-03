export default function StatCard({ label, value, sub, accent = "frog-green" }) {
  const accentClass =
    accent === "purple"
      ? "from-frog-purple/15 to-frog-purple/5"
      : "from-frog-green/15 to-frog-green/5";

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${accentClass} border border-white/5 shadow-soft-card p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

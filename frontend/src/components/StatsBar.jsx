export default function StatsBar({
  totalCards,
  uniqueCards,
  legendary,
  completion,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat label="Total Cards" value={totalCards} color="green" />
      <Stat label="Unique Cards" value={uniqueCards} color="blue" />
      <Stat label="Legendaries" value={legendary} color="yellow" />
      <Stat label="Completion" value={`${completion}%`} color="purple" />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div
      className={`rounded-xl p-4 bg-${color}-500/20 border border-${color}-400/30 text-center backdrop-blur-xl`}
    >
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm text-gray-300 mt-1">{label}</div>
    </div>
  );
}

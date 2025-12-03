export default function RecentPullCard({ entry }) {
  const rarityColor = {
    common: "border-gray-400/30",
    uncommon: "border-green-400/40",
    rare: "border-blue-400/40",
    epic: "border-purple-400/40",
    legendary: "border-yellow-400/40",
  };

  const color = rarityColor[entry.rarity] || rarityColor.common;

  return (
    <div
      className={`rounded-xl p-4 border ${color} bg-white/5 backdrop-blur-md shadow-md flex gap-4`}
    >
      <img
        src={entry.imageUrl}
        alt={entry.name}
        className="w-20 h-28 object-cover rounded-md border border-white/10"
      />

      <div className="flex flex-col justify-between">
        <div>
          <h3 className="text-md font-bold text-white">{entry.name}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {entry.rarity}
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Pulled: {new Date(entry.date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

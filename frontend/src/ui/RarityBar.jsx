const colors = {
  mythic: "bg-rarity-legendary",
  legendary: "bg-rarity-legendary",
  epic: "bg-rarity-epic",
  rare: "bg-rarity-rare",
  uncommon: "bg-rarity-uncommon",
  common: "bg-rarity-common",
};

export default function RarityBar({ label, value, max, rarityKey }) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>
          {value} / {max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full ${colors[rarityKey]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

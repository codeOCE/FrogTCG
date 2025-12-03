export default function BinderSlot({ card, empty }) {
  if (empty) {
    return (
      <div className="w-[140px] h-[200px] rounded-xl border border-white/10 bg-black/20 shadow-inner opacity-40"></div>
    );
  }

  const rarityColors = {
    common: "border-gray-400/30",
    uncommon: "border-green-400/40",
    rare: "border-blue-400/40",
    epic: "border-purple-400/40",
    legendary: "border-yellow-400/40",
  };

  const color = rarityColors[card.rarity] || rarityColors.common;

  return (
    <div
      className={`relative w-[140px] h-[200px] rounded-xl border ${color} bg-black/40 overflow-hidden shadow-lg hover:scale-105 transition duration-200 hover:shadow-2xl`}
    >
      <img
        src={card.imageUrl}
        alt={card.name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/40 backdrop-blur-md px-2 py-1">
        {card.name}
      </div>
    </div>
  );
}

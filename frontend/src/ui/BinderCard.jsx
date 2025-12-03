export default function BinderCard({ name, rarity, count, imageUrl }) {
  const rarityColor =
    rarity === "legendary"
      ? "border-rarity-legendary/70 shadow-glow-purple"
      : rarity === "epic"
      ? "border-rarity-epic/70"
      : rarity === "rare"
      ? "border-rarity-rare/70"
      : rarity === "uncommon"
      ? "border-rarity-uncommon/70"
      : "border-white/10";

  return (
    <div className="relative group">
      <div
        className={`aspect-[3/4] rounded-2xl border bg-gradient-to-br from-bg-elevated-soft to-bg-elevated overflow-hidden shadow-soft-card transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-glow-green ${rarityColor}`}
      >
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_10%_0,rgba(66,245,155,0.22),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(168,85,247,0.25),transparent_55%)]" />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover relative"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 relative">
            <div className="text-3xl">🐸</div>
            <div className="text-[11px] text-gray-400">FrogTCG Card</div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white truncate">
              {name}
            </div>
            {count != null && (
              <div className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-gray-200">
                x{count}
              </div>
            )}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
            {rarity}
          </div>
        </div>
      </div>
    </div>
  );
}

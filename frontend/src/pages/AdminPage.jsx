export default function AdminPage() {
  const cards = [
    { name: "Froggy Knight", rarity: "common", type: "Creature", set: "Base", rate: 10 },
    { name: "Swamp Healer", rarity: "rare", type: "Creature", set: "Base", rate: 6 },
    { name: "Crown of the Swamp King", rarity: "legendary", type: "Item", set: "Base", rate: 0.5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          <p className="text-sm text-gray-400">
            Manage cards & users. This will eventually talk to your backend
            admin routes.
          </p>
        </div>
        <button className="rounded-full bg-frog-green px-4 py-2 text-xs font-semibold text-black hover:bg-frog-green-soft">
          + Add Card
        </button>
      </div>

      <div className="rounded-2xl bg-bg-elevated-soft/90 border border-white/5 shadow-soft-card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Rarity</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Set</th>
              <th className="px-4 py-3 text-right">Drop rate</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, idx) => (
              <tr
                key={card.name}
                className={idx % 2 === 0 ? "bg-transparent" : "bg-white/2"}
              >
                <td className="px-4 py-3 text-gray-100">{card.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gray-200">
                    {card.rarity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{card.type}</td>
                <td className="px-4 py-3 text-gray-300">{card.set}</td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {card.rate}%
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-400 space-x-2">
                  <button className="hover:text-frog-green">Edit</button>
                  <button className="hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

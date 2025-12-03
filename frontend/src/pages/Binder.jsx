import { useEffect, useState } from "react";
import { api } from "../api";
import BinderSlot from "../components/BinderSlot";

export default function Binder() {
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(0);

  const pageSize = 9; // 3x3 per page

  useEffect(() => {
    loadBinder();
  }, []);

  async function loadBinder() {
    try {
      const res = await api.get("/api/binder");
      setCards(res.data.cards || []);
    } catch (err) {
      console.error("Binder load error:", err);
    }
  }

  const totalPages = Math.ceil(cards.length / pageSize);
  const currentPageCards = cards.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Binder</h1>

      {/* Binder */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-3 gap-6 binder-grid">
          {currentPageCards.map((c, idx) => (
            <BinderSlot key={idx} card={c.card} />
          ))}

          {/* Empty slots to fill remaining grid spaces */}
          {currentPageCards.length < 9 &&
            Array.from({ length: 9 - currentPageCards.length }).map(
              (_, i) => <BinderSlot key={`empty-${i}`} empty />
            )}
        </div>

        {/* Page Controls */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg disabled:opacity-30 hover:bg-white/20 transition"
          >
            ◀ Prev
          </button>

          <span className="text-lg opacity-80">
            Page {page + 1} / {totalPages || 1}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg disabled:opacity-30 hover:bg-white/20 transition"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}

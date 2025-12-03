import React from "react";

export default function BinderPage({ cards = [], page }) {
  // fill slots to 9
  const slots = [...cards];
  while (slots.length < 9) slots.push(null);

  return (
    <div
      className="
        binder-page
        grid grid-cols-3 gap-6 p-8 rounded-2xl 
        relative
        animate-pageTurn
      "
      key={page}
    >
      {/* glossy overlay */}
      <div className="binder-gloss pointer-events-none"></div>

      {slots.map((card, i) => (
        <div
          key={i}
          className="
            binder-slot
            h-[180px] w-[130px]
            rounded-xl relative overflow-hidden
            shadow-inner
          "
        >
          {/* shine */}
          <div className="slot-shine"></div>

          {/* rarity glow */}
          {card && (
            <div className={`rarity-glow glow-${card.rarity}`}></div>
          )}

          {card ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="
                h-full w-full object-cover rounded-lg
                transition-transform duration-300
                hover:scale-[1.06] hover:-translate-y-1
              "
            />
          ) : (
            <div className="text-xs text-gray-500 opacity-40 select-none flex items-center justify-center h-full">
              Empty Slot
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

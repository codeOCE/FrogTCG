import React, { useState } from "react";
import BinderPage from "./BinderPage";

export default function Binder({ cards = [] }) {
  const CARDS_PER_PAGE = 9;
  const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE) || 1;

  const [page, setPage] = useState(0);

  const currentCards = cards.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  const nextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className="binder-wrapper flex flex-col items-center gap-6 py-10">

      <BinderPage cards={currentCards} page={page} />

      <div className="flex gap-4 mt-4">
        <button
          onClick={prevPage}
          disabled={page === 0}
          className="binder-btn disabled:opacity-30"
        >
          ◀ Prev Page
        </button>

        <button
          onClick={nextPage}
          disabled={page >= totalPages - 1}
          className="binder-btn disabled:opacity-30"
        >
          Next Page ▶
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Page {page + 1} / {totalPages}
      </p>
    </div>
  );
}

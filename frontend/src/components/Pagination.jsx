// src/components/Pagination.jsx
import React from "react";

export default function Pagination({ page, totalPages, setPage }) {
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={prev}
        disabled={page === 1}
        className="px-3 py-2 rounded-md bg-gray-100 disabled:opacity-50"
      >
        Prev
      </button>

      <div className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </div>

      <button
        onClick={next}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-md bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

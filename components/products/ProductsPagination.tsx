"use client";

type ProductsPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ProductsPagination({
  page,
  totalPages,
  onPageChange
}: ProductsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition ${
            page === pageNumber
              ? "border-black bg-black text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-gray-300 px-3 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  );
}

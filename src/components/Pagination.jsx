import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export default function Pagination({ page, totalPages, totalItems, perPage, onPageChange }) {
  const from = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, totalItems);

  const pages = buildPages(page, totalPages);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-obsidianHighlight">
      {/* Count */}
      <p className="text-xs text-white/35">
        Showing <span className="text-white/60 font-medium">{from}–{to}</span> of{" "}
        <span className="text-white/60 font-medium">{totalItems}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria="Previous">
          <ChevronLeftIcon className="size-3.5" />
        </PageBtn>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-white/25 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={[
                "min-w-[28px] h-7 px-2 rounded-md text-xs font-medium transition-colors",
                p === page
                  ? "bg-electricBlue text-white"
                  : "text-white/50 hover:bg-obsidianHighlight hover:text-white",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}

        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria="Next">
          <ChevronRightIcon className="size-3.5" />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ onClick, disabled, aria, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="size-7 flex items-center justify-center rounded-md text-white/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:bg-obsidianHighlight hover:text-white"
    >
      {children}
    </button>
  );
}

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ pages = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol role="list" className="flex items-center gap-1">
        {pages.map((page, idx) => {
          const isLast = idx === pages.length - 1;
          return (
            <li key={page.name} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRightIcon className="size-3.5 shrink-0 text-white/20" />
              )}
              {page.href && !isLast ? (
                <Link
                  to={page.href}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {page.name}
                </Link>
              ) : (
                <span className={`text-xs font-medium truncate max-w-[160px] ${isLast ? "text-white/80" : "text-white/40"}`}>
                  {page.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

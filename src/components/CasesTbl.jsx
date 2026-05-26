import { useMemo, useState, useEffect } from "react";
import {
  GlobeAltIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";

const PER_PAGE = 10;

const SOURCE_CONFIG = {
  Phone:       { Icon: PhoneIcon,                     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  Email:       { Icon: EnvelopeIcon,                  color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  WhatsApp:    { Icon: ChatBubbleLeftEllipsisIcon,     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Web Portal":{ Icon: GlobeAltIcon,                  color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
};

const STATUS_CONFIG = {
  New:         { color: "text-electricBlue", bg: "bg-electricBlue/10",  border: "border-electricBlue/20"  },
  "In Review": { color: "text-amber-400",    bg: "bg-amber-400/10",     border: "border-amber-400/20"     },
  Converted:   { color: "text-violet-400",   bg: "bg-violet-400/10",    border: "border-violet-400/20"    },
  Closed:      { color: "text-slate-400",    bg: "bg-slate-400/10",     border: "border-slate-400/20"     },
};

const PRIORITY_CONFIG = {
  High:   { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  Medium: { color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20"  },
  Low:    { color: "text-slate-400",  bg: "bg-slate-400/10",  border: "border-slate-400/20"  },
};

function Badge({ label, config }) {
  if (!label) return <span className="text-white/20 text-xs">—</span>;
  const c = config[label] ?? { color: "text-white/40", bg: "bg-white/5", border: "border-white/10" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${c.bg} ${c.color} ${c.border}`}>
      {label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function CasesTbl({ className = "", filter = {} }) {
  const { cases } = useCases();

  const filtered = useMemo(() => cases.filter((c) => {
    if (filter.source && filter.source !== "All Sources" && c.source !== filter.source) return false;
    if (filter.status && filter.status !== "All Statuses" && c.case_status !== filter.status) return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      return (
        (c.caseId ?? "").toLowerCase().includes(q) ||
        (c.title  ?? "").toLowerCase().includes(q) ||
        (c.requester?.displayName ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  }), [cases, filter.source, filter.status, filter.query]);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  // Snap back to page 1 whenever filters narrow the result below the current page
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className={`rounded-lg overflow-hidden border border-obsidianHighlight ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-obsidianHighlight">
          <thead className="bg-obsidianNight/60">
            <tr>
              {["Case ID", "Title", "Requester", "Source", "Status", "Priority", "Date", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-obsidianHighlight bg-obsidianSurface">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-white/25">
                  No cases found
                </td>
              </tr>
            ) : paged.map((c) => {
              const src = SOURCE_CONFIG[c.source];
              return (
                <tr key={c.id} className="hover:bg-obsidianHighlight/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-electricBlue">{c.caseId}</span>
                  </td>

                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="text-xs text-white truncate block">
                      {c.title || <span className="italic text-white/25">Untitled</span>}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-white/60">{c.requester?.displayName ?? "—"}</span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {src ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${src.bg} ${src.color} ${src.border}`}>
                        <src.Icon className="size-3 shrink-0" />
                        {c.source}
                      </span>
                    ) : (
                      <span className="text-white/25 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge label={c.case_status} config={STATUS_CONFIG} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge label={c.priority} config={PRIORITY_CONFIG} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-white/40">{fmtDate(c.createdAt)}</span>
                    <span className="block text-[10px] text-white/25">{fmtTime(c.createdAt)}</span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Link
                      to={`/admin/cases/manage/${c.id}`}
                      className="text-xs font-medium text-electricBlue hover:text-electricBlue/70 transition-colors"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 pb-4 bg-obsidianSurface">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            perPage={PER_PAGE}
            onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
          />
        </div>
      )}
    </div>
  );
}

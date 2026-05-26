import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  // real case_status values
  New:           { dot: "bg-electricBlue",  text: "text-electricBlue",  bg: "bg-electricBlue/10"  },
  "In Review":   { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10"     },
  Converted:     { dot: "bg-violet-400",    text: "text-violet-400",    bg: "bg-violet-400/10"    },
  Closed:        { dot: "bg-slate-400",     text: "text-slate-400",     bg: "bg-slate-400/10"     },
  // legacy mock values kept for fallback
  "In Progress": { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10"     },
  Resolved:      { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-400/10"   },
  Cancelled:     { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-400/10"       },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.New;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentRequestsTable({ cases = [] }) {
  const navigate = useNavigate();

  const rows = cases.map((c) => ({
    numericId: c.id,
    id: c.caseId,
    title: c.title,
    date: fmtDate(c.createdAt),
    status: c.case_status,
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-white/70">
          Recent Requests
          {rows.length > 0 && (
            <span className="ml-1.5 text-[10px] text-white/30">({rows.length})</span>
          )}
        </p>
        {rows.length > 0 && (
          <button className="text-[11px] font-semibold text-electricBlue hover:text-electricBlue/80 transition-colors">
            View All
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-[11px] text-white/30 py-3 text-center">
          No other cases for this requester
        </p>
      ) : (
        <div className="rounded-md overflow-hidden border border-obsidianHighlight">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-obsidianElevated border-b border-obsidianHighlight">
                <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 whitespace-nowrap">ID</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 w-full">Title</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 whitespace-nowrap">Date</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.numericId}
                  onClick={() => navigate(`/admin/cases/manage/${row.numericId}`)}
                  className={`cursor-pointer hover:bg-obsidianHighlight transition-colors ${
                    i < rows.length - 1 ? "border-b border-obsidianHighlight" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-[11px] font-semibold text-electricBlue whitespace-nowrap">{row.id}</td>
                  <td className="px-3 py-2 text-[11px] text-white/60 overflow-hidden">
                    <span className="block truncate text-left">{row.title}</span>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-white/40 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

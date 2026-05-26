import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wrench, User, Calendar, MapPin } from "lucide-react";
import { useCases } from "../../context/CasesContext";
import CaseTabsHeader from "../../components/CaseTabsHeader";
import SectionHeading from "../../components/SectionHeading";
import Dropdowns from "../../components/Dropdowns";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";

const PER_PAGE = 10;

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_OPTIONS   = ["All Statuses", "Dispatched", "Acknowledged", "In Progress", "Responded", "Awaiting Parts", "Final Response", "Completed", "Cancelled"];
const PRIORITY_OPTIONS = ["All Priorities", "Critical", "Urgent", "High", "Medium", "Low"];

const WO_STATUS_STYLE = {
  Dispatched:    { dot: "bg-electricBlue",  text: "text-electricBlue",  bg: "bg-electricBlue/10",  border: "border-electricBlue/20"  },
  Acknowledged:  { dot: "bg-purple-400",    text: "text-purple-400",    bg: "bg-purple-400/10",    border: "border-purple-400/20"    },
  "In Progress":    { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10",     border: "border-amber-400/20"     },
  "Awaiting Parts":   { dot: "bg-orange-500",  text: "text-orange-400",   bg: "bg-orange-500/10",    border: "border-orange-500/20"    },
  "Final Response":   { dot: "bg-sky-400",    text: "text-sky-400",      bg: "bg-sky-400/10",       border: "border-sky-400/20"       },
  Responded:          { dot: "bg-teal-400",   text: "text-teal-400",     bg: "bg-teal-400/10",      border: "border-teal-400/20"      },
  Completed:     { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-400/10",   border: "border-emerald-400/20"   },
  Cancelled:     { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-400/10",       border: "border-red-400/20"       },
};

const PRIORITY_STYLE = {
  Critical: { text: "text-red-400",        bg: "bg-red-500/10",        border: "border-red-500/20"        },
  Urgent:   { text: "text-orange-400",     bg: "bg-orange-400/10",     border: "border-orange-400/20"     },
  High:     { text: "text-electricBlue",   bg: "bg-electricBlue/10",   border: "border-electricBlue/20"   },
  Medium:   { text: "text-amber-400",      bg: "bg-amber-400/10",      border: "border-amber-400/20"      },
  Low:      { text: "text-white/40",       bg: "bg-white/5",           border: "border-white/10"          },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function locSnippet(loc) {
  if (!loc) return "—";
  return [loc.building, loc.block && `Block ${loc.block}`, loc.floor].filter(Boolean).join(" · ") || "—";
}

function StatusBadge({ status }) {
  const s = WO_STATUS_STYLE[status];
  if (!s) return <span className="text-white/25 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`size-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLE[priority];
  if (!p) return <span className="text-white/25 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${p.bg} ${p.text} ${p.border}`}>
      {priority}
    </span>
  );
}

// ─── Summary stats ────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 rounded-lg bg-obsidianNight/40 border border-obsidianHighlight">
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-white/35 uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ─── Index ────────────────────────────────────────────────────────────────────
export default function WOIndex() {
  const { cases } = useCases();
  const [status,   setStatus]   = useState("All Statuses");
  const [priority, setPriority] = useState("All Priorities");
  const [query,    setQuery]    = useState("");

  // Only show cases that have been converted to WOs
  const workOrders = cases.filter((c) => !!c.workOrderNumber);

  // Stats
  const stats = {
    total:      workOrders.length,
    dispatched: workOrders.filter((c) => c.workOrderStatus === "Dispatched").length,
    inProgress: workOrders.filter((c) => c.workOrderStatus === "In Progress").length,
    completed:  workOrders.filter((c) => c.workOrderStatus === "Completed").length,
  };

  // Filtered list
  const filtered = useMemo(() => workOrders.filter((c) => {
    if (status   !== "All Statuses"   && c.workOrderStatus !== status)   return false;
    if (priority !== "All Priorities" && c.priority        !== priority)  return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (c.workOrderNumber            ?? "").toLowerCase().includes(q) ||
        (c.title                      ?? "").toLowerCase().includes(q) ||
        (c.caseId                     ?? "").toLowerCase().includes(q) ||
        (c.requester?.displayName     ?? "").toLowerCase().includes(q) ||
        (c.assignedTo                 ?? "").toLowerCase().includes(q) ||
        (c.location?.building         ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  }), [workOrders, status, priority, query]);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <CaseTabsHeader />

      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 min-h-0">
        <SectionHeading
          title="Work Orders"
          description="Track and manage all active and completed maintenance work orders."
          isDescriptionHidden={false}
        />

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total"       value={stats.total}      color="text-white"          />
          <StatCard label="Dispatched"  value={stats.dispatched}  color="text-electricBlue"   />
          <StatCard label="In Progress" value={stats.inProgress}  color="text-amber-400"      />
          <StatCard label="Completed"   value={stats.completed}   color="text-emerald-400"    />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchBar
              placeholder="Search by WO#, title, requester, engineer…"
              defaultValue={query}
              onSearch={setQuery}
            />
          </div>

          <Dropdowns
            optionList={STATUS_OPTIONS}
            defaultValue={status}
            onChange={setStatus}
            dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
            optionPlaceholder="All Statuses"
            className="w-44"
          />
          <Dropdowns
            optionList={PRIORITY_OPTIONS}
            defaultValue={priority}
            onChange={setPriority}
            dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
            optionPlaceholder="All Priorities"
            className="w-44"
          />

          <p className="ml-auto text-xs font-medium text-electricBlue whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? "work order" : "work orders"} found
          </p>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden border border-obsidianHighlight">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-obsidianHighlight">
              <thead className="bg-obsidianNight/60">
                <tr>
                  {["WO Number", "Title", "Status", "Priority", "Assigned To", "Location", "Scheduled", "Created", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-obsidianHighlight bg-obsidianSurface">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Wrench className="size-8 text-white/10" />
                        <p className="text-sm text-white/25">No work orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : paged.map((c) => (
                  <tr key={c.id} className="hover:bg-obsidianHighlight/40 transition-colors">

                    {/* WO Number */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs font-bold text-violet-400">{c.workOrderNumber}</span>
                        <span className="font-mono text-[10px] text-white/25">{c.caseId}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-xs text-white/80 truncate block">
                        {c.title || <span className="italic text-white/25">Untitled</span>}
                      </span>
                      {c.ServiceCategory && (
                        <span className="text-[10px] text-white/30 truncate block">
                          {c.ServiceCategory?.title ?? c.ServiceCategory}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={c.workOrderStatus ?? "Dispatched"} />
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    {/* Assigned to */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-white/25 shrink-0" />
                          <span className="text-xs text-white/60">{c.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-white/20 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="size-3 text-white/20 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-white/40 truncate">{locSnippet(c.location)}</span>
                      </div>
                    </td>

                    {/* Scheduled */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.scheduledDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-white/25 shrink-0" />
                          <div>
                            <span className="text-xs text-white/60 block">{fmtDate(c.scheduledDate)}</span>
                            {c.scheduledTime && <span className="text-[10px] text-white/30 block">{c.scheduledTime}</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-white/20 italic">Not scheduled</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-white/40">{fmtDate(c.workOrderCreatedAt)}</span>
                    </td>

                    {/* Open */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/admin/workorders/${c.id}`}
                        className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
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
      </div>
    </div>
  );
}

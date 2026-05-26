import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCases } from "../context/CasesContext";

const WO_STATUS_TONE = {
  Dispatched:       "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  Acknowledged:     "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  Responded:        "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  "In Progress":    "bg-electricBlue/15 text-electricBlue ring-electricBlue/30",
  "Awaiting Parts": "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  Completed:        "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Cancelled:        "bg-red-500/15 text-red-300 ring-red-500/30",
};

const PRIORITY_TONE = {
  Critical: "text-red-300",
  Urgent:   "text-red-300",
  High:     "text-orange-300",
  Medium:   "text-blue-300",
  Low:      "text-emerald-300",
};

function fmtDate(ms) {
  return new Date(ms).toLocaleDateString("en-GB", {
    day:   "2-digit",
    month: "short",
  });
}

export default function RecentWO({ className = "" }) {
  const { cases } = useCases();

  const rows = useMemo(() => {
    return cases
      .filter((c) => c.workOrderCreatedAt)
      .sort((a, b) => new Date(b.workOrderCreatedAt) - new Date(a.workOrderCreatedAt))
      .slice(0, 6)
      .map((c) => ({
        caseId:    c.caseId,
        title:     c.title,
        requester: c.requester?.displayName ?? "—",
        priority:  c.priority,
        status:    c.workOrderStatus ?? "Dispatched",
        created:   fmtDate(new Date(c.workOrderCreatedAt).getTime()),
        engineer:  c.assignedTo?.name ?? c.assignedTo ?? "Unassigned",
      }));
  }, [cases]);

  return (
    <div
      className={`divide-y divide-white/10 overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 ${className}`}
    >
      <div className="px-5 flex items-center justify-between bg-obsidianNight/60 h-[60px]">
        <h3 className="text-base font-semibold leading-6 text-white">
          Recent Work Orders
        </h3>

        <Link
          to="/admin/workorders"
          className="text-xs font-medium text-electricBlue hover:text-electricBlue/80 hover:underline flex-shrink-0"
        >
          View all
        </Link>
      </div>

      <div className="px-5 py-4 bg-obsidianNight/50 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-center text-xs text-white/40 py-6">
            No work orders yet.
          </p>
        ) : (
          <table className="relative min-w-full divide-y divide-white/15">
            <thead>
              <tr>
                <th scope="col" className="py-3 pr-3 pl-0 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Case</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Subject</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Requester</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Priority</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Status</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">Created</th>
                <th scope="col" className="py-3 pr-0 pl-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((r) => (
                <tr key={r.caseId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-3 pl-0 text-sm font-mono whitespace-nowrap text-white/80 text-left">
                    {r.caseId}
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap text-white text-left max-w-xs truncate">
                    {r.title}
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-400 text-left">
                    {r.requester}
                  </td>
                  <td className={`px-3 py-3 text-sm whitespace-nowrap text-left font-medium ${PRIORITY_TONE[r.priority] ?? "text-white/60"}`}>
                    {r.priority}
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap text-left">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${WO_STATUS_TONE[r.status] ?? "bg-white/10 text-white/60 ring-white/20"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-400 text-left">
                    {r.created}
                  </td>
                  <td className="py-3 pr-0 pl-3 text-right text-sm font-medium whitespace-nowrap">
                    <Link
                      to={`/admin/cases/${r.caseId}`}
                      className="text-sm font-medium text-electricBlue hover:text-electricBlue/80 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

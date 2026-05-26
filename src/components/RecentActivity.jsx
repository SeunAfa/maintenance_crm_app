import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  InboxArrowDownIcon,
  WrenchScrewdriverIcon,
  HandRaisedIcon,
  PlayCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";

function fmtAgo(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60)     return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60)     return `${min}m ago`;
  const hr  = Math.floor(min / 60);
  if (hr < 24)      return `${hr}h ago`;
  const d   = Math.floor(hr / 24);
  if (d < 7)        return `${d}d ago`;
  return new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const EVENT_META = {
  created:      { icon: InboxArrowDownIcon,    color: "text-violet-300",   bg: "bg-violet-400/10",   verb: "New case raised"     },
  converted:    { icon: WrenchScrewdriverIcon, color: "text-amber-300",    bg: "bg-amber-400/10",    verb: "Converted to WO"     },
  acknowledged: { icon: HandRaisedIcon,        color: "text-blue-300",     bg: "bg-blue-400/10",     verb: "Engineer acknowledged" },
  inProgress:   { icon: PlayCircleIcon,        color: "text-electricBlue", bg: "bg-electricBlue/10", verb: "Work in progress"    },
  completed:    { icon: CheckCircleIcon,       color: "text-emerald-300",  bg: "bg-emerald-400/10",  verb: "Case resolved"       },
  cancelled:    { icon: XCircleIcon,           color: "text-red-300",      bg: "bg-red-400/10",      verb: "Case cancelled"      },
};

export default function RecentActivity({ className = "" }) {
  const { cases } = useCases();

  const events = useMemo(() => {
    const out = [];
    cases.forEach((c) => {
      if (c.createdAt)        out.push({ type: "created",      ts: new Date(c.createdAt).getTime(),        caseId: c.caseId, title: c.title });
      if (c.workOrderCreatedAt) out.push({ type: "converted",  ts: new Date(c.workOrderCreatedAt).getTime(), caseId: c.caseId, title: c.title });
      if (c.acknowledgedAt)   out.push({ type: "acknowledged", ts: new Date(c.acknowledgedAt).getTime(),   caseId: c.caseId, title: c.title });
      if (c.inProgressAt)     out.push({ type: "inProgress",   ts: new Date(c.inProgressAt).getTime(),     caseId: c.caseId, title: c.title });
      if (c.completedAt)      out.push({ type: "completed",    ts: new Date(c.completedAt).getTime(),      caseId: c.caseId, title: c.title });
      if (c.cancelledAt)      out.push({ type: "cancelled",    ts: new Date(c.cancelledAt).getTime(),      caseId: c.caseId, title: c.title });
    });
    return out.sort((a, b) => b.ts - a.ts).slice(0, 6);
  }, [cases]);

  const todayCount = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return events.filter((e) => e.ts >= start.getTime()).length;
  }, [events]);

  return (
    <div
      className={`flex flex-col divide-y divide-white/10 overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 ${className}`}
    >
      <div className="px-5 flex items-center justify-between bg-obsidianNight/60 h-[60px]">
        <div className="flex flex-row items-center gap-2">
          <h3 className="text-base font-semibold leading-6 text-white">
            Recent Activity
          </h3>
          <p className="text-xs text-gray-400">
            {todayCount} events today
          </p>
        </div>

        <Link
          to="/admin/cases"
          className="text-xs font-medium text-electricBlue hover:text-electricBlue/80 hover:underline flex-shrink-0"
        >
          View all
        </Link>
      </div>

      <div className="px-5 py-4 bg-obsidianNight/50 flex-1">
        {events.length === 0 ? (
          <p className="text-center text-xs text-white/40 py-6">
            No recent activity.
          </p>
        ) : (
          <ol className="relative">
            {events.map((e, i) => {
              const meta = EVENT_META[e.type];
              const Icon = meta.icon;
              return (
                <li key={`${e.caseId}-${e.type}-${e.ts}`} className="relative flex gap-4 pb-5 last:pb-0">
                  {i !== events.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/10" />
                  )}

                  <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${meta.bg} ring-1 ring-white/10`}>
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white text-left leading-snug truncate max-w-full">
                          {meta.verb}{" "}
                          <Link to={`/admin/cases/${e.caseId}`} className="font-mono text-xs text-electricBlue/80 hover:text-electricBlue">
                            {e.caseId}
                          </Link>
                        </p>
                        <p className="text-xs text-left text-gray-400 mt-0.5 truncate max-w-full">
                          {e.title}
                        </p>
                      </div>
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <ClockIcon className="h-3 w-3" />
                        {fmtAgo(e.ts)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

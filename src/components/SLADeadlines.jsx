import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";

const SLA_MINUTES = {
  Critical: 24 * 60,
  Urgent:   36 * 60,
  High:     48 * 60,
  Medium:   72 * 60,
  Low:      96 * 60,
};

const URGENCY_CFG = {
  Critical: { badge: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",         icon: "bg-red-500/20 text-red-400",         bar: "bg-red-500"     },
  Urgent:   { badge: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",         icon: "bg-red-500/20 text-red-400",         bar: "bg-red-500"     },
  High:     { badge: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30",icon: "bg-orange-500/20 text-orange-400",   bar: "bg-orange-500"  },
  Medium:   { badge: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",      icon: "bg-blue-500/20 text-blue-400",       bar: "bg-blue-500"    },
  Low:      { badge: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30", icon: "bg-emerald-500/20 text-emerald-400", bar: "bg-emerald-500" },
};

function fmtRemaining(ms) {
  if (ms <= 0) {
    const overdue = Math.abs(ms);
    const h = Math.floor(overdue / 3_600_000);
    if (h < 24) return `${h}h overdue`;
    return `${Math.floor(h / 24)}d overdue`;
  }
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  if (h < 24) {
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

export default function SLADeadlines({ className = "" }) {
  const { cases } = useCases();

  const items = useMemo(() => {
    const now = Date.now();
    return cases
      .filter((c) => c.workOrderCreatedAt &&
        !["Completed", "Cancelled"].includes(c.workOrderStatus ?? "") &&
        SLA_MINUTES[c.priority])
      .map((c) => {
        const sla = SLA_MINUTES[c.priority];
        const deadlineMs = new Date(c.workOrderCreatedAt).getTime() + sla * 60_000;
        const remaining = deadlineMs - now;
        const elapsedPct = Math.min(
          100,
          Math.max(0, Math.round(((sla * 60_000 - remaining) / (sla * 60_000)) * 100))
        );
        return {
          caseId: c.caseId,
          subject: c.title,
          priority: c.priority,
          remaining,
          remainingLabel: fmtRemaining(remaining),
          elapsedPct,
        };
      })
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 5);
  }, [cases]);

  return (
    <div
      className={`flex flex-col h-full divide-y divide-white/10 overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 ${className}`}
    >
      {/* Header */}
      <div className="shrink-0 px-5 flex items-center justify-between bg-obsidianNight/60 h-[60px]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            SLA Deadlines
          </h3>
          <span className="hidden sm:inline-flex items-center rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/40 ring-1 ring-white/10">
            {items.length} active
          </span>
        </div>
        <Link
          to="/admin/workorders"
          className="text-xs font-medium text-electricBlue hover:text-electricBlue/80 hover:underline flex-shrink-0"
        >
          View all
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4 bg-obsidianNight/50 flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-center text-xs text-white/40 py-6">
            No SLA deadlines approaching.
          </p>
        ) : (
          items.map((s) => {
            const cfg = URGENCY_CFG[s.priority] ?? URGENCY_CFG.Medium;
            return (
              <Link
                key={s.caseId}
                to={`/admin/cases/${s.caseId}`}
                className="group relative flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-obsidianNight/60 p-2.5 hover:bg-white/[0.055] hover:border-white/[0.1] transition-all duration-200"
              >
                <div className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full ${cfg.bar} opacity-70`} />

                <div className={`h-7 w-7 rounded-md ${cfg.icon} flex items-center justify-center flex-shrink-0 ml-1`}>
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white/90 truncate leading-snug">
                      {s.subject}
                    </p>
                    <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge} tracking-wide uppercase`}>
                      {s.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-white/40">
                      <ClockIcon className="h-3 w-3" />
                      {s.remainingLabel} {s.remaining > 0 ? "left" : ""}
                    </span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-[11px] font-mono text-white/30">
                      {s.caseId}
                    </span>
                  </div>

                  <div className="mt-1.5 h-[2px] w-full rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${cfg.bar} opacity-60 transition-all`}
                      style={{ width: `${s.elapsedPct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";

const SLA_MINUTES = {
  Critical: { resolve: 24 * 60 },
  Urgent:   { resolve: 36 * 60 },
  High:     { resolve: 48 * 60 },
  Medium:   { resolve: 72 * 60 },
  Low:      { resolve: 96 * 60 },
};

function fmtRelative(ms) {
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Tile({ to, icon: Icon, tone, label, value, hint }) {
  const body = (
    <div className="group flex items-start gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 transition-colors hover:bg-white/[0.03]">
      <div className={`size-8 sm:size-10 rounded-lg ${tone.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`size-4 sm:size-5 ${tone.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1 sm:mb-1.5 truncate">
          {label}
        </p>
        <p className={`text-xl sm:text-2xl font-bold leading-none ${tone.text}`}>{value}</p>
        {hint && <p className="hidden sm:block text-[11px] text-white/35 mt-1.5 truncate">{hint}</p>}
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block">{body}</Link>
  ) : (
    <div>{body}</div>
  );
}

export default function KpiCards({ className = "" }) {
  const { cases } = useCases();

  const k = useMemo(() => {
    const now    = Date.now();
    const today  = new Date(); today.setHours(0, 0, 0, 0);

    const open = cases.filter((c) =>
      !["Closed", "Cancelled"].includes(c.case_status) &&
      c.workOrderStatus !== "Completed"
    );

    const newToday = cases.filter((c) =>
      c.createdAt && new Date(c.createdAt) >= today
    );

    const inProgress = cases.filter((c) =>
      ["In Progress", "Responded", "Acknowledged"].includes(c.workOrderStatus)
    );

    const awaitingParts = cases.filter((c) => c.workOrderStatus === "Awaiting Parts");

    const completedToday = cases.filter((c) =>
      c.completedAt && new Date(c.completedAt) >= today
    );

    // SLA at risk — converted cases with a resolve deadline within the next 8h
    // (or already breached) that aren't completed/cancelled
    const slaAtRisk = cases.filter((c) => {
      if (!c.workOrderCreatedAt) return false;
      if (["Completed", "Cancelled"].includes(c.workOrderStatus ?? "")) return false;
      const sla = SLA_MINUTES[c.priority];
      if (!sla) return false;
      const deadline = new Date(c.workOrderCreatedAt).getTime() + sla.resolve * 60_000;
      return deadline - now < 8 * 60 * 60 * 1000;
    });

    // Average response time over the last 30 days (Acknowledged - Created)
    const ack30d = cases.filter((c) =>
      c.acknowledgedAt && c.workOrderCreatedAt &&
      new Date(c.acknowledgedAt) >= new Date(now - 30 * 24 * 60 * 60 * 1000)
    );
    const avgAckMs = ack30d.length
      ? ack30d.reduce((acc, c) => acc + (new Date(c.acknowledgedAt) - new Date(c.workOrderCreatedAt)), 0) / ack30d.length
      : 0;
    const avgAckLabel = avgAckMs ? fmtRelative(avgAckMs) : "—";

    return {
      open:           open.length,
      newToday:       newToday.length,
      inProgress:     inProgress.length,
      awaitingParts:  awaitingParts.length,
      completedToday: completedToday.length,
      slaAtRisk:      slaAtRisk.length,
      avgAckLabel,
    };
  }, [cases]);

  return (
    <div className={`rounded-xl border border-white/8 bg-obsidianNight/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/8">
        <h3 className="text-xs sm:text-sm font-semibold text-white/85 truncate">Today at a glance</h3>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-widest text-white/40 whitespace-nowrap">
          Avg. ack {k.avgAckLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 divide-x divide-y divide-white/[0.06] bg-obsidianSurface/50">
        <Tile to="/admin/cases"      icon={BriefcaseIcon}            tone={{ bg: "bg-electricBlue/10", text: "text-electricBlue" }} label="Open cases"      value={k.open}           hint={`${k.newToday} new today`} />
        <Tile to="/admin/cases"      icon={InboxArrowDownIcon}       tone={{ bg: "bg-violet-400/10",   text: "text-violet-300"     }} label="New today"       value={k.newToday}        hint="From all channels" />
        <Tile to="/admin/workorders" icon={WrenchScrewdriverIcon}    tone={{ bg: "bg-amber-400/10",    text: "text-amber-300"      }} label="In progress"     value={k.inProgress}      hint="Engineers on site" />
        <Tile to="/admin/workorders" icon={ClockIcon}                tone={{ bg: "bg-orange-400/10",   text: "text-orange-300"     }} label="Awaiting parts"  value={k.awaitingParts}   hint="SLA extended" />
        <Tile to="/admin/workorders" icon={CheckCircleIcon}          tone={{ bg: "bg-emerald-400/10",  text: "text-emerald-300"    }} label="Completed today" value={k.completedToday}  hint="Closed-out jobs" />
        <Tile to="/admin/workorders" icon={ExclamationTriangleIcon}  tone={{ bg: "bg-red-400/10",      text: "text-red-300"        }} label="SLA at risk"     value={k.slaAtRisk}       hint={k.slaAtRisk > 0 ? "Action needed" : "All on track"} />
      </div>
    </div>
  );
}

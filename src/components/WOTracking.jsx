import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  WrenchScrewdriverIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const cancellationReasons = [
  "Requester cancelled",
  "Duplicate work order",
  "Work order created in error",
  "Other (please specify)",
];

const WO_STATUS_STYLES = {
  Dispatched:    { dot: "bg-electricBlue",  text: "text-electricBlue",  bg: "bg-electricBlue/10"  },
  "In Progress": { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10"     },
  Completed:     { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-400/10"   },
  Cancelled:     { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-400/10"       },
  Pending:       { dot: "bg-white/30",      text: "text-white/50",      bg: "bg-white/5"          },
};

const PRIORITY_STYLES = {
  Critical: "bg-electricBlue/15 text-electricBlue",
  High:     "bg-electricBlue/15 text-electricBlue",
  Medium:   "bg-electricBlue/15 text-electricBlue",
  Low:      "bg-electricBlue/15 text-electricBlue",
};

// SLA times in minutes
const SLA_MINUTES = {
  Critical: { respond: 30,       resolve: 24 * 60  },
  Urgent:   { respond: 45,       resolve: 36 * 60  },
  High:     { respond: 60,       resolve: 48 * 60  },
  Medium:   { respond: 4 * 60,   resolve: 72 * 60  },
  Low:      { respond: 8 * 60,   resolve: 96 * 60  },
};

/* ─── Helpers ─────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = WO_STATUS_STYLES[status] ?? WO_STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className="size-3.5 text-white/30 shrink-0" />
      <span className="text-[10px] text-white/30 uppercase tracking-wide w-24 shrink-0">{label}</span>
      <span className="text-xs text-white/70">{value ?? "—"}</span>
    </div>
  );
}

/* ─── SLA countdown helpers ───────────────────────────────────── */
const PARTS_EXT_MINUTES = {
  "days":     3  * 24 * 60,
  "1-2weeks": 14 * 24 * 60,
  "1month":   30 * 24 * 60,
  "2months+": 90 * 24 * 60,
};

function useNow(frozen = false, frozenAt = null) {
  const [now, setNow] = useState(() =>
    frozen && frozenAt ? new Date(frozenAt).getTime() : Date.now()
  );
  useEffect(() => {
    if (frozen) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [frozen]);
  return now;
}

function slaColor(remaining, limitMinutes, passed, failed) {
  if (passed)             return { text: "text-emerald-400", bg: "bg-emerald-400/10", bar: "bg-emerald-400" };
  if (failed)             return { text: "text-red-400",     bg: "bg-red-500/10",     bar: "bg-red-400"     };
  if (remaining === null) return { text: "text-white/40",    bg: "bg-white/5",        bar: "bg-white/20"    };
  if (remaining <= 0)     return { text: "text-red-400",     bg: "bg-red-500/10",     bar: "bg-red-400"     };
  const pct = remaining / (limitMinutes * 60_000);
  if (pct > 0.5)  return { text: "text-emerald-400", bg: "bg-emerald-400/10", bar: "bg-emerald-400" };
  if (pct > 0.25) return { text: "text-amber-400",   bg: "bg-amber-400/10",   bar: "bg-amber-400"   };
  return               { text: "text-red-400",     bg: "bg-red-400/10",     bar: "bg-red-400"     };
}

function formatCountdown(ms, frozen, passed, failed) {
  if (frozen && passed)  return "Met";
  if (frozen && failed)  return "Missed";
  if (frozen)            return "Stopped";
  if (ms <= 0)           return "OVERDUE";
  const totalMins = Math.floor(ms / 60_000);
  const days  = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const mins  = totalMins % 60;
  if (days > 0)  return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

/* ─── SLA row ─────────────────────────────────────────────────── */
function SlaRow({ label, createdAt, limitMinutes, icon: Icon, frozen = false, frozenAt = null, passed = false, failed = false }) {
  const now       = useNow(frozen, frozenAt);
  const remaining = createdAt && limitMinutes
    ? new Date(createdAt).getTime() + limitMinutes * 60_000 - now
    : null;
  const color     = slaColor(remaining, limitMinutes, passed, failed);
  const pct       = passed ? 1
    : failed || (remaining !== null && remaining <= 0) ? 1
    : remaining === null || limitMinutes === null ? 0
    : Math.max(0, Math.min(1, remaining / (limitMinutes * 60_000)));

  if (!createdAt || !limitMinutes) {
    return (
      <div className="flex flex-col gap-0.5 px-3 py-2 rounded-md bg-white/[0.03] border border-obsidianHighlight opacity-40">
        <div className="flex items-center gap-1.5">
          <Icon className="size-3 text-white/30" />
          <span className="text-[10px] uppercase tracking-wide text-white/30">{label}</span>
        </div>
        <span className="text-xs text-white/20 pl-[18px]">—</span>
      </div>
    );
  }

  const isOverdue = !frozen && remaining !== null && remaining <= 0;

  return (
    <div className={`flex flex-col gap-1.5 px-3 py-2 rounded-md border border-obsidianHighlight ${color.bg}`}>
      {/* Label + countdown / badge on one line */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={`size-3 ${color.text} shrink-0`} />
          <span className={`text-[10px] uppercase tracking-wide ${color.text} opacity-70 truncate`}>{label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {passed && (
            <span className="text-[9px] font-bold px-1.5 py-px rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Pass</span>
          )}
          {failed && (
            <span className="text-[9px] font-bold px-1.5 py-px rounded bg-red-500/15 text-red-400 border border-red-500/20">Fail</span>
          )}
          {isOverdue && !passed && !failed && (
            <span className="text-[9px] font-bold px-1.5 py-px rounded bg-red-500/15 text-red-400 border border-red-500/20">Overdue</span>
          )}
          <span className={`text-[10px] font-semibold tabular-nums ${(isOverdue && !passed && !failed) ? color.text : "text-white/50"}`}>
            {formatCountdown(remaining, frozen, passed, failed)}
          </span>
        </div>
      </div>

      {/* Progress bar — full when passed/failed, normal when live */}
      <div className="h-0.5 w-full rounded-full bg-white/10">
        <div
          className={`h-0.5 rounded-full transition-all duration-700 ${color.bar}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Cancellation section ────────────────────────────────────── */
function CancellationSection({ disabled, onCancel, requireNote = false, cancelLabel = "work order" }) {
  const [open, setOpen]           = useState(false);
  const [selected, setSelected]   = useState(null);
  const [otherText, setOtherText] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const isOther    = selected === "Other (please specify)";
  const canConfirm = selected && (!isOther || otherText.trim().length > 0) && (!requireNote || cancelNote.trim().length > 0);

  if (disabled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.03] border border-obsidianHighlight opacity-40">
        <NoSymbolIcon className="size-3.5 text-white/30 shrink-0" />
        <span className="text-xs text-white/30 italic">Cancellation unavailable — case converted</span>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20">
        <NoSymbolIcon className="size-3.5 text-red-400 shrink-0" />
        <span className="text-xs text-red-400 font-medium capitalize">{cancelLabel} cancelled</span>
      </div>
    );
  }

  const handleConfirm = () => {
    const reason = isOther ? otherText.trim() : selected;
    onCancel?.(reason, cancelNote.trim());
    setConfirmed(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-wide text-white/30 px-0.5">
        Cancel {cancelLabel}
      </p>

      {/* Mandatory cancellation note — only shown in work order context */}
      {requireNote && (
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/25 uppercase tracking-wider px-0.5">
            Note <span className="text-red-400 normal-case not-italic">*required</span>
          </span>
          <textarea
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder="Add a note explaining the cancellation…"
            rows={3}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-red-500/40 transition-colors leading-relaxed"
          />
        </div>
      )}

      {/* Reason dropdown */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] text-white/25 uppercase tracking-wider px-0.5">
          Reason <span className="text-red-400 normal-case not-italic">*required</span>
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 transition-colors focus:outline-none"
          >
            <span className={selected ? "text-white/80" : "text-white/30"}>
              {selected ?? "Select reason"}
            </span>
            <ChevronDownIcon className={`size-3.5 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <ul className="absolute z-20 mt-1 w-full rounded-md bg-obsidianElevated border border-obsidianHighlight shadow-xl overflow-hidden">
              {cancellationReasons.map((reason) => (
                <li key={reason}>
                  <button
                    type="button"
                    onClick={() => { setSelected(reason); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/10 ${
                      selected === reason ? "text-electricBlue bg-electricBlue/5" : "text-white/70"
                    }`}
                  >
                    {reason}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isOther && (
        <textarea
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          placeholder="Please specify the reason…"
          rows={2}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-electricBlue/50 transition-colors leading-relaxed"
        />
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!canConfirm}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          canConfirm
            ? "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25"
            : "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
        }`}
      >
        <NoSymbolIcon className="size-3.5 shrink-0" />
        Confirm Cancellation
      </button>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function WOTracking({ caseItem, className = "", onCancel, requireNote = false, showCancel = true, cancelLabel = "work order" }) {
  const woId          = caseItem?.workOrderNumber ?? caseItem?.workOrderId ?? null;
  const woStatus      = caseItem?.workOrderStatus ?? (woId ? "Dispatched" : "Pending");
  const assignedTo    = caseItem?.assignedTo ?? null;
  const scheduledDate = caseItem?.scheduledDate ?? null;
  const createdAt     = caseItem?.workOrderCreatedAt ?? caseItem?.dispatchedAt ?? caseItem?.createdAt ?? null;
  const priority      = caseItem?.priority ?? null;
  const createdBy     = caseItem?.createdBy ?? null;
  const isConverted   = caseItem?.case_status === "Converted";

  const sla = SLA_MINUTES[priority] ?? null;

  // ── SLA pass / fail + frozen-timer logic ──────────────────────
  const isTerminal      = ["Completed", "Cancelled"].includes(woStatus);
  const frozenAt        = caseItem?.completedAt ?? caseItem?.cancelledAt ?? null;

  const respondedAt     = caseItem?.respondedAt     ?? null;
  const finalResponseAt = caseItem?.finalResponseAt ?? null;
  const completedAt     = caseItem?.completedAt     ?? null;
  const goingThroughParts = !!caseItem?.awaitingPartsAt;

  const partsExpectedIn  = caseItem?.partsExpectedIn ?? null;
  const extMins          = PARTS_EXT_MINUTES[partsExpectedIn] ?? (72 * 60);

  // Base deadlines (no extension)
  const baseRespondDl = createdAt && sla
    ? new Date(new Date(createdAt).getTime() + sla.respond * 60_000)
    : null;
  const baseResolveDl = createdAt && sla
    ? new Date(new Date(createdAt).getTime() + sla.resolve * 60_000)
    : null;

  // Both deadlines are extended by the same parts-wait period when on the parts path
  const respondDl = goingThroughParts && baseRespondDl
    ? new Date(baseRespondDl.getTime() + extMins * 60_000)
    : baseRespondDl;
  const resolveDl = goingThroughParts && baseResolveDl
    ? new Date(baseResolveDl.getTime() + extMins * 60_000)
    : baseResolveDl;

  const respondCheckAt  = goingThroughParts ? finalResponseAt : respondedAt;
  const respondPassed   = !!(respondCheckAt && respondDl && new Date(respondCheckAt) <= respondDl);
  const respondFailed   = !!(respondCheckAt && respondDl && new Date(respondCheckAt) >  respondDl);
  const resolvePassed   = !!(completedAt && resolveDl && new Date(completedAt) <= resolveDl);
  const resolveFailed   = !!(completedAt && resolveDl && new Date(completedAt) >  resolveDl);

  return (
    <div className={`w-full px-4 py-3 rounded-lg bg-obsidianNight/40 flex flex-col gap-3 ${className}`}>

      {/* ── Header: "Work Order" title  ←→  WO Status badge ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WrenchScrewdriverIcon className="size-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white">Work Order</h2>
        </div>
        <StatusBadge status={woStatus} />
      </div>

      {/* ── WO ID + priority ── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-obsidianElevated border border-obsidianHighlight flex-wrap">
        {woId ? (
          <Link
            to={`/admin/workorders/${caseItem.id}`}
            className="text-sm font-bold tracking-wide text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
          >
            {woId}
          </Link>
        ) : (
          <span className="text-sm font-bold tracking-wide text-white/20">Not yet generated</span>
        )}
        {priority && (
          <>
            <div className="w-px h-4 bg-obsidianHighlight shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/30 uppercase tracking-wide">Priority</span>
              <span className={`text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${PRIORITY_STYLES[priority] ?? "bg-white/10 text-white/40"}`}>
                {priority}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Meta rows ── */}
      <div className="flex flex-col divide-y divide-obsidianHighlight px-1">
        <MetaRow icon={UserIcon}         label="Assigned to"  value={assignedTo}    />
        <MetaRow icon={CalendarDaysIcon} label="Scheduled"    value={scheduledDate} />
        <MetaRow icon={UserCircleIcon}   label="Created by"   value={createdBy}     />
      </div>

      {/* ── SLA Timers ── only once a work order has been generated */}
      {woId && (
        <div className="border-t border-obsidianHighlight pt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase tracking-wide text-white/25">SLA Timers</p>
            {isTerminal && (
              <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wide">
                {woStatus === "Completed" ? "⏹ Stopped — completed" : "⏹ Stopped — cancelled"}
              </span>
            )}
          </div>
          <SlaRow
            label={goingThroughParts ? "Final Response Failure Time" : "First Response Failure Time"}
            createdAt={createdAt}
            limitMinutes={respondDl && createdAt
              ? Math.round((respondDl.getTime() - new Date(createdAt).getTime()) / 60_000)
              : (sla?.respond ?? null)}
            icon={ClockIcon}
            frozen={isTerminal}
            frozenAt={frozenAt}
            passed={respondPassed}
            failed={respondFailed}
          />
          <SlaRow
            label={goingThroughParts ? "Resolved by Failure Time (Extended)" : "Resolved by Failure Time"}
            createdAt={createdAt}
            limitMinutes={resolveDl && createdAt
              ? Math.round((resolveDl.getTime() - new Date(createdAt).getTime()) / 60_000)
              : (sla?.resolve ?? null)}
            icon={ShieldExclamationIcon}
            frozen={isTerminal}
            frozenAt={frozenAt}
            passed={resolvePassed}
            failed={resolveFailed}
          />
        </div>
      )}

      {/* ── Cancellation — WO Manage only ── */}
      {showCancel && (
        <div className="border-t border-obsidianHighlight pt-2">
          <CancellationSection disabled={isConverted} onCancel={onCancel} requireNote={requireNote} cancelLabel={cancelLabel} />
        </div>
      )}

    </div>
  );
}

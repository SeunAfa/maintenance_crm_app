import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save, X, ExternalLink, RotateCw, Copy,
  Calendar, Clock, Wrench, Send, Lock, Eye, ChevronDown, ChevronRight,
  ActivitySquare, MessageSquare, FileText, ClipboardList, User,
  Mail, ArrowRightCircle, PlusCircle, History as HistoryIcon, StickyNote, FileCog,
  Phone, PhoneCall, PhoneOff, Search, Star, UserCheck, MapPin as MapPinIcon, Users,
  Minus, Maximize2, Minimize2, Check, PanelLeft,
} from "lucide-react";
import { useCases } from "../../context/CasesContext";
import { WORKERS_DATA, USERS_DATA, CURRENT_AGENT } from "../../data/usersData";
import { computeAffectedUsers } from "../../utils/locationUtils";
import ResizableDivider from "../../components/ResizableDivider";
import Breadcrumbs from "../../components/Breadcrumbs";
import Divider from "../../components/Divider";
import IconButton from "../../components/IconButton";
import BackButton from "../../components/BackButton";
import CaseTabsHeader from "../../components/CaseTabsHeader";
import SourceThreadPanel from "../../components/SourceThreadPanel";
import PhoneSourcePanel from "../../components/PhoneSourcePanel";
import WebPortalSourcePanel from "../../components/WebPortalSourcePanel";
import ServiceRequestDetails from "../../components/ServiceRequestDetails";
import ServiceCategoryPriority from "../../components/ServiceCategoryPriority";
import LocationForm from "../../components/LocationForm";
import VisibilityToggle from "../../components/VisibilityToggle";
import WOTracking from "../../components/WOTracking";
import RequesterRequestsSummary from "../../components/RequesterRequestsSummary";
import DuplicateTracker from "../../components/DuplicateTracker";
import RelinkCase from "../../components/RelinkCase";
import { buildLifecycleMessage, buildTrackingLink } from "../../utils/comms";

// ─── Constants ────────────────────────────────────────────────────────────────
const CASE_STATUS_ORDER_FULL = ["New", "In Review", "Qualify", "Action", "Converted"];

const CASE_STATUS_STYLE = {
  "New":       { dot: "bg-slate-400",   text: "text-slate-400",   bg: "bg-slate-400/10",   border: "border-slate-400/20"   },
  "In Review": { dot: "bg-sky-400",     text: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/20"     },
  "Qualify":   { dot: "bg-amber-400",   text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"   },
  "Action":    { dot: "bg-orange-400",  text: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/20"  },
  "Converted": { dot: "bg-violet-400",  text: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
  "Closed":    { dot: "bg-white/30",    text: "text-white/40",    bg: "bg-white/5",         border: "border-white/10"       },
  "Cancelled": { dot: "bg-red-400",     text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20"     },
};

const WO_STATUS_STYLE = {
  Dispatched:         { dot: "bg-electricBlue",  text: "text-electricBlue",  bg: "bg-electricBlue/10",  border: "border-electricBlue/20"  },
  Acknowledged:       { dot: "bg-purple-400",    text: "text-purple-400",    bg: "bg-purple-400/10",    border: "border-purple-400/20"    },
  "In Progress":      { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10",     border: "border-amber-400/20"     },
  Responded:          { dot: "bg-teal-400",       text: "text-teal-400",      bg: "bg-teal-400/10",      border: "border-teal-400/20"      },
  "Awaiting Parts":   { dot: "bg-orange-500",    text: "text-orange-400",    bg: "bg-orange-500/10",    border: "border-orange-500/20"    },
  "Final Response":   { dot: "bg-sky-400",       text: "text-sky-400",       bg: "bg-sky-400/10",       border: "border-sky-400/20"       },
  Completed:          { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-400/10",   border: "border-emerald-400/20"   },
  Cancelled:          { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-400/10",       border: "border-red-400/20"       },
};

// Parts hold extends the resolve SLA — duration varies by expected delivery timeframe
const PARTS_EXTENSION_MINUTES = 72 * 60; // default 72 h when no timeframe selected
const PARTS_EXTENSION = {
  "days":     3  * 24 * 60,  // a few days
  "1-2weeks": 14 * 24 * 60,  // 1–2 weeks
  "1month":   30 * 24 * 60,  // ~1 month
  "2months+": 90 * 24 * 60,  // >2 months — significant SLA impact
};


const PRIORITY_STYLE = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/25",
  Urgent:   "bg-orange-400/15 text-orange-400 border-orange-400/25",
  High:     "bg-electricBlue/15 text-electricBlue border-electricBlue/25",
  Medium:   "bg-amber-400/15 text-amber-400 border-amber-400/25",
  Low:      "bg-white/5 text-white/40 border-white/10",
};

const SLA_MINUTES = {
  Critical: { respond: 30,     resolve: 24 * 60 },
  Urgent:   { respond: 45,     resolve: 36 * 60 },
  High:     { respond: 60,     resolve: 48 * 60 },
  Medium:   { respond: 4 * 60, resolve: 72 * 60 },
  Low:      { respond: 8 * 60, resolve: 96 * 60 },
};

function woDotColor(status) {
  return status === "Completed"      ? "bg-emerald-400"
    : status === "Final Response"    ? "bg-sky-400"
    : status === "Awaiting Parts"    ? "bg-orange-400"
    : status === "Responded"         ? "bg-teal-400"
    : status === "In Progress"       ? "bg-amber-400"
    : status === "Acknowledged"      ? "bg-purple-400"
    : "bg-electricBlue";
}

const WO_TABS = [
  { id: "summary",  label: "Summary",     icon: FileText      },
  { id: "engineer", label: "Assignments", icon: Wrench        },
  { id: "history",  label: "History",     icon: HistoryIcon   },
  { id: "notes",    label: "Notes",       icon: MessageSquare },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}


function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function nowISO() {
  return new Date().toISOString();
}

// ─── WOStatusDropdown (sequential — no skipping, engineer gate) ──────────────
const WO_STATUS_ORDER = ["Dispatched", "Acknowledged", "In Progress", "Responded", "Awaiting Parts", "Final Response", "Completed"];

// Index of "Acknowledged" — engineer must be assigned before this point
const ENGINEER_REQUIRED_FROM = WO_STATUS_ORDER.indexOf("Acknowledged");

// Sequential transitions — no skipping allowed.
// "Responded" branches: if parts needed → Awaiting Parts → Final Response → Completed
//                       if no parts needed → Completed directly
const ALLOWED_NEXT = {
  Dispatched:        ["Acknowledged"],
  Acknowledged:      ["In Progress"],
  "In Progress":     ["Responded"],
  Responded:         ["Awaiting Parts", "Completed"],
  "Awaiting Parts":  ["Final Response"],
  "Final Response":  ["Completed"],
  Completed:         [],
};

function WOStatusDropdown({ status, pendingStatus, onChange, engineerAssigned }) {
  const [open, setOpen] = useState(false);
  // Display the pending status on the button if one is staged
  const displayStatus = pendingStatus ?? status;
  const ss            = WO_STATUS_STYLE[displayStatus] ?? WO_STATUS_STYLE.Dispatched;
  const currentIndex  = WO_STATUS_ORDER.indexOf(status);
  const allowedNext   = ALLOWED_NEXT[status] ?? [];
  // Entire dropdown locked once a pending status is staged — must Save first
  const pendingLocked = !!pendingStatus;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold border transition-colors",
          ss.bg, ss.text,
          pendingLocked ? "border-dashed border-2 " + ss.border : ss.border,
        ].join(" ")}
      >
        <span className={`size-1.5 rounded-full shrink-0 ${pendingLocked ? "animate-pulse" : ""} ${ss.dot}`} />
        {displayStatus}
        {pendingLocked && <span className="text-[9px] font-normal opacity-60 ml-0.5">· unsaved</span>}
        <ChevronDown className="size-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul className="absolute right-0 z-50 mt-1 w-64 rounded-lg border border-obsidianHighlight bg-obsidianElevated shadow-xl overflow-hidden">

            {/* Pending-save banner */}
            {pendingLocked && (
              <li className="px-3 py-2 bg-amber-400/5 border-b border-amber-400/20 flex items-center gap-2">
                <Save className="size-3 text-amber-400 shrink-0" />
                <p className="text-[10px] text-amber-400 leading-tight">
                  Save the record to confirm <span className="font-semibold">{pendingStatus}</span> before progressing.
                </p>
              </li>
            )}

            {WO_STATUS_ORDER.map((s, i) => {
              const st            = WO_STATUS_STYLE[s];
              const isCurrent     = s === status;
              const isPending     = s === pendingStatus;
              const isNext        = allowedNext.includes(s);
              const isPast        = i < currentIndex && !isNext;
              const needsEngineer = isNext && !engineerAssigned && i >= ENGINEER_REQUIRED_FROM;
              const isFutureSkip  = !isPast && !isCurrent && !isNext && !isPending;
              // Lock everything when pending — only the pending item is shown as selected
              const isDisabled    = pendingLocked || isPast || isFutureSkip || needsEngineer;

              const nextLabel = !isNext ? null
                : s === "Awaiting Parts" ? "Parts hold"
                : s === "Final Response" ? "Close out"
                : s === "Completed"      ? "Complete"
                : "Next";

              let trailingLabel = null;
              if (isPending)        trailingLabel = <span className="ml-auto text-[9px] text-amber-400 font-semibold animate-pulse">Pending save</span>;
              else if (isPast)      trailingLabel = <span className="ml-auto text-[9px] opacity-35">Past</span>;
              else if (isCurrent)   trailingLabel = <span className="ml-auto text-[9px] opacity-50 font-semibold uppercase tracking-wide">Current</span>;
              else if (needsEngineer) trailingLabel = (
                <span className="ml-auto flex items-center gap-1 text-[9px] text-amber-400/70">
                  <Lock className="size-2.5" /> Engineer first
                </span>
              );
              else if (isFutureSkip) trailingLabel = (
                <span className="ml-auto flex items-center gap-1 text-[9px] text-white/20">
                  <Lock className="size-2.5" />
                </span>
              );
              else if (isNext) trailingLabel = (
                <span className={`ml-auto text-[9px] font-medium ${st.text} opacity-60`}>{nextLabel}</span>
              );

              return (
                <li key={s}>
                  <button
                    type="button"
                    disabled={isDisabled}
                    title={
                      pendingLocked    ? "Save to confirm current status change first"
                      : needsEngineer  ? "Assign an engineer in the Assignment tab first"
                      : isFutureSkip   ? `Complete "${ALLOWED_NEXT[status]?.[0] ?? "current step"}" first`
                      : undefined
                    }
                    onClick={() => { if (!isDisabled) { onChange(s); setOpen(false); } }}
                    className={[
                      "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                      isPending
                        ? `${st.text} bg-amber-400/5 border-l-2 border-amber-400`
                        : isPast || isFutureSkip || pendingLocked
                          ? "opacity-25 cursor-not-allowed text-white/20"
                          : needsEngineer
                            ? "opacity-50 cursor-not-allowed text-white/30"
                            : isCurrent
                              ? `${st.text} bg-white/5`
                              : `${st.text} hover:${st.bg}`,
                    ].join(" ")}
                  >
                    <span className={`size-1.5 rounded-full shrink-0 ${isDisabled && !isPending ? "bg-white/15" : st.dot}`} />
                    {s}
                    {trailingLabel}
                  </button>
                </li>
              );
            })}

            {/* Footer hint */}
            {!pendingLocked && (!engineerAssigned || allowedNext.length === 0) && (
              <li className="px-3 py-2 border-t border-obsidianHighlight">
                {!engineerAssigned ? (
                  <p className="text-[10px] text-amber-400/70 leading-relaxed">
                    Go to the <span className="font-semibold">Assignment</span> tab to assign an engineer before progressing.
                  </p>
                ) : (
                  <p className="text-[10px] text-white/25 leading-relaxed">
                    This work order is complete. No further progression available.
                  </p>
                )}
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── WOToolbar ────────────────────────────────────────────────────────────────
function WOToolbar({ woNumber, woStatus, pendingStatus, engineerAssigned, onStatusChange, onSave, navigate, showSource, onToggleSource }) {
  return (
    <header className="px-3 py-2 w-full rounded-lg bg-obsidianNight/40 shrink-0">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <BackButton onClick={() => navigate(-1)} />
          <Divider />
          <Breadcrumbs pages={[
            { name: "Work Orders", href: "/admin/workorders" },
            { name: woNumber ?? "WO" },
          ]} />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Pending status banner — save required to confirm */}
          {pendingStatus && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 border-dashed px-2 py-1 rounded-md">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              Status pending: <span className="font-bold">{pendingStatus}</span> — save to confirm
            </span>
          )}
          {/* Engineer warning — only show if no pending banner already */}
          {!pendingStatus && !engineerAssigned && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-md">
              <Lock className="size-2.5" /> Assign engineer to progress
            </span>
          )}
          {/* Source panel toggle */}
          <IconButton
            title={showSource ? "Hide source panel" : "Show source panel"}
            onClick={onToggleSource}
            className={showSource ? "text-electricBlue" : ""}
          >
            <PanelLeft className="h-4 w-4" />
          </IconButton>
          {/* Secondary icon actions hidden below md */}
          <div className="hidden md:flex items-center gap-1.5">
            <IconButton title="Refresh"><RotateCw className="h-4 w-4" /></IconButton>
            <IconButton title="Copy"><Copy className="h-4 w-4" /></IconButton>
            <IconButton title="Open in new tab"><ExternalLink className="h-4 w-4" /></IconButton>
          </div>
          <IconButton title="Close" onClick={() => navigate(-1)} danger>
            <X className="h-4 w-4" />
          </IconButton>

          <Divider className="hidden md:block" />

          <WOStatusDropdown
            status={woStatus}
            pendingStatus={pendingStatus}
            onChange={onStatusChange}
            engineerAssigned={engineerAssigned}
          />

          <button
            onClick={onSave}
            className={[
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors",
              pendingStatus
                ? "bg-amber-500 hover:bg-amber-400 text-white ring-2 ring-amber-400/40"
                : "bg-obsidianHighlight hover:bg-white/10 text-white/70",
            ].join(" ")}
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{pendingStatus ? "Save & Confirm" : "Save"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── BlurBlock (shimmer placeholder, same as CasePgHeader) ───────────────────
function BlurBlock({ value }) {
  if (value) return <span className="text-xs text-white/80 text-left">{value}</span>;
  return (
    <span
      className="inline-block w-16 h-2.5 rounded-full"
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s infinite linear",
      }}
    />
  );
}

function computeDeadline(createdAtISO, minutes) {
  if (!createdAtISO || !minutes) return null;
  return new Date(new Date(createdAtISO).getTime() + minutes * 60_000);
}

/* ─── Shift handoff helpers ──────────────────────────────────────────────────── */
function getShiftEndToday(shift) {
  if (!shift?.hours || !shift?.days) return null;
  const now    = new Date();
  const isoDay = now.getDay() === 0 ? 7 : now.getDay();
  if (!shift.days.includes(isoDay)) return null;
  const [, endStr] = shift.hours.split("–");
  if (!endStr) return null;
  const [eh, em] = endStr.trim().split(":").map(Number);
  if (isNaN(eh)) return null;
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  return end;
}

function getNextShiftWorker(currentLeadId, categoryId, campus) {
  // Prefer engineers already on shift; fall back to anyone with matching skills/campus
  return (
    WORKERS_DATA.find((w) => {
      if (w.id === currentLeadId) return false;
      if (categoryId && !w.skills?.includes(categoryId)) return false;
      if (campus && !w.campuses?.includes(campus)) return false;
      return isShiftActive(w.shift);
    }) ??
    WORKERS_DATA.find((w) => {
      if (w.id === currentLeadId) return false;
      if (categoryId && !w.skills?.includes(categoryId)) return false;
      if (campus && !w.campuses?.includes(campus)) return false;
      return true;
    }) ??
    null
  );
}

/* Banner shown when SLA will breach before/during end of lead engineer's shift */
function ShiftHandoffBanner({ woFields, caseItem, resolveDl, onHandoff }) {
  const leadId   = woFields.assignedToId ?? woFields.assignedEngineers?.find((e) => e.isLead)?.id;
  const lead     = WORKERS_DATA.find((w) => w.id === leadId);
  if (!lead || !resolveDl) return null;

  const shiftEnd = getShiftEndToday(lead.shift);
  if (!shiftEnd) return null; // lead not on shift today

  const now          = new Date();
  const msToShiftEnd = shiftEnd - now;
  const msToSla      = resolveDl - now;

  // Show banner when:
  // - shift ends within 2 hours AND SLA hasn't been met AND SLA breach is near or before shift end
  const WARN_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours
  const shiftEndingSoon = msToShiftEnd > 0 && msToShiftEnd < WARN_THRESHOLD;
  const slaAtRisk       = msToSla > 0 && msToSla < msToShiftEnd + 60 * 60 * 1000; // within 1h after shift end

  if (!shiftEndingSoon || !slaAtRisk) return null;

  const categoryId  = getCategoryGroupId(caseItem?.ServiceCategory);
  const campus      = caseItem?.location?.campus;
  const nextWorker  = getNextShiftWorker(leadId, categoryId, campus);

  const shiftEndFmt = `${String(shiftEnd.getHours()).padStart(2, "0")}:${String(shiftEnd.getMinutes()).padStart(2, "0")}`;
  const minsLeft    = Math.ceil(msToShiftEnd / 60_000);

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-orange-500/8 border border-orange-500/25">
      <div className="size-7 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <Clock className="size-3.5 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-orange-300">Shift ending — SLA at risk</p>
        <p className="text-[10px] text-white/45 mt-0.5 leading-relaxed">
          <span className="text-white/60 font-medium">{lead.displayName}</span>'s shift ends at{" "}
          <span className="text-orange-300 font-medium">{shiftEndFmt}</span> ({minsLeft}m). The SLA resolve deadline falls
          near or after their shift end.
        </p>
        {nextWorker ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-white/35">Next available:</span>
            <span className="text-[10px] font-medium text-white/70">{nextWorker.displayName}</span>
            <span className="text-[9px] text-white/30">· {nextWorker.shift?.label}</span>
            <button
              type="button"
              onClick={() => onHandoff?.(nextWorker)}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-medium hover:bg-orange-500/25 transition-colors"
            >
              <ArrowRightCircle className="size-3" />
              Hand off job
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-white/30 mt-1.5 italic">No available engineer found for handoff.</p>
        )}
      </div>
    </div>
  );
}

function fmtDeadlineFull(date) {
  if (!date) return null;
  const now     = new Date();
  const today   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d       = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isToday = d.getTime() === today.getTime();
  const hh      = String(date.getHours()).padStart(2, "0");
  const mm      = String(date.getMinutes()).padStart(2, "0");
  const time    = `${hh}:${mm}`;
  if (isToday) return `${time} Today`;
  const dd   = String(date.getDate()).padStart(2, "0");
  const mo   = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${time} ${dd}/${mo}/${yyyy}`;
}

function useSlaDeadlines(caseItem, woStatus, partsExpectedIn) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const sla            = SLA_MINUTES[caseItem?.priority] ?? null;
  // Fall back through available timestamps — workOrderCreatedAt is the canonical one,
  // dispatchedAt is always stamped at dispatch, createdAt is the case creation date.
  const createdAt      = caseItem?.workOrderCreatedAt
    ?? caseItem?.dispatchedAt
    ?? caseItem?.createdAt
    ?? null;
  const awaitingParts  = woStatus === "Awaiting Parts";
  // True once WO has entered (or is currently on) the parts path
  const goingThroughParts = awaitingParts || !!caseItem?.awaitingPartsAt;

  const baseRespondDl = computeDeadline(createdAt, sla?.respond);
  const baseResolveDl = computeDeadline(createdAt, sla?.resolve);

  // When the WO has gone through the parts path, BOTH deadlines are extended by the
  // same parts-wait period — "Final response" can only happen once parts arrive.
  const extensionMins = PARTS_EXTENSION[partsExpectedIn] ?? PARTS_EXTENSION_MINUTES;
  const respondDl = goingThroughParts && baseRespondDl
    ? new Date(baseRespondDl.getTime() + extensionMins * 60_000)
    : baseRespondDl;
  const resolveDl = goingThroughParts && baseResolveDl
    ? new Date(baseResolveDl.getTime() + extensionMins * 60_000)
    : baseResolveDl;

  // Timestamps used for pass / fail evaluation
  const respondedAt     = caseItem?.respondedAt     ?? null;
  const finalResponseAt = caseItem?.finalResponseAt ?? null;
  const completedAt     = caseItem?.completedAt     ?? null;

  // For the respond SLA: when going through parts the "Final Response" milestone is the target
  const respondCheckAt = goingThroughParts ? finalResponseAt : respondedAt;

  // Pass  → milestone was recorded AND it was before (or at) the (extended) deadline
  // Fail  → milestone was recorded AND it was after the (extended) deadline
  // Overdue → (extended) deadline has passed but milestone not recorded yet
  const respondPassed  = !!(respondCheckAt && respondDl && new Date(respondCheckAt) <= respondDl);
  const respondFailed  = !!(respondCheckAt && respondDl && new Date(respondCheckAt) >  respondDl);
  const respondOverdue = !respondCheckAt && respondDl ? now > respondDl.getTime() : false;

  const resolvePassed  = !!(completedAt && resolveDl && new Date(completedAt) <= resolveDl);
  const resolveFailed  = !!(completedAt && resolveDl && new Date(completedAt) >  resolveDl);
  const resolveOverdue = !completedAt
    ? (resolveDl ? now > resolveDl.getTime() : false)
    : false;

  return {
    respondBy:      fmtDeadlineFull(respondDl),
    resolveBy:      fmtDeadlineFull(resolveDl),
    respondDl,
    resolveDl,
    respondOverdue,
    respondPassed,
    respondFailed,
    resolveOverdue,
    resolvePassed,
    resolveFailed,
    awaitingParts,
    goingThroughParts,
    extensionMins,
  };
}

// ─── WOHeader (matches CasePgHeader layout, no progress bar) ─────────────────
function WOHeader({ caseItem, woStatus, partsExpectedIn, activeTab, onTabChange }) {
  const {
    respondBy, resolveBy,
    respondOverdue, respondPassed, respondFailed,
    resolveOverdue, resolvePassed, resolveFailed,
    goingThroughParts,
  } = useSlaDeadlines(caseItem, woStatus, partsExpectedIn);

  // When the WO has gone through the parts path, the respond SLA is fulfilled by
  // "Final Response" — so relabel accordingly
  const respondLabel = goingThroughParts
    ? "Final response failure time"
    : "First response failure time";

  return (
    <div className="px-3 py-2 flex flex-col gap-2 w-full rounded-lg bg-obsidianNight/40">
      {/* Title & metadata — same structure as CasePgHeader */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-white text-lg sm:text-xl lg:text-2xl truncate max-w-full lg:max-w-xs">
          {caseItem?.title || caseItem?.workOrderNumber || "Work Order"}
        </h1>

        <div className="flex flex-row flex-wrap items-center gap-4">
          {/* First / Final Response Failure Time */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <BlurBlock value={respondBy} />
              {respondPassed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                  Pass
                </span>
              )}
              {respondFailed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                  Fail
                </span>
              )}
              {respondOverdue && !respondPassed && !respondFailed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                  Overdue
                </span>
              )}
              {goingThroughParts && !respondPassed && !respondFailed && !respondOverdue && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/25 uppercase tracking-wide">
                  Extended
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 text-left">{respondLabel}</p>
          </div>
          <Divider className="h-8" />

          {/* Resolved By Failure Time */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <BlurBlock value={resolveBy} />
              {resolvePassed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                  Pass
                </span>
              )}
              {resolveFailed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                  Fail
                </span>
              )}
              {resolveOverdue && !resolvePassed && !resolveFailed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                  Overdue
                </span>
              )}
              {goingThroughParts && !resolvePassed && !resolveFailed && !resolveOverdue && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/25 uppercase tracking-wide">
                  Extended
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 text-left">Resolved by failure time</p>
          </div>
          <Divider className="h-8" />

          <div className="flex flex-col gap-1">
            <BlurBlock value={caseItem?.workOrderNumber} />
            <p className="text-xs text-white/40 text-left">Work Order</p>
          </div>
          <Divider className="h-8" />

          <div className="flex flex-col gap-1">
            <BlurBlock value={fmtDate(caseItem?.updatedAt ?? caseItem?.workOrderCreatedAt)} />
            <p className="text-xs text-white/40 text-left">Last Update</p>
          </div>
          <Divider className="h-8" />

          <div className="flex flex-col gap-1">
            <BlurBlock value={caseItem?.createdBy} />
            <p className="text-xs text-white/40 text-left">Created by</p>
          </div>
        </div>
      </div>

      {/* Tabs row */}
      <div className="flex flex-row items-center justify-between overflow-x-auto lg:overflow-visible -mx-1 px-1 lg:mx-0 lg:px-0">
        <nav className="-mb-px flex space-x-2">
          {WO_TABS.map(({ id, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={[
                  "border-b-1 px-1 py-1 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "border-electricBlue font-bold text-electricBlue"
                    : "border-transparent text-white/60 hover:border-white/60 hover:text-white/60",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center gap-2 pb-0.5 border-b border-obsidianHighlight">
        {Icon && <Icon className="size-3.5 text-white/40" />}
        <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── WOTimeline ───────────────────────────────────────────────────────────────
function SlaDeadlineRow({ label, dl, overdue, extended, passed, failed }) {
  if (!dl) return null;
  const txt = fmtDeadlineFull(dl);
  const textColor = passed ? "text-emerald-400" : (failed || overdue) ? "text-red-400" : "text-white/50";
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1">
      <span className="text-[9px] text-white/25 uppercase tracking-wider w-full">{label}</span>
      <span className={`text-[11px] font-medium ${textColor}`}>{txt}</span>
      {passed   && <span className="text-[9px] font-bold px-1.5 py-px rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Pass</span>}
      {failed   && <span className="text-[9px] font-bold px-1.5 py-px rounded bg-red-500/15 text-red-400 border border-red-500/20">Fail</span>}
      {overdue  && !passed && !failed && <span className="text-[9px] font-bold px-1.5 py-px rounded bg-red-500/15 text-red-400 border border-red-500/20">Overdue</span>}
      {extended && !passed && !failed && !overdue && <span className="text-[9px] font-bold px-1.5 py-px rounded bg-orange-500/15 text-orange-400 border border-orange-500/20">Extended</span>}
    </div>
  );
}

const PARTS_LABEL = {
  "days":     "A few days",
  "1-2weeks": "1–2 weeks",
  "1month":   "Around 1 month",
  "2months+": "More than 2 months",
};

const PARTS_OPTIONS = [
  { value: "days",     label: "A few days",        extDays: 3  },
  { value: "1-2weeks", label: "1–2 weeks",          extDays: 14 },
  { value: "1month",   label: "Around 1 month",     extDays: 30 },
  { value: "2months+", label: "More than 2 months", extDays: 90 },
];

// Custom styled dropdown matching the app's obsidian design system
function PartsTimeframeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = PARTS_OPTIONS.find((o) => o.value === value) ?? null;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/70 hover:bg-white/[0.08] transition-colors focus:outline-none focus:border-electricBlue/40"
      >
        <span className={selected ? "text-white/80" : "text-white/30"}>
          {selected?.label ?? "Select timeframe…"}
        </span>
        <ChevronDown className={`size-3.5 text-white/40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul className="absolute z-50 mt-1 w-full rounded-md bg-obsidianElevated border border-obsidianHighlight shadow-xl overflow-hidden">
            {PARTS_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-left transition-colors hover:bg-white/[0.07] ${
                    value === opt.value ? "text-electricBlue bg-electricBlue/5" : "text-white/70"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[9px] text-white/30 shrink-0">+{opt.extDays}d SLA</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Parts Delivery Modal ─────────────────────────────────────────────────────
// Shown right after "Awaiting Parts" is saved. Locked — cannot be dismissed
// without selecting a delivery timeframe. Once confirmed the value is persisted.
function PartsDeliveryModal({ caseItem, onConfirm }) {
  const [selected, setSelected] = useState("");

  const sla     = SLA_MINUTES[caseItem?.priority] ?? null;
  const created = caseItem?.workOrderCreatedAt ?? caseItem?.dispatchedAt ?? caseItem?.createdAt ?? null;

  const extMins      = PARTS_EXTENSION[selected] ?? null;
  const baseRespondDl = computeDeadline(created, sla?.respond);
  const baseResolveDl = computeDeadline(created, sla?.resolve);
  const previewRespond = selected && baseRespondDl
    ? fmtDeadlineFull(new Date(baseRespondDl.getTime() + extMins * 60_000))
    : null;
  const previewResolve = selected && baseResolveDl
    ? fmtDeadlineFull(new Date(baseResolveDl.getTime() + extMins * 60_000))
    : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop — not clickable (intentional lock) */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm mx-4 rounded-xl bg-obsidianElevated border border-obsidianHighlight shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-obsidianHighlight flex items-start gap-3">
          <span className="text-2xl mt-0.5">⏱</span>
          <div>
            <h2 className="text-sm font-semibold text-white">Parts On Order — Delivery Timeframe Required</h2>
            <p className="text-[11px] text-white/45 mt-1 leading-relaxed">
              Select an expected delivery timeframe to extend the SLA deadlines correctly.
              This cannot be skipped.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">
              Expected delivery timeframe
            </label>
            <PartsTimeframeDropdown value={selected} onChange={setSelected} />
          </div>

          {/* Live deadline preview once a timeframe is picked */}
          {selected && (
            <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-orange-500/8 border border-orange-500/20">
              <p className="text-[9px] font-semibold text-orange-400/70 uppercase tracking-wider">Updated SLA deadlines</p>
              {previewRespond && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Final response by</span>
                  <span className="text-[10px] font-semibold text-orange-300">{previewRespond}</span>
                </div>
              )}
              {previewResolve && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Resolved by</span>
                  <span className="text-[10px] font-semibold text-orange-300">{previewResolve}</span>
                </div>
              )}
            </div>
          )}

          {!selected && (
            <p className="text-[10px] text-white/25 text-center italic">
              Select a timeframe above to see updated deadlines
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            type="button"
            disabled={!selected}
            onClick={() => onConfirm(selected)}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              selected
                ? "bg-electricBlue text-white hover:bg-electricBlue/85"
                : "bg-obsidianHighlight text-white/20 cursor-not-allowed"
            }`}
          >
            {selected ? "Confirm & Apply Timeframe" : "Select a timeframe to continue"}
            {selected && <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function WOTimeline({ caseItem, woFields, onWoChange }) {
  const {
    respondDl, resolveDl,
    respondOverdue, respondPassed, respondFailed,
    resolveOverdue, resolvePassed, resolveFailed,
    awaitingParts, goingThroughParts, extensionMins,
  } = useSlaDeadlines(caseItem, woFields.workOrderStatus, woFields.partsExpectedIn);

  const currentIdx = WO_STATUS_ORDER.indexOf(woFields.workOrderStatus);

  // Extension label for the Awaiting Parts card
  const extLabel = woFields.partsExpectedIn === "2months+"
    ? "Significant delay — resolve SLA extended by 90 days"
    : woFields.partsExpectedIn
      ? `Resolve SLA extended by ${extensionMins >= 1440
          ? `${Math.round(extensionMins / 1440)} day${Math.round(extensionMins / 1440) > 1 ? "s" : ""}`
          : `${extensionMins / 60}h`}`
      : null;

  // All seven WO statuses — every one records a timestamp
  const milestones = [
    {
      status:  "Dispatched",
      label:   "Dispatched",
      ts:      woFields.dispatchedAt ?? caseItem?.workOrderCreatedAt ?? null,
      always:  true,
    },
    {
      status:  "Acknowledged",
      label:   "Acknowledged",
      ts:      woFields.acknowledgedAt,
    },
    {
      status:  "In Progress",
      label:   "In Progress",
      ts:      woFields.inProgressAt,
    },
    {
      status:  "Responded",
      label:   "Responded",
      ts:      woFields.respondedAt,
      // Only show first-response SLA here when NOT going through the parts path
      slaAfter: !goingThroughParts ? (
        <SlaDeadlineRow
          label="First response failure time"
          dl={respondDl}
          overdue={respondOverdue}
          passed={respondPassed}
          failed={respondFailed}
        />
      ) : null,
    },
    {
      status:     "Awaiting Parts",
      label:      "Awaiting Parts",
      tsRequired: true,
      ts:         woFields.awaitingPartsAt,
      extra: (
        <div className="mt-2 flex flex-col gap-2">
          {/* SLA extension notice */}
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-orange-500/8 border border-orange-500/20">
            <span className="text-orange-400 text-[10px] mt-px shrink-0">⏱</span>
            <p className="text-[10px] text-orange-300/80 leading-snug">
              SLA timers are being extended while parts are on order.
              The <span className="font-semibold">resolve deadline</span> will update once a delivery timeframe is selected.
            </p>
          </div>

          {/* Delivery timeframe picker */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-white/30 uppercase tracking-wider">Expected delivery</label>
            <PartsTimeframeDropdown
              value={woFields.partsExpectedIn ?? ""}
              onChange={(val) => onWoChange("partsExpectedIn", val)}
            />
          </div>

          {/* Extension summary text */}
          {extLabel && (
            <p className={`text-[10px] ${woFields.partsExpectedIn === "2months+" ? "text-orange-400/80" : "text-white/35"}`}>
              {extLabel}
            </p>
          )}

          {/* Both SLA deadlines — visible here while WO is on the parts path */}
          <SlaDeadlineRow
            label="Final response failure time"
            dl={respondDl}
            overdue={respondOverdue}
            extended={true}
            passed={respondPassed}
            failed={respondFailed}
          />
          <SlaDeadlineRow
            label="Resolved by failure time (extended)"
            dl={resolveDl}
            overdue={resolveOverdue}
            extended={!!woFields.partsExpectedIn}
            passed={resolvePassed}
            failed={resolveFailed}
          />
        </div>
      ),
    },
    {
      status:     "Final Response",
      label:      "Final Response",
      tsRequired: true,
      ts:         woFields.finalResponseAt,
      slaAfter: (
        <SlaDeadlineRow
          label="Final response failure time"
          dl={respondDl}
          overdue={respondOverdue}
          passed={respondPassed}
          failed={respondFailed}
        />
      ),
    },
    {
      status:  "Completed",
      label:   "Completed",
      ts:      woFields.completedAt,
      slaAfter: (
        <SlaDeadlineRow
          label="Resolved by failure time"
          dl={resolveDl}
          overdue={resolveOverdue}
          passed={resolvePassed}
          failed={resolveFailed}
        />
      ),
    },
  ];

  return (
    <SectionCard title="Work Order Timeline" icon={ActivitySquare}>
      <div className="flex flex-col">
        {milestones.map((m, i) => {
          const statusIdx = WO_STATUS_ORDER.indexOf(m.status);
          const reached   = m.always || currentIdx >= statusIdx;
          const isCurrent = woFields.workOrderStatus === m.status;
          // "Awaiting Parts" and "Final Response" only appear when explicitly recorded
          if (!reached) return null;
          if (m.tsRequired && !m.ts) return null;

          const isLast = i === milestones.length - 1;

          return (
            <div key={m.status} className="flex gap-3">
              {/* Spine */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 12 }}>
                <div className={`size-2.5 rounded-full mt-0.5 ring-2 ring-offset-1 ring-offset-obsidianSurface shrink-0 ${
                  isCurrent
                    ? `${woDotColor(m.status)} ring-current/30`
                    : reached
                      ? `${woDotColor(m.status)} ring-transparent`
                      : "bg-white/15 ring-transparent"
                }`} style={isCurrent ? { boxShadow: "0 0 6px 1px currentColor" } : {}} />
                {!isLast && <div className="w-px flex-1 bg-white/[0.07] my-1" />}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 min-w-0 ${isLast ? "" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[12px] font-semibold ${isCurrent ? "text-white" : "text-white/60"}`}>
                    {m.label}
                  </span>
                  {isCurrent && (
                    <span className={`text-[9px] font-bold px-1.5 py-px rounded-full border uppercase tracking-wide ${WO_STATUS_STYLE[m.status]?.text ?? "text-white/40"} ${WO_STATUS_STYLE[m.status]?.bg ?? ""} ${WO_STATUS_STYLE[m.status]?.border ?? ""}`}>
                      Current
                    </span>
                  )}
                </div>
                {m.ts ? (
                  <p className="text-[10px] text-white/35 mt-0.5">{fmtDateTime(m.ts)}</p>
                ) : reached && m.status !== "Dispatched" ? (
                  <p className="text-[10px] text-white/20 italic mt-0.5">Time not recorded</p>
                ) : null}
                {m.slaAfter && reached && m.slaAfter}
                {m.extra    && reached && m.extra}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─── Tab: Summary (same layout as CaseDetailsPanel minus CasePgHeader) ────────
function SummaryTab({ caseItem, fields, setFields, onCancelCase, cases, updateCase, woFields, onWoChange }) {
  const isWOCancelled = woFields?.workOrderStatus === "Cancelled";
  const linkedCase = caseItem?.linkedCaseId
    ? cases.find((c) => c.id === caseItem.linkedCaseId) ?? null
    : null;

  const sharedUsers = useMemo(() => {
    if (!fields?.sharedIssue) return [];
    return computeAffectedUsers(
      fields,
      USERS_DATA,
      fields?.requesterEmail ?? caseItem?.requester?.email
    );
  }, [
    fields?.sharedIssue,
    fields?.building,
    fields?.block,
    fields?.floor,
    fields?.flat,
    fields?.requesterEmail,
  ]);

  const handleLink = (dupCase) => {
    updateCase(caseItem.id, { linkedCaseId: dupCase.id, case_status: "Closed" });
    setFields((prev) => ({ ...prev, case_status: "Closed" }));
  };

  const handleUnlink = () => {
    updateCase(caseItem.id, { linkedCaseId: null, case_status: "In Review" });
    setFields((prev) => ({ ...prev, case_status: "In Review" }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 w-full">
      {/* Left column — self-start prevents it from stretching to match the right column */}
      <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:self-start">
        <ServiceRequestDetails caseItem={caseItem} fields={fields} setFields={setFields} woMode={!isWOCancelled} isLocked={isWOCancelled} />
        <ServiceCategoryPriority caseItem={caseItem} fields={fields} setFields={setFields} lockStatus={true} isLocked={isWOCancelled} lockCategory={isWOCancelled} woMode={true} />
        <LocationForm caseItem={caseItem} fields={fields} setFields={setFields} isLocked={isWOCancelled} woMode={true} />
        <VisibilityToggle
          defaultValue={caseItem.sharedIssue}
          value={fields?.sharedIssue}
          onChange={(val) => setFields?.((prev) => ({ ...prev, sharedIssue: val }))}
          sharedUsers={sharedUsers}
          location={fields}
          disabled={isWOCancelled}
        />
      </div>

      {/* Right column */}
      <div className="w-full lg:w-1/2 flex flex-col gap-2">
        <WOTracking caseItem={caseItem} onCancel={onCancelCase} requireNote={true} />
        <WOTimeline caseItem={caseItem} woFields={woFields} onWoChange={onWoChange} />
        <RequesterRequestsSummary caseItem={caseItem} />
        {linkedCase ? (
          <RelinkCase linkedCase={linkedCase} onUnlink={handleUnlink} />
        ) : (
          <DuplicateTracker caseItem={caseItem} fields={fields} onLink={handleLink} />
        )}
      </div>
    </div>
  );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────
function fmtAge(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtClock(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function buildHistoryEntries(caseItem, log, messages, woStatus) {
  const items = [];

  const startMs     = new Date(caseItem?.createdAt   ?? Date.now()).getTime();
  const convertedMs = caseItem?.workOrderCreatedAt
    ? new Date(caseItem.workOrderCreatedAt).getTime()
    : null;

  // Helper: spread a step proportionally between two timestamps
  const spreadMs = (idx, total, fromMs, toMs) =>
    fromMs + ((toMs - fromMs) * (idx + 1)) / (total + 1);

  // ── PHASE 1 · Initial inbound email (arrives before the case is created) ───────
  const firstInbound = (messages ?? []).find((m) => m.from === "tenant");
  if (firstInbound) {
    const body = (firstInbound.text ?? firstInbound.body ?? "").replace(/\n/g, " ").trim();
    items.push({
      id:        "first-email",
      kind:      "email",
      inbound:   true,
      Icon:      Mail,
      avatarCls: "bg-electricBlue/15 text-electricBlue",
      text:      firstInbound.subject ?? "Initial email from requester",
      detail:    body.length > 140 ? body.slice(0, 140) + "…" : body || null,
      author:    caseItem?.requester?.displayName ?? "Requester",
      iso:       new Date(startMs - 10 * 60_000).toISOString(), // 10 min before case creation
      time:      firstInbound.time ?? null,
      tag:       "Inbound",
      tagCls:    "bg-electricBlue/10 text-electricBlue border-electricBlue/20",
      accentCls: "bg-electricBlue/40",
    });
  }

  // ── PHASE 2 · Case created → New ─────────────────────────────────────────────
  items.push({
    id:          "case-created",
    kind:        "case-status",
    Icon:        PlusCircle,
    avatarCls:   "bg-slate-400/15 text-slate-400",
    text:        `Case ${caseItem?.caseId ?? ""} opened`,
    statusLabel: "New",
    statusSty:   CASE_STATUS_STYLE["New"],
    author:      caseItem?.createdBy ?? "System",
    iso:         caseItem?.createdAt,
    time:        null,
  });

  // ── PHASE 3 · Case status steps: In Review → Qualify → Action  ───────────────
  // "Converted" is excluded here — it is represented by the dedicated Phase 5 entry.
  const AGENT_STEPS   = ["In Review", "Qualify", "Action"];
  const isConverted   = ["Converted", "Closed", "Cancelled"].includes(caseItem?.case_status);
  const caseStatusIdx = CASE_STATUS_ORDER_FULL.indexOf(caseItem?.case_status ?? "New");
  // Steps to show: up to current status, but never "Converted" (handled separately)
  const caseSteps     = isConverted
    ? AGENT_STEPS                                          // show all 3 pre-conversion steps
    : AGENT_STEPS.filter((s) =>
        CASE_STATUS_ORDER_FULL.indexOf(s) <= caseStatusIdx
      );

  // Always spread FORWARD from startMs — never go before createdAt
  // Use at least 1 min gap per step so order is stable even when timestamps are equal
  const rangeMs  = convertedMs ? Math.max(convertedMs - startMs, caseSteps.length * 60_000) : 4 * 24 * 60 * 60 * 1000;

  caseSteps.forEach((status, i) => {
    const offset = (rangeMs * (i + 1)) / (caseSteps.length + 1);
    items.push({
      id:          `case-status-${status}`,
      kind:        "case-status",
      Icon:        FileCog,
      avatarCls:   `${CASE_STATUS_STYLE[status]?.bg ?? "bg-white/5"} ${CASE_STATUS_STYLE[status]?.text ?? "text-white/40"}`,
      text:        `Case status changed to ${status}`,
      statusLabel: status,
      statusSty:   CASE_STATUS_STYLE[status] ?? null,
      author:      caseItem?.createdBy ?? "System",
      iso:         new Date(startMs + offset).toISOString(),
      time:        null,
    });
  });

  // ── PHASE 4 · Agent outbound emails (replies, WO confirmation) ────────────────
  (messages ?? []).forEach((msg, i) => {
    if (msg.from === "tenant" && i === 0) return; // already added as first-email
    const inbound    = msg.from === "tenant";
    const body       = (msg.text ?? msg.body ?? "").replace(/\n/g, " ").trim();
    const mentionsWO = /WO-|work order/i.test(body);
    // Position: WO-confirmation emails just after conversion; others between create and convert
    const msgMs = msg.date
      ? new Date(msg.date).getTime()
      : mentionsWO && convertedMs
        ? convertedMs + 5 * 60_000
        : startMs + (i + 1) * 30 * 60_000;

    items.push({
      id:        `msg-${i}`,
      kind:      "email",
      inbound,
      Icon:      Mail,
      avatarCls: inbound
        ? "bg-electricBlue/15 text-electricBlue"
        : "bg-emerald-500/15 text-emerald-400",
      text:      msg.subject ?? (inbound ? "Email from requester" : "Email sent"),
      detail:    body.length > 140 ? body.slice(0, 140) + "…" : body || null,
      author:    inbound
        ? (caseItem?.requester?.displayName ?? "Requester")
        : (caseItem?.createdBy ?? "Facility Team"),
      iso:       new Date(msgMs).toISOString(),
      time:      msg.time ?? null,
      tag:       inbound ? "Inbound" : "Outbound",
      tagCls:    inbound
        ? "bg-electricBlue/10 text-electricBlue border-electricBlue/20"
        : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      accentCls: inbound ? "bg-electricBlue/40" : "bg-emerald-400/40",
    });
  });

  // ── PHASE 5 · Case converted → WO raised ─────────────────────────────────────
  if (caseItem?.workOrderNumber && caseItem?.workOrderCreatedAt) {
    items.push({
      id:        "converted",
      kind:      "action",
      Icon:      ArrowRightCircle,
      avatarCls: "bg-violet-500/15 text-violet-400",
      text:      `Case converted — Work Order ${caseItem.workOrderNumber} raised`,
      detail:    null,
      author:    caseItem?.createdBy ?? "System",
      iso:       caseItem?.workOrderCreatedAt,
      time:      null,
      tag:       "Converted",
      tagCls:    "bg-violet-500/10 text-violet-400 border-violet-500/20",
    });

    // ── PHASE 6 · WO status progression (synthesise any missing steps) ──────────
    const currentWoStatus = woStatus ?? caseItem?.workOrderStatus ?? "Dispatched";
    const currentWoIdx    = WO_STATUS_ORDER.indexOf(currentWoStatus);
    const allSteps        = currentWoIdx >= 0 ? WO_STATUS_ORDER.slice(0, currentWoIdx + 1) : ["Dispatched"];

    // "Awaiting Parts" and "Final Response" are optional branches — only include
    // them if a timestamp was actually saved when the status was set.
    const woSteps = allSteps.filter((step) => {
      if (step === "Awaiting Parts") return !!caseItem?.awaitingPartsAt;
      if (step === "Final Response") return !!caseItem?.finalResponseAt;
      return true;
    });

    woSteps.forEach((step, i) => {
      const alreadyLogged = (log ?? []).some((e) =>
        e.text?.includes(`changed to ${step}`) ||
        (step === "Dispatched" && /dispatch/i.test(e.text ?? ""))
      );
      if (!alreadyLogged) {
        const sty    = WO_STATUS_STYLE[step] ?? WO_STATUS_STYLE.Dispatched;
        const baseMs = convertedMs ?? startMs;
        items.push({
          id:        `synth-wo-${step}`,
          kind:      "status",
          Icon:      ActivitySquare,
          avatarCls: "bg-white/5 text-white/35",
          dotColor:  sty.dot,
          text:      `Status changed to ${step}`,
          detail:    null,
          author:    caseItem?.createdBy ?? "System",
          iso:       new Date(baseMs + (i + 1) * 60_000).toISOString(),
          time:      null,
        });
      }
    });
  }

  // ── PHASE 7 · Actual WO log entries (real-time recorded changes) ──────────────
  (log ?? []).forEach((entry) => {
    const isNote  = /note/i.test(entry.text ?? "");
    const isReply = /reply|sent/i.test(entry.text ?? "");
    items.push({
      id:        `log-${entry.id}`,
      kind:      isNote ? "note" : isReply ? "reply" : "status",
      Icon:      isNote ? StickyNote : isReply ? Mail : ActivitySquare,
      avatarCls: isNote
        ? "bg-amber-400/15 text-amber-400"
        : isReply
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-white/5 text-white/35",
      dotColor:  (!isNote && !isReply) ? entry.dotColor : null,
      text:      entry.text,
      detail:    entry.noteText ?? null,
      author:    entry.author,
      iso:       entry.date ?? null,
      time:      entry.time ?? null,
    });
  });

  // Sort everything chronologically; undated real entries fall to the end in insertion order
  const dated   = items.filter((e) => e.iso).sort((a, b) => new Date(a.iso) - new Date(b.iso));
  const undated = items.filter((e) => !e.iso);
  return [...dated, ...undated];
}

function HistoryTab({ caseItem, log, messages, woStatus }) {
  const entries = useMemo(
    () => buildHistoryEntries(caseItem, log, messages, woStatus),
    [caseItem, log, messages, woStatus]
  );

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="size-12 rounded-full bg-white/5 flex items-center justify-center">
          <HistoryIcon className="size-5 text-white/20" />
        </div>
        <p className="text-sm text-white/25">No history yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-0">
      {entries.map((entry, idx) => {
        const isLast  = idx === entries.length - 1;
        const { kind, Icon, avatarCls, dotColor } = entry;
        const age     = entry.iso ? fmtAge(entry.iso) : null;
        const clock   = entry.time ?? (entry.iso ? fmtClock(entry.iso) : null);

        // WO status chip
        const woMatch    = /^Status changed to (.+)$/.exec(entry.text ?? "");
        const woSName    = woMatch?.[1]?.trim() ?? null;
        const woSSty     = woSName ? (WO_STATUS_STYLE[woSName] ?? null) : null;

        // Case status chip (from synthesised case-status entries)
        const csMatch    = /^Case status changed to (.+)$/.exec(entry.text ?? "");
        const csName     = csMatch?.[1]?.trim() ?? entry.statusLabel ?? null;
        const csSty      = (kind === "case-status" && csName) ? (CASE_STATUS_STYLE[csName] ?? null) : null;

        const statusName = woSName ?? (kind === "case-status" ? csName : null);
        const statusSty  = woSSty ?? csSty;

        // Initials for person-based entries
        const initials = getInitials(entry.author ?? "");

        return (
          <li key={entry.id}>
            <div className="flex gap-3">

              {/* ── Left rail: avatar + connector ── */}
              <div className="flex flex-col items-center shrink-0 w-9">
                {/* Avatar */}
                {kind === "email" ? (
                  <div className={`size-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarCls}`}>
                    {initials}
                  </div>
                ) : kind === "status" && dotColor ? (
                  <div className="size-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <span className={`size-2.5 rounded-full ${dotColor}`} />
                  </div>
                ) : kind === "case-status" && csSty ? (
                  <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${csSty.bg} border ${csSty.border}`}>
                    <span className={`size-2.5 rounded-full ${csSty.dot}`} />
                  </div>
                ) : (
                  <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${avatarCls}`}>
                    <Icon className="size-3.5" />
                  </div>
                )}

                {/* Connector line */}
                {!isLast && (
                  <div className="w-px flex-1 bg-white/[0.06] mt-1.5 mb-0" />
                )}
              </div>

              {/* ── Right: content ── */}
              <div className={`flex-1 min-w-0 ${isLast ? "pb-2" : "pb-6"}`}>

                {/* Title + tag — badge sits immediately after title text */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 min-w-0">
                  {/* WO status change — colored chip inline */}
                  {woSName && woSSty ? (
                    <p className="text-[12px] font-medium text-white/60 leading-snug">
                      WO status changed to{" "}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${woSSty.bg} ${woSSty.text} ${woSSty.border}`}>
                        <span className={`size-1.5 rounded-full shrink-0 ${woSSty.dot}`} />
                        {woSName}
                      </span>
                    </p>
                  ) : kind === "case-status" && csSty ? (
                    /* Case status change — colored chip inline */
                    <p className="text-[12px] font-medium text-white/60 leading-snug">
                      {entry.id === "case-created" ? `Case ${caseItem?.caseId ?? ""} opened — ` : "Case status changed to "}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${csSty.bg} ${csSty.text} ${csSty.border}`}>
                        <span className={`size-1.5 rounded-full shrink-0 ${csSty.dot}`} />
                        {csName}
                      </span>
                    </p>
                  ) : (
                    <p className={`leading-snug ${
                      kind === "email"
                        ? "text-[13px] font-semibold text-white/90"
                        : kind === "action"
                        ? "text-[12px] font-semibold text-white/75"
                        : "text-[12px] font-medium text-white/60"
                    }`}>
                      {entry.text}
                    </p>
                  )}
                  {entry.tag && (
                    <span className={`inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded border ${entry.tagCls}`}>
                      {entry.tag}
                    </span>
                  )}
                </div>

                {/* Meta: author · clock · age */}
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="text-[10.5px] font-medium text-white/35">{entry.author}</span>
                  {clock && (
                    <>
                      <span className="text-white/15 text-[10px]">·</span>
                      <span className="text-[10px] font-mono text-white/25">{clock}</span>
                    </>
                  )}
                  {age && (
                    <>
                      <span className="text-white/15 text-[10px]">·</span>
                      <span className="text-[10px] text-white/25">{age}</span>
                    </>
                  )}
                </div>

                {/* Detail card (email body / note text) */}
                {entry.detail && (
                  <div className="mt-2 flex gap-2.5">
                    <div className={`w-0.5 rounded-full shrink-0 ${entry.accentCls ?? "bg-amber-400/40"}`} />
                    <p className="text-[11px] text-white/45 leading-relaxed flex-1 min-w-0">
                      {entry.detail}
                    </p>
                  </div>
                )}

              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Tab: Notes ───────────────────────────────────────────────────────────────
// All mentionable people: agents (USERS_DATA staff/management) + workers
const MENTION_POOL = [
  ...USERS_DATA.filter((u) => !u.isStudent),
  ...WORKERS_DATA,
];

// Resolve a friendly role label for a note author. Looks up in USERS_DATA +
// WORKERS_DATA; falls back to "Helpdesk" for unknown agent-style authors.
export function lookupAuthorRole(authorName) {
  if (!authorName) return null;
  const user = USERS_DATA.find((u) => u.displayName === authorName);
  if (user) {
    if (user.isAgent)                   return "Helpdesk";
    if (user.userRole === "OurEmployee") return user.jobTitle || "Staff";
    if (user.userRole)                   return user.userRole;
  }
  const worker = WORKERS_DATA.find((w) => w.displayName === authorName);
  if (worker) return worker.workerRole || "Engineer";
  return "Helpdesk";
}

// Render a note with @mention highlighting — exported so the standalone
// composer can reuse it (the composer doesn't render notes itself, but
// keeping the helper here groups the rendering logic).
function renderNoteText(raw) {
  if (!raw.includes("@")) return raw;
  const parts = raw.split(/(@[\w][^\s@]*(?:\s[\w][^\s@]*)?)/g);
  return parts.map((part, i) =>
    part.startsWith("@")
      ? <span key={i} className="text-electricBlue font-medium">{part}</span>
      : part
  );
}

function NotesTab({ notes }) {
  return (
    <div className="flex flex-col gap-3">
      {/* ── Notes list ── */}
      <div className="flex flex-col gap-3">
        {notes.length === 0 ? (
          <p className="text-[11px] text-white/25 text-center py-6">No notes yet</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className={`flex flex-col gap-1 px-3 py-2.5 rounded-lg border ${
              n.tag === "Cancellation"
                ? "bg-red-500/5 border-red-500/20"
                : "bg-obsidianNight/40 border-obsidianHighlight"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="size-5 rounded-full bg-electricBlue/20 flex items-center justify-center text-[8px] font-bold text-electricBlue shrink-0">
                    {getInitials(n.author)}
                  </div>
                  <span className="text-[10px] font-medium text-white/60">{n.author}</span>
                  {(n.authorRole || lookupAuthorRole(n.author)) && (
                    <span className="text-[9px] font-medium text-white/40 bg-white/5 px-1.5 py-px rounded">
                      {n.authorRole || lookupAuthorRole(n.author)}
                    </span>
                  )}
                  <span className="text-[9px] text-white/25">{n.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {n.tag === "Cancellation" && (
                    <span className="inline-flex items-center text-[9px] font-medium px-1.5 py-px rounded border bg-red-500/10 text-red-400 border-red-500/20">
                      Cancellation
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-px rounded border ${
                    n.internal
                      ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                      : "bg-electricBlue/10 text-electricBlue border-electricBlue/20"
                  }`}>
                    {n.internal ? <Lock className="size-2" /> : <Eye className="size-2" />}
                    {n.internal ? "Internal" : "Requester"}
                  </span>
                </div>
              </div>
              {/* Mentions badges */}
              {n.mentions?.length > 0 && (
                <div className="flex flex-wrap gap-1 pl-6 mt-0.5">
                  {n.mentions.map((mn) => (
                    <span key={mn.id} className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-px rounded-full bg-electricBlue/10 text-electricBlue border border-electricBlue/20">
                      <User className="size-2" />{mn.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-white/70 leading-relaxed pl-6 whitespace-pre-wrap">
                {renderNoteText(n.text)}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// ─── Standalone Note composer — pinned at the bottom of the WO page ─────────
function NoteComposer({ onAddNote }) {
  const [text, setText]             = useState("");
  const [internal, setInternal]     = useState(true);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef(null);

  const mentionResults = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return MENTION_POOL.filter((u) =>
      (u.displayName ?? "").toLowerCase().includes(q)
    ).slice(0, 8);
  }, [mentionQuery]);

  const handleTextChange = (e) => {
    const val    = e.target.value;
    const cursor = e.target.selectionStart;
    setText(val);
    const before = val.slice(0, cursor);
    const match  = before.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user) => {
    const name   = user.displayName;
    const before = text.slice(0, mentionStart);
    const after  = text.slice(mentionStart + 1 + (mentionQuery?.length ?? 0));
    const next   = `${before}@${name} ${after}`;
    setText(next);
    setMentionQuery(null);
    setTimeout(() => {
      if (!textareaRef.current) return;
      const pos = before.length + name.length + 2;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    const mentions = [];
    MENTION_POOL.forEach((u) => {
      if (text.includes(`@${u.displayName}`)) {
        mentions.push({ id: u.id, name: u.displayName, email: u.email ?? null });
      }
    });
    onAddNote({ text: text.trim(), internal, mentions });
    setText("");
  };

  return (
    <div className="shrink-0 border-t border-obsidianHighlight bg-obsidianSurface px-5 py-3">
      <div className="rounded-lg border border-obsidianHighlight bg-obsidianNight/40 px-3 py-2.5 flex flex-col gap-2">
        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide">Add Note</p>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Escape" && mentionQuery !== null) {
                setMentionQuery(null);
                e.preventDefault();
              }
              if ((e.key === "Enter" || e.key === "Tab") && mentionQuery !== null && mentionResults.length > 0) {
                e.preventDefault();
                insertMention(mentionResults[0]);
              }
            }}
            placeholder="Add a note… type @ to mention someone"
            rows={2}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-electricBlue/50 transition-colors leading-relaxed"
          />
          {mentionQuery !== null && mentionResults.length > 0 && (
            <ul className="absolute z-30 bottom-full mb-1 left-0 w-full rounded-md bg-obsidianElevated border border-obsidianHighlight shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {mentionResults.map((u) => (
                <li key={u.id ?? u.displayName}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/8 transition-colors"
                  >
                    <div className="size-5 rounded-full bg-electricBlue/20 flex items-center justify-center text-[8px] font-bold text-electricBlue shrink-0">
                      {getInitials(u.displayName)}
                    </div>
                    <span className="text-[11px] text-white/70 flex-1">{u.displayName}</span>
                    <span className="text-[9px] text-white/30">{u.workerRole ?? (u.clientEmployee ? "Staff" : "Agent")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-md overflow-hidden border border-obsidianHighlight">
            <button
              type="button"
              onClick={() => setInternal(true)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                internal ? "bg-amber-400/15 text-amber-400" : "text-white/35 hover:text-white/60"
              }`}
            >
              <Lock className="size-2.5" /> Internal
            </button>
            <button
              type="button"
              onClick={() => setInternal(false)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors border-l border-obsidianHighlight ${
                !internal ? "bg-electricBlue/15 text-electricBlue" : "text-white/35 hover:text-white/60"
              }`}
            >
              <Eye className="size-2.5" /> Requester
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!text.trim()}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-electricBlue hover:bg-electricBlue/80 text-white text-[10px] font-semibold disabled:opacity-40 transition-colors"
          >
            <Send className="size-2.5" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Engineer helpers ────────────────────────────────────────────────────

// Max concurrent active WOs before an engineer is considered "fully booked"
const MAX_CONCURRENT_JOBS = 3;

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates() {
  const now = new Date();
  const iso = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon … 7=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (iso - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function parseDurationMins(str) {
  if (!str) return 120;
  const h = str.match(/(\d+(?:\.\d+)?)\s*h/i);
  const m = str.match(/(\d+)\s*m(?!o)/i);
  return (h ? parseFloat(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || 120;
}

// ─── Engineer Profile Modal ───────────────────────────────────────────────────
function EngineerProfileModal({ engineer, allCases, onClose }) {
  const weekDates = useMemo(() => getWeekDates(), []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Active WOs (any status except Completed/Cancelled) where this engineer is assigned
  const engineerCases = useMemo(() =>
    (allCases ?? []).filter((c) => {
      if (["Completed", "Cancelled"].includes(c.workOrderStatus)) return false;
      const ids = new Set([
        ...(c.assignedEngineers ?? []).map((e) => e.id),
        ...(c.assignedToId ? [c.assignedToId] : []),
      ]);
      return ids.has(engineer.id);
    }), [allCases, engineer.id]);

  const isFullyBooked = engineerCases.length >= MAX_CONCURRENT_JOBS;

  // Map week-day index (0=Mon … 6=Sun) → cases scheduled on that date
  const jobsByDay = useMemo(() => {
    const map = {};
    weekDates.forEach((date, i) => {
      map[i] = engineerCases.filter((c) => {
        if (!c.scheduledDate) return false;
        const sd = new Date(c.scheduledDate);
        sd.setHours(0, 0, 0, 0);
        return sd.getTime() === date.getTime();
      });
    });
    return map;
  }, [engineerCases, weekDates]);

  const unscheduled = engineerCases.filter((c) => !c.scheduledDate);
  const todayIso = today.getDay() === 0 ? 7 : today.getDay(); // 1=Mon…7=Sun

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-obsidianSurface border border-obsidianHighlight rounded-2xl shadow-2xl shadow-black/70 flex flex-col max-h-[88vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-obsidianHighlight shrink-0">
          <div className={`size-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-offset-2 ring-offset-obsidianSurface ${
            isFullyBooked
              ? "bg-red-500/20 text-red-400 ring-red-500/30"
              : "bg-electricBlue/20 text-electricBlue ring-electricBlue/30"
          }`}>
            {getInitials(engineer.displayName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">{engineer.displayName}</h2>
              {isFullyBooked ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                  Unavailable · Fully Booked
                </span>
              ) : engineerCases.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/25 uppercase tracking-wide">
                  {engineerCases.length} active WO{engineerCases.length > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 uppercase tracking-wide">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/35 mt-0.5">{engineer.workerRole}</p>
          </div>

          <button onClick={onClose}
            className="shrink-0 size-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 flex flex-col gap-5">

          {/* Shift pattern */}
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2 font-semibold">Shift Pattern</p>
            <div className="flex gap-1.5 mb-2">
              {DAY_SHORT.map((day, i) => {
                const isoDay  = i + 1;
                const onShift = engineer.shift?.days?.includes(isoDay);
                const isToday = isoDay === todayIso;
                // Today + working  → electricBlue highlight
                // Other work days  → emerald (green)
                // Off days         → red tint
                const wrapCls = isToday && onShift
                  ? "bg-electricBlue/20 border-electricBlue/50 ring-1 ring-electricBlue/30"
                  : onShift
                  ? "bg-emerald-500/15 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/20";
                const dotCls  = isToday && onShift
                  ? "bg-electricBlue animate-pulse"
                  : onShift
                  ? "bg-emerald-400"
                  : "bg-red-500/50";
                const textCls = isToday && onShift
                  ? "text-electricBlue"
                  : onShift
                  ? "text-emerald-400"
                  : "text-red-400/60";
                return (
                  <div key={day} className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg border text-center transition-colors ${wrapCls}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${textCls}`}>
                      {day}
                    </span>
                    <span className={`size-1.5 rounded-full ${dotCls}`} />
                    {isToday && onShift && (
                      <span className="text-[7px] font-bold text-electricBlue/70 uppercase tracking-widest leading-none">now</span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-[9px] text-white/30">
                <span className="size-2 rounded-sm bg-electricBlue/40 border border-electricBlue/50" /> Today
              </span>
              <span className="flex items-center gap-1 text-[9px] text-white/30">
                <span className="size-2 rounded-sm bg-emerald-500/30 border border-emerald-500/30" /> Working
              </span>
              <span className="flex items-center gap-1 text-[9px] text-white/30">
                <span className="size-2 rounded-sm bg-red-500/20 border border-red-500/20" /> Off
              </span>
            </div>
            {engineer.shift && (
              <p className="text-[10px] text-white/35 flex items-center gap-1.5 mt-2">
                <Clock className="size-3" />
                {engineer.shift.hours} · {engineer.shift.label}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2 font-semibold">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {(engineer.skills ?? []).length === 0
                ? <span className="text-[10px] text-white/20 italic">No skills listed</span>
                : (engineer.skills ?? []).map((sk) => (
                  <span key={sk} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-sky-400/10 text-sky-300 border border-sky-400/20">
                    <Wrench className="size-2.5" /> {SKILL_LABEL[sk] ?? sk}
                  </span>
                ))
              }
            </div>
          </div>

          {/* Campuses */}
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2 font-semibold">Deployed Campuses</p>
            <div className="flex flex-wrap gap-1.5">
              {(engineer.campuses ?? []).map((c) => (
                <span key={c} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-400/10 text-violet-300 border border-violet-400/20">
                  <MapPinIcon className="size-2.5" /> {c}
                </span>
              ))}
            </div>
          </div>

          {/* Weekly schedule */}
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2 font-semibold">This Week's Schedule</p>
            <div className="flex flex-col gap-2">
              {weekDates.map((date, i) => {
                const isoDay   = i + 1;
                const onShift  = engineer.shift?.days?.includes(isoDay) ?? false;
                const jobs     = jobsByDay[i] ?? [];
                const isToday  = date.getTime() === today.getTime();
                const MAX_DAY  = 4; // jobs considered "full" per shift day
                const pct      = Math.min(jobs.length / MAX_DAY, 1);
                const busyLabel =
                  jobs.length === 0 ? "Free"
                  : jobs.length === 1 ? "Light"
                  : jobs.length === 2 ? "Busy"
                  : "Full";
                const barColor =
                  jobs.length === 0 ? "bg-white/10"
                  : jobs.length === 1 ? "bg-emerald-400"
                  : jobs.length === 2 ? "bg-amber-400"
                  : "bg-red-400";
                const labelColor =
                  jobs.length === 0 ? "text-white/20"
                  : jobs.length === 1 ? "text-emerald-400"
                  : jobs.length === 2 ? "text-amber-400"
                  : "text-red-400";

                return (
                  <div key={i} className={`rounded-lg border px-3 py-2.5 ${
                    isToday
                      ? "border-electricBlue/25 bg-electricBlue/[0.04]"
                      : "border-obsidianHighlight bg-white/[0.015]"
                  }`}>
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold ${isToday ? "text-electricBlue" : "text-white/55"}`}>
                          {DAY_SHORT[i]} {date.getDate()} {date.toLocaleDateString("en-GB", { month: "short" })}
                        </span>
                        {isToday && (
                          <span className="text-[8px] font-bold text-electricBlue/60 uppercase tracking-wider">Today</span>
                        )}
                        {!onShift && (
                          <span className="text-[8px] text-white/20 uppercase tracking-wider">Off</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-semibold shrink-0 ${labelColor}`}>
                        {busyLabel}{jobs.length > 0 ? ` · ${jobs.length} job${jobs.length > 1 ? "s" : ""}` : ""}
                      </span>
                    </div>

                    {/* Busyness bar */}
                    <div className="h-1 rounded-full bg-white/[0.06] mb-2">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>

                    {/* Job list */}
                    {jobs.length > 0 ? (
                      <div className="flex flex-col gap-1 mt-1">
                        {jobs.map((job) => (
                          <div key={job.id} className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                            <span className={`size-1.5 rounded-full shrink-0 ${WO_STATUS_STYLE[job.workOrderStatus]?.dot ?? "bg-white/30"}`} />
                            <span className="text-[10px] font-semibold text-electricBlue/80 shrink-0">{job.workOrderNumber}</span>
                            <span className="text-[10px] text-white/50 truncate flex-1">{job.title}</span>
                            {job.scheduledTime && (
                              <span className="text-[9px] text-white/30 shrink-0">{job.scheduledTime}</span>
                            )}
                            {job.estimatedDuration && (
                              <span className="text-[9px] text-white/25 shrink-0">· {job.estimatedDuration}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : onShift ? (
                      <p className="text-[10px] text-white/20 italic mt-0.5">No jobs scheduled</p>
                    ) : (
                      <p className="text-[10px] text-white/12 italic mt-0.5">Not on shift</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unscheduled active WOs */}
          {unscheduled.length > 0 && (
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2 font-semibold">Active · No Schedule Set</p>
              <div className="flex flex-col gap-1.5">
                {unscheduled.map((job) => (
                  <div key={job.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-400/[0.04] border border-amber-400/15">
                    <span className={`size-1.5 rounded-full shrink-0 ${WO_STATUS_STYLE[job.workOrderStatus]?.dot ?? "bg-white/30"}`} />
                    <span className="text-[10px] font-semibold text-electricBlue/80 shrink-0">{job.workOrderNumber}</span>
                    <span className="text-[10px] text-white/50 truncate flex-1">{job.title}</span>
                    <span className="text-[9px] text-amber-400/50 shrink-0">No date</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="border-t border-obsidianHighlight px-5 py-3 shrink-0 bg-obsidianNight/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex items-center gap-1.5 text-[10px] text-white/30 truncate">
              <Mail className="size-3 shrink-0" />{engineer.email}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-white/30 shrink-0">
              <Phone className="size-3 shrink-0" />{engineer.phone}
            </span>
          </div>
          {isFullyBooked && (
            <span className="text-[9px] text-red-400/60 italic shrink-0">
              Consider assigning a different engineer
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Derive the SUB_CATEGORIES_ISSUE group id from a ServiceCategory object
function getCategoryGroupId(serviceCategory) {
  if (!serviceCategory) return null;
  const codeMap = { EL: "electrical", HV: "hvac", PL: "plumbing", ST: "structural", SE: "security", CL: "cleaning", LI: "lift", GR: "grounds" };
  const prefix = (serviceCategory.code ?? "").slice(0, 2).toUpperCase();
  return codeMap[prefix] ?? null;
}

const SKILL_LABEL = {
  electrical: "Electrical", hvac: "HVAC", plumbing: "Plumbing",
  structural: "Structural", security: "Security", cleaning: "Cleaning",
  lift: "Lift & Elevator", grounds: "Grounds",
};

// Reusable call timer hook (same pattern as PhoneCallModal)
function useCallTimer(running) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) { setT(0); return; }
    const id = setInterval(() => setT((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

// Returns true when the current time falls inside the shift window
function isShiftActive(shift) {
  if (!shift?.hours || !shift?.days) return false;
  const now     = new Date();
  const isoDay  = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon…7=Sun
  if (!shift.days.includes(isoDay)) return false;
  const [start, end] = shift.hours.split("–").map((t) => t.trim());
  const [sh, sm] = (start ?? "").split(":").map(Number);
  const [eh, em] = (end   ?? "").split(":").map(Number);
  if (isNaN(sh) || isNaN(eh)) return false;
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em;
}

// ─── Outbound Call Modal — shared mock data ───────────────────────────────────
const OUTBOUND_AGENTS = [
  { id: 1, name: "Sarah Mitchell", role: "Helpdesk Support",   status: "available", initials: "SM" },
  { id: 2, name: "Tom Baker",      role: "Helpdesk Support",   status: "in-call",   initials: "TB" },
  { id: 3, name: "Emma Clarke",    role: "Site Supervisor",    status: "in-call",   initials: "EC" },
  { id: 4, name: "David Okafor",   role: "Operations Manager", status: "available", initials: "DO" },
  { id: 5, name: "Lucy Chen",      role: "Helpdesk Support",   status: "away",      initials: "LC" },
];
const OUTBOUND_AGENT_STATUS = {
  available: { dot: "bg-emerald-400", label: "Available", canTransfer: true  },
  "in-call": { dot: "bg-electricBlue", label: "In call",  canTransfer: false },
  away:      { dot: "bg-amber-400",   label: "Away",      canTransfer: false },
};
const OUTBOUND_HISTORY = [
  { id: 1, name: "James Thornton", number: "0771 234 567",  dur: "4:23", time: "09:42",     resolved: true  },
  { id: 2, name: "Amara Osei",     number: "0794 567 890",  dur: "2:11", time: "09:18",     resolved: true  },
  { id: 3, name: "Unknown",        number: "+44 7700 9012", dur: "0:48", time: "08:55",     resolved: false },
  { id: 4, name: "Priya Mehta",    number: "0782 345 678",  dur: "6:05", time: "Yesterday", resolved: true  },
  { id: 5, name: "Sofia Andersen", number: "0743 567 890",  dur: "1:32", time: "Yesterday", resolved: true  },
];

// Compact label-value row used in the Brief tab
function Row({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1 min-w-0">
      <span className="text-[9px] text-white/25 uppercase tracking-wider w-14 shrink-0 pt-px leading-tight">{label}</span>
      <span className="text-[11px] text-white/65 leading-tight min-w-0 flex-1">{value}</span>
    </div>
  );
}

function OutboundTransferTab({ onClose }) {
  const [query,       setQuery]       = useState("");
  const [transferred, setTransferred] = useState(null);
  const filtered = OUTBOUND_AGENTS.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) ||
           a.role.toLowerCase().includes(query.toLowerCase())
  );
  const handleTransfer = (agent) => {
    setTransferred(agent);
    setTimeout(() => onClose?.(true), 2000);
  };
  if (transferred) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <div className="size-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <PhoneCall className="size-4 text-emerald-400" />
        </div>
        <p className="text-xs font-semibold text-white text-center">Transferring to {transferred.name}</p>
        <p className="text-[11px] text-white/35 text-center">Please hold — connecting now…</p>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full bg-emerald-400/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.08]">
          <Search className="size-3 text-white/25 shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents…"
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-white/5">
        {filtered.map((agent) => {
          const s = OUTBOUND_AGENT_STATUS[agent.status] ?? OUTBOUND_AGENT_STATUS.away;
          return (
            <div key={agent.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 transition-colors">
              <div className="relative shrink-0">
                <div className="size-7 rounded-full bg-electricBlue/10 text-electricBlue text-[9px] font-bold flex items-center justify-center">
                  {agent.initials}
                </div>
                <span className={`absolute bottom-0 right-0 size-1.5 rounded-full ring-[1.5px] ring-[#0a0c14] ${s.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white truncate">{agent.name}</p>
                <p className={`text-[10px] mt-0.5 ${s.canTransfer ? "text-emerald-400" : "text-white/25"}`}>{s.label}</p>
              </div>
              <button onClick={() => handleTransfer(agent)} disabled={!s.canTransfer}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors shrink-0 ${
                  s.canTransfer
                    ? "bg-electricBlue/10 text-electricBlue hover:bg-electricBlue/20 border border-electricBlue/20"
                    : "bg-white/[0.03] text-white/15 border border-white/5 cursor-not-allowed"
                }`}>
                <ArrowRightCircle className="size-3" />Transfer
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutboundHistoryTab() {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-white/5">
      {OUTBOUND_HISTORY.map((call) => (
        <div key={call.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 transition-colors">
          <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${call.resolved ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
            <Phone className={`size-3 ${call.resolved ? "text-emerald-400" : "text-red-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-white truncate">{call.name}</p>
            <p className="text-[10px] text-white/25 truncate">{call.number}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-white/35">{call.time}</p>
            <p className="text-[10px] text-white/20 mt-0.5">{call.dur}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Outbound Call Modal ──────────────────────────────────────────────────────
// Identical shell to PhoneCallModal: same dimensions, drag, title-bar controls,
// compact ↔ expanded layout. Brief/Transfer/History tabs in the right panel.
function OutboundCallModal({ engineer, woInfo, onClose, onMinimize, minimized }) {
  const [phase, setPhase] = useState("dialing");
  const [view,  setView]  = useState("compact");
  const [tab,   setTab]   = useState("brief");
  const timer = useCallTimer(phase === "connected");

  const COMPACT_W  = 224;
  const EXPANDED_W = 580;
  const EXPANDED_H = 440;
  const MIN_Y      = 90;

  const initPos = { x: window.innerWidth - COMPACT_W - 16, y: MIN_Y };
  const [pos, setPos]          = useState(initPos);
  const compactPosRef          = useRef(initPos);
  const dragging               = useRef(false);
  const dragOffset             = useRef({ x: 0, y: 0 });
  const draggedWhileExpanded   = useRef(false);

  // Announce this call to the AdminLayout nav indicator
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("call:outbound:start"));
    return () => window.dispatchEvent(new CustomEvent("call:outbound:end"));
  }, []);

  // Same view-switch logic as PhoneCallModal
  const handleSetView = (next) => {
    if (next === "expanded") {
      compactPosRef.current = pos;
      setPos((p) => ({
        x: Math.max(0,     Math.min(p.x, window.innerWidth  - EXPANDED_W)),
        y: Math.max(MIN_Y, Math.min(p.y, window.innerHeight - EXPANDED_H)),
      }));
      draggedWhileExpanded.current = false;
    } else {
      if (!draggedWhileExpanded.current) setPos(compactPosRef.current);
    }
    setView(next);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const w = view === "expanded" ? EXPANDED_W : COMPACT_W;
      const h = view === "expanded" ? EXPANDED_H : 80;
      const next = {
        x: Math.max(0,     Math.min(window.innerWidth  - w, e.clientX - dragOffset.current.x)),
        y: Math.max(MIN_Y, Math.min(window.innerHeight - h, e.clientY - dragOffset.current.y)),
      };
      setPos(next);
      if (view === "expanded") draggedWhileExpanded.current = true;
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [view]);

  const startDrag = (e) => {
    dragging.current   = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  // Auto-connect after 3 s
  useEffect(() => {
    if (phase !== "dialing") return;
    const id = setTimeout(() => setPhase("connected"), 3000);
    return () => clearTimeout(id);
  }, [phase]);

  const isDialing   = phase === "dialing";
  const initials    = getInitials(engineer.displayName);
  const shiftOn     = isShiftActive(engineer.shift);
  const accentColor = isDialing ? "rgba(251,191,36,1)" : "rgba(52,211,153,1)";
  const glowBorder  = isDialing ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)";

  // ── Compact call card (same markup as PhoneCallModal's CallCard) ──────────
  const callCard = (
    <div className="flex flex-col items-center px-4 pt-4 pb-5 gap-3.5">
      {/* Avatar */}
      <div className="relative flex items-center justify-center">
        {isDialing && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(251,191,36,0.07)", animationDuration: "1.2s" }} />
        )}
        <div
          className="relative size-14 rounded-full flex items-center justify-center text-base font-bold"
          style={{
            background:  isDialing ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)",
            border:     `1.5px solid ${isDialing ? "rgba(251,191,36,0.35)" : "rgba(52,211,153,0.35)"}`,
            color:       isDialing ? "#fbbf24" : "#34d399",
            boxShadow:   isDialing ? "0 0 18px rgba(251,191,36,0.12)" : "0 0 18px rgba(52,211,153,0.12)",
            transition: "all 0.5s ease",
          }}
        >
          {initials}
        </div>
      </div>

      {/* Name + status + shift */}
      <div className="text-center">
        <p className="text-white font-semibold text-sm leading-tight">{engineer.displayName}</p>
        <p className="text-[10px] mt-0.5" style={{ color: isDialing ? "rgba(251,191,36,0.6)" : "rgba(52,211,153,0.6)" }}>
          {isDialing ? "Calling…" : `Connected · ${timer}`}
        </p>
        {engineer.shift && (
          <p className="text-[10px] mt-0.5 text-white/20">
            {engineer.shift.label} · {engineer.shift.hours}
            {shiftOn && <span className="ml-1 text-emerald-400">· On shift</span>}
          </p>
        )}
      </div>

      {/* End call */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => onClose(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          <PhoneOff className="size-3.5" /> End call
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed z-[100] select-none"
      style={{ left: pos.x, top: pos.y, width: view === "expanded" ? EXPANDED_W : COMPACT_W, display: minimized ? "none" : undefined }}
    >
      <div
        className="flex flex-col rounded-xl overflow-hidden shadow-2xl shadow-black/70"
        style={{
          background: "var(--color-obsidianSurface, #13161f)",
          border: `1px solid ${glowBorder}`,
          ...(view === "expanded" ? { height: EXPANDED_H } : {}),
          transition: "border-color 0.5s ease",
        }}
      >
        {/* ── Title bar — identical to PhoneCallModal ── */}
        <div
          onMouseDown={startDrag}
          className="flex items-center gap-2 px-3 py-1.5 border-b border-obsidianHighlight cursor-grab active:cursor-grabbing shrink-0 bg-obsidianNight"
        >
          <div className="flex flex-1 items-center gap-1.5 min-w-0">
            <span className="size-1.5 rounded-full shrink-0 animate-pulse" style={{ background: accentColor }} />
            <span className="text-[10px] font-semibold text-white/45 tracking-wide uppercase truncate">
              {isDialing ? "Outbound call" : "Active call"}
            </span>
            {!isDialing && (
              <span className="font-mono text-[10px] shrink-0 text-emerald-400/70">{timer}</span>
            )}
          </div>
          {/* Window controls — same as PhoneCallModal */}
          <div className="flex items-center shrink-0" style={{ gap: 1 }}>
            {view === "compact" && (
              <button
                onClick={() => onMinimize?.()}
                title="Minimise"
                className="flex items-center justify-center text-white/35 hover:text-white hover:bg-obsidianHighlight transition-colors"
                style={{ width: 28, height: 24, borderRadius: 4 }}
              >
                <Minus className="size-3.5" />
              </button>
            )}
            <button
              onClick={() => handleSetView(view === "expanded" ? "compact" : "expanded")}
              title={view === "expanded" ? "Restore" : "Expand"}
              className="flex items-center justify-center text-white/35 hover:text-white hover:bg-obsidianHighlight transition-colors"
              style={{ width: 28, height: 24, borderRadius: 4 }}
            >
              {view === "expanded" ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {view === "expanded" ? (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: call card */}
            <div className="shrink-0 border-r border-obsidianHighlight overflow-y-auto" style={{ width: COMPACT_W }}>
              {callCard}
            </div>
            {/* Right: tabbed panel — Brief / Transfer / Call History */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0">
              {/* Tab bar */}
              <div className="shrink-0 flex border-b border-obsidianHighlight bg-obsidianNight/40">
                {[
                  { key: "brief",    label: "Brief",        Icon: FileText         },
                  { key: "transfer", label: "Transfer",     Icon: ArrowRightCircle },
                  { key: "history",  label: "Call History", Icon: HistoryIcon      },
                ].map(({ key, label, Icon }) => (
                  <button key={key} onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium border-b-2 transition-colors ${
                      tab === key ? "border-electricBlue text-white" : "border-transparent text-white/30 hover:text-white/60"
                    }`}>
                    <Icon className="size-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex flex-col flex-1 min-h-0 py-3">

                {/* Brief tab — compact metadata rows */}
                {tab === "brief" && (
                  <div className="flex-1 overflow-y-auto min-h-0 px-4">
                    {/* Engineer section */}
                    <div className="flex flex-col gap-0">
                      <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1.5">Engineer</p>
                      <Row label="Name"  value={engineer.displayName} />
                      <Row label="Role"  value={engineer.workerRole} />
                      {engineer.shift && <>
                        <Row label="Shift" value={`${engineer.shift.label} · ${engineer.shift.hours}`} />
                        <Row label="Status" value={
                          shiftOn
                            ? <span className="inline-flex items-center gap-1 text-emerald-400 font-medium"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />On shift</span>
                            : <span className="text-white/25">Off shift</span>
                        } />
                      </>}
                    </div>

                    {woInfo && (woInfo.title || woInfo.woNumber || woInfo.skill || woInfo.location) && (
                      <>
                        <div className="my-3 border-t border-white/[0.06]" />
                        <div className="flex flex-col gap-0">
                          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1.5">Work Order</p>
                          {woInfo.title    && <Row label="Issue"    value={woInfo.title} />}
                          {woInfo.woNumber && <Row label="Ref"      value={<span className="font-mono text-violet-400">{woInfo.woNumber}</span>} />}
                          {woInfo.skill    && <Row label="Category" value={
                            <span className="inline-flex items-center gap-1 px-1.5 py-px rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">
                              <Wrench className="size-2.5" />{SKILL_LABEL[woInfo.skill] ?? woInfo.skill}
                            </span>
                          } />}
                          {woInfo.location && <Row label="Location" value={
                            <span className="inline-flex items-center gap-1 text-white/50"><MapPinIcon className="size-2.5 shrink-0" />{woInfo.location}</span>
                          } />}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Transfer tab */}
                {tab === "transfer" && <OutboundTransferTab onClose={onClose} />}

                {/* Call History tab */}
                {tab === "history" && <OutboundHistoryTab />}

              </div>
            </div>
          </div>
        ) : (
          callCard
        )}
      </div>
    </div>
  );
}

// ─── Duration options for dropdowns ──────────────────────────────────────────
const DURATION_OPTIONS = [
  { label: "30 minutes", hours: 0.5  },
  { label: "1 hour",     hours: 1    },
  { label: "1.5 hours",  hours: 1.5  },
  { label: "2 hours",    hours: 2    },
  { label: "3 hours",    hours: 3    },
  { label: "4 hours",    hours: 4    },
  { label: "5 hours",    hours: 5    },
  { label: "6 hours",    hours: 6    },
  { label: "8 hours",    hours: 8    },
  { label: "1 day",      hours: 8    },
  { label: "2 days",     hours: 16   },
  { label: "3 days",     hours: 24   },
];

// ─── Duration string → decimal hours ─────────────────────────────────────────
function parseDurationHours(str) {
  if (!str) return 2;
  // Handle minutes first e.g. "30 minutes"
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*min/i);
  if (minMatch) return parseFloat(minMatch[1]) / 60;
  const m = str.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h|day|d)/i);
  if (!m) return 2;
  const v = parseFloat(m[1]);
  return m[2].toLowerCase().startsWith("d") ? v * 8 : v;
}

// ─── Gantt chart for assigned engineers ──────────────────────────────────────
const GANTT_COLORS = [
  { bar: "bg-electricBlue/50 border-electricBlue/30", text: "text-electricBlue" },
  { bar: "bg-violet-400/50  border-violet-400/30",   text: "text-violet-300"   },
  { bar: "bg-emerald-400/50 border-emerald-400/30",  text: "text-emerald-300"  },
  { bar: "bg-amber-400/50   border-amber-400/30",    text: "text-amber-300"    },
  { bar: "bg-sky-400/50     border-sky-400/30",      text: "text-sky-300"      },
];

function EngineerGantt({ engineers }) {
  const rows = engineers
    .map((eng, i) => {
      if (!eng.startDate || !eng.startTime) return null;
      const start = new Date(`${eng.startDate}T${eng.startTime}`);
      if (isNaN(start.getTime())) return null;
      const hours = parseDurationHours(eng.estimatedDuration);
      const end   = new Date(start.getTime() + hours * 3_600_000);
      return { eng, i, start, end, hours };
    })
    .filter(Boolean);

  if (rows.length < 1) return null;

  const minMs = Math.min(...rows.map((r) => r.start.getTime()));
  const maxMs = Math.max(...rows.map((r) => r.end.getTime()));
  const span  = maxMs - minMs;
  if (span <= 0) return null;

  const toPct  = (ms) => ((ms - minMs) / span) * 100;
  const fmtT   = (d)  => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const fmtD   = (d)  => d.toLocaleDateString("en-GB",  { weekday: "short", day: "numeric", month: "short" });

  // Hour ticks
  const ticks = [];
  const cursor = new Date(minMs);
  cursor.setMinutes(0, 0, 0);
  if (cursor.getTime() < minMs) cursor.setHours(cursor.getHours() + 1);
  while (cursor.getTime() <= maxMs) {
    ticks.push({ pct: toPct(cursor.getTime()), label: fmtT(cursor) });
    cursor.setHours(cursor.getHours() + 1);
  }

  // Detect any overlap between rows
  let hasOverlap = false;
  for (let a = 0; a < rows.length && !hasOverlap; a++) {
    for (let b = a + 1; b < rows.length && !hasOverlap; b++) {
      if (rows[a].start < rows[b].end && rows[a].end > rows[b].start) hasOverlap = true;
    }
  }

  // Days spanned (for multi-day label)
  const dayLabels = [...new Set(rows.flatMap((r) => [fmtD(r.start), fmtD(r.end)]))];

  return (
    <div className="border-t border-obsidianHighlight/50 px-4 pt-3 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Timeline</span>
        {hasOverlap ? (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            Engineers overlapping — working together
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
            Sequential — no overlap
          </span>
        )}
        {dayLabels.length > 1 && (
          <span className="text-[9px] text-white/25 ml-auto">{dayLabels.join(" → ")}</span>
        )}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5">
        {rows.map((row, ri) => {
          const col  = GANTT_COLORS[ri % GANTT_COLORS.length];
          const lPct = toPct(row.start.getTime());
          const wPct = toPct(row.end.getTime()) - lPct;

          return (
            <div key={row.eng.id} className="flex items-center gap-2 h-7">
              {/* Name */}
              <span className={`w-20 shrink-0 text-right text-[10px] font-medium truncate ${col.text}`}>
                {row.eng.displayName.split(" ")[0]}
              </span>
              {/* Track */}
              <div className="flex-1 relative h-6 rounded bg-white/[0.03] border border-white/[0.05]">
                {/* Hour guide lines */}
                {ticks.map((tk, ti) =>
                  tk.pct > 0 && tk.pct < 100 ? (
                    <div key={ti} className="absolute top-0 bottom-0 border-l border-white/[0.07]"
                      style={{ left: `${tk.pct}%` }} />
                  ) : null
                )}
                {/* Bar */}
                <div
                  className={`absolute top-0.5 bottom-0.5 rounded border ${col.bar} flex items-center px-1.5 overflow-hidden`}
                  style={{ left: `${lPct}%`, width: `${Math.max(wPct, 1)}%` }}
                  title={`${fmtD(row.start)} · ${fmtT(row.start)} → ${fmtT(row.end)}`}
                >
                  <span className="text-[9px] text-white/75 font-medium whitespace-nowrap truncate">
                    {fmtT(row.start)} – {fmtT(row.end)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Tick label row */}
        <div className="flex items-start gap-2">
          <div className="w-20 shrink-0" />
          <div className="flex-1 relative h-4">
            {ticks.map((tk, ti) => (
              <span
                key={ti}
                className="absolute text-[8px] text-white/20 -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${tk.pct}%` }}
              >
                {tk.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EngineerTab({ woFields, setWoFields, onChange, caseItem, cases, onToast, onScheduleSave }) {
  const [search,          setSearch]          = useState("");
  const [calledIds,       setCalledIds]       = useState(new Set());
  const [callTarget,      setCallTarget]      = useState(null);
  const [callMinimized,   setCallMinimized]   = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null); // engineer to show in profile modal

  const campus       = caseItem?.location?.campus ?? null;
  const categoryId   = getCategoryGroupId(caseItem?.ServiceCategory);
  const assignedList = woFields.assignedEngineers ?? [];
  const assignedIds  = new Set(assignedList.map((e) => e.id));

  // Map engineer id → active WOs they're on (excluding this case, excluding done/cancelled)
  const engineerActiveWOs = useMemo(() => {
    const map = new Map(); // id → WO[]
    (cases ?? []).forEach((c) => {
      if (c.id === caseItem?.id) return;
      if (["Completed", "Cancelled"].includes(c.workOrderStatus)) return;
      const ids = new Set([
        ...(c.assignedEngineers ?? []).map((e) => e.id),
        ...(c.assignedToId ? [c.assignedToId] : []),
      ]);
      ids.forEach((id) => {
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(c);
      });
    });
    return map;
  }, [cases, caseItem?.id]);

  // Engineer pool: campus → skill → search filters, with skill-matched first
  const pool = useMemo(() => {
    const base = WORKERS_DATA.filter((w) => {
      if (campus     && !w.campuses?.includes(campus))   return false;
      if (categoryId && !w.skills?.includes(categoryId)) return false;
      if (search) {
        const q = search.toLowerCase();
        return w.displayName.toLowerCase().includes(q) || w.workerRole.toLowerCase().includes(q);
      }
      return true;
    });
    const score = (w) => {
      const wJobs = engineerActiveWOs.get(w.id) ?? [];
      if (assignedIds.has(w.id))                              return 0; // assigned always first
      if (wJobs.length >= MAX_CONCURRENT_JOBS)                return 4; // fully booked — bottom (but still selectable)
      if (categoryId && w.skills?.includes(categoryId))       return 1; // skill match
      if (wJobs.length > 0)                                   return 3; // on other jobs
      return 2;                                                          // available
    };
    return [...base].sort((a, b) => score(a) - score(b));
  }, [campus, categoryId, search, engineerActiveWOs, assignedIds]);

  const addEngineer = (worker) => {
    if (assignedIds.has(worker.id)) return;
    const isFirst = assignedList.length === 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // For additional engineers, stagger start time after the previous engineer's estimated end
    let defaultDate = tomorrowStr;
    let defaultTime = "09:00";
    if (!isFirst && assignedList.length > 0) {
      const prev = assignedList[assignedList.length - 1];
      if (prev.startDate) defaultDate = prev.startDate;
      if (prev.startTime) {
        const [h, m] = prev.startTime.split(":").map(Number);
        const durH   = parseDurationHours(prev.estimatedDuration);
        const newH   = h + Math.ceil(durH);
        defaultTime  = `${String(newH % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }

    const entry = {
      id: worker.id,
      displayName: worker.displayName,
      workerRole:  worker.workerRole,
      isLead:      isFirst,
      startDate:        defaultDate,
      startTime:        defaultTime,
      estimatedDuration: woFields.estimatedDuration || "2 hours",
    };
    const updated = [...assignedList, entry];
    const lead    = updated.find((e) => e.isLead) ?? updated[0];

    setWoFields((prev) => ({
      ...prev,
      assignedEngineers: updated,
      assignedTo:        lead.displayName,
      assignedToId:      lead.id,
      // Keep global schedule in sync with lead engineer's slot
      scheduledDate:     lead.startDate || prev.scheduledDate || tomorrowStr,
      scheduledTime:     lead.startTime || prev.scheduledTime || "09:00",
      estimatedDuration: prev.estimatedDuration || "2 hours",
    }));
  };

  const removeEngineer = (id) => {
    const filtered = assignedList.filter((e) => e.id !== id);
    const reLeaded = filtered.map((e, i) => ({ ...e, isLead: i === 0 }));
    const lead     = reLeaded[0] ?? null;
    setWoFields((prev) => ({ ...prev, assignedEngineers: reLeaded, assignedTo: lead?.displayName ?? null, assignedToId: lead?.id ?? null }));
  };

  const makeLeadEngineer = (id) => {
    const reLeaded = assignedList.map((e) => ({ ...e, isLead: e.id === id }));
    const lead     = reLeaded.find((e) => e.isLead);
    setWoFields((prev) => ({ ...prev, assignedEngineers: reLeaded, assignedTo: lead.displayName, assignedToId: lead.id }));
  };

  const updateEngineerSchedule = (id, key, val) => {
    setWoFields((prev) => {
      const updated = (prev.assignedEngineers ?? []).map((e) =>
        e.id === id ? { ...e, [key]: val } : e
      );
      // Keep global schedule in sync with the lead engineer
      const lead = updated.find((e) => e.isLead) ?? updated[0];
      return {
        ...prev,
        assignedEngineers: updated,
        scheduledDate: lead?.startDate ?? prev.scheduledDate,
        scheduledTime: lead?.startTime ?? prev.scheduledTime,
      };
    });
    // Notify on date/time changes (not on every duration keystroke)
    if (key === "startDate" || key === "startTime") {
      const eng = (woFields.assignedEngineers ?? []).find((e) => e.id === id);
      onToast?.({
        type:     "info",
        title:    "Schedule updated",
        body:     `${eng?.displayName?.split(" ")[0] ?? "Engineer"}'s schedule has been updated — click Save to persist changes.`,
        duration: 4000,
      });
    }
  };

  // Open the outbound call modal for a given worker
  const openCall = (worker) => { setCallTarget(worker); setCallMinimized(false); };

  // Called when the modal closes — wasCalled=true means a connection was made
  const handleCallClose = (wasCalled) => {
    if (wasCalled && callTarget) {
      setCalledIds((prev) => new Set([...prev, callTarget.id]));
    }
    setCallTarget(null);
    setCallMinimized(false);
  };

  // Restore modal when the nav phone button is clicked while outbound is minimized
  useEffect(() => {
    const handler = () => setCallMinimized(false);
    window.addEventListener("call:outbound:restore", handler);
    return () => window.removeEventListener("call:outbound:restore", handler);
  }, []);

  // Build call brief from case context
  const woInfo = {
    title:    caseItem?.title || null,
    woNumber: caseItem?.workOrderNumber ?? null,
    skill:    categoryId,
    location: [caseItem?.location?.building, caseItem?.location?.block && `Block ${caseItem.location.block}`].filter(Boolean).join(" · ") || null,
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Engineer profile modal ── */}
      {selectedProfile && (
        <EngineerProfileModal
          engineer={selectedProfile}
          allCases={cases}
          onClose={() => setSelectedProfile(null)}
        />
      )}

      {/* ── Outbound call modal — rendered at root so it floats above all tabs ── */}
      {callTarget && (
        <OutboundCallModal
          engineer={callTarget}
          woInfo={woInfo}
          onClose={handleCallClose}
          minimized={callMinimized}
          onMinimize={() => {
            setCallMinimized(true);
            window.dispatchEvent(new CustomEvent("call:outbound:minimize"));
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          ENGINEERS — pool + assignment in one panel
      ═══════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-obsidianHighlight bg-obsidianNight/40 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-obsidianHighlight">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-2.5">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <Users className="size-3.5 text-white/40" />
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Engineers</span>
              </div>
              {assignedList.length > 0 && (
                <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-px rounded-full bg-electricBlue/15 text-electricBlue whitespace-nowrap">
                  <UserCheck className="size-2.5" /> {assignedList.length} assigned
                </span>
              )}
              <span className="shrink-0 text-[10px] text-white/25 whitespace-nowrap">{pool.length} match</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5">
              {campus && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 border border-violet-400/20 whitespace-nowrap">
                  <MapPinIcon className="size-2.5" /> {campus}
                </span>
              )}
              {categoryId && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/20 whitespace-nowrap">
                  <Wrench className="size-2.5" /> {SKILL_LABEL[categoryId]}
                </span>
              )}
              {!campus && !categoryId && (
                <span className="shrink-0 text-[10px] text-white/20 italic whitespace-nowrap">All engineers</span>
              )}
            </div>
          </div>

          {/* Skill filter sub-message */}
          <p className="text-[10px] text-white/25 mb-2">
            {categoryId
              ? <>Engineers listed are matched to the <span className="text-white/40 font-medium">{SKILL_LABEL[categoryId]}</span> skill set required for this job.</>
              : campus
                ? <>Engineers listed are deployed to <span className="text-white/40 font-medium">{campus}</span>. Set a service category to further filter by skill.</>
                : <>All engineers are shown. Set a campus and service category on the Summary tab to filter by skill and location.</>
            }
          </p>

          {/* Assign hint */}
          {assignedList.length === 0 && (
            <p className="text-[10px] text-amber-400/60 flex items-center gap-1 mb-2.5">
              <Lock className="size-2.5" /> Call an engineer to confirm availability, then assign
            </p>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidianSurface border border-obsidianHighlight focus-within:border-electricBlue/40 transition-colors">
            <Search className="size-3 text-white/25 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or role…"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/20 outline-none" />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/20 hover:text-white/60 text-[10px]">✕</button>
            )}
          </div>
        </div>

        {/* List */}
        {pool.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Wrench className="size-6 text-white/10" />
            <p className="text-xs text-white/25">No engineers match these filters</p>
            {(campus || categoryId) && (
              <p className="text-[10px] text-white/15">Update the campus or service category on the Summary tab</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-obsidianHighlight">
            {pool.map((w) => {
              const assignedEntry  = assignedList.find((e) => e.id === w.id);
              const isAssigned     = !!assignedEntry;
              const isLead         = assignedEntry?.isLead ?? false;
              const activeWOs      = engineerActiveWOs.get(w.id) ?? [];
              const isOnOtherJobs  = activeWOs.length > 0;
              const isFullyBooked  = !isAssigned && activeWOs.length >= MAX_CONCURRENT_JOBS;
              const wasCalled      = calledIds.has(w.id);
              const skillMatch     = categoryId ? w.skills?.includes(categoryId) : false;
              const shiftOn        = isShiftActive(w.shift);

              return (
                <div key={w.id}
                  className={[
                    "flex flex-col gap-0 px-4 py-3 transition-colors",
                    isAssigned ? "bg-electricBlue/[0.04]" : "hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={[
                    "size-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                    isLead      ? "bg-electricBlue/20 text-electricBlue ring-2 ring-electricBlue/30 ring-offset-1 ring-offset-obsidianSurface"
                    : isAssigned ? "bg-electricBlue/15 text-electricBlue ring-1 ring-electricBlue/20"
                    : skillMatch ? "bg-sky-400/15 text-sky-300"
                    : "bg-white/[0.08] text-white/40",
                  ].join(" ")}>
                    {getInitials(w.displayName)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Clickable name → profile modal */}
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(w)}
                        className="text-[12px] font-semibold text-white/90 hover:text-electricBlue hover:underline underline-offset-2 transition-colors truncate text-left"
                      >
                        {w.displayName}
                      </button>
                      {isLead && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-px rounded-full bg-electricBlue/15 text-electricBlue border border-electricBlue/20 uppercase tracking-wide">
                          <Star className="size-2" /> Lead
                        </span>
                      )}
                      {isAssigned && !isLead && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-px rounded-full bg-electricBlue/10 text-electricBlue/70 border border-electricBlue/15">
                          <UserCheck className="size-2" /> Assigned
                        </span>
                      )}
                      {isFullyBooked && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-px rounded-full bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
                          Unavailable
                        </span>
                      )}
                      {isOnOtherJobs && !isFullyBooked && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-px rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          <Clock className="size-2" /> {activeWOs.length} active WO{activeWOs.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {!isAssigned && !isOnOtherJobs && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-px rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available
                        </span>
                      )}
                      {wasCalled && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-px rounded-full bg-teal-400/10 text-teal-400 border border-teal-400/20">
                          <PhoneCall className="size-2" /> Called
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-white/35">{w.workerRole}</span>
                      {w.shift && (
                        <>
                          <span className="text-white/15 text-[9px]">·</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-white/30">
                            <Clock className="size-2.5" />
                            {w.shift.label} · {w.shift.hours}
                            {shiftOn && <span className="ml-0.5 size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />}
                          </span>
                        </>
                      )}
                      {w.skills?.length > 0 && (
                        <>
                          <span className="text-white/15 text-[9px]">·</span>
                          <span className="flex items-center gap-1 flex-wrap">
                            {w.skills.map((sk) => (
                              <span key={sk} className={`text-[9px] px-1 py-px rounded border font-medium ${
                                sk === categoryId
                                  ? "bg-sky-400/15 text-sky-300 border-sky-400/25"
                                  : "bg-white/[0.04] text-white/20 border-white/[0.06]"}`}>
                                {SKILL_LABEL[sk] ?? sk}
                              </span>
                            ))}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Call */}
                    <button type="button" onClick={() => openCall(w)}
                      className={[
                        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors",
                        wasCalled
                          ? "bg-teal-400/10 text-teal-400 border-teal-400/20 hover:bg-teal-400/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
                      ].join(" ")}>
                      <Phone className="size-3" />{wasCalled ? "Call Again" : "Call"}
                    </button>

                    {isAssigned ? (
                      <>
                        {!isLead && (
                          <button type="button" onClick={() => makeLeadEngineer(w.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-electricBlue/10 text-white/40 hover:text-electricBlue border border-white/10 hover:border-electricBlue/20 text-[10px] font-medium transition-colors">
                            Set Lead
                          </button>
                        )}
                        <button type="button" onClick={() => removeEngineer(w.id)}
                          className="size-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-colors">
                          <X className="size-3.5" />
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => addEngineer(w)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors bg-electricBlue hover:bg-electricBlue/80 text-white border-transparent">
                        <PlusCircle className="size-3" />Assign
                      </button>
                    )}
                  </div>
                </div>{/* end inner flex row */}

                {/* Coordination — other active WOs with schedule */}
                {isOnOtherJobs && (
                  <div className="ml-12 mt-1.5 flex flex-col gap-1">
                    {activeWOs.map((wo) => (
                      <div key={wo.id} className="flex items-center gap-2 flex-wrap px-2 py-1 rounded-md bg-amber-400/5 border border-amber-400/10">
                        <span className="text-[9px] font-semibold text-amber-400/80">{wo.workOrderNumber}</span>
                        <span className="text-[9px] text-white/30 truncate max-w-[140px]">{wo.title}</span>
                        {wo.scheduledDate && (
                          <>
                            <span className="text-white/15 text-[8px]">·</span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-white/35">
                              <Calendar className="size-2.5" />
                              {new Date(wo.scheduledDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              {wo.scheduledTime && ` · ${wo.scheduledTime}`}
                            </span>
                          </>
                        )}
                        {wo.estimatedDuration && (
                          <>
                            <span className="text-white/15 text-[8px]">·</span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-white/35">
                              <Clock className="size-2.5" />{wo.estimatedDuration}
                            </span>
                          </>
                        )}
                        <span className={`ml-auto text-[9px] font-medium px-1.5 py-px rounded-full border ${
                          WO_STATUS_STYLE[wo.workOrderStatus]?.text ?? "text-white/30"
                        } ${WO_STATUS_STYLE[wo.workOrderStatus]?.bg ?? ""} ${WO_STATUS_STYLE[wo.workOrderStatus]?.border ?? "border-white/10"}`}>
                          {wo.workOrderStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — PER-ENGINEER SCHEDULE + GANTT CHART
      ═══════════════════════════════════════════════════════ */}
      {assignedList.length > 0 && (
        <div className="rounded-xl border border-obsidianHighlight bg-obsidianNight/40 overflow-hidden">
          {/* ── Schedule header: auto-computed total duration dropdown + Update button ── */}
          {(() => {
            // Compute auto-estimated total duration from engineer slots
            const scheduled = assignedList.filter((e) => e.startDate && e.startTime);
            let autoHours = null;
            if (scheduled.length > 0) {
              const starts = scheduled.map((e) => new Date(`${e.startDate}T${e.startTime}`).getTime());
              const ends   = scheduled.map((e) => {
                const s = new Date(`${e.startDate}T${e.startTime}`).getTime();
                return s + parseDurationHours(e.estimatedDuration) * 3_600_000;
              });
              autoHours = (Math.max(...ends) - Math.min(...starts)) / 3_600_000;
            }
            // Find the closest DURATION_OPTIONS entry to autoHours for display
            const autoLabel = autoHours !== null
              ? (() => {
                  const closest = DURATION_OPTIONS.reduce((best, opt) =>
                    Math.abs(opt.hours - autoHours) < Math.abs(best.hours - autoHours) ? opt : best
                  );
                  return closest.label;
                })()
              : null;

            return (
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-obsidianHighlight">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-white/40" />
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Schedule</span>
                  {assignedList.length > 1 && (
                    <span className="text-[10px] text-white/25">— each engineer has their own slot</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3 text-white/30 shrink-0" />
                  <span className="text-[10px] text-white/40 whitespace-nowrap">Est. Total Duration</span>
                  <select
                    value={woFields.estimatedDuration ?? autoLabel ?? ""}
                    onChange={(e) => onChange("estimatedDuration", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-obsidianElevated border border-obsidianHighlight text-[11px] text-white/80 focus:outline-none focus:border-electricBlue/50 focus:ring-1 focus:ring-electricBlue/20 transition-colors appearance-none cursor-pointer"
                  >
                    {autoLabel && !DURATION_OPTIONS.find((o) => o.label === woFields.estimatedDuration) && (
                      <option value={autoLabel}>{autoLabel} (auto)</option>
                    )}
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onScheduleSave}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-electricBlue hover:bg-electricBlue/80 text-white text-[11px] font-semibold transition-colors shrink-0 shadow-sm shadow-electricBlue/20"
                  >
                    <Check className="size-3" /> Update
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Per-engineer schedule rows */}
          <div className="divide-y divide-obsidianHighlight/40">
            {assignedList.map((eng) => (
              <div key={eng.id} className="px-4 py-3">
                {/* Engineer label */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${eng.isLead ? "bg-electricBlue/20 text-electricBlue ring-1 ring-electricBlue/30" : "bg-white/[0.08] text-white/50"}`}>
                    {eng.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-white/70">{eng.displayName}</span>
                  {eng.isLead && (
                    <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-electricBlue/10 text-electricBlue border border-electricBlue/20 uppercase tracking-wide">Lead</span>
                  )}
                </div>
                {/* Date / Time / Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Start Date</label>
                    <input
                      type="date"
                      value={eng.startDate ?? ""}
                      onChange={(e) => updateEngineerSchedule(eng.id, "startDate", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-obsidianElevated border border-obsidianHighlight text-xs text-white/80 focus:outline-none focus:border-electricBlue/50 focus:ring-1 focus:ring-electricBlue/20 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Start Time</label>
                    <input
                      type="time"
                      value={eng.startTime ?? ""}
                      onChange={(e) => updateEngineerSchedule(eng.id, "startTime", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-obsidianElevated border border-obsidianHighlight text-xs text-white/80 focus:outline-none focus:border-electricBlue/50 focus:ring-1 focus:ring-electricBlue/20 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Duration</label>
                    <select
                      value={eng.estimatedDuration ?? ""}
                      onChange={(e) => updateEngineerSchedule(eng.id, "estimatedDuration", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-obsidianElevated border border-obsidianHighlight text-xs text-white/80 focus:outline-none focus:border-electricBlue/50 focus:ring-1 focus:ring-electricBlue/20 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select…</option>
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gantt chart */}
          {assignedList.some((e) => e.startDate && e.startTime) && (
            <EngineerGantt engineers={assignedList} />
          )}
        </div>
      )}

    </div>
  );
}

// ─── Tab: Calendar ────────────────────────────────────────────────────────────
function CalendarTab({ woFields, caseItem }) {
  const hasSchedule = woFields.scheduledDate || woFields.scheduledTime;
  const engineer    = WORKERS_DATA.find((w) => w.id === woFields.assignedToId);

  return (
    <div className="flex flex-col gap-3">
      <SectionCard title="Scheduled Visit" icon={Calendar}>
        {hasSchedule ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-4 px-4 py-4 rounded-lg bg-obsidianElevated border border-obsidianHighlight">
              <div className="flex flex-col items-center justify-center size-14 rounded-lg bg-violet-400/10 border border-violet-400/20">
                {woFields.scheduledDate ? (
                  <>
                    <span className="text-xs font-bold text-violet-300 leading-tight">
                      {new Date(woFields.scheduledDate).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold text-violet-200 leading-tight">
                      {new Date(woFields.scheduledDate).getDate()}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-white/25">No date</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-white">
                  {woFields.scheduledDate
                    ? new Date(woFields.scheduledDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                    : "Date not set"}
                </p>
                {woFields.scheduledTime && (
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Clock className="size-3" />
                    <span className="text-xs">{woFields.scheduledTime}</span>
                  </div>
                )}
                {woFields.estimatedDuration && (
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Clock className="size-3" />
                    <span className="text-xs">Est. {woFields.estimatedDuration}</span>
                  </div>
                )}
                {engineer && (
                  <div className="flex items-center gap-1.5 text-white/50 mt-0.5">
                    <User className="size-3" />
                    <span className="text-xs">{engineer.displayName} · {engineer.workerRole}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-3 py-2 rounded-md bg-white/[0.03] border border-obsidianHighlight">
              <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wide">Work Order</p>
              <p className="text-xs text-white/60">{caseItem?.workOrderNumber} — {caseItem?.title || "Untitled"}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Calendar className="size-8 text-white/10" />
            <p className="text-sm text-white/25">No schedule set</p>
            <p className="text-[11px] text-white/15">Go to the Engineer tab to schedule a visit</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Auto-email helpers ───────────────────────────────────────────────────────
// Lifecycle templates (Converted / Acknowledged / Completed) live in
// utils/comms so the case page and the WO page stay in lock-step. Intermediate
// transitions (In Progress, Final Response) are kept inline here.
function buildStatusEmail(status, caseItem, engineer) {
  if (status === "Acknowledged" || status === "Completed") {
    return buildLifecycleMessage(status, caseItem, engineer);
  }

  const caseId   = caseItem?.caseId ?? "—";
  const title    = caseItem?.title || "your maintenance request";
  const engName  = engineer?.displayName ?? "our maintenance team";
  const trackUrl = buildTrackingLink(caseItem?.caseId);
  const trackLn  = trackUrl ? `You can follow live progress here: ${trackUrl}\n\n` : "";

  if (status === "In Progress") {
    return {
      id:      Date.now(),
      from:    "agent",
      subject: `Update on ${caseId} — Work Has Begun`,
      text:
        `Dear ${caseItem?.requester?.displayName ?? "Resident"},\n\n` +
        `We wanted to let you know that work has now started on ${title}.\n\n` +
        `Your assigned engineer is ${engName}. We will update you once the work is complete.\n\n` +
        trackLn +
        `Case: ${caseId}\n\n` +
        `Kind regards,\nMaintenance Team`,
      time:    nowTime(),
      date:    nowISO(),
    };
  }

  if (status === "Awaiting Parts") {
    // Translate the partsExpectedIn flag (set on the WO) into something
    // human-readable for the customer email body.
    const expected = {
      "days":      "the next few days",
      "1-2weeks":  "the next 1–2 weeks",
      "1month":    "around a month",
      "2months+":  "longer than two months",
    }[caseItem?.partsExpectedIn ?? ""] ?? null;

    const timeframeLn = expected
      ? `Based on our supplier's lead time we expect the parts within ${expected}, and your resolve SLA has been extended accordingly.\n\n`
      : "Your resolve SLA has been extended to cover the delay — we'll keep you updated.\n\n";

    return {
      id:      Date.now(),
      from:    "agent",
      subject: `Update on ${caseId} — Awaiting Parts`,
      text:
        `Dear ${caseItem?.requester?.displayName ?? "Resident"},\n\n` +
        `We're working on ${title}, but we need to order in parts before ${engName} can complete the repair.\n\n` +
        timeframeLn +
        `We'll be in touch as soon as the parts arrive and work resumes.\n\n` +
        trackLn +
        `Case: ${caseId}\n\n` +
        `Kind regards,\nMaintenance Team`,
      time:    nowTime(),
      date:    nowISO(),
    };
  }

  if (status === "Final Response") {
    return {
      id:      Date.now(),
      from:    "agent",
      subject: `Update on ${caseId} — Work Resumed`,
      text:
        `Dear ${caseItem?.requester?.displayName ?? "Resident"},\n\n` +
        `Good news — the parts we were waiting on have now arrived and ${engName} has resumed work on ${title}.\n\n` +
        `We will be in touch once the job is fully completed.\n\n` +
        trackLn +
        `Case: ${caseId}\n\n` +
        `Kind regards,\nMaintenance Team`,
      time:    nowTime(),
      date:    nowISO(),
    };
  }

  return null;
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      toast.duration ?? 6000
    );
  }, []);
  const dismiss = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );
  return { toasts, push, dismiss };
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => {
        const colours =
          t.type === "success" ? { wrap: "bg-emerald-950/95 border-emerald-500/30", dot: "bg-emerald-400", title: "text-emerald-300" } :
          t.type === "warning" ? { wrap: "bg-orange-950/95 border-orange-500/30",   dot: "bg-orange-400",  title: "text-orange-300"  } :
          t.type === "error"   ? { wrap: "bg-red-950/95 border-red-500/30",          dot: "bg-red-400",     title: "text-red-300"     } :
                                 { wrap: "bg-obsidianElevated border-obsidianHighlight", dot: "bg-electricBlue", title: "text-white" };
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl shadow-black/60 border backdrop-blur-sm ${colours.wrap}`}
          >
            <span className={`size-2 rounded-full shrink-0 mt-1.5 ${colours.dot}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-semibold leading-snug ${colours.title}`}>{t.title}</p>
              {t.body && (
                <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">{t.body}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-white/25 hover:text-white/60 transition-colors mt-0.5"
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WOManage() {
  const { id }                = useParams();
  const navigate              = useNavigate();
  const { cases, updateCase } = useCases();
  const containerRef          = useRef(null);
  const [leftPct, setLeftPct] = useState(30);
  const [activeTab, setActiveTab] = useState("summary");

  const caseItem = cases.find((c) => c.id === Number(id));
  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();

  // WO-specific fields (status, engineers, schedule)
  const [woFields, setWoFields] = useState({
    workOrderStatus:   caseItem?.workOrderStatus   ?? "Dispatched",
    assignedEngineers: caseItem?.assignedEngineers ?? [],
    // backward-compat single fields — always mirror lead engineer
    assignedTo:        caseItem?.assignedTo        ?? null,
    assignedToId:      caseItem?.assignedToId      ?? null,
    scheduledDate:     caseItem?.scheduledDate     ?? "",
    scheduledTime:     caseItem?.scheduledTime     ?? "",
    estimatedDuration: caseItem?.estimatedDuration ?? "",
    // Status milestone timestamps — recorded automatically on every status save
    dispatchedAt:      caseItem?.dispatchedAt      ?? caseItem?.workOrderCreatedAt ?? null,
    acknowledgedAt:    caseItem?.acknowledgedAt    ?? null,
    inProgressAt:      caseItem?.inProgressAt      ?? null,
    respondedAt:       caseItem?.respondedAt       ?? null,
    awaitingPartsAt:   caseItem?.awaitingPartsAt   ?? null,
    partsExpectedIn:   caseItem?.partsExpectedIn   ?? "",   // "days"|"1-2weeks"|"1month"|"2months+"
    finalResponseAt:   caseItem?.finalResponseAt   ?? null,
    completedAt:       caseItem?.completedAt       ?? null,
  });

  // SLA deadlines — used for shift-handoff banner
  const { resolveDl } = useSlaDeadlines(caseItem, woFields.workOrderStatus, woFields.partsExpectedIn);

  // Case detail fields — same shape as Manage.jsx
  const [fields, setFields] = useState({
    caseId:            caseItem?.caseId ?? "",
    requester:         caseItem?.requester?.displayName ?? "",
    affectedRequester: caseItem?.affectedRequester ?? {},
    description:       caseItem?.description ?? "",
    requesterEmail:    caseItem?.requester?.email ?? "",
    clientEmployee:    caseItem?.requester?.clientEmployee ?? false,
    isStudent:         caseItem?.requester?.isStudent ?? false,
    requesterExist:    caseItem?.requester?.requesterExist ?? false,
    requestTypes:      caseItem?.requestTypes ?? "",
    source:            caseItem?.source ?? "",
    contractType:      caseItem?.requester?.contractType ?? "",
    site:              caseItem?.requester?.site ?? "",
    case_status:       caseItem?.case_status ?? "Converted",
    priority:          caseItem?.priority ?? "",
    ServiceCategory:   caseItem?.ServiceCategory ?? null,
    sharedIssue:       caseItem?.sharedIssue ?? false,
    campus:            caseItem?.location?.campus ?? "",
    building:          caseItem?.location?.building ?? "",
    block:             caseItem?.location?.block ?? "",
    floor:             caseItem?.location?.floor ?? "",
    flat:              caseItem?.location?.flat ?? "",
    room:              caseItem?.location?.room ?? "",
  });

  const [notes,           setNotes]           = useState(caseItem?.woNotes  ?? []);
  const [messages,        setMessages]        = useState(caseItem?.messages ?? []);
  const [log,             setLog]             = useState(caseItem?.woLog    ?? []);
  // Phone-source call history — mirrors the case page's behaviour. Seeded with
  // at least one session for phone cases so the textareas have something to
  // bind to on the very first render.
  const [callSessions,    setCallSessions]    = useState(() => {
    if (caseItem?.callSessions?.length) return caseItem.callSessions;
    if (caseItem?.callNotes || caseItem?.callTranscription) {
      return [{
        id:            "call-legacy",
        startedAt:     caseItem?.createdAt ?? new Date().toISOString(),
        notes:         caseItem?.callNotes ?? "",
        transcription: caseItem?.callTranscription ?? "",
      }];
    }
    return caseItem?.source === "Phone"
      ? [{
          id:            `call-${Date.now()}`,
          startedAt:     new Date().toISOString(),
          notes:         "",
          transcription: "",
        }]
      : [];
  });
  // pendingStatus: status selected in dropdown but not yet saved
  const [pendingStatus,   setPendingStatus]   = useState(null);
  // showPartsModal: locked modal that appears after "Awaiting Parts" is saved
  const [showPartsModal,  setShowPartsModal]  = useState(false);
  // showSource: toggle the left source-thread panel
  // Default closed on small screens so the right pane fills the width.
  const [showSource,      setShowSource]      = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches
  );

  // ── Reset ALL local state when navigating between work orders ─────────────────
  // useState only initialises once on mount; without this, navigating from e.g.
  // WO-2001 (awaitingPartsAt set) to WO-2003 (no awaitingPartsAt) would keep
  // WO-2001's stale values in every state slice.
  useEffect(() => {
    if (!caseItem) return;
    setWoFields({
      workOrderStatus:   caseItem.workOrderStatus   ?? "Dispatched",
      assignedEngineers: caseItem.assignedEngineers ?? [],
      assignedTo:        caseItem.assignedTo        ?? null,
      assignedToId:      caseItem.assignedToId      ?? null,
      scheduledDate:     caseItem.scheduledDate     ?? "",
      scheduledTime:     caseItem.scheduledTime     ?? "",
      estimatedDuration: caseItem.estimatedDuration ?? "",
      dispatchedAt:      caseItem.dispatchedAt      ?? caseItem.workOrderCreatedAt ?? null,
      acknowledgedAt:    caseItem.acknowledgedAt    ?? null,
      inProgressAt:      caseItem.inProgressAt      ?? null,
      respondedAt:       caseItem.respondedAt       ?? null,
      awaitingPartsAt:   caseItem.awaitingPartsAt   ?? null,
      partsExpectedIn:   caseItem.partsExpectedIn   ?? "",
      finalResponseAt:   caseItem.finalResponseAt   ?? null,
      completedAt:       caseItem.completedAt       ?? null,
    });
    setFields({
      caseId:            caseItem.caseId ?? "",
      requester:         caseItem.requester?.displayName ?? "",
      affectedRequester: caseItem.affectedRequester ?? {},
      description:       caseItem.description ?? "",
      requesterEmail:    caseItem.requester?.email ?? "",
      clientEmployee:    caseItem.requester?.clientEmployee ?? false,
      isStudent:         caseItem.requester?.isStudent ?? false,
      requesterExist:    caseItem.requester?.requesterExist ?? false,
      requestTypes:      caseItem.requestTypes ?? "",
      source:            caseItem.source ?? "",
      contractType:      caseItem.requester?.contractType ?? "",
      site:              caseItem.requester?.site ?? "",
      case_status:       caseItem.case_status ?? "Converted",
      priority:          caseItem.priority ?? "",
      ServiceCategory:   caseItem.ServiceCategory ?? null,
      sharedIssue:       caseItem.sharedIssue ?? false,
      campus:            caseItem.location?.campus ?? "",
      building:          caseItem.location?.building ?? "",
      block:             caseItem.location?.block ?? "",
      floor:             caseItem.location?.floor ?? "",
      flat:              caseItem.location?.flat ?? "",
      room:              caseItem.location?.room ?? "",
    });
    setNotes(caseItem.woNotes   ?? []);
    setMessages(caseItem.messages ?? []);
    setLog(caseItem.woLog       ?? []);
    setCallSessions(() => {
      if (caseItem.callSessions?.length) return caseItem.callSessions;
      if (caseItem.callNotes || caseItem.callTranscription) {
        return [{
          id:            "call-legacy",
          startedAt:     caseItem.createdAt ?? new Date().toISOString(),
          notes:         caseItem.callNotes ?? "",
          transcription: caseItem.callTranscription ?? "",
        }];
      }
      return caseItem.source === "Phone"
        ? [{
            id:            `call-${Date.now()}`,
            startedAt:     new Date().toISOString(),
            notes:         "",
            transcription: "",
          }]
        : [];
    });
    setPendingStatus(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseItem?.id]);

  // ── Shared log-entry helper — updates state only (no updateCase side-effect).
  //    Callers that need immediate persistence must call updateCase themselves
  //    with the combined payload so both keys land in a single setCases call.
  const addLogEntry = useCallback((text, dotColor = "bg-white/30") => {
    const entry = {
      id:       Date.now(),
      text,
      author:   CURRENT_AGENT,
      time:     nowTime(),
      date:     nowISO(),
      dotColor,
    };
    setLog((prev) => [...prev, entry]);
  }, []);

  const handleWoChange = (key, val) => {
    // Update local state only — changes are committed when Save is clicked
    setWoFields((p) => ({ ...p, [key]: val }));
  };


  const buildCasePayload = () => ({
    ...caseItem,
    caseId:      fields.caseId,
    description: fields.description,
    requester: {
      ...caseItem.requester,
      displayName:    fields.requester,
      email:          fields.requesterEmail,
      clientEmployee: fields.clientEmployee,
      isStudent:      fields.isStudent,
      requesterExist: fields.requesterExist,
      contractType:   fields.contractType,
      site:           fields.site,
    },
    affectedRequester: fields.affectedRequester,
    requestTypes:      fields.requestTypes,
    source:            fields.source,
    case_status:       fields.case_status,
    priority:          fields.priority,
    ServiceCategory:   fields.ServiceCategory,
    sharedIssue:       fields.sharedIssue,
    location: {
      ...caseItem.location,
      campus:   fields.campus,
      building: fields.building,
      block:    fields.block,
      floor:    fields.floor,
      flat:     fields.flat,
      room:     fields.room,
    },
  });

  // ── Stage a status change — does NOT commit until Save is clicked ─────────────
  const handleStatusSelect = (newStatus) => {
    if (newStatus === woFields.workOrderStatus || newStatus === pendingStatus) return;
    // No-skip guard
    const allowedNext = ALLOWED_NEXT[woFields.workOrderStatus] ?? [];
    if (!allowedNext.includes(newStatus)) return;
    // Engineer gate — at least one engineer must be assigned
    const newIdx         = WO_STATUS_ORDER.indexOf(newStatus);
    const hasEngineer    = (woFields.assignedEngineers?.length ?? 0) > 0 || !!woFields.assignedToId;
    if (!hasEngineer && newIdx >= ENGINEER_REQUIRED_FROM) return;
    setPendingStatus(newStatus);
  };

  // ── dot colour helper — delegates to module-level woDotColor ─────────────────
  const statusDotColor = woDotColor;

  // ── Commit all changes (fields + pending status) on Save ──────────────────────
  const handleSave = () => {
    if (!caseItem) return;

    const hadPendingStatus = pendingStatus; // capture before it gets reset inside the block

    let finalWoFields = woFields;
    let finalLog      = log;
    let finalMessages = messages;

    if (pendingStatus) {
      // Build log entry for the committed status change
      const logEntry = {
        id:       Date.now(),
        text:     `Status changed to ${pendingStatus}`,
        author:   CURRENT_AGENT,
        time:     nowTime(),
        date:     nowISO(),
        dotColor: statusDotColor(pendingStatus),
      };
      finalLog = [...log, logEntry];

      // Auto-email on specific status transitions — use lead engineer
      const leadId   = woFields.assignedEngineers?.find((e) => e.isLead)?.id ?? woFields.assignedToId;
      const engineer = WORKERS_DATA.find((w) => w.id === leadId);
      const email    = buildStatusEmail(pendingStatus, caseItem, engineer);
      if (email) {
        finalMessages = [...messages, email];
        setMessages(finalMessages);
      }

      // Stamp the milestone timestamp for every status transition
      const tsKey = {
        "Dispatched":     "dispatchedAt",
        "Acknowledged":   "acknowledgedAt",
        "In Progress":    "inProgressAt",
        "Responded":      "respondedAt",
        "Awaiting Parts": "awaitingPartsAt",
        "Final Response": "finalResponseAt",
        "Completed":      "completedAt",
      }[pendingStatus];

      finalWoFields = {
        ...woFields,
        workOrderStatus: pendingStatus,
        ...(tsKey && !woFields[tsKey] ? { [tsKey]: nowISO() } : {}),
      };
      setWoFields(finalWoFields);
      setLog(finalLog);
      setPendingStatus(null);

      // After committing "Awaiting Parts", require a delivery timeframe via modal
      // if the user hasn't already set one via the timeline dropdown.
      if (pendingStatus === "Awaiting Parts" && !finalWoFields.partsExpectedIn) {
        setShowPartsModal(true);
      }
    }

    updateCase(caseItem.id, {
      ...buildCasePayload(),
      ...finalWoFields,
      woNotes:  notes,
      messages: finalMessages,
      woLog:    finalLog,
    });

    // Toast when partsExpectedIn was set or changed via the timeline dropdown
    const prevParts = caseItem?.partsExpectedIn ?? "";
    const nextParts = finalWoFields.partsExpectedIn ?? "";
    if (nextParts && nextParts !== prevParts) {
      const sla           = SLA_MINUTES[caseItem?.priority] ?? null;
      const created       = caseItem?.workOrderCreatedAt ?? caseItem?.dispatchedAt ?? caseItem?.createdAt ?? null;
      const extMins       = PARTS_EXTENSION[nextParts] ?? PARTS_EXTENSION_MINUTES;
      const optLabel      = PARTS_OPTIONS.find((o) => o.value === nextParts)?.label ?? nextParts;
      const baseRespondDl = computeDeadline(created, sla?.respond);
      const baseResolveDl = computeDeadline(created, sla?.resolve);
      const respondStr    = baseRespondDl ? fmtDeadlineFull(new Date(baseRespondDl.getTime() + extMins * 60_000)) : null;
      const resolveStr    = baseResolveDl ? fmtDeadlineFull(new Date(baseResolveDl.getTime() + extMins * 60_000)) : null;
      pushToast({
        type:     "success",
        title:    "Expected delivery timeframe updated",
        body:     `Set to "${optLabel}".${respondStr ? ` Final response by ${respondStr}.` : ""}${resolveStr ? ` Resolved by ${resolveStr}.` : ""}`,
        duration: 7000,
      });
    } else {
      // General save confirmation toast
      const engList   = finalWoFields.assignedEngineers ?? [];
      const engCount  = engList.length;
      const leadName  = engList.find((e) => e.isLead)?.displayName ?? engList[0]?.displayName ?? null;
      const engSuffix = engCount > 0
        ? ` ${engCount} engineer${engCount > 1 ? "s" : ""} assigned${leadName ? ` (lead: ${leadName.split(" ")[0]})` : ""}.`
        : "";
      pushToast({
        type:     "success",
        title:    hadPendingStatus ? `Status updated to "${hadPendingStatus}"` : "Work order saved",
        body:     hadPendingStatus
          ? `Status changed to ${hadPendingStatus}.${engSuffix} All changes saved.`
          : `All changes have been saved.${engSuffix}`,
        duration: 5000,
      });
    }
  };

  // ── Confirm the delivery timeframe from the post-save modal ─────────────────
  const handlePartsModalConfirm = (val) => {
    const sla      = SLA_MINUTES[caseItem?.priority] ?? null;
    const created  = caseItem?.workOrderCreatedAt ?? caseItem?.dispatchedAt ?? caseItem?.createdAt ?? null;
    const extMins  = PARTS_EXTENSION[val] ?? PARTS_EXTENSION_MINUTES;
    const optLabel = PARTS_OPTIONS.find((o) => o.value === val)?.label ?? val;

    const baseRespondDl = computeDeadline(created, sla?.respond);
    const baseResolveDl = computeDeadline(created, sla?.resolve);
    const extRespondDl  = baseRespondDl ? new Date(baseRespondDl.getTime() + extMins * 60_000) : null;
    const extResolveDl  = baseResolveDl ? new Date(baseResolveDl.getTime() + extMins * 60_000) : null;
    const respondStr    = extRespondDl ? fmtDeadlineFull(extRespondDl) : null;
    const resolveStr    = extResolveDl ? fmtDeadlineFull(extResolveDl) : null;

    const logEntry = {
      id:       Date.now(),
      text:     `Parts delivery timeframe set to "${optLabel}"${resolveStr ? ` — resolve deadline extended to ${resolveStr}` : ""}`,
      author:   CURRENT_AGENT,
      time:     nowTime(),
      date:     nowISO(),
      dotColor: "bg-orange-400",
    };
    const updatedLog = [...log, logEntry];
    setLog(updatedLog);
    setWoFields((prev) => ({ ...prev, partsExpectedIn: val }));
    setShowPartsModal(false);

    // Single combined save — partsExpectedIn + log, no race condition
    updateCase(caseItem.id, { partsExpectedIn: val, woLog: updatedLog });

    pushToast({
      type:     "success",
      title:    "Expected delivery timeframe updated",
      body:     `Set to "${optLabel}".${respondStr ? ` Final response by ${respondStr}.` : ""}${resolveStr ? ` Resolved by ${resolveStr}.` : ""}`,
      duration: 7000,
    });
  };

  // Keywords that signal parts have been ordered and work is on hold
  const PARTS_KEYWORDS = /parts\s+ordered|awaiting\s+delivery|awaiting\s+parts|parts\s+required|ordered\s+parts|on\s+hold.*parts|parts.*on\s+hold/i;

  const handleAddNote = ({ text, internal }) => {
    const note = {
      id:         Date.now(),
      text,
      internal,
      author:     CURRENT_AGENT,
      authorRole: lookupAuthorRole(CURRENT_AGENT),
      time:       nowTime(),
    };
    const updated = [...notes, note];
    setNotes(updated);
    updateCase(caseItem.id, { woNotes: updated });
    addLogEntry(
      internal ? "Internal note added" : "Note sent to requester",
      internal ? "bg-amber-400" : "bg-electricBlue"
    );

    // ── Intelligent auto-detection: stage "Awaiting Parts" as pending status.
    //    Only fires from "Responded" (the only state where Awaiting Parts is allowed next).
    //    User must still save to confirm — consistent with the save-to-progress rule.
    const eligibleForPartsHold = (ALLOWED_NEXT[woFields.workOrderStatus] ?? []).includes("Awaiting Parts");
    if (eligibleForPartsHold && !pendingStatus && PARTS_KEYWORDS.test(text)) {
      setPendingStatus("Awaiting Parts");
    }
  };

  const handleReply = (text, meta = {}) => {
    // Auto-append the customer tracking link + case reference. Same format as
    // the lifecycle emails for consistency across every customer-facing comm.
    const caseId    = caseItem?.caseId;
    const trackUrl  = buildTrackingLink(caseId);
    const finalText = caseId
      ? `${text}\n\nYou can follow live progress here: ${trackUrl}\n\nCase: ${caseId}`
      : text;
    const msg = {
      id:      Date.now(),
      from:    "agent",
      subject: meta.subject ?? `Re: ${caseItem?.title ?? ""}`,
      text:    finalText,
      time:    nowTime(),
      date:    nowISO(),
      ...meta,
    };
    const updated = [...messages, msg];
    setMessages(updated);
    updateCase(caseItem.id, { messages: updated });
    addLogEntry("Reply sent to requester", "bg-electricBlue");
  };

  const handleCancelCase = (reason, note) => {
    const cancelledAt = nowISO();
    let updatedNotes = notes;
    if (note) {
      const cancelNoteEntry = {
        id:       Date.now(),
        text:     note,
        internal: true,
        author:   CURRENT_AGENT,
        time:     nowTime(),
        tag:      "Cancellation",
      };
      updatedNotes = [...notes, cancelNoteEntry];
      setNotes(updatedNotes);
    }
    updateCase(caseItem.id, {
      case_status:        "Cancelled",
      workOrderStatus:    "Cancelled",
      cancelledAt,
      cancellationReason: reason,
      woNotes:            updatedNotes,
    });
    setFields((prev)  => ({ ...prev, case_status: "Cancelled" }));
    setWoFields((prev) => ({ ...prev, workOrderStatus: "Cancelled" }));
    addLogEntry(`Work order cancelled — ${reason}`, "bg-red-400");
  };

  // SLA breach + shift handoff — reassign lead to next-shift engineer
  const handleHandoff = (nextWorker) => {
    const updatedEngineers = (woFields.assignedEngineers ?? []).map((e) =>
      e.isLead ? { ...e, isLead: false } : e
    );
    // Add next worker as new lead if not already assigned
    const alreadyAssigned = updatedEngineers.some((e) => e.id === nextWorker.id);
    const withNewLead = alreadyAssigned
      ? updatedEngineers.map((e) => e.id === nextWorker.id ? { ...e, isLead: true } : e)
      : [...updatedEngineers, { id: nextWorker.id, displayName: nextWorker.displayName, workerRole: nextWorker.workerRole, isLead: true }];
    setWoFields((prev) => ({
      ...prev,
      assignedEngineers: withNewLead,
      assignedTo:        nextWorker.displayName,
      assignedToId:      nextWorker.id,
    }));
    addLogEntry(`Job handed off to ${nextWorker.displayName} — shift handover`, "bg-orange-400");
  };

  const handleDrag = useCallback((clientX) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    setLeftPct(Math.min(40, Math.max(20, ((clientX - left) / width) * 100)));
  }, []);

  if (!caseItem) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <CaseTabsHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-white/30">Work order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {showPartsModal && (
        <PartsDeliveryModal
          caseItem={{ ...caseItem, ...woFields }}
          onConfirm={handlePartsModalConfirm}
        />
      )}
      <CaseTabsHeader />

      <div
        ref={containerRef}
        className="case-content flex-1 min-h-0 flex flex-row items-stretch overflow-hidden"
      >
        {/* ── LEFT: Source thread — overlay on mobile, inline on lg+ ── */}
        {showSource && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setShowSource(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[420px] bg-obsidianNight shadow-2xl flex flex-col lg:contents">
              {caseItem.source === "Phone" ? (
                <PhoneSourcePanel
                  caseItem={caseItem}
                  messages={messages}
                  onReply={handleReply}
                  callSessions={callSessions}
                  onCallSessionsChange={(next) => {
                    setCallSessions(next);
                    updateCase(caseItem.id, { callSessions: next });
                  }}
                  onClose={() => setShowSource(false)}
                  leftPct={leftPct}
                />
              ) : caseItem.source === "Web Portal" ? (
                <WebPortalSourcePanel
                  caseItem={caseItem}
                  messages={messages}
                  onReply={handleReply}
                  onClose={() => setShowSource(false)}
                  leftPct={leftPct}
                />
              ) : (
                <SourceThreadPanel
                  caseItem={caseItem}
                  messages={messages}
                  onReply={handleReply}
                  onClose={() => setShowSource(false)}
                  leftPct={leftPct}
                  woStatus={woFields.workOrderStatus}
                />
              )}
            </div>
            <div className="hidden lg:contents">
              <ResizableDivider onDrag={handleDrag} />
            </div>
          </>
        )}

        {/* ── RIGHT: WO details ── */}
        <div className="h-full flex-1 flex flex-col overflow-hidden relative min-w-0">
          <WOToolbar
            woNumber={caseItem.workOrderNumber}
            woStatus={woFields.workOrderStatus}
            pendingStatus={pendingStatus}
            engineerAssigned={woFields.assignedEngineers?.length > 0 || !!woFields.assignedToId}
            onStatusChange={handleStatusSelect}
            onSave={handleSave}
            navigate={navigate}
            showSource={showSource}
            onToggleSource={() => setShowSource((v) => !v)}
          />

          <div
            className={`flex-1 overflow-y-auto py-3 sm:py-4 min-h-0 px-3 sm:px-5 ${
              showSource ? "" : "lg:px-16 xl:px-32 2xl:px-48"
            }`}
          >
            <div className="space-y-4 pb-10">
              {/* Shift-end / SLA breach handoff alert */}
              <ShiftHandoffBanner
                woFields={woFields}
                caseItem={caseItem}
                resolveDl={resolveDl}
                onHandoff={handleHandoff}
              />
              <WOHeader
                caseItem={caseItem}
                woStatus={woFields.workOrderStatus}
                partsExpectedIn={woFields.partsExpectedIn}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {activeTab === "summary" && (
                <SummaryTab
                  caseItem={caseItem}
                  fields={fields}
                  setFields={setFields}
                  onCancelCase={handleCancelCase}
                  cases={cases}
                  updateCase={updateCase}
                  woFields={woFields}
                  onWoChange={handleWoChange}
                />
              )}
              {activeTab === "history" && <HistoryTab caseItem={caseItem} log={log} messages={messages} woStatus={woFields.workOrderStatus} />}
              {activeTab === "notes" && <NotesTab notes={notes} />}
              {activeTab === "engineer" && <EngineerTab
  woFields={woFields}
  setWoFields={setWoFields}
  onChange={handleWoChange}
  caseItem={caseItem}
  cases={cases}
  onToast={pushToast}
  onScheduleSave={() => {
    updateCase(caseItem.id, {
      assignedEngineers: woFields.assignedEngineers,
      scheduledDate:     woFields.scheduledDate,
      scheduledTime:     woFields.scheduledTime,
      estimatedDuration: woFields.estimatedDuration,
    });
    pushToast({
      type:     "success",
      title:    "Schedule updated",
      body:     `Engineer schedule has been saved. Total duration: ${woFields.estimatedDuration ?? "not set"}.`,
      duration: 4000,
    });
  }}
/>}
            </div>
          </div>

          {/* Pinned at the bottom of the WO pane — same pattern as the AI fill bar */}
          {activeTab === "notes" && (
            <NoteComposer onAddNote={handleAddNote} />
          )}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRightIcon,
  CalendarIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PhoneIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClockIcon,
  LockClosedIcon,
  UsersIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";
import BackButton from "../../components/BackButton";
import { useCurrentCustomer } from "./CustomerLayout";
import ThreadPanel from "../../components/ThreadPanel";
import { getIssueScope, computeAffectedUsers } from "../../utils/locationUtils";
import { USERS_DATA } from "../../data/usersData";
import { customerCaseStatus } from "../../utils/customerStatus";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function locationSummary(loc) {
  if (!loc) return null;
  return [loc.building, loc.block ? `Block ${loc.block}` : null, loc.floor]
    .filter(Boolean).join(" · ");
}
// Customer-facing status — single source of truth in utils/customerStatus.js
const friendlyStatus = customerCaseStatus;
// Customer thread shows the agent's reply verbatim — same copy the agent
// composed/sent. Migration in CasesContext already rewrites any legacy WO
// references to case numbers, so nothing extra to strip here.
function sanitiseForCustomer(text) {
  return (text ?? "").trim();
}

// ─── Progress stages (mirror the public tracker) ─────────────────────────────
const STAGES_DEFAULT = [
  { key: "received",     label: "Request received",      tsKey: "createdAt"         },
  { key: "assigned",     label: "Engineer assigned",     tsKey: "acknowledgedAt"    },
  { key: "in_progress",  label: "Work in progress",      tsKey: "inProgressAt"      },
  { key: "completed",    label: "Completed",             tsKey: "completedAt"       },
];

const STAGES_WITH_PARTS = [
  { key: "received",       label: "Request received",      tsKey: "createdAt"         },
  { key: "assigned",       label: "Engineer assigned",     tsKey: "acknowledgedAt"    },
  { key: "in_progress",    label: "Work in progress",      tsKey: "inProgressAt"      },
  { key: "awaiting_parts", label: "Waiting for parts",     tsKey: "awaitingPartsAt"   },
  { key: "resumed",        label: "Work resumed",          tsKey: "finalResponseAt"   },
  { key: "completed",      label: "Completed",             tsKey: "completedAt"       },
];

function caseStageIndex(caseItem, stages) {
  if (caseItem.case_status === "Cancelled") return cancelledStageIndex(caseItem, stages);
  const find = (k) => stages.findIndex((s) => s.key === k);
  if (caseItem.workOrderStatus === "Completed")                                        return find("completed");
  if (caseItem.workOrderStatus === "Final Response")                                   return find("resumed");
  if (caseItem.workOrderStatus === "Awaiting Parts")                                   return find("awaiting_parts");
  if (["In Progress", "Responded"].includes(caseItem.workOrderStatus))                 return find("in_progress");
  if (caseItem.workOrderStatus === "Acknowledged")                                     return find("assigned");
  // Dispatched, no WO yet, or any "New / In Review / Qualify / Action" status
  return find("received");
}

// For cancelled cases — find the latest stage that had a timestamp before
// cancellation. Falls back to the first stage ("received") so the timeline
// always anchors somewhere.
function cancelledStageIndex(caseItem, stages) {
  for (let i = stages.length - 1; i >= 0; i--) {
    if (caseItem[stages[i].tsKey]) return i;
  }
  return 0;
}

const SOURCE_CFG = {
  "Email":      { Icon: EnvelopeIcon,               color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  "WhatsApp":   { Icon: ChatBubbleLeftEllipsisIcon, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Web Portal": { Icon: GlobeAltIcon,               color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
  "Phone":      { Icon: PhoneIcon,                  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

// ─── Progress timeline card (horizontal stepper) ─────────────────────────────
function ProgressCard({ caseItem }) {
  const onParts     = !!caseItem.awaitingPartsAt;
  const stages      = onParts ? STAGES_WITH_PARTS : STAGES_DEFAULT;
  const currentIdx  = caseStageIndex(caseItem, stages);
  const isCancelled = caseItem.case_status === "Cancelled";
  // Once the WO is Completed, every stage (including the final one) renders
  // as done — no pulsing "active" dot on the last step.
  const isComplete  = caseItem.workOrderStatus === "Completed";
  const cancelTs    = isCancelled ? (caseItem.cancelledAt ?? caseItem.updatedAt ?? null) : null;

  // Centre the current stage in the horizontal rail on small screens
  const railRef   = useRef(null);
  const stageRefs = useRef([]);
  useEffect(() => {
    const rail = railRef.current;
    const node = stageRefs.current[currentIdx];
    if (!rail || !node) return;
    const railRect = rail.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const target = nodeRect.left - railRect.left
      - rail.clientWidth / 2 + nodeRect.width / 2 + rail.scrollLeft;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [currentIdx]);

  return (
    <div className="rounded-lg bg-obsidianNight/40 px-3 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="size-3.5 text-white/30" />
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
            Progress
          </p>
        </div>
        {isCancelled && (
          <span className="text-[9px] font-semibold text-red-300 uppercase tracking-wide">
            Cancelled
          </span>
        )}
      </div>

      {/* Hide the rail's scrollbar (mobile-only) — matches CaseProgressBar */}
      <style>{`
        .customer-progress-rail::-webkit-scrollbar { display: none; }
        .customer-progress-rail { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <ol ref={railRef} className="customer-progress-rail flex items-start w-full overflow-x-auto lg:overflow-visible -mx-3 px-3 py-2 sm:mx-0 sm:px-0 sm:py-0">
        {stages.map((stage, i) => {
          // Cancelled-at stage: red X marker; everything before is done; everything after is pending
          const cancelledHere = isCancelled && i === currentIdx;
          const done          = !isCancelled
            ? (i < currentIdx || (isComplete && i <= currentIdx))
            : (i < currentIdx);
          const active        = !isCancelled && i === currentIdx && !isComplete;
          const pending       = i > currentIdx;
          const ts            = caseItem[stage.tsKey];
          const isLast        = i === stages.length - 1;
          return (
            <li
              key={stage.key}
              ref={(el) => (stageRefs.current[i] = el)}
              className="flex items-start flex-1 last:flex-none min-w-[140px] sm:min-w-0"
            >
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0 px-2">
                <span className={`size-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  cancelledHere
                    ? "bg-red-500 ring-2 ring-red-500/40"
                    : done
                      ? "bg-electricBlue"
                      : active
                        ? "bg-electricBlue/15 ring-2 ring-electricBlue"
                        : "bg-white/5 ring-1 ring-white/10"
                }`}>
                  {cancelledHere && <XMarkIcon className="size-4 text-white stroke-[3]" />}
                  {!cancelledHere && done   && <CheckIcon className="size-4 text-white stroke-[3]" />}
                  {!cancelledHere && active && <span className="size-2 rounded-full bg-electricBlue animate-pulse" />}
                </span>
                <span className={`text-[10px] font-semibold leading-tight text-center whitespace-nowrap ${
                  cancelledHere ? "text-red-300" : pending ? "text-white/30" : "text-white"
                }`}>
                  {stage.label}
                </span>
                {cancelledHere ? (
                  <span className="text-[9px] text-red-300 text-center whitespace-nowrap">
                    Cancelled {cancelTs ? `· ${fmtDateTime(cancelTs)}` : ""}
                  </span>
                ) : ts ? (
                  <span className="text-[9px] text-white/35 text-center whitespace-nowrap">{fmtDateTime(ts)}</span>
                ) : active ? (
                  <span className="text-[9px] text-electricBlue text-center whitespace-nowrap">In progress</span>
                ) : null}
              </div>
              {!isLast && (
                <span className={`flex-1 min-w-[24px] h-0.5 mt-4 ${done ? "bg-electricBlue/60" : "bg-white/10"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Helper cards (extra context) ─────────────────────────────────────────────
function NextStepsCard({ caseItem }) {
  let copy;
  if (caseItem.case_status === "Cancelled") {
    copy = "This case is closed. If you need help with something else, raise a new case.";
  } else if (caseItem.workOrderStatus === "Completed") {
    copy = "All done — let us know if the issue returns.";
  } else if (caseItem.workOrderStatus === "Awaiting Parts") {
    copy = "Your engineer has ordered parts. We'll resume work as soon as they arrive.";
  } else if (caseItem.workOrderNumber) {
    copy = "Your engineer has been assigned. You'll get an update as soon as work starts.";
  } else {
    copy = "We've received your request and are reviewing the details. You'll hear from us shortly.";
  }
  return (
    <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <ClockIcon className="size-3.5 text-white/30" />
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          What happens next
        </p>
      </div>
      <p className="text-[11px] text-white/70 leading-relaxed">{copy}</p>
    </div>
  );
}

function NeedHelpCard() {
  return (
    <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <ChatBubbleLeftEllipsisIcon className="size-3.5 text-white/30" />
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          Need help?
        </p>
      </div>
      <p className="text-[11px] text-white/65 leading-relaxed mb-2">
        Reply to this case in the messages panel — your message goes straight to our support team.
      </p>
      <div className="flex flex-col gap-1 text-[10px] text-white/40">
        <div className="flex items-center gap-1.5">
          <EnvelopeIcon className="size-3 text-white/30" />
          <span>support@nexahub.app</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PhoneIcon className="size-3 text-white/30" />
          <span>0800 123 456 · Mon–Fri 8am–6pm</span>
        </div>
      </div>
    </div>
  );
}

// ─── Public notes — only notes marked Requester-visible (internal === false)
function PublicNotesCard({ caseItem }) {
  const notes = (caseItem.woNotes ?? []).filter((n) => n.internal === false);
  if (notes.length === 0) return null;

  return (
    <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <ChatBubbleLeftEllipsisIcon className="size-3.5 text-white/30" />
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          Notes from our team
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-md bg-white/[0.03] px-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-medium text-white/55 truncate">{n.author || "Support team"}</span>
                {n.authorRole && (
                  <span className="text-[9px] font-medium text-white/40 bg-white/5 px-1.5 py-px rounded shrink-0">
                    {n.authorRole}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-white/30 shrink-0">{n.time}</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed whitespace-pre-wrap">
              {n.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Engineer card — only renders once an engineer has been assigned ────────
function EngineerCard({ caseItem }) {
  const lead         = caseItem.assignedEngineers?.find((e) => e.isLead) ?? caseItem.assignedEngineers?.[0] ?? null;
  const engineerName = lead?.displayName ?? caseItem.assignedTo ?? null;
  const engineerRole = lead?.workerRole ?? "Maintenance Engineer";
  const hasAssignment = !!(caseItem.acknowledgedAt || engineerName);
  if (!hasAssignment) return null;
  if (caseItem.case_status === "Cancelled") return null;

  const initials = engineerName
    ? engineerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  const visitDate = caseItem.scheduledDate
    ? new Date(caseItem.scheduledDate).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    : null;

  return (
    <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <WrenchScrewdriverIcon className="size-3.5 text-white/30" />
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          Your engineer
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-electricBlue/15 text-electricBlue flex items-center justify-center text-xs font-bold shrink-0">
          {initials ?? <WrenchScrewdriverIcon className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {engineerName ?? "Assignment pending"}
          </p>
          <p className="text-[11px] text-white/45 truncate">{engineerRole}</p>
        </div>
      </div>

      {(visitDate || caseItem.scheduledTime) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2.5">
          <CalendarDaysIcon className="size-3.5 text-white/30 shrink-0" />
          <div className="flex-1">
            <p className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">
              Scheduled visit
            </p>
            <p className="text-[12px] text-white">
              {visitDate}
              {caseItem.scheduledTime && (
                <span className="text-white/50"> · {caseItem.scheduledTime}</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Visibility card (read-only, no resident names exposed) ───────────────────
function VisibilityCard({ caseItem }) {
  const shared = !!caseItem.sharedIssue;

  if (!shared) {
    return (
      <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <LockClosedIcon className="size-3.5 text-white/30" />
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
            Visibility
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-slate-500 shrink-0" />
          <p className="text-[11px] text-white/70">Private to you</p>
        </div>
      </div>
    );
  }

  // Shared — show scope label + a privacy-safe count. Resident identities are
  // intentionally not surfaced to customers.
  const scope     = getIssueScope(caseItem.location ?? {});
  const explicit  = Array.isArray(caseItem.sharedUsers) ? caseItem.sharedUsers : null;
  const affected  = explicit?.length
    ? explicit
    : computeAffectedUsers(caseItem.location ?? {}, USERS_DATA, caseItem.requester?.email);
  const count     = affected.length;

  return (
    <div className="rounded-lg bg-electricBlue/5 px-4 py-3 border border-electricBlue/15">
      <div className="flex items-center gap-2 mb-2">
        <UsersIcon className="size-3.5 text-electricBlue" />
        <p className="text-[10px] text-electricBlue uppercase tracking-wider font-semibold">
          Shared issue
        </p>
      </div>
      <p className="text-[11px] text-white/75">
        Affecting <span className="font-semibold text-white">{scope.label.toLowerCase()}</span>
      </p>
      <p className="text-[10px] text-white/40 mt-1 truncate">{scope.desc}</p>
      {count > 0 && (
        <p className="text-[10px] text-electricBlue/70 mt-2">
          Linked to {count} {count === 1 ? "other resident" : "other residents"} at this location
        </p>
      )}
    </div>
  );
}

// ─── Header bar (CasePgHeader equivalent, minimal) ────────────────────────────
function CaseHeader({ caseItem, status }) {
  const location  = locationSummary(caseItem.location);
  const source    = caseItem.source ?? "Web Portal";
  const sourceCfg = SOURCE_CFG[source] ?? SOURCE_CFG["Web Portal"];
  return (
    <div className="px-4 py-3 rounded-lg bg-obsidianNight/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-white/45">{caseItem.caseId}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.tone}`}>
              {status.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${sourceCfg.bg} ${sourceCfg.color} ${sourceCfg.border}`}
              title={`Raised via ${source}`}
            >
              <sourceCfg.Icon className="size-3" />
              {source}
            </span>
          </div>
          <h1 className="text-lg font-bold text-white truncate">{caseItem.title}</h1>
        </div>

        <div className="hidden sm:flex flex-row items-center gap-4 shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/70">{fmtDateTime(caseItem.createdAt)}</span>
            <p className="text-[10px] text-white/35 uppercase tracking-wider">Reported</p>
          </div>
          <span className="h-7 w-px bg-white/10" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/70">{fmtDateTime(caseItem.updatedAt ?? caseItem.createdAt)}</span>
            <p className="text-[10px] text-white/35 uppercase tracking-wider">Last update</p>
          </div>
          {location && (
            <>
              <span className="h-7 w-px bg-white/10" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-white/70 truncate max-w-[200px]">{location}</span>
                <p className="text-[10px] text-white/35 uppercase tracking-wider">Location</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CaseDetail() {
  const { id } = useParams();
  const { cases, updateCase } = useCases();
  const customer  = useCurrentCustomer();
  const [reply, setReply] = useState("");
  const [sent,  setSent]  = useState(false);
  // Communication thread — closed by default on small screens, open on lg+
  const [threadOpen, setThreadOpen] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches
  );

  const caseItem = useMemo(
    () => cases.find((c) => c.id === Number(id)),
    [cases, id]
  );

  const cleanedMessages = useMemo(() => {
    const src = caseItem?.source ?? "Web Portal";
    return (caseItem?.messages ?? [])
      .map((m) => ({ ...m, text: sanitiseForCustomer(m.text ?? m.body) }))
      .filter((m) => m.text)
      // For non-email sources, only show the agent's outgoing status emails —
      // the customer's original submission lives in the source itself (call,
      // portal form, WhatsApp), not in this email thread.
      .filter((m) => src === "Email" ? true : m.from === "agent");
  }, [caseItem?.messages, caseItem?.source]);

  if (!caseItem) return <NotFound message="This case doesn't exist." />;
  if (caseItem.requester?.displayName !== customer.displayName) {
    return <NotFound message="This case isn't on your account." />;
  }

  const source     = caseItem.source ?? "Web Portal";
  const sourceCfg  = SOURCE_CFG[source] ?? SOURCE_CFG["Web Portal"];
  // Customers always see the same email-style status thread on the left,
  // regardless of how they originally raised the case. The actual source
  // (Phone / Email / WhatsApp / Web Portal) is surfaced on the right pane.
  const renderAs   = "Email";
  const status     = friendlyStatus(caseItem);
  const isLocked   = caseItem.case_status === "Cancelled";

  const handleSend = (e) => {
    e?.preventDefault();
    const body = reply.trim();
    if (!body) return;
    updateCase(caseItem.id, {
      messages: [
        ...(caseItem.messages ?? []),
        {
          id:      Date.now(),
          from:    "tenant",
          subject: `Follow-up on ${caseItem.caseId}`,
          text:    body,
          time:    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          date:    new Date().toISOString(),
          channel: renderAs,
        },
      ],
    });
    setReply("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Top strip — back nav (admin equivalent of CaseTabsHeader, minimal) */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-obsidianHighlight bg-obsidianNight/60">
        <BackButton variant="inline" to="/customer/cases" label="Back to my cases" />
        {/* Toggle email updates panel (overlay on mobile, side panel on lg+) */}
        <button
          type="button"
          onClick={() => setThreadOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            threadOpen
              ? "bg-blue-400/10 text-blue-400 border-blue-400/20"
              : "bg-white/[0.04] text-white/55 border-obsidianHighlight hover:text-white"
          }`}
          aria-pressed={threadOpen}
          title={threadOpen ? "Hide email updates" : "Show email updates"}
        >
          <EnvelopeIcon className="size-3.5" />
          <span className="hidden sm:inline">{threadOpen ? "Hide emails" : "Show emails"}</span>
          {cleanedMessages.length > 0 && (
            <span className="text-[10px] font-mono opacity-80">{cleanedMessages.length}</span>
          )}
        </button>
      </div>

      {/* Two-pane split — overlay on mobile, side-by-side on lg+ */}
      <div className="flex-1 min-h-0 flex flex-row items-stretch overflow-hidden">
        {/* ── LEFT: Source panel ── */}
        {threadOpen && (
          <>
            {/* Backdrop — only on small screens */}
            <div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setThreadOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[420px] bg-obsidianSurface shadow-2xl flex flex-col lg:static lg:z-auto lg:w-[35%] lg:min-w-[280px] lg:max-w-none lg:shadow-none lg:border-r border-obsidianHighlight lg:overflow-hidden lg:min-h-0">
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-obsidianHighlight bg-obsidianNight/40">
            <div className="size-7 rounded-lg flex items-center justify-center border bg-blue-400/10 border-blue-400/20">
              <EnvelopeIcon className="size-3.5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Email updates
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {cleanedMessages.length} {cleanedMessages.length === 1 ? "message" : "messages"}
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {cleanedMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6">
                <ChatBubbleLeftEllipsisIcon className="size-8 text-white/10" />
                <p className="text-[11px] text-white/35 mt-2">No messages yet.</p>
              </div>
            ) : (
              <ThreadPanel
                messages={cleanedMessages}
                requester={{ displayName: customer.displayName, email: customer.email }}
                source={renderAs}
              />
            )}
          </div>

          {!isLocked && (
            <form onSubmit={handleSend} className="shrink-0 border-t border-obsidianHighlight px-3 py-3 bg-obsidianNight/40">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Reply about ${caseItem.caseId}…`}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
                className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder:text-white/30 outline-none focus:bg-white/[0.06] resize-none leading-relaxed transition-colors"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-white/30">Enter to send</p>
                <div className="flex items-center gap-2">
                  {sent && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircleIcon className="size-3" />
                      Sent
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-electricBlue text-white text-[11px] font-semibold hover:bg-electricBlue/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="size-3" />
                    Send
                  </button>
                </div>
              </div>
            </form>
          )}
        </aside>
          </>
        )}

        {/* ── RIGHT: Case details ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 min-h-0">
            <div className="space-y-3 pb-6">
              {/* Header card */}
              <CaseHeader caseItem={caseItem} status={status} />

              {/* Progress row — full width under the header */}
              <ProgressCard caseItem={caseItem} />

              {/* Two-column body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start w-full">
                {/* LEFT col */}
                <div className="flex flex-col gap-2 min-w-0">
                  {/* Description */}
                  <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="size-3.5 text-white/30" />
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                        What you reported
                      </p>
                    </div>
                    <p className="text-[12px] text-white/85 leading-relaxed whitespace-pre-wrap">
                      {caseItem.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="rounded-lg bg-obsidianNight/40 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="size-3.5 text-white/30" />
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                        Location
                      </p>
                    </div>
                    <p className="text-[12px] text-white/85">
                      {locationSummary(caseItem.location) ?? "—"}
                    </p>
                  </div>

                  {/* What happens next */}
                  <NextStepsCard caseItem={caseItem} />
                </div>

                {/* RIGHT col */}
                <div className="flex flex-col gap-2 min-w-0">
                  {/* Your engineer — only appears once one has been assigned */}
                  <EngineerCard caseItem={caseItem} />

                  {/* Notes from our team (public notes only) */}
                  <PublicNotesCard caseItem={caseItem} />

                  {/* Visibility */}
                  <VisibilityCard caseItem={caseItem} />

                  {/* Need help */}
                  <NeedHelpCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Not-found ────────────────────────────────────────────────────────────────
function NotFound({ message }) {
  return (
    <div className="h-full w-full flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl bg-obsidianSurface p-8 text-center flex flex-col items-center gap-3">
        <ExclamationCircleIcon className="size-10 text-white/20" />
        <h1 className="text-lg font-bold text-white">Not available</h1>
        <p className="text-sm text-white/50 leading-relaxed">{message}</p>
        <BackButton variant="inline" to="/customer/cases" label="Back to my cases" className="mt-2" />
      </div>
    </div>
  );
}

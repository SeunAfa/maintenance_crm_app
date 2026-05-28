import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";

// â”€â”€â”€ Lifecycle stages shown to the customer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STAGES_DEFAULT = [
  { key: "received",     label: "Request received",      tsKey: "workOrderCreatedAt" },
  { key: "assigned",     label: "Engineer assigned",     tsKey: "acknowledgedAt"    },
  { key: "in_progress",  label: "Work in progress",      tsKey: "inProgressAt"      },
  { key: "completed",    label: "Completed",             tsKey: "completedAt"       },
];

const STAGES_WITH_PARTS = [
  { key: "received",       label: "Request received",      tsKey: "workOrderCreatedAt" },
  { key: "assigned",       label: "Engineer assigned",     tsKey: "acknowledgedAt"    },
  { key: "in_progress",    label: "Work in progress",      tsKey: "inProgressAt"      },
  { key: "awaiting_parts", label: "Waiting for parts",     tsKey: "awaitingPartsAt"   },
  { key: "resumed",        label: "Work resumed",          tsKey: "finalResponseAt"   },
  { key: "completed",      label: "Completed",             tsKey: "completedAt"       },
];

function stageIndexFor(status, stages) {
  const map = {
    "Dispatched":     "received",
    "Acknowledged":   "assigned",
    "In Progress":    "in_progress",
    "Responded":      "in_progress",
    "Awaiting Parts": "awaiting_parts",
    "Final Response": "resumed",
    "Completed":      "completed",
    "Cancelled":      null,
  };
  const key = map[status];
  if (!key) return -1;
  return stages.findIndex((s) => s.key === key);
}

function fmtDateTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
}

function locationSummary(loc) {
  if (!loc) return null;
  return [loc.building, loc.block ? `Block ${loc.block}` : null, loc.floor]
    .filter(Boolean)
    .join(" · ");
}

function statusHeadline(status, engineerFirst) {
  switch (status) {
    case "Dispatched":     return { title: "Your request has been received",     subtitle: "We've logged your job and are getting an engineer assigned." };
    case "Acknowledged":   return { title: engineerFirst ? `${engineerFirst} is assigned to your job` : "An engineer has been assigned", subtitle: "They'll be in touch ahead of the visit." };
    case "In Progress":    return { title: "Work is underway",                   subtitle: engineerFirst ? `${engineerFirst} is on the case right now.` : "Our team is on the case right now." };
    case "Responded":      return { title: "Work is underway",                   subtitle: "We'll be in touch with an update shortly." };
    case "Awaiting Parts": return { title: "Waiting for parts",                  subtitle: "Your engineer has ordered the parts needed. We'll resume as soon as they arrive." };
    case "Final Response": return { title: "Work has resumed",                   subtitle: "Parts have arrived and we're back on the job." };
    case "Completed":      return { title: "All done",                           subtitle: "The job has been completed. Get in touch if anything's not right." };
    case "Cancelled":      return { title: "Your request was cancelled",         subtitle: "Please contact support if you didn't request this." };
    default:               return { title: "Tracking your request",              subtitle: "" };
  }
}

const STATUS_TONE = {
  "Dispatched":     "text-electricBlue",
  "Acknowledged":   "text-purple-400",
  "In Progress":    "text-amber-400",
  "Responded":      "text-amber-400",
  "Awaiting Parts": "text-orange-400",
  "Final Response": "text-sky-400",
  "Completed":      "text-emerald-400",
  "Cancelled":      "text-red-400",
};

// â”€â”€â”€ Lookup another case â€” fires only on Enter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CaseLookup() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e?.preventDefault();
    const ref = q.trim().toUpperCase();
    if (!ref) return;
    const caseId = ref.startsWith("CASE-") ? ref : `CASE-${ref}`;
    navigate(`/track-case/${caseId}`);
    setQ("");
  };

  return (
    <form onSubmit={submit} className="relative w-full max-w-[140px] sm:max-w-[260px]">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Track Another Case"
        className="w-full h-8 bg-white/[0.04] rounded-lg pl-9 pr-8 text-xs text-white placeholder:text-white/30 outline-none focus:bg-white/[0.07] transition-colors uppercase"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          aria-label="Clear"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <XMarkIcon className="size-3" />
        </button>
      )}
    </form>
  );
}

function NexaHubMark({ className = "h-5 w-auto" }) {
  return (
    <svg viewBox="0 0 48 40" fill="none" className={className} aria-label="NexaHub">
      <path
        d="M21.3474 0.349945L46.7544 25.7266V39.3499H34.8978V30.624L16.4444 12.1924H12.611V39.3499H0.754395V0.349945H21.3474ZM34.8978 13.8842V0.349945H46.7544V13.8842H34.8978Z"
        fill="#4b73ff"
      />
    </svg>
  );
}

function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] ?? "text-white/60";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-[11px] font-semibold ${tone}`}>
      <span className={`size-1.5 rounded-full ${tone.replace("text-", "bg-")} ${status !== "Completed" && status !== "Cancelled" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

// â”€â”€â”€ Horizontal progress timeline (matches customer case detail) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HorizontalTimeline({ stages, caseItem, currentIdx }) {
  const isComplete = caseItem.workOrderStatus === "Completed";

  // Centre the active stage in the rail on small screens
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
    <>
      <style>{`
        .tracker-progress-rail::-webkit-scrollbar { display: none; }
        .tracker-progress-rail { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <ol
        ref={railRef}
        className="tracker-progress-rail flex items-start w-full overflow-x-auto lg:overflow-visible -mx-3 px-3 py-2 sm:mx-0 sm:px-0 lg:py-0"
      >
        {stages.map((stage, i) => {
          const done    = i < currentIdx || (isComplete && i <= currentIdx);
          const active  = i === currentIdx && !isComplete;
          const pending = i > currentIdx;
          const ts      = caseItem[stage.tsKey];
          const isLast  = i === stages.length - 1;
          return (
            <li
              key={stage.key}
              ref={(el) => (stageRefs.current[i] = el)}
              className="flex items-start flex-1 last:flex-none min-w-[140px] sm:min-w-0"
            >
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0 px-2">
                <span className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  done
                    ? "bg-electricBlue"
                    : active
                      ? "bg-electricBlue/15 ring-2 ring-electricBlue"
                      : "bg-white/5 ring-1 ring-white/10"
                }`}>
                  {done && <CheckIcon className="size-5 text-white stroke-[3]" />}
                  {active && <span className="size-2.5 rounded-full bg-electricBlue animate-pulse" />}
                </span>
                <span className={`text-[12px] font-semibold leading-tight text-center whitespace-nowrap ${pending ? "text-white/30" : "text-white"}`}>
                  {stage.label}
                </span>
                {ts ? (
                  <span className="text-[10px] text-white/35 text-center whitespace-nowrap">{fmtDateTime(ts)}</span>
                ) : active ? (
                  <span className="text-[10px] text-electricBlue text-center whitespace-nowrap">In progress</span>
                ) : null}
              </div>
              {!isLast && (
                <span className={`flex-1 min-w-[24px] h-0.5 mt-[18px] ${done ? "bg-electricBlue/60" : "bg-white/10"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}

// â”€â”€â”€ Reusable body (used by both public and customer-side trackers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function CaseTrackerBody({ caseItem }) {
  const status        = caseItem.workOrderStatus ?? "Dispatched";
  const isCancelled   = status === "Cancelled";
  const onPartsPath   = !!caseItem.awaitingPartsAt;
  const stages        = onPartsPath ? STAGES_WITH_PARTS : STAGES_DEFAULT;
  const currentIdx    = stageIndexFor(status, stages);
  const lead          = caseItem.assignedEngineers?.find((e) => e.isLead) ?? caseItem.assignedEngineers?.[0] ?? null;
  const engineerName  = lead?.displayName ?? caseItem.assignedTo ?? null;
  const engineerFirst = engineerName ? engineerName.split(" ")[0] : null;
  const engineerRole  = lead?.workerRole ?? "Maintenance Engineer";
  const headline      = statusHeadline(status, engineerFirst);
  const lastUpdate    = caseItem.updatedAt ?? caseItem.acknowledgedAt ?? caseItem.workOrderCreatedAt ?? caseItem.createdAt;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero status */}
      <section className="rounded-2xl bg-obsidianSurface p-4 sm:p-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono text-white/40">{caseItem.caseId}</span>
          <StatusBadge status={status} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white leading-snug">
          {headline.title}
        </h1>
        {headline.subtitle && (
          <p className="text-sm text-white/55 mt-1.5 leading-relaxed">{headline.subtitle}</p>
        )}

        {lastUpdate && !isCancelled && (
          <p className="text-[11px] text-white/30 mt-4 flex items-center gap-1.5">
            <ArrowPathIcon className="size-3" />
            Last updated {fmtDateTime(lastUpdate)}
          </p>
        )}
      </section>

      {/* Progress timeline â€” horizontal, full width */}
      {!isCancelled && (
        <section className="rounded-2xl bg-obsidianSurface p-4 sm:p-6">
          <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-5">
            Progress
          </h2>
          <HorizontalTimeline stages={stages} caseItem={caseItem} currentIdx={currentIdx} />
        </section>
      )}

      {/* Engineer + request details side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Engineer card */}
        {!isCancelled && (engineerName || caseItem.scheduledDate) ? (
          <section className="rounded-2xl bg-obsidianSurface p-4 sm:p-6">
            <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-4">
              Your engineer
            </h2>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-electricBlue/15 text-electricBlue flex items-center justify-center text-sm font-bold shrink-0">
                {engineerName
                  ? engineerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                  : <WrenchScrewdriverIcon className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {engineerName ?? "Assignment pending"}
                </p>
                <p className="text-xs text-white/45 truncate">{engineerRole}</p>
              </div>
            </div>

            {(caseItem.scheduledDate || caseItem.scheduledTime) && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                <CalendarDaysIcon className="size-4 text-white/30 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
                    Scheduled visit
                  </p>
                  <p className="text-sm text-white">
                    {fmtDate(caseItem.scheduledDate)}
                    {caseItem.scheduledTime && (
                      <span className="text-white/50"> · {caseItem.scheduledTime}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* Issue details */}
        <section className="rounded-2xl bg-obsidianSurface p-4 sm:p-6 flex flex-col gap-4">
          <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
            Your request
          </h2>

          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Job</p>
            <p className="text-sm text-white leading-relaxed">{caseItem.title || caseItem.description}</p>
          </div>

          {locationSummary(caseItem.location) && (
            <div className="flex items-start gap-2.5">
              <MapPinIcon className="size-4 text-white/30 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm text-white/85">{locationSummary(caseItem.location)}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Public notes from the maintenance team */}
      <PublicNotes caseItem={caseItem} />
    </div>
  );
}

// â”€â”€â”€ Public notes (Requester-visible notes only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PublicNotes({ caseItem }) {
  const notes = (caseItem.woNotes ?? []).filter((n) => n.internal === false);
  if (notes.length === 0) return null;
  return (
    <section className="rounded-2xl bg-obsidianSurface p-4 sm:p-6">
      <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ChatBubbleLeftEllipsisIcon className="size-3.5 text-white/40" />
        Notes from our team
      </h2>
      <ol className="flex flex-col gap-2.5">
        {notes.map((n) => (
          <li key={n.id} className="rounded-lg bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-medium text-white/60 truncate">{n.author || "Support team"}</span>
                {n.authorRole && (
                  <span className="text-[9px] font-medium text-white/40 bg-white/5 px-1.5 py-px rounded shrink-0">
                    {n.authorRole}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/30 shrink-0">{n.time}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{n.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// â”€â”€â”€ Public tracker â€” standalone page reached from email links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CaseTracker() {
  const { caseId } = useParams();
  const { cases }  = useCases();

  const caseItem = useMemo(
    () => cases.find((c) => c.caseId === caseId),
    [cases, caseId]
  );

  if (!caseItem) {
    return <NotFound caseId={caseId} />;
  }

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-obsidianNight via-obsidianSurface to-obsidianNight text-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-obsidianNight/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <NexaHubMark />
            <span className="text-sm font-bold tracking-tight">NexaHub</span>
            <span className="hidden sm:inline text-white/15 mx-1">·</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-white/30">
              Case {caseItem.caseId}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <CaseLookup />
            <Link
              to="/signin"
              className="shrink-0 whitespace-nowrap h-8 px-5 rounded-lg bg-electricBlue hover:bg-electricBlue/85 active:scale-[0.98] text-white text-xs font-semibold transition-all flex items-center"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pb-16 pt-4 sm:pt-6">
        <CaseTrackerBody caseItem={caseItem} />

        <footer className="text-center text-[10px] text-white/25 pt-8">
          Powered by{" "}
          <span className="text-electricBlue/70 font-semibold">NexaHub</span>
          {" · "}
          Need help? Reply to the original email.
        </footer>
      </main>
    </div>
  );
}

// â”€â”€â”€ Not-found view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NotFound({ caseId }) {
  return (
    <div className="min-h-dvh w-full bg-obsidianNight text-white flex flex-col items-center justify-center px-5">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <ExclamationCircleIcon className="size-12 text-white/20" />
        <h1 className="text-xl font-bold">We can't find that case</h1>
        <p className="text-sm text-white/50 leading-relaxed">
          The reference <span className="font-mono text-white/70">{caseId}</span> didn't match any
          active case. Check the link in the email we sent you, or reply to that email if you need
          help.
        </p>
        <Link
          to="/signin"
          className="mt-2 h-8 px-4 rounded-lg bg-electricBlue hover:bg-electricBlue/85 text-white text-xs font-semibold transition-colors flex items-center"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

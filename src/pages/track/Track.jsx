import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";

// ─── Lifecycle stages shown to the customer ───────────────────────────────────
// Internal statuses get mapped onto a small set of customer-friendly milestones
// (Deliveroo / Parcel style).
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

// Map an internal workOrderStatus into the corresponding stage index in the
// "default" or "with parts" list above.
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
  return new Date(iso).toLocaleString("en-GB", {
    day:    "2-digit",
    month:  "short",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day:     "2-digit",
    month:   "short",
  });
}

function locationSummary(loc) {
  if (!loc) return null;
  return [loc.building, loc.block ? `Block ${loc.block}` : null, loc.floor]
    .filter(Boolean)
    .join(" · ");
}

// Map status → headline copy that fronts the page so the customer instantly
// knows what's happening.
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

// ─── Logo ─────────────────────────────────────────────────────────────────────
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Track() {
  const { caseId } = useParams();
  const { cases }  = useCases();

  // Case number is the canonical identifier exposed to customers
  const caseItem = useMemo(
    () => cases.find((c) => c.caseId === caseId),
    [cases, caseId]
  );

  if (!caseItem) {
    return <NotFound caseId={caseId} />;
  }

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
    <div className="min-h-screen w-full bg-gradient-to-b from-obsidianNight via-obsidianSurface to-obsidianNight text-white">
      {/* Header bar */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-obsidianNight/80">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NexaHubMark />
            <span className="text-sm font-bold tracking-tight">NexaHub</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-white/30">Case {caseItem.caseId}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-16 pt-4 flex flex-col gap-5">
        {/* Hero status */}
        <section className="rounded-2xl bg-obsidianSurface p-6 shadow-xl shadow-black/40">
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

        {/* Progress timeline */}
        {!isCancelled && (
          <section className="rounded-2xl bg-obsidianSurface p-6">
            <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-4">
              Progress
            </h2>
            <Timeline
              stages={stages}
              caseItem={caseItem}
              currentIdx={currentIdx}
            />
          </section>
        )}

        {/* Engineer card */}
        {!isCancelled && (engineerName || caseItem.scheduledDate) && (
          <section className="rounded-2xl bg-obsidianSurface p-6">
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
        )}

        {/* Issue details */}
        <section className="rounded-2xl bg-obsidianSurface p-6 flex flex-col gap-4">
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

        {/* Footer */}
        <footer className="text-center text-[10px] text-white/25 pt-2">
          Powered by{" "}
          <span className="text-electricBlue/70 font-semibold">NexaHub</span>
          {" · "}
          Need help? Reply to the original email.
        </footer>
      </main>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] ?? "text-white/60";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-[11px] font-semibold ${tone}`}>
      <span className={`size-1.5 rounded-full ${tone.replace("text-", "bg-")} ${status !== "Completed" && status !== "Cancelled" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

// ─── Vertical timeline ────────────────────────────────────────────────────────
function Timeline({ stages, caseItem, currentIdx }) {
  return (
    <ol className="relative">
      {stages.map((stage, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const pending = i > currentIdx;
        const ts      = caseItem[stage.tsKey];
        const isLast  = i === stages.length - 1;

        return (
          <li key={stage.key} className="flex gap-3 pb-5 last:pb-0 relative">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <span className={`size-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                done
                  ? "bg-electricBlue"
                  : active
                    ? "bg-electricBlue/15 ring-2 ring-electricBlue"
                    : "bg-white/5 ring-1 ring-white/10"
              }`}>
                {done && <CheckCircleIcon className="size-4 text-white" />}
                {active && <span className="size-2 rounded-full bg-electricBlue animate-pulse" />}
              </span>
              {!isLast && (
                <span className={`flex-1 w-px mt-0.5 mb-0.5 ${done ? "bg-electricBlue/60" : "bg-white/10"}`} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pb-1">
              <p className={`text-sm font-medium ${pending ? "text-white/30" : "text-white"}`}>
                {stage.label}
              </p>
              {ts && (
                <p className="text-[11px] text-white/35 mt-0.5">{fmtDateTime(ts)}</p>
              )}
              {active && !ts && (
                <p className="text-[11px] text-electricBlue mt-0.5">In progress now</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Not-found view ───────────────────────────────────────────────────────────
function NotFound({ caseId }) {
  return (
    <div className="min-h-screen w-full bg-obsidianNight text-white flex flex-col items-center justify-center px-5">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <ExclamationCircleIcon className="size-12 text-white/20" />
        <h1 className="text-xl font-bold">We can't find that case</h1>
        <p className="text-sm text-white/50 leading-relaxed">
          The reference <span className="font-mono text-white/70">{caseId}</span> didn't match any
          active case. Check the link in the email we sent you, or reply to that email if you need
          help.
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/30">
          <NexaHubMark className="h-4 w-auto" />
          <span className="font-semibold">NexaHub</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link2, AlertTriangle, Sparkles, Zap, MapPin, FileText, Users } from "lucide-react";
import { useCases } from "../context/CasesContext";

// ─── Description similarity (Jaccard on meaningful words) ─────────────────────
const STOP_WORDS = new Set([
  "with", "this", "that", "have", "from", "been", "they", "were", "will",
  "your", "there", "their", "about", "which", "when", "also", "into", "some",
  "please", "could", "would", "thank", "regards", "hello", "dear",
]);

function tokenize(text) {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
  );
}

function descSimilarity(a, b) {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  const shared = [...ta].filter((w) => tb.has(w)).length;
  const union = new Set([...ta, ...tb]).size;
  return union > 0 ? shared / union : 0;
}

// ─── Scoring ───────────────────────────────────────────────────────────────────
function scoreMatch(fields, candidate) {
  let s = 0;
  const reasons = [];

  // 1. Service category — same specific issue type (strongest signal)
  const issA =
    candidate.ServiceCategory?.id ??
    (typeof candidate.ServiceCategory === "string" ? candidate.ServiceCategory : null);
  const issB =
    fields.ServiceCategory?.id ??
    (typeof fields.ServiceCategory === "string" ? fields.ServiceCategory : null);
  if (issA && issB && issA === issB) {
    s += 30;
    reasons.push("issue");
  }

  // 2. Description keyword similarity
  const sim = descSimilarity(fields.description, candidate.description);
  const descPts = Math.round(sim * 20);
  if (descPts >= 5) {
    s += descPts;
    reasons.push("description");
  } else {
    s += descPts;
  }

  // 3. Shared issue flag — same problem affecting multiple residents
  if (candidate.sharedIssue) {
    s += 15;
    reasons.push("shared");
  }

  // 4. Location — granular (most precise proximity first)
  let locationPts = 0;
  if (fields.campus   && candidate.location?.campus   && fields.campus   === candidate.location.campus)   locationPts += 5;
  if (fields.building && candidate.location?.building && fields.building === candidate.location.building) locationPts += 15;
  if (fields.block    && candidate.location?.block    && fields.block    === candidate.location.block)    locationPts += 8;
  if (fields.floor    && candidate.location?.floor    && fields.floor    === candidate.location.floor)    locationPts += 8;
  if (fields.flat     && candidate.location?.flat     && fields.flat     === candidate.location.flat)     locationPts += 10;
  if (fields.room     && candidate.location?.room     && fields.room     === candidate.location.room)     locationPts += 8;
  if (locationPts >= 5) reasons.push("location");
  s += locationPts;

  // 5. Request type
  const fType =
    typeof fields.requestTypes === "object" ? fields.requestTypes?.label : fields.requestTypes;
  const cType =
    typeof candidate.requestTypes === "object" ? candidate.requestTypes?.label : candidate.requestTypes;
  if (fType && cType && fType === cType) s += 8;

  return { score: Math.min(99, s), reasons };
}

const THRESHOLD = 35;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function locationSnippet(loc) {
  if (!loc) return null;
  const parts = [loc.building, loc.block && `Block ${loc.block}`, loc.floor].filter(Boolean);
  return parts.join(" · ") || null;
}

// ─── Risk tier ────────────────────────────────────────────────────────────────
function tier(score) {
  if (score >= 70) return "high";
  return "mid";
}

const TIER = {
  high: {
    bar:    "bg-red-500",
    badge:  "bg-red-500/10 text-red-400 border-red-500/20",
    label:  "Likely duplicate",
    Icon:   AlertTriangle,
    header: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  mid: {
    bar:    "bg-amber-400",
    badge:  "bg-amber-400/10 text-amber-400 border-amber-400/20",
    label:  "Possible duplicate",
    Icon:   Sparkles,
    header: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
};

const WO_STATUS_STYLE = {
  Dispatched:    "text-electricBlue",
  "In Progress": "text-amber-400",
  Completed:     "text-emerald-400",
  Cancelled:     "text-red-400",
  Pending:       "text-white/30",
};

const REASON_TAG = {
  location:    { Icon: MapPin,    label: "Location",    cls: "text-electricBlue bg-electricBlue/10 border-electricBlue/20" },
  description: { Icon: FileText,  label: "Description", cls: "text-violet-400 bg-violet-500/10 border-violet-500/20"       },
  shared:      { Icon: Users,     label: "Shared issue", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"   },
  issue:       { Icon: Sparkles,  label: "Same issue",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20"          },
};

// ─── DuplicateCard ────────────────────────────────────────────────────────────
function DuplicateCard({ dup, onDismiss, onLink }) {
  const t        = tier(dup.score);
  const ts       = TIER[t];
  const loc      = locationSnippet(dup.location);
  const woStatus = dup.workOrderStatus ?? "Dispatched";

  return (
    <div className="relative group rounded-lg border border-obsidianHighlight bg-obsidianElevated pl-4 pr-2.5 py-2 overflow-hidden transition-colors hover:border-white/20">
      {/* Left risk bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${ts.bar} opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Row 1: WO ref · title · match% · actions */}
      <div className="flex items-center gap-2 min-w-0">
        {/* WO + status */}
        <div className="flex items-center gap-1 shrink-0">
          <Zap className="size-2.5 text-violet-400" />
          <span className="text-[10px] font-semibold text-violet-400 font-mono">{dup.workOrderNumber}</span>
          <span className="text-[10px] text-white/20">·</span>
          <span className={`text-[10px] ${WO_STATUS_STYLE[woStatus] ?? "text-white/40"}`}>{woStatus}</span>
        </div>

        <span className="text-white/15">|</span>

        {/* Title */}
        <p className="text-[11px] font-medium text-white/80 truncate flex-1 min-w-0">
          {dup.title || dup.caseId}
        </p>

        {/* Match % */}
        <span className={`shrink-0 inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded border ${ts.badge}`}>
          {dup.score}%
        </span>

        {/* Buttons */}
        <button
          onClick={() => onLink(dup)}
          className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-electricBlue hover:bg-electricBlue/80 text-white transition-colors active:scale-95"
        >
          <Link2 className="size-2.5" />
          Link
        </button>
        <button
          onClick={() => onDismiss(dup.id)}
          className="shrink-0 inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-obsidianHighlight hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Row 2: caseId · date · location · reason tags */}
      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
        <span className="font-mono text-[9px] text-white/30">{dup.caseId}</span>
        <span className="size-[2px] rounded-full bg-white/15" />
        <span className="text-[9px] text-white/25">{fmtDate(dup.createdAt)}</span>
        {loc && (
          <>
            <span className="size-[2px] rounded-full bg-white/15" />
            <MapPin className="size-2 text-white/20 shrink-0" />
            <span className="text-[9px] text-white/30">{loc}</span>
          </>
        )}
        {dup.reasons?.map((r) => {
          const rt = REASON_TAG[r];
          if (!rt) return null;
          return (
            <span key={r} className={`inline-flex items-center gap-0.5 text-[8px] font-medium px-1 py-px rounded border ${rt.cls}`}>
              <rt.Icon className="size-2" />
              {rt.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── DuplicateTracker ─────────────────────────────────────────────────────────
export default function DuplicateTracker({ caseItem, fields, onLink, className = "" }) {
  const { cases } = useCases();
  const [dismissed, setDismissed] = useState([]);

  if (!caseItem || !fields) return null;

  // Only consider cases that have been converted to a work order
  const scored = cases
    .filter(
      (c) =>
        c.id !== caseItem.id &&
        !dismissed.includes(c.id) &&
        c.workOrderNumber  // only cases with a real WO
    )
    .map((c) => {
      const { score, reasons } = scoreMatch(fields, c);
      return { ...c, score, reasons };
    })
    .filter((c) => c.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score);

  const hasResults = scored.length > 0;
  const topScore   = hasResults ? scored[0].score : 0;
  const t          = tier(topScore);
  const ts         = TIER[t];
  const HeaderIcon = ts.Icon;

  return (
    <div className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col gap-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`inline-flex items-center justify-center size-7 rounded-lg border shrink-0 ${
              hasResults ? ts.header : "bg-white/5 text-white/20 border-white/10"
            }`}
          >
            {hasResults ? <HeaderIcon className="size-3.5" /> : <Sparkles className="size-3.5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-semibold text-white text-left leading-snug truncate">
              Duplicate Work Orders
            </h2>
            <span className="text-[10px] text-white/40 leading-tight truncate">
              {hasResults
                ? `${ts.label} · top ${topScore}% · matched via location, issue & description`
                : "No matching work orders found"}
            </span>
          </div>
        </div>

        <span
          className={`shrink-0 inline-flex items-center text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${
            hasResults
              ? "bg-white/5 text-white/50 border-obsidianHighlight"
              : "bg-white/[0.03] text-white/30 border-white/5"
          }`}
        >
          {scored.length} found
        </span>
      </div>

      {/* Cards or empty state */}
      {hasResults ? (
        <div className="flex flex-col gap-2">
          {scored.map((dup) => (
            <DuplicateCard
              key={dup.id}
              dup={dup}
              onDismiss={(id) => setDismissed((p) => [...p, id])}
              onLink={onLink ?? (() => {})}
            />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-white/25 py-1 text-center">
          No duplicate work orders detected
        </p>
      )}
    </div>
  );
}

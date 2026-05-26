import { Link2, ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLE = {
  New:         { dot: "bg-electricBlue",  text: "text-electricBlue",  bg: "bg-electricBlue/10"  },
  "In Review": { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10"     },
  Converted:   { dot: "bg-violet-400",    text: "text-violet-400",    bg: "bg-violet-400/10"    },
  Closed:      { dot: "bg-slate-400",     text: "text-slate-400",     bg: "bg-slate-400/10"     },
};

// ─── RelinkCase ───────────────────────────────────────────────────────────────
// Shows when the current case is linked to an existing case / WO
export default function RelinkCase({ linkedCase, onUnlink, className = "" }) {
  const navigate = useNavigate();

  if (!linkedCase) return null;

  const ss = STATUS_STYLE[linkedCase.case_status] ?? STATUS_STYLE.New;
  const isConverted = linkedCase.case_status === "Converted";
  const woId = linkedCase.workOrderNumber ?? linkedCase.workOrderId;

  return (
    <div className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center size-7 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Link2 className="size-3.5 text-violet-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-white text-left leading-snug">
              Case Linked
            </h2>
            <span className="text-[10px] text-white/40 leading-tight">
              {isConverted
                ? "Linked to an active work order"
                : "Linked to an existing case — no new WO"}
            </span>
          </div>
        </div>

        <button
          onClick={onUnlink}
          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-obsidianHighlight hover:border-red-500/20 transition-colors"
        >
          <X className="size-3" />
          Unlink
        </button>
      </div>

      {/* Info message */}
      <p className="text-[11px] text-white/50 leading-relaxed">
        {isConverted
          ? "This case shares an issue that already has an active work order. The requester will be updated through the linked case's progress."
          : "This case shares the same issue as an existing case. No new work order will be created — the requester will be kept informed via the linked case."}
      </p>

      {/* Linked case card */}
      <div className="rounded-md border border-obsidianHighlight bg-obsidianElevated overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-obsidianHighlight bg-obsidianNight/30">
          <span className="font-mono text-[11px] font-semibold text-electricBlue">
            {linkedCase.caseId}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${ss.bg} ${ss.text} border-current/20`}>
            <span className={`size-1.5 rounded-full ${ss.dot}`} />
            {linkedCase.case_status}
          </span>
          {isConverted && woId && (
            <span className="ml-auto text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
              WO-{woId}
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="px-3 py-2.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate text-left">
              {linkedCase.title || "—"}
            </p>
            <p className="text-[10px] text-white/40 mt-0.5">
              {linkedCase.requester?.displayName ?? "—"} · {fmtDate(linkedCase.createdAt)}
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/cases/manage/${linkedCase.id}`)}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-electricBlue hover:text-electricBlue/80 transition-colors"
          >
            <ExternalLink className="size-3" />
            View
          </button>
        </div>
      </div>
    </div>
  );
}

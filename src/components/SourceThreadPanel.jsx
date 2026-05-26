import ThreadPanel from "./ThreadPanel";
import ReplyComposer from "./ReplyComposer";
import {
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

const WO_STATUS_STYLE = {
  Dispatched:    { dot: "bg-electricBlue",  text: "text-electricBlue",  bg: "bg-electricBlue/10",  border: "border-electricBlue/20"  },
  Acknowledged:  { dot: "bg-purple-400",    text: "text-purple-400",    bg: "bg-purple-400/10",    border: "border-purple-400/20"    },
  "In Progress": { dot: "bg-amber-400",     text: "text-amber-400",     bg: "bg-amber-400/10",     border: "border-amber-400/20"     },
  Responded:     { dot: "bg-teal-400",      text: "text-teal-400",      bg: "bg-teal-400/10",      border: "border-teal-400/20"      },
  Completed:     { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-400/10",   border: "border-emerald-400/20"   },
  Cancelled:     { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-400/10",       border: "border-red-400/20"       },
};

const SOURCE_CONFIG = {
  "Email":      { Icon: EnvelopeIcon,                   color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  "Phone":      { Icon: PhoneIcon,                      color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "WhatsApp":   { Icon: ChatBubbleLeftEllipsisIcon,     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Web Portal": { Icon: GlobeAltIcon,                   color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
};

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

export default function SourceThreadPanel({ caseItem, messages, onReply, onClose, leftPct = 30, woStatus }) {
  const source    = caseItem?.source ?? "Web Portal";
  const cfg       = SOURCE_CONFIG[source] ?? SOURCE_CONFIG["Web Portal"];
  const { Icon }  = cfg;
  const requester = caseItem?.requester;
  // Show every message — auto-acknowledgements fire immediately on receive,
  // so the customer thread and the admin thread always render the same set.
  const visibleMessages = messages;

  return (
    <div
      className="flex flex-col bg-obsidianSurface border-r border-obsidianHighlight overflow-hidden shrink-0 h-full min-h-0 w-full lg:w-[var(--lp)]"
      style={{ "--lp": `${leftPct}%` }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-obsidianHighlight bg-obsidianNight/40">
        {/* Source icon */}
        <div className={`size-7 rounded-lg flex items-center justify-center border ${cfg.bg} ${cfg.border}`}>
          <Icon className={`size-3.5 ${cfg.color}`} />
        </div>

        {/* Requester info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {requester?.displayName ?? "—"}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            via {source}
          </p>
        </div>

        {/* Source badge */}
        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          {source}
        </span>

        {/* Collapse */}
        <button
          onClick={onClose}
          className="shrink-0 size-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-obsidianHighlight transition-colors"
          title="Hide thread"
        >
          <ChevronLeftIcon className="size-3.5" />
        </button>
      </div>

      {/* WO Status label — shown when a work order status is passed */}
      {woStatus && (() => {
        const ss = WO_STATUS_STYLE[woStatus] ?? WO_STATUS_STYLE.Dispatched;
        return (
          <div className={`shrink-0 flex items-center justify-between px-4 py-2 border-b border-obsidianHighlight ${ss.bg}`}>
            <span className="text-[10px] text-white/40 uppercase tracking-wide font-medium">Work Order Status</span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${ss.text}`}>
              <span className={`size-1.5 rounded-full shrink-0 ${ss.dot}`} />
              {woStatus}
            </span>
          </div>
        );
      })()}

      {/* Messages — agent replies hidden until WO is generated */}
      <ThreadPanel messages={visibleMessages} requester={requester} source={source} />

      {/* Reply */}
      <ReplyComposer
        source={source}
        onSend={onReply}
        requester={requester}
        messages={messages}
        workOrderNumber={caseItem?.workOrderNumber ?? caseItem?.workOrderId}
      />
    </div>
  );
}

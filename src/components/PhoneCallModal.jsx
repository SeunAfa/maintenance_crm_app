import { useState, useEffect, useRef } from "react";
import { PhoneIcon, PhoneXMarkIcon } from "@heroicons/react/24/solid";
import {
  ArrowsPointingOutIcon, ArrowsPointingInIcon,
  MinusIcon,
  MagnifyingGlassIcon, ArrowRightEndOnRectangleIcon,
  ClockIcon, PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";

// ── Mock data ──────────────────────────────────────────────────────────────────
const AGENTS = [
  { id: 1, name: "Sarah Mitchell", role: "Helpdesk Support",   status: "available", initials: "SM" },
  { id: 2, name: "Tom Baker",      role: "Helpdesk Support",   status: "in-call",   initials: "TB" },
  { id: 3, name: "Emma Clarke",    role: "Site Supervisor",    status: "in-call",   initials: "EC" },
  { id: 4, name: "David Okafor",   role: "Operations Manager", status: "available", initials: "DO" },
  { id: 5, name: "Lucy Chen",      role: "Helpdesk Support",   status: "away",      initials: "LC" },
];

const HISTORY = [
  { id: 1, name: "James Thornton", number: "0771 234 567",  dur: "4:23", time: "09:42",     resolved: true  },
  { id: 2, name: "Amara Osei",     number: "0794 567 890",  dur: "2:11", time: "09:18",     resolved: true  },
  { id: 3, name: "Unknown",        number: "+44 7700 9012", dur: "0:48", time: "08:55",     resolved: false },
  { id: 4, name: "Priya Mehta",    number: "0782 345 678",  dur: "6:05", time: "Yesterday", resolved: true  },
  { id: 5, name: "Sofia Andersen", number: "0743 567 890",  dur: "1:32", time: "Yesterday", resolved: true  },
];

const AGENT_STATUS = {
  available: { dot: "bg-emerald-400", label: "Available", canTransfer: true  },
  "in-call": { dot: "bg-electricBlue", label: "In call",  canTransfer: false },
  away:      { dot: "bg-amber-400",   label: "Away",      canTransfer: false },
  busy:      { dot: "bg-red-400",     label: "Busy",      canTransfer: false },
};

// ── Timer ──────────────────────────────────────────────────────────────────────
function useTimer(running) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) { setT(0); return; }
    const id = setInterval(() => setT((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

// ── Transfer tab ───────────────────────────────────────────────────────────────
function TransferTab({ onTransfer }) {
  const [query,       setQuery]       = useState("");
  const [transferred, setTransferred] = useState(null);

  const filtered = AGENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.role.toLowerCase().includes(query.toLowerCase())
  );

  const handleTransfer = (agent) => {
    setTransferred(agent);
    setTimeout(() => onTransfer?.(), 2000);
  };

  if (transferred) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <div className="size-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <PhoneArrowUpRightIcon className="size-4 text-emerald-400" />
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/8">
          <MagnifyingGlassIcon className="size-3 text-white/25 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents…"
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-white/5">
        {filtered.map((agent) => {
          const s = AGENT_STATUS[agent.status] ?? AGENT_STATUS.busy;
          return (
            <div key={agent.id}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 transition-colors">
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
              <button
                onClick={() => handleTransfer(agent)}
                disabled={!s.canTransfer}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors shrink-0 ${
                  s.canTransfer
                    ? "bg-electricBlue/10 text-electricBlue hover:bg-electricBlue/20 border border-electricBlue/20"
                    : "bg-white/[0.03] text-white/15 border border-white/5 cursor-not-allowed"
                }`}
              >
                <ArrowRightEndOnRectangleIcon className="size-3" />
                Transfer
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── History tab ────────────────────────────────────────────────────────────────
function HistoryTab() {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-white/5">
      {HISTORY.map((call) => (
        <div key={call.id}
          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 transition-colors">
          <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${
            call.resolved ? "bg-emerald-500/10" : "bg-red-500/10"
          }`}>
            <PhoneIcon className={`size-3 ${call.resolved ? "text-emerald-400" : "text-red-400"}`} />
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

// ── Compact call card body (Design D — dark card + glow ring) ─────────────────
function CallCard({ caller, phase, timer, onAnswer, onClose }) {
  const isRinging  = phase === "ringing";
  const isAnon     = caller?.anonymous === true;
  const initials   = isAnon ? "?" : (caller.displayName ?? "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-5 gap-3.5">
      {/* Avatar with glow ring */}
      <div className="relative flex items-center justify-center">
        {isRinging && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: isAnon ? "rgba(148,163,184,0.07)" : "rgba(251,191,36,0.07)", animationDuration: "1.2s" }} />
        )}
        <div
          className="relative size-14 rounded-full flex items-center justify-center text-base font-bold"
          style={{
            background:  isAnon
              ? "rgba(148,163,184,0.08)"
              : isRinging ? "rgba(251,191,36,0.08)"  : "rgba(52,211,153,0.08)",
            border: `1.5px solid ${isAnon ? "rgba(148,163,184,0.35)" : isRinging ? "rgba(251,191,36,0.35)" : "rgba(52,211,153,0.35)"}`,
            color:  isAnon ? "#94a3b8" : isRinging ? "#fbbf24" : "#34d399",
            boxShadow: isAnon
              ? "0 0 18px rgba(148,163,184,0.10)"
              : isRinging
                ? "0 0 18px rgba(251,191,36,0.12)"
                : "0 0 18px rgba(52,211,153,0.12)",
            transition: "all 0.5s ease",
          }}
        >
          {initials}
        </div>
      </div>

      {/* Name + status */}
      <div className="text-center">
        <p className="text-white font-semibold text-sm leading-tight">
          {isAnon ? "Unknown Caller" : caller.displayName}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: isAnon ? "rgba(148,163,184,0.6)" : isRinging ? "rgba(251,191,36,0.6)" : "rgba(52,211,153,0.6)" }}>
          {isRinging ? "Incoming call…" : `Connected · ${timer}`}
        </p>
        <p className="text-[10px] mt-0.5 text-white/20">
          {isAnon ? "User not found — anonymous" : caller.contractType}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full">
        {isRinging ? (
          <>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-white/40 hover:text-red-400 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <PhoneXMarkIcon className="size-3.5" />
              Decline
            </button>
            <button
              onClick={onAnswer}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold"
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.3)",
                color: "#34d399",
              }}
            >
              <PhoneIcon className="size-3.5" />
              Answer
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            <PhoneXMarkIcon className="size-3.5" />
            End call
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PhoneCallModal({ caller, onClose, onAnswer, onMinimize, initialPhase = "ringing" }) {
  const [phase, setPhase] = useState(initialPhase);
  const [view,  setView]  = useState("compact"); // compact | expanded
  const [tab,   setTab]   = useState("transfer");
  const timer = useTimer(phase === "active");

  const COMPACT_W  = 224;
  const EXPANDED_W = 580;
  const EXPANDED_H = 440;
  const MIN_Y      = 90; // nav h-12 (48px) + border (1px) + CaseTabsHeader h-10 (40px) + border (1px)

  const initPos = { x: window.innerWidth - COMPACT_W - 16, y: MIN_Y };
  const [pos,         setPos]         = useState(initPos);
  const compactPosRef = useRef(initPos);
  const dragging      = useRef(false);
  const dragOffset    = useRef({ x: 0, y: 0 });
  const draggedWhileExpanded = useRef(false);

  const handleSetView = (next) => {
    if (next === "expanded") {
      compactPosRef.current = pos;
      setPos((prev) => ({
        x: Math.max(0,     Math.min(prev.x, window.innerWidth  - EXPANDED_W)),
        y: Math.max(MIN_Y, Math.min(prev.y, window.innerHeight - EXPANDED_H)),
      }));
      draggedWhileExpanded.current = false;
    } else {
      if (!draggedWhileExpanded.current) {
        setPos(compactPosRef.current);
      }
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
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
  }, [view]);

  const startDrag = (e) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  const handleAnswer   = () => { setPhase("active"); onAnswer?.(); };

  const isRinging  = phase === "ringing";
  const accentColor = isRinging ? "rgba(251,191,36,1)" : "rgba(52,211,153,1)";
  const glowBorder  = isRinging ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)";

  return (
    <div
      className="fixed z-[100] select-none"
      style={{ left: pos.x, top: pos.y, width: view === "expanded" ? EXPANDED_W : COMPACT_W }}
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
        {/* ── Title bar ── */}
        <div
          onMouseDown={startDrag}
          className="flex items-center gap-2 px-3 py-1.5 border-b border-obsidianHighlight cursor-grab active:cursor-grabbing shrink-0 bg-obsidianNight"
        >
          <div className="flex flex-1 items-center gap-1.5 min-w-0">
            <span className="size-1.5 rounded-full shrink-0 animate-pulse" style={{ background: accentColor }} />
            <span className="text-[10px] font-semibold text-white/45 tracking-wide uppercase truncate">
              {isRinging ? "Incoming call" : "Active call"}
            </span>
            {!isRinging && (
              <span className="font-mono text-[10px] shrink-0 text-emerald-400/70">{timer}</span>
            )}
          </div>
          {/* Window controls */}
          <div className="flex items-center shrink-0" style={{ gap: 1 }}>
            {view === "compact" && (
              <button
                onClick={() => onMinimize?.()}
                title="Minimise to nav"
                className="flex items-center justify-center text-white/35 hover:text-white hover:bg-obsidianHighlight transition-colors"
                style={{ width: 28, height: 24, borderRadius: 4 }}
              >
                <MinusIcon className="size-3.5" />
              </button>
            )}
            <button
              onClick={() => handleSetView(view === "expanded" ? "compact" : "expanded")}
              title={view === "expanded" ? "Restore" : "Expand"}
              className="flex items-center justify-center text-white/35 hover:text-white hover:bg-obsidianHighlight transition-colors"
              style={{ width: 28, height: 24, borderRadius: 4 }}
            >
              {view === "expanded"
                ? <ArrowsPointingInIcon className="size-3.5" />
                : <ArrowsPointingOutIcon className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {view === "expanded" ? (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: call card */}
            <div className="shrink-0 border-r border-obsidianHighlight overflow-y-auto" style={{ width: COMPACT_W }}>
              <CallCard caller={caller} phase={phase} timer={timer} onAnswer={handleAnswer} onClose={onClose} />
            </div>
            {/* Right: tabs */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0">
              <div className="shrink-0 flex border-b border-obsidianHighlight bg-obsidianNight/40">
                {[
                  { key: "transfer", label: "Transfer",     Icon: ArrowRightEndOnRectangleIcon },
                  { key: "history",  label: "Call History", Icon: ClockIcon },
                ].map(({ key, label, Icon }) => (
                  <button key={key} onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium border-b-2 transition-colors ${
                      tab === key ? "border-electricBlue text-white" : "border-transparent text-white/30 hover:text-white/60"
                    }`}>
                    <Icon className="size-3.5" />{label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col flex-1 min-h-0 py-3">
                {tab === "transfer" ? <TransferTab onTransfer={onClose} /> : <HistoryTab />}
              </div>
            </div>
          </div>
        ) : (
          <CallCard caller={caller} phase={phase} timer={timer} onAnswer={handleAnswer} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

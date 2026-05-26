import { useState, useEffect, useRef } from "react";
import {
  PhoneIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserPlusIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon as PhoneSolid } from "@heroicons/react/24/solid";
import ThreadPanel from "./ThreadPanel";
import ReplyComposer from "./ReplyComposer";

// ─── Format helpers ────────────────────────────────────────────────────────────
function fmtSessionLabel(session, index) {
  const when = session.startedAt
    ? new Date(session.startedAt).toLocaleString("en-GB", {
        day:    "2-digit",
        month:  "short",
        hour:   "2-digit",
        minute: "2-digit",
      })
    : "—";
  return index === 0 ? `Initial call · ${when}` : `Call-back ${index} · ${when}`;
}

// Auto-generated content for a freshly-started call session. The transcription
// is treated as the output of an automatic call-transcription service and
// saved immediately — agents read it, they don't type it. Notes are
// editable so the agent can jot down their own observations alongside.
//
// `index` is the 0-based position of this session in the case's call log.
// Each index produces a distinct script + note set so successive call-backs
// don't look like duplicates of each other.
function callScript(index) {
  return CALL_SCRIPTS[Math.min(index, CALL_SCRIPTS.length - 1)];
}

const CALL_SCRIPTS = [
  // 0 — Initial intake
  {
    note: ({ title, locLabel, priority }) => [
      `• Caller reported: ${title}`,
      `• Location: ${locLabel}`,
      `• Sounded ${priority === "Urgent" || priority === "Critical" ? "distressed — flagged as priority" : "calm — happy with standard turnaround"}`,
      `• Confirmed contact details on file`,
    ],
    trans: ({ agent, caller, callerFull, issue, caseId, locLabel }) => [
      `${agent}: Good morning, NexaHub Facilities Helpdesk, how can I help?`,
      `${caller}: Hi, I'm calling about ${issue.toLowerCase()}.`,
      `${agent}: Can I take your name and address please?`,
      `${caller}: ${callerFull}, ${locLabel}.`,
      `${agent}: Thanks. When did the issue start?`,
      `${caller}: It's been going on for a couple of days now.`,
      `${agent}: Understood — I'll raise this as ${caseId} and get an engineer assigned. You'll get a confirmation email shortly.`,
      `${caller}: Thank you.`,
      `${agent}: You're welcome — have a good day.`,
    ],
  },
  // 1 — Engineer ETA confirmation
  {
    note: ({ engineer }) => [
      `• Follow-up call to confirm engineer ETA`,
      `• ${engineer ?? "Engineer"} expected within the hour`,
      `• Caller confirmed they'll be in to receive`,
      `• No new issues raised`,
    ],
    trans: ({ agent, caller, callerFull, caseId, engineer }) => [
      `${agent}: Hello ${callerFull.split(" ")[0]}, calling back about ${caseId}.`,
      `${caller}: Yes, thanks for getting back to me.`,
      `${agent}: Quick update — ${engineer ?? "our engineer"} is on the way and should be with you within the hour.`,
      `${caller}: Perfect, I'll be in.`,
      `${agent}: Great — anything else you need from us?`,
      `${caller}: No that's all, thank you.`,
      `${agent}: You're welcome. Bye for now.`,
    ],
  },
  // 2 — Asking for extra detail / photos
  {
    note: ({ title }) => [
      `• Called back to gather more detail on ${title.toLowerCase()}`,
      `• Asked the caller to send photos to support@nexahub.app`,
      `• Caller agreed to send within the hour`,
      `• Will pass details on to engineer once received`,
    ],
    trans: ({ agent, caller, callerFull, caseId, issue }) => [
      `${agent}: Hi ${callerFull.split(" ")[0]}, it's NexaHub Facilities calling back about ${caseId}.`,
      `${caller}: Hi, yes — has the engineer been?`,
      `${agent}: Not yet — we just wanted a couple more details to make sure they bring the right parts. Could you describe the ${issue.toLowerCase()} a bit more?`,
      `${caller}: Sure, it's mostly making a rattling sound when it's in use.`,
      `${agent}: Got it. Would you mind sending a couple of photos to support@nexahub.app?`,
      `${caller}: No problem, I'll do that now.`,
      `${agent}: Brilliant — once they're in we'll get the engineer back to you. Thanks for your patience.`,
      `${caller}: Thanks, bye.`,
    ],
  },
  // 3 — Engineer delay
  {
    note: ({ engineer }) => [
      `• Called to advise of slight engineer delay`,
      `• ${engineer ?? "Engineer"} held up at a prior job — ETA now late afternoon`,
      `• Caller happy with the update, will be in all day`,
      `• Will text once engineer departs`,
    ],
    trans: ({ agent, caller, callerFull, caseId, engineer }) => [
      `${agent}: Hi ${callerFull.split(" ")[0]}, sorry to bother you — calling about ${caseId}.`,
      `${caller}: That's fine, what's up?`,
      `${agent}: Unfortunately ${engineer ?? "the engineer"} is running a bit behind, so they'll be with you later this afternoon rather than this morning.`,
      `${caller}: OK, no problem — I'll be in either way.`,
      `${agent}: Great — we'll send a text once they're on their way.`,
      `${caller}: Perfect, thanks for letting me know.`,
      `${agent}: Thanks for your patience. Bye.`,
    ],
  },
  // 4 — Closing courtesy call
  {
    note: () => [
      `• Courtesy call after the visit`,
      `• Caller confirms everything is working as expected`,
      `• No further action required — closing the case`,
    ],
    trans: ({ agent, caller, callerFull, caseId }) => [
      `${agent}: Hi ${callerFull.split(" ")[0]}, just a quick courtesy call on ${caseId} — everything OK?`,
      `${caller}: Yes, all sorted — thanks very much.`,
      `${agent}: Brilliant. We'll close the case off then. Don't hesitate to get in touch if anything else crops up.`,
      `${caller}: Will do, thanks again.`,
      `${agent}: You're welcome. Bye for now.`,
    ],
  },
];

function buildScriptContext(caseItem) {
  const callerFull = caseItem?.requester?.displayName ?? "Caller";
  const caller     = callerFull.split(" ")[0];
  const locLabel   = [
    caseItem?.location?.building,
    caseItem?.location?.block && `Block ${caseItem.location.block}`,
    caseItem?.location?.flat,
  ].filter(Boolean).join(", ") || "their address";
  const engineer = caseItem?.assignedEngineers?.find((e) => e.isLead)?.displayName
                ?? caseItem?.assignedTo
                ?? null;
  return {
    agent:    "Agent",
    caller,
    callerFull,
    issue:    caseItem?.title ?? "your issue",
    caseId:   caseItem?.caseId ?? "your case",
    title:    caseItem?.title ?? "the reported issue",
    locLabel,
    priority: caseItem?.priority,
    engineer,
  };
}

function autoNotes(caseItem, index) {
  const ctx    = buildScriptContext(caseItem);
  const script = callScript(index);
  return script.note(ctx).join("\n");
}

function autoTranscription(caseItem, index) {
  const ctx    = buildScriptContext(caseItem);
  const script = callScript(index);
  return script.trans(ctx).join("\n");
}

function newCallSession(caseItem, index = 0) {
  return {
    id:            `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt:     new Date().toISOString(),
    notes:         autoNotes(caseItem, index),
    transcription: autoTranscription(caseItem, index),
  };
}

// ─── Tab pill ──────────────────────────────────────────────────────────────────
function TabPill({ active, icon: Icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
        active
          ? "bg-electricBlue/15 text-electricBlue border border-electricBlue/30"
          : "text-white/40 hover:text-white/70 border border-transparent"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
      {badge != null && (
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
          active ? "bg-electricBlue/20 text-electricBlue" : "bg-white/10 text-white/40"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Call session picker ───────────────────────────────────────────────────────
function SessionPicker({ sessions, activeIndex, onSelect, onNewCallback, callInProgress = false }) {
  const [open, setOpen] = useState(false);
  const active = sessions[activeIndex];

  return (
    <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-obsidianHighlight bg-obsidianNight/40">
      <div className="relative flex-1 min-w-0">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-obsidianElevated border border-obsidianHighlight text-[11px] text-white hover:border-electricBlue/40 transition-colors"
        >
          <span className="truncate">{fmtSessionLabel(active, activeIndex)}</span>
          <ChevronDownIcon className={`size-3 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-md bg-obsidianElevated border border-obsidianHighlight shadow-2xl shadow-black/80 max-h-60 overflow-y-auto">
            {sessions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { onSelect(i); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors ${
                  i === activeIndex ? "text-electricBlue" : "text-white/70"
                }`}
              >
                {fmtSessionLabel(s, i)}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onNewCallback}
        disabled={callInProgress}
        title={callInProgress ? "Call in progress" : "Call requester back"}
        className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
          callInProgress
            ? "bg-white/[0.04] text-white/25 border-white/10 cursor-not-allowed"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
        }`}
      >
        <PhoneSolid className="size-3" />
        {callInProgress ? "On call…" : "Call back"}
      </button>
    </div>
  );
}

// ─── Top-level switch ─────────────────────────────────────────────────────────
// `PhoneSourcePanel` has two presentations:
//   • Legacy (Create.jsx, live-call simulation) — pass `notes` + `onNotesChange`
//   • Sessions (Manage.jsx, call history + email tab) — pass `callSessions`
//     + `onCallSessionsChange`
// Each is its own component below so hooks order stays stable.
export default function PhoneSourcePanel(props) {
  if (typeof props.onNotesChange === "function") {
    return <LegacyPhonePanel {...props} />;
  }
  return <SessionsPhonePanel {...props} />;
}

// ─── Legacy live-call view (Create) ────────────────────────────────────────────
function LegacyPhonePanel({
  notes,
  onNotesChange,
  transcription,
  onTranscriptionChange,
  onClose,
  leftPct = 30,
  isAnon = false,
  userDataReady = false,
  userCreated = false,
  onCreateUser,
}) {
  const nowLabel = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
      <div
        className="flex flex-col bg-obsidianSurface border-r border-obsidianHighlight shrink-0 h-full min-h-0 overflow-hidden w-full lg:w-[var(--lp)]"
        style={{ "--lp": `${leftPct}%` }}
      >
        <style>{`
          .phone-panel-textarea::-webkit-scrollbar { width: 4px; }
          .phone-panel-textarea::-webkit-scrollbar-track { background: transparent; }
          .phone-panel-textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
          .phone-panel-textarea::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
          .phone-panel-textarea { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
        `}</style>

        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-obsidianHighlight bg-obsidianNight/40">
          <div className="size-7 rounded-lg flex items-center justify-center border bg-emerald-400/10 border-emerald-400/20">
            <PhoneIcon className="size-3.5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Live call</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
              <p className="text-[10px] text-red-400">Recording · {nowLabel}</p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
            Phone
          </span>
          <button
            onClick={onClose}
            className="shrink-0 size-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-obsidianHighlight transition-colors"
          >
            <ChevronLeftIcon className="size-3.5" />
          </button>
        </div>

        {isAnon && (
          <div className="shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-b border-obsidianHighlight bg-amber-400/5">
            {userCreated ? (
              <>
                <CheckCircleIcon className="size-3.5 text-emerald-400 shrink-0" />
                <p className="text-[10px] text-emerald-400 font-medium flex-1">
                  User account created successfully
                </p>
              </>
            ) : (
              <>
                <span className={`size-1.5 rounded-full shrink-0 ${userDataReady ? "bg-emerald-400" : "bg-amber-400"}`} />
                <p className={`text-[10px] flex-1 font-medium ${userDataReady ? "text-emerald-400/90" : "text-amber-400/80"}`}>
                  {userDataReady
                    ? "Got all user data — can auto fill & create user"
                    : "Caller not found in system"}
                </p>
                <button
                  onClick={onCreateUser}
                  disabled={!userDataReady}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed bg-electricBlue text-white hover:bg-electricBlue/85"
                >
                  <UserPlusIcon className="size-3" />
                  Auto create user
                </button>
              </>
            )}
          </div>
        )}

        {/* Agent notes */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 pt-3 pb-2">
          <p className="shrink-0 text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
            Agent notes
          </p>
          <textarea
            value={notes ?? ""}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={"Type notes while on the call…\n\n• Issue reported\n• Location details\n• Urgency / priority"}
            className="phone-panel-textarea flex-1 min-h-0 w-full resize-none text-[11px] rounded-xl bg-obsidianElevated border border-obsidianHighlight px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-electricBlue/40 leading-relaxed overflow-y-auto"
          />
        </div>

        {/* Transcription */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 pt-1 pb-3">
          <p className="shrink-0 text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
            Transcription
          </p>
          <textarea
            value={transcription ?? ""}
            onChange={(e) => onTranscriptionChange?.(e.target.value)}
            placeholder="Live call transcription will appear here…"
            className="phone-panel-textarea flex-1 min-h-0 w-full resize-none text-[11px] rounded-xl bg-obsidianElevated border border-obsidianHighlight px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-electricBlue/40 leading-relaxed overflow-y-auto"
          />
        </div>
    </div>
  );
}

// ─── Sessions mode (Manage) ───────────────────────────────────────────────────
function SessionsPhonePanel({
  caseItem,
  messages = [],
  onReply,
  callSessions,
  onCallSessionsChange,
  onClose,
  leftPct = 30,
  isAnon = false,
  userDataReady = false,
  userCreated = false,
  onCreateUser,
}) {
  const sessionsSafe = callSessions ?? [];
  const sessions     = sessionsSafe.length > 0 ? sessionsSafe : [newCallSession(caseItem, 0)];
  const [tab,         setTab]         = useState("calls"); // "calls" | "email"
  const [activeIndex, setActiveIndex] = useState(sessions.length - 1);

  // Clamp activeIndex against the live array — handy when sessions grow/shrink
  // outside our knowledge.
  const safeIndex = Math.min(activeIndex, sessions.length - 1);
  const active    = sessions[safeIndex];
  const isLatest  = safeIndex === sessions.length - 1;
  const emailCount = messages.length;

  // Local mirror for the editable notes textarea so typing stays responsive
  // while the parent prop update propagates. Transcription is read-only and
  // pulled straight from the session object — no local copy needed.
  const [localNotes, setLocalNotes] = useState(active?.notes ?? "");

  useEffect(() => {
    setLocalNotes(active?.notes ?? "");
  }, [active?.id]);

  const commitNotes = (val) => {
    setLocalNotes(val);
    if (!isLatest) return;
    const next = sessions.map((s, i) => (i === safeIndex ? { ...s, notes: val } : s));
    onCallSessionsChange?.(next);
  };

  // Auto-save the seeded notes + transcription the first time a session is
  // shown that doesn't yet exist in the parent's `callSessions` array. This
  // covers the bootstrap case where the case opens with no prior call log
  // — the latest session's auto-generated content gets persisted straight
  // away without the user lifting a finger.
  useEffect(() => {
    if (sessionsSafe.length === 0) {
      onCallSessionsChange?.(sessions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call-back flow uses the same global PhoneCallModal that pops up when a
  // new case comes in. We:
  //   1. Create a new (empty) session on the case the moment Call back is
  //      clicked, and switch the picker to it.
  //   2. Dispatch `call:start` so AdminLayout opens the PhoneCallModal.
  //   3. Run a 30-second typewriter that progressively types the agent
  //      notes and the auto-generated transcription into that session,
  //      persisted as it goes.
  //   4. After 30s, dispatch `call:hangup` so the modal closes.
  //   5. If the agent ends the call early, fast-forward the typewriter so
  //      the final notes/transcription are immediately saved in full.
  const [callInProgress, setCallInProgress] = useState(false);

  // Refs to the latest values — keeps the call:end listener stable so it's
  // bound exactly once on mount but always sees current data when it fires.
  const sessionsRef = useRef(sessions);
  const caseRef     = useRef(caseItem);
  const cbRef       = useRef(onCallSessionsChange);
  useEffect(() => { sessionsRef.current = sessions;                  }, [sessions]);
  useEffect(() => { caseRef.current     = caseItem;                  }, [caseItem]);
  useEffect(() => { cbRef.current       = onCallSessionsChange;      }, [onCallSessionsChange]);

  // Holds the in-flight typewriter so we can fast-forward / cancel it
  // when the call ends (either by 30s timer or End Call click).
  const liveCallRef = useRef(null);

  const writeSession = (sessionId, patch) => {
    const latest = sessionsRef.current ?? [];
    const next = latest.map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
    cbRef.current?.(next);
  };

  const openCallback = () => {
    if (callInProgress) return;
    const index        = sessionsRef.current.length;
    const targetNotes  = autoNotes(caseItem, index);
    const targetTrans  = autoTranscription(caseItem, index);
    const newSession   = {
      id:            `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      startedAt:     new Date().toISOString(),
      notes:         "",
      transcription: "",
    };

    // 1) Append the empty session and switch to it
    const nextSessions = [...sessionsRef.current, newSession];
    cbRef.current?.(nextSessions);
    setActiveIndex(nextSessions.length - 1);
    setTab("calls");
    setCallInProgress(true);

    // 2) Open the global PhoneCallModal
    window.dispatchEvent(new CustomEvent("call:start", {
      detail: {
        autoAnswer: true,
        caller:     caseItem?.requester ?? { displayName: "Caller" },
      },
    }));

    // 3) Typewriter — progressively write notes + transcription over ~28s
    //    so the content settles slightly before the 30s auto-hangup.
    const totalMs = 28000;
    const tickMs  = 250;
    const ticks   = Math.ceil(totalMs / tickMs);
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      const p = Math.min(1, tick / ticks);
      writeSession(newSession.id, {
        notes:         targetNotes.slice(0, Math.ceil(targetNotes.length * p)),
        transcription: targetTrans.slice(0, Math.ceil(targetTrans.length * p)),
      });
      if (tick >= ticks) clearInterval(interval);
    }, tickMs);

    // 4) Auto-hangup after 30 seconds
    const hangupTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("call:hangup"));
    }, 30000);

    liveCallRef.current = { interval, hangupTimer, sessionId: newSession.id, targetNotes, targetTrans };
  };

  // When the call ends (either by 30s timer or by the agent hitting End Call
  // in the modal), tear down the slow typewriter, then run a *fast*
  // typewriter that catches up to the full notes + transcription so the
  // agent visually sees the rest pour in instead of the text snapping or
  // disappearing. Once the fast-forward finishes, sync `localNotes` so the
  // textarea — which switches back to local-state binding after the call —
  // keeps the typed content instead of reverting to empty.
  useEffect(() => {
    const onEnded = () => {
      const live = liveCallRef.current;
      if (!live) return;
      clearInterval(live.interval);
      clearTimeout(live.hangupTimer);
      liveCallRef.current = null;

      // Where the slow typewriter got to before being cancelled
      const currentSession = (sessionsRef.current ?? []).find((s) => s.id === live.sessionId);
      const fromNotes = currentSession?.notes ?? "";
      const fromTrans = currentSession?.transcription ?? "";

      const targetNotes = live.targetNotes;
      const targetTrans = live.targetTrans;
      // Fast typewriter — finish whatever's left in a quick ~350ms burst so
      // the agent sees the remaining notes + transcription whip in rather
      // than popping or disappearing.
      const fastMs = 350;
      const tickMs = 20;
      const ticks  = Math.ceil(fastMs / tickMs);
      let tick = 0;
      const fastInterval = setInterval(() => {
        tick += 1;
        const p = Math.min(1, tick / ticks);
        const noteLen  = fromNotes.length + Math.ceil((targetNotes.length - fromNotes.length) * p);
        const transLen = fromTrans.length + Math.ceil((targetTrans.length - fromTrans.length) * p);
        const nextNotes = targetNotes.slice(0, noteLen);
        const nextTrans = targetTrans.slice(0, transLen);
        writeSession(live.sessionId, {
          notes:         nextNotes,
          transcription: nextTrans,
        });
        if (tick >= ticks) {
          clearInterval(fastInterval);
          // Sync the local notes mirror so the textarea (now editable again)
          // shows the full typed-out content rather than reverting.
          setLocalNotes(targetNotes);
          setCallInProgress(false);
        }
      }, tickMs);
    };
    window.addEventListener("call:end", onEnded);
    return () => window.removeEventListener("call:end", onEnded);
  }, []);

  return (
    <div
      className="flex flex-col bg-obsidianSurface border-r border-obsidianHighlight shrink-0 h-full min-h-0 overflow-hidden w-full lg:w-[var(--lp)]"
      style={{ "--lp": `${leftPct}%` }}
    >
      <style>{`
        .phone-panel-textarea::-webkit-scrollbar { width: 4px; }
        .phone-panel-textarea::-webkit-scrollbar-track { background: transparent; }
        .phone-panel-textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .phone-panel-textarea::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        .phone-panel-textarea { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
      `}</style>

      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-obsidianHighlight bg-obsidianNight/40">
        <div className="size-7 rounded-lg flex items-center justify-center border bg-emerald-400/10 border-emerald-400/20">
          <PhoneIcon className="size-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {caseItem?.requester?.displayName ?? "Caller"}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            via Phone · replies sent by Email
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
          Phone
        </span>
        <button
          onClick={onClose}
          className="shrink-0 size-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-obsidianHighlight transition-colors"
        >
          <ChevronLeftIcon className="size-3.5" />
        </button>
      </div>

      {/* Anonymous user banner */}
      {isAnon && (
        <div className="shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-b border-obsidianHighlight bg-amber-400/5">
          {userCreated ? (
            <>
              <CheckCircleIcon className="size-3.5 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-400 font-medium flex-1">
                User account created successfully
              </p>
            </>
          ) : (
            <>
              <span className={`size-1.5 rounded-full shrink-0 ${userDataReady ? "bg-emerald-400" : "bg-amber-400"}`} />
              <p className={`text-[10px] flex-1 font-medium ${userDataReady ? "text-emerald-400/90" : "text-amber-400/80"}`}>
                {userDataReady
                  ? "Got all user data — can auto fill & create user"
                  : "Caller not found in system"}
              </p>
              <button
                onClick={onCreateUser}
                disabled={!userDataReady}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed bg-electricBlue text-white hover:bg-electricBlue/85"
              >
                <UserPlusIcon className="size-3" />
                Auto create user
              </button>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-obsidianHighlight">
        <TabPill
          active={tab === "calls"}
          icon={ChatBubbleLeftRightIcon}
          label="Calls"
          badge={sessions.length}
          onClick={() => setTab("calls")}
        />
        <TabPill
          active={tab === "email"}
          icon={EnvelopeIcon}
          label="Email"
          badge={emailCount}
          onClick={() => setTab("email")}
        />
      </div>

      {/* Tab body */}
      {tab === "calls" ? (
        <>
          <SessionPicker
            sessions={sessions}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
            onNewCallback={openCallback}
            callInProgress={callInProgress}
          />
          {!isLatest && (
            <div className="shrink-0 px-3 py-1.5 bg-amber-400/5 border-b border-amber-400/15 text-[10px] text-amber-400/80 text-center">
              Viewing an earlier call — read-only
            </div>
          )}
          {/* Agent notes */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 pt-3 pb-2">
            <div className="shrink-0 flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                Agent notes
              </p>
              {callInProgress && isLatest && (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-400">
                  <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
                  Typing notes…
                </span>
              )}
            </div>
            <textarea
              // While the call is live, the typewriter is streaming notes
              // straight into the session — bind to the session's notes so
              // characters appear as they're written. After the call ends,
              // fall back to the local mirror so the agent can edit freely.
              value={callInProgress && isLatest ? (active?.notes ?? "") : localNotes}
              onChange={(e) => commitNotes(e.target.value)}
              readOnly={!isLatest || (callInProgress && isLatest)}
              placeholder={"Type notes while on the call…\n\n• Issue reported\n• Location details\n• Urgency / priority"}
              className={`phone-panel-textarea flex-1 min-h-0 w-full resize-none text-[11px] rounded-xl bg-obsidianElevated border px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none leading-relaxed overflow-y-auto ${
                isLatest
                  ? "border-obsidianHighlight focus:border-electricBlue/40"
                  : "border-obsidianHighlight/50 opacity-70 cursor-default"
              }`}
            />
          </div>

          {/* Transcription — auto-saved, not editable */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 pt-1 pb-3">
            <div className="shrink-0 flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                Transcription
              </p>
              {callInProgress && isLatest ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-400">
                  <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
                  Transcribing…
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-400/80">
                  <span className="size-1 rounded-full bg-emerald-400" />
                  Auto-saved
                </span>
              )}
            </div>
            <textarea
              value={active?.transcription ?? ""}
              readOnly
              placeholder="Live call transcription will appear here…"
              className="phone-panel-textarea flex-1 min-h-0 w-full resize-none text-[11px] rounded-xl bg-obsidianNight/40 border border-obsidianHighlight/50 px-3 py-2.5 text-white/85 placeholder:text-white/20 focus:outline-none leading-relaxed overflow-y-auto cursor-default"
            />
          </div>
        </>
      ) : (
        <>
          <ThreadPanel
            messages={messages}
            requester={caseItem?.requester}
            source="Email"
          />
          <ReplyComposer
            source="Phone"
            onSend={onReply}
            requester={caseItem?.requester}
            messages={messages}
            workOrderNumber={caseItem?.workOrderNumber ?? caseItem?.workOrderId}
          />
        </>
      )}

    </div>
  );
}

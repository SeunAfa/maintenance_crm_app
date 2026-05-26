import {
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

const SOURCES = [
  { key: "Phone",      label: "Phone",      Icon: PhoneIcon },
  { key: "Email",      label: "Email",      Icon: EnvelopeIcon },
  { key: "WhatsApp",   label: "WhatsApp",   Icon: ChatBubbleLeftEllipsisIcon },
  { key: "Web Portal", label: "Web Portal", Icon: GlobeAltIcon },
];

const SOURCE_CONFIG = {
  "Phone":      { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Email":      { color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  "WhatsApp":   { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Web Portal": { color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
};

// ─── Call notepad: Notes + Transcription ─────────────────────────────────────
function CallNotepad({ notes, onNotesChange, transcription, onTranscriptionChange }) {
  const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex-1 flex flex-col min-h-0 px-3 py-3 gap-3 overflow-hidden">
      {/* Recording indicator */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <span className="size-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="text-[11px] text-red-400 font-medium">Call in progress</span>
        <span className="ml-auto text-[10px] text-white/30 shrink-0">{now}</span>
      </div>

      {/* Notes */}
      <div className="flex-1 flex flex-col min-h-0">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5 shrink-0">
          Agent notes
        </p>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={"Type notes while on the call…\n\n• Issue reported\n• Location details\n• Urgency / priority"}
          className="flex-1 w-full resize-none text-[11px] rounded-xl bg-obsidianElevated border border-obsidianHighlight px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-electricBlue/40 leading-relaxed text-left min-h-0"
        />
      </div>

      {/* Transcription */}
      <div className="flex-1 flex flex-col min-h-0">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5 shrink-0">
          Transcription
        </p>
        <textarea
          value={transcription}
          onChange={(e) => onTranscriptionChange(e.target.value)}
          placeholder="Live call transcription will appear here…"
          className="flex-1 w-full resize-none text-[11px] rounded-xl bg-obsidianElevated border border-obsidianHighlight px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-electricBlue/40 leading-relaxed text-left min-h-0"
        />
      </div>
    </div>
  );
}

// ─── Email paste panel ────────────────────────────────────────────────────────
function EmailPastePanel({ emailData, onChange }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 px-3 py-3 gap-2 overflow-hidden">
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold shrink-0">
        Incoming email
      </p>

      <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidianElevated border border-obsidianHighlight">
        <span className="text-[10px] text-white/25 w-10 shrink-0">From</span>
        <input
          value={emailData.from}
          onChange={(e) => onChange({ ...emailData, from: e.target.value })}
          placeholder="sender@example.com"
          className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 outline-none text-left"
        />
      </div>

      <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidianElevated border border-obsidianHighlight">
        <span className="text-[10px] text-white/25 w-10 shrink-0">Subject</span>
        <input
          value={emailData.subject}
          onChange={(e) => onChange({ ...emailData, subject: e.target.value })}
          placeholder="Subject…"
          className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 outline-none text-left"
        />
      </div>

      <textarea
        value={emailData.body}
        onChange={(e) => onChange({ ...emailData, body: e.target.value })}
        placeholder="Paste or type the email body here…"
        className="flex-1 resize-none text-[11px] rounded-xl bg-obsidianElevated border border-obsidianHighlight px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-electricBlue/40 leading-relaxed text-left min-h-0"
      />
    </div>
  );
}

// ─── CreateSourcePanel ────────────────────────────────────────────────────────
export default function CreateSourcePanel({
  source,
  onSourceChange,
  notes,
  onNotesChange,
  transcription,
  onTranscriptionChange,
  emailData,
  onEmailChange,
  onClose,
  leftPct = 30,
}) {
  return (
    <div
      className="flex flex-col bg-obsidianSurface border-r border-obsidianHighlight overflow-hidden shrink-0 h-full min-h-0 w-full lg:w-[var(--lp)]"
      style={{ "--lp": `${leftPct}%` }}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-obsidianHighlight bg-obsidianNight/40 px-3 py-2.5">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Source</p>
          <button
            onClick={onClose}
            className="size-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-obsidianHighlight transition-colors"
          >
            <ChevronLeftIcon className="size-3.5" />
          </button>
        </div>

        {/* Source selector */}
        <div className="flex flex-wrap gap-1">
          {SOURCES.map(({ key, label, Icon }) => {
            const active = source === key;
            const c = SOURCE_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => onSourceChange(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  active
                    ? `${c.bg} ${c.color} ${c.border}`
                    : "bg-transparent text-white/30 border-transparent hover:bg-obsidianHighlight hover:text-white/60"
                }`}
              >
                <Icon className="size-3 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {source === "Email" ? (
        <EmailPastePanel emailData={emailData} onChange={onEmailChange} />
      ) : (
        <CallNotepad
          notes={notes}
          onNotesChange={onNotesChange}
          transcription={transcription}
          onTranscriptionChange={onTranscriptionChange}
        />
      )}
    </div>
  );
}

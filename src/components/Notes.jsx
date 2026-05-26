import { useMemo, useRef, useState } from "react";
import { Lock, Eye, Send, User } from "lucide-react";
import { USERS_DATA, WORKERS_DATA } from "../data/usersData";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

// Mentions pool: agents (USERS_DATA staff/management) + workers
const MENTION_POOL = [
  ...USERS_DATA.filter((u) => !u.isStudent),
  ...WORKERS_DATA,
];

// Resolve a friendly role label for a note author.
export function lookupAuthorRole(authorName) {
  if (!authorName) return null;
  const user = USERS_DATA.find((u) => u.displayName === authorName);
  if (user) {
    if (user.isAgent)                    return "Helpdesk";
    if (user.userRole === "OurEmployee") return user.jobTitle || "Staff";
    if (user.userRole)                   return user.userRole;
  }
  const worker = WORKERS_DATA.find((w) => w.displayName === authorName);
  if (worker) return worker.workerRole || "Engineer";
  return "Helpdesk";
}

// Render a note body with @mention highlighting
function renderNoteText(raw) {
  if (!raw?.includes("@")) return raw;
  const parts = raw.split(/(@[\w][^\s@]*(?:\s[\w][^\s@]*)?)/g);
  return parts.map((part, i) =>
    part.startsWith("@")
      ? <span key={i} className="text-electricBlue font-medium">{part}</span>
      : part
  );
}

// ─── Notes list (scrollable area) ────────────────────────────────────────────
export function NotesList({ notes = [] }) {
  return (
    <div className="flex flex-col gap-3">
      {notes.length === 0 ? (
        <p className="text-[11px] text-white/25 text-center py-6">No notes yet</p>
      ) : notes.map((n) => (
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
      ))}
    </div>
  );
}

// ─── Note composer (pinned bottom) ───────────────────────────────────────────
export function NoteComposer({ onAddNote }) {
  const [text, setText]                 = useState("");
  const [internal, setInternal]         = useState(true);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef(null);

  const mentionResults = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return MENTION_POOL.filter((u) => (u.displayName ?? "").toLowerCase().includes(q)).slice(0, 8);
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

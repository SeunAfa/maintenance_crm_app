import { useRef, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

// ─── Linkify ──────────────────────────────────────────────────────────────────
// Walks message text and replaces URLs with anchor elements. Returns an array
// of strings + React elements so callers can drop the result into a wrapper
// that preserves whitespace.
const URL_REGEX = /https?:\/\/[^\s]+[^\s.,;:!?)\]]/g;

function linkify(text) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  let m;
  const re = new RegExp(URL_REGEX.source, "g");
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a
        key={m.index}
        href={m[0]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-electricBlue underline underline-offset-2 hover:text-electricBlue/80 break-all transition-colors"
      >
        {m[0]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// ─── Attachment chip ──────────────────────────────────────────────────────────
const EXT_COLOR = {
  pdf:  "text-red-400 bg-red-400/10 border-red-400/20",
  jpg:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  jpeg: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  png:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  docx: "text-blue-300 bg-blue-300/10 border-blue-300/20",
  xlsx: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function AttachmentChip({ name = "", size = "" }) {
  const ext  = name.split(".").pop().toLowerCase();
  const cls  = EXT_COLOR[ext] ?? "text-white/40 bg-white/5 border-white/10";
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium ${cls}`}>
      <PaperClipIcon className="size-3 shrink-0" />
      <span className="truncate max-w-[120px]">{name}</span>
      {size && <span className="text-[9px] opacity-60 shrink-0">{size}</span>}
    </div>
  );
}

// ─── Email message card ───────────────────────────────────────────────────────
function EmailCard({ msg, requester, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isAgent    = msg.from === "agent";
  const senderName = isAgent ? "Support Team" : (requester?.displayName ?? "Requester");
  const senderEmail = isAgent
    ? "support@facility.com"
    : (requester?.email ?? "requester@example.com");
  const toEmail    = isAgent
    ? (requester?.email ?? "requester@example.com")
    : "support@facility.com";

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${
      isAgent
        ? "border-electricBlue/20 bg-electricBlue/5"
        : "border-obsidianHighlight bg-obsidianElevated"
    }`}>
      {/* Header row — always visible, click to expand */}
      <div
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
      >
        {/* Avatar */}
        <div className={`size-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
          isAgent ? "bg-electricBlue/20 text-electricBlue" : "bg-electricBlue text-white"
        }`}>
          {isAgent ? "Me" : getInitials(senderName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-white truncate">{senderName}</span>
            <span className="text-[10px] text-white/30 shrink-0">{msg.time}</span>
          </div>

          {expanded ? (
            <div className="text-[10px] text-white/35 mt-0.5">
              <span>to </span>
              <span className="text-white/50">{toEmail}</span>
            </div>
          ) : (
            <p className="text-[10px] text-white/35 truncate mt-0.5">{msg.text}</p>
          )}
        </div>

        {expanded
          ? <ChevronUpIcon   className="size-3.5 text-white/25 shrink-0 mt-1" />
          : <ChevronDownIcon className="size-3.5 text-white/25 shrink-0 mt-1" />}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-obsidianHighlight/40">
          {/* Metadata rows */}
          <div className="px-3 py-2 space-y-1 border-b border-obsidianHighlight/30 bg-obsidianNight/20">
            <MetaRow label="From"    value={`${senderName} <${senderEmail}>`} />
            <MetaRow label="To"      value={toEmail} />
            {msg.subject && <MetaRow label="Subject" value={msg.subject} highlight />}
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <p className="text-[11px] text-white/70 leading-relaxed whitespace-pre-line">
              {linkify(msg.text)}
            </p>
          </div>

          {/* Attachments */}
          {msg.attachments?.length > 0 && (
            <div className="px-3 pb-3 flex flex-wrap gap-1.5 border-t border-obsidianHighlight/30 pt-2.5">
              {msg.attachments.map((a, i) => (
                <AttachmentChip key={i} name={a.name} size={a.size} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value, highlight }) {
  return (
    <div className="flex gap-2 text-[10px]">
      <span className="text-white/25 w-12 shrink-0">{label}</span>
      <span className={highlight ? "text-white/80 font-medium" : "text-white/50 truncate"}>{value}</span>
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg, requester }) {
  const isAgent = msg.from === "agent";
  return (
    <div className={`flex items-end gap-2 ${isAgent ? "justify-end" : "justify-start"}`}>
      {!isAgent && (
        <div className="size-6 rounded-full bg-electricBlue flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          {getInitials(requester?.displayName ?? "?")}
        </div>
      )}
      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-line ${
        isAgent
          ? "bg-electricBlue text-white rounded-br-sm"
          : "bg-obsidianElevated border border-obsidianHighlight text-white/80 rounded-bl-sm"
      }`}>
        <span className={isAgent ? "[&_a]:text-white [&_a]:underline" : undefined}>
          {linkify(msg.text)}
        </span>
        <div className={`text-[9px] mt-1.5 ${isAgent ? "text-white/50 text-right" : "text-white/30"}`}>
          {msg.time}
        </div>
      </div>
      {isAgent && (
        <div className="size-6 rounded-full bg-electricBlue/20 flex items-center justify-center text-[9px] font-bold text-electricBlue shrink-0">
          Me
        </div>
      )}
    </div>
  );
}

// ─── ThreadPanel ──────────────────────────────────────────────────────────────
export default function ThreadPanel({ messages = [], requester, source }) {
  const ref        = useRef(null);
  const isEmail    = source === "Email";

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={ref} className={`flex-1 overflow-y-auto min-h-0 ${isEmail ? "px-3 py-3 space-y-2" : "px-4 py-4 space-y-3"}`}>
      {messages.length === 0 && (
        <p className="text-center text-[11px] text-white/20 py-8">No messages yet</p>
      )}

      {isEmail
        ? messages.map((msg, i) => (
            <EmailCard
              key={i}
              msg={msg}
              requester={requester}
              defaultExpanded={i === messages.length - 1}
            />
          ))
        : messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} requester={requester} />
          ))}
    </div>
  );
}

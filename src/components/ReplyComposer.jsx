import { useState } from "react";
import { PaperAirplaneIcon, ChevronDownIcon, ChevronUpIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { getReplyChannel } from "../utils/comms";

const TEMPLATES = [
  {
    label:   "Acknowledged",
    message: "Thank you for reaching out. We've received your report and our team will be in touch shortly.",
  },
  {
    label:   "Assigned",
    message: "Your case has been assigned to our maintenance team. You can expect to hear from us within 24 hours.",
  },
  {
    label:   "Inspection booked",
    message: "We've arranged an inspection for the reported issue. A technician will be in touch to confirm the visit.",
  },
  {
    label:   "More info needed",
    message: "Thank you for your message. Could you please provide additional details about the issue so we can assist you more effectively?",
  },
  {
    label:   "Resolved",
    message: "We're pleased to confirm that the issue has now been resolved. Please don't hesitate to get in touch if you need any further assistance.",
  },
  {
    label:   "Delayed",
    message: "We apologise for the delay in resolving your case. We are actively working on it and will keep you updated on progress.",
  },
];

// ─── Email Composer ───────────────────────────────────────────────────────────
function EmailComposer({ requester, onSend }) {
  const [to,      setTo]      = useState(requester?.email || "");
  const [cc,      setCc]      = useState("");
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const send = () => {
    const b = body.trim();
    if (!b) return;
    onSend(b, { to, cc, subject });
    setBody("");
  };

  const applyTemplate = (msg) => {
    setBody(msg);
    setShowTemplates(false);
  };

  return (
    <div className="shrink-0 border-t border-obsidianHighlight bg-obsidianNight/60">
      {/* Templates panel */}
      {showTemplates && (
        <div className="border-b border-obsidianHighlight px-3 py-2.5 flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Quick replies</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t.message)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-obsidianHighlight bg-obsidianElevated text-white/60 hover:border-electricBlue/40 hover:text-electricBlue hover:bg-electricBlue/10 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 pt-3 pb-2.5 flex flex-col gap-0">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-400/10 text-blue-400 border border-blue-400/20">
            New email
          </span>
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
          >
            Templates
            {showTemplates
              ? <ChevronUpIcon className="size-3" />
              : <ChevronDownIcon className="size-3" />}
          </button>
        </div>

        {/* Email fields */}
        <div className="rounded-xl border border-obsidianHighlight bg-obsidianElevated overflow-hidden">
          {/* To */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-obsidianHighlight/60">
            <span className="text-[10px] text-white/25 w-10 shrink-0">To</span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 outline-none"
            />
          </div>

          {/* Cc */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-obsidianHighlight/60">
            <span className="text-[10px] text-white/25 w-10 shrink-0">Cc</span>
            <input
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
              className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 outline-none"
            />
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-obsidianHighlight/60">
            <span className="text-[10px] text-white/25 w-10 shrink-0">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject…"
              className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 outline-none"
            />
          </div>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            rows={4}
            placeholder="Write your message…"
            className="w-full resize-none text-[11px] bg-transparent px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none leading-relaxed text-left"
          />
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-2">
          <button className="flex items-center gap-1.5 text-[10px] text-white/35 hover:text-white/60 transition-colors">
            <PaperClipIcon className="size-3.5" />
            Attach
          </button>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-white/20">Enter to send</p>
            <button
              onClick={send}
              disabled={!body.trim()}
              className="h-7 px-3 rounded-lg bg-electricBlue flex items-center gap-1.5 text-white text-[11px] font-medium disabled:opacity-30 hover:bg-electricBlue/80 transition-colors shrink-0"
            >
              <PaperAirplaneIcon className="size-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Composer ────────────────────────────────────────────────────────────
const SOURCE_LABEL = {
  "Email":      "Email",
  "Phone":      "Phone",
  "WhatsApp":   "WhatsApp",
  "Web Portal": "Web Portal",
};

function ChatComposer({ source, onSend }) {
  const [text, setText]             = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  const applyTemplate = (msg) => {
    setText(msg);
    setShowTemplates(false);
  };

  return (
    <div className="shrink-0 border-t border-obsidianHighlight bg-obsidianNight/60">
      {showTemplates && (
        <div className="border-b border-obsidianHighlight px-3 py-2.5 flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Quick replies</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t.message)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-obsidianHighlight bg-obsidianElevated text-white/60 hover:border-electricBlue/40 hover:text-electricBlue hover:bg-electricBlue/10 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-electricBlue/10 text-electricBlue border border-electricBlue/20">
            Reply via {SOURCE_LABEL[source] ?? "Portal"}
          </span>
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
          >
            Templates
            {showTemplates
              ? <ChevronUpIcon className="size-3" />
              : <ChevronDownIcon className="size-3" />}
          </button>
        </div>

        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            rows={3}
            placeholder="Type a reply…"
            className="flex-1 resize-none text-[11px] rounded-xl bg-obsidianElevated border border-obsidianHighlight px-3 py-2 text-white placeholder:text-white/25 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue leading-relaxed text-left"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="size-9 rounded-xl bg-electricBlue flex items-center justify-center text-white disabled:opacity-30 hover:bg-electricBlue/80 transition-colors shrink-0"
          >
            <PaperAirplaneIcon className="size-4" />
          </button>
        </div>

        <p className="text-[10px] text-white/20 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

// ─── ReplyComposer ────────────────────────────────────────────────────────────
// The outbound channel is derived from the inbound source — Email & WhatsApp
// reply on the same channel; Phone / Web Portal fall back to Email.
export default function ReplyComposer({ source, onSend, requester, messages = [] }) {
  const channel = getReplyChannel(source);

  if (channel === "Email") {
    return (
      <EmailComposer
        requester={requester}
        onSend={(body, meta) => onSend(body, { ...(meta ?? {}), channel: "Email" })}
      />
    );
  }
  return (
    <ChatComposer
      source={channel}
      onSend={(text) => onSend(text, { channel })}
    />
  );
}

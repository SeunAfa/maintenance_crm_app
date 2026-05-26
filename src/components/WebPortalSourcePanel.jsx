import { useState } from "react";
import {
  GlobeAltIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import ThreadPanel from "./ThreadPanel";
import ReplyComposer from "./ReplyComposer";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtLocation(loc) {
  if (!loc) return "—";
  const parts = [
    loc.campus,
    loc.building,
    loc.block ? `Block ${loc.block}` : null,
    loc.floor,
    loc.flat,
    loc.room,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function fmtSubmittedAt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ─── Tab pill ─────────────────────────────────────────────────────────────────
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

// ─── Field card ───────────────────────────────────────────────────────────────
function FieldCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-lg bg-obsidianElevated px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="size-3 text-white/30" />
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
// Web Portal cases come in as a form submission (existing user → description +
// location). We render the form data in a read-only Portal tab, and an Email
// tab carries all back-and-forth communications.
export default function WebPortalSourcePanel({
  caseItem,
  messages = [],
  onReply,
  onClose,
  leftPct = 30,
}) {
  const [tab, setTab] = useState("portal"); // "portal" | "email"

  // The Email tab only shows agent communications + any explicit Email-channel
  // replies. The original portal submission lives in the Portal tab instead.
  const emailMessages = messages.filter(
    (m) => m.from === "agent" || m.channel === "Email"
  );
  const emailCount = emailMessages.length;

  return (
    <div
      className="flex flex-col bg-obsidianSurface border-r border-obsidianHighlight shrink-0 h-full min-h-0 overflow-hidden w-full lg:w-[var(--lp)]"
      style={{ "--lp": `${leftPct}%` }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-obsidianHighlight bg-obsidianNight/40">
        <div className="size-7 rounded-lg flex items-center justify-center border bg-violet-400/10 border-violet-400/20">
          <GlobeAltIcon className="size-3.5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {caseItem?.requester?.displayName ?? "—"}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            via Web Portal · replies sent by Email
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border bg-violet-400/10 text-violet-400 border-violet-400/20">
          Web Portal
        </span>
        <button
          onClick={onClose}
          className="shrink-0 size-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-obsidianHighlight transition-colors"
        >
          <ChevronLeftIcon className="size-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-obsidianHighlight">
        <TabPill
          active={tab === "portal"}
          icon={DocumentTextIcon}
          label="Portal Submission"
          onClick={() => setTab("portal")}
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
      {tab === "portal" ? (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <CalendarIcon className="size-3.5 text-white/30 shrink-0" />
            <span>Submitted {fmtSubmittedAt(caseItem?.createdAt)}</span>
          </div>

          <FieldCard icon={UserIcon} label="Requester">
            <p className="text-xs font-medium text-white">
              {caseItem?.requester?.displayName ?? "—"}
            </p>
            {caseItem?.requester?.email && (
              <p className="text-[10px] text-white/40 mt-0.5">{caseItem.requester.email}</p>
            )}
          </FieldCard>

          <FieldCard icon={DocumentTextIcon} label="Issue description">
            <p className="text-[11px] text-white/80 leading-relaxed whitespace-pre-wrap">
              {caseItem?.description || "—"}
            </p>
          </FieldCard>

          <FieldCard icon={MapPinIcon} label="Location">
            <p className="text-[11px] text-white/80 leading-relaxed">
              {fmtLocation(caseItem?.location)}
            </p>
          </FieldCard>

          {caseItem?.ServiceCategory && (
            <FieldCard icon={TagIcon} label="Service category">
              <p className="text-[11px] text-white/80">
                {caseItem.ServiceCategory.title ||
                  caseItem.ServiceCategory.label ||
                  caseItem.ServiceCategory.name ||
                  "—"}
              </p>
            </FieldCard>
          )}
        </div>
      ) : (
        <>
          <ThreadPanel
            messages={emailMessages}
            requester={caseItem?.requester}
            source="Email"
          />
          <ReplyComposer
            source="Web Portal"
            onSend={onReply}
            requester={caseItem?.requester}
            messages={emailMessages}
            workOrderNumber={caseItem?.workOrderNumber ?? caseItem?.workOrderId}
          />
        </>
      )}
    </div>
  );
}

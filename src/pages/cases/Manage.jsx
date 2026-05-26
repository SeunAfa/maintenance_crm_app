import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";
import CaseDetailsPanel from "../../components/CaseDetailsPanel";
import { NoteComposer, lookupAuthorRole } from "../../components/Notes";
import { CURRENT_AGENT } from "../../data/usersData";
import ConvertFAB from "../../components/ConvertFAB";
import WorkOrderPanel from "../../components/WorkOrderPanel";
import ResizableDivider from "../../components/ResizableDivider";
import AILoadingOverlay from "../../components/AILoadingOverlay";
import SourceThreadPanel from "../../components/SourceThreadPanel";
import PhoneSourcePanel from "../../components/PhoneSourcePanel";
import WebPortalSourcePanel from "../../components/WebPortalSourcePanel";
import CaseTabsHeader from "../../components/CaseTabsHeader";
import CaseToolBar from "../../components/CaseToolbar";
import {
  // CHANNEL_CONFIG,
  CASE_STATUSES,
  STATUS_STYLE,
  CAMPUSES,
  CAMPUS_BUILDINGS,
} from "../../utils/constants";
import { SUB_CATEGORIES_ISSUE } from "../../data/subCategoriesIssues";
import { useCases } from "../../context/CasesContext";
import { buildLifecycleMessage, buildTrackingLink } from "../../utils/comms";

// ─── AI email analyser ────────────────────────────────────────────────────────
function analyseEmailText(text = "") {
  const raw = text.toLowerCase();

  // Priority
  let priority = "Medium";
  if (/\bcritical\b|fire alarm|collapse|gas leak|flood/.test(raw))
    priority = "Critical";
  else if (/\burgent\b|asap|as soon as possible|emergency|no heating|boiler|no hot water|elderly|immediately/.test(raw))
    priority = "Urgent";
  else if (/access door|keypad|several|multiple|staff unable|burst|access control|\bhigh\b/.test(raw))
    priority = "High";
  else if (/low|minor|cosmetic|non.urgent/.test(raw))
    priority = "Low";

  // Service Category — keyword → issue id
  const allIssues = SUB_CATEGORIES_ISSUE.flatMap((cat) =>
    cat.issues.map((issue) => ({ ...issue }))
  );
  const KEYWORD_MAP = [
    { re: /no heat|no hot water|boiler|heating not work/,          id: "h1" },
    { re: /unusual noise|rattle|bang.*unit/,                       id: "h2" },
    { re: /thermostat/,                                            id: "h3" },
    { re: /refrigerant/,                                           id: "h5" },
    { re: /ventilat|blocked vent/,                                 id: "h6" },
    { re: /burst pipe/,                                            id: "p1" },
    { re: /blocked drain/,                                         id: "p2" },
    { re: /leaking tap|dripping/,                                  id: "p3" },
    { re: /no hot water/,                                          id: "p4" },
    { re: /toilet/,                                                id: "p5" },
    { re: /water pressure/,                                        id: "p6" },
    { re: /power outage|no power/,                                 id: "e1" },
    { re: /circuit breaker|tripped/,                               id: "e2" },
    { re: /light.*flicker|faulty light/,                           id: "e3" },
    { re: /emergency light/,                                       id: "e4" },
    { re: /generator/,                                             id: "e5" },
    { re: /socket|outlet/,                                         id: "e6" },
    { re: /ceiling crack|ceiling.*collapse/,                       id: "s1" },
    { re: /door.*not open|window.*crack|window.*broken/,           id: "s2" },
    { re: /floor damage|trip hazard/,                              id: "s3" },
    { re: /wall crack/,                                            id: "s4" },
    { re: /roof leak/,                                             id: "s5" },
    { re: /railing|banister/,                                      id: "s6" },
    { re: /cctv|camera.*offline/,                                  id: "sec1" },
    { re: /access.*door|keypad|access control|door.*unresponsive/, id: "sec2" },
    { re: /broken lock|lock.*broken/,                              id: "sec3" },
    { re: /fire alarm/,                                            id: "sec4" },
    { re: /intruder/,                                              id: "sec5" },
    { re: /panic button/,                                          id: "sec6" },
  ];
  let serviceCategory = null;
  for (const { re, id } of KEYWORD_MAP) {
    if (re.test(raw)) { serviceCategory = allIssues.find((i) => i.id === id) ?? null; break; }
  }

  // Description — first 2 sentences of the email body
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && !/^(hi|hello|dear|thanks|thank you|kind regards)/i.test(s));
  const description = sentences.slice(0, 2).join(" ").slice(0, 200);

  return { priority, serviceCategory, description };
}

// ─── Light-touch description summariser ───────────────────────────────────────
// Used by the "Auto-summarise description" button. Strips greetings and
// sign-offs and collapses whitespace, but keeps every substantive sentence
// the user has written — including text they appended after the initial
// auto-fill or after raising the case via the web portal. Unlike the
// aggressive first-pass `analyseEmailText` summariser this never drops
// content beyond pleasantries.
function summariseDescription(text = "") {
  if (!text.trim()) return "";
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) =>
      s.length > 0 &&
      !/^(hi|hello|hey|dear|to whom)[\s,!]/i.test(s) &&
      !/^(thanks|thank you|many thanks|kind regards|regards|best|cheers|sincerely|yours)\b/i.test(s)
    );
  return sentences.join(" ").replace(/\s+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
export const Icons = {
  WhatsApp: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  Email: ({ size = 16 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  ),
  Globe: ({ size = 16 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  ),
  Sparkles: ({ size = 16 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  ),
  Send: ({ size = 16 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  ),
  ChevronDown: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  ),
  ChevronLeft: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  ),
  ChevronRight: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  ),
  X: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Check: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  ),
  Clipboard: ({ size = 16 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
      />
    </svg>
  ),
  User: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  ),
  Users: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),
  Lock: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  ),
  AcademicCap: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
      />
    </svg>
  ),
  Pencil: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  ),
  Wrench: ({ size = 16 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
      />
    </svg>
  ),
  Link: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  ),
  Warning: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  ),
  Search: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"
      />
    </svg>
  ),
  MessageBubble: ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  ),
};

export const CHANNEL_CONFIG = {
  whatsapp: {
    label: "WhatsApp",
    Icon: Icons.WhatsApp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  email: {
    label: "Email",
    Icon: Icons.Email,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    pill: "bg-blue-100 text-blue-700 border-blue-200",
  },
  portal: {
    label: "Web Portal",
    Icon: Icons.Globe,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    pill: "bg-violet-100 text-violet-700 border-violet-200",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export function buildCaseTitle({
  building = "",
  block = "",
  description = "",
}) {
  const loc = [building, block ? `Block ${block}` : ""]
    .filter(Boolean)
    .join(", ");
  const sum = description.split(/[.\n]/)[0].trim().slice(0, 60);
  return [loc, sum].filter(Boolean).join(" – ");
}
function nowTime() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
const priorityPillCls = (p) =>
  ({
    Critical: "bg-red-100 text-red-700 border-red-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
  }[p] || "bg-slate-100 text-slate-500 border-slate-200");

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE
// ─────────────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 bg-white transition-colors";
const selectCls = inputCls + " appearance-none cursor-pointer";

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_MESSAGES = [
  {
    from: "tenant",
    subject: "AC unit not working — Room 204",
    text: "Hi,\n\nThe AC unit in room 204 has stopped working since yesterday evening. It's very hot in there and I have an exam tomorrow.\n\nPlease can someone look at this urgently?\n\nThanks,\nAmara",
    time: "09:42",
    attachments: [
      { name: "ac_unit_photo.jpg", size: "1.2 MB" },
    ],
  },
  {
    from: "agent",
    subject: "Re: AC unit not working — Room 204",
    text: "Hi Amara,\n\nThank you for reaching out. We've received your report and logged it as a priority case.\n\nOur maintenance team will arrange an inspection shortly and we'll keep you updated on progress.\n\nKind regards,\nFacility Support Team",
    time: "09:44",
  },
];
const SAMPLE_WO = {
  jobDescription:
    "Inspect and repair HVAC/AC unit — non-functional since previous evening.",
  priority: "High",
  category: "HVAC",
  location: "Rutherford Hall, Block B, Floor 2, Flat 7",
  estimatedDuration: "2 hours",
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT – CaseView
// ─────────────────────────────────────────────────────────────────────────────
export default function Manage({
  // initialCase = SAMPLE_CASE,
  // initialRequester = SAMPLE_REQUESTER,
  // initialMessages = SAMPLE_MESSAGES,
  onWorkOrderSave,
}) {
  const { cases, updateCase } = useCases();

  const { id } = useParams();

  const caseItem = cases.find((c) => c.id === Number(id));

  // ── Stage mapping ──────────────────────────────────────────────────────────
  const STEP_FROM_STATUS = { "New": 0, "In Review": 1, "Qualify": 2, "Action": 3, "Converted": 4, "Closed": 4 };
  const STATUS_FROM_STEP = ["New", "In Review", "Qualify", "Action", "Converted"];
  // caseStep is derived after fields (see below) so it reads from local state

  const [fields, setFields] = useState({
    caseId:            caseItem?.caseId ?? "",
    requester:         caseItem?.requester?.displayName ?? "",
    affectedRequester: caseItem?.affectedRequester ?? {},
    // Always read saved values — never blank on re-mount even when status is "New"
    description:       caseItem?.description ?? "",
    requesterEmail:    caseItem?.requester?.email ?? "",
    clientEmployee:    caseItem?.requester?.clientEmployee ?? false,
    isStudent:         caseItem?.requester?.isStudent ?? false,
    requesterExist:    caseItem?.requester?.requesterExist ?? false,
    requestTypes:      caseItem?.requestTypes ?? "",
    source:            caseItem?.source ?? "",
    contractType:      caseItem?.requester?.contractType ?? "",
    site:              caseItem?.requester?.site ?? "",
    case_status:       caseItem?.case_status ?? "New",
    priority:          caseItem?.priority ?? "",
    ServiceCategory:   caseItem?.ServiceCategory ?? null,
    campus:            caseItem?.location?.campus ?? "",
    building:          caseItem?.location?.building ?? "",
    block:             caseItem?.location?.block ?? "",
    floor:             caseItem?.location?.floor ?? "",
    flat:              caseItem?.location?.flat ?? "",
    room:              caseItem?.location?.room ?? "",
  });

  // Derived from fields.case_status (local state) so it updates immediately when
  // the stage button is clicked without waiting for the context to re-propagate
  const caseStep = STEP_FROM_STATUS[fields.case_status ?? caseItem?.case_status ?? "New"] ?? 0;

  // Builds the full case payload for saving — reused by both Save and stage advance
  const buildSavePayload = (status) => ({
    ...caseItem,
    caseId:      fields.caseId,
    description: fields.description,
    requester: {
      ...caseItem.requester,
      displayName:    fields.requester,
      email:          fields.requesterEmail,
      clientEmployee: fields.clientEmployee,
      isStudent:      fields.isStudent,
      requesterExist: fields.requesterExist,
      contractType:   fields.contractType,
      site:           fields.site,
    },
    affectedRequester: fields.affectedRequester,
    requestTypes:      fields.requestTypes,
    source:            fields.source,
    case_status:       status,
    priority:          fields.priority,
    ServiceCategory:   fields.ServiceCategory,
    location: {
      ...caseItem.location,
      campus:   fields.campus,
      building: fields.building,
      block:    fields.block,
      floor:    fields.floor,
      flat:     fields.flat,
      room:     fields.room,
    },
  });

  // Save — persists data but keeps the case in its current stage
  const handleSave = () => {
    if (!caseItem) return;
    const errs = {};
    if (!fields.description?.trim())  errs.description     = true;
    if (!fields.priority)             errs.priority        = true;
    if (!fields.ServiceCategory)      errs.serviceCategory = true;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    updateCase(caseItem.id, buildSavePayload(caseItem.case_status));
    showToast("Case saved successfully");
  };

  // Stage advance — saves all current field data then moves to the next stage
  const handleStageChange = (newStep) => {
    if (["Cancelled", "Converted", "Closed"].includes(caseItem?.case_status)) return;
    const newStatus = STATUS_FROM_STEP[newStep] ?? "New";
    updateCase(caseItem.id, buildSavePayload(newStatus));
    setFields((prev) => ({ ...prev, case_status: newStatus }));
    setErrors({});
    showToast("Case saved & stage advanced");
  };

  const [messages, setMessages] = useState(() => caseItem?.messages ?? SAMPLE_MESSAGES);

  // Tab the case page is showing — Summary by default
  const [activeCaseTab, setActiveCaseTab] = useState("Summary");

  // Notes: read from caseItem.woNotes; add via composer at the bottom of the page
  const handleAddNote = useCallback(({ text, internal, mentions }) => {
    if (!caseItem) return;
    const note = {
      id:         Date.now(),
      text,
      internal,
      mentions,
      author:     CURRENT_AGENT,
      authorRole: lookupAuthorRole(CURRENT_AGENT),
      time:       new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    const next = [...(caseItem.woNotes ?? []), note];
    updateCase(caseItem.id, { woNotes: next });
  }, [caseItem, updateCase]);

  // Phone-source call history — each call-back creates a new session.
  // Always seeded with at least one session so the textareas have something
  // concrete to bind to from the very first render.
  const [callSessions, setCallSessions] = useState(() => {
    if (caseItem?.callSessions?.length) return caseItem.callSessions;
    if (caseItem?.callNotes || caseItem?.callTranscription) {
      return [{
        id:            "call-legacy",
        startedAt:     caseItem?.createdAt ?? new Date().toISOString(),
        notes:         caseItem?.callNotes ?? "",
        transcription: caseItem?.callTranscription ?? "",
      }];
    }
    return [{
      id:            `call-${Date.now()}`,
      startedAt:     new Date().toISOString(),
      notes:         "",
      transcription: "",
    }];
  });
  const [workOrder, setWorkOrder] = useState(null);
  const [showWO, setShowWO] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);
  // Becomes true once the user has used the one-shot "Auto-fill with AI"
  // button. After that, only the per-description "Auto-summarise" appears,
  // and only when the user has edited the description away from the AI's
  // last output. Web Portal cases skip the Auto-fill entirely (the portal
  // form already populated every field on submit) and start with this flag
  // pre-set so only the Auto-summarise button is available.
  const isWebPortalCase = caseItem?.source === "Web Portal";
  const [aiFilledOnce,        setAiFilledOnce]        = useState(isWebPortalCase);
  const [aiFilledDescription, setAiFilledDescription] = useState(
    isWebPortalCase ? (caseItem?.description ?? "") : ""
  );
  const [aiSummarising,       setAiSummarising]       = useState(false);
  const [saved, setSaved] = useState(false);
  // Default the source thread closed on small screens so the right pane has
  // the full width; on lg+ keep it open like before.
  const [threadOpen, setThreadOpen] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches
  );
  const [linkedCase, setLinkedCase] = useState(null); // relinked case
  const [errors, setErrors] = useState({});
  const [toast,  setToast]  = useState(null);
  const toastTimerRef = useRef(null);
  // const [leftPct, setLeftPct] = useState(38);
  const [leftPct, setLeftPct] = useState(30);

  const containerRef = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  // ── Field updates ──────────────────────────────────────────────────────────
  const updateField = useCallback((key, val) => {
    setFields((prev) => {
      const next = { ...prev, [key]: val };
      if (["building", "block", "description"].includes(key))
        next.title = buildCaseTitle({ ...next, [key]: val });
      return next;
    });
  }, []);

  // ── Reply ──────────────────────────────────────────────────────────────────
  // Every outbound agent message gets the tracking link + WO reference appended
  // once the case has been converted to a work order. Same footer format used
  // across lifecycle emails so the customer experience stays consistent.
  const handleReply = useCallback(
    (text, meta = {}) => {
      const caseId    = caseItem?.caseId;
      const trackUrl  = buildTrackingLink(caseId);
      const finalText = caseId
        ? `${text}\n\nYou can follow live progress here: ${trackUrl}\n\nCase: ${caseId}`
        : text;
      const newMsg = { from: "agent", text: finalText, time: nowTime(), ...meta };
      setMessages((prev) => {
        const updated = [...prev, newMsg];
        updateCase(caseItem.id, { messages: updated });
        return updated;
      });
    },
    [caseItem?.id, caseItem?.caseId, updateCase]
  );

  // ── Convert ────────────────────────────────────────────────────────────────
  const handleConvert = useCallback(() => {
    setAiLoading(true);
    setTimeout(() => {
      const woCounter = (Number(localStorage.getItem("woCounter")) || 1000) + 1;
      localStorage.setItem("woCounter", woCounter);
      const workOrderNumber = `WO-${woCounter}`;

      // Build the lifecycle message against the case-with-WO so the tracking
      // link can include the new work order number.
      const caseWithWO = { ...caseItem, workOrderNumber };
      const woReply    = buildLifecycleMessage("Converted", caseWithWO);

      const updatedMessages = [...(caseItem?.messages ?? []), woReply];

      updateCase(caseItem.id, {
        workOrderNumber,
        workOrderStatus:    "Dispatched",
        workOrderCreatedAt: new Date().toISOString(),
        case_status:        "Converted",
        messages:           updatedMessages,
      });
      setMessages(updatedMessages);
      setFields((prev) => ({ ...prev, case_status: "Converted" }));
      setAiLoading(false);
    }, 1200);
  }, [caseItem, updateCase]);

  // ── AI auto-fill (email cases) ─────────────────────────────────────────────
  // Disabled once the case reaches a terminal state — updates must then be
  // made through the work order.
  const handleAiFill = useCallback(() => {
    if (["Converted", "Cancelled", "Closed"].includes(caseItem?.case_status)) return;
    setAiFilling(true);
    setTimeout(() => {
      const tenantMsg = (caseItem?.messages ?? []).find((m) => m.from === "tenant");
      const { priority, serviceCategory, description } = analyseEmailText(tenantMsg?.text ?? "");
      const filledDesc = description || "";
      setFields((prev) => ({
        ...prev,
        description:     filledDesc || prev.description,
        ServiceCategory: serviceCategory ?? prev.ServiceCategory,
        priority:        priority       || prev.priority,
      }));
      // Remember the description the AI produced so we can detect edits
      // and offer "Auto-summarise" once the user changes it.
      setAiFilledDescription(filledDesc);
      setAiFilledOnce(true);
      setAiFilling(false);
    }, 1200);
  }, [caseItem?.messages, caseItem?.case_status]);

  // Per-description summariser — cleans up the current description text
  // (greetings / sign-offs / extra whitespace) while keeping every
  // substantive sentence the user wrote, including anything they appended
  // after the initial auto-fill or web-portal submission.
  const handleAiSummarise = useCallback(() => {
    if (["Converted", "Cancelled", "Closed"].includes(caseItem?.case_status)) return;
    const current = fields.description?.trim();
    if (!current) return;
    setAiSummarising(true);
    setTimeout(() => {
      const cleaned = summariseDescription(current) || current;
      setFields((prev) => ({ ...prev, description: cleaned }));
      // Re-baseline so the summarise button only re-appears after the user
      // edits the description again.
      setAiFilledDescription(cleaned);
      setAiSummarising(false);
    }, 900);
  }, [fields.description, caseItem?.case_status]);

  const updateWO = useCallback(
    (k, v) => setWorkOrder((prev) => ({ ...prev, [k]: v })),
    []
  );
  // const handleSave = useCallback(() => {
  //   setSaved(true);
  //   onWorkOrderSave?.(workOrder);
  //   setTimeout(() => setSaved(false), 3000);
  // }, [workOrder, onWorkOrderSave]);

  // ── Relink (local UI state only — actual linking handled inside CaseDetailsPanel) ──
  const handleRelink = useCallback((c) => {
    setLinkedCase(c);
    setShowWO(false);
  }, []);
  const handleUnlink = useCallback(() => {
    setLinkedCase(null);
  }, []);

  // ── Resize ─────────────────────────────────────────────────────────────────
  const handleDrag = useCallback((clientX) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    // setLeftPct(Math.min(65, Math.max(22, ((clientX - left) / width) * 100)));
    setLeftPct(Math.min(33, Math.max(30, ((clientX - left) / width) * 100)));
  }, []);

  // const ch = CHANNEL_CONFIG[fields.channelId] || CHANNEL_CONFIG.portal;

  // Guard: case not yet in context (race on new case creation)
  if (!caseItem) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <CaseTabsHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-white/30">Loading case…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <CaseTabsHeader />
        <div
          ref={containerRef}
          className="case-content flex-1 min-h-0 flex flex-row items-stretch overflow-hidden"
        >
          {/* ── LEFT: Thread panel ── (fixed overlay on mobile, inline on lg+) */}
          {threadOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setThreadOpen(false)} />
              <div className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[420px] bg-obsidianNight shadow-2xl flex flex-col lg:contents">
                {caseItem.source === "Phone" ? (
                  <PhoneSourcePanel
                    caseItem={caseItem}
                    messages={messages}
                    onReply={handleReply}
                    callSessions={callSessions}
                    onCallSessionsChange={(next) => {
                      setCallSessions(next);
                      updateCase(caseItem.id, { callSessions: next });
                    }}
                    onClose={() => setThreadOpen(false)}
                    leftPct={leftPct}
                  />
                ) : caseItem.source === "Web Portal" ? (
                  <WebPortalSourcePanel
                    caseItem={caseItem}
                    messages={messages}
                    onReply={handleReply}
                    onClose={() => setThreadOpen(false)}
                    leftPct={leftPct}
                  />
                ) : (
                  <SourceThreadPanel
                    caseItem={caseItem}
                    messages={messages}
                    onReply={handleReply}
                    onClose={() => setThreadOpen(false)}
                    leftPct={leftPct}
                    woStatus={caseItem?.workOrderStatus}
                  />
                )}
              </div>
              <div className="hidden lg:contents">
                <ResizableDivider onDrag={handleDrag} />
              </div>
            </>
          )}

          {/* ── RIGHT: Case details ── */}
          <div className="h-full flex-1 flex flex-col overflow-hidden relative min-w-0">
            <CaseToolBar
              onSave={handleSave}
              onConvert={handleConvert}
              canConvert={caseStep === 3 && !caseItem.workOrderNumber && !caseItem.workOrderId}
              isConverting={aiLoading}
              threadOpen={threadOpen}
              onToggleThread={() => setThreadOpen((v) => !v)}
              caseId={caseItem.id}
              isConverted={!!caseItem.workOrderNumber}
              pages={[
                { name: "Cases", href: "/admin/cases" },
                { name: caseItem.caseId },
              ]}
            />
            {/* Save toast */}
            {toast && (
              <div
                key={toast.id}
                className="fixed bottom-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl shadow-black/60 pointer-events-none"
                style={{
                  animation: "toast-in-right 0.3s ease forwards",
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(52,211,153,0.35)",
                }}
              >
                <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-xs text-white/85 font-medium whitespace-nowrap">{toast.message}</p>
              </div>
            )}

            {/* Scrollable content — when the source panel is hidden on desktop,
                pad the right pane horizontally so the case content doesn't
                stretch across the full viewport width. */}
            <div
              className={`flex-1 overflow-y-auto py-3 sm:py-4 min-h-0 px-3 sm:px-5 ${
                threadOpen ? "" : "lg:px-16 xl:px-32 2xl:px-48"
              }`}
              style={{ overflowAnchor: "none" }}
            >
              {/* Validation error banner */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25">
                  <span className="size-2 mt-0.5 rounded-full bg-red-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-red-400 font-medium">Please fill in the required fields before saving:</p>
                    <ul className="mt-1 text-xs text-red-400/75 list-disc list-inside space-y-0.5">
                      {errors.description     && <li>Description</li>}
                      {errors.priority        && <li>Priority</li>}
                      {errors.serviceCategory && <li>Service Category</li>}
                    </ul>
                  </div>
                  <button onClick={() => setErrors({})} className="shrink-0 text-red-400/40 hover:text-red-400 transition-colors text-xs">✕</button>
                </div>
              )}
              <CaseDetailsPanel
                caseItem={caseItem}
                Icons={Icons}
                selectCls={selectCls}
                inputCls={inputCls}
                fields={fields}
                setFields={setFields}
                step={caseStep}
                onStepChange={handleStageChange}
                activeTab={activeCaseTab}
                onTabChange={setActiveCaseTab}
                errors={errors}
              />
            </div>

            {/* Note composer pinned to the bottom when the Notes tab is active */}
            {activeCaseTab === "Notes" ? (
              <NoteComposer onAddNote={handleAddNote} />
            ) : null}

            {/* AI auto-fill bar — disabled once the case is locked */}
            {activeCaseTab !== "Notes" && (() => {
              const isLocked  = ["Converted", "Cancelled", "Closed"].includes(caseItem?.case_status);
              const descEmpty = !fields.description?.trim();
              const highlight = descEmpty && !isLocked && !aiFilledOnce;
              // After the one-shot Auto-fill, offer Auto-summarise only when
              // the user has edited the description away from the AI's last
              // output (and there's actually text to summarise).
              const descEdited   = aiFilledOnce
                && !!fields.description?.trim()
                && fields.description.trim() !== aiFilledDescription.trim();
              const showAutoFill   = !aiFilledOnce;
              const showSummarise  = aiFilledOnce && descEdited;
              return (
                <div className={`shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t bg-obsidianSurface ${highlight ? "border-amber-400/40 bg-amber-400/5" : "border-obsidianHighlight"}`}>
                  <p className={`text-[11px] ${isLocked ? "text-white/40" : highlight ? "text-amber-400" : "text-white/55"}`}>
                    {isLocked
                      ? "Case is locked — make updates through the work order"
                      : highlight
                      ? "Description is empty — use Auto-fill to populate it from the email"
                      : showSummarise
                      ? "Description edited — re-summarise with AI to clean it up"
                      : isWebPortalCase
                      ? "Submitted via the web portal — edit the description and use Auto-summarise to tidy it up"
                      : aiFilledOnce
                      ? "AI auto-fill used — edit the description and re-summarise as needed"
                      : "AI reads the email to fill Description, Category & Priority automatically"}
                  </p>

                  {showAutoFill && (
                    <button
                      onClick={handleAiFill}
                      disabled={aiFilling || isLocked}
                      title={isLocked ? "Case is locked — make updates through the work order" : undefined}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-black/30 shrink-0 ${
                        isLocked
                          ? "bg-obsidianHighlight text-white/30 cursor-not-allowed"
                          : aiFilling
                          ? "bg-electricBlue/50 text-white cursor-wait"
                          : highlight
                          ? "bg-amber-500 text-white hover:bg-amber-400 animate-pulse"
                          : "bg-electricBlue text-white hover:bg-electricBlue/85"
                      }`}
                    >
                      <SparklesIcon className="size-4" />
                      {aiFilling ? "Analysing…" : "Auto-fill with AI"}
                    </button>
                  )}

                  {showSummarise && (
                    <button
                      onClick={handleAiSummarise}
                      disabled={aiSummarising || isLocked}
                      title={isLocked ? "Case is locked — make updates through the work order" : undefined}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-black/30 shrink-0 ${
                        isLocked
                          ? "bg-obsidianHighlight text-white/30 cursor-not-allowed"
                          : aiSummarising
                          ? "bg-electricBlue/50 text-white cursor-wait"
                          : "bg-electricBlue text-white hover:bg-electricBlue/85"
                      }`}
                    >
                      <SparklesIcon className="size-4" />
                      {aiSummarising ? "Summarising…" : "Auto-summarise description"}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}

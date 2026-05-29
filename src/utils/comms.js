// ─────────────────────────────────────────────────────────────────────────────
// Communications utilities
//
// Centralises:
//   1. Channel routing — which outgoing channel matches an incoming source
//   2. Tracking link  — public-facing job tracker (Deliveroo/Parcel-style)
//   3. Lifecycle messages — auto-generated copy for Converted / Acknowledged /
//      Completed transitions. The same builders run from both the Case page
//      (Convert) and the WO page (status changes).
// ─────────────────────────────────────────────────────────────────────────────

// Inbound source → outbound channel. Email & WhatsApp are two-way and reply on
// the same channel; Phone and Web Portal are one-shot/inbound-only so we fall
// back to email for the reply.
export function getReplyChannel(source) {
  if (source === "Email")    return "Email";
  if (source === "WhatsApp") return "WhatsApp";
  return "Email"; // Phone, Web Portal, or anything unrecognised
}

// Customer-facing tracker URL — keyed off the **case number** so customers
// only ever see the identifier they recognise. Builds against the live origin
// + Vite base path + HashRouter route, so it resolves correctly in dev
// (http://localhost:5173/#/track-case/CASE-X) and on GitHub Pages
// (https://seunafa.github.io/maintenance_crm_app/#/track-case/CASE-X).
export function buildTrackingLink(caseId) {
  if (!caseId) return null;
  const basePath = import.meta.env.BASE_URL ?? "/"; // "/maintenance_crm_app/" in prod, "/" in dev
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://seunafa.github.io";
  return `${origin}${basePath}#/track-case/${encodeURIComponent(caseId)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function nowISO() {
  return new Date().toISOString();
}

// Auto-acknowledgement message — fired the moment a request lands via any
// source panel channel (Email / WhatsApp / Web Portal / Phone). This is the
// single email a "New"-status case shows in its thread.
export function buildAcknowledgementMessage(caseItem) {
  const caseId   = caseItem?.caseId ?? "—";
  const name     = caseItem?.requester?.displayName ?? "Resident";
  const firstNm  = name.split(" ")[0];
  const trackUrl = buildTrackingLink(caseItem?.caseId);
  const channel  = getReplyChannel(caseItem?.source);
  const trackLine = trackUrl
    ? `You can follow live progress here: ${trackUrl}`
    : "";

  return {
    id:      Date.now(),
    from:    "agent",
    channel,
    subject: `Your request ${caseId} — received`,
    text:
      `Dear ${firstNm},\n\n` +
      `Thank you for getting in touch with us. We are currently reviewing your case (${caseId}) to arrange for the work to be carried out.\n\n` +
      (trackLine ? `${trackLine}\n\n` : "") +
      `Please quote your case reference in any future correspondence.\n\n` +
      `Case: ${caseId}\n\n` +
      `Kind regards,\nFacility Support Team`,
    time:    nowTime(),
    date:    nowISO(),
    auto:    true, // marker for "automatic acknowledgement"
  };
}

// Build the agent-side message object for a lifecycle event. Returns a message
// shape compatible with the existing `messages` array on a case.
//
// Customer-facing copy references the **case number** only — work-order
// numbers are an internal routing detail and never appear in outbound text.
//
// `event` is one of: "Converted" | "Acknowledged" | "Completed"
export function buildLifecycleMessage(event, caseItem, engineer = null) {
  const caseId   = caseItem?.caseId ?? "—";
  const title    = caseItem?.title || "your maintenance request";
  const name     = caseItem?.requester?.displayName ?? "Resident";
  const firstNm  = name.split(" ")[0];
  const trackUrl = buildTrackingLink(caseItem?.caseId);
  const engName  = engineer?.displayName ?? "our maintenance team";
  const channel  = getReplyChannel(caseItem?.source);

  const trackLine = trackUrl
    ? `You can follow live progress here: ${trackUrl}`
    : "";

  const base = {
    id:      Date.now(),
    from:    "agent",
    time:    nowTime(),
    date:    nowISO(),
    channel, // "Email" or "WhatsApp" — drives how it renders in the thread
  };

  if (event === "Converted") {
    return {
      ...base,
      subject: `Your request ${caseId} — work scheduled`,
      text:
        `Dear ${firstNm},\n\n` +
        `Thank you for getting in touch with us. We have reviewed your case (${caseId}) and arranged for the work to be carried out.\n\n` +
        (trackLine ? `${trackLine}\n\n` : "") +
        `Please quote your case reference in any future correspondence.\n\n` +
        `Case: ${caseId}\n\n` +
        `Kind regards,\nFacility Support Team`,
    };
  }

  if (event === "Acknowledged") {
    return {
      ...base,
      subject: `Update on ${caseId} — Engineer Assigned`,
      text:
        `Dear ${firstNm},\n\n` +
        `An engineer has been assigned to ${title}. ${engineer ? `${engName} will be carrying out the work.` : "Our maintenance team will be carrying out the work."}\n\n` +
        (trackLine ? `${trackLine}\n\n` : "") +
        `Case: ${caseId}\n\n` +
        `Kind regards,\nFacility Support Team`,
    };
  }

  if (event === "Completed") {
    return {
      ...base,
      subject: `Update on ${caseId} — Completed`,
      text:
        `Dear ${firstNm},\n\n` +
        `We are pleased to confirm that the work for ${title} has been completed.\n\n` +
        (trackLine ? `${trackLine}\n\n` : "") +
        `If you experience any further issues, please do not hesitate to contact us.\n\n` +
        `Case: ${caseId}\n\n` +
        `Kind regards,\nFacility Support Team`,
    };
  }

  return null;
}

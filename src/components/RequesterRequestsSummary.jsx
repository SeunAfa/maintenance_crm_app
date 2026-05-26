import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";
import { USERS_DATA } from "../data/usersData";
import RecentRequestsTable from "./RecentRequestsTable";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-white/30 shrink-0" />
      <span className="text-xs text-white/60 truncate">{value ?? "—"}</span>
    </div>
  );
}

export default function RequesterRequestsSummary({ caseItem, className = "" }) {
  const { cases } = useCases();

  const r = caseItem?.affectedRequester ?? {};
  const displayName = r.displayName ?? "—";
  const role = r.userRoles ?? r.role ?? "—";
  const site = r.site ?? "—";

  // Fall back to USERS_DATA lookup if email/phone absent from stored case
  const userRecord = USERS_DATA.find((u) => u.displayName === displayName);
  const email = r.email ?? userRecord?.email ?? null;
  const phone = r.phone ?? userRecord?.phone ?? null;

  // All cases linked to this requester, excluding the current one
  const requesterCases = cases.filter(
    (c) =>
      c.id !== caseItem?.id &&
      (c.requester?.displayName === displayName ||
        c.affectedRequester?.displayName === displayName)
  );

  return (
    <div
      className={`w-full px-4 py-3 rounded-lg bg-obsidianNight/40 flex flex-col gap-3 ${className}`}
    >
      {/* Header */}
      <h2 className="text-sm font-semibold text-white text-left">Affected Requester</h2>

      {/* Profile */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-electricBlue flex items-center justify-center shrink-0 text-sm font-bold text-white">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate text-left">
            {displayName}
          </p>
          <p className="text-[11px] text-white/40 truncate">
            {role} · {site}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-md bg-obsidianElevated border border-obsidianHighlight">
        <InfoRow icon={EnvelopeIcon} value={email} />
        <InfoRow icon={PhoneIcon} value={phone} />
      </div>

      {/* Divider */}
      <div className="border-t border-obsidianHighlight" />

      {/* Recent requests table — real data */}
      <RecentRequestsTable cases={requesterCases} />
    </div>
  );
}

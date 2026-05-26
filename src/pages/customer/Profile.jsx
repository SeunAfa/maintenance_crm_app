import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCircleIcon,
  MapPinIcon,
  LockClosedIcon,
  BellIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCurrentCustomer } from "./CustomerLayout";
import { useCases } from "../../context/CasesContext";
import { useUsers } from "../../context/UsersContext";
import InputField from "../../components/InputField";
import Dropdowns from "../../components/Dropdowns";
import { customerCaseStatus } from "../../utils/customerStatus";

const dropCls = "bg-white/5 outline-white/10 px-3 py-1";

const LANGUAGES = ["English (UK)", "English (US)", "French", "German"];
const TIMEZONES = ["Europe/London (GMT+0)", "Europe/Paris (GMT+1)", "America/New_York (EST)"];

const NOTIFS = [
  { key: "caseUpdates",  label: "Case updates",          desc: "Get notified when there's an update on any of your cases", default: true  },
  { key: "engineerEta",  label: "Engineer arrival",      desc: "Notify me before an engineer arrives",                     default: true  },
  { key: "completion",   label: "Job completion",        desc: "Email me when work has been completed",                    default: true  },
  { key: "marketing",    label: "Service announcements", desc: "Occasional updates from the maintenance team",             default: false },
];

const STATUS_TONE = {
  "New":          "bg-slate-400/10 text-slate-300",
  "In Review":    "bg-sky-400/10 text-sky-300",
  "Qualify":      "bg-amber-400/10 text-amber-300",
  "Action":       "bg-orange-400/10 text-orange-300",
  "Converted":    "bg-violet-400/10 text-violet-300",
  "Closed":       "bg-white/5 text-white/40",
  "Cancelled":    "bg-red-400/10 text-red-300",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(u) {
  return ((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase() ||
    (u.displayName ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Read primitives ─────────────────────────────────────────────────────────
function ReadField({ label, value, hint }) {
  return (
    <div>
      <label className="flex gap-1 items-center text-left text-sm/6 font-light text-white mb-0.5">{label}</label>
      <div className="block w-full rounded-md bg-white/5 px-3 py-1 text-sm text-white/70 outline-1 -outline-offset-1 outline-white/10 min-h-[30px]">
        {value || <span className="text-white/25">—</span>}
      </div>
      {hint && <p className="text-[11px] text-white/30 mt-1">{hint}</p>}
    </div>
  );
}

function ReadDropdown({ label, value }) {
  return (
    <div>
      <label className="flex gap-1 items-center text-left text-sm/6 font-light text-white mb-0.5">{label}</label>
      <div className="mt-0.5 flex w-full justify-between items-center rounded-md bg-white/5 px-3 py-1 text-sm outline-1 -outline-offset-1 outline-white/10">
        <span className={value ? "text-white/70" : "text-white/25"}>{value || "—"}</span>
      </div>
    </div>
  );
}

function ReadToggle({ label, desc, checked }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-obsidianHighlight last:border-0 last:pb-0">
      <div>
        <p className="text-xs font-medium text-white/70">{label}</p>
        {desc && <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>}
      </div>
      <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent ${checked ? "bg-electricBlue" : "bg-white/15"}`}>
        <span className={`inline-block size-4 transform rounded-full bg-white shadow-sm ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </div>
  );
}

// ─── Edit-mode toggle ────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-obsidianHighlight last:border-0 last:pb-0">
      <div>
        <p className="text-xs font-medium text-white/70">{label}</p>
        {desc && <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? "bg-electricBlue" : "bg-white/15"}`}
      >
        <span className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ─── Card & FieldRow ─────────────────────────────────────────────────────────
function Card({ icon: Icon, title, tag, children }) {
  return (
    <div className="rounded-xl border border-obsidianHighlight bg-obsidianNight/40 mb-4 last:mb-0">
      <div className="flex items-center justify-between px-5 py-3 border-b border-obsidianHighlight bg-obsidianNight/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-white/30 shrink-0" />
          <p className="text-xs font-semibold text-white/70">{title}</p>
        </div>
        {tag && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-electricBlue/10 text-electricBlue border border-electricBlue/20">
            {tag}
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">{children}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const customer = useCurrentCustomer();
  const { cases } = useCases();
  const { updateUser } = useUsers();

  // Edit-mode state
  const [editing,     setEditing]     = useState(false);
  const [draft,       setDraft]       = useState(null);
  const [draftNotifs, setDraftNotifs] = useState({});
  const [savedToast,  setSavedToast]  = useState(false);

  // Cases sidebar state
  const [caseQuery, setCaseQuery] = useState("");

  const ini    = initials(customer);
  const notifs = customer.notifications ?? {};
  const activeNotifs = editing ? draftNotifs : notifs;

  const userCases = useMemo(
    () => cases
      .filter((c) => c.requester?.displayName === customer.displayName)
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt)),
    [cases, customer.displayName]
  );

  const filteredCases = useMemo(() => {
    if (!caseQuery.trim()) return userCases;
    const q = caseQuery.toLowerCase();
    return userCases.filter((c) =>
      (c.caseId      ?? "").toLowerCase().includes(q) ||
      (c.title       ?? "").toLowerCase().includes(q) ||
      (c.case_status ?? "").toLowerCase().includes(q)
    );
  }, [userCases, caseQuery]);

  // ── Edit actions ──────────────────────────────────────────────────────────
  const startEdit = () => {
    setDraft({
      firstName:   customer.firstName   ?? "",
      lastName:    customer.lastName    ?? "",
      displayName: customer.displayName ?? "",
      phone:       customer.phone       ?? "",
      language:    customer.language    ?? "English (UK)",
      timezone:    customer.timezone    ?? "Europe/London (GMT+0)",
      require2fa:  !!customer.require2fa,
      loginAlerts: customer.loginAlerts ?? true,
    });
    setDraftNotifs({ ...Object.fromEntries(NOTIFS.map((n) => [n.key, n.default])), ...notifs });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    const displayName = draft.displayName?.trim() || `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim();
    updateUser(customer.id, {
      firstName:    draft.firstName,
      lastName:     draft.lastName,
      displayName,
      phone:        draft.phone,
      language:     draft.language,
      timezone:     draft.timezone,
      require2fa:   draft.require2fa,
      loginAlerts:  draft.loginAlerts,
      notifications: draftNotifs,
    });
    setEditing(false);
    setDraft(null);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const setInput = (key) => (e) => {
    const val = e.target.value;
    setDraft((p) => {
      const next = { ...p, [key]: val };
      if (key === "firstName" || key === "lastName") {
        const first = key === "firstName" ? val : p.firstName;
        const last  = key === "lastName"  ? val : p.lastName;
        if (!p.displayName || p.displayName === `${p.firstName} ${p.lastName}`.trim()) {
          next.displayName = `${first} ${last}`.trim();
        }
      }
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col lg:h-full">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 border-b border-obsidianHighlight bg-obsidianNight/40 -mx-3 -mt-4 sm:-mx-4 sm:-mt-5 lg:-mx-6 lg:-mt-6 mb-5">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {editing ? (draft?.displayName || customer.displayName) : customer.displayName}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5 leading-none">
              {editing ? "Editing your profile" : "Your profile"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedToast && (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mr-2">
              <CheckIcon className="size-3.5" strokeWidth={2.5} />
              Saved
            </span>
          )}
          {editing ? (
            <>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-obsidianHighlight text-xs text-white/50 hover:bg-obsidianHighlight transition-colors cursor-pointer"
              >
                <XMarkIcon className="size-3.5" />
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-electricBlue hover:bg-electricBlue/85 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <CheckIcon className="size-3.5" strokeWidth={2.5} />
                Save changes
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-obsidianHighlight text-xs text-white/50 hover:bg-obsidianHighlight transition-colors cursor-pointer"
            >
              <PencilSquareIcon className="size-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Body — let CustomerLayout's main scroll on mobile; inner scroll only on lg+ */}
      <div className="flex-1 lg:overflow-y-auto lg:min-h-0">
        <div className="grid gap-5 grid-cols-1 lg:[grid-template-columns:3fr_2fr] items-start">

          {/* ── LEFT ── */}
          <div>
            {/* Personal information */}
            <Card icon={UserCircleIcon} title="Personal information">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-obsidianHighlight">
                <div className="size-16 rounded-full bg-electricBlue/20 text-electricBlue flex items-center justify-center text-xl font-bold shrink-0">
                  {ini}
                </div>
                <div>
                  <p className="text-xs text-white/60 font-medium">Profile photo</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{editing ? (draft?.displayName || customer.displayName) : customer.displayName}</p>
                </div>
              </div>

              <FieldRow>
                {editing ? (
                  <>
                    <InputField id="firstName" label="First name"  value={draft.firstName} onChange={setInput("firstName")} isRequired placeholder="First name" />
                    <InputField id="lastName"  label="Last name"   value={draft.lastName}  onChange={setInput("lastName")}  isRequired placeholder="Last name" />
                  </>
                ) : (
                  <>
                    <ReadField label="First name" value={customer.firstName} />
                    <ReadField label="Last name"  value={customer.lastName} />
                  </>
                )}
              </FieldRow>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {editing ? (
                  <>
                    <div>
                      <InputField id="displayName" label="Display name" value={draft.displayName} onChange={setInput("displayName")} placeholder="Display name" />
                      <p className="text-[11px] text-white/30 mt-1">Auto-filled from first and last name</p>
                    </div>
                    <ReadField label="Email address" value={customer.email} hint="Email is your login — contact your administrator to change it" />
                  </>
                ) : (
                  <>
                    <ReadField label="Display name"   value={customer.displayName} hint="The name shown on cases you raise" />
                    <ReadField label="Email address"  value={customer.email}       hint="Where we send updates about your cases" />
                  </>
                )}
              </div>

              <FieldRow>
                {editing ? (
                  <InputField id="phone" label="Phone number" value={draft.phone} onChange={setInput("phone")} placeholder="+44 7700 000000" />
                ) : (
                  <ReadField label="Phone number" value={customer.phone} />
                )}
                <ReadDropdown label="Status" value={customer.isStudent ? "Student" : (customer.clientEmployee ? "Staff" : "Resident")} />
              </FieldRow>

              <FieldRow>
                <ReadDropdown label="Site"     value={customer.site} />
                <ReadDropdown label="Contract" value={customer.contractType} />
              </FieldRow>
            </Card>

            {/* Residence (always read-only — managed by site admin) */}
            <Card icon={MapPinIcon} title="Residence" tag="Managed by admin">
              <FieldRow>
                <ReadDropdown label="Campus"   value={customer.campus ?? "North Campus"} />
                <ReadDropdown label="Building" value={customer.building} />
              </FieldRow>
              <FieldRow>
                <ReadDropdown label="Block" value={customer.block ? `Block ${customer.block}` : null} />
                <ReadDropdown label="Floor" value={customer.floor} />
              </FieldRow>
              <FieldRow>
                <ReadDropdown label="Flat" value={customer.flat} />
                <ReadDropdown label="Room" value={customer.room} />
              </FieldRow>
              <p className="text-[11px] text-white/30 mt-1">
                Need to update your residence? Contact your site administrator.
              </p>
            </Card>

            {/* Account & access */}
            <Card icon={LockClosedIcon} title="Account & access">
              <FieldRow>
                {editing ? (
                  <>
                    <Dropdowns optionList={LANGUAGES} defaultValue={draft.language} label="Language" optionPlaceholder="Select language" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, language: v }))} />
                    <Dropdowns optionList={TIMEZONES} defaultValue={draft.timezone} label="Timezone" optionPlaceholder="Select timezone" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, timezone: v }))} />
                  </>
                ) : (
                  <>
                    <ReadDropdown label="Language" value={customer.language ?? "English (UK)"} />
                    <ReadDropdown label="Timezone" value={customer.timezone ?? "Europe/London (GMT+0)"} />
                  </>
                )}
              </FieldRow>

              <div className="flex flex-col gap-0 pt-3 border-t border-obsidianHighlight">
                {editing ? (
                  <>
                    <Toggle
                      label="Two-factor authentication"
                      desc="Add an extra layer of security to your account"
                      checked={draft.require2fa}
                      onChange={(v) => setDraft((p) => ({ ...p, require2fa: v }))}
                    />
                    <Toggle
                      label="Email login alerts"
                      desc="Get an email when your account is signed in from a new device"
                      checked={draft.loginAlerts}
                      onChange={(v) => setDraft((p) => ({ ...p, loginAlerts: v }))}
                    />
                  </>
                ) : (
                  <>
                    <ReadToggle
                      label="Two-factor authentication"
                      desc="Add an extra layer of security to your account"
                      checked={!!customer.require2fa}
                    />
                    <ReadToggle
                      label="Email login alerts"
                      desc="Get an email when your account is signed in from a new device"
                      checked={!!(customer.loginAlerts ?? true)}
                    />
                  </>
                )}
              </div>
            </Card>

            {/* Notification preferences */}
            <Card icon={BellIcon} title="Notification preferences">
              {NOTIFS.map((n) => (
                editing ? (
                  <Toggle
                    key={n.key}
                    label={n.label}
                    desc={n.desc}
                    checked={activeNotifs[n.key] ?? n.default}
                    onChange={(v) => setDraftNotifs((p) => ({ ...p, [n.key]: v }))}
                  />
                ) : (
                  <ReadToggle
                    key={n.key}
                    label={n.label}
                    desc={n.desc}
                    checked={activeNotifs[n.key] ?? n.default}
                  />
                )
              ))}
            </Card>
          </div>

          {/* ── RIGHT ── */}
          <div>
            {/* Recent requests */}
            <div className="rounded-xl border border-obsidianHighlight bg-obsidianNight/40 mb-4">
              <div className="flex items-center justify-between px-5 py-3 border-b border-obsidianHighlight bg-obsidianNight/60 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="size-4 text-white/30 shrink-0" />
                  <p className="text-xs font-semibold text-white/70">Recent cases</p>
                  <span className="text-[10px] text-white/30">{filteredCases.length} of {userCases.length}</span>
                </div>
                <Link
                  to="/customer/cases/new"
                  className="flex items-center gap-1 h-6 px-2.5 rounded-md bg-electricBlue hover:bg-electricBlue/85 text-white text-[11px] font-semibold transition-colors"
                >
                  New case
                </Link>
              </div>

              <div className="px-5 pt-3 pb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-obsidianHighlight focus-within:border-electricBlue/40 transition-colors">
                  <MagnifyingGlassIcon className="size-3.5 text-white/25 shrink-0" />
                  <input
                    value={caseQuery}
                    onChange={(e) => setCaseQuery(e.target.value)}
                    placeholder="Search by ID, title or status…"
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
                  />
                  {caseQuery && (
                    <button onClick={() => setCaseQuery("")} className="text-white/25 hover:text-white/60 text-[10px]">✕</button>
                  )}
                </div>
              </div>

              <div className="px-3 pb-3 flex flex-col gap-1.5">
                {filteredCases.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <BriefcaseIcon className="size-6 text-white/10 mx-auto mb-1.5" />
                    <p className="text-[11px] text-white/35">No cases match your search</p>
                  </div>
                ) : filteredCases.slice(0, 8).map((c) => {
                  const cust = customerCaseStatus(c);
                  return (
                    <Link
                      key={c.id}
                      to={`/customer/cases/${c.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="size-8 rounded-lg bg-electricBlue/10 flex items-center justify-center shrink-0">
                        <BriefcaseIcon className="size-3.5 text-electricBlue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{c.title || c.caseId}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-electricBlue">{c.caseId}</span>
                          <span className="size-0.5 rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/35">{fmtDate(c.updatedAt ?? c.createdAt)}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cust.tone}`}>
                        {cust.label}
                      </span>
                      <ArrowRightIcon className="size-3.5 text-white/15 group-hover:text-white/60 transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {filteredCases.length > 8 && (
                <div className="px-5 py-2.5 border-t border-obsidianHighlight text-center">
                  <Link to="/customer/cases" className="text-[11px] text-electricBlue hover:text-electricBlue/80 font-medium">
                    View all {userCases.length} cases →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

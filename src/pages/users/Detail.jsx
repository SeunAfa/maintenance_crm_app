import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BellIcon, ShieldCheckIcon, LockClosedIcon,
  MapPinIcon, UserCircleIcon, CameraIcon, BriefcaseIcon,
  TicketIcon, SignalIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon,
  PencilSquareIcon, CheckIcon, PlusIcon, MagnifyingGlassIcon,
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUsers } from "../../context/UsersContext";
import { useCases } from "../../context/CasesContext";
import RecentRequestsTable from "../../components/RecentRequestsTable";
import InputField from "../../components/InputField";
import Dropdowns from "../../components/Dropdowns";
import BackButton from "../../components/BackButton";
import {
  CONTRACT_TYPES, SITES, userRoles as USER_ROLE_LIST,
  CAMPUSES, CAMPUS_BUILDINGS, BLOCKS, FLOORS, FLATS, ROOMS,
} from "../../utils/constants";

// ── Shared config ─────────────────────────────────────────────────────────────

const BUILDINGS_FLAT = CAMPUS_BUILDINGS.flatMap((c) => c.building);
const dropCls = "bg-white/5 outline-white/10 px-3 py-1";

const ROLE_DESCS = {
  Student:           "Enrolled student with basic access",
  "Client Employee": "Client staff member, site access",
  Contractor:        "External contractor, limited access",
  Visitor:           "Temporary read-only visitor",
  OurEmployee:       "Internal staff, full module access",
};
const USER_ROLES = USER_ROLE_LIST.map((v) => ({
  value: v,
  label: v === "OurEmployee" ? "Our Employee" : v,
  desc:  ROLE_DESCS[v] ?? "",
}));

const MODULE_PERMS = [
  { key: "cases",      label: "Cases",       icon: BriefcaseIcon, default: true  },
  { key: "workOrders", label: "Work Orders", icon: TicketIcon,    default: true  },
  { key: "bmsAlerts",  label: "BMS Alerts",  icon: SignalIcon,    default: false },
  { key: "reports",    label: "Reports",     icon: ChartBarIcon,  default: true  },
  { key: "users",      label: "Users",       icon: UsersIcon,     default: false },
  { key: "settings",   label: "Settings",    icon: Cog6ToothIcon, default: false },
];

const NOTIFS = [
  { key: "cases",      label: "Case updates",          desc: "Notify when a case is assigned or updated", default: true  },
  { key: "workOrders", label: "Work order assignments", desc: "Notify when a work order is assigned",      default: true  },
  { key: "siteAlerts", label: "Site alerts",            desc: "Receive alerts for assigned sites",         default: false },
  { key: "reports",    label: "Report summaries",       desc: "Weekly email digest of activity reports",   default: false },
];

const CLIENT_EMP_TITLES = [
  "Facilities Manager","Building Manager","Site Manager","Office Manager",
  "Receptionist","Security Officer","Soft Technician","Hard Technician","Caretaker","Cleaning Supervisor",
];
const OUR_EMP_TITLES = [
  "Account Manager","Field Engineer","Senior Engineer","Supervisor",
  "Operations Manager","Help Desk Agent","Administrator","Director",
];
const CONTRACTOR_TITLES = [
  "Electrician","Plumber","HVAC Technician","Painter","Carpenter",
  "General Contractor","Roofer","Flooring Specialist","Fire Safety Engineer","IT Contractor",
  "Lift Engineer","Pest Technician",
];

const SITE_COLORS   = ["bg-emerald-400","bg-electricBlue","bg-amber-400","bg-violet-400","bg-rose-400","bg-blue-400","bg-teal-400","bg-pink-400","bg-orange-400"];
const STATUS_OPTIONS = [
  { value: "active",   label: "Active",   cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"    },
  { value: "inactive", label: "Inactive", cls: "border-amber-400/40   bg-amber-400/10   text-amber-400"      },
  { value: "pending",  label: "Pending",  cls: "border-electricBlue/40 bg-electricBlue/10 text-electricBlue" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function avatarColor(id) {
  const p = [
    "bg-electricBlue/20 text-electricBlue",
    "bg-violet-400/20 text-violet-300",
    "bg-emerald-400/20 text-emerald-300",
    "bg-amber-400/20 text-amber-300",
    "bg-rose-400/20 text-rose-300",
  ];
  return p[(id ?? 0) % p.length];
}

function initials(u) {
  return ((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase() ||
    (u.displayName ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function parseSites(siteStr) {
  const arr = (siteStr ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return Object.fromEntries(SITES.map((s) => [s, arr.includes(s)]));
}

// ── Read-only primitives ──────────────────────────────────────────────────────

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

// ── Editable Toggle ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? "bg-electricBlue" : "bg-white/15"}`}
    >
      <span className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

// ── Shared layout ─────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserDetail() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { users, updateUser } = useUsers();
  const { cases }           = useCases();

  const user = users.find((u) => String(u.id) === String(id));

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editing,      setEditing]      = useState(false);
  const [draft,        setDraft]        = useState(null);
  const [draftRole,    setDraftRole]    = useState("");
  const [draftPerms,   setDraftPerms]   = useState({});
  const [draftNotifs,  setDraftNotifs]  = useState({});
  const [draftSites,   setDraftSites]   = useState({});
  const [draftStatus,  setDraftStatus]  = useState("active");

  // ── Case state ──────────────────────────────────────────────────────────────
  const [caseQuery, setCaseQuery] = useState("");
  const [casePage,  setCasePage]  = useState(1);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/30 text-sm">User not found.</p>
      </div>
    );
  }

  // ── Derived (read mode) ──────────────────────────────────────────────────────
  const perms      = user.permissions   ?? {};
  const notifs     = user.notifications ?? {};
  const status     = user.accountStatus ?? "active";

  const role        = editing ? draftRole    : (user.userRole ?? "");
  const activePerms = editing ? draftPerms   : perms;
  const activeNotifs= editing ? draftNotifs  : notifs;
  const activeStatus= editing ? draftStatus  : status;

  const isClientEmp  = role === "Client Employee";
  const isOurEmp     = role === "OurEmployee";
  const isStudent    = role === "Student";
  const isContractor = role === "Contractor";
  const isVisitor    = role === "Visitor";
  const showJobTitle = isClientEmp || isOurEmp || isContractor;
  const jobTitleList = isClientEmp ? CLIENT_EMP_TITLES : isOurEmp ? OUR_EMP_TITLES : isContractor ? CONTRACTOR_TITLES : null;

  // Customer-facing roles (Student, Client Employee) only ever see the Cases
  // module — they raise and track their own cases, nothing else. Visitor
  // retains read-only Work Orders access.
  const isCustomerRole = isStudent || isClientEmp;
  const visiblePerms = isCustomerRole
    ? MODULE_PERMS.filter((m) => m.key === "cases")
    : isVisitor
      ? MODULE_PERMS.filter((m) => m.key === "workOrders")
      : MODULE_PERMS;

  const ini = initials(user);
  const av  = avatarColor(user.id);

  // ── Edit actions ─────────────────────────────────────────────────────────────
  const startEdit = () => {
    setDraft({
      firstName:    user.firstName    ?? "",
      lastName:     user.lastName     ?? "",
      displayName:  user.displayName  ?? "",
      email:        user.email        ?? "",
      phone:        user.phone        ?? "",
      employeeId:   user.employeeId   ?? "",
      jobTitle:     user.jobTitle     ?? "",
      contractType: user.contractType ?? "",
      notes:        user.notes        ?? "",
      language:     user.language     ?? "English (UK)",
      timezone:     user.timezone     ?? "Europe/London (GMT+0)",
      campus:       user.campus       ?? "",
      building:     user.building     ?? "",
      block:        user.block        ?? "",
      floor:        user.floor        ?? "",
      flat:         user.flat         ?? "",
      room:         user.room         ?? "",
      sendWelcome:  user.sendWelcome  ?? false,
      require2fa:   user.require2fa   ?? false,
    });
    setDraftRole(user.userRole ?? "");
    setDraftPerms({ ...Object.fromEntries(MODULE_PERMS.map((m) => [m.key, m.default])), ...perms });
    setDraftNotifs({ ...Object.fromEntries(NOTIFS.map((n) => [n.key, n.default])), ...notifs });
    setDraftSites(parseSites(user.site));
    setDraftStatus(status);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    updateUser(user.id, {
      ...draft,
      displayName:   draft.displayName || `${draft.firstName.trim()} ${draft.lastName.trim()}`,
      userRole:      draftRole,
      isStudent:     draftRole === "Student",
      clientEmployee: draftRole === "Client Employee",
      permissions:   draftPerms,
      notifications: draftNotifs,
      site:          Object.entries(draftSites).filter(([,v]) => v).map(([k]) => k).join(", "),
      accountStatus: draftStatus,
    });
    setEditing(false);
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

  const handleRoleClick = (r) => {
    setDraftRole(r.value);
    let defaults;
    // Customer-facing roles → Cases only. Everything else off.
    if (r.value === "Student" || r.value === "Client Employee") {
      defaults = Object.fromEntries(MODULE_PERMS.map((m) => [m.key, m.key === "cases"]));
    } else {
      defaults = Object.fromEntries(MODULE_PERMS.map((m) => [m.key, m.default]));
      if (r.value === "Contractor") defaults.reports = false;
    }
    setDraftPerms(defaults);
  };

  // ── Cases ─────────────────────────────────────────────────────────────────────
  const userCases = cases.filter(
    (c) =>
      c.requester?.displayName === user.displayName ||
      c.requester?.email       === user.email       ||
      c.requester?.phone       === user.phone       ||
      c.affectedRequester?.displayName === user.displayName
  );

  const CASES_PER_PAGE = 5;

  const filteredCases = useMemo(() => {
    if (!caseQuery.trim()) return userCases;
    const q = caseQuery.toLowerCase();
    return userCases.filter((c) =>
      (c.caseId      ?? "").toLowerCase().includes(q) ||
      (c.title       ?? "").toLowerCase().includes(q) ||
      (c.case_status ?? "").toLowerCase().includes(q)
    );
  }, [userCases, caseQuery]);

  const totalCasePages = Math.max(1, Math.ceil(filteredCases.length / CASES_PER_PAGE));
  const pagedCases     = filteredCases.slice((casePage - 1) * CASES_PER_PAGE, casePage * CASES_PER_PAGE);

  const handleNewCase = () => {
    const DRAFT_TABS_KEY    = "draftTabs";
    const DRAFT_COUNTER_KEY = "draftCounter";
    const counter = (Number(localStorage.getItem(DRAFT_COUNTER_KEY)) || 0) + 1;
    localStorage.setItem(DRAFT_COUNTER_KEY, counter);
    const existing = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_TABS_KEY)) ?? []; } catch { return []; } })();
    const used = new Set(existing.map((d) => { const m = d.label.match(/^Untitled (\d+)$/); return m ? Number(m[1]) : null; }).filter((n) => n !== null));
    let n = 1; while (used.has(n)) n++;
    localStorage.setItem(DRAFT_TABS_KEY, JSON.stringify([...existing, { id: counter, label: `Untitled ${n}` }]));
    sessionStorage.setItem("prefillRequester", JSON.stringify(user));
    navigate(`/admin/cases/create?d=${counter}&s=existing`);
    window.dispatchEvent(new CustomEvent("call:start", { detail: { autoAnswer: true, scenario: "existing", caller: user } }));
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-2.5 border-b border-obsidianHighlight bg-obsidianNight/40">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate("/admin/users")} />
          <div className="w-px h-4 bg-obsidianHighlight" />
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {editing ? (draft?.displayName || user.displayName) : user.displayName}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5 leading-none">
              {editing ? "Editing user profile" : "View user profile"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-obsidianHighlight text-xs text-white/50 hover:bg-obsidianHighlight transition-colors"
              >
                <XMarkIcon className="size-3.5" />
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-electricBlue hover:bg-electricBlue/85 active:scale-95 text-white text-xs font-semibold transition-all"
              >
                <CheckIcon className="size-3.5" strokeWidth={2.5} />
                Save changes
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-obsidianHighlight text-xs text-white/50 hover:bg-obsidianHighlight transition-colors"
            >
              <PencilSquareIcon className="size-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-6 py-5">
          <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr", alignItems: "start" }}>

            {/* ── LEFT ── */}
            <div>

              {/* Personal information */}
              <Card icon={UserCircleIcon} title="Personal information">
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-obsidianHighlight">
                  <div className={`size-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${av}`}>
                    {ini}
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium">Profile photo</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{user.displayName}</p>
                    {editing && (
                      <div className="flex items-center gap-2 mt-2">
                        <button type="button" className="h-6 px-2.5 rounded-md border border-obsidianHighlight text-[11px] text-white/50 hover:bg-obsidianHighlight transition-colors">Upload</button>
                        <button type="button" className="h-6 px-2.5 rounded-md text-[11px] text-white/30 hover:text-white/50 transition-colors">Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                <FieldRow>
                  {editing ? (
                    <>
                      <InputField id="firstName" label="First name"  value={draft.firstName} onChange={setInput("firstName")} isRequired placeholder="Sarah" />
                      <InputField id="lastName"  label="Last name"   value={draft.lastName}  onChange={setInput("lastName")}  isRequired placeholder="Mitchell" />
                    </>
                  ) : (
                    <>
                      <ReadField label="First name" value={user.firstName} />
                      <ReadField label="Last name"  value={user.lastName} />
                    </>
                  )}
                </FieldRow>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {editing ? (
                    <>
                      <div>
                        <InputField id="displayName" label="Display name" value={draft.displayName} onChange={setInput("displayName")} placeholder="Sarah Mitchell" />
                        <p className="text-[11px] text-white/30 mt-1">Auto-filled from first and last name</p>
                      </div>
                      <div>
                        <InputField id="email" label="Work email address" type="email" value={draft.email} onChange={setInput("email")} isRequired placeholder="sarah.mitchell@company.com" />
                        <p className="text-[11px] text-white/30 mt-1">Login credentials will be sent to this address</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ReadField label="Display name"        value={user.displayName} hint="Auto-filled from first and last name" />
                      <ReadField label="Work email address"  value={user.email}       hint="Login credentials will be sent to this address" />
                    </>
                  )}
                </div>

                <FieldRow>
                  {editing ? (
                    <>
                      <InputField id="phone"      label="Phone number" value={draft.phone}      onChange={setInput("phone")}      placeholder="+44 7700 000000" />
                      <InputField id="employeeId" label="Employee ID"  value={draft.employeeId} onChange={setInput("employeeId")} placeholder="EMP-0042" />
                    </>
                  ) : (
                    <>
                      <ReadField label="Phone number" value={user.phone} />
                      <ReadField label="Employee ID"  value={user.employeeId} />
                    </>
                  )}
                </FieldRow>

                <FieldRow>
                  {editing ? (
                    <>
                      <Dropdowns optionList={CONTRACT_TYPES} defaultValue={draft.contractType} label="Client / Contract" optionPlaceholder="Select client" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setDraft((p) => ({ ...p, contractType: v }))} />
                      {showJobTitle && (
                        jobTitleList ? (
                          <Dropdowns optionList={jobTitleList} defaultValue={draft.jobTitle} label="Job title" optionPlaceholder="Select job title" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, jobTitle: v }))} />
                        ) : (
                          <InputField id="jobTitle" label="Job title" value={draft.jobTitle} onChange={setInput("jobTitle")} placeholder="e.g. Site Contractor" />
                        )
                      )}
                    </>
                  ) : (
                    <>
                      <ReadDropdown label="Client / Contract" value={user.contractType} />
                      {showJobTitle && <ReadDropdown label="Job title" value={user.jobTitle} />}
                    </>
                  )}
                </FieldRow>

                <div className="mb-3">
                  <label className="flex gap-1 items-center text-left text-sm/6 font-light text-white mb-0.5">Notes</label>
                  {editing ? (
                    <textarea
                      value={draft.notes} onChange={setInput("notes")}
                      placeholder="Any additional context about this user…"
                      rows={3}
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue resize-none leading-relaxed"
                    />
                  ) : (
                    <div className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/70 outline-1 -outline-offset-1 outline-white/10 leading-relaxed min-h-[72px]">
                      {user.notes || <span className="text-white/25">—</span>}
                    </div>
                  )}
                </div>
              </Card>

              {/* Location */}
              <Card icon={MapPinIcon} title="Location">
                <FieldRow>
                  {editing ? (
                    <>
                      <Dropdowns optionList={CAMPUSES}        defaultValue={draft.campus}   label="Campus"   optionPlaceholder="Select campus"   dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setDraft((p) => ({ ...p, campus: v }))} />
                      <Dropdowns optionList={BUILDINGS_FLAT}  defaultValue={draft.building} label="Building" optionPlaceholder="Select building" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setDraft((p) => ({ ...p, building: v }))} />
                    </>
                  ) : (
                    <>
                      <ReadDropdown label="Campus"   value={user.campus} />
                      <ReadDropdown label="Building" value={user.building} />
                    </>
                  )}
                </FieldRow>
                <FieldRow>
                  {editing ? (
                    <>
                      <Dropdowns optionList={BLOCKS}  defaultValue={draft.block} label="Block" optionPlaceholder="Select block" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setDraft((p) => ({ ...p, block: v }))} />
                      <Dropdowns optionList={FLOORS}  defaultValue={draft.floor} label="Floor" optionPlaceholder="Select floor" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setDraft((p) => ({ ...p, floor: v }))} />
                    </>
                  ) : (
                    <>
                      <ReadDropdown label="Block" value={user.block} />
                      <ReadDropdown label="Floor" value={user.floor} />
                    </>
                  )}
                </FieldRow>
                {!isClientEmp && (
                  <FieldRow>
                    {editing ? (
                      <>
                        <Dropdowns optionList={FLATS} defaultValue={draft.flat} label="Flat" optionPlaceholder="Select flat" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, flat: v }))} />
                        <Dropdowns optionList={ROOMS} defaultValue={draft.room} label="Room" optionPlaceholder="Select room" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, room: v }))} />
                      </>
                    ) : (
                      <>
                        <ReadDropdown label="Flat" value={user.flat} />
                        <ReadDropdown label="Room" value={user.room} />
                      </>
                    )}
                  </FieldRow>
                )}
              </Card>

              {/* Account & access */}
              <Card icon={LockClosedIcon} title="Account & access">
                <FieldRow>
                  {editing ? (
                    <>
                      <Dropdowns optionList={["English (UK)","English (US)","French","German"]} defaultValue={draft.language} label="Language" optionPlaceholder="Select language" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, language: v }))} />
                      <Dropdowns optionList={["Europe/London (GMT+0)","Europe/Paris (GMT+1)","America/New_York (EST)"]} defaultValue={draft.timezone} label="Timezone" optionPlaceholder="Select timezone" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setDraft((p) => ({ ...p, timezone: v }))} />
                    </>
                  ) : (
                    <>
                      <ReadDropdown label="Language" value={user.language} />
                      <ReadDropdown label="Timezone" value={user.timezone} />
                    </>
                  )}
                </FieldRow>

                <div className="flex flex-col gap-0 pt-3 border-t border-obsidianHighlight">
                  {editing ? (
                    <>
                      <div className="flex items-center justify-between py-2.5 border-b border-obsidianHighlight">
                        <div>
                          <p className="text-xs font-medium text-white/70">Send welcome email</p>
                          <p className="text-[11px] text-white/35">Include login instructions and temp password</p>
                        </div>
                        <Toggle checked={draft.sendWelcome} onChange={(v) => setDraft((p) => ({ ...p, sendWelcome: v }))} />
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="text-xs font-medium text-white/70">Require 2-factor authentication</p>
                          <p className="text-[11px] text-white/35">Enforce MFA on first login</p>
                        </div>
                        <Toggle checked={draft.require2fa} onChange={(v) => setDraft((p) => ({ ...p, require2fa: v }))} />
                      </div>
                    </>
                  ) : (
                    <>
                      <ReadToggle label="Send welcome email"           desc="Include login instructions and temp password" checked={!!user.sendWelcome} />
                      <ReadToggle label="Require 2-factor authentication" desc="Enforce MFA on first login"               checked={!!user.require2fa} />
                    </>
                  )}
                </div>
              </Card>

              {/* Notification preferences */}
              <Card icon={BellIcon} title="Notification preferences">
                {NOTIFS.map((n) => (
                  editing ? (
                    <div key={n.key} className="flex items-center justify-between py-2.5 border-b border-obsidianHighlight last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-medium text-white/70">{n.label}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">{n.desc}</p>
                      </div>
                      <Toggle
                        checked={activeNotifs[n.key] ?? n.default}
                        onChange={(v) => setDraftNotifs((p) => ({ ...p, [n.key]: v }))}
                      />
                    </div>
                  ) : (
                    <ReadToggle key={n.key} label={n.label} desc={n.desc} checked={activeNotifs[n.key] ?? n.default} />
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
                    <p className="text-xs font-semibold text-white/70">Recent Requests</p>
                    <span className="text-[10px] text-white/30">{filteredCases.length} of {userCases.length}</span>
                  </div>
                  <button
                    onClick={handleNewCase}
                    className="flex items-center gap-1 h-6 px-2.5 rounded-md bg-electricBlue hover:bg-electricBlue/85 active:scale-95 text-white text-[11px] font-semibold transition-all"
                  >
                    <PlusIcon className="size-3" strokeWidth={2.5} />
                    New case
                  </button>
                </div>

                <div className="px-5 pt-3 pb-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-obsidianHighlight focus-within:border-electricBlue/40 transition-colors">
                    <MagnifyingGlassIcon className="size-3.5 text-white/25 shrink-0" />
                    <input
                      value={caseQuery}
                      onChange={(e) => { setCaseQuery(e.target.value); setCasePage(1); }}
                      placeholder="Search by ID, title or status…"
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
                    />
                    {caseQuery && (
                      <button onClick={() => { setCaseQuery(""); setCasePage(1); }} className="text-white/25 hover:text-white/60 text-[10px]">✕</button>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-3">
                  <RecentRequestsTable cases={pagedCases} />
                </div>

                {totalCasePages > 1 && (
                  <div className="flex items-center justify-between px-5 py-2.5 border-t border-obsidianHighlight">
                    <span className="text-[11px] text-white/30">
                      {(casePage - 1) * CASES_PER_PAGE + 1}–{Math.min(casePage * CASES_PER_PAGE, filteredCases.length)} of {filteredCases.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCasePage((p) => Math.max(1, p - 1))} disabled={casePage === 1} className="size-6 flex items-center justify-center rounded-md text-white/40 hover:bg-white/8 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeftIcon className="size-3.5" />
                      </button>
                      <span className="text-[11px] text-white/50 px-1">{casePage} / {totalCasePages}</span>
                      <button onClick={() => setCasePage((p) => Math.min(totalCasePages, p + 1))} disabled={casePage === totalCasePages} className="size-6 flex items-center justify-center rounded-md text-white/40 hover:bg-white/8 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
                        <ChevronRightIcon className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Role */}
              <Card icon={ShieldCheckIcon} title="Role" tag={editing ? "Required" : "Assigned"}>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {USER_ROLES.map((r) => (
                    editing ? (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleRoleClick(r)}
                        className={[
                          "text-left p-3 rounded-lg border transition-all",
                          r.value === "OurEmployee" ? "col-span-2" : "",
                          draftRole === r.value
                            ? "border-electricBlue bg-electricBlue/10"
                            : "border-obsidianHighlight hover:border-white/20 hover:bg-white/3",
                        ].join(" ")}
                      >
                        <p className={`text-xs font-semibold ${draftRole === r.value ? "text-electricBlue" : "text-white/70"}`}>{r.label}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">{r.desc}</p>
                      </button>
                    ) : (
                      <div
                        key={r.value}
                        className={[
                          "text-left p-3 rounded-lg border",
                          r.value === "OurEmployee" ? "col-span-2" : "",
                          user.userRole === r.value
                            ? "border-electricBlue bg-electricBlue/10"
                            : "border-obsidianHighlight opacity-40",
                        ].join(" ")}
                      >
                        <p className={`text-xs font-semibold ${user.userRole === r.value ? "text-electricBlue" : "text-white/70"}`}>{r.label}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">{r.desc}</p>
                      </div>
                    )
                  ))}
                </div>

                <div className="border-t border-obsidianHighlight pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Module permissions</p>
                  {visiblePerms.map((m) => (
                    <div key={m.key} className="flex items-center justify-between py-2 border-b border-obsidianHighlight last:border-0">
                      <div className="flex items-center gap-2">
                        <m.icon className="size-3.5 text-white/30" />
                        <span className="text-xs text-white/60">{m.label}</span>
                      </div>
                      {editing ? (
                        <Toggle checked={activePerms[m.key] ?? m.default} onChange={(v) => setDraftPerms((p) => ({ ...p, [m.key]: v }))} />
                      ) : (
                        <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent ${(activePerms[m.key] ?? m.default) ? "bg-electricBlue" : "bg-white/15"}`}>
                          <span className={`inline-block size-4 transform rounded-full bg-white shadow-sm ${(activePerms[m.key] ?? m.default) ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Site assignment */}
              <Card icon={MapPinIcon} title="Site assignment">
                {editing && (
                  <input
                    type="text"
                    placeholder="Search sites…"
                    className="w-full rounded-md bg-white/5 px-3 py-1.5 text-xs text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue mb-3"
                  />
                )}
                <div className="flex flex-col gap-1.5">
                  {SITES.map((site, i) => {
                    const checked = editing
                      ? (draftSites[site] ?? false)
                      : (user.site ?? "").split(",").map((s) => s.trim()).includes(site);
                    return editing ? (
                      <label key={site} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-obsidianHighlight cursor-pointer hover:border-white/20 transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setDraftSites((p) => ({ ...p, [site]: e.target.checked }))}
                          className="accent-electricBlue shrink-0"
                        />
                        <span className={`size-2 rounded-full shrink-0 ${SITE_COLORS[i % SITE_COLORS.length]}`} />
                        <span className="text-xs text-white/60 flex-1">{site}</span>
                      </label>
                    ) : (
                      <div key={site} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${checked ? "border-electricBlue/30 bg-electricBlue/5" : "border-obsidianHighlight opacity-40"}`}>
                        <input type="checkbox" checked={checked} readOnly className="accent-electricBlue shrink-0" />
                        <span className={`size-2 rounded-full shrink-0 ${SITE_COLORS[i % SITE_COLORS.length]}`} />
                        <span className="text-xs text-white/60 flex-1">{site}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Account status */}
              <Card icon={CheckIcon} title="Account status">
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((s) => (
                    editing ? (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setDraftStatus(s.value)}
                        className={[
                          "px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
                          draftStatus === s.value ? s.cls : "border-obsidianHighlight text-white/40 hover:border-white/20",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    ) : (
                      <div
                        key={s.value}
                        className={[
                          "px-4 py-1.5 rounded-full text-xs font-medium border",
                          activeStatus === s.value ? s.cls : "border-obsidianHighlight text-white/25 opacity-40",
                        ].join(" ")}
                      >
                        {s.label}
                      </div>
                    )
                  ))}
                </div>
                <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                  {activeStatus === "active"   && "User will receive login credentials and can access the system immediately."}
                  {activeStatus === "inactive" && "Account is disabled. User cannot log in until reactivated."}
                  {activeStatus === "pending"  && "Account is created but awaiting activation by the user."}
                </p>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

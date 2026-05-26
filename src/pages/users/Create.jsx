import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon, MapPinIcon, CheckIcon, BellIcon, ShieldCheckIcon,
  LockClosedIcon, CameraIcon, BriefcaseIcon, TicketIcon, SignalIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useUsers } from "../../context/UsersContext";
import InputField from "../../components/InputField";
import Dropdowns from "../../components/Dropdowns";
import BackButton from "../../components/BackButton";
import {
  CONTRACT_TYPES, SITES, userRoles as USER_ROLE_LIST,
  CAMPUSES, CAMPUS_BUILDINGS, BLOCKS, FLOORS, FLATS, ROOMS,
} from "../../utils/constants";

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
  desc: ROLE_DESCS[v] ?? "",
}));

const MODULE_PERMS = [
  { key: "cases",     label: "Cases",       icon: BriefcaseIcon,  default: true  },
  { key: "workOrders",label: "Work Orders", icon: TicketIcon,     default: true  },
  { key: "bmsAlerts", label: "BMS Alerts",  icon: SignalIcon,     default: false },
  { key: "reports",   label: "Reports",     icon: ChartBarIcon,   default: true  },
  { key: "users",     label: "Users",       icon: UsersIcon,      default: false },
  { key: "settings",  label: "Settings",    icon: Cog6ToothIcon,  default: false },
];

const NOTIFS = [
  { key: "cases",     label: "Case updates",           desc: "Notify when a case is assigned or updated",   default: true  },
  { key: "workOrders",label: "Work order assignments",  desc: "Notify when a work order is assigned",        default: true  },
  { key: "siteAlerts",label: "Site alerts",             desc: "Receive alerts for assigned sites",           default: false },
  { key: "reports",   label: "Report summaries",        desc: "Weekly email digest of activity reports",     default: false },
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

const SITE_COLORS = ["bg-emerald-400","bg-electricBlue","bg-amber-400","bg-violet-400","bg-rose-400","bg-blue-400","bg-teal-400","bg-pink-400","bg-orange-400"];
const STATUS_OPTIONS = [
  { value: "active",  label: "Active",  cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { value: "inactive",label: "Inactive",cls: "border-amber-400/40   bg-amber-400/10   text-amber-400"   },
  { value: "pending", label: "Pending", cls: "border-electricBlue/40 bg-electricBlue/10 text-electricBlue" },
];

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

function NotifRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-obsidianHighlight last:border-0 last:pb-0">
      <div>
        <p className="text-xs font-medium text-white/70">{label}</p>
        <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function PermRow({ icon: Icon, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-obsidianHighlight last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-white/30" />
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function CreateUser() {
  const navigate    = useNavigate();
  const { addUser } = useUsers();

  const [fields, setFields] = useState({
    firstName: "", lastName: "", displayName: "", email: "", phone: "",
    contractType: "", employeeId: "", jobTitle: "",
    notes: "", password: "", language: "English (UK)", timezone: "Europe/London (GMT+0)",
    campus: "", building: "", block: "", floor: "", flat: "", room: "",
  });
  const [errors,      setErrors]      = useState({});
  const [role,        setRole]        = useState("");
  const [perms,       setPerms]       = useState(() => Object.fromEntries(MODULE_PERMS.map((m) => [m.key, m.default])));
  const [notifs,      setNotifs]      = useState(() => Object.fromEntries(NOTIFS.map((n) => [n.key, n.default])));
  const [sites,       setSites]       = useState({});
  const [status,      setStatus]      = useState("active");
  const [sendWelcome, setSendWelcome] = useState(true);
  const [require2fa,  setRequire2fa]  = useState(false);

  const isClientEmp   = role === "Client Employee";
  const isOurEmp      = role === "OurEmployee";
  const isStudent     = role === "Student";
  const isContractor  = role === "Contractor";
  const showJobTitle  = isClientEmp || isOurEmp || isContractor;
  const jobTitleLabel = "Job title";
  const jobTitleList  = isClientEmp ? CLIENT_EMP_TITLES : isOurEmp ? OUR_EMP_TITLES : isContractor ? CONTRACTOR_TITLES : null;

  const setInput = (key) => (e) => {
    const val = e.target.value;
    setFields((p) => {
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

  const validate = () => {
    const e = {};
    if (!fields.firstName.trim()) e.firstName = true;
    if (!fields.lastName.trim())  e.lastName  = true;
    if (!fields.email.trim())     e.email     = true;
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const id = addUser({
      ...fields,
      displayName:    fields.displayName || `${fields.firstName.trim()} ${fields.lastName.trim()}`,
      userRole:       role,
      isStudent:      role === "Student",
      clientEmployee: isClientEmp,
      site:           Object.entries(sites).filter(([,v]) => v).map(([k]) => k).join(", "),
      contractType:   fields.contractType,
      location:       [fields.campus, fields.building, fields.block, fields.floor, fields.flat, fields.room].filter(Boolean).join(", "),
      permissions:    perms,
      notifications:  notifs,
      accountStatus:  status,
    });
    navigate(`/admin/users/${id}`);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-2.5 border-b border-obsidianHighlight bg-obsidianNight/40">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate("/admin/users")} />
          <div className="w-px h-4 bg-obsidianHighlight" />
          <div>
            <p className="text-xs font-semibold text-white leading-none">New User</p>
            <p className="text-[10px] text-white/30 mt-0.5 leading-none">Add a team member and configure their role, permissions and site access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/admin/users")} className="h-7 px-3 rounded-md border border-obsidianHighlight text-xs text-white/50 hover:bg-obsidianHighlight transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-electricBlue hover:bg-electricBlue/85 active:scale-95 text-white text-xs font-semibold transition-all">
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
            Create user
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-6 py-5">

          {/* Two-column grid */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr", alignItems: "start" }}>

            {/* ── LEFT ── */}
            <div>

              {/* Personal information */}
              <Card icon={UserCircleIcon} title="Personal information">
                {/* Photo upload */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-obsidianHighlight">
                  <div className="size-16 rounded-full bg-electricBlue/10 border-2 border-dashed border-electricBlue/30 flex items-center justify-center text-electricBlue/60 cursor-pointer hover:bg-electricBlue/15 transition-colors shrink-0">
                    <CameraIcon className="size-6" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium">Profile photo</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Upload a JPG or PNG, max 2 MB</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" className="h-6 px-2.5 rounded-md border border-obsidianHighlight text-[11px] text-white/50 hover:bg-obsidianHighlight transition-colors">Upload</button>
                      <button type="button" className="h-6 px-2.5 rounded-md text-[11px] text-white/30 hover:text-white/50 transition-colors">Remove</button>
                    </div>
                  </div>
                </div>

                <FieldRow>
                  <InputField id="firstName" label="First name" name="firstName" value={fields.firstName} onChange={setInput("firstName")} isRequired placeholder="Sarah" inputText={errors.firstName ? "!outline-rose-500/60" : ""} />
                  <InputField id="lastName"  label="Last name"  name="lastName"  value={fields.lastName}  onChange={setInput("lastName")}  isRequired placeholder="Mitchell" inputText={errors.lastName ? "!outline-rose-500/60" : ""} />
                </FieldRow>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <InputField id="displayName" label="Display name" name="displayName" value={fields.displayName} onChange={setInput("displayName")} placeholder="Sarah Mitchell" />
                    <p className="text-[11px] text-white/30 mt-1">Auto-filled from first and last name</p>
                  </div>
                  <div>
                    <InputField id="email" label="Work email address" name="email" type="email" value={fields.email} onChange={setInput("email")} isRequired placeholder="sarah.mitchell@company.com" inputText={errors.email ? "!outline-rose-500/60" : ""} />
                    <p className="text-[11px] text-white/30 mt-1">Login credentials will be sent to this address</p>
                  </div>
                </div>

                <FieldRow>
                  <InputField id="phone" label="Phone number" name="phone" value={fields.phone} onChange={setInput("phone")} placeholder="+44 7700 000000" />
                  <InputField id="employeeId" label="Employee ID" name="employeeId" value={fields.employeeId} onChange={setInput("employeeId")} placeholder="EMP-0042" />
                </FieldRow>

                <FieldRow>
                  <Dropdowns optionList={CONTRACT_TYPES} defaultValue={fields.contractType} label="Client / Contract" optionPlaceholder="Select client" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setFields((p) => ({ ...p, contractType: v }))} />
                  {showJobTitle && (
                    jobTitleList ? (
                      <Dropdowns optionList={jobTitleList} defaultValue={fields.jobTitle} label={jobTitleLabel} optionPlaceholder={`Select ${jobTitleLabel.toLowerCase()}`} dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setFields((p) => ({ ...p, jobTitle: v }))} />
                    ) : (
                      <InputField id="jobTitle" label={jobTitleLabel} name="jobTitle" value={fields.jobTitle} onChange={setInput("jobTitle")} placeholder={isStudent ? "e.g. Computer Science" : "e.g. Site Contractor"} />
                    )
                  )}
                </FieldRow>

                <div className="mb-3">
                  <label className="flex gap-1 items-center text-left text-sm/6 font-light text-white mb-0.5">Notes</label>
                  <textarea
                    value={fields.notes} onChange={setInput("notes")}
                    placeholder="Any additional context about this user…"
                    rows={3}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue resize-none leading-relaxed"
                  />
                </div>

              </Card>

              {/* Location */}
              <Card icon={MapPinIcon} title="Location">
                <FieldRow>
                  <Dropdowns optionList={CAMPUSES} defaultValue={fields.campus} label="Campus" optionPlaceholder="Select campus" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setFields((p) => ({ ...p, campus: v }))} />
                  <Dropdowns optionList={BUILDINGS_FLAT} defaultValue={fields.building} label="Building" optionPlaceholder="Select building" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setFields((p) => ({ ...p, building: v }))} />
                </FieldRow>
                <FieldRow>
                  <Dropdowns optionList={BLOCKS} defaultValue={fields.block} label="Block" optionPlaceholder="Select block" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setFields((p) => ({ ...p, block: v }))} />
                  <Dropdowns optionList={FLOORS} defaultValue={fields.floor} label="Floor" optionPlaceholder="Select floor" dropdownBtnCls={dropCls} showLabel className="w-full" isRequired onChange={(v) => setFields((p) => ({ ...p, floor: v }))} />
                </FieldRow>
                {!isClientEmp && (
                  <FieldRow>
                    <Dropdowns optionList={FLATS} defaultValue={fields.flat} label="Flat" optionPlaceholder="Select flat" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setFields((p) => ({ ...p, flat: v }))} />
                    <Dropdowns optionList={ROOMS} defaultValue={fields.room} label="Room" optionPlaceholder="Select room" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setFields((p) => ({ ...p, room: v }))} />
                  </FieldRow>
                )}
              </Card>

              {/* Account & access */}
              <Card icon={LockClosedIcon} title="Account & access">
                <div className="mb-3">
                  <label className="flex gap-1 items-center text-left text-sm/6 font-light text-white mb-0.5">Temporary password <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={fields.password} onChange={setInput("password")}
                      placeholder="Auto-generated or enter manually"
                      className="flex-1 rounded-md bg-white/5 px-3 py-1 text-sm text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setFields((p) => ({ ...p, password: generatePassword() }))}
                      className="h-8 px-3 rounded-md border border-obsidianHighlight text-[11px] text-white/50 hover:bg-obsidianHighlight transition-colors whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-[11px] text-white/30 mt-1">Please tell the requester an email will also be sent with their temporary password.</p>
                </div>

                <FieldRow>
                  <Dropdowns optionList={["English (UK)", "English (US)", "French", "German"]} defaultValue={fields.language} label="Language" optionPlaceholder="Select language" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setFields((p) => ({ ...p, language: v }))} />
                  <Dropdowns optionList={["Europe/London (GMT+0)", "Europe/Paris (GMT+1)", "America/New_York (EST)"]} defaultValue={fields.timezone} label="Timezone" optionPlaceholder="Select timezone" dropdownBtnCls={dropCls} showLabel className="w-full" onChange={(v) => setFields((p) => ({ ...p, timezone: v }))} />
                </FieldRow>

                <div className="flex flex-col gap-3 pt-3 border-t border-obsidianHighlight">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/70">Send welcome email</p>
                      <p className="text-[11px] text-white/35">Include login instructions and temp password</p>
                    </div>
                    <Toggle checked={sendWelcome} onChange={setSendWelcome} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/70">Require 2-factor authentication</p>
                      <p className="text-[11px] text-white/35">Enforce MFA on first login</p>
                    </div>
                    <Toggle checked={require2fa} onChange={setRequire2fa} />
                  </div>
                </div>
              </Card>

              {/* Notification preferences */}
              <Card icon={BellIcon} title="Notification preferences">
                {NOTIFS.map((n) => (
                  <NotifRow
                    key={n.key} label={n.label} desc={n.desc}
                    checked={notifs[n.key]}
                    onChange={(v) => setNotifs((p) => ({ ...p, [n.key]: v }))}
                  />
                ))}
              </Card>

            </div>

            {/* ── RIGHT ── */}
            <div>

              {/* Role */}
              <Card icon={ShieldCheckIcon} title="Role" tag="Required">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {USER_ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRole(r.value);
                        const defaults = Object.fromEntries(MODULE_PERMS.map((m) => [m.key, m.default]));
                        if (r.value === "Client Employee" || r.value === "Contractor") {
                          defaults.reports = false;
                        }
                        setPerms(defaults);
                      }}
                      className={[
                        "text-left p-3 rounded-lg border transition-all",
                        r.value === "OurEmployee" ? "col-span-2" : "",
                        role === r.value
                          ? "border-electricBlue bg-electricBlue/10"
                          : "border-obsidianHighlight hover:border-white/20 hover:bg-white/3",
                      ].join(" ")}
                    >
                      <p className={`text-xs font-semibold ${role === r.value ? "text-electricBlue" : "text-white/70"}`}>{r.label}</p>
                      <p className="text-[11px] text-white/35 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="border-t border-obsidianHighlight pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Module permissions</p>
                  {((isStudent || role === "Visitor") ? MODULE_PERMS.filter((m) => m.key === "workOrders") : MODULE_PERMS).map((m) => (
                    <PermRow
                      key={m.key} icon={m.icon} label={m.label}
                      checked={perms[m.key]}
                      onChange={(v) => setPerms((p) => ({ ...p, [m.key]: v }))}
                    />
                  ))}
                </div>
              </Card>

              {/* Site assignment */}
              <Card icon={MapPinIcon} title="Site assignment">
                <input
                  type="text" placeholder="Search sites…"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-xs text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue mb-3"
                />
                <div className="flex flex-col gap-1.5">
                  {SITES.map((site, i) => (
                    <label key={site} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-obsidianHighlight cursor-pointer hover:border-white/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!sites[site]}
                        onChange={(e) => setSites((p) => ({ ...p, [site]: e.target.checked }))}
                        className="accent-electricBlue shrink-0"
                      />
                      <span className={`size-2 rounded-full shrink-0 ${SITE_COLORS[i % SITE_COLORS.length]}`} />
                      <span className="text-xs text-white/60 flex-1">{site}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Account status */}
              <Card icon={CheckIcon} title="Account status">
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      className={[
                        "px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
                        status === s.value ? s.cls : "border-obsidianHighlight text-white/40 hover:border-white/20",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                  {status === "active"  && "User will receive login credentials and can access the system immediately."}
                  {status === "inactive"&& "Account is disabled. User cannot log in until reactivated."}
                  {status === "pending" && "Account is created but awaiting activation by the user."}
                </p>
              </Card>

            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-obsidianHighlight">
            <button onClick={handleSave} className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-electricBlue hover:bg-electricBlue/85 active:scale-95 text-white text-xs font-semibold transition-all">
              <CheckIcon className="size-3.5" strokeWidth={2.5} />
              Create user
            </button>
            <button type="button" className="h-8 px-4 rounded-md border border-obsidianHighlight text-xs text-white/50 hover:bg-obsidianHighlight transition-colors">
              Save as draft
            </button>
            <div className="flex-1" />
            <button onClick={() => navigate("/admin/users")} className="h-8 px-4 rounded-md border border-rose-500/20 text-xs text-rose-400/70 hover:bg-rose-500/10 transition-colors">
              Discard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

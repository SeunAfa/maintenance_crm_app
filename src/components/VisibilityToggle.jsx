import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Users, Lock, MapPin, Home } from "lucide-react";
import { getIssueScope } from "../utils/locationUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

const SCOPE_STYLE = {
  flat:     { cls: "bg-electricBlue/10 text-electricBlue border-electricBlue/25",     Icon: Home   },
  floor:    { cls: "bg-amber-400/10 text-amber-400 border-amber-400/25",               Icon: MapPin },
  block:    { cls: "bg-violet-500/10 text-violet-400 border-violet-500/25",            Icon: MapPin },
  building: { cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",         Icon: MapPin },
  site:     { cls: "bg-white/5 text-white/40 border-white/10",                         Icon: MapPin },
};

// ─── Residents grouped by flat ────────────────────────────────────────────────
function ResidentList({ users }) {
  // Group by flat (undefined flat → "No flat")
  const grouped = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      const key = u.flat ?? "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(u);
    });
    // Sort: named flats first (Flat 1, Flat 2 …), then "—"
    return [...map.entries()].sort(([a], [b]) => {
      if (a === "—") return 1;
      if (b === "—") return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [users]);

  return (
    <div className="divide-y divide-white/[0.04]">
      {grouped.map(([flat, residents]) => (
        <div key={flat}>
          {/* Flat sub-header */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02]">
            <Home className="size-2.5 text-white/20 shrink-0" />
            <span className="text-[9px] uppercase tracking-widest text-white/25 font-semibold">
              {flat}
            </span>
          </div>
          {/* Residents in this flat */}
          {residents.map((u) => (
            <div
              key={u.id ?? u.email}
              className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/[0.03] transition-colors"
            >
              {/* Avatar */}
              <div className="size-5 rounded-full bg-electricBlue/15 flex items-center justify-center text-[8px] font-bold text-electricBlue shrink-0">
                {getInitials(u.displayName)}
              </div>
              <span className="text-[11px] text-white/70 flex-1 truncate">{u.displayName}</span>
              <span className="text-[9px] text-white/25 truncate shrink-0 max-w-[140px]">{u.email}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── VisibilityToggle ─────────────────────────────────────────────────────────
export default function VisibilityToggle({
  onChange,
  Icons,
  className = "",
  defaultValue = false,
  value,
  sharedUsers = [],
  location = {},
  disabled = false,
}) {
  const [isShared, setIsShared]   = useState(!!defaultValue);
  const [listOpen, setListOpen]   = useState(false);

  useEffect(() => {
    if (value !== undefined) setIsShared(!!value);
  }, [value]);

  useEffect(() => {
    if (!isShared) setListOpen(false);
  }, [isShared]);

  const caseNotShared = () => { if (disabled) return; setIsShared(false); onChange?.(false); };
  const caseShared    = () => { if (disabled) return; setIsShared(true);  onChange?.(true);  };

  const scope     = getIssueScope(location);
  const scopeSty  = SCOPE_STYLE[scope.key] ?? SCOPE_STYLE.site;
  const ScopeIcon = scopeSty.Icon;
  const count     = sharedUsers.length;

  return (
    <div className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col gap-3 ${className}`}>

      <h2 className="text-sm font-bold leading-none text-white">Case Visibility</h2>

      {/* Toggle row */}
      <div className={`grid grid-cols-2 gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        <button
          onClick={caseNotShared}
          disabled={disabled}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
            !isShared
              ? "bg-electricBlue/15 outline outline-1 outline-electricBlue/60"
              : "bg-white/[0.04] outline outline-1 outline-white/10 hover:bg-white/[0.07]"
          }`}
        >
          <Lock size={13} className={`shrink-0 ${!isShared ? "text-electricBlue" : "text-white/30"}`} />
          <div>
            <p className={`text-[11px] font-semibold leading-none ${!isShared ? "text-white" : "text-white/50"}`}>
              Private
            </p>
            <p className="text-[10px] mt-0.5 text-white/30 leading-none">Requester only</p>
          </div>
        </button>

        <button
          onClick={caseShared}
          disabled={disabled}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
            isShared
              ? "bg-electricBlue/15 outline outline-1 outline-electricBlue/60"
              : "bg-white/[0.04] outline outline-1 outline-white/10 hover:bg-white/[0.07]"
          }`}
        >
          <Users size={13} className={`shrink-0 ${isShared ? "text-electricBlue" : "text-white/30"}`} />
          <div>
            <p className={`text-[11px] font-semibold leading-none ${isShared ? "text-white" : "text-white/50"}`}>
              Shared
            </p>
            <p className="text-[10px] mt-0.5 text-white/30 leading-none">Multiple residents</p>
          </div>
        </button>
      </div>

      {/* Content */}
      {!isShared ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <span className="size-1.5 rounded-full bg-slate-500 shrink-0" />
          <p className="text-[11px] text-white/35">Visible to the requester only</p>
        </div>
      ) : (
        <div className="rounded-lg border border-electricBlue/20 bg-electricBlue/5 overflow-hidden">

          {/* Scope badge */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-electricBlue/10">
            <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${scopeSty.cls}`}>
              <ScopeIcon className="size-2.5" />
              {scope.label}
            </span>
            <span className="text-[10px] text-white/35 truncate">{scope.desc}</span>
          </div>

          {/* Accordion header */}
          <button
            type="button"
            onClick={() => count > 0 && setListOpen((v) => !v)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors ${
              count > 0 ? "hover:bg-electricBlue/10 cursor-pointer" : "cursor-default"
            }`}
          >
            <span className="size-1.5 rounded-full bg-electricBlue shrink-0" />
            <p className="flex-1 text-[11px] text-electricBlue/80 text-left">
              {count > 0
                ? `${count} resident${count !== 1 ? "s" : ""} linked to this case`
                : "No residents matched to this location"}
            </p>
            {count > 0 && (
              <ChevronDownIcon
                className={`size-3 text-electricBlue/50 shrink-0 transition-transform duration-200 ${
                  listOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Collapsible resident list grouped by flat */}
          {listOpen && count > 0 && (
            <div className="border-t border-electricBlue/10">
              <ResidentList users={sharedUsers} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

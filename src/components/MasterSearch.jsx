import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  TicketIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";
import { USERS_DATA } from "../data/usersData";

// Global "master" search — looks across cases, work orders and users in one
// box. Results are grouped and clicking a row navigates to the entity.
export default function MasterSearch() {
  const { cases } = useCases();
  const navigate  = useNavigate();
  const [q,    setQ]    = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);
  const inputRef        = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Cmd/Ctrl-K to focus
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const query = q.trim().toLowerCase();

  const { caseResults, woResults, userResults } = useMemo(() => {
    if (!query) return { caseResults: [], woResults: [], userResults: [] };

    const caseHits = cases.filter((c) =>
      c.caseId?.toLowerCase().includes(query) ||
      c.title?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    ).slice(0, 5);

    const woHits = cases.filter((c) =>
      c.workOrderNumber && (
        c.workOrderNumber.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query)
      )
    ).slice(0, 5);

    const userHits = USERS_DATA.filter((u) =>
      u.displayName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query)
    ).slice(0, 5);

    return { caseResults: caseHits, woResults: woHits, userResults: userHits };
  }, [query, cases]);

  const total = caseResults.length + woResults.length + userResults.length;

  const handleSelect = (type, item) => {
    setOpen(false);
    setQ("");
    if      (type === "case") navigate(`/admin/cases/manage/${item.id}`);
    else if (type === "wo")   navigate(`/admin/workorders/${item.id}`);
    else if (type === "user") navigate(`/admin/users/${item.id}`);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-lg">
      <div className="relative flex items-center">
        <MagnifyingGlassIcon className="absolute left-3 size-4 text-white/30 pointer-events-none" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search cases, work orders, users…"
          className="w-full bg-white/[0.04] rounded-lg pl-9 pr-16 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:bg-white/[0.07] transition-colors"
        />
        <span className="absolute right-2 flex items-center gap-1">
          {q ? (
            <button
              onClick={() => { setQ(""); inputRef.current?.focus(); }}
              className="size-5 flex items-center justify-center rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
              aria-label="Clear"
            >
              <XMarkIcon className="size-3" />
            </button>
          ) : (
            <kbd className="text-[9px] font-mono text-white/30 bg-white/5 rounded px-1 py-0.5">
              ⌘K
            </kbd>
          )}
        </span>
      </div>

      {open && q && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-obsidianSurface shadow-2xl shadow-black/60 overflow-hidden max-h-[420px] overflow-y-auto">
          {total === 0 ? (
            <p className="px-4 py-6 text-center text-[11px] text-white/30">
              No results for "<span className="text-white/50">{q}</span>"
            </p>
          ) : (
            <>
              {caseResults.length > 0 && (
                <Section title="Cases" count={caseResults.length}>
                  {caseResults.map((c) => (
                    <ResultRow
                      key={`c-${c.id}`}
                      Icon={BriefcaseIcon}
                      iconColor="text-amber-400"
                      iconBg="bg-amber-400/10"
                      title={c.title || c.caseId}
                      meta={`${c.caseId} · ${c.case_status}`}
                      onClick={() => handleSelect("case", c)}
                    />
                  ))}
                </Section>
              )}
              {woResults.length > 0 && (
                <Section title="Work Orders" count={woResults.length}>
                  {woResults.map((c) => (
                    <ResultRow
                      key={`wo-${c.id}`}
                      Icon={TicketIcon}
                      iconColor="text-violet-400"
                      iconBg="bg-violet-400/10"
                      title={c.workOrderNumber}
                      meta={c.title}
                      onClick={() => handleSelect("wo", c)}
                    />
                  ))}
                </Section>
              )}
              {userResults.length > 0 && (
                <Section title="Users" count={userResults.length}>
                  {userResults.map((u) => (
                    <ResultRow
                      key={`u-${u.id ?? u.email}`}
                      Icon={UserIcon}
                      iconColor="text-electricBlue"
                      iconBg="bg-electricBlue/10"
                      title={u.displayName}
                      meta={u.email || u.phone}
                      onClick={() => handleSelect("user", u)}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div>
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between sticky top-0 bg-obsidianSurface">
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
          {title}
        </p>
        <span className="text-[10px] text-white/25">{count}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({ Icon, iconColor, iconBg, title, meta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] transition-colors text-left"
    >
      <span className={`shrink-0 size-7 rounded-md flex items-center justify-center ${iconBg}`}>
        <Icon className={`size-3.5 ${iconColor}`} />
      </span>
      <span className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white truncate">{title}</p>
        <p className="text-[10px] text-white/40 truncate">{meta}</p>
      </span>
    </button>
  );
}

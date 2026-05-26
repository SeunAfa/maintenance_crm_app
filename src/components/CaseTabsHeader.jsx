import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CopyPlus } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCases } from "../context/CasesContext";

const TABS_KEY         = "openCaseIds";
const WO_TABS_KEY      = "openWOIds";
const DRAFT_TABS_KEY   = "draftTabs";
const DRAFT_COUNTER_KEY = "draftCounter";

const STATUS_DOT = {
  New:         "bg-electricBlue",
  "In Review": "bg-amber-400",
  Converted:   "bg-violet-400",
  Closed:      "bg-slate-400",
};

const WO_STATUS_DOT = {
  Dispatched:    "bg-electricBlue",
  Acknowledged:  "bg-purple-400",
  "In Progress":    "bg-amber-400",
  "Awaiting Parts":  "bg-orange-500",
  "Final Response":  "bg-sky-400",
  Responded:         "bg-teal-400",
  Completed:     "bg-emerald-400",
  Cancelled:     "bg-red-400",
};

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function matchesCaseQuery(c, q) {
  const lq = q.toLowerCase();
  return (
    (c.caseId ?? "").toLowerCase().includes(lq) ||
    (c.title  ?? "").toLowerCase().includes(lq) ||
    (c.requester?.displayName         ?? "").toLowerCase().includes(lq) ||
    (c.affectedRequester?.displayName ?? "").toLowerCase().includes(lq)
  );
}

function matchesWOQuery(c, q) {
  const lq = q.toLowerCase();
  return (
    (c.workOrderNumber ?? "").toLowerCase().includes(lq) ||
    (c.workOrderStatus ?? "").toLowerCase().includes(lq) ||
    (c.assignedTo      ?? "").toLowerCase().includes(lq) ||
    (c.title           ?? "").toLowerCase().includes(lq)
  );
}

// ─── CaseSearchDropdown ───────────────────────────────────────────────────────
function CaseSearchDropdown({ cases, onSelect, onClose, anchorRect }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const q = query.trim();

  // Split cases vs work orders
  const allCases = cases.filter((c) => !c.workOrderNumber);
  const allWOs   = cases.filter((c) => !!c.workOrderNumber);

  const RECENT_LIMIT = 5;

  const caseResults = q
    ? allCases.filter((c) => matchesCaseQuery(c, q))
    : [...allCases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, RECENT_LIMIT);

  const woResults = q
    ? allWOs.filter((c) => matchesWOQuery(c, q))
    : [...allWOs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, RECENT_LIMIT);

  const isRecent   = !q;
  const hasResults = caseResults.length > 0 || woResults.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-[380px] rounded-lg border border-obsidianHighlight bg-obsidianSurface shadow-xl overflow-hidden"
        style={{ top: (anchorRect?.bottom ?? 0) + 4, right: anchorRect ? window.innerWidth - anchorRect.right : 0 }}
      >
        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-obsidianHighlight">
          <MagnifyingGlassIcon className="size-3.5 text-white/30 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases & work orders…"
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!hasResults ? (
            <p className="py-5 text-center text-[11px] text-white/25">No results found</p>
          ) : (
            <>
              {/* ── Work Orders section ── */}
              {woResults.length > 0 && (
                <>
                  <div className="sticky top-0 flex items-center gap-2 px-3 py-1.5 bg-obsidianSurface border-b border-obsidianHighlight/60">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/70">
                      {isRecent ? "Recent Work Orders" : "Work Orders"}
                    </span>
                    {!isRecent && <span className="text-[10px] text-white/20">{woResults.length}</span>}
                  </div>
                  {woResults.map((c) => (
                    <button
                      key={`wo-${c.id}`}
                      onClick={() => { onSelect(c, "wo"); onClose(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-obsidianHighlight border-b border-obsidianHighlight/40 last:border-0 transition-colors"
                    >
                      <span className={`size-1.5 shrink-0 rounded-full ${WO_STATUS_DOT[c.workOrderStatus] ?? "bg-violet-400"}`} />
                      <span className="font-mono text-[11px] font-semibold text-violet-400 shrink-0">{c.workOrderNumber}</span>
                      <span className="flex-1 min-w-0 text-[11px] text-white/70 truncate">
                        {c.title || <span className="italic text-white/25">Untitled</span>}
                      </span>
                      <span className="shrink-0 text-[10px] text-white/25">{fmtDate(c.createdAt)}</span>
                    </button>
                  ))}
                </>
              )}

              {/* ── Cases section ── */}
              {caseResults.length > 0 && (
                <>
                  <div className="sticky top-0 flex items-center gap-2 px-3 py-1.5 bg-obsidianSurface border-b border-obsidianHighlight/60">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-electricBlue/70">
                      {isRecent ? "Recent Cases" : "Cases"}
                    </span>
                    {!isRecent && <span className="text-[10px] text-white/20">{caseResults.length}</span>}
                  </div>
                  {caseResults.map((c) => (
                    <button
                      key={`case-${c.id}`}
                      onClick={() => { onSelect(c, "case"); onClose(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-obsidianHighlight border-b border-obsidianHighlight/40 last:border-0 transition-colors"
                    >
                      <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[c.case_status] ?? "bg-slate-400"}`} />
                      <span className="font-mono text-[11px] font-semibold text-electricBlue shrink-0">{c.caseId}</span>
                      <span className="flex-1 min-w-0 text-[11px] text-white/70 truncate">
                        {c.title || <span className="italic text-white/25">Untitled</span>}
                      </span>
                      <span className="shrink-0 text-[10px] text-white/25">{fmtDate(c.createdAt)}</span>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── NewCaseModal ─────────────────────────────────────────────────────────────
function NewCaseModal({ nextCaseId, onClose, onCreate }) {
  const [title, setTitle] = useState("");

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-obsidianNight/60">
      <div onClick={(e) => e.stopPropagation()} className="w-[360px] rounded-xl border border-obsidianHighlight bg-obsidianSurface p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-semibold text-white">New case</h3>
        <div className="mb-3">
          <label className="mb-1 block text-xs text-white/40">Case ID</label>
          <input readOnly value={nextCaseId} className="w-full rounded-lg border border-obsidianHighlight bg-obsidianElevated px-3 py-1.5 text-xs text-white/40 outline-none" />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-xs text-white/40">
            Title <span className="text-white/20">(optional — can fill later)</span>
          </label>
          <input
            autoFocus value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate({ title: title.trim() })}
            placeholder="Describe the issue…"
            className="w-full rounded-lg border border-obsidianHighlight bg-obsidianElevated px-3 py-1.5 text-xs text-white outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue/30"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-obsidianHighlight px-4 py-1.5 text-xs text-white/50 hover:bg-obsidianElevated">Cancel</button>
          <button onClick={() => onCreate({ title: title.trim() })} className="rounded-lg bg-electricBlue px-4 py-1.5 text-xs font-medium text-white hover:bg-electricBlue/80">Create case</button>
        </div>
      </div>
    </div>
  );
}

// ─── CaseTabsHeader ───────────────────────────────────────────────────────────
export default function CaseTabsHeader() {
  const { cases } = useCases();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isWOPath   = location.pathname.startsWith("/admin/workorders/");
  const isCasePath = location.pathname.startsWith("/admin/cases/manage/");
  const urlId      = Number(location.pathname.split("/").pop()) || null;

  const [openIds, setOpenIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TABS_KEY)) ?? []; }
    catch { return []; }
  });
  const [openWOIds, setOpenWOIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WO_TABS_KEY)) ?? []; }
    catch { return []; }
  });
  const [draftTabs, setDraftTabs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_TABS_KEY)) ?? []; }
    catch { return []; }
  });
  const [showSearch, setShowSearch] = useState(false);
  const [searchRect, setSearchRect] = useState(null);
  const searchBtnRef = useRef(null);

  useEffect(() => { localStorage.setItem(TABS_KEY,    JSON.stringify(openIds));   }, [openIds]);
  useEffect(() => { localStorage.setItem(WO_TABS_KEY, JSON.stringify(openWOIds)); }, [openWOIds]);
  useEffect(() => { localStorage.setItem(DRAFT_TABS_KEY, JSON.stringify(draftTabs)); }, [draftTabs]);

  const activeDraftId = location.pathname === "/admin/cases/create"
    ? Number(new URLSearchParams(location.search).get("d")) || null
    : null;

  const handleNewCase = () => {
    const counter = (Number(localStorage.getItem(DRAFT_COUNTER_KEY)) || 0) + 1;
    localStorage.setItem(DRAFT_COUNTER_KEY, counter);
    const scenario = counter % 2 === 0 ? "new" : "existing";
    setDraftTabs((prev) => {
      const used = new Set(
        prev.map((d) => { const m = d.label.match(/^Untitled (\d+)$/); return m ? Number(m[1]) : null; })
            .filter((n) => n !== null)
      );
      let n = 1;
      while (used.has(n)) n++;
      return [...prev, { id: counter, label: `Untitled ${n}` }];
    });
    navigate(`/admin/cases/create?d=${counter}&s=${scenario}`);
    window.dispatchEvent(new CustomEvent("call:start", { detail: { autoAnswer: true, scenario } }));
  };

  const closeDraft = (e, draftId) => {
    e.stopPropagation();
    setDraftTabs((prev) => {
      const next = prev.filter((d) => d.id !== draftId);
      if (draftId === activeDraftId) {
        if (next.length > 0) navigate(`/admin/cases/create?d=${next[next.length - 1].id}`);
        else if (openTabs.length > 0) navigate(`/admin/cases/manage/${openTabs[openTabs.length - 1].id}`);
        else navigate("/admin/cases");
      }
      return next;
    });
  };

  // Auto-register case tabs
  useEffect(() => {
    if (!isCasePath || !urlId || !cases.some((c) => c.id === urlId)) return;
    setOpenIds((prev) => prev.includes(urlId) ? prev : [...prev, urlId]);
  }, [urlId, isCasePath, cases]);

  // Auto-register WO tabs
  useEffect(() => {
    if (!isWOPath || !urlId || !cases.some((c) => c.id === urlId && c.workOrderNumber)) return;
    setOpenWOIds((prev) => prev.includes(urlId) ? prev : [...prev, urlId]);
  }, [urlId, isWOPath, cases]);

  const openTabs   = openIds.map((id) => cases.find((c) => c.id === id)).filter(Boolean);
  const openWOTabs = openWOIds.map((id) => cases.find((c) => c.id === id && c.workOrderNumber)).filter(Boolean);

  const handleTabClick = (id) => navigate(`/admin/cases/manage/${id}`);

  const closeTab = (e, caseId) => {
    e.stopPropagation();
    setOpenIds((prev) => {
      const next = prev.filter((id) => id !== caseId);
      if (caseId === urlId)
        navigate(next.length > 0 ? `/admin/cases/manage/${next[next.length - 1]}` : "/admin/cases");
      return next;
    });
  };

  const closeWOTab = (e, caseId) => {
    e.stopPropagation();
    setOpenWOIds((prev) => {
      const next = prev.filter((id) => id !== caseId);
      if (caseId === urlId)
        navigate(next.length > 0 ? `/admin/workorders/${next[next.length - 1]}` : "/admin/workorders");
      return next;
    });
  };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="relative z-10 w-full h-10 shrink-0 bg-obsidianSurface border-b border-obsidianHighlight flex items-stretch">

        {/* Scrollable tabs area */}
        <div className="scrollbar-hide flex-1 min-w-0 flex items-stretch overflow-x-auto">

          {openTabs.map((c) => {
            const isActive = isCasePath && c.id === urlId;
            const tabTitle = c.title || c.caseId || "New Case";
            return (
              <div
                key={c.id}
                onClick={() => handleTabClick(c.id)}
                title={tabTitle}
                className={[
                  "group flex w-32 sm:w-44 shrink-0 h-full cursor-pointer select-none items-center gap-2 overflow-hidden px-2 sm:px-3 text-xs transition-colors",
                  isActive
                    ? "border-b-2 border-b-electricBlue bg-obsidianElevated shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "border-b-2 border-b-transparent bg-obsidianSurface text-white/45 hover:bg-obsidianHighlight/60 hover:text-white",
                ].join(" ")}
              >
                <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[c.case_status] ?? "bg-slate-400"}`} />
                <span className={`shrink-0 text-xs font-medium ${isActive ? "text-electricBlue" : "text-white/60"}`}>{c.caseId}</span>
                <span className={`flex-1 min-w-0 truncate text-left ${isActive ? "text-white" : "text-white/50"}`}>
                  {tabTitle}
                </span>
                <span onClick={(e) => closeTab(e, c.id)} className="shrink-0 flex size-4 items-center justify-center rounded-full text-[10px] text-white/30 hover:bg-obsidianHighlight hover:text-white transition-colors">✕</span>
              </div>
            );
          })}

          {/* WO tabs */}
          {openWOTabs.map((c) => {
            const isActive = isWOPath && c.id === urlId;
            const woStatus = c.workOrderStatus ?? "Dispatched";
            const tabTitle = c.title || c.workOrderNumber;
            return (
              <div
                key={`wo-${c.id}`}
                onClick={() => navigate(`/admin/workorders/${c.id}`)}
                title={tabTitle}
                className={[
                  "group flex w-32 sm:w-44 shrink-0 h-full cursor-pointer select-none items-center gap-2 overflow-hidden px-2 sm:px-3 text-xs transition-colors",
                  isActive
                    ? "border-b-2 border-b-violet-400 bg-obsidianElevated shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "border-b-2 border-b-transparent bg-obsidianSurface text-white/45 hover:bg-obsidianHighlight/60 hover:text-white",
                ].join(" ")}
              >
                <span className={`size-1.5 shrink-0 rounded-full ${WO_STATUS_DOT[woStatus] ?? "bg-violet-400"}`} />
                <span className={`shrink-0 text-xs font-medium ${isActive ? "text-violet-400" : "text-white/60"}`}>{c.workOrderNumber}</span>
                <span className={`flex-1 min-w-0 truncate text-left ${isActive ? "text-white" : "text-white/50"}`}>
                  {tabTitle}
                </span>
                <span onClick={(e) => closeWOTab(e, c.id)} className="shrink-0 flex size-4 items-center justify-center rounded-full text-[10px] text-white/30 hover:bg-obsidianHighlight hover:text-white transition-colors">✕</span>
              </div>
            );
          })}

          {/* Draft tabs */}
          {draftTabs.map((draft) => {
            const isActive = draft.id === activeDraftId;
            return (
              <div
                key={draft.id}
                onClick={() => navigate(`/admin/cases/create?d=${draft.id}`)}
                title={draft.label}
                className={[
                  "group flex w-32 sm:w-44 shrink-0 h-full cursor-pointer select-none items-center gap-2 overflow-hidden px-2 sm:px-3 text-xs transition-colors",
                  isActive
                    ? "border-b-2 border-b-amber-400 bg-obsidianElevated shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "border-b-2 border-b-transparent bg-obsidianSurface text-white/45 hover:bg-obsidianHighlight/60 hover:text-white",
                ].join(" ")}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-amber-400/60" />
                <span className={`flex-1 min-w-0 truncate text-left ${isActive ? "text-amber-300" : "text-white/50"}`}>
                  {draft.label}
                </span>
                <span
                  onClick={(e) => closeDraft(e, draft.id)}
                  className="shrink-0 flex size-4 items-center justify-center rounded-full text-[10px] text-white/30 hover:bg-obsidianHighlight hover:text-white transition-colors"
                >✕</span>
              </div>
            );
          })}

        </div>

        {/* Fixed right actions */}
        <div className="shrink-0 flex items-stretch border-l border-obsidianHighlight">
          <div
            onClick={handleNewCase}
            title="New case"
            className="group flex h-full cursor-pointer select-none items-center gap-2 whitespace-nowrap px-3 sm:px-4 text-xs text-white/50 transition-colors hover:bg-obsidianHighlight hover:text-electricBlue"
          >
            <CopyPlus className="size-3 group-hover:text-electricBlue transition-colors" />
            <span className="hidden sm:inline">New case</span>
          </div>
          <div
            ref={searchBtnRef}
            onClick={() => {
              const rect = searchBtnRef.current?.getBoundingClientRect();
              setSearchRect(rect ?? null);
              setShowSearch((v) => !v);
            }}
            className="group flex h-full cursor-pointer select-none items-center gap-2 whitespace-nowrap px-3 text-xs text-white/50 transition-colors hover:bg-obsidianHighlight hover:text-white"
          >
            <MagnifyingGlassIcon className="size-3.5" />
          </div>
        </div>

      </div>

      {showSearch && (
        <CaseSearchDropdown
          cases={cases}
          anchorRect={searchRect}
          onSelect={(c, type) => {
            navigate(type === "wo" ? `/admin/workorders/${c.id}` : `/admin/cases/manage/${c.id}`);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

    </>
  );
}

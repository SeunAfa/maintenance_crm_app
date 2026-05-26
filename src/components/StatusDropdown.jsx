import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – StatusDropdown
// ─────────────────────────────────────────────────────────────────────────────
export default function StatusDropdown({
  status,
  onChange,
  statusStyles,
  statuses,
  Icons,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const s = statusStyles[status] || statusStyles["New"];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${s.pill} hover:opacity-80 transition-opacity`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {status}
        <Icons.ChevronDown />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => {
                onChange(st);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                st === status ? "font-semibold" : ""
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusStyles[st].dot} shrink-0`}
              />
              {st}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – StatusJourney
// ─────────────────────────────────────────────────────────────────────────────
export default function StatusJourney({
  status,
  onChange,
  statuses,
  statusStyles,
  Icons,
}) {
  const idx = statuses.indexOf(status);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3">
      <div className="flex items-center">
        {statuses.map((st, i) => {
          const cur = st === status;
          const past = idx > i;
          const s = statusStyles[st];
          return (
            <div key={st} className="flex items-center flex-1">
              <button
                onClick={() => onChange(st)}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    cur
                      ? `${s.dot} border-transparent shadow-sm`
                      : past
                      ? "bg-slate-200 border-slate-300"
                      : "bg-white border-slate-200 group-hover:border-slate-300"
                  }`}
                >
                  {past && <Icons.Check size={10} />}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    cur ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {st}
                </span>
              </button>
              {i < statuses.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 mb-4 ${
                    past || cur ? "bg-slate-300" : "bg-slate-100"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

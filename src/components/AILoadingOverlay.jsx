// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – AILoadingOverlay
// ─────────────────────────────────────────────────────────────────────────────
export default function AILoadingOverlay({ Icons }) {
  return (
    <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-40">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">
        <Icons.Sparkles size={22} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">
          AI is reading the case…
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Extracting job details, priority and category
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – ConvertFAB
// ─────────────────────────────────────────────────────────────────────────────
export default function ConvertFAB({ onConvert, disabled = false, Icons }) {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-30">
      <button
        onClick={onConvert}
        disabled={disabled}
        className="pointer-events-auto flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 select-none"
      >
        <Icons.Sparkles size={15} />
        Convert to Work Order
        <Icons.Wrench size={15} />
      </button>
    </div>
  );
}
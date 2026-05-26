export default function AccentButton({ onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-electricBlue/30 bg-electricBlue/10 px-3 text-xs font-medium text-electricBlue transition-all hover:bg-electricBlue/20 hover:cursor-pointer active:scale-[0.98] focus:outline-none"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

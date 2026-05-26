export default function GhostButton({ onClick, icon: Icon, label, disabled = false, title }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all focus:outline-none ${
        disabled
          ? "border-obsidianHighlight/60 bg-obsidianNight/30 text-white/25 cursor-not-allowed"
          : "border-obsidianHighlight bg-obsidianNight/60 text-white/60 hover:bg-white/6 hover:text-white hover:cursor-pointer active:scale-[0.98]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

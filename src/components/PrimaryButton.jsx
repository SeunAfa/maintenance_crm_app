export default function PrimaryButton({ onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-electricBlue px-3 text-xs font-semibold text-white shadow-sm shadow-electricBlue/20 transition-all hover:bg-electricBlue/85 hover:cursor-pointer active:scale-[0.98] focus:outline-none"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

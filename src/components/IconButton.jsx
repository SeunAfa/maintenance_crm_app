import clsx from "clsx";

export default function IconButton({
  title,
  onClick,
  children,
  danger = false,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={clsx(
        "inline-flex size-8 items-center justify-center rounded-lg text-white/40 transition-colors focus:outline-none",
        danger
          ? "hover:bg-rose-500/10 hover:text-rose-400"
          : "hover:bg-white/8 hover:text-white/80",
        className
      )}
    >
      {children}
    </button>
  );
}

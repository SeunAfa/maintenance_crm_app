import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * Shared back-button component used everywhere in the app for consistency.
 *
 * Variants:
 *  - "icon"  (default for admin pages) → square icon-only button
 *  - "inline" (customer pages, fallbacks) → text + arrow link/button
 *
 * Behaviour:
 *  - If `to` is provided → renders a <Link>
 *  - Else uses `onClick`; if none is provided either, falls back to navigate(-1)
 */
export default function BackButton({
  variant = "icon",
  label,
  to,
  onClick,
  className = "",
  title = "Back",
}) {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(-1));

  const inlineCls = clsx(
    "inline-flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors w-fit",
    className
  );

  const iconCls = clsx(
    "inline-flex size-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors focus:outline-none",
    className
  );

  if (variant === "inline") {
    const content = (
      <>
        <ArrowLeftIcon className="size-3" />
        {label ?? "Back"}
      </>
    );
    return to ? (
      <Link to={to} className={inlineCls}>{content}</Link>
    ) : (
      <button type="button" onClick={handleClick} className={inlineCls} aria-label={title}>
        {content}
      </button>
    );
  }

  // icon variant
  const iconContent = <ArrowLeftIcon className="size-4" />;
  return to ? (
    <Link to={to} className={iconCls} title={title} aria-label={title}>
      {iconContent}
    </Link>
  ) : (
    <button type="button" onClick={handleClick} className={iconCls} title={title} aria-label={title}>
      {iconContent}
    </button>
  );
}

import clsx from "clsx";

export default function Divider({ className }) {
  return (
    <span
      className={clsx(`${className} mx-1 h-5 w-px bg-white/15 `)}
      aria-hidden="true"
    />
  );
}

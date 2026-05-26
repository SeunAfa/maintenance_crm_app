import {
  LockClosedIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function FormField({
  id,
  label,
  children,
  isRequired = false,
  fieldLocked = false,
  error = false,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex flex-row gap-1 items-center text-left text-sm/6 font-light transition-colors ${error ? "text-red-400" : "text-white"}`}
      >
        {label}
        {isRequired && <span className={error ? "text-red-400" : "text-red-500"}>*</span>}
        {error && <span className="text-[10px] text-red-400 font-medium">Required</span>}
        {fieldLocked && <LockClosedIcon className="size-3 text-white/50" />}
      </label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

import React from "react";

const Checkbox = ({
  id,
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid w-4 grid-cols-1">
          <input
            id={id}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="
              col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 
              bg-white/5 checked:border-electricBlue checked:bg-electricBlue
              indeterminate:border-electricBlue indeterminate:bg-electricBlue
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electricBlue
              disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100
              forced-colors:appearance-auto
            "
          />
          <svg
            viewBox="0 0 14 14"
            fill="none"
            className="
              pointer-events-none col-start-1 row-start-1 w-3.5 h-3.5 self-center justify-self-center
              stroke-white group-disabled:stroke-gray-950/25
            "
          >
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-checked:opacity-100"
            />
            <path
              d="M3 7H11"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-indeterminate:opacity-100"
            />
          </svg>
        </div>
      </div>
      <label htmlFor={id} className="block text-sm/6 text-white/70">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;

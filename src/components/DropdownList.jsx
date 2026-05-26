import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/solid";

const DropdownList = ({
  selectedKey,
  activeKey,
  isVisibleKey, // e.g. "worker"
  value,
  setValue,
  options = [],
  placeholder = "Select...",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${
        selectedKey === isVisibleKey
          ? "max-h-96 opacity-100 mt-2"
          : "max-h-0 opacity-0 pointer-events-none"
      }`}
    >
      <div ref={dropdownRef} className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full bg-obsidianSurface border-3 border-obsidianElevated hover:bg-obsidianElevated text-sm rounded-xl px-4 py-3 flex items-center justify-between focus:outline-none transition-colors cursor-pointer"
        >
          <span className={value ? "text-white" : "text-white/70"}>
            {value || placeholder}
          </span>

          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180 text-electricBlue" : "text-white/70"
            }`}
          />
        </button>

        {/* Options */}
        {open && (
          <ul className="absolute z-50 w-full mt-1 bg-obsidianSurface border border-obsidianElevated rounded-xl shadow-xl">
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  setValue(opt);
                  setOpen(false);
                }}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between
                  ${
                    value === opt
                      ? "bg-electricBlue/80 text-white"
                      : "text-slate-300 hover:bg-electricBlue/50 hover:text-white"
                  }`}
              >
                <span>{opt}</span>

                {value === opt && (
                  <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DropdownList;

import { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon, LockClosedIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function Dropdown({
  id,
  className = "",
  optionList = [],
  label,
  optionPlaceholder = "Select",
  dropdownBtnCls = "",
  showLabel = false,
  isRequired = false,
  fieldLocked = false,
  disabled = false,
  defaultValue = null,
  onChange = () => {},
}) {
  const [selected, setSelected] = useState(defaultValue);

  // keep in sync if parent changes value
  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  const handleSelect = (option) => {
    setSelected(option);
    onChange(option); // send back to parent if needed
  };

  const isDisabled = disabled || fieldLocked;

  return (
    <div className={clsx(className, isDisabled && "opacity-50 pointer-events-none")}>
      {showLabel && (
        <label
          htmlFor={id}
          className="flex flex-row gap-1 items-center text-left text-sm/6 font-light text-white"
        >
          {label}
          {isRequired && <span className="text-red-500">*</span>}
          {(fieldLocked || disabled) && <LockClosedIcon className="size-3 text-white/50" />}
        </label>
      )}

      <div className={showLabel ? "mt-0.5" : ""}>
        <Menu as="div" className="relative block w-full bg-transparent">
          <MenuButton
            id={id}
            disabled={isDisabled}
            className={clsx(
              `${dropdownBtnCls} flex w-full justify-between items-center rounded-lg text-xs leading-5 text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue`
            )}
          >
            <span className={clsx(!selected && "text-gray-500")}>
              {selected || optionPlaceholder}
            </span>

            <span className={clsx("flex items-center gap-1", !showLabel && "ml-4")}>
              {selected != null && selected !== "" && !isDisabled && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear selection"
                  title="Clear selection"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelected(null);
                    onChange(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelected(null);
                      onChange(null);
                    }
                  }}
                  className="size-4 flex items-center justify-center rounded text-white/35 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <XMarkIcon className="size-3" />
                </span>
              )}
              <ChevronDownIcon
                aria-hidden="true"
                className="size-3.5 text-white/50"
              />
            </span>
          </MenuButton>

          <MenuItems
            transition
            className="absolute left-0 right-0 z-50 mt-1 rounded-md bg-obsidianSurface outline-1 -outline-offset-1 outline-white/10 will-change-transform transition data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            <div className="py-1">
              {Array.isArray(optionList) &&
                optionList.map((option, index) => (
                  <MenuItem key={index}>
                    <button
                      onClick={() => handleSelect(option)}
                      className="block w-full px-3 py-1.5 text-left text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                    >
                      {option}
                    </button>
                  </MenuItem>
                ))}
            </div>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}

// import React from "react";
// import clsx from "clsx";
// import {
//   LockClosedIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline";

// const InputField = ({
//   id,
//   label,
//   type = "text",
//   name,
//   placeholder = "",
//   required = false,
//   autoComplete = "off",
//   className,
//   inputText,
//   value = "",
//   isRequired = false,
//   fieldLocked = false,
//   showSearch = false,
//   onSearchClick,
// }) => {
//   return (
//     <div className={`${className}`}>
//       <label
//         htmlFor={id}
//         className="flex flex-row gap-1 items-center text-left text-sm/6 font-light text-white"
//       >
//         {label}
//         {isRequired && <span className="text-red-500">*</span>}
//         {fieldLocked && <LockClosedIcon className="size-3 text-white/50" />}
//       </label>
//       <div className="mt-0.5 relative flex items-center">
//         <input
//           id={id}
//           type={type}
//           name={name}
//           placeholder={placeholder}
//           required={required}
//           autoComplete={autoComplete}
//           className={clsx(
//             "block w-full rounded-md bg-white/5 px-3 py-1 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue sm:text-sm/6",
//             showSearch && "pr-8",
//             inputText
//           )}
//           value={value}
//         />
//         {showSearch && (
//           <MagnifyingGlassIcon
//             onClick={onSearchClick}
//             className="absolute right-2.5 size-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default InputField;

import React from "react";
import clsx from "clsx";
import {
  LockClosedIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const InputField = ({
  id,
  label,
  type = "text",
  name,
  placeholder = "",
  required = false,
  autoComplete = "off",
  className,
  inputText,
  value,
  defaultValue,
  onChange,
  onClick,
  isRequired = false,
  fieldLocked = false,
  showSearch = false,
  onSearchClick,
  readOnly = false,
}) => {
  // Build controlled vs uncontrolled props
  const inputProps =
    onChange || value !== undefined
      ? { value: value ?? "", onChange }
      : { defaultValue };

  return (
    <div className={`${className}`}>
      <label
        htmlFor={id}
        className="flex flex-row gap-1 items-center text-left text-sm/6 font-light text-white"
      >
        {label}
        {isRequired && <span className="text-red-500">*</span>}
        {fieldLocked && <LockClosedIcon className="size-3 text-white/50" />}
      </label>
      <div className="mt-0.5 relative flex items-center">
        <input
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          onClick={onClick}
          className={clsx(
            "block w-full rounded-md bg-white/5 px-3 py-1 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue sm:text-sm/6",
            showSearch && "pr-8",
            readOnly && "cursor-default select-none",
            inputText
          )}
          {...inputProps}
        />
        {showSearch && (
          <MagnifyingGlassIcon
            onClick={onSearchClick}
            className="absolute right-2.5 size-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default InputField;

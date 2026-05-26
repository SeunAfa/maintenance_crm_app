import Dropdowns from "./Dropdowns";
import IssueCommandPalette from "./IssueCommandPalette";
import { CASE_STATUSES, PRIORITIES } from "../utils/constants";

// Terminal states are set by the system (Convert / Close actions), not manually picked
const SYSTEM_STATUSES = ["Converted", "Closed", "Cancelled"];
const AGENT_STATUSES  = CASE_STATUSES.filter((s) => !SYSTEM_STATUSES.includes(s));

export default function ServiceCategoryPriority({ className = "", caseItem, fields, setFields, lockStatus = false, isLocked = false, lockCategory = false, woMode = false, errors = {} }) {
  const handleDropdownChange = (key) => (val) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };
  const lockedCategory = woMode ? (lockCategory || isLocked) : (lockCategory || isLocked || caseItem?.case_status === "Converted");
  const lockedPriority = isLocked;

  return (
    <>
      {/*  w-1/2  */}

      <div
        className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col ${className} ${(errors.priority || errors.serviceCategory) ? "ring-1 ring-red-500/40" : ""}`}
      >
        {/* Header */}
        <div className="pb-1 flex items-center justify-between">
          <h2 className="text-sm sm:text-sm text-left font-bold leading-6 text-white truncate">
            Service Category & Priority
          </h2>
          {(errors.priority || errors.serviceCategory) && (
            <span className="text-[10px] text-red-400 font-medium shrink-0">
              {[errors.serviceCategory && "Category", errors.priority && "Priority"].filter(Boolean).join(" & ")} required
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <IssueCommandPalette
            defaultValue={fields.ServiceCategory}
            disabled={lockedCategory}
            isRequired={true}
            onSelect={(issue) =>
              setFields((prev) => ({ ...prev, ServiceCategory: issue }))
            }
          />

          <div className="w-full flex flex-col sm:flex-row gap-2 mt-2">
            <Dropdowns
              optionList={AGENT_STATUSES}
              defaultValue={fields.case_status}
              label="Case Status"
              optionPlaceholder="Select case status"
              dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
              showLabel={true}
              className="w-full"
              isRequired={true}
              disabled={lockedCategory || lockStatus}
              onChange={handleDropdownChange("case_status")}
            />

            <Dropdowns
              optionList={PRIORITIES}
              defaultValue={fields.priority}
              label="Priority"
              optionPlaceholder="Select priority"
              dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
              showLabel={true}
              className="w-full"
              isRequired={true}
              disabled={lockedPriority}
              onChange={handleDropdownChange("priority")}
            />
          </div>
        </div>
      </div>
    </>
  );
}

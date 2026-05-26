import InputField from "./InputField";
import Dropdowns from "./Dropdowns";
import {
  CAMPUSES,
  CAMPUS_BUILDINGS,
  BLOCKS,
  FLOORS,
  FLATS,
  ROOMS,
} from "../utils/constants";
// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – LocationForm
// ─────────────────────────────────────────────────────────────────────────────
const BUILDINGS_FLAT = CAMPUS_BUILDINGS.flatMap((c) => c.building);

export default function LocationForm({ caseItem, className = "", fields, setFields, isLocked = false, woMode = false }) {
  const locked = woMode ? isLocked : (isLocked || caseItem?.case_status === "Converted");
  const handleDropdownChange = (key) => (val) =>
    setFields((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      className={`w-full px-3 py-3 rounded-lg bg-obsidianNight/40 flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="pb-1 flex items-center justify-between">
        <h2 className="text-sm sm:text-sm text-left font-bold leading-6 text-white truncate ">
          Location
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
        <Dropdowns
          optionList={CAMPUSES}
          defaultValue={fields.campus}
          label="Campus"
          optionPlaceholder="Select campus"
          dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
          showLabel={true}
          className="w-full"
          isRequired={true}
          disabled={locked}
          onChange={handleDropdownChange("campus")}
        />
        <Dropdowns
          optionList={BUILDINGS_FLAT}
          defaultValue={fields.building}
          label="Building"
          optionPlaceholder="Select building"
          dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
          showLabel={true}
          className="w-full"
          isRequired={true}
          disabled={locked}
          onChange={handleDropdownChange("building")}
        />
        <Dropdowns
          optionList={BLOCKS}
          defaultValue={fields.block}
          label="Block"
          optionPlaceholder="Select block"
          dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
          showLabel={true}
          className="w-full"
          isRequired={true}
          disabled={locked}
          onChange={handleDropdownChange("block")}
        />
        <Dropdowns
          optionList={FLOORS}
          defaultValue={fields.floor}
          label="Floor"
          optionPlaceholder="Select floor"
          dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
          showLabel={true}
          className="w-full"
          isRequired={false}
          disabled={locked}
          onChange={handleDropdownChange("floor")}
        />
        <Dropdowns
          optionList={FLATS}
          defaultValue={fields.flat}
          label="Flat"
          optionPlaceholder="Select flat"
          dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
          showLabel={true}
          className="w-full"
          isRequired={false}
          disabled={locked}
          onChange={handleDropdownChange("flat")}
        />
        <Dropdowns
          optionList={ROOMS}
          defaultValue={fields.room}
          label="Room"
          optionPlaceholder="Select room"
          dropdownBtnCls="bg-white/5 outline-white/10 px-3 py-1"
          showLabel={true}
          className="w-full"
          isRequired={false}
          disabled={locked}
          onChange={handleDropdownChange("room")}
        />
      </div>
    </div>
  );
}

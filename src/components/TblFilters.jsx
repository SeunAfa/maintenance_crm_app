import SearchBar from "./SearchBar";
import Dropdowns from "./Dropdowns";

export default function TblFilters({ filterOptions1, filterOptions2 }) {
  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Search + Dropdowns group */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:flex-1">
        {/* SearchBar: full width on mobile, capped on larger screens */}
        <div className="w-full sm:flex-1 sm:max-w-xs">
          <SearchBar onSearch={(value) => console.log(value)} />
        </div>

        {/* Dropdowns: side by side on all sizes */}
        {/* <div className="flex flex-row items-center gap-3 sm:gap-4"> */}
        <Dropdowns
          optionList={filterOptions1}
          dropdownBtnCls="bg-obsidianNight/60 px-3 py-2"
          optionPlaceholder="Communication"
        />
        <Dropdowns
          optionList={filterOptions2}
          dropdownBtnCls="bg-obsidianNight/60 px-3 py-2"
          optionPlaceholder="Case Status"
        />
        {/* </div> */}
      </div>

      {/* Results count: left-aligned on mobile, right on larger screens */}
      <p className="text-xs font-medium text-electricBlue whitespace-nowrap self-start sm:self-auto">
        245 Cases found
      </p>
    </div>
  );
}

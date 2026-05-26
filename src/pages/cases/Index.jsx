import { useState } from "react";
import { useCases } from "../../context/CasesContext";
import SectionHeading from "../../components/SectionHeading";
import CasesTbl from "../../components/CasesTbl";
import Dropdowns from "../../components/Dropdowns";
import SearchBar from "../../components/SearchBar";
import CaseTabsHeader from "../../components/CaseTabsHeader";

const SOURCE_OPTIONS  = ["All Sources",  "Phone", "Email", "WhatsApp", "Web Portal"];
const STATUS_OPTIONS  = ["All Statuses", "New", "In Review", "Converted", "Closed"];

export default function Index() {
  const { cases } = useCases();
  const [source, setSource] = useState("All Sources");
  const [status, setStatus] = useState("All Statuses");
  const [query,  setQuery]  = useState("");

  const filter = { source, status, query };

  const count = cases.filter((c) => {
    if (source !== "All Sources"  && c.source      !== source) return false;
    if (status !== "All Statuses" && c.case_status !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (c.caseId ?? "").toLowerCase().includes(q) ||
        (c.title  ?? "").toLowerCase().includes(q) ||
        (c.requester?.displayName ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  }).length;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <CaseTabsHeader />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 min-h-0">
        <SectionHeading
          title="Cases"
          description="Manage incoming cases from Phone, Email, WhatsApp, and Web Portal."
          isDescriptionHidden={false}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[180px] max-w-xs">
            <SearchBar onSearch={setQuery} />
          </div>
          <Dropdowns
            optionList={SOURCE_OPTIONS}
            defaultValue={source}
            onChange={setSource}
            dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
            optionPlaceholder="All Sources"
            className="w-44"
          />
          <Dropdowns
            optionList={STATUS_OPTIONS}
            defaultValue={status}
            onChange={setStatus}
            dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
            optionPlaceholder="All Statuses"
            className="w-44"
          />
          <p className="ml-auto text-xs font-medium text-electricBlue whitespace-nowrap">
            {count} {count === 1 ? "case" : "cases"} found
          </p>
        </div>

        <CasesTbl filter={filter} />
      </div>
    </div>
  );
}

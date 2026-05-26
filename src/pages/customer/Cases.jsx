import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GlobeAltIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  PhoneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";
import { useCurrentCustomer } from "./CustomerLayout";
import SearchBar from "../../components/SearchBar";
import Dropdowns from "../../components/Dropdowns";
import Pagination from "../../components/Pagination";
import { customerCaseStatus } from "../../utils/customerStatus";

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  "All Statuses",
  "Received",
  "Engineer assigned",
  "Work in progress",
  "Waiting for parts",
  "Work resumed",
  "Completed",
  "Cancelled",
];

const SOURCE_CONFIG = {
  Phone:       { Icon: PhoneIcon,                  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  Email:       { Icon: EnvelopeIcon,               color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  WhatsApp:    { Icon: ChatBubbleLeftEllipsisIcon, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Web Portal":{ Icon: GlobeAltIcon,               color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function Cases() {
  const { cases } = useCases();
  const customer  = useCurrentCustomer();
  const [status, setStatus] = useState("All Statuses");
  const [query,  setQuery]  = useState("");

  // Scope to the logged-in customer's own cases only
  const myCases = useMemo(
    () => cases.filter((c) => c.requester?.displayName === customer.displayName),
    [cases, customer.displayName]
  );

  const filtered = useMemo(() => myCases.filter((c) => {
    if (status !== "All Statuses" && customerCaseStatus(c).label !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (c.caseId ?? "").toLowerCase().includes(q) ||
        (c.title  ?? "").toLowerCase().includes(q) ||
        (c.workOrderNumber ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  }), [myCases, status, query]);

  const count = filtered.length;

  // Pagination — shared between the mobile card view and the desktop table
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="border-b border-white/10 pb-5 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white text-left">My Cases</h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-400 text-left">
              Every request you've raised, in one place.
            </p>
          </div>
          <Link
            to="/customer/cases/new"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-electricBlue text-white text-xs font-semibold hover:bg-electricBlue/85 transition-colors shadow-lg shadow-electricBlue/20"
          >
            <PlusIcon className="size-4" />
            New case
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[180px] max-w-xs">
          <SearchBar
            placeholder="Search by case number…"
            onSearch={setQuery}
          />
        </div>
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

      {/* Mobile card list — shown below sm */}
      <div className="flex flex-col gap-2 md:hidden">
        {paged.length === 0 ? (
          <p className="text-center text-sm text-white/25 py-10">No cases found</p>
        ) : paged.map((c) => {
          const src       = SOURCE_CONFIG[c.source];
          const detailUrl = `/customer/cases/${c.id}`;
          const cust      = customerCaseStatus(c);
          return (
            <Link
              key={c.id}
              to={detailUrl}
              className="flex flex-col gap-2 p-3 rounded-lg bg-obsidianNight/40 ring-1 ring-white/[0.04] hover:bg-obsidianNight transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-electricBlue shrink-0">{c.caseId}</span>
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cust.tone}`}>
                  {cust.label}
                </span>
              </div>
              <p className="text-sm text-white truncate">
                {c.title || <span className="italic text-white/25">Untitled</span>}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                {src && (
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${src.bg} ${src.color} ${src.border} border`}>
                    <src.Icon className="size-2.5" />
                    {c.source}
                  </span>
                )}
                <span>{fmtDate(c.createdAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Table — shown from md up */}
      <div className="hidden md:block rounded-lg overflow-hidden border border-obsidianHighlight">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-obsidianHighlight">
            <thead className="bg-obsidianNight/60">
              <tr>
                {["Case ID", "Title", "Source", "Status", "Created", "Last Update", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-obsidianHighlight bg-obsidianSurface">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/25">
                    No cases found
                  </td>
                </tr>
              ) : paged.map((c) => {
                const src       = SOURCE_CONFIG[c.source];
                const detailUrl = `/customer/cases/${c.id}`;
                const lastIso   = c.updatedAt ?? c.createdAt;
                const cust      = customerCaseStatus(c);
                return (
                  <tr key={c.id} className="hover:bg-obsidianHighlight/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-electricBlue">{c.caseId}</span>
                    </td>

                    <td className="px-4 py-3 max-w-[260px]">
                      <span className="text-xs text-white truncate block">
                        {c.title || <span className="italic text-white/25">Untitled</span>}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {src ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${src.bg} ${src.color} ${src.border}`}>
                          <src.Icon className="size-3 shrink-0" />
                          {c.source}
                        </span>
                      ) : (
                        <span className="text-white/25 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cust.tone}`}>
                        {cust.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-white/40">{fmtDate(c.createdAt)}</span>
                      <span className="block text-[10px] text-white/25">{fmtTime(c.createdAt)}</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-white/60">{fmtDate(lastIso)}</span>
                      <span className="block text-[10px] text-white/30">{fmtTime(lastIso)}</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={detailUrl}
                        className="text-xs font-medium text-electricBlue hover:text-electricBlue/70 transition-colors"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared pagination — drives both mobile cards and desktop table */}
      {filtered.length > 0 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            perPage={PER_PAGE}
            onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
          />
        </div>
      )}
    </div>
  );
}

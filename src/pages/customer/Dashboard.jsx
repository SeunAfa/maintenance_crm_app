import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";
import { useCurrentCustomer } from "./CustomerLayout";
import { customerCaseStatus } from "../../utils/customerStatus";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ icon: Icon, label, value, tone = "text-white" }) {
  return (
    <div className="rounded-2xl bg-obsidianNight/60 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className="size-10 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="size-5 text-white/40" />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold leading-none ${tone}`}>{value}</p>
        <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function CaseRow({ caseItem }) {
  const { label: status, tone } = customerCaseStatus(caseItem);

  return (
    <Link
      to={`/customer/cases/${caseItem.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-obsidianNight/60 hover:bg-obsidianNight transition-colors group"
    >
      <div className="size-9 rounded-lg bg-electricBlue/10 flex items-center justify-center shrink-0">
        <BriefcaseIcon className="size-4 text-electricBlue" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{caseItem.title || caseItem.caseId}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-electricBlue">{caseItem.caseId}</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] text-white/35">{fmtDate(caseItem.updatedAt ?? caseItem.createdAt)}</span>
        </div>
      </div>
      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${tone}`}>
        {status}
      </span>
      <ArrowRightIcon className="size-4 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
    </Link>
  );
}

export default function Dashboard() {
  const { cases } = useCases();
  const customer  = useCurrentCustomer();

  const myCases = useMemo(
    () => cases.filter((c) => c.requester?.displayName === customer.displayName),
    [cases, customer.displayName]
  );

  const recent = myCases.slice().sort((a, b) =>
    new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt)
  ).slice(0, 5);

  // Case-only stats — no work-order chatter
  const open       = myCases.filter((c) => !["Closed", "Cancelled"].includes(c.case_status) && c.workOrderStatus !== "Completed").length;
  const inProgress = myCases.filter((c) => c.workOrderNumber && !["Completed", "Cancelled"].includes(c.workOrderStatus ?? "")).length;
  const completed  = myCases.filter((c) => c.workOrderStatus === "Completed").length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Greeting */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Welcome back</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{customer.firstName ?? customer.displayName.split(" ")[0]}</h1>
        </div>
        <Link
          to="/customer/cases/new"
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-electricBlue text-white text-xs font-semibold hover:bg-electricBlue/85 transition-colors shadow-lg shadow-electricBlue/20"
        >
          <PlusIcon className="size-4" />
          New case
        </Link>
      </header>

      {/* Stats — case-only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={BriefcaseIcon}   label="Open cases"        value={open}       tone="text-white" />
        <StatCard icon={ChartBarIcon}    label="In progress"        value={inProgress} tone="text-amber-300" />
        <StatCard icon={CheckCircleIcon} label="Completed"          value={completed}  tone="text-emerald-300" />
      </div>

      {/* Recent cases */}
      <section className="rounded-2xl bg-obsidianSurface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent cases</h2>
          <Link to="/customer/cases" className="text-[11px] text-electricBlue hover:text-electricBlue/80 font-medium">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10">
            <ClockIcon className="size-10 text-white/10 mx-auto" />
            <p className="text-sm text-white/40 mt-3">No cases yet</p>
            <Link
              to="/customer/cases/new"
              className="inline-flex items-center gap-1.5 mt-4 text-xs text-electricBlue hover:text-electricBlue/80 font-semibold"
            >
              Raise your first case <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((c) => <CaseRow key={c.id} caseItem={c} />)}
          </div>
        )}
      </section>
    </div>
  );
}

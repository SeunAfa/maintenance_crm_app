import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";
import { useCurrentCustomer } from "./CustomerLayout";

// Friendly customer-facing status (no internal WO chatter)
function friendlyStatus(c) {
  if (c.case_status === "Cancelled")     return { label: "Cancelled",        tone: "bg-red-400/10 text-red-300"          };
  if (c.workOrderStatus === "Completed") return { label: "Completed",        tone: "bg-emerald-400/10 text-emerald-300"  };
  if (c.workOrderNumber)                 return { label: "Work in progress", tone: "bg-violet-400/10 text-violet-300"    };
  if (c.case_status === "New")           return { label: "Received",         tone: "bg-electricBlue/10 text-electricBlue"};
  return                                   { label: "Under review",         tone: "bg-amber-400/10 text-amber-300"      };
}

export default function Tracking() {
  const { cases } = useCases();
  const customer  = useCurrentCustomer();
  const navigate  = useNavigate();
  const [q, setQ] = useState("");

  // The customer's own active cases — use as quick-jump tiles
  const myCases = useMemo(
    () => cases
      .filter((c) => c.requester?.displayName === customer.displayName)
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0) - new Date(a.updatedAt ?? a.createdAt ?? 0)),
    [cases, customer.displayName]
  );

  const submit = (e) => {
    e.preventDefault();
    const ref = q.trim().toUpperCase();
    if (!ref) return;
    const caseId = ref.startsWith("CASE-") ? ref : `CASE-${ref}`;
    navigate(`/track/${caseId}`);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Track a case</h1>
        <p className="text-xs text-white/40 mt-1">Enter a case reference (e.g. <span className="font-mono text-white/60">CASE-001</span>) or pick one of yours below.</p>
      </header>

      {/* Search box */}
      <form onSubmit={submit} className="rounded-2xl bg-obsidianSurface p-5">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="CASE-XXX"
            className="w-full bg-white/[0.04] rounded-xl pl-12 pr-32 py-3.5 text-base font-mono text-white placeholder:text-white/30 outline-none focus:bg-white/[0.07] transition-colors uppercase"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-electricBlue text-white text-xs font-semibold hover:bg-electricBlue/85 transition-colors"
          >
            Track
          </button>
        </div>
      </form>

      {/* My active cases */}
      <section>
        <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-3">
          Your cases
        </h2>

        {myCases.length === 0 ? (
          <div className="rounded-2xl bg-obsidianNight/60 p-10 text-center">
            <BriefcaseIcon className="size-10 text-white/10 mx-auto" />
            <p className="text-sm text-white/40 mt-3">No cases yet</p>
            <Link
              to="/customer/cases/new"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-electricBlue hover:text-electricBlue/80 font-semibold"
            >
              Raise a new request <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myCases.map((c) => {
              const status = friendlyStatus(c);
              return (
                <Link
                  key={c.id}
                  to={`/track/${c.caseId}`}
                  className="rounded-xl bg-obsidianNight/60 hover:bg-obsidianNight p-4 flex flex-col gap-3 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-electricBlue">{c.caseId}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-white truncate">{c.title}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <span className="text-[10px] text-white/35">
                      {c.location?.building ?? "—"}
                      {c.location?.block && ` · Block ${c.location.block}`}
                    </span>
                    <ArrowRightIcon className="size-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

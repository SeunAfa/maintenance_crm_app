import KpiCards from "../../components/KpiCard";
import CasesVsWOChart from "../../components/CasesVsWOChart";
import SupportChannels from "../../components/SupportChannels";
import MyPerformance from "../../components/MyPerformance";
import RecentActivity from "../../components/RecentActivity";
import SLADeadlines from "../../components/SLADeadlines";
import RecentWO from "../../components/RecentWO";
import { CURRENT_AGENT } from "../../data/usersData";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function fmtToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day:     "2-digit",
    month:   "long",
    year:    "numeric",
  });
}

export default function Dashboard() {
  const firstName = (CURRENT_AGENT ?? "").split(" ")[0];

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      {/* Greeting header */}
      <header className="pb-4 sm:pb-5 border-b border-white/8">
        <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest truncate">
          {fmtToday()}
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
          {greeting()}, <span className="text-electricBlue">{firstName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/45 mt-1">
          Here's how the helpdesk is performing right now.
        </p>
      </header>

      {/* Live KPI strip */}
      <KpiCards />

      {/* Primary row — chart + support channels */}
      <div className="grid lg:grid-cols-10 gap-5">
        <CasesVsWOChart className="lg:col-span-6 xl:col-span-7" />
        <SupportChannels className="lg:col-span-4 xl:col-span-3 sm:w-full" />
      </div>

      {/* Performance band */}
      <MyPerformance className="w-full h-96" />

      {/* SLA + Recent activity */}
      <div className="grid md:grid-cols-10 gap-5">
        <SLADeadlines  className="md:col-span-5" />
        <RecentActivity className="md:col-span-5" />
      </div>

      {/* Recent work orders */}
      <RecentWO />
    </div>
  );
}

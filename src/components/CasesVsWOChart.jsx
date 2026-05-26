import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Dropdown from "./Dropdowns";
import { useCases } from "../context/CasesContext";

const TIME_OPTIONS = [
  { label: "This week",   days: 7  },
  { label: "Last 30 days", days: 30 },
];

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function fmtDayShort(d) {
  return DAY_SHORT[d.getDay()];
}
function fmtDayDate(d) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function buildSeries(cases, days) {
  const now    = new Date();
  const cutoff = new Date(now); cutoff.setHours(0, 0, 0, 0); cutoff.setDate(cutoff.getDate() - (days - 1));

  // Bucket per day
  const buckets = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff); d.setDate(cutoff.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { day: days <= 7 ? fmtDayShort(d) : fmtDayDate(d), opened: 0, resolved: 0 });
  }

  cases.forEach((c) => {
    if (c.createdAt) {
      const k = new Date(c.createdAt).toISOString().slice(0, 10);
      if (buckets.has(k)) buckets.get(k).opened += 1;
    }
    if (c.completedAt) {
      const k = new Date(c.completedAt).toISOString().slice(0, 10);
      if (buckets.has(k)) buckets.get(k).resolved += 1;
    }
  });

  return [...buckets.values()];
}

export default function CasesVsWOChart({
  className = "",
  graphHeight = "240",
}) {
  const { cases } = useCases();
  const [range,  setRange]  = useState(TIME_OPTIONS[0].label);

  const data = useMemo(() => {
    const opt = TIME_OPTIONS.find((o) => o.label === range) ?? TIME_OPTIONS[0];
    return buildSeries(cases, opt.days);
  }, [cases, range]);

  const totals = useMemo(() => data.reduce(
    (acc, d) => ({ opened: acc.opened + d.opened, resolved: acc.resolved + d.resolved }),
    { opened: 0, resolved: 0 }
  ), [data]);

  return (
    <div className={`divide-y divide-white/10 overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 ${className}`}>
      <div className="px-5 flex items-center justify-between bg-obsidianNight/60 h-[60px]">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold text-white text-left truncate">
            Cases Vs Work Orders
          </h3>
          <span className="hidden md:inline-flex items-center gap-3 text-[11px] text-white/45">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-400" /> {totals.opened} opened</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> {totals.resolved} completed</span>
          </span>
        </div>

        <Dropdown
          optionList={TIME_OPTIONS.map((o) => o.label)}
          defaultValue={range}
          onChange={(v) => setRange(v ?? TIME_OPTIONS[0].label)}
          dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
          optionPlaceholder="This week"
          className="w-40"
        />
      </div>

      <div className="px-5 py-4 flex justify-center bg-obsidianNight/50">
        <ResponsiveContainer width="100%" height={graphHeight}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(217, 91%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis dataKey="day"    axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 13% 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="opened"   stroke="hsl(217, 91%, 50%)" fill="url(#openedGrad)"   strokeWidth={2} name="Opened" />
            <Area type="monotone" dataKey="resolved" stroke="hsl(142, 71%, 45%)" fill="url(#resolvedGrad)" strokeWidth={2} name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

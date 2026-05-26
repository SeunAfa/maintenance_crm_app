import { useMemo } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import ProgressBar from "./ProgressBar";
import { useCases } from "../context/CasesContext";

const CHANNEL_META = {
  Email:        { icon: EnvelopeIcon,                       color: "text-blue-300"    },
  Phone:        { icon: PhoneIcon,                          color: "text-emerald-300" },
  WhatsApp:     { icon: ChatBubbleBottomCenterTextIcon,     color: "text-green-300"   },
  "Web Portal": { icon: GlobeAltIcon,                       color: "text-violet-300"  },
};

export default function SupportChannels({ className = "" }) {
  const { cases } = useCases();

  const channels = useMemo(() => {
    const order = ["Email", "Phone", "WhatsApp", "Web Portal"];
    const active = order.map((name) => ({
      name,
      count: cases.filter(
        (c) =>
          c.source === name &&
          !["Closed", "Cancelled"].includes(c.case_status ?? "") &&
          c.workOrderStatus !== "Completed"
      ).length,
    }));
    const total = active.reduce((acc, c) => acc + c.count, 0) || 1;
    return active.map((c) => ({
      ...c,
      pct: Math.round((c.count / total) * 100),
      icon: CHANNEL_META[c.name].icon,
      color: CHANNEL_META[c.name].color,
    }));
  }, [cases]);

  const totalActive = channels.reduce((acc, c) => acc + c.count, 0);

  return (
    <div
      className={`divide-y divide-white/10 overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 w-full h-full flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="px-5 flex items-center justify-between bg-obsidianNight/60 h-[60px]">
        <h3 className="text-sm sm:text-base text-left font-semibold leading-6 text-white truncate mr-4">
          Support Channels
        </h3>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
          {totalActive} active
        </span>
      </div>

      {/* Channel list */}
      <div className="px-5 py-4 bg-obsidianNight/50 flex flex-col gap-3 sm:gap-4 flex-1 justify-center">
        {channels.map((c) => (
          <div key={c.name} className="flex items-center gap-3 sm:gap-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
              <c.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${c.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium text-white truncate">
                  {c.name}
                </p>
                <span className="text-[10px] sm:text-xs text-white/60 flex-shrink-0 whitespace-nowrap">
                  {c.count} active
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                <div className="flex-1 min-w-0">
                  <ProgressBar value={c.pct} height={8} />
                </div>
                <span className="text-[10px] sm:text-xs text-electricBlue font-medium flex-shrink-0 w-8 text-right">
                  {c.pct}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

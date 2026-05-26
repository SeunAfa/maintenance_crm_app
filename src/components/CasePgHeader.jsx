import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  SaveAll,
  Share2,
  RotateCw,
  Copy,
  X,
  FileCog,
  PhoneOutgoing,
} from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import IconButton from "./IconButton";
import GhostButton from "./GhostButton";
import PrimaryButton from "./PrimaryButton";
import AccentButton from "./AccentButton";
import Divider from "./Divider";
import TabItem from "./TabItem";
import CaseProgressBar from "./CaseProgressBar";

// ─── Blur placeholder ─────────────────────────────────────────────────────────
// Static placeholder — no animation. Continuous animations here caused paint
// jank during scroll and made the SLA timer area appear to shift.
function BlurBlock({ value }) {
  if (value)
    return <span className="text-xs text-white/80 text-left">{value}</span>;
  return <span className="text-xs text-white/25 text-left">—</span>;
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── SLA helpers ──────────────────────────────────────────────────────────────
const SLA_MINUTES = {
  Critical: { respond: 30,       resolve: 24 * 60 },
  Urgent:   { respond: 45,       resolve: 36 * 60 },
  High:     { respond: 60,       resolve: 48 * 60 },
  Medium:   { respond: 4 * 60,   resolve: 72 * 60 },
  Low:      { respond: 8 * 60,   resolve: 96 * 60 },
};

function computeDeadline(createdAtISO, minutes) {
  if (!createdAtISO || !minutes) return null;
  return new Date(new Date(createdAtISO).getTime() + minutes * 60_000);
}

function fmtDeadline(date) {
  if (!date) return null;
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isToday = d.getTime() === today.getTime();

  const hh  = String(date.getHours()).padStart(2, "0");
  const mm  = String(date.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;

  if (isToday) return `${time} Today`;

  const dd   = String(date.getDate()).padStart(2, "0");
  const mo   = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${time} ${dd}/${mo}/${yyyy}`;
}

function useSlaDeadlines(caseItem) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // SLA only starts once a work order has been generated.
  const hasWorkOrder = !!(caseItem?.workOrderNumber || caseItem?.workOrderId);
  if (!hasWorkOrder) return { respondBy: null, resolveBy: null };

  const sla        = SLA_MINUTES[caseItem?.priority] ?? null;
  const createdAt  = caseItem?.workOrderCreatedAt ?? null;
  const respondBy  = fmtDeadline(computeDeadline(createdAt, sla?.respond));
  const resolveBy  = fmtDeadline(computeDeadline(createdAt, sla?.resolve));
  return { respondBy, resolveBy };
}

// ─────────────────────────────────────────────────────────────────────────────

const defaultLinks = [
  { name: "Cases", href: "#" },
  { name: "Case Details", href: "#", current: true },
];

const TAB_NAMES = ["Summary", "SLA Controls", "Notes", "Related"];

export default function CasePgHeader({ caseItem, fields, step, onStepChange, activeTab = "Summary", onTabChange }) {
  const tabs = TAB_NAMES.map((name) => ({ name, href: "#", current: name === activeTab }));
  const [editing, setEditing] = useState(false);
  const { respondBy, resolveBy } = useSlaDeadlines(caseItem);
  const hasWorkOrder = !!(caseItem?.workOrderNumber || caseItem?.workOrderId);

  return (
    <>
      <div className="px-3 py-2 flex flex-col gap-2 w-full rounded-lg bg-obsidianNight/40">
        {/* Title & metadata */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-white text-lg sm:text-xl lg:text-2xl truncate max-w-full lg:max-w-xs">
            {caseItem?.title || "New Case"}
          </h1>

          <div className="flex flex-row flex-wrap items-center gap-4">
            {/* SLA deadlines only appear once a work order has been generated */}
            {hasWorkOrder && (
              <>
                <div className="flex flex-col gap-1">
                  <BlurBlock value={respondBy} />
                  <p className="text-xs text-white/40 text-left">
                    First response failure time
                  </p>
                </div>
                <Divider className="h-8" />

                <div className="flex flex-col gap-1">
                  <BlurBlock value={resolveBy} />
                  <p className="text-xs text-white/40 text-left">
                    Resolved by failure time
                  </p>
                </div>
                <Divider className="h-8" />
              </>
            )}

            <div className="flex flex-col gap-1">
              {(caseItem.workOrderNumber ?? caseItem.workOrderId) ? (
                <Link
                  to={`/admin/workorders/${caseItem.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-2 transition-colors"
                >
                  {caseItem.workOrderNumber ?? caseItem.workOrderId}
                </Link>
              ) : (
                <BlurBlock value={null} />
              )}
              <p className="text-xs text-white/40 text-left">Work Order</p>
            </div>
            <Divider className="h-8" />

            <div className="flex flex-col gap-1">
              <BlurBlock
                value={fmtDate(caseItem.updatedAt ?? caseItem.createdAt)}
              />
              <p className="text-xs text-white/40 text-left">Last Update</p>
            </div>
            <Divider className="h-8" />

            <div className="flex flex-col gap-1">
              <BlurBlock value={caseItem.createdBy} />
              <p className="text-xs text-white/40 text-left">Created by</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <CaseProgressBar caseItem={caseItem} fields={fields} step={step} onStepChange={onStepChange} />

        {/* Tabs */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabItem tabs={tabs} onTabChange={onTabChange} />
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-xs text-white/40 text-left">Case Status</p>
            <span className="inline-flex items-center rounded-full bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 inset-ring inset-ring-gray-400/20">
              {caseItem.case_status}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

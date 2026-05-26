import { useState, useRef, useEffect } from "react";
import { useCases } from "../context/CasesContext";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const QUALIFY_FIELDS = [
  "affectedRequester",
  "description",
  "requestTypes",
  "source",
  "contractType",
  "case_status",
  "priority",
  "ServiceCategory",
];

// Friendly labels for missing-field tooltips
const FIELD_LABELS = {
  affectedRequester: "Affected requester",
  description:       "Description",
  requestTypes:      "Request type",
  source:            "Source",
  contractType:      "Contract",
  case_status:       "Case status",
  priority:          "Priority",
  ServiceCategory:   "Service category",
};

function isFieldFilled(value) {
  if (value == null) return false;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return String(value).trim() !== "";
}

function isQualified(fields) {
  return QUALIFY_FIELDS.every((k) => isFieldFilled(fields[k]));
}

function missingFields(fields) {
  return QUALIFY_FIELDS.filter((k) => !isFieldFilled(fields[k])).map((k) => FIELD_LABELS[k] ?? k);
}

function findDuplicates(cases, caseItem) {
  return cases.filter(
    (c) =>
      c.id !== caseItem.id &&
      c.requester?.displayName === caseItem.requester?.displayName &&
      c.requestTypes === caseItem.requestTypes
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ children, align = "center", onMouseEnter, onMouseLeave }) {
  const outerCls =
    align === "left"
      ? "left-0"
      : align === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  const arrowCls =
    align === "left"
      ? "left-3.5"
      : align === "right"
      ? "right-3.5"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute top-full z-[200] pt-3 w-60 ${outerCls}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`absolute top-1 border-4 border-transparent border-b-obsidianHighlight ${arrowCls}`} />
      <div className="w-full rounded-lg bg-obsidianElevated border border-obsidianHighlight px-3 py-2.5 shadow-2xl shadow-black/80">
        {children}
      </div>
    </div>
  );
}

// ─── Stage dot ────────────────────────────────────────────────────────────────
function StageDot({ state, index }) {
  const base = "size-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold";

  if (state === "done")
    return (
      <div className={`${base} bg-electricBlue`}>
        <CheckIcon className="size-3.5 text-white stroke-[2.5]" />
      </div>
    );

  if (state === "warning")
    return (
      <div className={`${base} bg-electricBlue`}>
        <ExclamationTriangleIcon className="size-3.5 text-white stroke-[2.5]" />
      </div>
    );

  if (state === "active")
    return (
      <div className="relative size-7 flex items-center justify-center shrink-0">
        <span className="absolute inset-[-4px] rounded-full ring-2 ring-electricBlue/30" />
        <div className={`${base} bg-electricBlue z-10`}>
          <span className="text-white">{index + 1}</span>
        </div>
      </div>
    );

  // "waiting" — not yet started, needs a save action to unlock
  if (state === "waiting")
    return (
      <div className={`${base} border-2 border-electricBlue/40 bg-transparent`}>
        <span className="text-electricBlue/50">{index + 1}</span>
      </div>
    );

  return (
    <div className={`${base} bg-obsidianHighlight`}>
      <span className="text-white/30">{index + 1}</span>
    </div>
  );
}

// ─── Connector ────────────────────────────────────────────────────────────────
function Connector({ filled }) {
  const colour = filled ? "bg-electricBlue" : "bg-obsidianHighlight";
  return (
    <div
      className={`flex-1 min-w-[24px] h-0.5 mx-2 mt-3.5 self-start ${colour} transition-all duration-300`}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CaseProgressBar({ caseItem, fields, step = 0, onStepChange }) {
  const { cases } = useCases();
  const [hoveredStep, setHoveredStep] = useState(null);
  const leaveTimerRef = useRef(null);
  const railRef       = useRef(null);
  const stageRefs     = useRef([]);

  // When the active step changes (or the rail mounts), scroll the active
  // stage into view on small screens. Centers it horizontally so the
  // surrounding stages stay partially visible as wayfinding context.
  useEffect(() => {
    const rail = railRef.current;
    const node = stageRefs.current[step];
    if (!rail || !node) return;
    const railRect = rail.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const target = nodeRect.left - railRect.left
      - rail.clientWidth / 2 + nodeRect.width / 2 + rail.scrollLeft;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [step]);

  const handleMouseEnter = (i) => {
    clearTimeout(leaveTimerRef.current);
    setHoveredStep(i);
  };

  const handleMouseLeave = () => {
    // Small delay so the tooltip stays alive while the mouse travels to it
    leaveTimerRef.current = setTimeout(() => setHoveredStep(null), 200);
  };

  const duplicates   = findDuplicates(cases, caseItem);
  const hasDuplicate = duplicates.length > 0;
  const qualified    = isQualified(fields);
  const hasWorkOrder = !!(caseItem.workOrderId || caseItem.workOrderNumber);

  // Stages are fully locked once the case reaches a terminal state
  const isStagesLocked = ["Cancelled", "Converted", "Closed"].includes(caseItem?.case_status);
  // workOrderNumber is stored with WO- prefix already
  const woLabel      = hasWorkOrder
    ? (caseItem.workOrderNumber ?? `WO-${caseItem.workOrderId}`)
    : null;

  const stages = [
    {
      key: "identify",
      label: "Identify",
      sublabel: step > 0 ? "Complete" : "Fill in case details",
      state: step > 0 ? "done" : "active",
      canAdvance: true,
      tooltip: {
        title: "Identify",
        body: step > 0
          ? "Case details have been logged. You can still save edits at any time."
          : "Fill in the case details — clicking the button below will save everything and move to the next stage.",
        action: step === 0 ? "Save & Check Duplicates" : null,
      },
    },
    {
      key: "duplicates",
      label: "Check Duplicates",
      sublabel: step < 1 ? "Complete Identify first" : hasDuplicate ? "Duplicate found" : "No duplicates found",
      state:
        step < 1
          ? "pending"
          : step > 1
          ? hasDuplicate ? "warning" : "done"
          : hasDuplicate ? "warning" : "active",
      canAdvance: true,
      tooltip: {
        title: "Check Duplicates",
        body: hasDuplicate
          ? "A similar case exists. Link it to the existing work order or dismiss to continue."
          : "No matching cases found for this requester and request type.",
        action: step === 1 ? "Save & Qualify" : null,
      },
    },
    {
      key: "qualify",
      label: "Qualify",
      sublabel: step < 2
        ? "Awaiting duplicates check"
        : qualified ? "All fields complete" : "Required fields missing",
      state: step < 2 ? "pending" : step > 2 ? "done" : "active",
      // Can only advance once every required field is filled in.
      canAdvance: qualified,
      tooltip: {
        title: "Qualify",
        body: step < 2
          ? "Complete the duplicate check first."
          : qualified
          ? "All fields verified. Clicking Next will save the case and move it to Action."
          : `Please complete the following before advancing: ${missingFields(fields).join(", ")}.`,
        action: step === 2 ? "Save & Move to Action" : null,
      },
    },
    {
      key: "action",
      label: "Action",
      sublabel: step < 3 ? "Awaiting qualification" : woLabel ?? "Convert to work order",
      state: step < 3 ? "pending" : hasWorkOrder ? "done" : "active",
      canAdvance: false,
      tooltip: {
        title: "Action",
        body: hasWorkOrder
          ? `Work order ${woLabel} has been generated and dispatched to the maintenance team.`
          : "Click 'Convert to Work Order' below to generate a work order number and dispatch.",
        action: null,
      },
    },
  ];

  const handleNext = () => {
    if (isStagesLocked) return;
    if (stages[step]?.canAdvance && step < stages.length - 1)
      onStepChange?.(step + 1);
  };

  return (
    <div className="w-full px-3 sm:px-5 py-4 rounded-lg bg-obsidianNight/40 overflow-visible">
      {/* Inline styles to hide the horizontal scrollbar on the mobile rail */}
      <style>{`
        .case-progress-rail::-webkit-scrollbar { display: none; }
        .case-progress-rail { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        ref={railRef}
        className="case-progress-rail flex items-start relative overflow-x-auto lg:overflow-visible -mx-3 px-3 py-2 sm:mx-0 sm:px-0 sm:py-0"
      >
        {stages.map((stage, i) => {
          const isHovered = hoveredStep === i;

          return (
            <div
              key={stage.key}
              ref={(el) => (stageRefs.current[i] = el)}
              data-active={i === step}
              className="flex items-start flex-1 last:flex-none min-w-[140px] sm:min-w-0"
            >
              <div
                className={`relative flex flex-col items-center gap-1.5 ${isStagesLocked ? "cursor-not-allowed" : "cursor-default"}`}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
              >
                {isHovered && (
                  <Tooltip align={i === 0 ? "left" : i === stages.length - 1 ? "right" : "center"}
                    onMouseEnter={() => clearTimeout(leaveTimerRef.current)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <p className="text-xs font-semibold text-white mb-1">{stage.tooltip.title}</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">{stage.tooltip.body}</p>

                    {stage.tooltip.action && !isStagesLocked && (
                      <div className="flex items-center mt-3 pt-2.5 border-t border-obsidianHighlight">
                        <button
                          onClick={handleNext}
                          disabled={!stage.canAdvance}
                          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ml-auto ${
                            stage.canAdvance
                              ? "bg-electricBlue text-white hover:bg-electricBlue/80"
                              : "bg-obsidianHighlight text-white/30 cursor-not-allowed"
                          }`}
                        >
                          {stage.tooltip.action}
                          <ChevronRightIcon className="size-3" />
                        </button>
                      </div>
                    )}

                    {isStagesLocked && (
                      <div className="mt-3 pt-2.5 border-t border-obsidianHighlight">
                        <p className="text-[10px] text-white/25 italic">
                          Case is {caseItem?.case_status?.toLowerCase()} — stages locked
                        </p>
                      </div>
                    )}
                  </Tooltip>
                )}

                <StageDot state={stage.state} index={i} />

                <span className={`max-w-[120px] sm:max-w-none text-[11px] font-medium text-center sm:whitespace-nowrap leading-tight ${
                  stage.state === "pending" || stage.state === "waiting" ? "text-white/30" : "text-white/80"
                }`}>
                  {stage.label}
                </span>

                <span className={`max-w-[120px] sm:max-w-none text-[10px] text-center sm:whitespace-nowrap leading-tight ${
                  stage.state === "pending" || stage.state === "waiting"
                    ? "text-white/20"
                    : "text-white/40"
                }`}>
                  {stage.sublabel}
                </span>
              </div>

              {i < stages.length - 1 && (
                <Connector filled={stage.state === "done" || stage.state === "warning"} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

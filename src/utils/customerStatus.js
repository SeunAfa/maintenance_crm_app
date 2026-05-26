// ─────────────────────────────────────────────────────────────────────────────
// Customer-facing status helper
//
// Maps the internal case_status / workOrderStatus pair to a single
// customer-friendly label + tone, matching the labels used on the public
// /track-case page. Used on every customer-facing surface (cases list,
// dashboard, profile, case detail) so the same case shows the same status
// everywhere.
// ─────────────────────────────────────────────────────────────────────────────

const STATUS = {
  CANCELLED:        { label: "Cancelled",         tone: "bg-red-400/10 text-red-300"          },
  COMPLETED:        { label: "Completed",         tone: "bg-emerald-400/10 text-emerald-300"  },
  WORK_RESUMED:     { label: "Work resumed",      tone: "bg-sky-400/10 text-sky-300"          },
  AWAITING_PARTS:   { label: "Waiting for parts", tone: "bg-orange-400/10 text-orange-300"    },
  IN_PROGRESS:      { label: "Work in progress",  tone: "bg-amber-400/10 text-amber-300"      },
  ASSIGNED:         { label: "Engineer assigned", tone: "bg-purple-400/10 text-purple-300"    },
  RECEIVED:         { label: "Received",          tone: "bg-electricBlue/10 text-electricBlue"},
};

export function customerCaseStatus(caseItem) {
  if (!caseItem) return STATUS.RECEIVED;
  if (caseItem.case_status === "Cancelled") return STATUS.CANCELLED;

  const wo = caseItem.workOrderStatus;
  if (wo === "Completed")                          return STATUS.COMPLETED;
  if (wo === "Final Response")                     return STATUS.WORK_RESUMED;
  if (wo === "Awaiting Parts")                     return STATUS.AWAITING_PARTS;
  if (wo === "In Progress" || wo === "Responded")  return STATUS.IN_PROGRESS;
  if (wo === "Acknowledged")                       return STATUS.ASSIGNED;

  // Dispatched or no work order yet → still "Received" from the customer's POV
  return STATUS.RECEIVED;
}

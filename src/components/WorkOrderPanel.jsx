import FormField from "./FormField";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – WorkOrderPanel
// ─────────────────────────────────────────────────────────────────────────────
export default function WorkOrderPanel({
  workOrder,
  channel,
  requester,
  onUpdate,
  onSave,
  onBack,
  saved,
  Icons,
  selectCls,
  CHANNEL_CONFIG,
  PRIORITIES,
  CATEGORIES,
  inputCls,
  priorityPillCls,
}) {
  const ch = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.portal;
  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
        <span className="text-emerald-600">
          <Icons.Sparkles size={15} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-emerald-800">
            AI autofill complete
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            Fields extracted from {ch.label} message. Review and edit before
            saving.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-emerald-400 hover:text-emerald-600 transition-colors"
        >
          <Icons.X size={14} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Work Order</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Review AI-extracted details before saving
          </p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
          Draft
        </span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Job Description
          </p>
          <textarea
            value={workOrder.jobDescription}
            onChange={(e) => onUpdate("jobDescription", e.target.value)}
            rows={3}
            className={inputCls + " resize-none leading-relaxed"}
          />
        </div>
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Classification
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Priority">
              <div className="relative">
                <select
                  value={workOrder.priority}
                  onChange={(e) => onUpdate("priority", e.target.value)}
                  className={selectCls}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Icons.ChevronDown />
                </span>
              </div>
              <span
                className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border mt-1.5 ${priorityPillCls(
                  workOrder.priority
                )}`}
              >
                {workOrder.priority}
              </span>
            </FormField>
            <FormField label="Category">
              <div className="relative">
                <select
                  value={workOrder.category}
                  onChange={(e) => onUpdate("category", e.target.value)}
                  className={selectCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Icons.ChevronDown />
                </span>
              </div>
            </FormField>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Location & Schedule
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Location">
              <input
                value={workOrder.location}
                onChange={(e) => onUpdate("location", e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="Est. Duration">
              <input
                value={workOrder.estimatedDuration}
                onChange={(e) => onUpdate("estimatedDuration", e.target.value)}
                className={inputCls}
              />
            </FormField>
          </div>
        </div>
        <div className={`px-5 py-3 flex items-center gap-2 ${ch.bg}`}>
          <span className={ch.color}>
            <ch.Icon size={13} />
          </span>
          <p className="text-[11px] text-slate-500">
            From <span className="font-medium">{ch.label}</span>
            {requester ? ` · ${requester.displayName}` : ""}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
        >
          Back to Case
        </button>
        <button
          onClick={onSave}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {saved ? (
            <>
              <Icons.Check size={14} /> Saved
            </>
          ) : (
            <>
              <Icons.Clipboard size={14} /> Save Work Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}

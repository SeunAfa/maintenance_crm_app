import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  LockClosedIcon,
  UsersIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";
import { useCurrentCustomer } from "./CustomerLayout";
import Dropdowns from "../../components/Dropdowns";
import BackButton from "../../components/BackButton";
import { buildAcknowledgementMessage } from "../../utils/comms";
import { getIssueScope } from "../../utils/locationUtils";
import {
  CAMPUSES,
  CAMPUS_BUILDINGS,
  BLOCKS,
  FLOORS,
  FLATS,
  ROOMS,
} from "../../utils/constants";

const BUILDINGS_FLAT = CAMPUS_BUILDINGS.flatMap((c) => c.building);

// ─── Tiny mock "AI cleanup" — capitalises sentences and adds missing punctuation
function aiCleanup(text) {
  if (!text?.trim()) return "";
  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`))
    .join(" ");
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const STATUS_TONE = {
  "New":          "bg-slate-400/10 text-slate-300",
  "In Review":    "bg-sky-400/10 text-sky-300",
  "Qualify":      "bg-amber-400/10 text-amber-300",
  "Action":       "bg-orange-400/10 text-orange-300",
  "Converted":    "bg-violet-400/10 text-violet-300",
  "Closed":       "bg-white/5 text-white/40",
  "Cancelled":    "bg-red-400/10 text-red-300",
};

const TIPS = [
  "Be specific about what's wrong and when it started.",
  "Mention any safety concerns so we can prioritise.",
  "Tell us if other residents are affected.",
  "Upload a photo if you can — it really helps the engineer.",
];

export default function NewCase() {
  const navigate     = useNavigate();
  const { cases, addCase } = useCases();
  const customer     = useCurrentCustomer();

  const [description, setDescription] = useState("");
  const [campus,      setCampus]      = useState(customer.campus  ?? "");
  const [building,    setBuilding]    = useState(customer.building ?? "");
  const [block,       setBlock]       = useState(customer.block ?? "");
  const [floor,       setFloor]       = useState(customer.floor ?? "");
  const [flat,        setFlat]        = useState(customer.flat  ?? "");
  const [room,        setRoom]        = useState("");
  const [sharedIssue, setSharedIssue] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [aiBusy,      setAiBusy]      = useState(false);

  const scope = useMemo(
    () => getIssueScope({ building, block, floor, flat, room }),
    [building, block, floor, flat, room]
  );

  // Customer's recent cases (last 7 days) — shows the page isn't empty
  const recent = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return cases
      .filter((c) =>
        c.requester?.displayName === customer.displayName &&
        c.createdAt &&
        new Date(c.createdAt).getTime() >= cutoff
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [cases, customer.displayName]);

  const runAiCleanup = () => {
    if (!description.trim() || aiBusy) return;
    setAiBusy(true);
    // Tiny simulated delay so it feels real
    setTimeout(() => {
      setDescription(aiCleanup(description));
      setAiBusy(false);
    }, 700);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }
    if (!building || !block) {
      setError("Please tell us where the issue is.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const id     = Date.now();
    const nextNo = cases.length + 1;
    const caseId = `CASE-${String(nextNo).padStart(3, "0")}`;
    const title  = description.split(/[.!\n]/)[0].trim().slice(0, 60);
    const createdAt = new Date().toISOString();

    const skeleton = {
      caseId,
      source: "Web Portal",
      requester: { displayName: customer.displayName, email: customer.email },
    };

    const tenantMessage = {
      id:      id - 1,
      from:    "tenant",
      subject: `New request — ${caseId}`,
      text:    description,
      time:    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      date:    createdAt,
      channel: "Web Portal",
    };

    addCase({
      id,
      caseId,
      title,
      description,
      case_status:     "New",
      source:          "Web Portal",
      requestTypes:    "Service Request",
      priority:        "",
      ServiceCategory: null,
      requester: {
        displayName:    customer.displayName,
        email:          customer.email,
        clientEmployee: customer.clientEmployee,
        isStudent:      customer.isStudent,
        requesterExist: true,
        site:           customer.site,
        contractType:   customer.contractType,
      },
      affectedRequester: customer,
      location: { campus, building, block, floor, flat, room },
      messages: [tenantMessage, buildAcknowledgementMessage(skeleton)],
      sharedIssue,
      sharedUsers: [],
      linkedCaseId: null,
      createdAt,
      createdBy: customer.displayName,
    });

    setTimeout(() => navigate(`/customer/cases`), 600);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 min-h-0">
        <div className="max-w-5xl mx-auto flex flex-col gap-5">
          <div>
            <BackButton variant="inline" to="/customer/cases" label="Back to cases" className="mb-3" />
            <h1 className="text-2xl font-bold text-white">Raise a case</h1>
            <p className="text-xs text-white/40 mt-1">Tell us what's wrong and where — we'll get back to you shortly.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-300 text-xs">
              <ExclamationCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ── Main form — flush-left, no card so fields align with the page title ── */}
            <form id="customer-new-case-form" onSubmit={submit} className="lg:col-span-7 flex flex-col gap-5 py-1">
          {/* Description + AI cleanup */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-white">
                What's the issue? <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={runAiCleanup}
                disabled={!description.trim() || aiBusy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold text-electricBlue bg-electricBlue/10 hover:bg-electricBlue/15 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <SparklesIcon className="size-3" />
                {aiBusy ? "Cleaning up…" : "Clean up with AI"}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe what's happening, when it started, and anything else that might help…"
              className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:bg-white/[0.06] resize-none leading-relaxed transition-colors"
            />
            <p className="text-[10px] text-white/30 mt-1.5">
              AI cleanup tidies punctuation and capitalisation — it never changes the meaning of what you wrote.
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">
              Where is the issue?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Dropdowns optionList={CAMPUSES}        defaultValue={campus}   label="Campus"   optionPlaceholder="Select campus"   dropdownBtnCls="bg-white/[0.04] px-3 py-1.5" showLabel={true} isRequired={true}  className="w-full" onChange={setCampus} />
              <Dropdowns optionList={BUILDINGS_FLAT}  defaultValue={building} label="Building" optionPlaceholder="Select building" dropdownBtnCls="bg-white/[0.04] px-3 py-1.5" showLabel={true} isRequired={true}  className="w-full" onChange={setBuilding} />
              <Dropdowns optionList={BLOCKS}          defaultValue={block}    label="Block"    optionPlaceholder="Select block"    dropdownBtnCls="bg-white/[0.04] px-3 py-1.5" showLabel={true} isRequired={true}  className="w-full" onChange={setBlock} />
              <Dropdowns optionList={FLOORS}          defaultValue={floor}    label="Floor"    optionPlaceholder="Select floor"    dropdownBtnCls="bg-white/[0.04] px-3 py-1.5" showLabel={true} isRequired={false} className="w-full" onChange={setFloor} />
              <Dropdowns optionList={FLATS}           defaultValue={flat}     label="Flat"     optionPlaceholder="Select flat"     dropdownBtnCls="bg-white/[0.04] px-3 py-1.5" showLabel={true} isRequired={false} className="w-full" onChange={setFlat} />
              <Dropdowns optionList={ROOMS}           defaultValue={room}     label="Room"     optionPlaceholder="Select room"     dropdownBtnCls="bg-white/[0.04] px-3 py-1.5" showLabel={true} isRequired={false} className="w-full" onChange={setRoom} />
            </div>
          </div>

          {/* Visibility toggle */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">
              Who's affected?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSharedIssue(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                  !sharedIssue
                    ? "bg-electricBlue/15 outline outline-1 outline-electricBlue/60"
                    : "bg-white/[0.04] outline outline-1 outline-white/10 hover:bg-white/[0.07]"
                }`}
              >
                <LockClosedIcon className={`size-3.5 shrink-0 ${!sharedIssue ? "text-electricBlue" : "text-white/30"}`} />
                <div>
                  <p className={`text-[11px] font-semibold leading-none ${!sharedIssue ? "text-white" : "text-white/50"}`}>
                    Just me
                  </p>
                  <p className="text-[10px] mt-0.5 text-white/30 leading-none">Only affects my space</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSharedIssue(true)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                  sharedIssue
                    ? "bg-electricBlue/15 outline outline-1 outline-electricBlue/60"
                    : "bg-white/[0.04] outline outline-1 outline-white/10 hover:bg-white/[0.07]"
                }`}
              >
                <UsersIcon className={`size-3.5 shrink-0 ${sharedIssue ? "text-electricBlue" : "text-white/30"}`} />
                <div>
                  <p className={`text-[11px] font-semibold leading-none ${sharedIssue ? "text-white" : "text-white/50"}`}>
                    Shared issue
                  </p>
                  <p className="text-[10px] mt-0.5 text-white/30 leading-none">Affects others too</p>
                </div>
              </button>
            </div>
            {sharedIssue && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-electricBlue/5 border border-electricBlue/15 flex items-start gap-2">
                <UsersIcon className="size-3.5 text-electricBlue mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/75">
                    Will be reported as affecting{" "}
                    <span className="font-semibold text-electricBlue">{scope.label.toLowerCase()}</span>
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 truncate">
                    Scope auto-detected from the location you selected — {scope.desc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Attachments</label>
            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-5 flex items-center justify-center text-center">
              <div>
                <PaperClipIcon className="size-5 text-white/25 mx-auto mb-1.5" />
                <p className="text-[11px] text-white/50">Drag & drop a photo or <span className="text-electricBlue cursor-pointer">browse</span></p>
                <p className="text-[10px] text-white/30 mt-0.5">Images or PDFs up to 20 MB</p>
              </div>
            </div>
          </div>

        </form>

        {/* ── Sidebar: tips + recent cases ── */}
        <aside className="lg:col-span-5 flex flex-col gap-4">
          {/* Tips */}
          <section className="rounded-2xl bg-obsidianSurface p-5">
            <div className="flex items-center gap-2 mb-3">
              <LightBulbIcon className="size-3.5 text-amber-400" />
              <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                Tips for a fast resolution
              </h2>
            </div>
            <ul className="flex flex-col gap-2">
              {TIPS.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-white/55 leading-relaxed">
                  <span className="text-electricBlue/60 mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent cases */}
          <section className="rounded-2xl bg-obsidianSurface p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                Your recent cases
              </h2>
              <span className="text-[10px] text-white/30">Last 7 days</span>
            </div>

            {recent.length === 0 ? (
              <div className="rounded-xl bg-obsidianNight/40 px-4 py-6 text-center">
                <BriefcaseIcon className="size-6 text-white/10 mx-auto mb-1.5" />
                <p className="text-[11px] text-white/35">Nothing in the last week.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recent.map((c) => (
                  <Link
                    key={c.id}
                    to={`/customer/cases/${c.id}`}
                    className="flex items-stretch gap-3 px-3.5 py-3 rounded-xl bg-obsidianNight/40 hover:bg-obsidianNight ring-1 ring-white/[0.04] hover:ring-electricBlue/30 transition-all group"
                  >
                    {/* Leading icon tile */}
                    <div className="size-9 rounded-lg bg-electricBlue/10 group-hover:bg-electricBlue/15 flex items-center justify-center shrink-0 transition-colors">
                      <BriefcaseIcon className="size-4 text-electricBlue" />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                      <p className="text-sm font-semibold text-white truncate leading-tight">
                        {c.title || c.caseId}
                      </p>
                      <p className="text-[11px] text-white/45 truncate leading-snug">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-semibold text-electricBlue">{c.caseId}</span>
                        <span className="size-0.5 rounded-full bg-white/20" />
                        <span className="text-[10px] text-white/40">{fmtDate(c.createdAt)}</span>
                      </div>
                    </div>

                    {/* Trailing arrow */}
                    <div className="flex items-center shrink-0">
                      <ArrowRightIcon className="size-4 text-white/15 group-hover:text-electricBlue translate-x-0 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar — buttons align with the right edge of the content above */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 border-t border-obsidianHighlight bg-obsidianSurface"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-3">
          <Link
            to="/customer/cases"
            className="text-xs text-white/50 hover:text-white transition-colors px-3 py-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="customer-new-case-form"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-electricBlue text-white text-xs font-semibold hover:bg-electricBlue/85 disabled:opacity-50 transition-colors shadow-lg shadow-electricBlue/20"
          >
            {submitting ? <CheckCircleIcon className="size-4" /> : null}
            {submitting ? "Submitted" : "Submit case"}
          </button>
        </div>
      </div>
    </div>
  );
}

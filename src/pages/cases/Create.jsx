import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";
import CaseTabsHeader from "../../components/CaseTabsHeader";
import CaseToolBar from "../../components/CaseToolbar";
import CaseDetailsPanel from "../../components/CaseDetailsPanel";
import PhoneSourcePanel from "../../components/PhoneSourcePanel";
import ResizableDivider from "../../components/ResizableDivider";
import { useCases } from "../../context/CasesContext";
import { USERS_DATA, CURRENT_AGENT } from "../../data/usersData";
import { SUB_CATEGORIES_ISSUE } from "../../data/subCategoriesIssues";
import { Icons } from "./Manage";

const inputCls =
  "w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 bg-white transition-colors";
const selectCls = inputCls + " appearance-none cursor-pointer";

function makeEmptyFields(nextCaseId) {
  return {
    caseId: nextCaseId,
    requester: "",
    requesterEmail: "",
    affectedRequester: {},
    description: "",
    clientEmployee: false,
    isStudent: false,
    requesterExist: false,
    requestTypes: "",
    source: "Phone",
    contractType: "",
    site: "",
    case_status: "New",
    priority: "",
    ServiceCategory: null,
    campus: "",
    building: "",
    block: "",
    floor: "",
    flat: "",
    room: "",
    sharedIssue: false,
    sharedUsers: [],
  };
}

export default function Create() {
  const { cases, addCase } = useCases();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const params    = new URLSearchParams(location.search);
  const draftId   = Number(params.get("d")) || null;
  const scenario  = params.get("s") || "existing";
  const isNew     = scenario === "new";

  const nextCaseNum = cases.length + 1;
  const nextCaseId  = `CASE-${String(nextCaseNum).padStart(3, "0")}`;

  // Read prefill user once and keep stable across re-renders via ref
  const prefillUserRef = useRef(undefined);
  if (prefillUserRef.current === undefined) {
    prefillUserRef.current = (() => {
      if (isNew) return null;
      try {
        const d = sessionStorage.getItem("prefillRequester");
        if (d) { sessionStorage.removeItem("prefillRequester"); return JSON.parse(d); }
        return null;
      } catch { return null; }
    })();
  }
  const prefillUser = prefillUserRef.current;

  const [fields, setFields] = useState(() => {
    const base = makeEmptyFields(nextCaseId);
    if (!isNew) {
      const user = prefillUser ?? USERS_DATA.find((u) => u.displayName === "James Thornton");
      return {
        ...base,
        requester:         user.displayName,
        requesterEmail:    user.email,
        affectedRequester: user,
        contractType:      user.contractType,
        site:              user.site,
        isStudent:         user.isStudent      ? "Yes" : "No",
        clientEmployee:    user.clientEmployee ? "Yes" : "No",
        requesterExist:    "Yes",
        campus:            user.campus    ?? "North Campus",
        building:          user.building  ?? "Faraday Block",
        block:             user.block     ?? "C",
        floor:             user.floor     ?? "Third Floor",
      };
    }
    return base;
  });

  const FULL_NOTES = (() => {
    if (isNew) return "• Caller reported heating not working in flat 4B\n• Issue started this morning — room very cold\n• No hot water either — possibly boiler related\n• Previous occurrence ~3 months ago\n• Priority: urgent — elderly resident\n• NEW USER — not found on system, details captured during call\n• Best contact number confirmed: 07911 234567 (number calling from)";
    if (prefillUser) {
      const loc = [prefillUser.campus, prefillUser.building, prefillUser.block, prefillUser.floor].filter(Boolean).join(", ") || "Not specified";
      return `• Caller: ${prefillUser.displayName} — existing user (${prefillUser.contractType ?? ""})\n• Issue raised via user profile — new case opened by agent\n• Location: ${loc}\n• Site: ${prefillUser.site ?? "Not specified"}\n• Contact: ${prefillUser.phone ?? prefillUser.email ?? "on file"}`;
    }
    return "• Caller: James Thornton — existing user (Greenwich University)\n• Third floor access door not opening — keypad unresponsive\n• Staff unable to access the floor since this morning\n• Multiple people affected — reported by several colleagues\n• Location: North Campus, Faraday Block, Block C, Third Floor";
  })();

  const FULL_TRANS = (() => {
    if (isNew) return "Agent: Good morning, facilities helpdesk, how can I help?\n\nAgent: What's your name so I can look you up on our system?\n\nCaller: It's Margaret Davies.\n\nAgent: I can't find an existing account for you — let me create one now. Are you a student or member of staff?\n\nCaller: I'm a student here at Greenwich.\n\nAgent: And your email address?\n\nCaller: m.davies@greenwich.ac.uk\n\nAgent: Is the number you're calling from the best number for us to contact you?\n\nCaller: Yes, that's my mobile — 07911 234567.\n\nAgent: Perfect. Your contract will be Greenwich University — is that correct?\n\nCaller: Yes that's right.\n\nAgent: Great, account created. Now how can I help you today?\n\nCaller: My heating has stopped working, it's absolutely freezing in here.\n\nAgent: Which campus are you on?\n\nCaller: North Campus.\n\nAgent: Building and block?\n\nCaller: Rutherford Hall, Block B.\n\nAgent: Which floor and flat?\n\nCaller: Fourth floor, Flat 4.\n\nAgent: When did the heating stop?\n\nCaller: This morning. No hot water either — probably the boiler.\n\nAgent: We'll raise this as urgent and get someone out to you today.";
    if (prefillUser) {
      const first = prefillUser.firstName ?? prefillUser.displayName?.split(" ")[0] ?? "there";
      const loc   = [prefillUser.building, prefillUser.block, prefillUser.campus].filter(Boolean).join(", ") || "their location";
      return `Agent: Good morning, facilities helpdesk, how can I help?\n\nCaller: Hi, it's ${prefillUser.displayName}. I'd like to report a new issue.\n\nAgent: Hi ${first}, I've pulled up your account — everything looks good. What's the problem today?\n\nCaller: I have a maintenance issue I need to report at ${loc}.\n\nAgent: Understood. Can you describe the issue?\n\nCaller: It started recently and I haven't been able to resolve it myself.\n\nAgent: Got it, I'll raise a new case for you now. Is your contact number still ${prefillUser.phone ?? "on file"}?\n\nCaller: Yes that's correct.\n\nAgent: Perfect. I'm opening the case now — someone will be in touch shortly.`;
    }
    return "Agent: Good morning, facilities helpdesk, how can I help?\n\nCaller: Hi, it's James Thornton. The access door to the third floor isn't working — the keypad is completely unresponsive.\n\nAgent: Hi James, I've got your account. Since when has it been down?\n\nCaller: Since I arrived this morning, around 8am. Several of us are stuck — we can't get onto the floor at all.\n\nAgent: Is anyone currently on the floor?\n\nCaller: A few people who were already in, but no one else can get through. It's causing real disruption.\n\nAgent: Understood. Can you confirm the building and block?\n\nCaller: Faraday Block, Block C, North Campus. Third floor access door.\n\nAgent: Got it. I'll raise this as high priority and get someone to you as soon as possible.";
  })();

  const noteLines  = FULL_NOTES.split("\n");
  const transLines = FULL_TRANS.split("\n");

  const [notes,        setNotes]        = useState("");
  const [transcription, setTranscription] = useState("");
  const noteCountRef  = useRef(0);
  const transCountRef = useRef(0);
  const noteTimerRef  = useRef(null);
  const transTimerRef = useRef(null);

  const animDoneKey = `animDone_${draftId ?? "0"}`;

  const markAnimDone = useCallback(() => {
    try { localStorage.setItem(animDoneKey, "1"); } catch { /* ignore */ }
  }, [animDoneKey]);

  const fillRemaining = useCallback((fast = false) => {
    clearInterval(noteTimerRef.current);
    clearInterval(transTimerRef.current);
    if (fast) {
      // Reveal remaining lines rapidly (50 ms each)
      const delay = 50;
      noteTimerRef.current = setInterval(() => {
        noteCountRef.current += 1;
        setNotes(noteLines.slice(0, noteCountRef.current).join("\n"));
        if (noteCountRef.current >= noteLines.length) {
          clearInterval(noteTimerRef.current);
          markAnimDone();
        }
      }, delay);
      transTimerRef.current = setInterval(() => {
        transCountRef.current += 1;
        setTranscription(transLines.slice(0, transCountRef.current).join("\n"));
        if (transCountRef.current >= transLines.length) clearInterval(transTimerRef.current);
      }, delay);
    } else {
      setNotes(FULL_NOTES);
      setTranscription(FULL_TRANS);
      markAnimDone();
    }
  }, [markAnimDone]);

  useEffect(() => {
    // If already animated for this draft, show full content immediately
    try {
      if (localStorage.getItem(animDoneKey)) {
        setNotes(FULL_NOTES);
        setTranscription(FULL_TRANS);
        return;
      }
    } catch { /* ignore */ }

    const NOTE_INTERVAL  = Math.floor(30000 / noteLines.length);
    const TRANS_INTERVAL = Math.floor(30000 / transLines.length);

    noteTimerRef.current = setInterval(() => {
      noteCountRef.current += 1;
      setNotes(noteLines.slice(0, noteCountRef.current).join("\n"));
      if (noteCountRef.current >= noteLines.length) {
        clearInterval(noteTimerRef.current);
        markAnimDone();
      }
    }, NOTE_INTERVAL);

    transTimerRef.current = setInterval(() => {
      transCountRef.current += 1;
      setTranscription(transLines.slice(0, transCountRef.current).join("\n"));
      if (transCountRef.current >= transLines.length) clearInterval(transTimerRef.current);
    }, TRANS_INTERVAL);

    // After 30 seconds, hang up automatically
    const hangupTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("call:hangup"));
    }, 30000);

    // If call ends early, fill the rest rapidly
    const onCallEnd = () => {
      clearTimeout(hangupTimer);
      fillRemaining(true);
    };
    window.addEventListener("call:end", onCallEnd);

    return () => {
      clearInterval(noteTimerRef.current);
      clearInterval(transTimerRef.current);
      clearTimeout(hangupTimer);
      window.removeEventListener("call:end", onCallEnd);
      // Only persist if animation actually started (guards against StrictMode double-invoke)
      if (noteCountRef.current > 0) markAnimDone();
    };
  }, []);

  const [aiLoading,       setAiLoading]       = useState(false);
  const [userCreated,     setUserCreated]     = useState(false);
  const [userJustCreated, setUserJustCreated] = useState(false);
  const [saveError,       setSaveError]       = useState(false);
  const [threadOpen,      setThreadOpen]      = useState(true);
  const [leftPct,         setLeftPct]         = useState(30);
  const [toast,           setToast]           = useState(null); // { message, type }
  const toastTimerRef = useRef(null);

  // All user data is ready once the phone number has appeared in the transcription
  const userDataReady = isNew && transcription.includes("07911 234567");

  const showToast = (message, type = "info") => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  // ── Stage advancement ──────────────────────────────────────────────────────
  const STEP_FROM_STATUS = { "New": 0, "In Review": 1, "Qualify": 2, "Action": 3, "Converted": 4 };
  const STATUS_FROM_STEP = ["New", "In Review", "Qualify", "Action", "Converted"];
  const caseStep = STEP_FROM_STATUS[fields.case_status ?? "New"] ?? 0;

  const handleStageChange = (newStep) => {
    const newStatus = STATUS_FROM_STEP[newStep] ?? "New";
    setFields((prev) => ({ ...prev, case_status: newStatus }));
    showToast("Details saved — moved to next stage", "success");
  };

  // Show auto-fill toast for existing user — only once per draft
  const toastShownKey = `toastShown_${draftId ?? "0"}`;
  useEffect(() => {
    if (!isNew) {
      try {
        if (!localStorage.getItem(toastShownKey)) {
          showToast("Requester details auto-filled — existing user found", "info");
          localStorage.setItem(toastShownKey, "1");
        }
      } catch { /* ignore */ }
    }
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  // Auto-create the new user from the call details (phone panel button)
  const handleCreateUser = () => {
    const location = {
      campus:   "North Campus",
      building: "Rutherford Hall",
      block:    "B",
      floor:    "Fourth Floor",
      flat:     "Flat 4",
      room:     "",
    };
    const user = {
      displayName:    "Margaret Davies",
      email:          "m.davies@greenwich.ac.uk",
      phone:          "07911 234567",
      userRole:       "Student",
      isStudent:      true,
      clientEmployee: false,
      contractType:   "Greenwich University",
      site:           "Greenwich University",
      location,
      createdAt:      new Date().toISOString(),
    };

    // Persist to localStorage so the user profile page can read it later
    try {
      const existing = JSON.parse(localStorage.getItem("createdUsers") ?? "[]");
      const without  = existing.filter((u) => u.email !== user.email);
      localStorage.setItem("createdUsers", JSON.stringify([...without, user]));
    } catch { /* ignore */ }

    setFields((prev) => ({
      ...prev,
      requester:         user.displayName,
      requesterEmail:    user.email,
      affectedRequester: user,
      contractType:      user.contractType,
      site:              user.site,
      isStudent:         "Yes",
      clientEmployee:    "No",
      requesterExist:    "Yes",
      campus:            location.campus,
      building:          location.building,
      block:             location.block,
      floor:             location.floor,
      flat:              location.flat,
      room:              location.room,
    }));
    setUserJustCreated(true);
    showToast("New user created — details auto-filled", "success");
  };

  const dummyCaseItem = {
    id: null,
    caseId: nextCaseId,
    linkedCaseId: null,
    case_status: fields.case_status,
    sharedIssue: false,
    source: "Phone",
    requester: {
      displayName: fields.requester,
      email: fields.requesterEmail,
      clientEmployee: true,
      isStudent: true,
      requesterExist: fields.requesterExist,
      contractType: fields.contractType,
      site: fields.site,
    },
    affectedRequester: fields.affectedRequester,
    location: {},
  };

  const handleAiFill = () => {
    setAiLoading(true);
    setUserCreated(false);
    setTimeout(() => {
      // Resolve service categories once for reuse
      const hvacGroup     = SUB_CATEGORIES_ISSUE.find((g) => g.id === "hvac");
      const securityGroup = SUB_CATEGORIES_ISSUE.find((g) => g.id === "security");
      const plumbingGroup = SUB_CATEGORIES_ISSUE.find((g) => g.id === "plumbing");

      if (isNew) {
        const user = USERS_DATA.find((u) => u.displayName === "Margaret Davies") ?? {
          displayName: "Margaret Davies", email: "m.davies@greenwich.ac.uk",
          phone: "", userRole: "Student", isStudent: true, clientEmployee: false,
          contractType: "Greenwich University", site: "Greenwich University",
        };
        // Heating fault → HVAC / No heating / cooling (HV-001)
        const serviceCategory = hvacGroup?.issues.find((i) => i.code === "HV-001") ?? null;
        setFields((prev) => ({
          ...prev,
          requester:         user.displayName,
          requesterEmail:    user.email,
          affectedRequester: user,
          contractType:      "Greenwich University",
          site:              "Greenwich University",
          isStudent:         "Yes",
          clientEmployee:    "No",
          requesterExist:    "Yes",
          requestTypes:      "Service Request",
          source:            "Phone",
          case_status:       "New",
          priority:          "High",
          ServiceCategory:   serviceCategory,
          campus:            "North Campus",
          building:          "Rutherford Hall",
          block:             "B",
          floor:             "Fourth Floor",
          flat:              "Flat 4",
          room:              "",
          sharedIssue:       false,
          sharedUsers:       [],
          description:       "Tenant reported that heating has completely stopped working in Flat 4, Fourth Floor, Block B, Rutherford Hall. Hot water is also unavailable, suggesting a possible boiler fault. Issue started this morning. Resident described the room as very cold. A previous occurrence was reported approximately 3 months ago. Urgent response requested.",
        }));
        setUserCreated(true);
      } else {
        const sharedUsers = USERS_DATA.filter(
          (u) => u.contractType === "Greenwich University" && u.displayName !== "James Thornton"
        );
        // Access door / keypad → Security / Access control failure (SE-002)
        // Prefill user → leave category as null (issue type unknown without more detail)
        const serviceCategory = prefillUser
          ? null
          : (securityGroup?.issues.find((i) => i.code === "SE-002") ?? null);
        const description = prefillUser
          ? `Maintenance issue reported by ${prefillUser.displayName} at ${[prefillUser.building, prefillUser.block && `Block ${prefillUser.block}`, prefillUser.floor].filter(Boolean).join(", ") || "their location"}. Issue raised via user profile during inbound call. Full details to be confirmed with requester.`
          : "Third floor access door at Faraday Block (Block C, North Campus) is completely unresponsive — keypad not functioning. Multiple staff members have been unable to access the floor since approximately 08:00. Issue is causing significant disruption to several users. Urgent repair required to restore access.";
        setFields((prev) => ({
          ...prev,
          requestTypes:    "Service Request",
          source:          "Phone",
          case_status:     "New",
          priority:        prefillUser ? "Medium" : "High",
          ServiceCategory: serviceCategory,
          sharedIssue:     !prefillUser,
          sharedUsers:     prefillUser ? [] : sharedUsers,
          description,
        }));
      }
      setAiLoading(false);
    }, 1600);
  };

  const removeDraft = () => {
    if (!draftId) return;
    try {
      const drafts = JSON.parse(localStorage.getItem("draftTabs")) ?? [];
      localStorage.setItem("draftTabs", JSON.stringify(drafts.filter((d) => d.id !== draftId)));
      localStorage.removeItem(animDoneKey);
      localStorage.removeItem(toastShownKey);
    } catch { /* ignore */ }
  };

  const handleSave = () => {
    if (!fields.description?.trim()) {
      setSaveError(true);
      return;
    }
    setSaveError(false);
    const id = Date.now();
    const title = fields.description.split(/[.!\n]/)[0].trim().slice(0, 60);
    removeDraft();
    addCase({
      id,
      caseId: nextCaseId,
      title,
      source: "Phone",
      case_status: fields.case_status || "New",
      priority: fields.priority || "",
      description: fields.description || "",
      ServiceCategory: fields.ServiceCategory ?? null,
      requestTypes: fields.requestTypes || "",
      requester: {
        displayName: fields.requester,
        email: "",
        clientEmployee: fields.clientEmployee,
        isStudent: fields.isStudent,
        requesterExist: fields.requesterExist,
        site: fields.site,
        contractType: fields.contractType,
      },
      affectedRequester: fields.affectedRequester,
      location: {
        campus: fields.campus,
        building: fields.building,
        block: fields.block,
        floor: fields.floor,
        flat: fields.flat,
        room: fields.room,
      },
      messages: [],
      callNotes: notes,
      callTranscription: transcription,
      sharedIssue: fields.sharedIssue || false,
      sharedUsers: fields.sharedUsers || [],
      linkedCaseId: null,
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_AGENT,
    });
    navigate(`/admin/cases/manage/${id}`);
  };

  const handleDrag = useCallback((clientX) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    setLeftPct(Math.min(33, Math.max(30, ((clientX - left) / width) * 100)));
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <CaseTabsHeader />

      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex flex-row items-stretch overflow-hidden"
      >
        {/* ── LEFT: Phone source panel ── */}
        {threadOpen && (
          <>
            <PhoneSourcePanel
              notes={notes}
              onNotesChange={setNotes}
              transcription={transcription}
              onTranscriptionChange={setTranscription}
              onClose={() => setThreadOpen(false)}
              leftPct={leftPct}
              isAnon={isNew}
              userDataReady={userDataReady}
              userCreated={userJustCreated}
              onCreateUser={handleCreateUser}
            />
            <ResizableDivider onDrag={handleDrag} />
          </>
        )}

        {/* ── RIGHT: Case details ── */}
        <div className="h-full flex-1 flex flex-col overflow-hidden">
          <CaseToolBar
            onSave={handleSave}
            threadOpen={threadOpen}
            onToggleThread={() => setThreadOpen((v) => !v)}
            pages={[
              { name: "Cases", href: "/admin/cases" },
              { name: nextCaseId },
              { name: "New Case" },
            ]}
          />

          {/* Floating toast */}
          {toast && (
            <div
              key={toast.id}
              className="fixed bottom-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl shadow-black/60 pointer-events-none"
              style={{
                animation: "toast-in-right 0.3s ease forwards",
                background: toast.type === "success" ? "rgba(16,185,129,0.12)" : "rgba(14,22,40,0.97)",
                border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.35)" : "rgba(99,102,241,0.35)"}`,
              }}
            >
              <span className={`size-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-400" : "bg-electricBlue"}`} />
              <p className="text-xs text-white/85 font-medium whitespace-nowrap">{toast.message}</p>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0 relative overscroll-y-contain">
            {saveError && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25">
                <span className="size-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-xs text-red-400 font-medium">
                  Case cannot be saved without a description. Use Auto-fill with AI or fill in the details manually.
                </p>
                <button onClick={() => setSaveError(false)} className="ml-auto shrink-0 text-red-400/50 hover:text-red-400 transition-colors text-xs">✕</button>
              </div>
            )}

            {userCreated && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-400 font-medium">
                  User account created — Margaret Davies has been added to the system as a new requester.
                </p>
                <button onClick={() => setUserCreated(false)} className="ml-auto shrink-0 text-emerald-400/50 hover:text-emerald-400 transition-colors text-xs">✕</button>
              </div>
            )}
            <CaseDetailsPanel
              caseItem={dummyCaseItem}
              Icons={Icons}
              selectCls={selectCls}
              inputCls={inputCls}
              fields={fields}
              setFields={setFields}
              step={caseStep}
              onStepChange={handleStageChange}
            />
          </div>

          {/* AI button bar — highlighted when description is empty */}
          {(() => {
            const descEmpty = !fields.description?.trim();
            return (
              <div className={`shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t bg-obsidianSurface transition-colors ${descEmpty ? "border-amber-400/40 bg-amber-400/5" : "border-obsidianHighlight"}`}>
                <p className={`text-[11px] transition-colors ${descEmpty ? "text-amber-400" : "text-amber-400/80"}`}>
                  {descEmpty
                    ? "Description is empty — use Auto-fill to populate from call notes"
                    : "AI reads notes & transcription to fill fields automatically"}
                </p>
                <button
                  onClick={handleAiFill}
                  disabled={aiLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg shadow-black/30 disabled:opacity-50 transition-all shrink-0 ${descEmpty ? "bg-amber-500 hover:bg-amber-400 animate-pulse" : "bg-electricBlue hover:bg-electricBlue/85"}`}
                >
                  <SparklesIcon className="size-4" />
                  {aiLoading ? "Analysing…" : "Auto-fill with AI"}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

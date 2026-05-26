import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Save,
  SaveAll,
  Share2,
  RotateCw,
  Copy,
  X,
  FileCog,
  PanelLeft,
  Wrench,
} from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import IconButton from "./IconButton";
import BackButton from "./BackButton";
import GhostButton from "./GhostButton";
import PrimaryButton from "./PrimaryButton";
import AccentButton from "./AccentButton";
import Divider from "./Divider";

const defaultLinks = [
  { name: "Cases", href: "/admin/cases" },
  { name: "Case Details" },
];

export default function CaseToolBar({
  title,
  status,
  statuses = [],
  statusStyles = {},
  onTitleChange,
  onChange,
  onBack,
  onSave,
  onSaveAndClose,
  onNew,
  onConvert,
  canConvert = false,
  isConverting = false,
  onShare,
  onOpenExternal,
  onToggleThread,
  threadOpen,
  pages,
  caseId,          // numeric case id — used to navigate to WO manage page
  isConverted = false,
}) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== title) onTitleChange?.(draft.trim());
    else setDraft(title);
  };

  const onKey = (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(title);
      setEditing(false);
    }
  };

  return (
    //px-5
    <>
      <header className="px-3 py-2 w-full rounded-lg bg-obsidianNight/40">
        <div className="flex w-full flex-col gap-4">
          {/* Top row */}
          <div className="flex flex-wrap items-center justify-between gap-3 ">
            <div className="flex min-w-0 items-center gap-1.5">
              <BackButton onClick={onBack} />
              <Divider />
              <Breadcrumbs pages={pages ?? defaultLinks} />
            </div>

            <div className="flex items-center gap-1.5">
              {/* Secondary icon actions — hidden on small screens to save space */}
              <div className="hidden md:flex items-center gap-1.5">
                <IconButton title="Refresh" onClick={onOpenExternal}>
                  <RotateCw className="h-4 w-4" />
                </IconButton>
                <IconButton title="Copy case details" onClick={onOpenExternal}>
                  <Copy className="h-4 w-4" />
                </IconButton>
                <IconButton title="Open in new tab" onClick={onOpenExternal}>
                  <ExternalLink className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                title={threadOpen ? "Hide source panel" : "Show source panel"}
                onClick={onToggleThread}
                className={threadOpen ? "text-electricBlue" : ""}
              >
                <PanelLeft className="h-4 w-4" />
              </IconButton>
              <IconButton title="Close" onClick={onBack} danger>
                <X className="h-4 w-4" />
              </IconButton>

              <Divider className="hidden md:block" />

              <GhostButton
                onClick={onSaveAndClose}
                icon={SaveAll}
                label="Save & Close"
                disabled={isConverted}
                title={isConverted ? "Case is locked — make updates through the work order" : undefined}
              />
              <GhostButton
                onClick={onSave}
                icon={Save}
                label="Save"
                disabled={isConverted}
                title={isConverted ? "Case is locked — make updates through the work order" : undefined}
              />
              <button
                type="button"
                onClick={canConvert ? onConvert : undefined}
                disabled={!canConvert || isConverting}
                title={canConvert ? "Convert to Work Order" : "Advance to Action stage to convert"}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all focus:outline-none ${
                  canConvert
                    ? "bg-electricBlue text-white shadow-sm shadow-electricBlue/20 hover:bg-electricBlue/85 active:scale-[0.98] cursor-pointer"
                    : "bg-obsidianHighlight text-white/30 cursor-not-allowed"
                }`}
              >
                <FileCog className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {isConverting ? "Converting…" : "Convert to Work Order"}
                </span>
              </button>

              {isConverted && caseId && (
                <button
                  type="button"
                  onClick={() => navigate(`/admin/workorders/${caseId}`)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/25 transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Manage WO
                </button>
              )}

              <Divider />

              <AccentButton onClick={onShare} icon={Share2} label="Share" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

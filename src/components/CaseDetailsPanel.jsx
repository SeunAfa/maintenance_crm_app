import { useMemo } from "react";
import CasePgHeader from "./CasePgHeader";
import ServiceRequestDetails from "./ServiceRequestDetails";
import LocationForm from "./LocationForm";
import VisibilityToggle from "./VisibilityToggle";
import DuplicateTracker from "./DuplicateTracker";
import RelinkCase from "./RelinkCase";
import ServiceCategoryPriority from "./ServiceCategoryPriority";
import WOTracking from "./WOTracking";
import RequesterRequestsSummary from "./RequesterRequestsSummary";
import { useCases } from "../context/CasesContext";
import { USERS_DATA } from "../data/usersData";
import { computeAffectedUsers } from "../utils/locationUtils";
import { NotesList } from "./Notes";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – CaseDetailsPanel
// ─────────────────────────────────────────────────────────────────────────────
export default function CaseDetailsPanel({
  caseItem,
  Icons,
  selectCls,
  inputCls,
  fields,
  setFields,
  step,
  onStepChange,
  activeTab = "Summary",
  onTabChange,
  errors = {},
}) {
  const { cases, updateCase } = useCases();

  // Resolve linked case object (if any)
  const linkedCase = caseItem?.linkedCaseId
    ? cases.find((c) => c.id === caseItem.linkedCaseId) ?? null
    : null;

  // Link current case to a duplicate → save immediately (intentional action)
  const handleLink = (dupCase) => {
    updateCase(caseItem.id, {
      linkedCaseId: dupCase.id,
      case_status: "Closed",
    });
    // Also update local fields to keep UI in sync before next render
    setFields((prev) => ({ ...prev, case_status: "Closed" }));
  };

  // Unlink
  const handleUnlink = () => {
    updateCase(caseItem.id, {
      linkedCaseId: null,
      case_status: "In Review",
    });
    setFields((prev) => ({ ...prev, case_status: "In Review" }));
  };

  // Dynamically compute affected residents when case is shared
  const sharedUsers = useMemo(() => {
    if (!fields?.sharedIssue) return [];
    return computeAffectedUsers(
      fields,
      USERS_DATA,
      fields?.requesterEmail ?? caseItem?.requester?.email
    );
  }, [
    fields?.sharedIssue,
    fields?.building,
    fields?.block,
    fields?.floor,
    fields?.flat,
    fields?.requesterEmail,
  ]);

  // Cancel work order → mark case + WO as Cancelled
  const handleCancelCase = (_reason) => {
    updateCase(caseItem.id, {
      case_status: "Cancelled",
      workOrderStatus: "Cancelled",
    });
    setFields((prev) => ({ ...prev, case_status: "Cancelled" }));
  };

  const isConverted = ["Converted", "Cancelled"].includes(caseItem?.case_status);

  const publicNotes = (caseItem?.woNotes ?? []).filter(Boolean);

  return (
    <div className="space-y-3 pb-28">
      <CasePgHeader
        caseItem={caseItem}
        Icons={Icons}
        fields={fields}
        step={step}
        onStepChange={onStepChange}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {activeTab === "Notes" ? (
        <div className="rounded-lg bg-obsidianNight/40 p-4">
          <NotesList notes={publicNotes} />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start w-full">
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-2 min-w-0">
          <ServiceRequestDetails
            caseItem={caseItem}
            fields={fields}
            setFields={setFields}
            errors={errors}
          />
          <ServiceCategoryPriority
            caseItem={caseItem}
            fields={fields}
            setFields={setFields}
            isLocked={isConverted}
            errors={errors}
          />
          <LocationForm
            caseItem={caseItem}
            fields={fields}
            setFields={setFields}
            isLocked={isConverted}
          />
          <VisibilityToggle
            defaultValue={caseItem.sharedIssue}
            value={fields?.sharedIssue}
            onChange={(val) => setFields?.((prev) => ({ ...prev, sharedIssue: val }))}
            sharedUsers={sharedUsers}
            location={fields}
            Icons={Icons}
            disabled={isConverted}
          />
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-2 min-w-0">
          <WOTracking caseItem={caseItem} onCancel={handleCancelCase} cancelLabel="case" />
          <RequesterRequestsSummary caseItem={caseItem} />

          {/* Duplicate / Linked case section */}
          {linkedCase ? (
            <RelinkCase
              linkedCase={linkedCase}
              onUnlink={handleUnlink}
            />
          ) : (
            <DuplicateTracker
              caseItem={caseItem}
              fields={fields}
              onLink={handleLink}
            />
          )}
        </div>
      </div>
      )}
    </div>
  );
}

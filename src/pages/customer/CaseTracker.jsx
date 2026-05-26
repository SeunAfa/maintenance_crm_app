import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useCases } from "../../context/CasesContext";
import { useCurrentCustomer } from "./CustomerLayout";
import { CaseTrackerBody } from "../track/CaseTracker";
import BackButton from "../../components/BackButton";

// Customer-side wrapper: renders the same tracker body inside the customer
// portal chrome (sidebar + topnav). Scopes to the logged-in customer's own
// cases so other residents' jobs can't be opened via this route.
export default function CustomerCaseTracker() {
  const { caseId } = useParams();
  const { cases } = useCases();
  const customer  = useCurrentCustomer();

  const caseItem = useMemo(
    () => cases.find((c) => c.caseId === caseId),
    [cases, caseId]
  );

  if (!caseItem) {
    return <NotFound message="This case doesn't exist." />;
  }
  if (caseItem.requester?.displayName !== customer.displayName) {
    return <NotFound message="This case isn't on your account." />;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <BackButton variant="inline" to={`/customer/cases/${caseItem.id}`} label="Back to case" />

      <CaseTrackerBody caseItem={caseItem} />
    </div>
  );
}

function NotFound({ message }) {
  return (
    <div className="max-w-md mx-auto rounded-2xl bg-obsidianSurface p-8 text-center flex flex-col items-center gap-3 mt-10">
      <ExclamationCircleIcon className="size-10 text-white/20" />
      <h1 className="text-lg font-bold text-white">Not available</h1>
      <p className="text-sm text-white/50 leading-relaxed">{message}</p>
      <BackButton variant="inline" to="/customer/cases" label="Back to my cases" className="mt-2" />
    </div>
  );
}

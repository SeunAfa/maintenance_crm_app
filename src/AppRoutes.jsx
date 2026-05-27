import { HashRouter, Routes, Route, useParams, useSearchParams } from "react-router-dom";
import { CasesProvider } from "./context/CasesContext";
import { UsersProvider } from "./context/UsersContext";
import UserRoleSelection from "./pages/UserRoleSelection";
import SignIn from "./pages/SignIn";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Cases from "./pages/cases/Index";
import ManageCases from "./pages/cases/Manage";
import CreateCase from "./pages/cases/Create";
import WOManage from "./pages/workorders/Manage";
import WOIndex  from "./pages/workorders/Index";
import Users from "./pages/users/Index";
import UserDetail from "./pages/users/Detail";
import CreateUser from "./pages/users/Create";
import CaseTracker from "./pages/track/CaseTracker";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerCases from "./pages/customer/Cases";
import CustomerNewCase from "./pages/customer/NewCase";
import CustomerProfile from "./pages/customer/Profile";
import CustomerCaseDetail from "./pages/customer/CaseDetail";

// Wrapper that keys ManageCases on the case ID so every tab switch
// fully remounts the component, resetting all local state cleanly.
function ManageCasesKeyed() {
  const { id } = useParams();
  return <ManageCases key={id} />;
}

// Wrapper that keys CreateCase on the draft ID so each new draft
// remounts with fresh state and the correct scenario.
function CreateCaseKeyed() {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("d") || "0";
  return <CreateCase key={draftId} />;
}

export default function AppRoutes() {
  return (
    <UsersProvider>
    <CasesProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/role-select" element={<UserRoleSelection />} />

          {/* Public customer-facing tracker — no auth, no admin chrome.
              Used when residents click the link in their email. */}
          <Route path="/track-case/:caseId" element={<CaseTracker />} />

          {/* Customer portal — logged-in resident view */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="dashboard"   element={<CustomerDashboard />} />
            <Route path="cases"          element={<CustomerCases />} />
            <Route path="cases/new"      element={<CustomerNewCase />} />
            <Route path="cases/:id"      element={<CustomerCaseDetail />} />
            <Route path="profile"        element={<CustomerProfile />} />
          </Route>

<Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/create" element={<CreateCaseKeyed />} />
            <Route path="cases/manage/:id" element={<ManageCasesKeyed />} />
            <Route path="workorders"      element={<WOIndex />} />
            <Route path="workorders/:id" element={<WOManage />} />
            <Route path="users" element={<Users />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/:id" element={<UserDetail />} />
          </Route>
        </Routes>
      </HashRouter>
    </CasesProvider>
    </UsersProvider>
  );
}

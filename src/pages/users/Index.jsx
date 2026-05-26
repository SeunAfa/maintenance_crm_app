import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CONTRACT_TYPES } from "../../utils/constants";
import { useUsers } from "../../context/UsersContext";
import SectionHeading from "../../components/SectionHeading";
import Dropdowns from "../../components/Dropdowns";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import CaseTabsHeader from "../../components/CaseTabsHeader";

const PER_PAGE = 8;

const CONTRACT_OPTIONS = ["All Clients", ...CONTRACT_TYPES];
const ROLE_OPTIONS     = ["All Roles", "Student", "Client Employee", "Contractor", "Visitor", "OurEmployee"];

const ROLE_CONFIG = {
  Student:          { color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20"  },
  "Client Employee":{ color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  Contractor:       { color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"   },
  Visitor:          { color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  OurEmployee:      { color: "text-electricBlue",bg: "bg-electricBlue/10",border: "border-electricBlue/20"},
};

const CLIENT_COLORS = [
  "bg-violet-400/15 text-violet-300",
  "bg-emerald-400/15 text-emerald-300",
  "bg-amber-400/15 text-amber-300",
  "bg-blue-400/15 text-blue-300",
  "bg-rose-400/15 text-rose-300",
];

function initials(user) {
  return ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
    (user.displayName ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(id) {
  const palette = [
    "bg-electricBlue/20 text-electricBlue",
    "bg-violet-400/20 text-violet-300",
    "bg-emerald-400/20 text-emerald-300",
    "bg-amber-400/20 text-amber-300",
    "bg-rose-400/20 text-rose-300",
  ];
  return palette[(id ?? 0) % palette.length];
}

function RoleBadge({ role }) {
  if (!role) return <span className="text-white/20 text-xs">—</span>;
  const c = ROLE_CONFIG[role] ?? { color: "text-white/40", bg: "bg-white/5", border: "border-white/10" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${c.bg} ${c.color} ${c.border}`}>
      {role}
    </span>
  );
}

function ClientBadge({ client }) {
  if (!client) return <span className="text-white/20 text-xs">—</span>;
  const idx = CONTRACT_TYPES.indexOf(client);
  const cls = CLIENT_COLORS[idx >= 0 ? idx : 0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cls}`}>
      {client}
    </span>
  );
}

export default function UsersIndex() {
  const navigate       = useNavigate();
  const { users }      = useUsers();
  const [contract, setContract] = useState("All Clients");
  const [role,     setRole]     = useState("All Roles");
  const [query,    setQuery]    = useState("");
  const [page,     setPage]     = useState(1);

  const resetPage = (fn) => (...args) => { fn(...args); setPage(1); };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (contract !== "All Clients" && u.contractType !== contract) return false;
      if (role     !== "All Roles"   && u.userRole     !== role)     return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          (u.displayName  ?? "").toLowerCase().includes(q) ||
          (u.email        ?? "").toLowerCase().includes(q) ||
          (u.phone        ?? "").toLowerCase().includes(q) ||
          (u.site         ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, contract, role, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <CaseTabsHeader />
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 min-h-0">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 mb-5">
          <div>
            <h1 className="text-base font-semibold text-white text-left">Users</h1>
            <p className="mt-2 text-sm text-gray-400 text-left">All registered users across clients and sites.</p>
          </div>
          <button
            onClick={() => navigate("/admin/users/create")}
            className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-md bg-electricBlue hover:bg-electricBlue/85 active:scale-95 text-white text-xs font-semibold transition-all whitespace-nowrap"
          >
            <PlusIcon className="size-3.5" strokeWidth={2.5} />
            New user
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[180px] max-w-xs">
            <SearchBar onSearch={resetPage(setQuery)} />
          </div>
          <Dropdowns
            className="w-52"
            optionList={CONTRACT_OPTIONS}
            defaultValue={contract}
            onChange={resetPage(setContract)}
            dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
            optionPlaceholder="All Clients"
          />
          <Dropdowns
            className="w-44"
            optionList={ROLE_OPTIONS}
            defaultValue={role}
            onChange={resetPage(setRole)}
            dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
            optionPlaceholder="All Roles"
          />
          <p className="ml-auto text-xs font-medium text-electricBlue whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? "user" : "users"} found
          </p>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden border border-obsidianHighlight">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-obsidianHighlight">
              <thead className="bg-obsidianNight/60">
                <tr>
                  {["User", "Email", "Phone", "Client", "Site", "Role", "Type", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidianHighlight bg-obsidianSurface">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-white/25">
                      No users found
                    </td>
                  </tr>
                ) : paged.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-obsidianHighlight/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${avatarColor(u.id)}`}>
                          {initials(u)}
                        </div>
                        <span className="text-xs font-medium text-white">{u.displayName}</span>
                        {u._created && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">new</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-white/50">{u.email ?? "—"}</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-white/50">{u.phone ?? "—"}</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <ClientBadge client={u.contractType} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-white/50">{u.site ?? "—"}</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <RoleBadge role={u.userRole} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {u.isStudent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-400/8 text-violet-400/70 border border-violet-400/15">Student</span>
                        )}
                        {u.clientEmployee && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-400/8 text-emerald-400/70 border border-emerald-400/15">Client Staff</span>
                        )}
                        {!u.isStudent && !u.clientEmployee && (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-xs font-medium text-electricBlue hover:text-electricBlue/70 transition-colors">
                        View →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

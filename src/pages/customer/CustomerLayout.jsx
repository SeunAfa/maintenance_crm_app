"use client";
import { useState } from "react";
import { Outlet, useLocation, useNavigate, Link, NavLink } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { USERS_DATA } from "../../data/usersData";

// Demo: the customer portal renders as if logged in as this user. Swap the id
// to demo a different tenant.
const CURRENT_CUSTOMER_ID = 1; // Amara Osei

export function useCurrentCustomer() {
  return USERS_DATA.find((u) => u.id === CURRENT_CUSTOMER_ID) ?? USERS_DATA[0];
}

const navigation = [
  { name: "Dashboard", to: "/customer/dashboard", icon: HomeIcon      },
  { name: "My Cases",  to: "/customer/cases",     icon: BriefcaseIcon },
  { name: "Profile",   to: "/customer/profile",   icon: UserIcon      },
];

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

// ─── Tracking search (top nav) ────────────────────────────────────────────────
function TrackingSearch() {
  const [q, setQ] = useState("");
  const navigate  = useNavigate();

  const submit = (e) => {
    e?.preventDefault();
    const ref = q.trim().toUpperCase();
    if (!ref) return;
    const caseId = ref.startsWith("CASE-") ? ref : `CASE-${ref}`;
    navigate(`/track/${caseId}`);
    setQ("");
  };

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Track a case (e.g. CASE-001)"
        className="w-full bg-white/[0.04] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:bg-white/[0.07] transition-colors"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
          aria-label="Clear"
        >
          <XMarkIcon className="size-3" />
        </button>
      )}
    </form>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function CustomerLayout() {
  const location = useLocation();
  const customer = useCurrentCustomer();
  const initials = customer.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-dvh overflow-hidden bg-obsidianSurface">
      {/* Sidebar — collapsed-by-default, expand on hover */}
      <aside className="hidden lg:flex lg:flex-col lg:shrink-0 lg:w-[64px] hover:lg:w-60 transition-all duration-300 ease-in-out group/sidebar z-50 border-r border-obsidianHighlight bg-obsidianNight">
        <div className="flex grow flex-col overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="flex h-12 shrink-0 items-center px-2 gap-0 border-b border-obsidianHighlight overflow-hidden">
            <div className="shrink-0 size-10 flex items-center justify-center">
              <svg viewBox="0 0 48 40" fill="none" className="h-5 w-auto" aria-label="NexaHub">
                <path d="M21.3474 0.349945L46.7544 25.7266V39.3499H34.8978V30.624L16.4444 12.1924H12.611V39.3499H0.754395V0.349945H21.3474ZM34.8978 13.8842V0.349945H46.7544V13.8842H34.8978Z" fill="#4b73ff"/>
              </svg>
            </div>
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              <p className="text-sm font-bold text-white tracking-tight leading-none">NexaHub</p>
              <p className="text-[10px] text-white/35 mt-0.5 leading-none">Resident portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col px-2 py-3 gap-0.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.to ||
                               (item.to !== "/customer" && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive: navActive }) => classNames(
                    "flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 group/item overflow-hidden",
                    (navActive || isActive)
                      ? "text-electricBlue group-hover/sidebar:bg-electricBlue/10"
                      : "text-white/40 hover:text-white group-hover/sidebar:hover:bg-white/5"
                  )}
                >
                  {({ isActive: navActive }) => (
                    <>
                      <span className={classNames(
                        "shrink-0 size-10 flex items-center justify-center rounded-lg transition-all duration-150",
                        (navActive || isActive)
                          ? "bg-electricBlue/10 group-hover/sidebar:bg-transparent"
                          : "group-hover/item:bg-white/5 group-hover/sidebar:group-hover/item:bg-transparent"
                      )}>
                        <item.icon className={classNames("size-[18px] transition-colors", (navActive || isActive) ? "text-electricBlue" : "text-white/40 group-hover/item:text-white")} />
                      </span>
                      <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap flex-1">
                        {item.name}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Divider + quick action */}
            <div className="my-2 border-t border-obsidianHighlight" />
            <Link
              to="/customer/cases/new"
              className="flex items-center gap-3 rounded-lg text-xs font-medium text-electricBlue group-hover/sidebar:bg-electricBlue/10 transition-all duration-150 overflow-hidden"
            >
              <span className="shrink-0 size-10 flex items-center justify-center rounded-lg bg-electricBlue/10 group-hover/sidebar:bg-transparent">
                <PlusIcon className="size-[18px]" />
              </span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                New case
              </span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
        {/* Top nav */}
        <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-x-3 border-b border-white/10 bg-obsidianNight px-3 shadow-xs">
          <div className="flex flex-1 gap-x-4 items-center">
            <TrackingSearch />

            <div className="flex items-center gap-x-2 ml-auto">
              <Menu as="div" className="relative">
                <MenuButton className="relative flex items-center group/profile rounded-lg px-1 py-0.5 hover:bg-white/[0.04] transition-colors focus:outline-none">
                  <div className="size-7 rounded-full bg-electricBlue/15 text-electricBlue text-[10px] font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-2.5 text-xs font-semibold text-white">{customer.displayName}</span>
                    <ChevronDownIcon className="ml-1 size-4 text-white/40 group-hover/profile:text-white/70 transition-colors" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-obsidianSurface shadow-2xl shadow-black/60 overflow-hidden transition will-change-transform outline-none focus:outline-none ring-0 focus:ring-0 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
                >
                  <div className="px-3 py-3 flex items-center gap-2.5 bg-obsidianNight/40">
                    <div className="size-9 rounded-full bg-electricBlue/15 text-electricBlue text-xs font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{customer.displayName}</p>
                      <p className="text-[10px] text-white/40 truncate">{customer.email}</p>
                    </div>
                  </div>
                  <div className="py-1">
                    <MenuItem>
                      <Link to="/customer/profile" className="block px-3 py-1.5 text-[11px] text-white/70 data-focus:bg-white/[0.04] data-focus:text-white transition-colors">
                        Your profile
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link to="/signin" className="block px-3 py-1.5 text-[11px] text-white/70 data-focus:bg-white/[0.04] data-focus:text-white transition-colors">
                        Sign out
                      </Link>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        {/* Body — case-detail + new-case routes run full-bleed (own scroll) */}
        <main
          className={classNames(
            "flex-1 min-h-0",
            /\/customer\/cases\/(\d+|new)/.test(location.pathname)
              ? "overflow-hidden"
              : "overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6"
          )}
        >
          {/\/customer\/cases\/(\d+|new)/.test(location.pathname) ? (
            <Outlet />
          ) : (
            <div className="flex flex-col min-h-full">
              <div className="flex-1">
                <Outlet />
              </div>
              <footer className="shrink-0 pt-6 text-center text-[10px] text-white/25">
                © {new Date().getFullYear()} Seun. All rights reserved.
              </footer>
            </div>
          )}
        </main>

        {/* Mobile bottom tab bar — only on small screens.
            Rendered as a normal flex child (NOT position:fixed) so it lives
            inside the h-[100dvh] column and always sits above the iOS browser
            toolbar. The safe-area padding clears the home indicator. */}
        <nav
          className="lg:hidden shrink-0 min-h-14 border-t border-obsidianHighlight bg-obsidianNight flex items-stretch"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {navigation.map((item) => {
            const isActive = location.pathname === item.to ||
                             (item.to !== "/customer" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={classNames(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? "text-electricBlue" : "text-white/45 hover:text-white"
                )}
              >
                <item.icon className="size-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </NavLink>
            );
          })}
          <Link
            to="/customer/cases/new"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-electricBlue"
            aria-label="New case"
          >
            <PlusIcon className="size-5" />
            <span className="text-[10px] font-medium">New</span>
          </Link>
          <Link
            to="/signin"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white/45 hover:text-white transition-colors"
            aria-label="Sign out"
          >
            <ArrowRightOnRectangleIcon className="size-5" />
            <span className="text-[10px] font-medium">Sign out</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

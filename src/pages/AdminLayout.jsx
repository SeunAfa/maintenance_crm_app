// "use client";
// import { useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import {
//   Dialog,
//   DialogBackdrop,
//   DialogPanel,
//   Menu,
//   MenuButton,
//   MenuItem,
//   MenuItems,
//   TransitionChild,
// } from "@headlessui/react";
// import {
//   Bars3Icon,
//   BellIcon,
//   CalendarIcon,
//   ChartPieIcon,
//   Cog6ToothIcon,
//   DocumentDuplicateIcon,
//   FolderIcon,
//   HomeIcon,
//   UsersIcon,
//   XMarkIcon,
//   UserIcon,
//   TicketIcon,
//   ClipboardDocumentListIcon,
//   SignalIcon,
//   BookOpenIcon,
//   ChatBubbleLeftRightIcon,
//   PhoneIcon,
//   ListBulletIcon,
//   BriefcaseIcon,
// } from "@heroicons/react/24/outline";
// import {
//   ChevronDownIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/20/solid";

// // const navigation = [
// //   { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
// //   { name: "Call", href: "#", icon: PhoneIcon, current: false },
// //   {
// //     name: "Service Requests",
// //     href: "#",
// //     icon: ClipboardDocumentListIcon,
// //     current: false,
// //   },
// //   {
// //     name: "Recent Service Requests",
// //     href: "#",
// //     icon: ListBulletIcon,
// //     current: false,
// //   },
// //   { name: "Work Orders", href: "#", icon: TicketIcon, current: false },

// //   {
// //     name: "BMS Alerts",
// //     href: "#",
// //     icon: SignalIcon,
// //     current: false,
// //   },
// //   { name: "Users", href: "#", icon: UserIcon, current: false },
// //   { name: "Projects", href: "#", icon: FolderIcon, current: false },
// //   {
// //     name: "Knowledge Bank",
// //     href: "#",
// //     icon: BookOpenIcon,
// //     current: false,
// //   },
// //   {
// //     name: "Messages",
// //     href: "#",
// //     icon: ChatBubbleLeftRightIcon,
// //     current: false,
// //   },
// //   { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
// //   { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
// // ];
// const navigation = [
//   { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
//   { name: "Call", href: "#", icon: PhoneIcon, current: false },
//   {
//     name: "Cases",
//     href: "#",
//     icon: BriefcaseIcon,
//     current: false,
//   },
//   {
//     name: "Service Requests",
//     href: "#",
//     icon: ClipboardDocumentListIcon,
//     current: false,
//   },
//   { name: "Work Orders", href: "#", icon: TicketIcon, current: false },

//   {
//     name: "BMS Alerts",
//     href: "#",
//     icon: SignalIcon,
//     current: false,
//   },
//   { name: "Users", href: "#", icon: UserIcon, current: false },
// ];
// const teams = [
//   { id: 1, name: "Multi", href: "#", initial: "M", current: false },
//   { id: 2, name: "HMRC", href: "#", initial: "H", current: false },
//   { id: 3, name: "Nestle", href: "#", initial: "N", current: false },
//   { id: 3, name: "Kings Hospital", href: "#", initial: "K", current: false },
// ];
// const userNavigation = [
//   { name: "Your profile", href: "#" },
//   { name: "Sign out", href: "#" },
// ];

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();

//   const isManageCases = location.pathname.startsWith("/admin/cases/manage/");

//   return (
//     <>
//       <div>
//         <Dialog
//           open={sidebarOpen}
//           onClose={setSidebarOpen}
//           className="relative z-50 lg:hidden"
//         >
//           <DialogBackdrop
//             transition
//             className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
//           />

//           <div className="fixed inset-0 flex">
//             <DialogPanel
//               transition
//               className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
//             >
//               <TransitionChild>
//                 <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
//                   <button
//                     type="button"
//                     onClick={() => setSidebarOpen(false)}
//                     className="-m-2.5 p-2.5"
//                   >
//                     <span className="sr-only">Close sidebar</span>
//                     <XMarkIcon
//                       aria-hidden="true"
//                       className="size-6 text-white"
//                     />
//                   </button>
//                 </div>
//               </TransitionChild>

//               {/* Sidebar component, swap this element with another sidebar if you like */}
//               <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-obsidianNight px-6 pb-4 ring-1 ring-white/10 before:pointer-events-none before:absolute before:inset-0 before:bg-black/10">
//                 <div className="relative flex h-16 shrink-0 items-center">
//                   <img
//                     alt="Your Company"
//                     src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
//                     className="h-8 w-auto"
//                   />
//                 </div>
//                 <nav className="relative flex flex-1 flex-col">
//                   <ul role="list" className="flex flex-1 flex-col gap-y-7">
//                     <li>
//                       <ul role="list" className="-mx-2 space-y-1">
//                         {navigation.map((item) => (
//                           <li key={item.name}>
//                             <a
//                               href={item.href}
//                               className={classNames(
//                                 item.current
//                                   ? "bg-white/5 text-white"
//                                   : "text-gray-400 hover:bg-white/5 hover:text-white",
//                                 "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
//                               )}
//                             >
//                               <item.icon
//                                 aria-hidden="true"
//                                 className="size-6 shrink-0"
//                               />
//                               {item.name}
//                             </a>
//                           </li>
//                         ))}
//                       </ul>
//                     </li>
//                     <li>
//                       <div className="text-xs/6 font-semibold text-gray-400">
//                         Helpdesk Teams
//                       </div>
//                       <ul role="list" className="-mx-2 mt-2 space-y-1">
//                         {teams.map((team) => (
//                           <li key={team.name}>
//                             <a
//                               href={team.href}
//                               className={classNames(
//                                 team.current
//                                   ? "bg-white/5 text-white"
//                                   : "text-gray-400 hover:bg-white/5 hover:text-white",
//                                 "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
//                               )}
//                             >
//                               <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[0.625rem] font-medium text-gray-400 group-hover:border-white/20 group-hover:text-white">
//                                 {team.initial}
//                               </span>
//                               <span className="truncate">{team.name}</span>
//                             </a>
//                           </li>
//                         ))}
//                       </ul>
//                     </li>
//                     <li className="mt-auto">
//                       <a
//                         href="#"
//                         className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
//                       >
//                         <Cog6ToothIcon
//                           aria-hidden="true"
//                           className="size-6 shrink-0"
//                         />
//                         Settings
//                       </a>
//                     </li>
//                   </ul>
//                 </nav>
//               </div>
//             </DialogPanel>
//           </div>
//         </Dialog>

//         {/* Static sidebar for desktop */}
//         <div className="hidden bg-obsidianNight ring-1 ring-white/10 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
//           {/* Sidebar component, swap this element with another sidebar if you like */}
//           <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 pb-4">
//             <div className="flex h-16 shrink-0 items-center">
//               <img
//                 alt="Your Company"
//                 src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
//                 className="h-8 w-auto"
//               />
//             </div>
//             <nav className="flex flex-1 flex-col">
//               <ul role="list" className="flex flex-1 flex-col gap-y-7">
//                 <li>
//                   <ul role="list" className="-mx-2 space-y-1">
//                     {navigation.map((item) => (
//                       <li key={item.name}>
//                         <a
//                           href={item.href}
//                           className={classNames(
//                             item.current
//                               ? "bg-white/5 text-white"
//                               : "text-gray-400 hover:bg-white/5 hover:text-white",
//                             "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
//                           )}
//                         >
//                           <item.icon
//                             aria-hidden="true"
//                             className="size-6 shrink-0"
//                           />
//                           {item.name}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </li>
//                 <li>
//                   <div className="text-left text-xs/6 font-semibold text-gray-400">
//                     Helpdesk Teams
//                   </div>
//                   <ul role="list" className="-mx-2 mt-2 space-y-1">
//                     {teams.map((team) => (
//                       <li key={team.name}>
//                         <a
//                           href={team.href}
//                           className={classNames(
//                             team.current
//                               ? "bg-white/5 text-white"
//                               : "text-gray-400 hover:bg-white/5 hover:text-white",
//                             "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
//                           )}
//                         >
//                           <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[0.625rem] font-medium text-gray-400 group-hover:border-white/20 group-hover:text-white">
//                             {team.initial}
//                           </span>
//                           <span className="truncate">{team.name}</span>
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </li>
//                 <li className="mt-auto">
//                   <a
//                     href="#"
//                     className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
//                   >
//                     <Cog6ToothIcon
//                       aria-hidden="true"
//                       className="size-6 shrink-0"
//                     />
//                     Settings
//                   </a>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </div>

//         <div className="lg:pl-72 flex flex-col h-dvh">
//           <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-obsidianNight px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
//             <button
//               type="button"
//               onClick={() => setSidebarOpen(true)}
//               className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden"
//             >
//               <span className="sr-only">Open sidebar</span>
//               <Bars3Icon aria-hidden="true" className="size-6" />
//             </button>

//             {/* Separator */}
//             <div aria-hidden="true" className="h-6 w-px bg-yellow lg:hidden" />

//             <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
//               <form action="#" method="GET" className="grid flex-1 grid-cols-1">
//                 <input
//                   name="search"
//                   placeholder="Search"
//                   aria-label="Search"
//                   className="col-start-1 row-start-1 block size-full bg-obsidianNight pl-8 text-base text-white outline-hidden placeholder:text-gray-500 sm:text-sm/6"
//                 />
//                 <MagnifyingGlassIcon
//                   aria-hidden="true"
//                   className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
//                 />
//               </form>
//               <div className="flex items-center gap-x-4 lg:gap-x-6">
//                 <button
//                   type="button"
//                   className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300"
//                 >
//                   <span className="sr-only">View notifications</span>
//                   <BellIcon aria-hidden="true" className="size-6" />
//                 </button>

//                 {/* Separator */}
//                 <div
//                   aria-hidden="true"
//                   className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-100/10"
//                 />

//                 {/* Profile dropdown */}
//                 <Menu as="div" className="relative">
//                   <MenuButton className="relative flex items-center">
//                     <span className="absolute -inset-1.5" />
//                     <span className="sr-only">Open user menu</span>
//                     <img
//                       alt=""
//                       src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//                       className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
//                     />
//                     <span className="hidden lg:flex lg:items-center">
//                       <span
//                         aria-hidden="true"
//                         className="ml-4 text-sm/6 font-semibold text-white"
//                       >
//                         Tom Cook
//                       </span>
//                       <ChevronDownIcon
//                         aria-hidden="true"
//                         className="ml-2 size-5 text-gray-500"
//                       />
//                     </span>
//                   </MenuButton>
//                   <MenuItems
//                     transition
//                     className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-gray-800 py-2 outline -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
//                   >
//                     {userNavigation.map((item) => (
//                       <MenuItem key={item.name}>
//                         <a
//                           href={item.href}
//                           className="block px-3 py-1 text-sm/6 text-white data-focus:bg-white/5 data-focus:outline-hidden"
//                         >
//                           {item.name}
//                         </a>
//                       </MenuItem>
//                     ))}
//                   </MenuItems>
//                 </Menu>
//               </div>
//             </div>
//           </div>
//           <main
//             className={`bg-obsidianSurface flex-1 overflow-y-scroll ${
//               isManageCases ? "overflow-hidden" : "px-8 py-6"
//             }`}
//           >
//             {/* px-8 py-6 */}
//             <div
//               className={`w-full flex ${
//                 isManageCases ? "h-full" : "min-h-full"
//               }`}
//             >
//               <Outlet />
//             </div>
//           </main>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import PhoneCallModal from "../components/PhoneCallModal";
import MasterSearch from "../components/MasterSearch";
import { USERS_DATA } from "../data/usersData";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  UsersIcon,
  XMarkIcon,
  UserIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  SignalIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ListBulletIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

const navigation = [
  { name: "Dashboard",  href: "/admin/dashboard", icon: PresentationChartBarIcon },
  { name: "Cases",      href: "/admin/cases",     icon: BriefcaseIcon            },
  { name: "Work Orders",href: "/admin/workorders", icon: TicketIcon               },
  // BMS Alerts — temporarily disabled
  // { name: "BMS Alerts", href: "#",                icon: SignalIcon               },
  { name: "Users",      href: "/admin/users",     icon: UserIcon                 },
];

const teams = [
  { id: 1, name: "Multi",         href: "#", initial: "M" },
  { id: 2, name: "HMRC",          href: "#", initial: "H" },
  { id: 3, name: "Nestle",        href: "#", initial: "N" },
  { id: 4, name: "Kings Hospital",href: "#", initial: "K" },
];

const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "/signin" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DEMO_CALLERS = USERS_DATA.filter((u) => u.contractType === "Greenwich University");


export default function AdminLayout() {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [showCall,          setShowCall]          = useState(false);
  const [callPhase,         setCallPhase]         = useState("ringing");
  const [callMinimized,     setCallMinimized]     = useState(false);
  const [callSecs,          setCallSecs]          = useState(0);
  const [outboundActive,    setOutboundActive]    = useState(false);
  const [outboundMinimized, setOutboundMinimized] = useState(false);
  const [outboundSecs,      setOutboundSecs]      = useState(0);
  const [lastCaller,     setLastCaller]     = useState(null);
  const [currentCaller,  setCurrentCaller]  = useState(null);
  const [showRedial,     setShowRedial]     = useState(false);
  const [dialNumber,     setDialNumber]     = useState("");
  const [userSearch,     setUserSearch]     = useState("");
  const callerIdxRef                        = useRef(0);
  const phoneBtnRef                       = useRef(null);
  const location = useLocation();

  const isCallActive = showCall && callPhase === "active";

  // Timer — runs while call is active
  useEffect(() => {
    if (!isCallActive) { setCallSecs(0); return; }
    const id = setInterval(() => setCallSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isCallActive]);

  const callTimer = `${String(Math.floor(callSecs / 60)).padStart(2, "0")}:${String(callSecs % 60).padStart(2, "0")}`;

  // Outbound call timer — runs while outbound call is active
  useEffect(() => {
    if (!outboundActive) { setOutboundSecs(0); return; }
    const id = setInterval(() => setOutboundSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [outboundActive]);

  const outboundTimer = `${String(Math.floor(outboundSecs / 60)).padStart(2, "0")}:${String(outboundSecs % 60).padStart(2, "0")}`;

  // Outbound call events (dispatched by OutboundCallModal in Manage.jsx)
  useEffect(() => {
    const onStart    = () => { setOutboundActive(true);  setOutboundMinimized(false); setOutboundSecs(0); };
    const onEnd      = () => { setOutboundActive(false); setOutboundMinimized(false); };
    const onMinimize = () => setOutboundMinimized(true);
    const onRestore  = () => setOutboundMinimized(false);
    window.addEventListener("call:outbound:start",    onStart);
    window.addEventListener("call:outbound:end",      onEnd);
    window.addEventListener("call:outbound:minimize", onMinimize);
    window.addEventListener("call:outbound:restore",  onRestore);
    return () => {
      window.removeEventListener("call:outbound:start",    onStart);
      window.removeEventListener("call:outbound:end",      onEnd);
      window.removeEventListener("call:outbound:minimize", onMinimize);
      window.removeEventListener("call:outbound:restore",  onRestore);
    };
  }, []);

  // Auto-answer when New Case is clicked
  useEffect(() => {
    const handler = (e) => {
      const scenario = e.detail?.scenario;
      if (e.detail?.caller) {
        setCurrentCaller(e.detail.caller);
      } else if (scenario === "new") {
        setCurrentCaller({ displayName: "", contractType: "", phone: "", anonymous: true });
      } else if (scenario === "existing") {
        const james = USERS_DATA.find((u) => u.displayName === "James Thornton");
        setCurrentCaller(james ?? DEMO_CALLERS[callerIdxRef.current]);
      } else {
        callerIdxRef.current = (callerIdxRef.current + 1) % DEMO_CALLERS.length;
        setCurrentCaller(DEMO_CALLERS[callerIdxRef.current]);
      }
      setCallPhase(e.detail?.autoAnswer ? "active" : "ringing");
      setShowCall(true);
      setShowRedial(false);
    };
    window.addEventListener("call:start", handler);
    return () => window.removeEventListener("call:start", handler);
  }, []);

  // End call automatically after 30 s (dispatched by Create.jsx)
  useEffect(() => {
    const onHangup = () => handleEndCall();
    window.addEventListener("call:hangup", onHangup);
    return () => window.removeEventListener("call:hangup", onHangup);
  }, []);

  const startCall = (caller) => {
    const idx = DEMO_CALLERS.findIndex((c) => c === caller);
    callerIdxRef.current = idx >= 0 ? idx : (callerIdxRef.current + 1) % DEMO_CALLERS.length;
    setCurrentCaller(caller);
    setCallPhase("active");
    setCallMinimized(false);
    setShowCall(true);
    setShowRedial(false);
  };

  const handlePhoneBtn = () => {
    if (outboundActive) {
      window.dispatchEvent(new CustomEvent("call:outbound:restore"));
      setOutboundMinimized(false);
      return;
    }
    if (showCall && callMinimized) { setCallMinimized(false); return; }
    if (showCall) return;
    setShowRedial((v) => !v);
  };

  const handleEndCall = () => {
    setLastCaller(currentCaller ?? DEMO_CALLERS[callerIdxRef.current]);
    setShowCall(false);
    setCallPhase("ringing");
    setCallMinimized(false);
    setCurrentCaller(null);
    window.dispatchEvent(new CustomEvent("call:end"));
  };

  const handleSimulateIncoming = () => {
    callerIdxRef.current = (callerIdxRef.current + 1) % DEMO_CALLERS.length;
    setCallPhase("ringing");
    setCallMinimized(false);
    setShowCall(true);
    setShowRedial(false);
  };

  const isManageCases =
    location.pathname.startsWith("/admin/cases/manage/") ||
    location.pathname.startsWith("/admin/workorders/") ||
    location.pathname.startsWith("/admin/users") ||
    location.pathname === "/admin/cases/create" ||
    location.pathname === "/admin/cases" ||
    location.pathname === "/admin/workorders";

  return (
    <>
      {/* LAYOUT WRAPPER 
          Using 'flex' and 'h-screen' to manage the desktop sidebar flow 
      */}
      <div className="flex h-dvh overflow-hidden bg-obsidianSurface">
        {/* Mobile Sidebar (Kept as an Overlay) */}
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />
          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-obsidianNight px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center gap-1.5">
                  <svg viewBox="0 0 48 40" fill="none" className="h-6 w-auto" aria-label="NexaHub">
                    <path d="M21.3474 0.349945L46.7544 25.7266V39.3499H34.8978V30.624L16.4444 12.1924H12.611V39.3499H0.754395V0.349945H21.3474ZM34.8978 13.8842V0.349945H46.7544V13.8842H34.8978Z" fill="#4b73ff"/>
                  </svg>
                  <p className="text-sm font-bold text-white tracking-tight">NexaHub</p>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                location.pathname.startsWith(item.href)
                                  ? "bg-white/5 text-white"
                                  : "text-gray-400 hover:bg-white/5 hover:text-white",
                                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className="size-6 shrink-0"
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    {/* Sign out — pinned to the bottom of the drawer */}
                    <li className="mt-auto -mx-2">
                      <Link
                        to="/signin"
                        onClick={() => setSidebarOpen(false)}
                        className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        <ArrowRightOnRectangleIcon className="size-6 shrink-0" aria-hidden="true" />
                        Sign out
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex lg:flex-col lg:shrink-0 lg:w-[64px] hover:lg:w-60 transition-all duration-300 ease-in-out group/sidebar z-50 border-r border-obsidianHighlight bg-obsidianNight">
          <div className="flex grow flex-col overflow-y-auto overflow-x-hidden">

            {/* Logo — icon slot mirrors the nav-items below so they line up vertically */}
            <div className="flex h-12 shrink-0 items-center px-2 gap-0 border-b border-obsidianHighlight overflow-hidden">
              <div className="shrink-0 size-10 flex items-center justify-center">
                <svg viewBox="0 0 48 40" fill="none" className="h-5 w-auto" aria-label="NexaHub">
                  <path d="M21.3474 0.349945L46.7544 25.7266V39.3499H34.8978V30.624L16.4444 12.1924H12.611V39.3499H0.754395V0.349945H21.3474ZM34.8978 13.8842V0.349945H46.7544V13.8842H34.8978Z" fill="#4b73ff"/>
                </svg>
              </div>
              {/* Wordmark — fades in on expand */}
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                <p className="text-sm font-bold text-white tracking-tight leading-none">NexaHub</p>
                <p className="text-[10px] text-white/35 mt-0.5 leading-none">CRM Maintenance Platform</p>
              </div>
            </div>

            {/* Main nav */}
            <nav className="flex flex-1 flex-col px-2 py-3 gap-0.5">
              {navigation.map((item) => {
                const isActive = item.href !== "#" && location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      "flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 group/item overflow-hidden",
                      // Collapsed: no bg on the link (bg is on icon slot)
                      // Expanded: bg on the full link
                      isActive
                        ? "text-electricBlue group-hover/sidebar:bg-electricBlue/10"
                        : "text-white/40 hover:text-white group-hover/sidebar:hover:bg-white/5"
                    )}
                  >
                    {/* Icon slot — square bg when collapsed, transparent when expanded */}
                    <span className={classNames(
                      "shrink-0 size-10 flex items-center justify-center rounded-lg transition-all duration-150",
                      isActive
                        ? "bg-electricBlue/10 group-hover/sidebar:bg-transparent"
                        : "group-hover/item:bg-white/5 group-hover/sidebar:group-hover/item:bg-transparent"
                    )}>
                      <item.icon className={classNames("size-[18px] transition-colors", isActive ? "text-electricBlue" : "text-white/40 group-hover/item:text-white")} />
                    </span>
                    <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap flex-1">
                      {item.name}
                    </span>
                    {isActive && (
                      <span className="mr-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 size-1.5 rounded-full bg-electricBlue shrink-0" />
                    )}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-2 border-t border-obsidianHighlight" />

              {/* Clients */}
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/20 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Clients
              </p>
              {teams.map((team) => (
                <a
                  key={team.name}
                  href={team.href}
                  className="flex items-center gap-3 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 overflow-hidden"
                >
                  <span className="shrink-0 size-10 flex items-center justify-center">
                    <span className="size-6 rounded-md border border-white/10 bg-white/5 flex items-center justify-center text-[9px] font-bold text-white/50">
                      {team.initial}
                    </span>
                  </span>
                  <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap truncate">
                    {team.name}
                  </span>
                </a>
              ))}
            </nav>

            {/* Bottom — settings */}
            <div className="shrink-0 px-2 py-3 border-t border-obsidianHighlight">
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 overflow-hidden"
              >
                <span className="shrink-0 size-10 flex items-center justify-center">
                  <Cog6ToothIcon className="size-[18px]" />
                </span>
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Settings
                </span>
              </a>
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT AREA 
            - 'flex-1' ensures it fills the rest of the width
            - 'min-w-0' is vital to allow the container to shrink during animation
        */}
        <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
          {/* h-16 */}
          <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-x-3 border-b border-white/10 bg-obsidianNight px-3 shadow-xs sm:gap-x-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
              <MasterSearch />
              <div className="flex items-center gap-x-2 ml-auto">
                {/* Phone button + redial panel */}
                <div className="relative" ref={phoneBtnRef}>
                  <button
                    type="button"
                    onClick={handlePhoneBtn}
                    title={
                      outboundActive ? "Restore outbound call"
                      : showCall && callMinimized ? "Restore call"
                      : isCallActive ? "Call in progress"
                      : "Phone"
                    }
                    className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
                      outboundActive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : showCall
                          ? isCallActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-400/15 text-amber-400"
                          : showRedial
                            ? "bg-white/10 text-white"
                            : "bg-white/[0.06] text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <PhoneIcon aria-hidden="true" className="size-4 shrink-0" />
                    {outboundMinimized && outboundActive && (
                      <span className="font-mono text-[11px] font-semibold leading-none pr-1">{outboundTimer}</span>
                    )}
                    {!outboundActive && callMinimized && isCallActive && (
                      <span className="font-mono text-[11px] font-semibold leading-none pr-1">{callTimer}</span>
                    )}
                    {(outboundActive || showCall) && (
                      <>
                        <span className={`absolute inset-0 rounded-lg animate-pulse pointer-events-none ${outboundActive || isCallActive ? "bg-emerald-500/15" : "bg-amber-400/15"}`} />
                        <span className={`absolute top-0.5 right-0.5 size-2 rounded-full ring-2 ring-obsidianNight pointer-events-none ${outboundActive || isCallActive ? "bg-emerald-400" : "bg-amber-400"}`} />
                      </>
                    )}
                  </button>

                  {/* Redial panel */}
                  {showRedial && !showCall && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowRedial(false)} />
                      <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-obsidianHighlight bg-obsidianSurface shadow-2xl shadow-black/60 overflow-hidden">

                        {/* Last caller / redial */}
                        {lastCaller ? (
                          <div className="p-3 border-b border-obsidianHighlight">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Last call</p>
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-full bg-electricBlue/10 text-electricBlue text-[10px] font-bold flex items-center justify-center shrink-0">
                                {lastCaller.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-white truncate">{lastCaller.displayName}</p>
                                <p className="text-[10px] text-white/35 truncate">{lastCaller.phone || "+44 7700 900000"}</p>
                              </div>
                              <button
                                onClick={() => startCall(lastCaller)}
                                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors"
                              >
                                <PhoneIcon className="size-3" />
                                Redial
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-3 pt-3 pb-1">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">No recent calls</p>
                          </div>
                        )}

                        {/* Find user */}
                        <div className="p-3 border-b border-obsidianHighlight">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Find user</p>
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-obsidianNight border border-obsidianHighlight focus-within:border-electricBlue/40 transition-colors mb-1.5">
                            <MagnifyingGlassIcon className="size-3.5 text-white/25 shrink-0" />
                            <input
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              placeholder="Name, email or number…"
                              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
                            />
                            {userSearch && (
                              <button onClick={() => setUserSearch("")} className="text-white/25 hover:text-white/60 transition-colors text-[10px]">✕</button>
                            )}
                          </div>
                          {userSearch.trim() && (() => {
                            const q = userSearch.toLowerCase();
                            const results = USERS_DATA.filter((u) =>
                              u.displayName?.toLowerCase().includes(q) ||
                              u.email?.toLowerCase().includes(q) ||
                              u.phone?.toLowerCase().includes(q)
                            ).slice(0, 5);
                            return (
                              <div className="divide-y divide-obsidianHighlight/50">
                                {results.length === 0 ? (
                                  <p className="py-3 text-[11px] text-white/25 text-center">No users found</p>
                                ) : results.map((u) => {
                                  const initials = (u.displayName ?? "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                                  return (
                                    <div key={u.id ?? u.email} className="flex items-center gap-2 py-1.5 hover:bg-obsidianHighlight/30 -mx-1 px-1 rounded transition-colors">
                                      <div className="size-6 rounded-full bg-electricBlue/10 text-electricBlue text-[9px] font-bold flex items-center justify-center shrink-0">
                                        {initials}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-white truncate">{u.displayName}</p>
                                        <p className="text-[10px] text-white/30 truncate">{u.phone || u.email}</p>
                                      </div>
                                      <button
                                        onClick={() => { startCall(u); setUserSearch(""); }}
                                        className="shrink-0 flex items-center justify-center size-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                      >
                                        <PhoneIcon className="size-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Manual dial */}
                        <div className="p-3">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Dial number</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="tel"
                              value={dialNumber}
                              onChange={(e) => setDialNumber(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && dialNumber.trim()) {
                                  startCall({ displayName: dialNumber.trim(), phone: dialNumber.trim(), contractType: "Manual dial" });
                                  setDialNumber("");
                                }
                              }}
                              placeholder="+44 7700 000000"
                              className="flex-1 bg-obsidianNight border border-obsidianHighlight rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-electricBlue/50"
                            />
                            <button
                              onClick={() => {
                                if (!dialNumber.trim()) return;
                                startCall({ displayName: dialNumber.trim(), phone: dialNumber.trim(), contractType: "Manual dial" });
                                setDialNumber("");
                              }}
                              className="shrink-0 flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              <PhoneIcon className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-300 rounded-md hover:bg-white/[0.04] transition-colors"
                >
                  <BellIcon aria-hidden="true" className="size-5" />
                </button>
                <div
                  aria-hidden="true"
                  className="hidden lg:block lg:h-5 lg:w-px lg:bg-white/10 lg:mx-1"
                />

                <Menu as="div" className="relative">
                  <MenuButton className="relative flex items-center group/profile rounded-lg px-1 py-0.5 hover:bg-white/[0.04] transition-colors focus:outline-none">
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      className="size-7 rounded-full bg-obsidianHighlight"
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-2.5 text-xs font-semibold text-white">Tom Cook</span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="ml-1 size-4 text-white/40 group-hover/profile:text-white/70 transition-colors"
                      />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-obsidianSurface shadow-2xl shadow-black/60 overflow-hidden transition will-change-transform outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
                  >
                    {/* Profile header */}
                    <div className="px-3 py-3 flex items-center gap-2.5 bg-obsidianNight/40">
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80"
                        className="size-9 rounded-full bg-obsidianHighlight"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">Tom Cook</p>
                        <p className="text-[10px] text-white/40 truncate">tom.cook@nexahub.app</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-1">
                      {userNavigation.map((item) => (
                        <MenuItem key={item.name}>
                          <Link
                            to={item.href}
                            className="block px-3 py-1.5 text-[11px] text-white/70 data-focus:bg-white/[0.04] data-focus:text-white transition-colors"
                          >
                            {item.name}
                          </Link>
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <main
            className={classNames(
              "flex-1 min-h-0", // ← min-h-0 is critical in flex columns
              isManageCases ? "overflow-hidden" : "overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
            )}
          >
            <div
              className={classNames(
                "w-full flex",
                isManageCases ? "h-full" : "min-h-full"
              )}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {showCall && !callMinimized && (
        <PhoneCallModal
          caller={currentCaller ?? DEMO_CALLERS[callerIdxRef.current]}
          initialPhase={callPhase}
          onAnswer={() => setCallPhase("active")}
          onMinimize={() => setCallMinimized(true)}
          onClose={handleEndCall}
        />
      )}
    </>
  );
}

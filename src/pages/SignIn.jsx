import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import InputField from "../components/InputField";

// Demo accounts — credentials are pre-filled and locked in this prototype so
// the user can hop straight into either surface without typing anything.
const ACCOUNTS = {
  agent: {
    label:      "Helpdesk Agent",
    description:"Manage cases, work orders and engineers",
    Icon:       BriefcaseIcon,
    displayName:"Jordan Smith",
    email:      "j.smith@greenwich.ac.uk",
    password:   "demo-agent-2026",
    redirect:   "/admin",
  },
  customer: {
    label:      "Customer",
    description:"Raise and track your own cases",
    Icon:       UserIcon,
    displayName:"Amara Osei",
    email:      "amara.osei@greenwich.ac.uk",
    password:   "demo-customer-2026",
    redirect:   "/customer/dashboard",
  },
};

// Pseudo-realistic auth phases — the UI walks through each before redirect.
const AUTH_PHASES = [
  { key: "verify",  label: "Verifying credentials",   delay: 600 },
  { key: "session", label: "Establishing session",    delay: 550 },
  { key: "load",    label: "Loading your workspace",  delay: 700 },
];

export default function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("agent");
  const [phaseIdx, setPhaseIdx] = useState(-1); // -1 = idle
  const account = ACCOUNTS[mode];
  const isLoading = phaseIdx >= 0;

  useEffect(() => {
    if (!isLoading) return;
    if (phaseIdx >= AUTH_PHASES.length) {
      navigate(account.redirect);
      return;
    }
    const t = setTimeout(() => setPhaseIdx((i) => i + 1), AUTH_PHASES[phaseIdx].delay);
    return () => clearTimeout(t);
  }, [phaseIdx, isLoading, account.redirect, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) setPhaseIdx(0);
  };

  const handleSwitchMode = (key) => {
    if (isLoading) return;
    setMode(key);
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-obsidianNight">
      {/* Left panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Brand */}
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
            Welcome to <span className="text-electricBlue">Nexa Hub</span>
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Sign in to your account to continue.
          </p>

          {/* Mode switcher */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-obsidianSurface p-1 ring-1 ring-white/5">
            {Object.entries(ACCOUNTS).map(([key, acc]) => {
              const active = mode === key;
              const Icon = acc.Icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSwitchMode(key)}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    active
                      ? "bg-electricBlue text-white shadow-lg shadow-electricBlue/25"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {acc.label}
                </button>
              );
            })}
          </div>

          {/* Active account card */}
          <div className="mt-4 rounded-xl bg-obsidianSurface p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-electricBlue/10 flex items-center justify-center shrink-0">
                <account.Icon className="size-5 text-electricBlue" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-white truncate">{account.displayName}</p>
                <p className="text-[11px] text-white/45 truncate">{account.description}</p>
              </div>
            </div>
          </div>

          {/* Locked credentials form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <InputField
              id={`email-${mode}`}
              key={`email-${mode}`}
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              value={account.email}
              readOnly
              fieldLocked
            />

            <InputField
              id={`password-${mode}`}
              key={`password-${mode}`}
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={account.password}
              readOnly
              fieldLocked
            />

            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <LockClosedIcon className="size-3" />
              Demo mode — credentials are pre-filled and locked.
            </div>

            <SubmitButton isLoading={isLoading} label={account.label} />

            {isLoading && <AuthProgress phaseIdx={phaseIdx} />}
          </form>

          <p className="mt-6 text-center text-[11px] text-white/35">
            Looking to follow a case?{" "}
            <button
              type="button"
              onClick={() => !isLoading && navigate("/track-case/CASE-001")}
              disabled={isLoading}
              className="text-electricBlue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use the public tracker
            </button>
          </p>
        </div>
      </div>

      {/* Right panel — image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          src="https://image.cdn.uscholars.in/media/institutions_banner/pexels-diana-rafira-1255009548-25012237.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {isLoading && <div className="absolute inset-0 bg-obsidianNight/40" />}
      </div>
    </div>
  );
}

// ─── Submit button with built-in spinner ─────────────────────────────────────
function SubmitButton({ isLoading, label }) {
  const base =
    "mt-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-300";

  if (isLoading) {
    return (
      <button
        type="submit"
        disabled
        className={`${base} bg-electricBlue/70 text-white cursor-wait`}
      >
        <Spinner />
        Signing in…
      </button>
    );
  }
  return (
    <button
      type="submit"
      className={`${base} bg-electricBlue text-white shadow-lg shadow-electricBlue/25 hover:-translate-y-0.5 hover:bg-electricBlue/90`}
    >
      Sign in as {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin text-white/90" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Auth phase progress list ────────────────────────────────────────────────
function AuthProgress({ phaseIdx }) {
  return (
    <ul className="mt-1 space-y-1.5 rounded-lg bg-obsidianSurface/60 px-3 py-2.5 ring-1 ring-white/5">
      {AUTH_PHASES.map((p, i) => {
        const done    = phaseIdx > i;
        const active  = phaseIdx === i;
        const pending = phaseIdx < i;
        return (
          <li key={p.key} className="flex items-center gap-2 text-[11px]">
            {done && <DoneTick />}
            {active && <Spinner />}
            {pending && <PendingDot />}
            <span
              className={
                done
                  ? "text-white/55"
                  : active
                  ? "text-white font-medium"
                  : "text-white/30"
              }
            >
              {p.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function DoneTick() {
  return (
    <svg className="size-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.55a1 1 0 0 1-1.42 0l-3.5-3.524a1 1 0 1 1 1.42-1.41l2.79 2.81 6.79-6.84a1 1 0 0 1 1.408 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PendingDot() {
  return <span className="ml-0.5 size-2 rounded-full bg-white/15 shrink-0" />;
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  UserIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import DropdownList from "../components/DropdownList";
import LargeBtn from "../components/LargeBtn";
import { workerRoles } from "../utils/constants";

export default function UserRoleSelection() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [workerRole, setWorkerRole] = useState("");

  const canSignIn =
    selected === "requester" || (selected === "worker" && workerRole !== "");

  return (
    <div className="min-h-screen bg-obsidianNight flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Header */}
        <h1
          className="text-4xl font-black text-white text-center leading-tight mb-1"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
        >
          Welcome to <span className="text-electricBlue">Nexa Hub</span>
        </h1>
        <p className="text-white/70 text-sm text-center mb-3 leading-relaxed max-w-s">
          A modern facility management platform for tracking tasks and managing
          daily operations efficiently.
        </p>
        <p className="text-white/70 text-sm text-center mb-2 leading-relaxed max-w-s">
          Select how you want to login to explore the app
        </p>

        {/* Role Cards */}
        <div className="w-full flex flex-col gap-4">
          {/* Facility Worker */}
          <div className="w-full flex flex-col">
            <button
              onClick={() => {
                const next = selected === "worker" ? null : "worker";
                setSelected(next);
                setWorkerRole("");
                setDropdownOpen(false);
              }}
              className={`group w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300
                ${
                  selected === "worker"
                    ? "bg-obsidianElevated border-3 border-obsidianSurface"
                    : "bg-obsidianSurface border-3 border-obsidianElevated hover:bg-obsidianElevated hover:border-obsidianSurface hover:-translate-y-0.5"
                }`}
            >
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300
                ${
                  selected === "worker"
                    ? "bg-obsidianSurface"
                    : "bg-obsidianElevated group-hover:bg-obsidianSurface"
                }`}
              >
                <BriefcaseIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-lg text-slate-100">
                  Facility Worker
                </div>
                <div className="text-xs mt-0.5 text-white/70">
                  Manage tasks, facilities & operations
                </div>
              </div>
              <ChevronRightIcon
                className={`w-5 h-5 transition-transform duration-300 ${
                  selected === "worker"
                    ? "rotate-90 text-electricBlue"
                    : "text-white/70"
                }`}
              />
            </button>

            {/* Slide wrapper */}
            <DropdownList
              selectedKey={selected}
              isVisibleKey="worker"
              value={workerRole}
              setValue={setWorkerRole}
              options={workerRoles}
              placeholder="Select your role…"
            />
          </div>

          {/* Requester — fixed: was checking selected === "worker" everywhere */}
          <button
            onClick={() => {
              setSelected(selected === "requester" ? null : "requester");
              setWorkerRole("");
              setDropdownOpen(false);
            }}
            className={`group w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300
              ${
                selected === "requester"
                  ? "bg-obsidianElevated border-3 border-obsidianSurface"
                  : "bg-obsidianSurface border-3 border-obsidianElevated hover:bg-obsidianElevated hover:border-obsidianSurface hover:-translate-y-0.5"
              }`}
          >
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300
              ${
                selected === "requester"
                  ? "bg-obsidianSurface"
                  : "bg-obsidianElevated group-hover:bg-obsidianSurface"
              }`}
            >
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-lg text-slate-100">
                Requester / User
              </div>
              <div className="text-xs mt-0.5 text-white/70">
                Submit requests & track their status
              </div>
            </div>
            <CheckIcon
              className={`w-5 h-5 transition-all duration-300 ${
                selected === "requester"
                  ? "text-electricBlue"
                  : "text-white/70 opacity-0"
              }`}
            />
          </button>
        </div>

        {/* Sign In Button */}
        <LargeBtn
          onClick={() => canSignIn && navigate("/signin")}
          text={
            canSignIn
              ? `Let's Sign In${workerRole ? ` as ${workerRole}` : ""}`
              : "Let's Sign In"
          }
          conditional={true}
          isConditionalActive={canSignIn}
        />

        <p className="mt-6 text-white/50 text-xs text-center">
          No account needed · Demo mode
        </p>
      </div>
    </div>
  );
}

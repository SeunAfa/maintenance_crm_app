import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { USERS_DATA } from "../data/usersData";

function getInitials(displayName = "") {
  return displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function RequesterSearchOverlay({ isOpen, onClose, onSelect, contractType }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const contractUsers = contractType
    ? USERS_DATA.filter((u) => u.contractType === contractType)
    : USERS_DATA;

  const filtered =
    query.trim() === ""
      ? contractUsers
      : contractUsers.filter((u) => {
          const q = query.toLowerCase();
          return (
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q)
          );
        });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (user) => {
    onSelect(user);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidianNight/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl flex flex-col overflow-hidden bg-obsidianSurface border border-obsidianHighlight"
        style={{ maxHeight: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-obsidianHighlight">
          <span className="text-sm font-semibold text-white">
            Select Affected Requester
          </span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <XMarkIcon className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-obsidianHighlight">
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="absolute left-3 size-4 text-white/30" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-md bg-obsidianElevated border border-obsidianHighlight py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/30">
            Showing users for <span className="text-white/50">{contractType}</span>
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-white/30">
              <UserCircleIcon className="size-8 mb-2" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-obsidianHighlight"
              >
                {/* Avatar */}
                <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-white bg-electricBlue">
                  {getInitials(user.displayName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user.displayName}</p>
                  <p className="text-[11px] text-white/40 truncate">
                    {user.userRole} · {user.site}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

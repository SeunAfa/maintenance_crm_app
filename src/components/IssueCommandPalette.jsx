import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  CheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { SUB_CATEGORIES_ISSUE } from "../data/subCategoriesIssues";

const CATS = SUB_CATEGORIES_ISSUE;

// Injected once at module level — avoids re-injecting on every render
const _styleEl = (() => {
  if (typeof document === "undefined") return null;
  const id = "__icp-styles__";
  if (document.getElementById(id)) return null;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2f3037; border-radius: 4px; }
    @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  `;
  document.head.appendChild(el);
  return el;
})();

const SEV = {
  critical: { label: "Critical", color: "#EF4444" },
  high: { label: "High", color: "#F97316" },
  medium: { label: "Medium", color: "#3B82F6" },
  low: { label: "Low", color: "#64748B" },
};

function Highlight({ text, q }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color: "#F59E0B", fontWeight: 600 }}>
        {text.slice(i, i + q.length)}
      </span>
      {text.slice(i + q.length)}
    </>
  );
}

function SevBadge({ severity }) {
  const s = SEV[severity];
  return (
    <span
      style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 500, color: s.color }}>
        {s.label}
      </span>
    </span>
  );
}

function findDefaultMatch(issueObj) {
  if (!issueObj) return null;
  for (const cat of CATS) {
    const found = cat.issues.find((i) => i.id === issueObj.id);
    if (found) return { ...found, category: cat };
  }
  return null;
}

export default function IssueCommandPalette({
  onSelect,
  placeholder = "Select service category",
  label = "Service Category",
  isRequired = false,
  className,
  style,
  defaultValue,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState("cats");
  const [catIdx, setCatIdx] = useState(0);
  const [issueIdx, setIssueIdx] = useState(0);
  const [searchIdx, setSearchIdx] = useState(0);
  const [selected, setSelected] = useState(() =>
    findDefaultMatch(defaultValue)
  );

  useEffect(() => {
    const match = defaultValue ? findDefaultMatch(defaultValue) : null;
    setSelected(match ?? null);
  }, [defaultValue?.id]);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const catListRef = useRef(null);
  const issueListRef = useRef(null);
  const searchListRef = useRef(null);

  const allIssues = CATS.flatMap((c) =>
    c.issues.map((i) => ({ ...i, category: c }))
  );
  const searchResults = query.trim()
    ? allIssues.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.code.toLowerCase().includes(query.toLowerCase()) ||
          i.category.label.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  const activeCat = CATS[catIdx];
  const catIssues = activeCat
    ? activeCat.issues.map((i) => ({ ...i, category: activeCat }))
    : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setPanel("cats");
      setCatIdx(0);
      setIssueIdx(0);
      setSearchIdx(0);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    setIssueIdx(0);
  }, [catIdx]);
  useEffect(() => {
    setSearchIdx(0);
  }, [query]);

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    catListRef.current?.children[catIdx]?.scrollIntoView({ block: "nearest" });
  }, [catIdx]);
  useEffect(() => {
    issueListRef.current?.children[issueIdx]?.scrollIntoView({
      block: "nearest",
    });
  }, [issueIdx]);
  useEffect(() => {
    searchListRef.current?.children[searchIdx]?.scrollIntoView({
      block: "nearest",
    });
  }, [searchIdx]);

  function select(issue) {
    setSelected(issue);
    onSelect?.(issue);
    setOpen(false);
  }

  const handleKey = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (query) {
        if (!searchResults?.length) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSearchIdx((i) => Math.min(i + 1, searchResults.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSearchIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          select(searchResults[searchIdx]);
        }
        return;
      }
      if (panel === "cats") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCatIdx((i) => Math.min(i + 1, CATS.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setCatIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          setPanel("issues");
          setIssueIdx(0);
        }
      } else {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setIssueIdx((i) => Math.min(i + 1, catIssues.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setIssueIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPanel("cats");
        } else if (e.key === "Enter") {
          e.preventDefault();
          select(catIssues[issueIdx]);
        }
      }
    },
    [open, query, panel, catIdx, issueIdx, searchIdx, searchResults, catIssues]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const hintKeys = query
    ? [
        ["↑↓", "navigate"],
        ["↵", "select"],
        ["Esc", "close"],
      ]
    : panel === "cats"
    ? [
        ["↑↓", "categories"],
        ["→ / ↵", "issues"],
        ["Esc", "close"],
      ]
    : [
        ["↑↓", "issues"],
        ["↵", "select"],
        ["←", "back"],
        ["Esc", "close"],
      ];

  const T = {
    bg: "#0F1117",
    surface: "#16181F",
    surfaceHov: "#2f3037",
    border: "#252836",
    borderStrong: "#2E3145",
    text: "#E8EAF0",
    textMuted: "#8B90A8",
    textFaint: "#454B65",
    font: "'DM Sans', system-ui, sans-serif",
    mono: "'DM Mono', monospace",
    radius: 14,
    radiusSm: 8,
  };

  return (
    <div style={{ fontFamily: T.font, ...style }} className={className}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 14,
          lineHeight: "1.5rem",
          fontWeight: 300,
          color: "#fff",
          marginBottom: 2,
        }}
      >
        {label}
        {isRequired && <span style={{ color: "#ef4444" }}>*</span>}
        {disabled && <LockClosedIcon style={{ width: 12, height: 12, color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />}
      </label>

      <div ref={wrapRef} style={{ position: "relative", marginTop: 2 }}>
        {/* Trigger button */}
        <button
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
            border: "none",
            outline: disabled
              ? "1px solid rgba(255,255,255,0.06)"
              : open
              ? "2px solid #4b73ff"
              : "1px solid rgba(255,255,255,0.10)",
            outlineOffset: open && !disabled ? "-2px" : "-1px",
            borderRadius: 6,
            borderBottomLeftRadius: open ? 0 : 6,
            borderBottomRightRadius: open ? 0 : 6,
            padding: "4px 12px",
            height: "auto",
            cursor: disabled ? "default" : "pointer",
            fontFamily: T.font,
            transition: "outline 0.12s",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {selected ? (
            <span
              style={{
                color: selected.category.accent,
                display: "flex",
                flexShrink: 0,
              }}
            >
              {selected.category.icon}
            </span>
          ) : (
            <span style={{ color: T.textFaint, display: "flex" }}>
              <MagnifyingGlassIcon
                aria-hidden="true"
                className={clsx("size-3.5 text-white/50")}
              />
            </span>
          )}

          {selected ? (
            <span
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  lineHeight: "1.5rem",
                  color: T.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selected.title}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: T.mono,
                  flexShrink: 0,
                }}
                className="text-white"
              >
                {selected.code}
              </span>
              <SevBadge severity={selected.severity} />
            </span>
          ) : (
            <span
              style={{
                flex: 1,
                textAlign: "left",
                fontSize: 14,
                lineHeight: "1.5rem",
              }}
              className="text-gray-500"
            >
              Select service issue…
            </span>
          )}

          {selected ? (
            // ✅ FIX: was <button> — can't nest a button inside a button.
            // Replaced with <span role="button"> to fix the hydration error.
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setSelected(null);
                }
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textFaint,
                padding: 4,
                borderRadius: 6,
                display: "flex",
                flexShrink: 0,
              }}
              aria-label="Clear selection"
            >
              <XMarkIcon
                aria-hidden="true"
                className={clsx("size-3.5 text-white/50")}
              />
            </span>
          ) : (
            <span
              style={{ color: T.textFaint, display: "flex", flexShrink: 0 }}
            >
              <ChevronDownIcon
                aria-hidden="true"
                className={clsx("size-3.5 text-white/50")}
                style={{
                  transition: "transform 0.2s",
                  transform: open ? "rotate(180deg)" : "none",
                }}
              />
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% - 1px)",
              left: 0,
              right: 0,
              zIndex: 50,
              borderTop: "none",
              borderRadius: `0 0 6px 6px`,
              overflow: "hidden",
              animation: "dropIn 0.18s cubic-bezier(.16,1,.3,1)",
              willChange: "transform",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
            }}
            className="bg-obsidianSurface border-2 border-white/10"
          >
            {/* Search */}
            <div
              style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: T.radiusSm,
                  padding: "0 12px",
                  height: 36,
                }}
                className="bg-obsidianSurface outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-electricBlue"
              >
                <span style={{ color: T.textFaint, display: "flex" }}>
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className={clsx("size-3.5 text-white/50")}
                  />
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by name or code…"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: T.text,
                    fontFamily: T.font,
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.textFaint,
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <XMarkIcon
                      aria-hidden="true"
                      className={clsx("size-3.5 text-white/50")}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Browse mode */}
            {!query && (
              <div style={{ display: "flex", height: 308 }}>
                {/* Category column */}
                <div
                  style={{
                    width: 182,
                    overflowY: "auto",
                    flexShrink: 0,
                  }}
                  className="border-r-2 border-white/10"
                >
                  <div style={{ padding: "8px 14px 4px" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: T.textFaint,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Categories
                    </span>
                  </div>
                  <div ref={catListRef}>
                    {CATS.map((cat, idx) => {
                      const active = catIdx === idx;
                      return (
                        <div
                          key={cat.id}
                          onMouseEnter={() => {
                            setCatIdx(idx);
                            setPanel("cats");
                          }}
                          onClick={() => {
                            setCatIdx(idx);
                            setPanel("issues");
                            setIssueIdx(0);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            padding: "8px 14px",
                            cursor: "pointer",
                            background: active ? T.surfaceHov : "transparent",
                            borderLeft: `2px solid ${
                              active ? cat.accent : "transparent"
                            }`,
                            transition: "background 0.08s",
                            userSelect: "none",
                          }}
                        >
                          <span
                            style={{
                              color: active ? cat.accent : T.textFaint,
                              display: "flex",
                              flexShrink: 0,
                            }}
                          >
                            {cat.icon}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: active ? 500 : 400,
                                color: active ? T.text : T.textMuted,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {cat.label}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              color: T.textFaint,
                              flexShrink: 0,
                            }}
                          >
                            {cat.issues.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Issues column */}
                <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
                  {!activeCat ? (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <p style={{ fontSize: 12, color: T.textFaint }}>
                        Select a category
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          padding: "9px 14px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                        className="bg-obsidianElevated"
                      >
                        {panel === "issues" && (
                          <button
                            onClick={() => setPanel("cats")}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: T.textFaint,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              marginRight: 2,
                            }}
                          >
                            <ChevronLeftIcon
                              aria-hidden="true"
                              className={clsx("size-3.5 text-white/50")}
                            />
                          </button>
                        )}
                        <span
                          style={{ color: activeCat.accent, display: "flex" }}
                        >
                          {activeCat.icon}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: T.textMuted,
                          }}
                        >
                          {activeCat.label}
                        </span>
                      </div>
                      <div ref={issueListRef}>
                        {catIssues.map((issue, idx) => {
                          const hov = panel === "issues" && idx === issueIdx;
                          const isSel = selected?.id === issue.id;
                          return (
                            <div
                              key={issue.id}
                              onMouseEnter={() => {
                                setIssueIdx(idx);
                                setPanel("issues");
                              }}
                              onClick={() => select(issue)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 14px",
                                cursor: "pointer",
                                background: hov ? T.surfaceHov : "transparent",
                                borderLeft: `2px solid ${
                                  isSel ? activeCat.accent : "transparent"
                                }`,
                                transition: "background 0.08s",
                                userSelect: "none",
                              }}
                              className="border-b-white/10 border-b-2"
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    color: hov || isSel ? T.text : T.textMuted,
                                    letterSpacing: "-0.01em",
                                  }}
                                >
                                  {issue.title}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: T.textFaint,
                                    fontFamily: T.mono,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  {issue.code}
                                </p>
                              </div>
                              <SevBadge severity={issue.severity} />
                              {isSel && (
                                <CheckIcon
                                  aria-hidden="true"
                                  className={clsx("size-3.5 text-white/50")}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Search mode */}
            {query && (
              <div style={{ maxHeight: 308, overflowY: "auto" }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: T.textFaint }}>
                      No results for "{query}"
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: "8px 14px 4px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: T.textFaint,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {searchResults.length} result
                        {searchResults.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div ref={searchListRef}>
                      {searchResults.map((issue, idx) => {
                        const hov = idx === searchIdx;
                        const isSel = selected?.id === issue.id;
                        return (
                          <div
                            key={issue.id}
                            onMouseEnter={() => setSearchIdx(idx)}
                            onClick={() => select(issue)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "9px 14px",
                              cursor: "pointer",
                              background: hov ? T.surfaceHov : "transparent",
                              borderBottom: `1px solid ${T.border}`,
                              borderLeft: `2px solid ${
                                isSel || hov
                                  ? issue.category.accent
                                  : "transparent"
                              }`,
                              transition: "background 0.08s",
                              userSelect: "none",
                            }}
                          >
                            <span
                              style={{
                                color: issue.category.accent,
                                display: "flex",
                                flexShrink: 0,
                              }}
                            >
                              {issue.category.icon}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  color: hov || isSel ? T.text : T.textMuted,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                <Highlight text={issue.title} q={query} />
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  color: T.textFaint,
                                }}
                              >
                                {issue.category.label}
                                <span style={{ color: T.border }}> · </span>
                                <span
                                  style={{
                                    fontFamily: T.mono,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  {issue.code}
                                </span>
                              </p>
                            </div>
                            <SevBadge severity={issue.severity} />
                            {isSel && (
                              <CheckIcon
                                aria-hidden="true"
                                className={clsx("size-3.5 text-white/50")}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                padding: "7px 14px",
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
              }}
              className="bg-obsidianSurface border-t-2 border-white/10"
            >
              {hintKeys.map(([k, l]) => (
                <span
                  key={k}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <kbd
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 5,
                      padding: "1px 6px",
                      fontSize: 10,
                      color: T.textFaint,
                      fontFamily: T.font,
                    }}
                  >
                    {k}
                  </kbd>
                  <span style={{ fontSize: 10, color: T.textFaint }}>{l}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from "react";
// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT – ResizableDivider
// ─────────────────────────────────────────────────────────────────────────────
export default function ResizableDivider({ onDrag }) {
  const dragging = useRef(false);
  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) onDrag(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onDrag]);
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1.5 shrink-0 cursor-col-resize bg-slate-100 hover:bg-indigo-300 active:bg-indigo-400 transition-colors flex items-center justify-center group"
      title="Drag to resize"
    >
      <div className="w-0.5 h-8 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
    </div>
  );
}

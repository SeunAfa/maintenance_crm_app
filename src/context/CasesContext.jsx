import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_CASES } from "../data/casesData";
import { buildTrackingLink } from "../utils/comms";
import {
  deleteCaseLogic,
  updateCaseLogic,
  addCaseLogic,
} from "../controllers/caseController";

const CasesContext = createContext();

const STORAGE_KEY = "cases";

// Migration that runs on every load: rewrite any tracker URL in agent
// replies to the current canonical form returned by `buildTrackingLink`
// (which uses the live origin in dev). Applies to all cases — converted or
// not — so non-WO cases' acknowledgement links also resolve to a working
// route. Also strips any leftover WO references from older saved data.
function migrateTrackingLinks(cases) {
  return cases.map((c) => {
    if (!c?.caseId || !Array.isArray(c.messages)) return c;
    const trackUrl = buildTrackingLink(c.caseId);
    let touched = false;
    const messages = c.messages.map((m) => {
      if (m.from !== "agent") return m;
      const body = m.text ?? m.body ?? "";
      const next = body
        // Rewrite any tracker URL (legacy WO-keyed or case-keyed, any host)
        // to the current /track-case/CASE-X form on the live origin.
        .replace(/https?:\/\/[^\s]+\/(?:track|track-case)\/[A-Z0-9-]+/gi, trackUrl)
        // Replace any "Work Order Reference: WO-X" / "Work Order: WO-X" lines
        .replace(/Work Order Reference: WO-\d+\s*/gi, `Case: ${c.caseId}\n`)
        .replace(/Work Order: WO-\d+\s*/gi, `Case: ${c.caseId}\n`)
        .replace(/\n{3,}/g, "\n\n");
      if (next === body) return m;
      touched = true;
      return { ...m, text: next };
    });
    return touched ? { ...c, messages } : c;
  });
}

export const CasesProvider = ({ children }) => {
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_CASES;
    const savedCases = JSON.parse(saved);
    const savedIds = new Set(savedCases.map((c) => c.id));
    // Merge: keep saved cases + inject any new seed cases missing from storage
    const newSeedCases = INITIAL_CASES.filter((c) => !savedIds.has(c.id));
    const merged = newSeedCases.length > 0 ? [...savedCases, ...newSeedCases] : savedCases;
    return migrateTrackingLinks(merged);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }, [cases]);

  const addCase = (newCase) => {
    const updated = addCaseLogic(cases, newCase);
    setCases(updated);
  };

  const updateCase = (id, updates) => {
    const updated = updateCaseLogic(cases, id, updates);
    setCases(updated);
  };

  const deleteCase = (id) => {
    const updated = deleteCaseLogic(cases, id);
    setCases(updated);
  };

  return (
    <CasesContext.Provider value={{ cases, addCase, updateCase, deleteCase }}>
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => useContext(CasesContext);

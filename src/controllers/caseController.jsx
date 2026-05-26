// Example: business logic before deleting

export const deleteCaseLogic = (cases, id) => {
  const caseToDelete = cases.find((c) => c.id === Number(id));

  // 🔥 Business rule example
  if (!caseToDelete) return cases;

  if (caseToDelete.status === "in-progress") {
    console.warn("Cannot delete a case in progress");
    return cases;
  }

  return cases.filter((c) => c.id !== Number(id));
};

export const updateCaseLogic = (cases, id, updates) => {
  return cases.map((c) =>
    c.id === Number(id) ? { ...c, ...updates, updatedAt: new Date() } : c
  );
};

export const addCaseLogic = (cases, newCase) => {
  return [
    ...cases,
    {
      id: Date.now(),
      status: "open",
      createdAt: new Date(),
      ...newCase, // newCase.id overrides the default id above
    },
  ];
};

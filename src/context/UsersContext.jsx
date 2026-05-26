import { createContext, useContext, useState, useEffect } from "react";
import { USERS_DATA } from "../data/usersData";

const UsersContext = createContext();

const STORAGE_KEY  = "createdUsers";
const EDITS_KEY    = "userEdits";

export function UsersProvider({ children }) {
  const [extraUsers, setExtraUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
  });

  const [userEdits, setUserEdits] = useState(() => {
    try { return JSON.parse(localStorage.getItem(EDITS_KEY)) ?? {}; }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extraUsers));
  }, [extraUsers]);

  useEffect(() => {
    localStorage.setItem(EDITS_KEY, JSON.stringify(userEdits));
  }, [userEdits]);

  const applyEdits = (u) => ({ ...u, ...(userEdits[String(u.id)] ?? {}) });

  const allUsers = [
    ...USERS_DATA.map(applyEdits),
    ...extraUsers.map(applyEdits),
  ];

  const addUser = (user) => {
    const id = Date.now();
    setExtraUsers((prev) => [...prev, { ...user, id, _created: true }]);
    return id;
  };

  const updateUser = (id, updates) => {
    setUserEdits((prev) => ({
      ...prev,
      [String(id)]: { ...(prev[String(id)] ?? {}), ...updates },
    }));
  };

  return (
    <UsersContext.Provider value={{ users: allUsers, addUser, updateUser }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);

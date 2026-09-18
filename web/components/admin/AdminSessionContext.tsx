"use client";

import { createContext, useContext } from "react";

type AdminSessionValue = { name: string; role: string };

const AdminSessionContext = createContext<AdminSessionValue>({ name: "", role: "" });

export function AdminSessionProvider({
  value,
  children,
}: {
  value: AdminSessionValue;
  children: React.ReactNode;
}) {
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

/** Admin's display name/role, set once by the layout — lets AdminPageHeader's user menu reach it without every page passing it down. */
export function useAdminSession() {
  return useContext(AdminSessionContext);
}

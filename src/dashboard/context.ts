import { createContext, useContext } from "react";
import type { DashboardState, GroupKey, Role } from "../types";

export interface DashboardContextValue {
  state: DashboardState;
  patch: (payload: Partial<DashboardState>) => void;
  switchRole: (role: Role) => void;
  selectGroup: (group: GroupKey) => void;
}

export const DashboardContext = createContext<DashboardContextValue | null>(
  null,
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard 必须在 DashboardProvider 内使用");
  return context;
}

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from "react";
import { customerSeeds, groups, initialState } from "../data";
import type { DashboardState, GroupKey, Role } from "../types";
import { DashboardContext, type DashboardContextValue } from "./context";
import { dashboardSearchFromState, dashboardStateFromSearch } from "./urlState";

type Action =
  | { type: "patch"; payload: Partial<DashboardState> }
  | { type: "switch-role"; payload: Role }
  | { type: "select-group"; payload: GroupKey }
  | { type: "hydrate"; payload: DashboardState };

function reducer(state: DashboardState, action: Action): DashboardState {
  if (action.type === "hydrate") return action.payload;
  if (action.type === "switch-role") {
    return {
      ...state,
      role: action.payload,
      route: action.payload === "supervisor" ? "overview" : "analysis",
      expandedGroup: action.payload === "leader" ? state.group : null,
    };
  }

  if (action.type === "select-group") {
    const group = action.payload;
    const platforms = groups[group].platforms;
    const firstCustomer = customerSeeds.find((customer) =>
      platforms.includes(customer.platform),
    );
    return {
      ...state,
      group,
      expandedGroup: group,
      uploadPlatform: platforms[0],
      selectedCustomer: firstCustomer?.name ?? state.selectedCustomer,
      customerPlatform: "all",
      page: 1,
    };
  }

  const next = { ...state, ...action.payload };
  if (action.payload.period) next.page = 1;
  if (next.role === "leader" && next.route === "overview")
    next.route = "analysis";
  if (next.role === "supervisor" && next.route === "upload")
    next.route = "overview";
  return next;
}

export function DashboardProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState, (defaults) =>
    typeof window === "undefined"
      ? defaults
      : dashboardStateFromSearch(window.location.search, defaults),
  );
  const applyingHistory = useRef(false);
  const lastSearch = useRef(
    typeof window === "undefined" ? "" : window.location.search,
  );

  useEffect(() => {
    const handlePopState = () => {
      applyingHistory.current = true;
      lastSearch.current = window.location.search;
      dispatch({
        type: "hydrate",
        payload: dashboardStateFromSearch(window.location.search, initialState),
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const search = dashboardSearchFromState(state);
    if (search === lastSearch.current) {
      applyingHistory.current = false;
      return;
    }
    const url = `${window.location.pathname}${search}${window.location.hash}`;
    if (applyingHistory.current) {
      window.history.replaceState(null, "", url);
      applyingHistory.current = false;
    } else {
      window.history.pushState(null, "", url);
    }
    lastSearch.current = search;
  }, [state]);
  const value = useMemo<DashboardContextValue>(
    () => ({
      state,
      patch: (payload) => dispatch({ type: "patch", payload }),
      switchRole: (role) => dispatch({ type: "switch-role", payload: role }),
      selectGroup: (group) =>
        dispatch({ type: "select-group", payload: group }),
    }),
    [state],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

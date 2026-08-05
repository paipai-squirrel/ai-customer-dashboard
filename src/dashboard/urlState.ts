import { groups, initialState } from "../data";
import type {
  DashboardState,
  GroupKey,
  Period,
  Role,
  Route,
  SortDirection,
  SortKey,
} from "../types";

const roles = new Set<Role>(["supervisor", "leader"]);
const groupKeys = new Set<GroupKey>(["private", "talent", "distribution"]);
const routes = new Set<Route>([
  "overview",
  "analysis",
  "customers",
  "detail",
  "upload",
]);
const periods = new Set<Period>(["day", "week", "month", "custom"]);
const sortKeys = new Set<SortKey>([
  "sales",
  "sales7d",
  "sales30d",
  "yoy",
  "month",
  "week",
  "day",
  "monthOnMonth",
  "quarter",
  "half",
]);
const sortDirections = new Set<SortDirection>(["asc", "desc"]);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function enumValue<T extends string>(
  value: string | null,
  values: Set<T>,
  fallback: T,
) {
  return value && values.has(value as T) ? (value as T) : fallback;
}

function textValue(value: string | null, fallback: string) {
  return value?.trim() ? value.trim().slice(0, 120) : fallback;
}

function dateValue(value: string | null, fallback: string) {
  return value && isoDate.test(value) ? value : fallback;
}

export function dashboardStateFromSearch(
  search: string,
  defaults: DashboardState = initialState,
): DashboardState {
  const params = new URLSearchParams(search);
  const role = enumValue(params.get("role"), roles, defaults.role);
  const group = enumValue(params.get("group"), groupKeys, defaults.group);
  let route = enumValue(params.get("view"), routes, defaults.route);
  if (role === "leader" && route === "overview") route = "analysis";
  if (role === "supervisor" && route === "upload") route = "overview";

  const allowedPlatforms = groups[group].platforms;
  const requestedPlatform = params.get("platform");
  const customerPlatform =
    requestedPlatform === "all" ||
    (requestedPlatform && allowedPlatforms.includes(requestedPlatform))
      ? requestedPlatform
      : defaults.customerPlatform;
  const requestedUploadPlatform = params.get("uploadPlatform");
  const uploadPlatform =
    requestedUploadPlatform &&
    allowedPlatforms.includes(requestedUploadPlatform)
      ? requestedUploadPlatform
      : allowedPlatforms[0];
  const requestedPage = Number.parseInt(params.get("page") ?? "", 10);

  return {
    ...defaults,
    role,
    group,
    route,
    expandedGroup: route === "overview" ? null : group,
    period: enumValue(params.get("period"), periods, defaults.period),
    dateStart: dateValue(params.get("from"), defaults.dateStart),
    dateEnd: dateValue(params.get("to"), defaults.dateEnd),
    selectedDate: dateValue(params.get("date"), defaults.selectedDate),
    uploadPlatform,
    selectedCustomer: textValue(
      params.get("customer"),
      defaults.selectedCustomer,
    ),
    customerPlatform,
    activity: textValue(params.get("activity"), defaults.activity),
    followup: textValue(params.get("followup"), defaults.followup),
    search: params.get("q")?.slice(0, 120) ?? defaults.search,
    sortKey: enumValue(params.get("sort"), sortKeys, defaults.sortKey),
    sortDirection: enumValue(
      params.get("direction"),
      sortDirections,
      defaults.sortDirection,
    ),
    page:
      Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  };
}

export function dashboardSearchFromState(state: DashboardState) {
  const params = new URLSearchParams();
  params.set("role", state.role);
  params.set("group", state.group);
  params.set("view", state.route);
  params.set("period", state.period);
  params.set("date", state.selectedDate);
  if (state.period === "custom") {
    params.set("from", state.dateStart);
    params.set("to", state.dateEnd);
  }
  if (state.route === "customers") {
    if (state.customerPlatform !== "all")
      params.set("platform", state.customerPlatform);
    if (state.activity !== "all") params.set("activity", state.activity);
    if (state.followup !== "all") params.set("followup", state.followup);
    if (state.search) params.set("q", state.search);
    params.set("sort", state.sortKey);
    params.set("direction", state.sortDirection);
    params.set("page", String(state.page));
  }
  if (state.route === "detail") params.set("customer", state.selectedCustomer);
  if (state.route === "upload")
    params.set("uploadPlatform", state.uploadPlatform);
  return `?${params.toString()}`;
}

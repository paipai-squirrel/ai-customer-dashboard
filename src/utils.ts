import { activityLevels, customerSeeds, followupLevels, groups } from "./data";
import type { Customer, DashboardState, SortKey } from "./types";

export const yuan = (value: number) => `¥${value.toLocaleString("zh-CN")}`;

export function activityClass(level: string) {
  if (level === "高活跃") return "high";
  if (level === "活跃") return "active";
  if (level === "稳定客户") return "stable";
  if (level === "观察客户") return "watch";
  if (level === "风险客户" || level === "流失预警客户") return "risk";
  return "lost";
}

export function deltaClass(value: string) {
  if (value === "暂无") return "delta-empty";
  return value.startsWith("-") ? "delta-down" : "delta-up";
}

export function customersForGroup(state: DashboardState): Customer[] {
  const platforms = groups[state.group].platforms;
  const scoped = customerSeeds.filter((customer) =>
    platforms.includes(customer.platform),
  );
  const source = scoped.length ? scoped : customerSeeds;

  return Array.from({ length: 86 }, (_, index) => {
    const base = source[index % source.length];
    if (index < source.length) return base;
    const round = Math.floor(index / source.length) + 1;
    const factor = 0.74 + (index % 9) * 0.06;
    return {
      ...base,
      name: `${base.name} · ${String(round).padStart(2, "0")}`,
      sales: Math.round(base.sales * factor),
      sales7d: Math.round(base.sales7d * factor),
      sales30d: Math.round(base.sales30d * factor),
      orders: Math.max(1, Math.round(base.orders * factor)),
      activity: activityLevels[index % activityLevels.length],
      followup: followupLevels[index % followupLevels.length],
    };
  });
}

function percentValue(value: string) {
  if (value === "暂无") return Number.NEGATIVE_INFINITY;
  return Number.parseFloat(value.replace("%", "")) || 0;
}

export function filteredCustomers(state: DashboardState) {
  const query = state.search.trim().toLocaleLowerCase("zh-CN");
  const percentageKeys = new Set<SortKey>([
    "yoy",
    "month",
    "week",
    "day",
    "monthOnMonth",
    "quarter",
    "half",
  ]);
  const rows = customersForGroup(state).filter((row) => {
    return (
      (state.customerPlatform === "all" ||
        row.platform === state.customerPlatform) &&
      (state.activity === "all" || row.activity === state.activity) &&
      (state.followup === "all" || row.followup === state.followup) &&
      (!query || row.name.toLocaleLowerCase("zh-CN").includes(query))
    );
  });
  const direction = state.sortDirection === "asc" ? 1 : -1;
  return rows.sort((left, right) => {
    const leftValue = percentageKeys.has(state.sortKey)
      ? percentValue(left[state.sortKey] as string)
      : Number(left[state.sortKey]);
    const rightValue = percentageKeys.has(state.sortKey)
      ? percentValue(right[state.sortKey] as string)
      : Number(right[state.sortKey]);
    return (leftValue - rightValue) * direction;
  });
}

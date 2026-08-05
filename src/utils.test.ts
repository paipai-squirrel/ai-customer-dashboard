import { describe, expect, it } from "vitest";
import { initialState } from "./data";
import { activityClass, filteredCustomers, yuan } from "./utils";

describe("dashboard utilities", () => {
  it("formats RMB values for Chinese locale", () => {
    expect(yuan(12860)).toBe("¥12,860");
  });

  it("filters customers by keyword and keeps group scope", () => {
    const rows = filteredCustomers({ ...initialState, search: "杭州" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.name.includes("杭州星选"))).toBe(true);
    expect(rows.every((row) => row.platform === "有赞")).toBe(true);
  });

  it("maps risk levels to the risk visual state", () => {
    expect(activityClass("流失预警客户")).toBe("risk");
    expect(activityClass("高活跃")).toBe("high");
  });
});

import { describe, expect, it } from "vitest";
import { initialState } from "../data";
import { dashboardSearchFromState, dashboardStateFromSearch } from "./urlState";

describe("dashboard URL state", () => {
  it("round-trips customer filters", () => {
    const expected = {
      ...initialState,
      route: "customers" as const,
      expandedGroup: "private" as const,
      search: "杭州",
      activity: "高活跃",
      page: 2,
    };
    const restored = dashboardStateFromSearch(
      dashboardSearchFromState(expected),
    );
    expect(restored).toMatchObject({
      route: "customers",
      search: "杭州",
      activity: "高活跃",
      page: 2,
    });
  });

  it("rejects invalid values and forbidden role routes", () => {
    const restored = dashboardStateFromSearch(
      "?role=supervisor&group=unknown&view=upload&page=-2&date=not-a-date",
    );
    expect(restored.route).toBe("overview");
    expect(restored.group).toBe(initialState.group);
    expect(restored.page).toBe(1);
    expect(restored.selectedDate).toBe(initialState.selectedDate);
  });
});

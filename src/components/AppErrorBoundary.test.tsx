import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "./AppErrorBoundary";

function BrokenWidget(): never {
  throw new Error("test-render-failure");
}

describe("AppErrorBoundary", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows a recoverable fallback when a child fails", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenWidget />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("看板暂时无法显示");
    expect(
      screen.getByRole("button", { name: "刷新页面" }),
    ).toBeInTheDocument();
  });
});

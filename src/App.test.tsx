import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("customer dashboard", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("switches roles and opens the upload page", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "渠道总览页" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "组长端" }));
    expect(
      screen.getByRole("heading", { name: "私域组 · 组别分析页" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /销售数据上传页/ }));
    expect(
      screen.getByRole("heading", { name: "私域组 · 销售数据上传页" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "选择销售数据文件" }),
    ).toBeInTheDocument();

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInstanceOf(HTMLInputElement);
    await user.upload(
      fileInput as HTMLInputElement,
      new File(["customer,sales"], "sales.csv", { type: "text/csv" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("sales.csv");
  });

  it("opens a customer list and filters by name", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /私域组/ }));
    await user.click(screen.getByRole("button", { name: /客户列表页/ }));
    const search = screen.getByRole("textbox", { name: "搜索客户名称" });
    await user.type(search, "杭州");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("杭州");
    expect(screen.getAllByText(/杭州星选私域客户/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/成都团长联盟/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "杭州星选私域客户" }));
    expect(
      screen.getByRole("heading", {
        name: "杭州星选私域客户 · 客户详情页",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("冻干粉礼盒").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /返回客户列表/ }));
    expect(
      screen.getByRole("heading", { name: "私域组 · 客户列表页" }),
    ).toBeInTheDocument();
  });

  it("restores the customer view and filters from the URL", () => {
    window.history.replaceState(
      null,
      "",
      "/?role=supervisor&group=private&view=customers&period=day&date=2026-07-28&q=%E6%9D%AD%E5%B7%9E&sort=sales&direction=desc&page=1",
    );
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "私域组 · 客户列表页" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "搜索客户名称" })).toHaveValue(
      "杭州",
    );
    expect(screen.queryByText(/成都团长联盟/)).not.toBeInTheDocument();
  });

  it("shows an empty state and resets all filters", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /私域组/ }));
    await user.click(screen.getByRole("button", { name: /客户列表页/ }));
    await user.type(
      screen.getByRole("textbox", { name: "搜索客户名称" }),
      "不存在的客户",
    );
    expect(screen.getByText("没有符合当前筛选条件的客户")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重置筛选" }));
    expect(screen.getByText(/展示 1-20 条，共 86 条/)).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("q")).toBeNull();
  });

  it("rejects unsupported upload files", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "组长端" }));
    await user.click(screen.getByRole("button", { name: /销售数据上传页/ }));
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [
          new File(["unsafe"], "orders.exe", {
            type: "application/octet-stream",
          }),
        ],
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent("文件格式不支持");
  });
});

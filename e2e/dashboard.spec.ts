import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("persists filters across reload and browser history", async ({ page }) => {
  await page.getByRole("button", { name: /私域组/ }).click();
  await page.getByRole("button", { name: /客户列表页/ }).click();
  await page.getByRole("textbox", { name: "搜索客户名称" }).fill("杭州");
  await expect(page).toHaveURL(/view=customers/);
  await expect(page).toHaveURL(/q=%E6%9D%AD%E5%B7%9E/);

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "私域组 · 客户列表页" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "搜索客户名称" })).toHaveValue(
    "杭州",
  );

  await page.goBack();
  await expect(page.getByRole("textbox", { name: "搜索客户名称" })).toHaveValue(
    "",
  );
  await page.goForward();
  await expect(page.getByRole("textbox", { name: "搜索客户名称" })).toHaveValue(
    "杭州",
  );
});

test("enforces role routes and validates uploads", async ({ page }) => {
  await page.goto(
    "/?role=supervisor&group=private&view=upload&period=day&date=2026-07-28",
  );
  await expect(page.getByRole("heading", { name: "渠道总览页" })).toBeVisible();

  await page.getByRole("button", { name: "组长端" }).click();
  await page.getByRole("button", { name: /销售数据上传页/ }).click();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "orders.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("unsafe"),
  });
  await expect(page.getByRole("status")).toContainText("文件格式不支持");
});

test("renders without viewport-level horizontal overflow", async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
});

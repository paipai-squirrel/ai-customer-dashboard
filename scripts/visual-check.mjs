import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const outputDir = new URL("../.visual-check/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

const errors = [];
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
const desktopWidth = await page.evaluate(() => ({
  viewport: innerWidth,
  document: document.documentElement.scrollWidth,
}));
if (desktopWidth.document > desktopWidth.viewport + 1)
  throw new Error(
    `Desktop horizontal overflow: ${JSON.stringify(desktopWidth)}`,
  );
await page.screenshot({
  path: fileURLToPath(new URL("desktop-overview.png", outputDir)),
  fullPage: true,
});

await page.getByRole("button", { name: "组长端" }).click();
await page.getByRole("button", { name: /销售数据上传页/ }).click();
await page.screenshot({
  path: fileURLToPath(new URL("desktop-upload.png", outputDir)),
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
const mobileWidth = await page.evaluate(() => ({
  viewport: innerWidth,
  document: document.documentElement.scrollWidth,
}));
if (mobileWidth.document > mobileWidth.viewport + 1)
  throw new Error(`Mobile horizontal overflow: ${JSON.stringify(mobileWidth)}`);
await page.screenshot({
  path: fileURLToPath(new URL("mobile-overview.png", outputDir)),
  fullPage: true,
});

if (errors.length) throw new Error(`Browser errors:\n${errors.join("\n")}`);
console.log(
  "Visual smoke check passed: desktop overview, upload flow, and mobile overview rendered without browser errors.",
);
await browser.close();

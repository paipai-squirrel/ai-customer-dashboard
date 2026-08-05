import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const budget = JSON.parse(
  await readFile(
    new URL("../performance-budget.json", import.meta.url),
    "utf8",
  ),
);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(path) : [path];
      }),
    )
  ).flat();
}

const files = await filesUnder(distDir);
const sizes = await Promise.all(
  files.map(async (file) => ({ file, bytes: (await stat(file)).size })),
);
const sum = (extension) =>
  sizes
    .filter(({ file }) => extname(file) === extension)
    .reduce((total, { bytes }) => total + bytes, 0);
const result = {
  javascriptBytes: sum(".js"),
  cssBytes: sum(".css"),
  totalBytes: sizes
    .filter(({ file }) => extname(file) !== ".map")
    .reduce((total, { bytes }) => total + bytes, 0),
};
const failures = [
  ["JavaScript", result.javascriptBytes, budget.maxJavaScriptBytes],
  ["CSS", result.cssBytes, budget.maxCssBytes],
  ["total", result.totalBytes, budget.maxTotalBytes],
].filter(([, actual, limit]) => actual > limit);

console.log(`Performance budget (${root}):`, result);
if (failures.length) {
  for (const [name, actual, limit] of failures)
    console.error(`${name} budget exceeded: ${actual} > ${limit} bytes`);
  process.exitCode = 1;
}

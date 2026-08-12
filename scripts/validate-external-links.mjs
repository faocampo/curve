import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();

function filesUnder(directory, suffix) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}

const markdownFiles = [join(root, "docs"), join(root, "contracts")]
  .flatMap((path) => filesUnder(path, ".md"))
  .sort();
const locations = new Map();

for (const file of markdownFiles) {
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, index) => {
      for (const match of line.matchAll(/\[[^\]]*\]\((https?:\/\/[^) >]+)\)/g)) {
        const url = match[1].replace(/[.,;:]$/, "");
        const references = locations.get(url) ?? [];
        references.push(`${relative(root, file)}:${index + 1}`);
        locations.set(url, references);
      }
    });
}

async function check(url) {
  const headers = { "user-agent": "Curve-Docs-Link-Validator/1.0" };
  for (const method of ["HEAD", "GET"]) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(20000)
      });
      if (response.status < 400) return { url, status: response.status };
      if (method === "GET") return { url, status: response.status, error: `HTTP ${response.status}` };
    } catch (error) {
      if (method === "GET") return { url, error: error.message };
    }
  }
}

const urls = [...locations.keys()].sort();
const results = [];
const concurrency = 8;
for (let index = 0; index < urls.length; index += concurrency) {
  results.push(...(await Promise.all(urls.slice(index, index + concurrency).map(check))));
}

const failures = results.filter((result) => result.error);
if (failures.length) {
  failures.forEach((result) => {
    console.error(`${result.url}: ${result.error} (${locations.get(result.url).join(", ")})`);
  });
  process.exit(1);
}

console.log(`Validated ${results.length} external Markdown links.`);

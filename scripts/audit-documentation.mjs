import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { auditDocumentation } from "./lib/documentation-audit.mjs";

const paths = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0").filter((path) => path && path !== "node_modules" && !path.startsWith("node_modules/"));
const result = auditDocumentation(process.cwd(), paths);
for (const { path } of result.files.filter(({ kind }) => ["mjs", "js"].includes(kind))) {
  try { execFileSync(process.execPath, ["--check", path], { stdio: "pipe" }); }
  catch { result.findings.push({ path, rule: "javascript-syntax", detail: "Node syntax check failed" }); }
}
for (const { path } of result.files.filter(({ kind }) => kind === "html")) {
  const body = readFileSync(path, "utf8");
  for (const [index, match] of [...body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].entries()) {
    const type = match[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
    if (/\bsrc\s*=/i.test(match[1]) || (type && !["module", "text/javascript", "application/javascript"].includes(type))) continue;
    try { execFileSync(process.execPath, ["--check", ...(type === "module" ? ["--input-type=module"] : [])], { input: match[2], stdio: ["pipe", "pipe", "pipe"] }); }
    catch { result.findings.push({ path, rule: "inline-javascript-syntax", detail: `Inline script ${index + 1} failed syntax check` }); }
  }
}
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  for (const finding of result.findings) console.error(`${finding.path}: ${finding.rule}: ${finding.detail}`);
  console.log(`Inventoried ${result.files.length} files; ${result.findings.length} structural findings. Semantic review and runtime evidence remain separate.`);
}
if (result.findings.length) process.exitCode = 1;

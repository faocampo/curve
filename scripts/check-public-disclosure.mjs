import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { scanPublicDisclosure } from "./lib/public-disclosure.mjs";

const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const findings = [];
let checked = 0;
for (const path of paths) {
  if (!/\.(?:md|mjs|json|ya?ml|html|ts|tsx|css)$/.test(path)) continue;
  checked++;
  const content = readFileSync(path, "utf8");
  // Upstream package metadata has a published maintainer contact. Preserve it
  // without excluding the lockfile from credential and private-path checks.
  const scanContent = path === "pnpm-lock.yaml"
    ? content.replace(/\bi@izs\.me\b/g, "upstream-maintainer@example.invalid")
    : content;
  findings.push(...scanPublicDisclosure(scanContent, path));
}
for (const finding of findings) console.error(`${finding.path}:${finding.line}: ${finding.rule}`);
if (findings.length) process.exitCode = 1;
else console.log(`Disclosure pattern checks passed for ${checked} tracked text files. Full outbound review remains required.`);

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptRoot, "../..");
const documentRoot = resolve(repoRoot, "docs/technical");
const packetNames = [
  "d002-d004-d005-m1-decision-readiness.md",
  "d006-d007-orca-mcp-decision-readiness.md",
  "d008-d010-d011-decision-readiness.md",
  "d009-owner-workshop-guide.md",
  "d012-d016-rollout-decision-readiness.md",
];
const indexName = "later-milestone-decision-readiness-index.md";

const documents = new Map(
  [...packetNames, indexName].map((name) => [
    name,
    readFileSync(resolve(documentRoot, name), "utf8"),
  ]),
);

for (const [name, document] of documents) {
  assert.match(document, /^# /, `${name}: title`);
  assert.match(document, /^## Document control$/m, `${name}: document control`);
  assert.match(document, /\| Status \| `[^`]+` \|/, `${name}: status`);
  assert.match(document, /NOT IMPLEMENTATION AUTHORITY/, `${name}: authority denial`);
  assert.doesNotMatch(document, /\b(?:TODO|TBD)\b/, `${name}: unresolved placeholder token`);
  assert.doesNotMatch(
    document,
    /\| Status \| `[^`]*\bDECIDED\b[^`]*` \|/,
    `${name}: premature decided status`,
  );

  for (const match of document.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/g)) {
    if (/^https?:/.test(match[1])) continue;
    const target = resolve(documentRoot, match[1]);
    assert.ok(existsSync(target), `${name}: missing local link ${match[1]}`);
  }
}

for (const name of packetNames) {
  const document = documents.get(name);
  assert.match(document, /owner inputs|required owner inputs|Participants required/i, `${name}: owner inputs`);
  assert.match(
    document,
    /Required machine contracts|Outputs|missing contract set|Required MCP-to-Curve schema binding/i,
    `${name}: machine-contract or governed-output section`,
  );
  assert.match(
    document,
    /Acceptance suite|Conformance suite|required before `DECIDED`|Session 4: feasibility and evidence/i,
    `${name}: acceptance or conformance evidence`,
  );
}

const index = documents.get(indexName);
for (const decision of [
  "D-002",
  "D-004",
  "D-005",
  "D-006",
  "D-007",
  "D-008",
  "D-009",
  "D-010",
  "D-011",
  "D-012",
  "D-013",
  "D-014",
  "D-015",
  "D-016",
]) {
  assert.match(index, new RegExp(`\\| ${decision.replace("-", "\\-")} \\([^)]+\\) \\|`), `${decision}: indexed`);
}

for (const milestone of ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "R1"]) {
  assert.match(index, new RegExp(`\\| ${milestone} \\([^)]+\\) \\|`), `${milestone}: readiness projection`);
}

const rollout = documents.get("d012-d016-rollout-decision-readiness.md");
for (const decision of ["D-012", "D-013", "D-014", "D-015", "D-016"]) {
  assert.match(rollout, new RegExp(`^## ${decision.replace("-", "\\-")} \\([^)]+\\)$`, "m"), `${decision}: decision section`);
}
assert.match(rollout, /USD 300 per month/);
assert.match(rollout, /USD 50/);
assert.match(rollout, /USD 10/);
assert.match(rollout, /USD 25/);
assert.match(rollout, /Two allocated runtime hours per attempt/);
assert.match(rollout, /At least 60% reduction/);
assert.match(rollout, /At least 50% reduction/);
assert.match(rollout, /At least 70%/);
assert.match(rollout, /No Critical\/High security finding/);

console.log(
  JSON.stringify(
    {
      documents: documents.size,
      decisionPackets: packetNames.length,
      indexedDecisions: 14,
      milestoneProjections: 8,
      status: "PACKETS_READY_DECISIONS_OPEN",
    },
    null,
    2,
  ),
);

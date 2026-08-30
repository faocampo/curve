import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  acceptanceCriteriaDigest,
  extractPrdAcceptanceCriteria,
} from "../lib/test-strategy.mjs";

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
const developmentPlanName = "development-plan.md";
const packageCatalogName = "m1-m7-task-packets.md";
const m1PacketName = "m1-alignment-evidence-prd-task-packet.md";
const architectureName = "architecture.md";
const mcpAdrName = "adr-007-mcp-trust-and-orca-profile.md";

const documents = new Map(
  [
    ...packetNames,
    indexName,
    developmentPlanName,
    packageCatalogName,
    m1PacketName,
    architectureName,
    mcpAdrName,
  ].map((name) => [
    name,
    readFileSync(resolve(documentRoot, name), "utf8"),
  ]),
);

const prd = readFileSync(resolve(repoRoot, "docs/curve-ai-native-sdlc-prd.md"), "utf8");
const matrix = JSON.parse(
  readFileSync(resolve(repoRoot, "contracts/testing/ac-test-matrix-v2.json"), "utf8"),
);

function packageIds(document) {
  return new Set(
    [...document.matchAll(/^\| (M[1-7]-\d{2}[A-Z]?)(?: \([^)]+\))? \|/gm)].map(
      ([, packageId]) => packageId,
    ),
  );
}

function packageRow(document, packageId) {
  const escaped = packageId.replace("-", "\\-");
  const match = document.match(new RegExp(`^\\| ${escaped}(?: \\([^)]+\\))? \\|.*$`, "m"));
  assert.ok(match, `${packageId}: package row`);
  return match[0];
}

function criterion(acId) {
  const entry = matrix.acceptance_criteria.find((candidate) => candidate.ac_id === acId);
  assert.ok(entry, `${acId}: acceptance-criteria row`);
  return entry;
}

for (const name of [...packetNames, indexName]) {
  const document = documents.get(name);
  assert.match(document, /^# /, `${name}: title`);
  assert.match(document, /^## Document control$/m, `${name}: document control`);
  assert.match(document, /\| Status \| `[^`]+` \|/, `${name}: status`);
  if (name === indexName) {
    assert.match(document, /authorizes no code/i, `${name}: authority denial`);
  } else {
    assert.match(document, /NOT IMPLEMENTATION AUTHORITY/, `${name}: authority denial`);
  }
  assert.doesNotMatch(document, /\b(?:TODO|TBD)\b/, `${name}: unresolved placeholder token`);
  assert.doesNotMatch(
    document,
    /\| Status \| `[^`]*\bDECIDED\b[^`]*` \|/,
    `${name}: premature decided status`,
  );

}

assert.match(
  documents.get(indexName),
  /^\| Version \| 1\.2 \|$/m,
  `${indexName}: reconciled version`,
);
assert.match(
  documents.get(indexName),
  /^\| Prepared \| 2026-08-30 \|$/m,
  `${indexName}: reconciled preparation date`,
);

for (const [name, document] of documents) {
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
assert.doesNotMatch(index, /PACKETS READY/i, "index must not imply implementation readiness");
assert.match(
  index,
  /DECISION-READINESS PACKETS PREPARED \/ OWNER DECISIONS OPEN \/ IMPLEMENTATION PACKETS UNMATERIALIZED/,
  "index must distinguish decision preparation from implementation authority",
);

const developmentPlan = documents.get(developmentPlanName);
const packageCatalog = documents.get(packageCatalogName);
for (const [name, document] of [
  [developmentPlanName, developmentPlan],
  [packageCatalogName, packageCatalog],
]) {
  assert.match(document, /machine(?:-readable)? source-catalog/i, `${name}: source catalog binding`);
  assert.match(document, /canonical (?:packet|payload) digest/i, `${name}: canonical packet digest`);
  assert.match(document, /Context Manifest/i, `${name}: context manifest`);
  assert.match(document, /dispatch preflight/i, `${name}: dispatch preflight`);
  assert.match(
    document,
    /separate(?: human-attested)? implementation authorization|separate record governed by the/i,
    `${name}: separate authority`,
  );
  for (const phase of ["LINT", "BUILD", "TEST", "SECURITY", "LOCAL_RUN"]) {
    assert.match(document, new RegExp(`\\b${phase}\\b`), `${name}: mandatory ${phase} phase`);
  }
}

const decisionPacketOwnership = new Map([
  ["D-002", "d002-d004-d005-m1-decision-readiness.md"],
  ["D-004", "d002-d004-d005-m1-decision-readiness.md"],
  ["D-005", "d002-d004-d005-m1-decision-readiness.md"],
  ["D-006", "d006-d007-orca-mcp-decision-readiness.md"],
  ["D-007", "d006-d007-orca-mcp-decision-readiness.md"],
  ["D-008", "d008-d010-d011-decision-readiness.md"],
  ["D-009", "d009-owner-workshop-guide.md"],
  ["D-010", "d008-d010-d011-decision-readiness.md"],
  ["D-011", "d008-d010-d011-decision-readiness.md"],
  ["D-012", "d012-d016-rollout-decision-readiness.md"],
  ["D-013", "d012-d016-rollout-decision-readiness.md"],
  ["D-014", "d012-d016-rollout-decision-readiness.md"],
  ["D-015", "d012-d016-rollout-decision-readiness.md"],
  ["D-016", "d012-d016-rollout-decision-readiness.md"],
]);
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
  const packetName = decisionPacketOwnership.get(decision);
  assert.match(index, new RegExp(`\\(${packetName.replaceAll(".", "\\.")}\\)`), `${decision}: packet linked`);
  assert.match(documents.get(packetName), new RegExp(`\\b${decision.replace("-", "\\-")}\\b`), `${decision}: owned by packet`);
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

const planPackages = [...packageIds(developmentPlan)].sort();
const catalogPackages = [...packageIds(packageCatalog)].sort();
const activeCatalogPackages = catalogPackages.filter((packageId) => !packageId.startsWith("M7-"));
assert.deepEqual(
  activeCatalogPackages,
  planPackages,
  "every M1-M6 development-plan row must have one materialization-catalog trace",
);
assert.equal(
  catalogPackages.filter((packageId) => packageId.startsWith("M7-")).length,
  5,
  "the deferred M7 charter must retain its five non-active catalog records",
);
assert.match(developmentPlan, /M7 is post-R1 scope and is intentionally outside/i);
assert.match(packageCatalog, /M7 remains outside the active .* catalog/i);
assert.match(packageCatalog, /M7.*(?:DEFERRED|deferred)/s);

assert.match(packageRow(developmentPlan, "M4-03"), /P0-08/);
assert.match(packageRow(developmentPlan, "M4-04"), /P0-07/);
assert.match(packageRow(developmentPlan, "M5-01"), /P0-11/);
assert.match(packageRow(developmentPlan, "M5-02"), /P0-07/);
assert.match(packageRow(developmentPlan, "M5-02"), /P0-11/);
assert.match(packageRow(developmentPlan, "M5-03"), /D-004/);
assert.match(packageRow(developmentPlan, "M5-03"), /D-005/);
assert.match(packageRow(developmentPlan, "M5-03"), /D-014/);
assert.match(packageRow(developmentPlan, "M5-05"), /P0-10/);
assert.match(packageRow(developmentPlan, "M5-07"), /D-010/);
assert.match(packageRow(developmentPlan, "M6-01"), /P0-07/);
assert.match(packageRow(developmentPlan, "M6-05"), /D-005.*provider|provider.*D-005/i);

assert.match(packageRow(developmentPlan, "M2-06"), /DEFERRED|future decision/i);
assert.doesNotMatch(packageRow(developmentPlan, "M2-06"), /validated manual\/import workflow/i);
assert.match(packageRow(developmentPlan, "M3-04"), /deterministic/i);
assert.match(packageRow(developmentPlan, "M3-04"), /model-assisted|model generation/i);
assert.doesNotMatch(developmentPlan, /both agent providers/i);
assert.match(developmentPlan, /OpenHands.*AgentExecutionProvider.*Orca.*MCP/s);

const m1Packet = documents.get(m1PacketName);
assert.match(m1Packet, /PARTIALLY_IMPLEMENTED \/ CHILD_PACKET_GATED/);
assert.match(m1Packet, /manual artifact-body persistence/i);
assert.match(m1Packet, /no-model\/zero-budget|no-model and zero-budget/i);

const architecture = documents.get(architectureName);
assert.match(architecture, /manual-first/i);
assert.doesNotMatch(architecture, /manual recreation or validated import/i);

const mcpAdr = documents.get(mcpAdrName);
assert.match(mcpAdr, /stateless/i);
assert.match(mcpAdr, /MCP-Protocol-Version/);
assert.match(mcpAdr, /Mcp-Method/);
assert.doesNotMatch(mcpAdr, /session-era|initialization negotiation/i);

assert.equal(matrix.status, "IN_REVIEW", "P0-05 v2 successor must remain unapproved");
assert.equal(matrix.source.prd_version, "0.13", "P0-05 v2 must bind current PRD version");
const criteria = extractPrdAcceptanceCriteria(prd, matrix.source.section);
assert.equal(matrix.source.acceptance_criteria_digest, acceptanceCriteriaDigest(criteria));

for (const commandPattern of [
  /knowledge.*provider/i,
  /repository.*discovery/i,
  /automated.*execution/i,
  /vcs.*mutation/i,
]) {
  assert.ok(
    matrix.commands.some(
      (command) => commandPattern.test(command.id) || commandPattern.test(command.name),
    ),
    `missing split conformance command ${commandPattern}`,
  );
}

assert.doesNotMatch(criterion("AC-03").evidence_requirement, /model.*required for manual/i);
assert.doesNotMatch(criterion("AC-05").evidence_requirement, /skip.*requires.*model/i);
assert.match(criterion("AC-16").evidence_requirement, /OpenHands/i);
assert.match(criterion("AC-16").evidence_requirement, /Orca.*MCP/i);
assert.doesNotMatch(criterion("AC-16").evidence_requirement, /Orca.*AgentExecutionProvider/i);

console.log(
  JSON.stringify(
    {
      documents: documents.size,
      decisionPackets: packetNames.length,
      indexedDecisions: 14,
      milestoneProjections: 8,
      implementationPackages: planPackages.length,
      status: "DECISION_PACKETS_PREPARED_IMPLEMENTATION_PACKETS_UNMATERIALIZED",
    },
    null,
    2,
  ),
);

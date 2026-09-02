import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const prd = read("docs/curve-ai-native-sdlc-prd.md");
const workflows = read("docs/technical/workflows-and-sequences.md");
const engineering = read("docs/technical/engineering-patterns-and-technologies.md");
const c4 = read("docs/technical/c4-architecture.md");
const m7 = read("docs/technical/m7-intelligence-and-automation-extension.md");
const remediation = read("docs/technical/review-analysis-and-remediation.md");
const architecture = read("docs/technical/architecture.md");
const development = read("docs/technical/development-plan.md");
const decisions = read("docs/technical/architecture-decisions.md");
const codingDecision = read("docs/technical/coding-agent-local-execution-decision.md");
const runtimePacket = read("docs/technical/runtime-m0-01-graceful-shutdown-task-packet.md");
const foundation = read("docs/technical/plane-foundation-inventory.md");
const readiness = read("docs/technical/m0-readiness-board.md");
const m0Audit = read("docs/technical/m0-completion-audit.md");
const strategy = read("docs/technical/m0-test-strategy.md");
const technicalIndex = read("docs/technical/README.md");
const contractIndex = read("contracts/README.md");
const productPacket = read("docs/technical/m1-00a-product-core-task-packet.md");
const productEvidence = read("docs/technical/m1-00a-product-core-implementation-evidence.md");
const productRelational = read("contracts/database/m1-00a-product-core-relational-contract.md");
const m1Alignment = read("docs/technical/m1-alignment-evidence-prd-task-packet.md");
const laterPackets = read("docs/technical/m1-m7-task-packets.md");
const laterIndex = read("docs/technical/later-milestone-decision-readiness-index.md");
const implementedErd = read("docs/technical/implemented-entity-relationship-model.md");
const projectMap = read("docs/technical/github-project-execution-map.md");
const runtimeRefresh = read("docs/technical/local-runtime-refresh-evidence.md");
const projectSync = read("scripts/sync-github-project.mjs");

const versionMatch = prd.match(/^\| Version\s+\|\s+([0-9.]+)\s+\|$/m);
assert.ok(versionMatch, "PRD document-control version is required");
const prdVersion = versionMatch[1];

test("active architecture specifications bind the current PRD version", () => {
  for (const [name, contents] of [
    ["workflows", workflows],
    ["engineering", engineering],
    ["C4", c4],
    ["M7 extension", m7],
  ]) {
    assert.match(contents, new RegExp(`Curve PRD v${prdVersion.replace(".", "\\.")}`), name);
  }
});

test("active current-state documents bind one accepted Plane preview", () => {
  const currentPlane = "99a73b4eab5ee21fd012d7358bc9259252d47f71";
  for (const [name, contents] of [
    ["engineering", engineering],
    ["remediation", remediation],
    ["development", development],
    ["decisions", decisions],
    ["foundation", foundation],
    ["readiness", readiness],
    ["M0 completion audit", m0Audit],
  ]) {
    assert.match(contents, new RegExp(currentPlane), name);
  }

  assert.doesNotMatch(remediation, /current accepted Plane `preview` is `e762fbb/);
  assert.doesNotMatch(development, /current implementation base[^\n]*`af7187d/);
  assert.doesNotMatch(foundation, /current `origin\/preview` `e762fbb/);
  assert.match(
    readiness,
    /\| Accepted Plane capability baseline \| Fork `preview` checkpoint `99a73b4eab5ee21fd012d7358bc9259252d47f71`/,
  );
  assert.match(
    readiness,
    /\| Observed Plane implementation base \| Plane `preview` at `9f9bb14f46b80e1d05b4c900d25c1af7a229b55c`/,
  );
  assert.match(
    readiness,
    /\| Observed Curve contract base \| Curve `main` at `7069acba643942c9670521b8b1ebc1774b5ea7fb`/,
  );
  assert.match(readiness, /grants no decision, implementation, provider-call, or dispatch authority/);
  assert.match(m0Audit, /c55686c8061f092f4f82ab73681e06f97d80893f/);
  assert.match(m0Audit, /68a05e9f2920454752e9039d596271dbb39d6e6e/);
  assert.match(m0Audit, /accepted M0-S9A checkpoint `af7187d049c6ee6d0c82a5c70b686d4c444e9b63`/);
});

test("exact-preview local runtime evidence binds the durable verified control path", () => {
  for (const value of [
    "99a73b4eab5ee21fd012d7358bc9259252d47f71",
    "/Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview",
    "/Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview/docker-compose-local.yml",
    "/Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview/docker-compose-curve.yml",
    "--project-directory /Users/federico.ocampo/Development/tools/project_management/plane",
    "7129cc4e-a914-4331-acba-8cf2754c15bf",
    "7897ba9c-90cc-40f5-b970-c099234f7d19",
    "bf4b5743-2ef4-4a03-9f6e-c8044e18f100",
    "d8082c6c-4954-4c45-adb8-7aff29e7768b",
    "29e27d7b-9e89-4b6b-a2be-472c13110a8d",
  ]) {
    assert.match(runtimeRefresh, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(runtimeRefresh, /Curve issue #46/);
  assert.match(runtimeRefresh, /RUNTIME-M0-01 graceful Curve worker shutdown classification/);
  assert.match(runtimeRefresh, /Broad M0 completion remains open/);
  assert.match(runtimeRefresh, /verified symptom, suspected\s+race/);
  assert.doesNotMatch(
    runtimeRefresh,
    /project_management\/plane\/docker-compose-local\.yml/,
  );
  assert.match(runtimeRefresh, /D-009 \(retention, backup, legal-hold, tombstone, and erasure decision\)/);
  assert.match(readiness, /\[Exact-preview local runtime refresh evidence\]\(local-runtime-refresh-evidence\.md\)/);
  assert.match(foundation, /\[exact-preview local runtime refresh evidence\]\(local-runtime-refresh-evidence\.md\)/);
  assert.match(technicalIndex, /\[Exact-preview local runtime refresh evidence\]\(local-runtime-refresh-evidence\.md\)/);
});

test("substantively reconciled governance documents advance document control", () => {
  for (const [name, contents, version, dateLabel, date] of [
    ["architecture", architecture, "0.9", "Last updated", "2026-08-30"],
    ["coding-agent decision", codingDecision, "1.2", "Prepared", "2026-08-30"],
    ["RUNTIME-M0-01 packet", runtimePacket, "1.3", "Prepared", "2026-08-30"],
    ["development", development, "1.21", "Last updated", "2026-08-31"],
    ["foundation", foundation, "1.4", "Review date", "2026-08-29"],
    ["M0 readiness board", readiness, "1.40", "Date", "2026-09-01"],
    ["M0 completion audit", m0Audit, "1.14", "Date", "2026-09-02"],
    ["M0 test strategy", strategy, "1.8", "Last updated", "2026-08-31"],
    ["GitHub Project execution map", projectMap, "1.18", "Date", "2026-08-29"],
    ["M1 alignment", m1Alignment, "1.7", "Date", "2026-08-30"],
    ["M1-M7 catalog", laterPackets, "1.11", "Date", "2026-08-31"],
    ["architecture decision index", decisions, "1.7", "Last updated", "2026-09-01"],
    ["later-milestone index", laterIndex, "1.4", "Prepared", "2026-08-31"],
    ["implemented ERD", implementedErd, "1.2", "Last updated", "2026-08-30"],
  ]) {
    assert.match(contents, new RegExp(`^\\| Version \\| ${version.replace(".", "\\.")} \\|$`, "m"), name);
    assert.match(contents, new RegExp(`^\\| ${dateLabel} \\| ${date} \\|$`, "m"), name);
  }
});

test("next work and later-milestone status remain truthfully executable", () => {
  const nextSequence = m0Audit.match(
    /## Next executable sequence\n\n([\s\S]*?)\n## Completion-claim rule/,
  );
  assert.ok(nextSequence, "M0 next executable sequence is required");
  assert.match(
    nextSequence[1],
    /^1\. Complete D-009 \(retention, backup, legal-hold, tombstone, and erasure/m,
  );
  assert.match(nextSequence[1], /M0-04 \(protected object storage and\s+erasure\)/);
  assert.match(nextSequence[1], /M0-S9B \(external provider transport and administration\)/);
  assert.match(nextSequence[1], /M0-S9C \(Model Gateway\s+routing and failover\)/);
  assert.doesNotMatch(nextSequence[1], /Obtain exact-revision approval/);
  assert.doesNotMatch(nextSequence[1], /implement the three-file correction/);
  assert.doesNotMatch(nextSequence[1], /Curve issue #46/);
  assert.doesNotMatch(nextSequence[1], /Merge the \[RUNTIME-M0-01 implementation evidence\]/);
  assert.doesNotMatch(nextSequence[1], /Publish the RUNTIME-M0-01 machine packet/);
  assert.match(nextSequence[1], /D-009 \(retention, backup, legal-hold, tombstone, and erasure/);
  assert.match(m0Audit, /de16d05c96fcdf099cffdbf725ca9f6b8c304816/);
  assert.match(m0Audit, /Curve PR #66/);
  assert.match(m0Audit, /Canonical RUNTIME-M0-01 completion evidence/);

  assert.match(
    development,
    /M4-04[^\n]*consumes any B-CODING-TOOLS-01\/B-CODING-AUTHORITY-01 controls deferred during human-operated bootstrap/,
  );
  assert.match(
    laterPackets,
    /M4-04 \(Runner controller\)[^\n]*B-CODING-TOOLS-01 \(machine coding-tool execution profile\)[^\n]*B-CODING-AUTHORITY-01 \(production human authority and durable attempt lease\)/,
  );

  assert.match(
    laterPackets,
    /\| Status \| Deterministic M1-M6 materialization catalog plus deferred M7 charter;/,
  );
  assert.match(laterPackets, /M7 has no active implementation packet or exact FR\/NFR\/AC trace/);
  assert.doesNotMatch(
    laterPackets,
    /Deterministic materialization catalog; every package has an exact dependency\/trace record/,
  );
});

test("P0-05 accepted lifecycle agrees across strategy, readiness, and Project projection", () => {
  assert.match(strategy, /\| Status \| `ACCEPTED \/ DONE` \|/);
  assert.match(strategy, /7d2794bad87a6e2e733ee8a53a650d8ea7658d22/);
  assert.match(strategy, /fdae85b33a235cd494dd36565698b2b5033a3389/);
  assert.match(readiness, /\| P0-05 test strategy \| DONE \|/);
  assert.match(projectMap, /P0-05 \(test strategy and audit closure\).*`Done`/);
  assert.match(projectSync, /\["P0-05", "Done"\]/);
});

test("M1-00A merged local lifecycle and open conformance variance agree across active indexes", () => {
  for (const [name, contents] of [
    ["task packet", productPacket],
    ["technical index", technicalIndex],
    ["contract index", contractIndex],
  ]) {
    assert.match(contents, /CONFORMANCE_VARIANCE_OPEN/, name);
    assert.match(
      contents,
      /R-027 \(Product timestamp\/schema-version contract reconciliation\)/,
      name,
    );
  }

  assert.match(development, /\| M1-00A \(minimal Product core\) \|[^\n]*`MERGED_LOCAL_IMPLEMENTATION \/ CONFORMANCE_VARIANCE_OPEN`/);
  assert.match(m1Alignment, /\| M1-00A \(minimal Product core\) \|[^\n]*`MERGED_LOCAL_IMPLEMENTATION \/ CONFORMANCE_VARIANCE_OPEN`/);
  assert.match(projectMap, /M1-00A \(minimal Product core\).*`Done`/);
  assert.doesNotMatch(productPacket, /`PREPARED_NOT_DISPATCHABLE`/);
  assert.doesNotMatch(technicalIndex, /M1-00A[^\n]*`PREPARED_NOT_DISPATCHABLE`/);
  assert.doesNotMatch(
    contractIndex,
    /M1-00A relational contract[^\n]*`IMPLEMENTED_AND_ACCEPTED/,
  );
  assert.match(productEvidence, /Exact\s+relational conformance, production qualification,[\s\S]*remain fail-closed/);
  assert.match(productRelational, /`HISTORICAL_V1 \/ MERGED_LOCAL_IMPLEMENTATION \/ CONFORMANCE_VARIANCE_OPEN`/);
  assert.match(productRelational, /schema_version/);
  assert.match(productRelational, /application\s+UTC using `auto_now_add` and `auto_now`/);
  assert.match(productRelational, /trusted PostgreSQL time in UTC/);
  assert.doesNotMatch(productRelational, /\| Status \|[^\n]*(ACCEPTED_AND_MERGED|IMPLEMENTED_AND_ACCEPTED)/);
  assert.match(implementedErd, /observational physical evidence/);
  assert.match(implementedErd, /exact relational[\s\S]*remain[\s\S]*fail closed/i);
  assert.match(laterPackets, /M2-01 \(roadmap planning domain\)[^\n]*R-027 \(Product timestamp\/schema-version contract reconciliation\)/);
  assert.match(projectMap, /GitHub Project[^\n]*visual|visual metadata/i);
  assert.match(
    foundation,
    /M1-00A \(minimal Product core\)[^\n]*R-027 \(Product timestamp\/schema-version contract reconciliation\)/,
  );

  for (const value of [
    "46880350e0ca1e57dd08b6fb5a6a6546f37c4473",
    "sha256:951fd873f4a9179aae58359e595e48e80ba081a9703202f6b9d9eed51b4b3b6f",
    "d4ab9ea7c6d19222c316a51d7d2992415c8940f0",
    "afdb59388e4ea9b2321d33935000126303fc93b8",
    "1c4904d617207b8301954c1019fe0fc6bf099b6d",
  ]) {
    assert.match(productEvidence, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("GitHub Project snapshot accounts for all 97 current items", () => {
  const liveCounts = projectMap.match(
    /Project #2 had (\d+) items: (\d+) draft issues, (\d+) issues, and (\d+) pull requests/,
  );
  assert.ok(liveCounts, "live Project count summary is required");
  const [, liveTotal, draftIssues, issues, pullRequests] = liveCounts.map(Number);
  assert.equal(draftIssues + issues + pullRequests, liveTotal);
  assert.deepEqual([liveTotal, draftIssues, issues, pullRequests], [97, 81, 5, 11]);

  const countFor = (labelPattern) => {
    const match = projectMap.match(
      new RegExp(`^\\| ${labelPattern} \\|[^\\n]*\\| \\*{0,2}(\\d+)\\*{0,2} \\|`, "m"),
    );
    assert.ok(match, `missing inventory count for ${labelPattern}`);
    return Number(match[1]);
  };

  const canonical = countFor("Canonical catalog total");
  const checkpoints = [
    "M0-S3 \\(local Temporal round-trip implementation packet\\) checkpoint",
    "M0-S4 \\(API, SSE, and Curve-first UI implementation packet\\) checkpoint",
    "M0-S4-UX \\(Foundation Definition/UX gate\\) checkpoint",
    "M0-03A \\(policy timestamp-ordering regression\\) checkpoint",
    "M0-S6A \\(durable parent/child Temporal orchestration\\) checkpoint",
    "M0-S9A \\(provider-neutral registry and local reconciliation\\) checkpoint",
    "M0-S6A-E1 \\(durable-orchestration evidence reconciliation\\) checkpoint",
    "P0-03A \\(later-milestone decision-readiness packets\\) checkpoint",
    "M0-S9B-D1 \\(external-provider transport definition gate\\) checkpoint",
    "M0-S9C-D1 \\(Model Gateway definition gate\\) checkpoint",
  ].reduce((total, label) => total + countFor(label), 0);
  const standaloneIssues =
    countFor("SEC-M0-01 \\(inherited High dependency advisories\\) issue") +
    countFor("R-027 \\(Product timestamp/schema-version contract reconciliation\\) issue") +
    countFor("RUNTIME-M0-01 \\(graceful Curve worker shutdown classification\\) issue") +
    countFor("M7 intelligence extension issues");
  const trackedPullRequests = countFor("Tracked pull-request evidence items");
  const documentedTotal = countFor("\\*\\*Current visual total\\*\\*");

  assert.deepEqual(
    { canonical, checkpoints, standaloneIssues, trackedPullRequests, documentedTotal },
    { canonical: 71, checkpoints: 10, standaloneIssues: 5, trackedPullRequests: 11, documentedTotal: 97 },
  );
  assert.equal(canonical + checkpoints + standaloneIssues + trackedPullRequests, documentedTotal);
  assert.match(projectMap, /P0-02 \(runtime and repository topology\).*`Done`/);
  for (const id of [
    "M0-S6A-E1",
    "P0-03A",
    "SEC-M0-01",
    "R-027",
    "RUNTIME-M0-01",
    "M0-S9B-D1",
    "M0-S9C-D1",
  ]) {
    assert.equal((projectMap.match(new RegExp(`\\| ${id} `, "g")) ?? []).length, 1, id);
  }
  assert.match(projectSync, /\["P0-02", "Done"\]/);
});

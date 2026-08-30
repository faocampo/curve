import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  RUNTIME_M0_01_CONTEXT_PATHS,
  contextPathsFor,
} from "../lib/context-pack.mjs";

const read = (path) =>
  fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const packet = read(
  "docs/technical/runtime-m0-01-graceful-shutdown-task-packet.md",
);
const decision = read(
  "docs/technical/coding-agent-local-execution-decision.md",
);
const development = read("docs/technical/development-plan.md");
const readiness = read("docs/technical/m0-readiness-board.md");
const strategy = read("docs/technical/m0-test-strategy.md");
const technicalIndex = read("docs/technical/README.md");
const contractIndex = read("contracts/README.md");

test("RUNTIME-M0-01 context is canonical, complete, and repository-resolvable", () => {
  const requiredPaths = [
    "contracts/README.md",
    "contracts/schemas/coding-agent-context-pack-manifest.schema.json",
    "contracts/schemas/coding-agent-implementation-authorization.schema.json",
    "contracts/schemas/coding-agent-source-catalog.schema.json",
    "contracts/schemas/coding-agent-state-evidence.schema.json",
    "contracts/schemas/coding-agent-task-packet.schema.json",
    "contracts/task-packet-authorizations/README.md",
    "contracts/task-packets/README.md",
    "contracts/testing/ac-test-matrix-v1.json",
    "contracts/temporal/m0-workflow-contract.md",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/adr-001-plane-upstream-foundation.md",
    "docs/technical/adr-003-runtime-topology.md",
    "docs/technical/architecture.md",
    "docs/technical/architecture-decisions.md",
    "docs/technical/coding-agent-local-execution-decision.md",
    "docs/technical/development-plan.md",
    "docs/technical/local-runtime-refresh-evidence.md",
    "docs/technical/m0-completion-audit.md",
    "docs/technical/m0-readiness-board.md",
    "docs/technical/m0-s6a-durable-orchestration-task-packet.md",
    "docs/technical/m0-s6a-implementation-evidence.md",
    "docs/technical/m0-test-strategy.md",
    "docs/technical/m0-traceability.md",
    "docs/technical/runtime-m0-01-graceful-shutdown-task-packet.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/coding-agent-task-packet.mjs",
    "scripts/lib/context-pack.mjs",
    "scripts/tests/coding-agent-task-packet.test.mjs",
    "scripts/tests/runtime-m0-01-task-packet.test.mjs",
    "scripts/validate-contracts.mjs",
  ];

  assert.deepEqual(RUNTIME_M0_01_CONTEXT_PATHS, [...requiredPaths].sort());
  assert.deepEqual(contextPathsFor("RUNTIME-M0-01"), RUNTIME_M0_01_CONTEXT_PATHS);
  assert.equal(
    new Set(RUNTIME_M0_01_CONTEXT_PATHS).size,
    RUNTIME_M0_01_CONTEXT_PATHS.length,
  );
  for (const path of RUNTIME_M0_01_CONTEXT_PATHS) {
    assert.ok(fs.existsSync(new URL(`../../${path}`, import.meta.url)), path);
  }
});

test("RUNTIME-M0-01 pins one bounded Plane correction and exact rollback", () => {
  for (const value of [
    "git@github.com:faocampo/plane.git",
    "99a73b4eab5ee21fd012d7358bc9259252d47f71",
    "curve/runtime-m0-01-graceful-worker-shutdown",
    "apps/api/plane/curve/temporal/worker.py",
    "apps/api/plane/curve/temporal/worker_lifecycle.py",
    "apps/api/plane/curve/tests/test_curve_worker_lifecycle.py",
    "CURVE_ENABLED=0",
  ]) {
    assert.ok(packet.includes(value), value);
  }

  for (const requirement of ["FR-015", "FR-022", "NFR-004", "NFR-005", "AC-58"]) {
    assert.ok(packet.includes(requirement), requirement);
  }
  assert.match(packet, /R1-03 \(full disaster-\s*recovery exercise\) retains ownership/);
  assert.match(packet, /No application data or migration|no migration or schema rollback/i);
  assert.match(packet, /no Plane mutation/i);
  assert.doesNotMatch(packet, /AC-21 \(cancellation and recovery\)/);
  assert.match(packet, /supplemental local M0-06/);
  assert.match(packet, /NFR-005 \(idempotent replay\) is a regression constraint/);
  for (const caseId of ["RT-13", "RT-14", "RT-15", "RT-16"]) {
    assert.ok(packet.includes(caseId), caseId);
  }
  assert.match(packet, /worker, then relay, then `worker\.shutdown\(\)`/);
});

test("runtime definition remains fail closed until tools and dispatch authority exist", () => {
  assert.match(packet, /`DEFINITION_PREPARED \/ MACHINE_READY_TOOL_BLOCKED \/ DISPATCH_AUTHORITY_REQUIRED \/ NOT_IMPLEMENTATION_AUTHORITY`/);
  assert.match(packet, /B-CODING-TOOLS-01/);
  assert.match(packet, /B-CODING-AUTHORITY-01/);
  assert.match(packet, /`S -> E1\.\.En -> C -> P`/);
  assert.match(packet, /`PASSED_WITH_IMPLEMENTATION_AUTHORITY_REQUIRED`/);
  assert.match(packet, /does not block these publication revisions or read-only readiness/);

  assert.match(decision, /Option A — Trust-tiered local bootstrap profile \(recommended\)/);
  assert.match(decision, /Option B — gVisor for every coding command/);
  assert.match(decision, /Option C — Docker-controller-only local execution/);
  assert.match(decision, /Option 1 — Bootstrap-local human grant plus production fail-closed \(recommended\)/);
  assert.match(decision, /Option 2 — Implement production authority and lease first/);
  assert.match(decision, /Option 3 — Continue human-operated coding outside Curve dispatch/);
  assert.match(decision, /cannot select either\s+security architecture/);
  assert.doesNotMatch(packet, /docker compose[^\n]*sh -c/);
  for (const phase of ["CMD-LINT", "CMD-BUILD", "CMD-TEST", "CMD-SECURITY", "CMD-LOCAL-RUN"]) {
    assert.ok(packet.includes(phase), phase);
  }
  assert.match(packet, /`PLANNED \/ UNAVAILABLE`/);
  assert.doesNotMatch(packet, /docker compose[^\n]*--build/);
  assert.match(packet, /zero open `critical` or `high` alerts/);
  assert.match(packet, /AC-58-RUNTIME-01/);
  assert.match(packet, /AC-58-RUNTIME-16/);
  assert.doesNotMatch(packet, /`CMD-SECURITY`[^\n]*test_curve_worker_lifecycle\.py/);
  assert.match(packet, /ruff check --no-cache/);
  assert.match(packet, /`CMD-TEST` complete backend/);
  assert.match(packet, /temporarily set[^\n]*restart policy to `no`/i);
  assert.match(packet, /UNRESOLVED_WORKSPACE_ID/);
  assert.match(packet, /PVTI_lAHOBNjuQc4BgZzOzg4kt70/);
  assert.match(packet, /minimum is fourteen state records/);
  for (const path of [
    "contracts/authority/runtime-m0-01-v1.json",
    "contracts/state/runtime-m0-01/*.json",
    "contracts/context/runtime-m0-01-v1.json",
    "contracts/task-packet-sources/runtime-m0-01-v1.json",
    "contracts/task-packets/runtime-m0-01-v1.json",
    "contracts/task-packet-authorizations/runtime-m0-01-attempt-1-v1.json",
  ]) assert.ok(packet.includes(path), path);
});

test("active indexes and test ownership expose the same runtime boundary", () => {
  for (const [name, contents] of [
    ["development plan", development],
    ["readiness board", readiness],
    ["test strategy", strategy],
    ["technical index", technicalIndex],
  ]) {
    assert.match(contents, /RUNTIME-M0-01/, name);
    assert.match(contents, /graceful Curve worker shutdown classification/i, name);
  }
  const traceability = read("docs/technical/m0-traceability.md");
  assert.match(traceability, /RUNTIME-M0-01 graceful worker-shutdown checkpoint/);
  assert.match(traceability, /DISPATCH_AUTHORITY_REQUIRED/);
  const normalizedStatus = "DEFINITION_PREPARED / MACHINE_READY_TOOL_BLOCKED / DISPATCH_AUTHORITY_REQUIRED / NOT_IMPLEMENTATION_AUTHORITY";
  for (const [name, contents] of [
    ["packet", packet],
    ["development", development],
    ["readiness", readiness],
    ["traceability", traceability],
    ["technical index", technicalIndex],
    ["completion audit", read("docs/technical/m0-completion-audit.md")],
  ]) {
    assert.ok(contents.includes(normalizedStatus), `${name} status`);
  }
  assert.match(strategy, /R1-03 \(full disaster-recovery exercise\) retains complete AC-58 ownership/);

  for (const root of [
    "contracts/authority/",
    "contracts/state/",
    "contracts/context/",
    "contracts/task-packet-sources/",
    "contracts/task-packets/",
    "contracts/task-packet-authorizations/",
  ]) {
    assert.ok(contractIndex.includes(root), root);
  }
  assert.match(contractIndex, /`S -> E1\.\.En -> C -> P`/);

  const stateFixture = JSON.parse(
    read("contracts/schemas/examples/coding-agent-state-evidence.valid.json"),
  );
  assert.match(
    stateFixture.attestations[0].authority_source.path,
    /^contracts\/authority\//,
  );
});

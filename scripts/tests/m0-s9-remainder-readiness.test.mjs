import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  M0_S9B_CONTEXT_PATHS,
  M0_S9C_CONTEXT_PATHS,
  contextPathsFor,
} from "../lib/context-pack.mjs";

const read = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

function assertContext(taskId, paths, requiredPaths) {
  for (const path of requiredPaths) assert.ok(paths.includes(path), `${taskId}: ${path}`);
  assert.deepEqual(paths, [...paths].sort());
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual(contextPathsFor(taskId), paths);
  for (const path of paths) assert.ok(fs.existsSync(new URL(`../../${path}`, import.meta.url)), path);
}

test("M0-S9B context pins the external transport and administration readiness boundary", () => {
  assertContext("M0-S9B", M0_S9B_CONTEXT_PATHS, [
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/schemas/provider-connection.schema.json",
    "docs/technical/integration-contracts.md",
    "docs/technical/m0-s9a-implementation-evidence.md",
    "docs/technical/m0-s9b-provider-transport-task-packet.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/context-pack.mjs",
  ]);

  const packet = read("docs/technical/m0-s9b-provider-transport-task-packet.md");
  assert.match(packet, /`PREPARED \/ BLOCKED \/ NO_DISPATCH`/);
  for (const child of ["M0-S9B1", "M0-S9B2", "M0-S9B3", "M0-S9B4", "M0-S9B5", "M0-S9B6"]) {
    assert.match(packet, new RegExp(`${child.replace("-", "\\-")} \\(`));
  }
  for (const boundary of [
    /Authorization executes before object lookup/,
    /callback can append an observation or request reconciliation/,
    /Redirect following is disabled/,
    /at least every\s+900 seconds/,
    /cannot reopen, delete, force-push/,
    /one provider\/profile\/environment per packet/i,
  ]) assert.match(packet, boundary);
});

test("M0-S9C context pins the Model Gateway readiness and no-silent-routing boundary", () => {
  assertContext("M0-S9C", M0_S9C_CONTEXT_PATHS, [
    "contracts/schemas/provider-connection.schema.json",
    "contracts/testing/ac-test-matrix-v1.json",
    "docs/technical/integration-contracts.md",
    "docs/technical/m0-s9a-implementation-evidence.md",
    "docs/technical/m0-s9c-model-gateway-task-packet.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/context-pack.mjs",
  ]);

  const packet = read("docs/technical/m0-s9c-model-gateway-task-packet.md");
  assert.match(packet, /`PREPARED \/ BLOCKED \/ NO_DISPATCH`/);
  for (const child of ["M0-S9C1", "M0-S9C2", "M0-S9C3", "M0-S9C4"]) {
    assert.match(packet, new RegExp(`${child.replace("-", "\\-")} \\(`));
  }
  for (const decision of ["D-004", "D-005", "D-009", "D-014"]) assert.ok(packet.includes(decision), decision);
  for (const boundary of [
    /Curve never delegates its policy decision to OpenRouter defaults/,
    /fallback is disabled unless/,
    /Missing\s+usage becomes a reconciliation case, not zero cost/,
    /No `latest`, automatic, floating, free, preview, or provider-agnostic alias/,
    /actual-route failover\s+matrix passes/,
  ]) assert.match(packet, boundary);
});

test("M0-09 indexes identify both decision-gated remainder packets", () => {
  const developmentPlan = read("docs/technical/development-plan.md");
  const readinessBoard = read("docs/technical/m0-readiness-board.md");
  const traceability = read("docs/technical/m0-traceability.md");
  for (const id of ["M0-S9B", "M0-S9C"]) {
    assert.ok(developmentPlan.includes(id), id);
    assert.ok(readinessBoard.includes(id), id);
    assert.ok(traceability.includes(id), id);
  }
  assert.doesNotMatch(developmentPlan, /dedicated Model Gateway child remains to be defined/i);
  assert.doesNotMatch(traceability, /identifier pending|remain unprepared/i);
});

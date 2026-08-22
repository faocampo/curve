import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  P0_06A_READY_PRISTINE_CLAIM,
  P0_06A_READY_PRISTINE_REVIEW,
  ProofPolicyError,
  executeSingleExistingItemStatusUpdate,
  executeValidatedSingleExistingItemStatusUpdate,
  extractLegacyProjectedStatus,
  selectUniqueProjectItem,
  validateP0_06AReadyPristineState,
  validateSingleApplyRequest,
} from "../lib/p0-06-policy.mjs";
import {
  M0_03_CONTEXT_PATHS,
  M0_08_CONTEXT_PATHS,
  M0_S3_CONTEXT_PATHS,
  M0_S4_CONTEXT_PATHS,
  M0_S6A_CONTEXT_PATHS,
  M0_S9A_CONTEXT_PATHS,
  P0_12_CONTEXT_PATHS,
  contextPathsFor,
  digestContextEntries,
} from "../lib/context-pack.mjs";

const STAGE_RECORD = JSON.parse(
  readFileSync(new URL("../../docs/technical/proofs/p0-06-stage-record.json", import.meta.url), "utf8"),
);
const SYNCHRONIZER_PATH = fileURLToPath(new URL("../sync-github-project.mjs", import.meta.url));

test("M0-03 context pins its frozen policy-v1 fixture set and deterministic digest algorithm", () => {
  const expectedFixtures = [
    "contracts/schemas/examples/core-policy-manifest.invalid.json",
    "contracts/schemas/examples/core-policy-manifest.valid.json",
    "contracts/schemas/examples/policy-decision.invalid.json",
    "contracts/schemas/examples/policy-decision.valid.json",
    "contracts/schemas/examples/policy-evaluation.invalid.json",
    "contracts/schemas/examples/policy-evaluation.valid.json",
    "contracts/schemas/semantic-fixtures/policy-decision-allow-reason.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-decision-human-recorder.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-gate-assignment.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-gate-assignment.valid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-human-service-auth.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-human-service-role.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service-human-role.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service-membership.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service-version.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service.valid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-target-version.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-target-version.valid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-transition-service.valid.json",
  ];
  for (const path of expectedFixtures) assert.ok(M0_03_CONTEXT_PATHS.includes(path), path);
  assert.ok(M0_03_CONTEXT_PATHS.includes("scripts/lib/context-pack.mjs"));
  assert.ok(M0_03_CONTEXT_PATHS.includes("scripts/validate-contracts.mjs"));
  assert.equal(new Set(M0_03_CONTEXT_PATHS).size, M0_03_CONTEXT_PATHS.length);
  assert.deepEqual(M0_03_CONTEXT_PATHS, [...M0_03_CONTEXT_PATHS].sort());

  const digest = digestContextEntries([
    { path: "b", contents: Buffer.from("two") },
    { path: "a", contents: Buffer.from("one") },
  ]);
  assert.equal(digest, "sha256:029c7c48f7822596ae3db41495a419c74964e317463c27ae1023b9d6efdc9110");
  assert.equal(digest, digestContextEntries([
    { path: "a", contents: Buffer.from("one") },
    { path: "b", contents: Buffer.from("two") },
  ]));
  assert.notEqual(digest, digestContextEntries([
    { path: "a", contents: Buffer.from("changed") },
    { path: "b", contents: Buffer.from("two") },
  ]));
  assert.throws(() => digestContextEntries([
    { path: "a", contents: Buffer.from("one") },
    { path: "a", contents: Buffer.from("two") },
  ]), /unique/);
  assert.throws(() => digestContextEntries([{ path: "a", contents: "one" }]), /Buffer/);
});

test("M0-S3 context pins the approved topology, workflow, delivery, policy, and evidence contracts", () => {
  const requiredPaths = [
    "contracts/database/m0-03-policy-contract.md",
    "contracts/database/m0-s2-relational-contract.md",
    "contracts/policy/core-policy-v1.json",
    "contracts/schemas/audit-event.schema.json",
    "contracts/schemas/event-envelope.schema.json",
    "contracts/schemas/operation.schema.json",
    "contracts/schemas/outbox-event.schema.json",
    "contracts/schemas/policy-decision.schema.json",
    "contracts/schemas/policy-evaluation.schema.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-transition-service.valid.json",
    "contracts/temporal/m0-workflow-contract.md",
    "docs/technical/adr-003-runtime-topology.md",
    "docs/technical/d003-local-topology-decision-packet.md",
    "docs/technical/d003-private-platform-connectivity-amendment.md",
    "docs/technical/m0-03-implementation-evidence.md",
    "docs/technical/m0-local-skeleton-task-packets.md",
    "scripts/lib/context-pack.mjs",
    "scripts/validate-contracts.mjs",
  ];
  for (const path of requiredPaths) assert.ok(M0_S3_CONTEXT_PATHS.includes(path), path);
  assert.equal(new Set(M0_S3_CONTEXT_PATHS).size, M0_S3_CONTEXT_PATHS.length);
  assert.deepEqual(M0_S3_CONTEXT_PATHS, [...M0_S3_CONTEXT_PATHS].sort());
  assert.deepEqual(contextPathsFor("M0-S3"), M0_S3_CONTEXT_PATHS);
  assert.equal(contextPathsFor("UNREGISTERED"), null);
});

test("M0-S4 context pins the API, SSE, policy, runtime, UX, and implementation contracts", () => {
  const requiredPaths = [
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/policy/core-policy-v1.json",
    "contracts/schemas/common.schema.json",
    "contracts/schemas/event-envelope.schema.json",
    "contracts/schemas/operation-event-v1.schema.json",
    "contracts/schemas/operation-summary.schema.json",
    "contracts/schemas/operation.schema.json",
    "contracts/schemas/sse-event.schema.json",
    "contracts/temporal/m0-workflow-contract.md",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/design/curve-brand.md",
    "docs/design/mockups/curve-foundation-probe-v2.png",
    "docs/design/prototypes/m0-s4-foundation-probe/curve-logo-light-ui-v1.webp",
    "docs/design/prototypes/m0-s4-foundation-probe/index.html",
    "docs/technical/architecture.md",
    "docs/technical/curve-experience-blueprint.md",
    "docs/technical/integration-contracts.md",
    "docs/technical/m0-authorization-and-state-matrices.md",
    "docs/technical/m0-local-skeleton-task-packets.md",
    "docs/technical/m0-readiness-board.md",
    "docs/technical/m0-s3-implementation-evidence.md",
    "docs/technical/security-and-operations.md",
    "docs/technical/ux-m0-s4-foundation-probe.md",
    "scripts/lib/context-pack.mjs",
    "scripts/validate-contracts.mjs",
  ];
  for (const path of requiredPaths) assert.ok(M0_S4_CONTEXT_PATHS.includes(path), path);
  assert.equal(new Set(M0_S4_CONTEXT_PATHS).size, M0_S4_CONTEXT_PATHS.length);
  assert.deepEqual(M0_S4_CONTEXT_PATHS, [...M0_S4_CONTEXT_PATHS].sort());
  assert.deepEqual(contextPathsFor("M0-S4"), M0_S4_CONTEXT_PATHS);
});

test("M0-08 context pins the observability contract, packet, fixtures, and validators", () => {
  const requiredPaths = [
    "contracts/observability/obs-bind-001-local-v1.json",
    "contracts/observability/m0-s5-telemetry-v1.json",
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/schemas/common.schema.json",
    "contracts/schemas/event-envelope.schema.json",
    "contracts/schemas/examples/operation-event-v2.invalid.json",
    "contracts/schemas/examples/operation-event-v2.valid.json",
    "contracts/schemas/examples/telemetry-manifest.invalid.json",
    "contracts/schemas/examples/telemetry-manifest.valid.json",
    "contracts/schemas/operation-event-v1.schema.json",
    "contracts/schemas/operation-event-v2.schema.json",
    "contracts/schemas/observability-binding.schema.json",
    "contracts/schemas/operation-summary.schema.json",
    "contracts/schemas/operation.schema.json",
    "contracts/schemas/semantic-fixtures/operation-event-v2-tracestate.invalid.json",
    "contracts/schemas/semantic-fixtures/observability-binding-external-delivery.invalid.json",
    "contracts/schemas/sse-event.schema.json",
    "contracts/schemas/telemetry-manifest.schema.json",
    "contracts/temporal/m0-workflow-contract.md",
    "docs/technical/m0-local-skeleton-task-packets.md",
    "docs/technical/m0-readiness-board.md",
    "docs/technical/m0-s4-implementation-evidence.md",
    "docs/technical/m0-s5-observability-task-packet.md",
    "docs/technical/m0-s5a-implementation-evidence.md",
    "docs/technical/m0-traceability.md",
    "docs/technical/obs-bind-001-local-observability-binding.md",
    "docs/technical/ux-m0-s4-foundation-probe.md",
    "scripts/lib/context-pack.mjs",
    "scripts/validate-contracts.mjs",
  ];
  for (const path of requiredPaths) assert.ok(M0_08_CONTEXT_PATHS.includes(path), path);
  assert.equal(new Set(M0_08_CONTEXT_PATHS).size, M0_08_CONTEXT_PATHS.length);
  assert.deepEqual(M0_08_CONTEXT_PATHS, [...M0_08_CONTEXT_PATHS].sort());
  assert.deepEqual(contextPathsFor("M0-08"), M0_08_CONTEXT_PATHS);
  assert.deepEqual(contextPathsFor("M0-S5B"), M0_08_CONTEXT_PATHS);
});

test("M0-S6A context pins orchestration, test strategy, local runtime, telemetry, and replay contracts", () => {
  const requiredPaths = [
    "contracts/observability/m0-s5-telemetry-v1.json",
    "contracts/schemas/examples/temporal-orchestration.invalid.json",
    "contracts/schemas/examples/test-strategy-matrix.invalid.json",
    "contracts/schemas/telemetry-manifest.schema.json",
    "contracts/schemas/temporal-orchestration.schema.json",
    "contracts/schemas/test-strategy-matrix.schema.json",
    "contracts/testing/ac-test-matrix-v1.json",
    "contracts/temporal/m0-orchestration-v1.json",
    "contracts/temporal/m0-workflow-contract.md",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/adr-003-runtime-topology.md",
    "docs/technical/architecture.md",
    "docs/technical/development-plan.md",
    "docs/technical/m0-s3-implementation-evidence.md",
    "docs/technical/m0-s5b-implementation-evidence.md",
    "docs/technical/m0-s6a-durable-orchestration-task-packet.md",
    "docs/technical/m0-test-strategy.md",
    "docs/technical/m0-traceability.md",
    "docs/technical/security-and-operations.md",
    "docs/technical/workflows-and-sequences.md",
    "scripts/lib/context-pack.mjs",
    "scripts/lib/temporal-orchestration.mjs",
    "scripts/lib/test-strategy.mjs",
    "scripts/tests/temporal-orchestration.test.mjs",
    "scripts/tests/test-strategy.test.mjs",
    "scripts/validate-contracts.mjs",
  ];
  for (const path of requiredPaths) assert.ok(M0_S6A_CONTEXT_PATHS.includes(path), path);
  assert.equal(new Set(M0_S6A_CONTEXT_PATHS).size, M0_S6A_CONTEXT_PATHS.length);
  assert.deepEqual(M0_S6A_CONTEXT_PATHS, [...M0_S6A_CONTEXT_PATHS].sort());
  assert.deepEqual(contextPathsFor("M0-S6A"), M0_S6A_CONTEXT_PATHS);
});

test("M0-S9A context pins the local provider registry, persistence, fixtures, and boundaries", () => {
  const requiredPaths = [
    "contracts/database/m0-s9a-provider-registry-contract.md",
    "contracts/policy/core-policy-v2.json",
    "contracts/providers/m0-s9a-provider-registry-v1.json",
    "contracts/schemas/examples/provider-capability.invalid.json",
    "contracts/schemas/examples/provider-capability.valid.json",
    "contracts/schemas/examples/provider-connection-event-v1.invalid.json",
    "contracts/schemas/examples/provider-connection-event-v1.valid.json",
    "contracts/schemas/examples/provider-connection.invalid.json",
    "contracts/schemas/examples/provider-connection.valid.json",
    "contracts/schemas/examples/core-policy-manifest-v2.invalid.json",
    "contracts/schemas/examples/core-policy-manifest-v2.valid.json",
    "contracts/schemas/examples/provider-registry-manifest.invalid.json",
    "contracts/schemas/examples/provider-registry-manifest.valid.json",
    "contracts/schemas/examples/provider-reconciliation-event-v1.invalid.json",
    "contracts/schemas/examples/provider-reconciliation-event-v1.valid.json",
    "contracts/schemas/examples/test-strategy-matrix.invalid.json",
    "contracts/schemas/event-envelope.schema.json",
    "contracts/schemas/inbox-message.schema.json",
    "contracts/schemas/core-policy-manifest-v2.schema.json",
    "contracts/schemas/provider-capability.schema.json",
    "contracts/schemas/provider-connection-event-v1.schema.json",
    "contracts/schemas/provider-connection.schema.json",
    "contracts/schemas/provider-registry-manifest.schema.json",
    "contracts/schemas/provider-reconciliation-event-v1.schema.json",
    "contracts/schemas/test-strategy-matrix.schema.json",
    "contracts/schemas/semantic-fixtures/provider-connection-active-null.invalid.json",
    "contracts/schemas/semantic-fixtures/provider-connection-active.valid.json",
    "contracts/schemas/semantic-fixtures/provider-connection-event-registered.valid.json",
    "contracts/schemas/semantic-fixtures/provider-connection-revoked-next.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-decision-provider-registration-v2.valid.json",
    "contracts/schemas/semantic-fixtures/policy-decision-provider-registration-v3.invalid.json",
    "contracts/testing/ac-test-matrix-v1.json",
    "docs/technical/adr-007-mcp-trust-and-orca-profile.md",
    "docs/technical/integration-contracts.md",
    "docs/technical/m0-s5a-implementation-evidence.md",
    "docs/technical/m0-s5b-implementation-evidence.md",
    "docs/technical/m0-s9a-registration-authorization-decision.md",
    "docs/technical/m0-s9a-provider-registry-task-packet.md",
    "docs/technical/m0-test-strategy.md",
    "docs/technical/m0-traceability.md",
    "scripts/lib/context-pack.mjs",
    "scripts/lib/test-strategy.mjs",
    "scripts/tests/p0-06-policy.test.mjs",
    "scripts/tests/test-strategy.test.mjs",
    "scripts/validate-contracts.mjs",
  ];
  for (const path of requiredPaths) assert.ok(M0_S9A_CONTEXT_PATHS.includes(path), path);
  assert.equal(new Set(M0_S9A_CONTEXT_PATHS).size, M0_S9A_CONTEXT_PATHS.length);
  assert.deepEqual(M0_S9A_CONTEXT_PATHS, [...M0_S9A_CONTEXT_PATHS].sort());
  assert.deepEqual(contextPathsFor("M0-S9A"), M0_S9A_CONTEXT_PATHS);
});

test("M0-S9A implementation evidence binds the accepted local Plane merge", () => {
  const taskPacket = readFileSync(
    new URL("../../docs/technical/m0-s9a-provider-registry-task-packet.md", import.meta.url),
    "utf8",
  );
  const relationalContract = readFileSync(
    new URL("../../contracts/database/m0-s9a-provider-registry-contract.md", import.meta.url),
    "utf8",
  );
  const authorizationDecision = readFileSync(
    new URL("../../docs/technical/m0-s9a-registration-authorization-decision.md", import.meta.url),
    "utf8",
  );
  const implementationEvidence = readFileSync(
    new URL("../../docs/technical/m0-s9a-implementation-evidence.md", import.meta.url),
    "utf8",
  );
  const lifecycleDocuments = [
    ["task packet", taskPacket],
    ["relational contract", relationalContract],
    ["implementation evidence", implementationEvidence],
    ["contract catalog", readFileSync(new URL("../../contracts/README.md", import.meta.url), "utf8")],
    ["technical catalog", readFileSync(new URL("../../docs/technical/README.md", import.meta.url), "utf8")],
    ["development plan", readFileSync(new URL("../../docs/technical/development-plan.md", import.meta.url), "utf8")],
    ["domain model", readFileSync(new URL("../../docs/technical/domain-model.md", import.meta.url), "utf8")],
    ["completion audit", readFileSync(new URL("../../docs/technical/m0-completion-audit.md", import.meta.url), "utf8")],
    ["readiness board", readFileSync(new URL("../../docs/technical/m0-readiness-board.md", import.meta.url), "utf8")],
  ];

  assert.match(taskPacket, /\| Status \| `ACCEPTED_AND_MERGED \/ LOCAL_ONLY` \|/);
  assert.match(taskPacket, /\| M0-S9A independent-review correction \| Satisfied \|/);
  assert.match(taskPacket, /\| Canonical M0-S9A context \| Satisfied \|/);
  assert.match(taskPacket, /\| Plane base revalidation \| Satisfied \|/);
  assert.match(taskPacket, /\| Material decisions \| `PUBLISHED \/ SATISFIED` \|/);
  assert.match(taskPacket, /\| Renewed exact-revision and context-digest implementation authorization \| Satisfied \|/);
  assert.match(taskPacket, /\| Post-merge implementation evidence \| Satisfied \|/);
  assert.match(relationalContract, /\| Status \| `IMPLEMENTED_AND_ACCEPTED \/ LOCAL_ONLY` \|/);
  assert.match(authorizationDecision, /\| Status \| `PUBLISHED` \|/);

  for (const expected of [
    "e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb",
    "sha256:9e07550799a6e4d88a6734f9a98e0de59812402d983bc7291396332a6b214cb0",
    "ad5772c0565c934e64ea90f892be1374819979be",
    "d48a7d09f6824f045a1077ce2de256bd3dcde5d4",
    "af7187d049c6ee6d0c82a5c70b686d4c444e9b63",
    "d43bdc22413627399f2232f1b17e2092d9e31cb1",
  ]) {
    assert.match(implementationEvidence, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(implementationEvidence, /72 passed/);
  assert.match(implementationEvidence, /326 passed/);
  assert.match(implementationEvidence, /800 \| 10 \| 42/);
  assert.match(implementationEvidence, /684 \| 10 \| 42/);
  assert.match(implementationEvidence, /33208175433/);
  assert.match(implementationEvidence, /33213223875/);
  assert.match(implementationEvidence, /33213231056/);
  assert.match(implementationEvidence, /No broken requirements found/);
  assert.match(implementationEvidence, /454debf594e2b3e657f223ce3e026fb4a0b4b95a/);
  assert.match(implementationEvidence, /M0-09 \(provider integration foundation\) remains open/i);
  assert.match(implementationEvidence, /M0-S9B \(external provider\s+transport and administration\)/i);

  for (const [name, document] of lifecycleDocuments) {
    assert.doesNotMatch(
      document,
      /(?:M0-S9A|Plane)[^\n]{0,240}(?:PENDING_PUBLICATION|AWAITING_EXACT_HEAD_APPROVAL|CONTRACT_CORRECTION_IN_REVIEW|implementation remains paused|correction remains under review)|CORRECTION_MERGED \/ IMPLEMENTATION_PAUSED/i,
      `${name} retains stale pre-acceptance lifecycle state`,
    );
    assert.doesNotMatch(
      document,
      /this (?:lifecycle-)?reconciled (?:packet|contract|audit)|lifecycle-reconciliation revision/i,
      `${name} defines dispatch through a self-referential lifecycle artifact`,
    );
  }
});

test("M0-06 closes locally without absorbing downstream provider acceptance", () => {
  const readiness = readFileSync(
    new URL("../../docs/technical/m0-readiness-board.md", import.meta.url),
    "utf8",
  );
  const developmentPlan = readFileSync(
    new URL("../../docs/technical/development-plan.md", import.meta.url),
    "utf8",
  );
  const traceability = readFileSync(
    new URL("../../docs/technical/m0-traceability.md", import.meta.url),
    "utf8",
  );
  const evidence = readFileSync(
    new URL("../../docs/technical/m0-s6a-implementation-evidence.md", import.meta.url),
    "utf8",
  );

  const row = (document, identifier) => document
    .split(/\r?\n/)
    .find((line) => line.startsWith(`| ${identifier} `));

  assert.match(row(readiness, "M0-06"), /\| DONE_LOCAL \|/);
  assert.match(row(developmentPlan, "M0-06"), /`DONE_LOCAL`/);
  assert.match(row(traceability, "M0-06"), /m0-s6a-implementation-evidence\.md/);
  assert.match(evidence, /satisfies the defined\s+local M0-06/);
  assert.match(evidence, /No M0-S6B provider-backed child is required\./);

  assert.match(row(developmentPlan, "M4-04"), /AC-20-AC-22/);
  assert.match(row(developmentPlan, "M4-05"), /AC-17-AC-21/);
  assert.match(row(developmentPlan, "M6-05"), /AC-19/);
  assert.match(row(developmentPlan, "R1-03"), /AC-58/);
  assert.doesNotMatch(
    `${row(readiness, "M0-06")}\n${row(developmentPlan, "M0-06")}`,
    /later M0-06|remaining sibling scope|provider-backed .* M0-06/i,
  );
});

test("P0-12 context pins the retention decision, test strategy, and semantic validators", () => {
  const requiredPaths = [
    "contracts/governance/d009-retention-policy-v1.json",
    "contracts/schemas/examples/retention-policy-decision.invalid.json",
    "contracts/schemas/retention-policy-decision.schema.json",
    "contracts/schemas/test-strategy-matrix.schema.json",
    "contracts/testing/ac-test-matrix-v1.json",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/adr-009-retention-and-erasure.md",
    "docs/technical/architecture-decisions.md",
    "docs/technical/development-plan.md",
    "docs/technical/m0-readiness-board.md",
    "docs/technical/m0-test-strategy.md",
    "docs/technical/p0-12-retention-decision-task-packet.md",
    "docs/technical/README.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/context-pack.mjs",
    "scripts/lib/retention-policy.mjs",
    "scripts/lib/test-strategy.mjs",
    "scripts/tests/p0-06-policy.test.mjs",
    "scripts/tests/retention-policy.test.mjs",
    "scripts/tests/test-strategy.test.mjs",
    "scripts/validate-contracts.mjs",
  ];
  for (const path of requiredPaths) assert.ok(P0_12_CONTEXT_PATHS.includes(path), path);
  assert.equal(new Set(P0_12_CONTEXT_PATHS).size, P0_12_CONTEXT_PATHS.length);
  assert.deepEqual(P0_12_CONTEXT_PATHS, [...P0_12_CONTEXT_PATHS].sort());
  assert.deepEqual(contextPathsFor("P0-12"), P0_12_CONTEXT_PATHS);
});

test("the live P0-06 projection is terminal and points to M0-S3", () => {
  assert.equal(STAGE_RECORD.schema_version, "curve.proof-stage-projection/v3");
  assert.equal(STAGE_RECORD.current_stage, "P0-06_SUPERSEDED");
  assert.equal(STAGE_RECORD.state, "SUPERSEDED");
  assert.equal(STAGE_RECORD.superseded_by.decision_id, "D-003");
  assert.equal(STAGE_RECORD.superseded_by.replacement_task, "M0-S3");
  assert.equal(STAGE_RECORD.historical_record.schema_version, "curve.proof-stage-projection/v2");
});

test("historical pristine claim and review policy remains deterministic", () => {
  assert.equal(
    validateP0_06AReadyPristineState({
      claim: structuredClone(P0_06A_READY_PRISTINE_CLAIM),
      review: structuredClone(P0_06A_READY_PRISTINE_REVIEW),
    }),
    true,
  );
});

function changed(value) {
  if (value === null) return "unexpected";
  if (typeof value === "boolean") return !value;
  if (typeof value === "number") return value + 1;
  return `${value}-changed`;
}

for (const [name, template, otherName, otherTemplate] of [
  ["claim", P0_06A_READY_PRISTINE_CLAIM, "review", P0_06A_READY_PRISTINE_REVIEW],
  ["review", P0_06A_READY_PRISTINE_REVIEW, "claim", P0_06A_READY_PRISTINE_CLAIM],
]) {
  test(`every pristine ${name} field rejects mutation, deletion, and extras`, () => {
    for (const field of Object.keys(template)) {
      for (const operation of ["mutate", "delete"]) {
        const target = structuredClone(template);
        if (operation === "delete") delete target[field];
        else target[field] = changed(target[field]);
        assert.throws(
          () => validateP0_06AReadyPristineState({
            [name]: target,
            [otherName]: structuredClone(otherTemplate),
          }),
          ProofPolicyError,
          `${name}.${field}.${operation}`,
        );
      }
    }
    const target = structuredClone(template);
    target.unapproved = null;
    assert.throws(
      () => validateP0_06AReadyPristineState({
        [name]: target,
        [otherName]: structuredClone(otherTemplate),
      }),
      ProofPolicyError,
    );
  });
}

test("single-item apply policy requires one explicit assignment", () => {
  assert.deepEqual(
    validateSingleApplyRequest({
      assignments: [{ taskId: "P0-05", status: "Ready" }],
    }),
    { taskId: "P0-05", status: "Ready" },
  );
  for (const assignments of [
    [],
    [{ taskId: "P0-05", status: "Ready" }, { taskId: "P0-07", status: "Backlog" }],
    [{ taskId: "P0-05", status: "Ready", extra: true }],
  ]) {
    assert.throws(
      () => validateSingleApplyRequest({ assignments }),
      ProofPolicyError,
    );
  }
  assert.deepEqual(
    validateSingleApplyRequest({ assignments: [{ taskId: "P0-06", status: "Done" }] }),
    { taskId: "P0-06", status: "Done" },
  );
});

test("title-or-marker candidate selection fences a drifted duplicate before mutation", () => {
  const marker = "<!-- curve-project-sync:v1 id=P0-05 -->";
  const items = [
    { title: "[P0-05] Canonical", content: { body: marker } },
    { title: "Drifted title", content: { body: marker } },
  ];
  let writes = 0;
  assert.throws(() => {
    selectUniqueProjectItem(items, "P0-05");
    writes += 1;
  }, ProofPolicyError);
  assert.equal(writes, 0);
});

test("legacy body status is parsed only from one supported status line", () => {
  assert.equal(extractLegacyProjectedStatus("- Curve status: In review\n"), "In review");
  assert.throws(() => extractLegacyProjectedStatus("- Curve status: Unknown\n"), ProofPolicyError);
  assert.throws(
    () => extractLegacyProjectedStatus("- Curve status: Ready\n- Curve status: Done\n"),
    ProofPolicyError,
  );
});

test("superseded proof-package status validation is informational and read-only", () => {
  const result = spawnSync(process.execPath, [SYNCHRONIZER_PATH, "--validate-status", "P0-06=Done"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    mode: "validate-status",
    taskId: "P0-06",
    status: "Done",
    valid: true,
    projectStatusAuthority: "informational-only",
  });
});

function singleItemIo(options = {}) {
  let state = options.initial ?? "INITIAL_EXACT";
  const calls = [];
  let refreshCount = 0;
  return {
    calls,
    get state() {
      return state;
    },
    refresh() {
      refreshCount += 1;
      calls.push(`refresh:${refreshCount}`);
      if (options.refreshRaceAt === refreshCount) return "UNEXPECTED";
      return state;
    },
    writeBody() {
      calls.push("writeBody");
      if (options.bodyFailure === "before") throw new Error("body write failed");
      state = "BODY_ONLY_EXACT";
      if (options.bodyFailure === "after") throw new Error("body response lost");
    },
    writeStatus() {
      calls.push("writeStatus");
      if (options.statusFailure === "before") throw new Error("status write failed");
      state = "COMPLETE_EXACT";
      if (options.statusFailure === "after") throw new Error("status response lost");
    },
  };
}

function canonicalInitialFixture() {
  const priorSourceRevision = "a".repeat(40);
  const currentSourceRevision = "b".repeat(40);
  const priorBody = [
    "<!-- curve-project-sync:v1 id=P0-05 -->",
    "## Curve work package",
    "",
    `- Normative source revision: \`${priorSourceRevision}\``,
    "",
  ].join("\n");
  const targetBody = [
    "<!-- curve-project-sync:v1 id=P0-05 -->",
    "## Curve work package",
    "",
    `- Normative source revision: \`${currentSourceRevision}\``,
    "",
  ].join("\n");
  return {
    taskId: "P0-05",
    currentSourceRevision,
    priorSourceRevision,
    priorIsAncestor: true,
    priorTitle: "[P0-05] Canonical prior",
    priorBody,
    priorStatus: "Ready",
    itemTitle: "[P0-05] Canonical prior",
    itemBody: priorBody,
    itemStatus: "Ready",
    targetTitle: "[P0-05] Canonical current",
    targetBody,
    targetStatus: "In progress",
  };
}

function targetBodyNonTargetStatusFixture() {
  const initial = canonicalInitialFixture();
  initial.itemTitle = initial.targetTitle;
  initial.itemBody = initial.targetBody;
  initial.priorSourceRevision = null;
  initial.priorIsAncestor = null;
  initial.priorTitle = null;
  initial.priorBody = null;
  initial.priorStatus = null;
  return initial;
}

for (const [name, mutate] of [
  ["tampered title", (initial) => { initial.itemTitle = "[P0-05] Tampered"; }],
  ["tampered body", (initial) => { initial.itemBody += "tampered\n"; }],
  ["unmerged prior source", (initial) => { initial.priorIsAncestor = false; }],
]) {
  test(`validated single-item update rejects ${name} with zero adapter calls`, () => {
    const initial = canonicalInitialFixture();
    mutate(initial);
    const io = singleItemIo();
    assert.throws(
      () => executeValidatedSingleExistingItemStatusUpdate({ initial, io }),
      ProofPolicyError,
    );
    assert.deepEqual(io.calls, []);
  });
}

test("validated single-item update accepts an exact canonical prior projection", () => {
  const io = singleItemIo();
  assert.equal(
    executeValidatedSingleExistingItemStatusUpdate({ initial: canonicalInitialFixture(), io }).receipt,
    "EXACT_COMPLETION",
  );
  assert.equal(io.calls.filter((call) => call === "writeBody").length, 1);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

test("historical canonical projection may predate context and proof-stage fields", () => {
  const initial = canonicalInitialFixture();
  assert.doesNotMatch(initial.priorBody, /Context digest|Proof stage record/);
  assert.match(initial.targetBody, /Normative source revision/);
  const io = singleItemIo();
  assert.equal(
    executeValidatedSingleExistingItemStatusUpdate({ initial, io }).receipt,
    "EXACT_COMPLETION",
  );
});

for (const interveningStatus of ["Ready", "Done"]) {
  test(`validated single-item update completes a target body with ${interveningStatus} status`, () => {
    const initial = targetBodyNonTargetStatusFixture();
    initial.itemStatus = interveningStatus;
    const io = singleItemIo({ initial: "BODY_ONLY_EXACT" });
    assert.equal(
      executeValidatedSingleExistingItemStatusUpdate({ initial, io }).receipt,
      "EXACT_COMPLETION",
    );
    assert.equal(io.calls.filter((call) => call === "writeBody").length, 0);
    assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
  });
}

test("validated single-item update accepts exact idempotent completion", () => {
  const initial = targetBodyNonTargetStatusFixture();
  initial.itemStatus = initial.targetStatus;
  const io = singleItemIo({ initial: "COMPLETE_EXACT" });
  assert.deepEqual(
    executeValidatedSingleExistingItemStatusUpdate({ initial, io }),
    { receipt: "EXACT_COMPLETION", reconciled: true },
  );
  assert.equal(io.calls.some((call) => call.startsWith("write")), false);
});

test("validated single-item update rejects a tampered near-target body with zero adapter calls", () => {
  const initial = targetBodyNonTargetStatusFixture();
  initial.itemBody += " ";
  const io = singleItemIo({ initial: "BODY_ONLY_EXACT" });
  assert.throws(
    () => executeValidatedSingleExistingItemStatusUpdate({ initial, io }),
    ProofPolicyError,
  );
  assert.deepEqual(io.calls, []);
});

test("validated single-item update preserves same-process lost-body-response reconciliation", () => {
  const io = singleItemIo({ bodyFailure: "after" });
  assert.deepEqual(
    executeValidatedSingleExistingItemStatusUpdate({
      initial: canonicalInitialFixture(),
      io,
    }),
    { receipt: "EXACT_COMPLETION", reconciled: true },
  );
  assert.equal(io.calls.filter((call) => call === "writeBody").length, 1);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

test("single-item update performs body-first exact writes and returns a receipt", () => {
  const io = singleItemIo();
  assert.deepEqual(executeSingleExistingItemStatusUpdate(io), {
    receipt: "EXACT_COMPLETION",
    reconciled: false,
  });
  assert.equal(io.state, "COMPLETE_EXACT");
  assert.equal(io.calls.filter((call) => call === "writeBody").length, 1);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

for (const [name, options] of [
  ["lost body response", { bodyFailure: "after" }],
  ["lost status response", { statusFailure: "after" }],
]) {
  test(`single-item update reconciles ${name}`, () => {
    const io = singleItemIo(options);
    assert.deepEqual(executeSingleExistingItemStatusUpdate(io), {
      receipt: "EXACT_COMPLETION",
      reconciled: true,
    });
    assert.equal(io.state, "COMPLETE_EXACT");
  });
}

test("exact completion is idempotent and performs no mutation", () => {
  const io = singleItemIo({ initial: "COMPLETE_EXACT" });
  assert.deepEqual(executeSingleExistingItemStatusUpdate(io), {
    receipt: "EXACT_COMPLETION",
    reconciled: true,
  });
  assert.equal(io.calls.some((call) => call.startsWith("write")), false);
});

test("same-process body-only state completes without a duplicate body write", () => {
  const io = singleItemIo({ initial: "BODY_ONLY_EXACT" });
  assert.equal(executeSingleExistingItemStatusUpdate(io).receipt, "EXACT_COMPLETION");
  assert.equal(io.calls.includes("writeBody"), false);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

for (const [name, options, partialState] of [
  ["item or main race", { refreshRaceAt: 2 }, "BODY_ONLY_EXACT"],
  ["true body-write failure", { bodyFailure: "before" }, "INITIAL_EXACT"],
  ["true status-write failure", { statusFailure: "before" }, "BODY_ONLY_EXACT"],
]) {
  test(`single-item update returns no receipt and fences ${name}`, () => {
    const io = singleItemIo(options);
    let receipt = null;
    assert.throws(() => {
      receipt = executeSingleExistingItemStatusUpdate(io);
    }, ProofPolicyError);
    assert.equal(receipt, null);
    assert.equal(io.state, partialState);
  });
}

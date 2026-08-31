import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  M0_S9B_CONTEXT_PATHS,
  M0_S9B1_CONTEXT_PATHS,
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
    "contracts/database/m0-s2-relational-contract.md",
    "contracts/governance/m0-s9b1-provider-administration-v1.json",
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/schemas/examples/provider-administration-decision.invalid.json",
    "contracts/schemas/examples/provider-connection-administration-page.invalid.json",
    "contracts/schemas/examples/provider-connection-administration-page.valid.json",
    "contracts/schemas/examples/provider-connection-administration.invalid.json",
    "contracts/schemas/examples/provider-connection-administration.valid.json",
    "contracts/schemas/examples/provider-connection-register-request.invalid.json",
    "contracts/schemas/examples/provider-connection-register-request.valid.json",
    "contracts/schemas/operation-summary.schema.json",
    "contracts/schemas/provider-administration-decision.schema.json",
    "contracts/schemas/provider-connection-administration-page.schema.json",
    "contracts/schemas/provider-connection-administration.schema.json",
    "contracts/schemas/provider-connection-register-request.schema.json",
    "contracts/schemas/semantic-fixtures/provider-administration-decision-approved.valid.json",
    "contracts/schemas/semantic-fixtures/provider-administration-decision-deferred.valid.json",
    "contracts/schemas/semantic-fixtures/provider-administration-decision-lifecycle.invalid.json",
    "contracts/schemas/provider-connection.schema.json",
    "docs/technical/integration-contracts.md",
    "docs/technical/m0-s9a-implementation-evidence.md",
    "docs/technical/m0-s9b-provider-transport-task-packet.md",
    "docs/technical/m0-s9b1-provider-administration-decision.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/context-pack.mjs",
    "scripts/tests/m0-s9-remainder-readiness.test.mjs",
  ]);

  const packet = read("docs/technical/m0-s9b-provider-transport-task-packet.md");
  assert.match(packet, /`PREPARED \/ BLOCKED \/ NO_DISPATCH`/);
  for (const child of ["M0-S9B1", "M0-S9B2", "M0-S9B3", "M0-S9B4", "M0-S9B5", "M0-S9B6"]) {
    assert.match(packet, new RegExp(`${child.replace("-", "\\-")} \\(`));
  }
  for (const boundary of [
    /Workspace preauthorization executes before any provider-connection lookup/,
    /exact\s+`\(workspace_id, connection_id\)` safe-metadata lookup/,
    /`PROVIDER_CONNECTION` resource authorization before secret resolution,\s+provider-event draining, network access, or scheduling mutation/,
    /callback can append an observation or request reconciliation/,
    /Redirect following is disabled/,
    /at least every\s+900 seconds/,
    /cannot reopen, delete, force-push/,
    /one provider\/profile\/environment per packet/i,
    /`B-OWNER`[\s\S]*same-human bootstrap exception/i,
  ]) assert.match(packet, boundary);
});

test("M0-S9B1 context pins the fail-closed provider-administration decision gate", () => {
  assertContext("M0-S9B1", M0_S9B1_CONTEXT_PATHS, [
    "contracts/database/m0-03-policy-contract.md",
    "contracts/database/m0-s2-relational-contract.md",
    "contracts/database/m0-s9a-provider-registry-contract.md",
    "contracts/providers/m0-s9a-provider-registry-v1.json",
    "contracts/schemas/access-envelope.schema.json",
    "contracts/schemas/core-policy-manifest-v2.schema.json",
    "contracts/governance/m0-s9b1-provider-administration-v1.json",
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/policy/core-policy-v2.json",
    "contracts/schemas/audit-event.schema.json",
    "contracts/schemas/event-envelope.schema.json",
    "contracts/schemas/idempotency-record.schema.json",
    "contracts/schemas/inbox-message.schema.json",
    "contracts/schemas/operation.schema.json",
    "contracts/schemas/operation-summary.schema.json",
    "contracts/schemas/outbox-event.schema.json",
    "contracts/schemas/policy-decision.schema.json",
    "contracts/schemas/policy-evaluation.schema.json",
    "contracts/schemas/provider-administration-decision.schema.json",
    "contracts/schemas/examples/provider-connection-administration-page.invalid.json",
    "contracts/schemas/examples/provider-connection-administration-page.valid.json",
    "contracts/schemas/examples/provider-connection-administration.invalid.json",
    "contracts/schemas/examples/provider-connection-administration.valid.json",
    "contracts/schemas/examples/provider-connection-register-request.invalid.json",
    "contracts/schemas/examples/provider-connection-register-request.valid.json",
    "contracts/schemas/provider-connection-register-request.schema.json",
    "contracts/schemas/provider-connection-administration-page.schema.json",
    "contracts/schemas/provider-connection-administration.schema.json",
    "contracts/schemas/provider-connection-event-v1.schema.json",
    "contracts/schemas/provider-reconciliation-event-v1.schema.json",
    "contracts/schemas/provider-registry-manifest.schema.json",
    "contracts/schemas/semantic-fixtures/provider-administration-decision-approved.valid.json",
    "contracts/schemas/semantic-fixtures/provider-administration-decision-deferred.valid.json",
    "contracts/schemas/semantic-fixtures/provider-administration-decision-lifecycle.invalid.json",
    "contracts/testing/ac-test-matrix-v1.json",
    "docs/technical/integration-contracts.md",
    "docs/technical/m0-s9b1-provider-administration-decision.md",
    "scripts/lib/provider-administration-decision.mjs",
    "scripts/tests/provider-administration-decision.test.mjs",
    "scripts/validate-contracts.mjs",
  ]);

  const decision = JSON.parse(
    read("contracts/governance/m0-s9b1-provider-administration-v1.json"),
  );
  assert.equal(decision.status, "PROPOSED");
  assert.equal(decision.decision_outcome, "UNSELECTED");
  assert.equal(decision.implementation_dispatch_allowed, false);
  assert.equal(decision.activation.plane_implementation_authorized, false);
  assert.equal(decision.unresolved_requirements.length, 17);
  assert.deepEqual(decision.material_options.governance_identity_authority, {
    allowed: ["X3M_IDP_SUBJECT", "PLANE_USER_ID", "GITHUB_USER_ID"],
    selected: null,
  });
  assert.deepEqual(decision.material_options.async_operation_profile, {
    allowed: [
      "SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1",
      "DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1",
      "DEFER",
    ],
    selected: null,
  });
  assert.equal(
    Object.values(decision.material_options).every((option) => option.selected === null),
    true,
  );

  const decisionDoc = read("docs/technical/m0-s9b1-provider-administration-decision.md");
  const externalLinks = [
    ...decisionDoc.matchAll(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g),
  ];
  assert.equal(externalLinks.length, 4);
  for (const link of externalLinks) {
    const followingText = decisionDoc.slice(link.index + link[0].length);
    assert.match(followingText, /^\s+\([^)]{1,240}\)/, link[0]);
  }
  for (const identityOption of [
    "X3M_IDP_SUBJECT",
    "PLANE_USER_ID",
    "GITHUB_USER_ID",
  ]) assert.ok(decisionDoc.includes(`\`${identityOption}\``), identityOption);
  for (const asyncOption of [
    "SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1",
    "DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1",
    "DEFER",
  ]) assert.ok(decisionDoc.includes(`\`${asyncOption}\``), asyncOption);
  for (const boundary of [
    /aliases[\s\S]*?cannot establish equality or distinctness/i,
    /GitHub subjects only as non-zero decimal user IDs/i,
    /proof_case_id[\s\S]*?must equal[\s\S]*?case_id/i,
    /exact union[\s\S]*?approved_classifications/i,
    /B-ADMIN-M0-S9B1[\s\S]*?M0-S9B1[\s\S]*?github\.com\/faocampo\/curve/i,
    /`If-Match`[\s\S]*?`PROVIDER_CONNECTION`/i,
    /`VALIDATE` and `RECONCILE`[\s\S]*?`OPERATION`/i,
    /`last_updated`[\s\S]*?not earlier than[\s\S]*?`decided_at`[\s\S]*?approval/i,
    /`REGISTER` is the only operation\s+that accepts a request body; `LIST`, `READ`, `VALIDATE`, `RECONCILE`, `DISABLE`,\s+`ENABLE`, and `REVOKE` have request-body contract `NONE`/i,
    /`SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1`[\s\S]*`PROVIDER_ADMINISTRATION`[\s\S]*`DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1`[\s\S]*`PROVIDER_VALIDATION`[\s\S]*`PROVIDER_RECONCILIATION`/i,
    /`DIGEST_BOUND_HUMAN_ATTESTATION`[\s\S]*three canonical\s+governance approvals[\s\S]*no\s+runtime network resolver/i,
    /`PROPOSED_NOT_NORMATIVE`[\s\S]*raw[\s\S]*SHA-256/i,
    /`FAKE_LOCAL`[\s\S]*`curve\.fake-local`[\s\S]*`1\.0\.0`[\s\S]*`LOCAL`/i,
    /authorization[\s\S]*before[\s\S]*idempotency[\s\S]*`ResourceRef`/i,
    /fourteen passing proof cases/i,
    /dispatch_revalidation_required[\s\S]*next review/i,
    /Every selected runtime environment[\s\S]*unique content digest[\s\S]*unique `\(reference, source_revision\)` locator/i,
    /leading\/trailing-whitespace[\s\S]*subjects fail/i,
    /all twelve documented `DEFER` choices/i,
  ]) assert.match(decisionDoc, boundary);
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

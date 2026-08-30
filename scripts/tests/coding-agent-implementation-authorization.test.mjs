import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  authorizeCodingAgentTaskPacketForExecution,
  authorizeCodingAgentTaskPacketForExecutionWithTestControllers,
  acquireCodingAgentImplementationAttemptLease,
  buildCodingAgentAttemptLeaseRequest,
  computeCodingAgentAuthorizationEvidenceDigest,
  computeCodingAgentAuthorizedControllerContractsDigest,
  computeCodingAgentAuthorizedEffectsDigest,
  computeCodingAgentImplementationApprovalSubjectDigest,
  computeCodingAgentImplementationRevocationSubjectDigest,
  createCodingAgentTrustedControllerRemoteTipResolver,
  createCodingAgentAuthorizationPreflightTestController,
  createCodingAgentTrustedGitExecutableRunner,
  createCodingAgentTrustedGitTestSeam,
  createCodingAgentTrustedRemoteTipTestSeam,
  projectCodingAgentImplementationApprovalSubject,
  selectRegisteredCodingAgentImplementationAuthorization,
  validateCodingAgentImplementationAuthorizationAgainstPacket,
  validateCodingAgentImplementationAuthorizationEvidence,
  validateCodingAgentImplementationAuthorizationSemantics,
  validateCodingAgentImplementationAuthorizationSetSemantics,
  validateExactCurveOriginMainCheckout,
  verifyCodingAgentImplementationHumanAuthority,
} from "../lib/coding-agent-implementation-authorization.mjs";

const WORKSPACE_ID = "10000000-0000-4000-8000-000000000001";
const OTHER_WORKSPACE_ID = "10000000-0000-4000-8000-000000000002";
const ATTEMPT_ID = "20000000-0000-4000-8000-000000000001";
const OTHER_ATTEMPT_ID = "20000000-0000-4000-8000-000000000002";
const LEASE_ID = "30000000-0000-4000-8000-000000000001";
const CURVE_REVISION = "a0d21bee7f98f2477d9cfe69708a8ac043c4fc69";
const TARGET_BASE = "99a73b4eab5ee21fd012d7358bc9259252d47f71";
const PACKET_DIGEST = `sha256:${"a".repeat(64)}`;
const CONTEXT_DIGEST = `sha256:${"b".repeat(64)}`;
const GOVERNANCE_BYTES = Buffer.from("approved implementation authorization governance\n");
const GOVERNANCE_DIGEST = computeCodingAgentAuthorizationEvidenceDigest(GOVERNANCE_BYTES);
const AUTHORIZATION_PATH =
  "contracts/task-packet-authorizations/curve-auth-m1-01b-attempt-1-v1.json";
const GOVERNANCE_PATH = "docs/technical/m1-m7-task-packets.md";

function clone(value) {
  return structuredClone(value);
}

function basePacket() {
  return {
    status: "READY",
    workspace_id: WORKSPACE_ID,
    packet_id: "CURVE-M1-01B",
    packet_version: 1,
    packet_digest: PACKET_DIGEST,
    curve_binding: {
      repository: "https://github.com/faocampo/curve",
      curve_revision: CURVE_REVISION,
      context_pack: { context_digest: CONTEXT_DIGEST },
    },
    repository: {
      url: "git@github.com:faocampo/plane.git",
      target_branch: "preview",
      feature_branch: "curve/m1-01b-initiative-shell",
      base_sha: TARGET_BASE,
    },
    people: {
      owner: { actor_type: "HUMAN", name: "Federico Ocampo", handle: "faocampo" },
      human_reviewer: {
        actor_type: "HUMAN",
        name: "Federico Ocampo",
        handle: "faocampo",
      },
      implementer: { actor_type: "AI_CODING_AGENT", identifier: "codex" },
    },
    scope: {
      in_scope: ["Implement the exact Initiative shell slice."],
      out_of_scope: ["Merge, deployment, providers, protected data, and infrastructure."],
    },
    budget: {
      currency: "USD",
      maximum_external_spend: 0,
      maximum_compute_minutes: 120,
      on_exhaustion: "PAUSE",
    },
    external_effects: {
      policy_id: "EXTERNAL-EFFECTS-POLICY",
      status: "APPROVED",
      mode: "NONE",
      effects: [],
      controller_contracts: [],
      state_binding: { resolution: "RESOLVED", approval_subject_digest: `sha256:${"c".repeat(64)}` },
    },
    rollback: {
      policy_id: "ROLLBACK-POLICY",
      status: "APPROVED",
      before_merge: "Revert the feature branch.",
      after_merge_disablement: "Set CURVE_ENABLED=0.",
      persistent_data_strategy: "Preserve authoritative records.",
      verification_command: "git diff --check",
      state_binding: { resolution: "RESOLVED", approval_subject_digest: `sha256:${"d".repeat(64)}` },
    },
  };
}

function approvalProvenance() {
  return {
    kind: "CURVE_MERGED_GOVERNANCE",
    repository: "CURVE",
    revision: CURVE_REVISION,
    path: GOVERNANCE_PATH,
    content_digest: GOVERNANCE_DIGEST,
  };
}

function authorityReceipt(suffix = "approval-1") {
  return {
    kind: "EXTERNAL_TRUSTED_HUMAN_AUTHORITY",
    reference: `authority-receipt:test/${suffix}`,
    content_digest: `sha256:${"7".repeat(64)}`,
    revalidation_policy: "RECHECK_REVOCATION_EACH_DISPATCH",
  };
}

function activeAuthorization(packet = basePacket()) {
  const approvalSubject = projectCodingAgentImplementationApprovalSubject(packet, {
    attemptId: ATTEMPT_ID,
    permittedAgentWorkflowActions: [
      "INSPECT_AUTHORIZED_CONTEXT",
      "EDIT_AUTHORIZED_WORKTREE",
      "RUN_APPROVED_COMMANDS",
      "CREATE_CANDIDATE_TREE",
      "REPORT_RESULTS",
    ],
    validFrom: "2026-08-30T10:00:00Z",
    expiresAt: "2026-08-30T12:00:00Z",
  });
  const digest = computeCodingAgentImplementationApprovalSubjectDigest(approvalSubject);
  return {
    schema_version: "curve.coding-agent-implementation-authorization/v1",
    authorization_id: "CURVE-AUTH-M1-01B-ATTEMPT-1",
    authorization_version: 1,
    workspace_id: packet.workspace_id,
    replaces_authorization_version: null,
    lifecycle_state: "ACTIVE",
    approval_subject: approvalSubject,
    approval_subject_digest: digest,
    attestations: [
      {
        actor_type: "HUMAN",
        authority_role: "IMPLEMENTATION_APPROVER",
        actor_id: "faocampo",
        actor_name: "Federico Ocampo",
        subject_digest: digest,
        attested_at: "2026-08-30T09:55:00Z",
        authority_receipt: authorityReceipt(),
        provenance: approvalProvenance(),
      },
    ],
    revoked_at: null,
    revocation_reason: null,
    revocation_subject: null,
    revocation_subject_digest: null,
    revocation_attestation: null,
  };
}

function resealApproval(authorization) {
  const digest = computeCodingAgentImplementationApprovalSubjectDigest(
    authorization.approval_subject,
  );
  authorization.approval_subject_digest = digest;
  for (const attestation of authorization.attestations) {
    attestation.subject_digest = digest;
  }
  return authorization;
}

function revokedAuthorization(active) {
  const authorization = clone(active);
  authorization.authorization_version = 2;
  authorization.replaces_authorization_version = 1;
  authorization.lifecycle_state = "REVOKED";
  authorization.revoked_at = "2026-08-30T10:45:00Z";
  authorization.revocation_reason = "Implementation authority was withdrawn.";
  authorization.revocation_subject = {
    authorization_id: authorization.authorization_id,
    authorization_version: authorization.authorization_version,
    replaces_authorization_version: authorization.replaces_authorization_version,
    approval_subject_digest: authorization.approval_subject_digest,
    revoked_at: authorization.revoked_at,
    revocation_reason: authorization.revocation_reason,
  };
  authorization.revocation_subject_digest =
    computeCodingAgentImplementationRevocationSubjectDigest(
      authorization.revocation_subject,
    );
  authorization.revocation_attestation = {
    actor_type: "HUMAN",
    authority_role: "IMPLEMENTATION_REVOKER",
    actor_id: "faocampo",
    actor_name: "Federico Ocampo",
    subject_digest: authorization.revocation_subject_digest,
    attested_at: authorization.revoked_at,
    authority_receipt: authorityReceipt("revocation-1"),
    provenance: approvalProvenance(),
  };
  return authorization;
}

function authorizationEvidence(authorization, overrides = {}) {
  const authorizationBytes = Buffer.from(`${JSON.stringify(authorization, null, 2)}\n`);
  const reference = {
    repository: "CURVE",
    path: AUTHORIZATION_PATH,
    revision: CURVE_REVISION,
    content_digest: computeCodingAgentAuthorizationEvidenceDigest(authorizationBytes),
  };
  return {
    reference,
    selectedCurveRevision: CURVE_REVISION,
    resolveReference: (candidate) => {
      if (candidate.path === AUTHORIZATION_PATH) return authorizationBytes;
      if (candidate.path === GOVERNANCE_PATH) return GOVERNANCE_BYTES;
      throw new Error(`unexpected evidence ${candidate.path}`);
    },
    isMergedCurveRevision: (revision, selected) =>
      revision === CURVE_REVISION && selected === CURVE_REVISION,
    ...overrides,
  };
}

function preflight(packet, overrides = {}) {
  return {
    packet_digest: packet.packet_digest,
    context_digest: packet.curve_binding.context_pack.context_digest,
    evidence: { referenceCount: 1 },
    repositories: { curve: {}, target: {} },
    project: { itemNodeId: "PVTI_test" },
    implementation_authority_granted: false,
    ...overrides,
  };
}

function trustedHumanAuthorityVerifier(overrides = {}) {
  return (request) => ({
    schema_version: "curve.trusted-human-authority-verification-result/v1",
    decision: "VERIFIED",
    action: request.action,
    workspace_id: request.workspace_id,
    actor_type: request.actor_type,
    actor_id: request.actor_id,
    actor_name: request.actor_name,
    authority_role: request.authority_role,
    subject_digest: request.subject_digest,
    issued_at: request.issued_at,
    authority_receipt: clone(request.authority_receipt),
    request_nonce: request.request_nonce,
    requested_at: request.requested_at,
    request_digest: request.request_digest,
    verified_at: "2026-08-30T10:29:59Z",
    receipt_revocation_check: {
      status: "NOT_REVOKED",
      checked_at: "2026-08-30T10:29:59Z",
      authority_receipt_reference: request.authority_receipt.reference,
      authority_receipt_content_digest: request.authority_receipt.content_digest,
      request_nonce: request.request_nonce,
      request_digest: request.request_digest,
    },
    verification_receipt: {
      reference: `authority-verification:test/${request.action.toLowerCase()}`,
      content_digest: `sha256:${"8".repeat(64)}`,
      request_nonce: request.request_nonce,
      request_digest: request.request_digest,
    },
    ...overrides,
  });
}

function trustedAttemptLeaseProvider(overrides = {}) {
  return (request) => ({
    schema_version: "curve.trusted-attempt-lease-result/v1",
    decision: "ACQUIRED",
    workspace_id: request.workspace_id,
    attempt_id: request.attempt_id,
    attempt_state: "CURRENT_NONTERMINAL",
    packet_digest: request.packet_digest,
    authorization_id: request.authorization_id,
    authorization_version: request.authorization_version,
    approval_subject_digest: request.approval_subject_digest,
    lease_id: request.lease_id,
    lease_expires_at: request.lease_expires_at,
    idempotency_key: request.idempotency_key,
    acquired_at: "2026-08-30T10:30:00Z",
    lease_receipt: {
      kind: "DURABLE_SINGLE_CONSUMPTION_ATTEMPT_LEASE",
      reference: `attempt-lease:test/${request.lease_id}`,
      content_digest: `sha256:${"9".repeat(64)}`,
    },
    ...overrides,
  });
}

function grantOptions(authorization) {
  return {
    validatePreflight: () => preflight(basePacket()),
    expectedAttemptId: ATTEMPT_ID,
    now: "2026-08-30T10:30:00Z",
    authorizationEvidence: authorizationEvidence(authorization),
    verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier(),
    acquireTrustedAttemptLease: trustedAttemptLeaseProvider(),
    leaseId: LEASE_ID,
    leaseExpiresAt: "2026-08-30T11:00:00Z",
  };
}

function authorizeForTest(packet, authorization, options) {
  const { validatePreflight, ...trustedOptions } = options;
  const preflightController = createCodingAgentAuthorizationPreflightTestController(
    validatePreflight ?? (() => preflight(packet)),
  );
  return authorizeCodingAgentTaskPacketForExecutionWithTestControllers(
    packet,
    authorization,
    trustedOptions,
    { preflightController },
  );
}

test("production authorization rejects caller-selected preflight and remains fail closed", () => {
  const packet = basePacket();
  const authorization = activeAuthorization(packet);
  const callerSelected = grantOptions(authorization);
  assert.throws(
    () => authorizeCodingAgentTaskPacketForExecution(
      packet,
      authorization,
      callerSelected,
    ),
    /does not accept caller-selected validatePreflight/i,
  );

  const callerSelectedNow = { ...callerSelected };
  delete callerSelectedNow.validatePreflight;
  assert.throws(
    () => authorizeCodingAgentTaskPacketForExecution(
      packet,
      authorization,
      callerSelectedNow,
    ),
    /does not accept caller-selected now/i,
  );

  const productionOptions = { ...callerSelected };
  delete productionOptions.validatePreflight;
  assert.throws(
    () => authorizeCodingAgentTaskPacketForExecutionWithTestControllers(
      packet,
      authorization,
      productionOptions,
      { preflightController: () => preflight(packet) },
    ),
    /tagged task-packet preflight controller/i,
  );
});

test("exact preflight plus merged human authorization grants execution authority", () => {
  const packet = basePacket();
  const authorization = activeAuthorization(packet);
  let preflightCalls = 0;
  const result = authorizeForTest(packet, authorization, {
    validatePreflight: () => {
      preflightCalls += 1;
      return preflight(packet);
    },
    expectedAttemptId: ATTEMPT_ID,
    now: "2026-08-30T10:30:00Z",
    authorizationEvidence: authorizationEvidence(authorization),
    verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier(),
    acquireTrustedAttemptLease: trustedAttemptLeaseProvider(),
    leaseId: LEASE_ID,
    leaseExpiresAt: "2026-08-30T11:00:00Z",
  });
  assert.equal(preflightCalls, 1);
  assert.equal(result.implementation_authority_granted, true);
  assert.equal(result.authorization.workspace_id, WORKSPACE_ID);
  assert.equal(result.authorization.attempt_id, ATTEMPT_ID);
  assert.deepEqual(
    result.authorization.permitted_agent_workflow_actions,
    authorization.approval_subject.permitted_agent_workflow_actions,
  );
  assert.equal(result.authorization.human_authority_verifications.length, 1);
  assert.equal(result.authorization.attempt_lease.leaseId, LEASE_ID);
  assert.equal(result.authorization.external_effects_binding, null);
});

test("every execution-tuple mismatch is rejected after resealing", () => {
  const cases = [
    ["workspace", (authorization) => {
      authorization.workspace_id = OTHER_WORKSPACE_ID;
      authorization.approval_subject.workspace_id = OTHER_WORKSPACE_ID;
    }],
    ["attempt", (authorization) => { authorization.approval_subject.attempt_id = OTHER_ATTEMPT_ID; }],
    ["packet id", (authorization) => { authorization.approval_subject.packet.packet_id = "CURVE-M1-01C"; }],
    ["packet version", (authorization) => { authorization.approval_subject.packet.packet_version = 2; }],
    ["packet digest", (authorization) => { authorization.approval_subject.packet.packet_digest = `sha256:${"e".repeat(64)}`; }],
    ["Curve revision", (authorization) => { authorization.approval_subject.curve.curve_revision = "1".repeat(40); }],
    ["context digest", (authorization) => { authorization.approval_subject.curve.context_digest = `sha256:${"f".repeat(64)}`; }],
    ["repository", (authorization) => { authorization.approval_subject.repository.url = "git@github.com:faocampo/other.git"; }],
    ["target branch", (authorization) => { authorization.approval_subject.repository.target_branch = "main"; }],
    ["feature branch", (authorization) => { authorization.approval_subject.repository.feature_branch = "curve/other"; }],
    ["base", (authorization) => { authorization.approval_subject.repository.base_sha = "2".repeat(40); }],
    ["owner", (authorization) => { authorization.approval_subject.people.owner.handle = "other"; }],
    ["reviewer", (authorization) => { authorization.approval_subject.people.human_reviewer.handle = "other"; }],
    ["implementer", (authorization) => { authorization.approval_subject.people.implementer.identifier = "other-agent"; }],
    ["in scope", (authorization) => { authorization.approval_subject.scope.in_scope = ["Widened scope"]; }],
    ["exclusion", (authorization) => { authorization.approval_subject.scope.out_of_scope = ["Only deployment excluded"]; }],
    ["external spend", (authorization) => { authorization.approval_subject.budget.maximum_external_spend = 25; }],
    ["compute", (authorization) => { authorization.approval_subject.budget.maximum_compute_minutes = 240; }],
    ["external effects", (authorization) => { authorization.approval_subject.external_effects.mode = "TRUSTED_CONTROLLER_ONLY"; }],
    ["rollback", (authorization) => { authorization.approval_subject.rollback.before_merge = "Delete unrelated branches"; }],
  ];
  for (const [label, mutate] of cases) {
    const packet = basePacket();
    const authorization = activeAuthorization(packet);
    mutate(authorization);
    resealApproval(authorization);
    assert.throws(
      () => validateCodingAgentImplementationAuthorizationAgainstPacket(
        packet,
        authorization,
        { now: "2026-08-30T10:30:00Z", expectedAttemptId: ATTEMPT_ID },
      ),
      /does not exactly match|workspace_id/i,
      label,
    );
  }
});

test("agent, system, wrong-role, future, and digest-forged approvals fail closed", () => {
  const tenantEnvelope = activeAuthorization();
  tenantEnvelope.workspace_id = OTHER_WORKSPACE_ID;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(tenantEnvelope),
    /envelope workspace_id/i,
  );
  for (const actorType of ["AI_CODING_AGENT", "SYSTEM"]) {
    const authorization = activeAuthorization();
    authorization.attestations[0].actor_type = actorType;
    assert.throws(
      () => validateCodingAgentImplementationAuthorizationSemantics(authorization),
      /HUMAN/i,
    );
  }
  const role = activeAuthorization();
  role.attestations[0].authority_role = "IMPLEMENTATION_REVOKER";
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(role),
    /IMPLEMENTATION_APPROVER/i,
  );
  const lateAttestation = activeAuthorization();
  lateAttestation.attestations[0].attested_at = "2026-08-30T10:01:00Z";
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(lateAttestation),
    /at or before valid_from/i,
  );
  const forgedDigest = activeAuthorization();
  forgedDigest.approval_subject_digest = `sha256:${"0".repeat(64)}`;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(forgedDigest),
    /not canonical/i,
  );
});

test("future, expired, and revoked authorizations cannot grant authority", () => {
  const packet = basePacket();
  const future = activeAuthorization(packet);
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationAgainstPacket(packet, future, {
      expectedAttemptId: ATTEMPT_ID,
      now: "2026-08-30T09:59:59Z",
    }),
    /not active yet/i,
  );
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationAgainstPacket(packet, future, {
      expectedAttemptId: ATTEMPT_ID,
      now: "2026-08-30T12:00:00Z",
    }),
    /expired/i,
  );
  const revoked = revokedAuthorization(future);
  validateCodingAgentImplementationAuthorizationSemantics(revoked);
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationAgainstPacket(packet, revoked, {
      expectedAttemptId: ATTEMPT_ID,
      now: "2026-08-30T10:30:00Z",
    }),
    /REVOKED/i,
  );
  revoked.revocation_attestation.subject_digest = revoked.approval_subject_digest;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(revoked),
    /revocation_attestation|revocation_subject_digest/i,
  );
});

test("trusted human authority is independently verified for approval and pre-activation revocation", () => {
  const active = activeAuthorization();
  const missingReceipt = activeAuthorization();
  delete missingReceipt.attestations[0].authority_receipt;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(missingReceipt),
    /missing or unsupported properties/i,
  );
  const missingRevalidation = activeAuthorization();
  delete missingRevalidation.attestations[0].authority_receipt.revalidation_policy;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(missingRevalidation),
    /missing or unsupported properties/i,
  );
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(active),
    /trusted human-authority verifier is required/i,
  );
  const verified = verifyCodingAgentImplementationHumanAuthority(active, {
    verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier(),
    now: "2026-08-30T10:30:00Z",
  });
  assert.equal(verified[0].action, "AUTHORIZE_IMPLEMENTATION");
  assert.equal(verified[0].actorId, "faocampo");

  for (const [label, override] of [
    ["action", { action: "REVOKE_IMPLEMENTATION" }],
    ["workspace", { workspace_id: OTHER_WORKSPACE_ID }],
    ["actor", { actor_id: "other" }],
    ["role", { authority_role: "IMPLEMENTATION_REVOKER" }],
    ["subject", { subject_digest: `sha256:${"0".repeat(64)}` }],
    ["issued time", { issued_at: "2026-08-30T09:54:00Z" }],
    ["receipt", { authority_receipt: authorityReceipt("substituted") }],
  ]) {
    assert.throws(
      () => verifyCodingAgentImplementationHumanAuthority(active, {
        verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier(override),
        now: "2026-08-30T10:30:00Z",
      }),
      /does not bind/i,
      label,
    );
  }

  const revoked = revokedAuthorization(active);
  revoked.revoked_at = "2026-08-30T09:57:00Z";
  revoked.revocation_subject.revoked_at = revoked.revoked_at;
  revoked.revocation_subject_digest =
    computeCodingAgentImplementationRevocationSubjectDigest(revoked.revocation_subject);
  revoked.revocation_attestation.subject_digest = revoked.revocation_subject_digest;
  revoked.revocation_attestation.attested_at = revoked.revoked_at;
  assert.doesNotThrow(() => validateCodingAgentImplementationAuthorizationSemantics(revoked));
  const actions = [];
  verifyCodingAgentImplementationHumanAuthority(revoked, {
    verifyTrustedHumanAuthority: (request) => {
      actions.push(request.action);
      return trustedHumanAuthorityVerifier()(request);
    },
    now: "2026-08-30T10:30:00Z",
  });
  assert.deepEqual(actions, ["AUTHORIZE_IMPLEMENTATION", "REVOKE_IMPLEMENTATION"]);
});

test("trusted human authority rejects replay, nonce mismatch, stale proof, and unverified revocation state", () => {
  const authorization = activeAuthorization();
  const now = "2026-08-30T10:30:00Z";

  let capturedRequest;
  let capturedResult;
  verifyCodingAgentImplementationHumanAuthority(authorization, {
    verifyTrustedHumanAuthority: (request) => {
      capturedRequest = clone(request);
      capturedResult = trustedHumanAuthorityVerifier()(request);
      return capturedResult;
    },
    now,
  });
  assert.match(capturedRequest.request_nonce, /^[0-9a-f]{64}$/u);
  assert.equal(capturedRequest.requested_at, new Date(now).toISOString());
  let replayRequest;
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: (request) => {
        replayRequest = clone(request);
        return clone(capturedResult);
      },
      now,
    }),
    /does not bind request_nonce|does not bind request_digest/i,
    "a previously valid verifier result cannot be replayed against a fresh request",
  );
  assert.notEqual(replayRequest.request_nonce, capturedRequest.request_nonce);

  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier({
        request_nonce: "0".repeat(64),
      }),
      now,
    }),
    /does not bind request_nonce/i,
  );
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier({
        requested_at: "2026-08-30T10:29:59Z",
      }),
      now,
    }),
    /does not bind requested_at/i,
  );
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: trustedHumanAuthorityVerifier({
        verified_at: "2026-08-30T10:29:44Z",
      }),
      now,
    }),
    /verification is stale/i,
  );

  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: (request) => {
        const result = trustedHumanAuthorityVerifier()(request);
        result.receipt_revocation_check.checked_at = "2026-08-30T10:29:44Z";
        return result;
      },
      now,
    }),
    /revocation check is stale/i,
  );
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: (request) => {
        const result = trustedHumanAuthorityVerifier()(request);
        result.receipt_revocation_check.status = "REVOKED";
        return result;
      },
      now,
    }),
    /receipt is revoked or its status is unknown/i,
  );
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: (request) => {
        const result = trustedHumanAuthorityVerifier()(request);
        result.receipt_revocation_check.request_nonce = "f".repeat(64);
        return result;
      },
      now,
    }),
    /revocation check does not bind request nonce/i,
  );
  assert.throws(
    () => verifyCodingAgentImplementationHumanAuthority(authorization, {
      verifyTrustedHumanAuthority: (request) => {
        const result = trustedHumanAuthorityVerifier()(request);
        result.verification_receipt.request_digest = `sha256:${"0".repeat(64)}`;
        return result;
      },
      now,
    }),
    /verification receipt does not bind request digest/i,
  );
});

test("implementation authority fails closed without external authority verification", () => {
  const packet = basePacket();
  const authorization = activeAuthorization(packet);
  const options = grantOptions(authorization);
  delete options.verifyTrustedHumanAuthority;
  assert.throws(
    () => authorizeForTest(packet, authorization, options),
    /trusted human-authority verifier is required/i,
  );
});

test("durable attempt lease binds and single-consumes the exact current attempt", () => {
  const authorization = activeAuthorization();
  const request = buildCodingAgentAttemptLeaseRequest(authorization, {
    leaseId: LEASE_ID,
    leaseExpiresAt: "2026-08-30T11:00:00Z",
  });
  assert.equal(request.workspace_id, WORKSPACE_ID);
  assert.match(request.idempotency_key, /^sha256:[0-9a-f]{64}$/u);
  assert.deepEqual(
    request,
    buildCodingAgentAttemptLeaseRequest(authorization, {
      leaseId: LEASE_ID,
      leaseExpiresAt: "2026-08-30T11:00:00Z",
    }),
  );
  assert.throws(
    () => acquireCodingAgentImplementationAttemptLease(authorization, {
      leaseId: LEASE_ID,
      leaseExpiresAt: "2026-08-30T11:00:00Z",
      now: "2026-08-30T10:30:00Z",
    }),
    /attempt-lease provider is required/i,
  );

  for (const [label, override] of [
    ["replay", { decision: "ALREADY_CONSUMED" }],
    ["concurrent", { decision: "CONFLICT" }],
    ["terminal", { attempt_state: "TERMINAL" }],
    ["cancelled", { attempt_state: "CANCELLED" }],
    ["replaced", { attempt_state: "REPLACED" }],
    ["workspace", { workspace_id: OTHER_WORKSPACE_ID }],
    ["attempt", { attempt_id: OTHER_ATTEMPT_ID }],
    ["packet", { packet_digest: `sha256:${"0".repeat(64)}` }],
    ["authorization", { authorization_id: "CURVE-AUTH-OTHER" }],
    ["lease", { lease_id: "30000000-0000-4000-8000-000000000002" }],
    ["idempotency", { idempotency_key: `sha256:${"1".repeat(64)}` }],
  ]) {
    assert.throws(
      () => acquireCodingAgentImplementationAttemptLease(authorization, {
        acquireTrustedAttemptLease: trustedAttemptLeaseProvider(override),
        leaseId: LEASE_ID,
        leaseExpiresAt: "2026-08-30T11:00:00Z",
        now: "2026-08-30T10:30:00Z",
      }),
      /current nonterminal|does not bind/i,
      label,
    );
  }

  const consumed = new Set();
  const provider = (candidate) => {
    if (consumed.has(candidate.idempotency_key)) {
      return trustedAttemptLeaseProvider({ decision: "ALREADY_CONSUMED" })(candidate);
    }
    consumed.add(candidate.idempotency_key);
    return trustedAttemptLeaseProvider()(candidate);
  };
  assert.equal(
    acquireCodingAgentImplementationAttemptLease(authorization, {
      acquireTrustedAttemptLease: provider,
      leaseId: LEASE_ID,
      leaseExpiresAt: "2026-08-30T11:00:00Z",
      now: "2026-08-30T10:30:00Z",
    }).leaseId,
    LEASE_ID,
  );
  assert.throws(
    () => acquireCodingAgentImplementationAttemptLease(authorization, {
      acquireTrustedAttemptLease: provider,
      leaseId: LEASE_ID,
      leaseExpiresAt: "2026-08-30T11:00:00Z",
      now: "2026-08-30T10:30:00Z",
    }),
    /current nonterminal/i,
  );
});

test("trusted-controller workflow action requires and returns exact controller bindings", () => {
  const packet = basePacket();
  packet.external_effects = {
    ...packet.external_effects,
    mode: "TRUSTED_CONTROLLER_ONLY",
    effects: [{ effect_id: "DRAFT_PR", description: "Create one draft PR." }],
    controller_contracts: [{
      contract_id: "TRUSTED-VCS-CONTROLLER",
      status: "APPROVED",
      evidence: { content_digest: `sha256:${"4".repeat(64)}` },
    }],
  };
  const authorization = activeAuthorization(packet);
  authorization.approval_subject.permitted_agent_workflow_actions.push(
    "REQUEST_TRUSTED_CONTROLLER_EFFECTS",
  );
  resealApproval(authorization);
  const options = grantOptions(authorization);
  options.validatePreflight = () => preflight(packet);
  const result = authorizeForTest(packet, authorization, options);
  assert.deepEqual(result.authorization.external_effects_binding, {
    mode: "TRUSTED_CONTROLLER_ONLY",
    effects_digest: computeCodingAgentAuthorizedEffectsDigest(
      authorization.approval_subject.external_effects.effects,
    ),
    controller_contracts_digest: computeCodingAgentAuthorizedControllerContractsDigest(
      authorization.approval_subject.external_effects.controller_contracts,
    ),
  });

  for (const mutate of [
    (candidate) => { candidate.approval_subject.external_effects.status = "PROPOSED"; },
    (candidate) => { candidate.approval_subject.external_effects.mode = "NONE"; },
    (candidate) => { candidate.approval_subject.external_effects.effects = []; },
    (candidate) => { candidate.approval_subject.external_effects.controller_contracts = []; },
  ]) {
    const invalid = clone(authorization);
    mutate(invalid);
    resealApproval(invalid);
    assert.throws(
      () => validateCodingAgentImplementationAuthorizationSemantics(invalid),
      /REQUEST_TRUSTED_CONTROLLER_EFFECTS/i,
    );
  }
});

test("authorization registry enforces version lineage, latest selection, and active tuple uniqueness", () => {
  const active = activeAuthorization();
  const revoked = revokedAuthorization(active);
  const result = validateCodingAgentImplementationAuthorizationSetSemantics([active, revoked]);
  assert.equal(result.authorizationIdentityCount, 1);
  assert.equal(
    selectRegisteredCodingAgentImplementationAuthorization(
      [active, revoked],
      active.authorization_id,
      2,
    ).lifecycle_state,
    "REVOKED",
  );
  assert.throws(
    () => selectRegisteredCodingAgentImplementationAuthorization(
      [active, revoked],
      active.authorization_id,
      1,
    ),
    /superseded/i,
  );

  const duplicateTuple = activeAuthorization();
  duplicateTuple.authorization_id = "CURVE-AUTH-M1-01B-ATTEMPT-1-OTHER";
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSetSemantics([active, duplicateTuple]),
    /ACTIVE workspace\/packet\/attempt/i,
  );

  const gap = revokedAuthorization(active);
  gap.authorization_version = 3;
  gap.revocation_subject.authorization_version = 3;
  gap.revocation_subject_digest = computeCodingAgentImplementationRevocationSubjectDigest(
    gap.revocation_subject,
  );
  gap.revocation_attestation.subject_digest = gap.revocation_subject_digest;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSetSemantics([active, gap]),
    /immediately follow|contiguous/i,
  );

  const wrongPrior = revokedAuthorization(active);
  wrongPrior.replaces_authorization_version = 9;
  wrongPrior.revocation_subject.replaces_authorization_version = 9;
  wrongPrior.revocation_subject_digest = computeCodingAgentImplementationRevocationSubjectDigest(
    wrongPrior.revocation_subject,
  );
  wrongPrior.revocation_attestation.subject_digest = wrongPrior.revocation_subject_digest;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSetSemantics([active, wrongPrior]),
    /immediately follow|prior ACTIVE|reference/i,
  );

  for (const [label, mutate] of [
    ["approval subject", (candidate) => {
      candidate.approval_subject.valid_from = "2026-08-30T10:01:00Z";
      resealApproval(candidate);
      candidate.revocation_subject.approval_subject_digest = candidate.approval_subject_digest;
      candidate.revocation_subject_digest =
        computeCodingAgentImplementationRevocationSubjectDigest(candidate.revocation_subject);
      candidate.revocation_attestation.subject_digest = candidate.revocation_subject_digest;
    }],
    ["approval attestation", (candidate) => {
      candidate.attestations[0].actor_name = "Substituted Approver";
    }],
  ]) {
    const substituted = revokedAuthorization(active);
    mutate(substituted);
    assert.throws(
      () => validateCodingAgentImplementationAuthorizationSetSemantics([active, substituted]),
      /preserve issuance field|preserve the approved subject/i,
      label,
    );
  }
});

test("unregistered IDs and arbitrary authorization paths are rejected", () => {
  const authorization = activeAuthorization();
  assert.throws(
    () => selectRegisteredCodingAgentImplementationAuthorization(
      [authorization],
      "CURVE-AUTH-UNREGISTERED",
      1,
    ),
    /resolved 0 records/i,
  );
  const evidence = authorizationEvidence(authorization);
  evidence.reference.path = "tmp/forged-authorization.json";
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationEvidence(authorization, evidence),
    /outside the canonical registry/i,
  );
});

test("authorization and governance provenance must resolve exact merged regular-blob bytes", () => {
  const authorization = activeAuthorization();
  const unmerged = authorizationEvidence(authorization, {
    isMergedCurveRevision: () => false,
  });
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationEvidence(authorization, unmerged),
    /not merged/i,
  );

  const forgedProvenance = authorizationEvidence(authorization, {
    resolveReference: (reference) =>
      reference.path === AUTHORIZATION_PATH
        ? Buffer.from(`${JSON.stringify(authorization, null, 2)}\n`)
        : Buffer.from("forged governance\n"),
  });
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationEvidence(
      authorization,
      forgedProvenance,
    ),
    /provenance.*digest mismatch/i,
  );

  const forgedAuthorization = authorizationEvidence(authorization);
  forgedAuthorization.resolveReference = (reference) =>
    reference.path === AUTHORIZATION_PATH
      ? Buffer.from("{}\n")
      : GOVERNANCE_BYTES;
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationEvidence(
      authorization,
      forgedAuthorization,
    ),
    /blob digest mismatch/i,
  );
});

function fakeGit({ head = CURVE_REVISION, status = "", config = "" } = {}) {
  return (_repository, args) => {
    const command = args.join(" ");
    if (command === "config --local --null --name-only --list") return config;
    if (command === "rev-parse --show-toplevel") return "/curve\n";
    if (command === "remote get-url origin") return "git@github.com:faocampo/curve.git\n";
    if (command === "rev-parse --verify HEAD^{commit}") return `${head}\n`;
    if (command === "status --porcelain=v1 --untracked-files=all") return status;
    throw new Error(`unexpected git command ${command}`);
  };
}

test("Curve authorization checkout requires clean HEAD at the live origin/main tip", () => {
  assert.throws(
    () => createCodingAgentTrustedGitExecutableRunner("git"),
    /must be absolute/i,
  );
  const observation = (commit = CURVE_REVISION, overrides = {}) => ({
    commit,
    branch: "main",
    remote: "origin",
    observed_at: "2026-08-30T10:29:30Z",
    source: "TRUSTED_TEST_REMOTE_OBSERVATION",
    ...overrides,
  });
  const options = {
    trustedGitRunner: createCodingAgentTrustedGitTestSeam(fakeGit()),
    resolveRepository: (path) => path,
    trustedRemoteTipResolver: createCodingAgentTrustedRemoteTipTestSeam(
      () => observation(),
    ),
    now: "2026-08-30T10:30:00Z",
  };
  assert.equal(
    validateExactCurveOriginMainCheckout(
      "/curve",
      "https://github.com/faocampo/curve",
      options,
    ).head,
    CURVE_REVISION,
  );
  const controllerBinding = {
    controller_id: "curve-vcs-controller",
    contract_digest: `sha256:${"6".repeat(64)}`,
  };
  const controllerResult = validateExactCurveOriginMainCheckout(
    "/curve",
    "https://github.com/faocampo/curve",
    {
      ...options,
      trustedRemoteTipResolver: createCodingAgentTrustedControllerRemoteTipResolver(
        controllerBinding,
        () => observation(CURVE_REVISION, { source: "TRUSTED_CONTROLLER" }),
      ),
    },
  );
  assert.deepEqual(controllerResult.remoteTrust.controllerBinding, controllerBinding);
  assert.throws(
    () => validateExactCurveOriginMainCheckout(
      "/curve",
      "https://github.com/faocampo/curve",
      {
        ...options,
        trustedRemoteTipResolver: createCodingAgentTrustedRemoteTipTestSeam(
          () => observation("3".repeat(40)),
        ),
      },
    ),
    /local, stale, or unmerged/i,
  );
  assert.throws(
    () => validateExactCurveOriginMainCheckout(
      "/curve",
      "https://github.com/faocampo/curve",
      {
        ...options,
        trustedGitRunner: createCodingAgentTrustedGitTestSeam(
          fakeGit({ status: "?? local.json\n" }),
        ),
      },
    ),
    /clean/i,
  );

  for (const overrides of [
    { branch: "preview" },
    { remote: "upstream" },
    { source: "UNTRUSTED" },
    { observed_at: "2026-08-30T10:20:00Z" },
    { observed_at: "2026-08-30T10:31:00Z" },
  ]) {
    assert.throws(
      () => validateExactCurveOriginMainCheckout(
        "/curve",
        "https://github.com/faocampo/curve",
        {
          ...options,
          trustedRemoteTipResolver: createCodingAgentTrustedRemoteTipTestSeam(
            () => observation(CURVE_REVISION, overrides),
          ),
        },
      ),
      /origin and branch|source|stale|future/i,
    );
  }

  assert.throws(
    () => validateExactCurveOriginMainCheckout(
      "/curve",
      "https://github.com/faocampo/curve",
      {
        ...options,
        trustedGitRunner: createCodingAgentTrustedGitTestSeam(
          fakeGit({ config: "core.repositoryformatversion\0url.evil.insteadof\0" }),
        ),
      },
    ),
    /unsafe local Git config/i,
  );

  assert.throws(
    () => validateExactCurveOriginMainCheckout(
      "/curve",
      "https://github.com/faocampo/curve",
      {
        runGit: fakeGit(),
        resolveRemoteTip: () => CURVE_REVISION,
        resolveRepository: (path) => path,
      },
    ),
    /branded trusted Git runner/i,
  );
});

test("preflight cannot self-grant or substitute stale packet/context/attempt values", () => {
  const packet = basePacket();
  const authorization = activeAuthorization(packet);
  const common = {
    expectedAttemptId: ATTEMPT_ID,
    now: "2026-08-30T10:30:00Z",
    authorizationEvidence: authorizationEvidence(authorization),
  };
  assert.throws(
    () => authorizeForTest(packet, authorization, {
      ...common,
      validatePreflight: () => preflight(packet, { implementation_authority_granted: true }),
    }),
    /must grant no implementation authority/i,
  );
  assert.throws(
    () => authorizeForTest(packet, authorization, {
      ...common,
      validatePreflight: () => preflight(packet, { packet_digest: `sha256:${"9".repeat(64)}` }),
    }),
    /preflight packet digest/i,
  );
  assert.throws(
    () => authorizeForTest(packet, authorization, {
      ...common,
      validatePreflight: () => preflight(packet, { context_digest: `sha256:${"8".repeat(64)}` }),
    }),
    /preflight context digest/i,
  );
  assert.throws(
    () => authorizeForTest(packet, authorization, {
      ...common,
      expectedAttemptId: OTHER_ATTEMPT_ID,
      validatePreflight: () => preflight(packet),
    }),
    /attempt/i,
  );
});

test("standalone CLI has no insecure authority or lease-provider default", () => {
  const result = spawnSync(
    process.execPath,
    [
      "scripts/authorize-coding-agent-task-packet.mjs",
      "--packet-id", "CURVE-M1-01B",
      "--authorization-id", "CURVE-AUTH-M1-01B-ATTEMPT-1",
      "--authorization-version", "1",
      "--attempt-id", ATTEMPT_ID,
      "--lease-id", LEASE_ID,
      "--lease-expires-at", "2026-08-30T11:00:00Z",
      "--curve-repo", "/tmp/curve",
      "--target-repo", "/tmp/plane",
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /standalone authorization is blocked.*trusted human-authority verifier.*attempt-lease provider/is,
  );
  assert.doesNotMatch(result.stdout, /implementation_authority_granted.*true/is);
});

test("published fixtures preserve one canonical valid and one invalid envelope", () => {
  const valid = JSON.parse(
    readFileSync(
      "contracts/schemas/examples/coding-agent-implementation-authorization.valid.json",
      "utf8",
    ),
  );
  assert.doesNotThrow(() => validateCodingAgentImplementationAuthorizationSemantics(valid));
  const invalid = JSON.parse(
    readFileSync(
      "contracts/schemas/examples/coding-agent-implementation-authorization.invalid.json",
      "utf8",
    ),
  );
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationSemantics(invalid),
    /properties|version|subject|HUMAN/i,
  );
});

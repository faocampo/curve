import { createHash, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

import {
  canonicalizeCodingAgentJson,
  normalizeCodingAgentRepositoryUrl,
  validateCodingAgentTaskPacketForDispatch,
} from "./coding-agent-task-packet.mjs";

const AUTHORIZATION_SCHEMA_VERSION =
  "curve.coding-agent-implementation-authorization/v1";
const AUTHORIZATION_ID_PATTERN = /^CURVE-AUTH-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u;
const PACKET_ID_PATTERN = /^CURVE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u;
const SHA_PATTERN = /^[0-9a-f]{40}$/u;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const ACTOR_ID_PATTERN = /^[A-Za-z0-9_.@-]+$/u;
const GIT_REF_PATTERN = /^(?!\/|.*(?:\.\.|\/\/|@\{|\\|[~^:?*\[]|\.$|\/$))[A-Za-z0-9._/-]+$/u;
const REGISTRY_PREFIX = `contracts${sep}task-packet-authorizations${sep}`;
const MAXIMUM_REMOTE_OBSERVATION_AGE_MS = 60_000;
const MAXIMUM_CLOCK_SKEW_MS = 5_000;
export const MAXIMUM_HUMAN_AUTHORITY_VERIFICATION_AGE_MS = 15_000;
const TRUSTED_GIT_RUNNERS = new WeakMap();
const TRUSTED_REMOTE_TIP_RESOLVERS = new WeakMap();
const AUTHORIZATION_PREFLIGHT_TEST_CONTROLLERS = new WeakSet();

export const CODING_AGENT_WORKFLOW_ACTIONS = Object.freeze([
  "INSPECT_AUTHORIZED_CONTEXT",
  "EDIT_AUTHORIZED_WORKTREE",
  "RUN_APPROVED_COMMANDS",
  "CREATE_CANDIDATE_TREE",
  "REQUEST_TRUSTED_CONTROLLER_EFFECTS",
  "REPORT_RESULTS",
]);

const WORKFLOW_ACTION_SET = new Set(CODING_AGENT_WORKFLOW_ACTIONS);

const GIT_ENVIRONMENT = Object.freeze({
  HOME: "/nonexistent",
  LANG: "C",
  LC_ALL: "C",
  PATH: "/usr/bin:/bin",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_SYSTEM: "/dev/null",
  GIT_NO_LAZY_FETCH: "1",
  GIT_NO_REPLACE_OBJECTS: "1",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_TERMINAL_PROMPT: "0",
});

function canonicalJsonString(value) {
  return JSON.stringify(canonicalizeCodingAgentJson(value));
}

function sha256(contents) {
  return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
}

function assertObjectWithExactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (canonicalJsonString(actual) !== canonicalJsonString(expected)) {
    throw new Error(`${label} has missing or unsupported properties`);
  }
}

function assertExact(actual, expected, label) {
  if (canonicalJsonString(actual) !== canonicalJsonString(expected)) {
    throw new Error(`${label} does not exactly match the task packet`);
  }
}

function assertNonEmptyString(value, label, maximum = 2048) {
  if (typeof value !== "string" || !/\S/u.test(value) || value.length > maximum) {
    throw new Error(`${label} must be a bounded non-empty string`);
  }
}

function assertPattern(value, pattern, label) {
  if (typeof value !== "string" || !pattern.test(value)) {
    throw new Error(`${label} is invalid`);
  }
}

function assertUnique(values, label) {
  const observed = new Set();
  for (const value of values) {
    if (observed.has(value)) throw new Error(`duplicate ${label} ${value}`);
    observed.add(value);
  }
}

function assertNonEmptyStringList(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  for (const entry of value) assertNonEmptyString(entry, `${label} entry`);
  assertUnique(value, `${label} entry`);
}

function parseInstant(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value)) {
    throw new Error(`${label} must be an RFC 3339 UTC instant`);
  }
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) {
    throw new Error(`${label} must be a valid instant`);
  }
  return milliseconds;
}

function trustedNowMilliseconds(now) {
  if (now instanceof Date) {
    if (!Number.isFinite(now.getTime())) throw new Error("trusted now is invalid");
    return now.getTime();
  }
  if (typeof now === "string") return parseInstant(now, "trusted now");
  if (typeof now === "number" && Number.isFinite(now)) return now;
  throw new Error("trusted now must be a Date, RFC 3339 UTC instant, or epoch milliseconds");
}

function validateHumanIdentity(identity, label) {
  assertObjectWithExactKeys(identity, ["actor_type", "name", "handle"], label);
  if (identity.actor_type !== "HUMAN") throw new Error(`${label} must be HUMAN`);
  assertNonEmptyString(identity.name, `${label}.name`);
  assertPattern(identity.handle, ACTOR_ID_PATTERN, `${label}.handle`);
}

function validateImplementer(identity) {
  assertObjectWithExactKeys(identity, ["actor_type", "identifier"], "implementer");
  if (identity.actor_type !== "AI_CODING_AGENT") {
    throw new Error("implementer must be AI_CODING_AGENT");
  }
  assertNonEmptyString(identity.identifier, "implementer.identifier");
}

function validatePeople(people) {
  assertObjectWithExactKeys(
    people,
    ["owner", "human_reviewer", "implementer"],
    "approval_subject.people",
  );
  validateHumanIdentity(people.owner, "owner");
  validateHumanIdentity(people.human_reviewer, "human_reviewer");
  validateImplementer(people.implementer);
}

function validateGovernanceProvenance(provenance, label) {
  assertObjectWithExactKeys(
    provenance,
    ["kind", "repository", "revision", "path", "content_digest"],
    label,
  );
  if (provenance.kind !== "CURVE_MERGED_GOVERNANCE" || provenance.repository !== "CURVE") {
    throw new Error(`${label} must identify merged Curve governance`);
  }
  assertPattern(provenance.revision, SHA_PATTERN, `${label}.revision`);
  if (
    typeof provenance.path !== "string" ||
    !/^(?:contracts\/governance|docs\/technical)\/(?!.*(?:^|\/)\.\.(?:\/|$))[^\s]+$/u.test(provenance.path)
  ) {
    throw new Error(`${label}.path must identify Curve governance`);
  }
  assertPattern(provenance.content_digest, DIGEST_PATTERN, `${label}.content_digest`);
}

function validateAttestation(attestation, label, subjectDigest, authorityRole) {
  assertObjectWithExactKeys(
    attestation,
    [
      "actor_type",
      "authority_role",
      "actor_id",
      "actor_name",
      "subject_digest",
      "attested_at",
      "authority_receipt",
      "provenance",
    ],
    label,
  );
  if (attestation.actor_type !== "HUMAN") {
    throw new Error(`${label} grant source must be HUMAN`);
  }
  if (attestation.authority_role !== authorityRole) {
    throw new Error(`${label} requires authority_role ${authorityRole}`);
  }
  assertPattern(attestation.actor_id, ACTOR_ID_PATTERN, `${label}.actor_id`);
  assertNonEmptyString(attestation.actor_name, `${label}.actor_name`);
  if (attestation.subject_digest !== subjectDigest) {
    throw new Error(`${label} does not bind approval_subject_digest`);
  }
  assertObjectWithExactKeys(
    attestation.authority_receipt,
    ["kind", "reference", "content_digest", "revalidation_policy"],
    `${label}.authority_receipt`,
  );
  if (attestation.authority_receipt.kind !== "EXTERNAL_TRUSTED_HUMAN_AUTHORITY") {
    throw new Error(`${label}.authority_receipt kind is unsupported`);
  }
  assertNonEmptyString(
    attestation.authority_receipt.reference,
    `${label}.authority_receipt.reference`,
    1024,
  );
  assertPattern(
    attestation.authority_receipt.content_digest,
    DIGEST_PATTERN,
    `${label}.authority_receipt.content_digest`,
  );
  if (
    attestation.authority_receipt.revalidation_policy !==
    "RECHECK_REVOCATION_EACH_DISPATCH"
  ) {
    throw new Error(
      `${label}.authority_receipt must require revocation recheck on every dispatch`,
    );
  }
  validateGovernanceProvenance(attestation.provenance, `${label}.provenance`);
  return parseInstant(attestation.attested_at, `${label}.attested_at`);
}

function validateApprovalSubject(subject) {
  assertObjectWithExactKeys(
    subject,
    [
      "packet",
      "workspace_id",
      "attempt_id",
      "curve",
      "repository",
      "people",
      "scope",
      "budget",
      "external_effects",
      "rollback",
      "permitted_agent_workflow_actions",
      "valid_from",
      "expires_at",
    ],
    "approval_subject",
  );

  assertPattern(subject.workspace_id, UUID_PATTERN, "approval_subject.workspace_id");
  assertPattern(subject.attempt_id, UUID_PATTERN, "approval_subject.attempt_id");

  assertObjectWithExactKeys(
    subject.packet,
    ["packet_id", "packet_version", "packet_digest"],
    "approval_subject.packet",
  );
  assertPattern(subject.packet.packet_id, PACKET_ID_PATTERN, "approval_subject.packet.packet_id");
  if (!Number.isInteger(subject.packet.packet_version) || subject.packet.packet_version < 1) {
    throw new Error("approval_subject.packet.packet_version must be a positive integer");
  }
  assertPattern(subject.packet.packet_digest, DIGEST_PATTERN, "approval_subject.packet.packet_digest");

  assertObjectWithExactKeys(
    subject.curve,
    ["repository", "curve_revision", "context_digest"],
    "approval_subject.curve",
  );
  if (subject.curve.repository !== "https://github.com/faocampo/curve") {
    throw new Error("approval_subject.curve.repository is not canonical");
  }
  assertPattern(subject.curve.curve_revision, SHA_PATTERN, "approval_subject.curve.curve_revision");
  assertPattern(subject.curve.context_digest, DIGEST_PATTERN, "approval_subject.curve.context_digest");

  assertObjectWithExactKeys(
    subject.repository,
    ["url", "target_branch", "feature_branch", "base_sha"],
    "approval_subject.repository",
  );
  assertNonEmptyString(subject.repository.url, "approval_subject.repository.url", 512);
  normalizeCodingAgentRepositoryUrl(subject.repository.url);
  assertPattern(subject.repository.target_branch, GIT_REF_PATTERN, "approval_subject.repository.target_branch");
  assertPattern(subject.repository.feature_branch, GIT_REF_PATTERN, "approval_subject.repository.feature_branch");
  if (subject.repository.target_branch === subject.repository.feature_branch) {
    throw new Error("authorization target and feature branches must differ");
  }
  assertPattern(subject.repository.base_sha, SHA_PATTERN, "approval_subject.repository.base_sha");

  validatePeople(subject.people);
  assertObjectWithExactKeys(subject.scope, ["in_scope", "out_of_scope"], "approval_subject.scope");
  assertNonEmptyStringList(subject.scope.in_scope, "approval_subject.scope.in_scope");
  assertNonEmptyStringList(subject.scope.out_of_scope, "approval_subject.scope.out_of_scope");

  assertObjectWithExactKeys(
    subject.budget,
    ["currency", "maximum_external_spend", "maximum_compute_minutes", "on_exhaustion"],
    "approval_subject.budget",
  );
  if (subject.budget.currency !== "USD") throw new Error("authorization budget currency must be USD");
  if (
    typeof subject.budget.maximum_external_spend !== "number" ||
    !Number.isFinite(subject.budget.maximum_external_spend) ||
    subject.budget.maximum_external_spend < 0
  ) {
    throw new Error("authorization maximum_external_spend must be non-negative");
  }
  if (
    !Number.isInteger(subject.budget.maximum_compute_minutes) ||
    subject.budget.maximum_compute_minutes < 1
  ) {
    throw new Error("authorization maximum_compute_minutes must be a positive integer");
  }
  if (subject.budget.on_exhaustion !== "PAUSE") {
    throw new Error("authorization budget exhaustion must PAUSE");
  }

  if (subject.external_effects === null || typeof subject.external_effects !== "object" || Array.isArray(subject.external_effects)) {
    throw new Error("approval_subject.external_effects must be an object");
  }
  if (subject.rollback === null || typeof subject.rollback !== "object" || Array.isArray(subject.rollback)) {
    throw new Error("approval_subject.rollback must be an object");
  }

  const actions = subject.permitted_agent_workflow_actions;
  if (!Array.isArray(actions) || actions.length === 0) {
    throw new Error("authorization requires permitted_agent_workflow_actions");
  }
  assertUnique(actions, "permitted agent workflow action");
  for (const action of actions) {
    if (!WORKFLOW_ACTION_SET.has(action)) {
      throw new Error(`unsupported permitted agent workflow action ${String(action)}`);
    }
  }
  if (actions.includes("REQUEST_TRUSTED_CONTROLLER_EFFECTS")) {
    if (
      subject.external_effects.status !== "APPROVED" ||
      subject.external_effects.mode !== "TRUSTED_CONTROLLER_ONLY" ||
      !Array.isArray(subject.external_effects.effects) ||
      subject.external_effects.effects.length === 0 ||
      !Array.isArray(subject.external_effects.controller_contracts) ||
      subject.external_effects.controller_contracts.length === 0
    ) {
      throw new Error(
        "REQUEST_TRUSTED_CONTROLLER_EFFECTS requires APPROVED TRUSTED_CONTROLLER_ONLY policy with effects and controller contracts",
      );
    }
  }

  const validFrom = parseInstant(subject.valid_from, "approval_subject.valid_from");
  const expiresAt = parseInstant(subject.expires_at, "approval_subject.expires_at");
  if (validFrom >= expiresAt) {
    throw new Error("authorization valid_from must precede expires_at");
  }
  return { validFrom, expiresAt };
}

export function computeCodingAgentImplementationApprovalSubjectDigest(subject) {
  return sha256(Buffer.from(canonicalJsonString(subject)));
}

export function computeCodingAgentImplementationRevocationSubjectDigest(subject) {
  return sha256(Buffer.from(canonicalJsonString(subject)));
}

export function computeCodingAgentAuthorizationEvidenceDigest(contents) {
  return sha256(contents);
}

export function computeCodingAgentAuthorizedEffectsDigest(effects) {
  return sha256(Buffer.from(canonicalJsonString(effects)));
}

export function computeCodingAgentAuthorizedControllerContractsDigest(contracts) {
  return sha256(Buffer.from(canonicalJsonString(contracts)));
}

export function projectCodingAgentImplementationApprovalSubject(
  packet,
  { attemptId, permittedAgentWorkflowActions, validFrom, expiresAt },
) {
  return {
    workspace_id: packet.workspace_id,
    attempt_id: attemptId,
    packet: {
      packet_id: packet.packet_id,
      packet_version: packet.packet_version,
      packet_digest: packet.packet_digest,
    },
    curve: {
      repository: packet.curve_binding.repository,
      curve_revision: packet.curve_binding.curve_revision,
      context_digest: packet.curve_binding.context_pack.context_digest,
    },
    repository: {
      url: packet.repository.url,
      target_branch: packet.repository.target_branch,
      feature_branch: packet.repository.feature_branch,
      base_sha: packet.repository.base_sha,
    },
    people: structuredClone(packet.people),
    scope: structuredClone(packet.scope),
    budget: {
      currency: packet.budget.currency,
      maximum_external_spend: packet.budget.maximum_external_spend,
      maximum_compute_minutes: packet.budget.maximum_compute_minutes,
      on_exhaustion: packet.budget.on_exhaustion,
    },
    external_effects: structuredClone(packet.external_effects),
    rollback: structuredClone(packet.rollback),
    permitted_agent_workflow_actions: structuredClone(permittedAgentWorkflowActions),
    valid_from: validFrom,
    expires_at: expiresAt,
  };
}

export function validateCodingAgentImplementationAuthorizationSemantics(authorization) {
  assertObjectWithExactKeys(
    authorization,
    [
      "schema_version",
      "authorization_id",
      "authorization_version",
      "workspace_id",
      "replaces_authorization_version",
      "lifecycle_state",
      "approval_subject",
      "approval_subject_digest",
      "attestations",
      "revoked_at",
      "revocation_reason",
      "revocation_subject",
      "revocation_subject_digest",
      "revocation_attestation",
    ],
    "implementation authorization",
  );
  if (authorization.schema_version !== AUTHORIZATION_SCHEMA_VERSION) {
    throw new Error("unsupported implementation authorization schema_version");
  }
  assertPattern(authorization.authorization_id, AUTHORIZATION_ID_PATTERN, "authorization_id");
  if (!Number.isInteger(authorization.authorization_version) || authorization.authorization_version < 1) {
    throw new Error("authorization_version must be a positive integer");
  }
  assertPattern(authorization.workspace_id, UUID_PATTERN, "authorization workspace_id");
  if (authorization.workspace_id !== authorization.approval_subject?.workspace_id) {
    throw new Error("authorization envelope workspace_id must equal approval_subject.workspace_id");
  }
  if (!["ACTIVE", "REVOKED"].includes(authorization.lifecycle_state)) {
    throw new Error("authorization lifecycle_state must be ACTIVE or REVOKED");
  }

  const { validFrom, expiresAt } = validateApprovalSubject(authorization.approval_subject);
  const expectedDigest = computeCodingAgentImplementationApprovalSubjectDigest(
    authorization.approval_subject,
  );
  if (authorization.approval_subject_digest !== expectedDigest) {
    throw new Error(`approval_subject_digest is not canonical: expected ${expectedDigest}`);
  }
  if (!Array.isArray(authorization.attestations) || authorization.attestations.length === 0) {
    throw new Error("implementation authorization requires at least one HUMAN attestation");
  }
  assertUnique(
    authorization.attestations.map((attestation) => `${attestation.actor_type}:${attestation.actor_id}`),
    "authorization attestation actor",
  );
  for (const [index, attestation] of authorization.attestations.entries()) {
    const attestedAt = validateAttestation(
      attestation,
      `attestations[${index}]`,
      expectedDigest,
      "IMPLEMENTATION_APPROVER",
    );
    if (attestedAt > validFrom) {
      throw new Error(`attestations[${index}] must be at or before valid_from`);
    }
  }

  if (authorization.lifecycle_state === "ACTIVE") {
    if (
      authorization.replaces_authorization_version !== null ||
      authorization.revoked_at !== null ||
      authorization.revocation_reason !== null ||
      authorization.revocation_subject !== null ||
      authorization.revocation_subject_digest !== null ||
      authorization.revocation_attestation !== null
    ) {
      throw new Error("ACTIVE authorization cannot contain revocation state");
    }
  } else {
    const revokedAt = parseInstant(authorization.revoked_at, "revoked_at");
    if (
      !Number.isInteger(authorization.replaces_authorization_version) ||
      authorization.replaces_authorization_version < 1
    ) {
      throw new Error("REVOKED authorization must replace a prior authorization version");
    }
    assertNonEmptyString(authorization.revocation_reason, "revocation_reason");
    assertObjectWithExactKeys(
      authorization.revocation_subject,
      [
        "authorization_id",
        "authorization_version",
        "replaces_authorization_version",
        "approval_subject_digest",
        "revoked_at",
        "revocation_reason",
      ],
      "revocation_subject",
    );
    const expectedRevocationSubject = {
      authorization_id: authorization.authorization_id,
      authorization_version: authorization.authorization_version,
      replaces_authorization_version: authorization.replaces_authorization_version,
      approval_subject_digest: expectedDigest,
      revoked_at: authorization.revoked_at,
      revocation_reason: authorization.revocation_reason,
    };
    if (
      canonicalJsonString(authorization.revocation_subject) !==
      canonicalJsonString(expectedRevocationSubject)
    ) {
      throw new Error("revocation_subject does not exactly bind the authorization revocation");
    }
    const expectedRevocationDigest =
      computeCodingAgentImplementationRevocationSubjectDigest(expectedRevocationSubject);
    if (authorization.revocation_subject_digest !== expectedRevocationDigest) {
      throw new Error("revocation_subject_digest is not canonical");
    }
    const attestedAt = validateAttestation(
      authorization.revocation_attestation,
      "revocation_attestation",
      expectedRevocationDigest,
      "IMPLEMENTATION_REVOKER",
    );
    if (attestedAt !== revokedAt) {
      throw new Error("revocation attestation time must equal revoked_at");
    }
    const latestApprovalAttestation = Math.max(
      ...authorization.attestations.map((attestation) =>
        parseInstant(attestation.attested_at, "approval attestation time")),
    );
    if (revokedAt < latestApprovalAttestation) {
      throw new Error("revoked_at cannot precede the approval attestation");
    }
    if (authorization.authorization_version !== authorization.replaces_authorization_version + 1) {
      throw new Error("REVOKED authorization version must immediately follow the replaced version");
    }
  }
  return {
    authorizationId: authorization.authorization_id,
    authorizationVersion: authorization.authorization_version,
    lifecycleState: authorization.lifecycle_state,
    approvalSubjectDigest: expectedDigest,
    validFrom,
    expiresAt,
  };
}

export function validateCodingAgentImplementationAuthorizationAgainstPacket(
  packet,
  authorization,
  { now = new Date(), expectedAttemptId } = {},
) {
  const semantics = validateCodingAgentImplementationAuthorizationSemantics(authorization);
  if (packet?.status !== "READY") {
    throw new Error("implementation authorization requires a READY task packet");
  }
  assertPattern(packet.workspace_id, UUID_PATTERN, "task packet workspace_id");
  assertPattern(expectedAttemptId, UUID_PATTERN, "expected attempt_id");
  const subject = authorization.approval_subject;
  const expected = projectCodingAgentImplementationApprovalSubject(packet, {
    attemptId: expectedAttemptId,
    permittedAgentWorkflowActions: subject.permitted_agent_workflow_actions,
    validFrom: subject.valid_from,
    expiresAt: subject.expires_at,
  });
  if (authorization.workspace_id !== packet.workspace_id) {
    throw new Error("authorization workspace_id does not match the task packet");
  }
  for (const field of [
    "workspace_id",
    "attempt_id",
    "packet",
    "curve",
    "repository",
    "people",
    "scope",
    "budget",
    "external_effects",
    "rollback",
  ]) {
    assertExact(subject[field], expected[field], `authorization ${field}`);
  }

  const nowMilliseconds = trustedNowMilliseconds(now);
  if (authorization.lifecycle_state !== "ACTIVE") {
    throw new Error("implementation authorization is REVOKED");
  }
  if (authorization.revoked_at !== null) {
    throw new Error("implementation authorization carries revocation state");
  }
  if (nowMilliseconds < semantics.validFrom) {
    throw new Error("implementation authorization is not active yet");
  }
  if (nowMilliseconds >= semantics.expiresAt) {
    throw new Error("implementation authorization is expired");
  }
  for (const attestation of authorization.attestations) {
    if (parseInstant(attestation.attested_at, "attestation.attested_at") > nowMilliseconds) {
      throw new Error("implementation authorization contains a future human attestation");
    }
  }
  return semantics;
}

function normalizedAuthorizationRegistryPath(path) {
  const normalized = path.replaceAll("/", sep);
  if (
    normalized.startsWith(REGISTRY_PREFIX) &&
    normalized.endsWith(".json") &&
    !normalized.split(sep).includes("..")
  ) {
    return normalized;
  }
  throw new Error("authorization evidence is outside the canonical registry");
}

export function validateCodingAgentImplementationAuthorizationEvidence(
  authorization,
  {
    reference,
    resolveReference,
    selectedCurveRevision,
    isMergedCurveRevision,
  } = {},
) {
  assertObjectWithExactKeys(
    reference,
    ["repository", "path", "revision", "content_digest"],
    "authorization evidence reference",
  );
  if (reference.repository !== "CURVE") {
    throw new Error("authorization evidence must be stored in CURVE");
  }
  normalizedAuthorizationRegistryPath(reference.path);
  assertPattern(reference.revision, SHA_PATTERN, "authorization evidence revision");
  if (reference.revision !== selectedCurveRevision) {
    throw new Error("authorization evidence is not from the selected merged Curve revision");
  }
  assertPattern(reference.content_digest, DIGEST_PATTERN, "authorization evidence content_digest");
  if (typeof resolveReference !== "function") {
    throw new Error("exact regular-blob authorization evidence resolver is required");
  }
  const contents = resolveReference(reference);
  if (!Buffer.isBuffer(contents) && !(contents instanceof Uint8Array)) {
    throw new Error("authorization evidence resolver must return exact blob bytes");
  }
  const actualDigest = computeCodingAgentAuthorizationEvidenceDigest(contents);
  if (actualDigest !== reference.content_digest) {
    throw new Error("authorization evidence blob digest mismatch");
  }
  let resolvedAuthorization;
  try {
    resolvedAuthorization = JSON.parse(Buffer.from(contents).toString("utf8"));
  } catch {
    throw new Error("authorization evidence blob is not valid JSON");
  }
  assertExact(
    resolvedAuthorization,
    authorization,
    "authorization evidence blob",
  );
  validateCodingAgentImplementationAuthorizationSemantics(resolvedAuthorization);
  if (typeof isMergedCurveRevision !== "function") {
    throw new Error("merged Curve governance provenance validator is required");
  }
  const provenanceRecords = [
    ...authorization.attestations.map((attestation) => attestation.provenance),
    ...(authorization.revocation_attestation
      ? [authorization.revocation_attestation.provenance]
      : []),
  ];
  const provenanceEvidence = provenanceRecords.map((provenance, index) => {
    if (!isMergedCurveRevision(provenance.revision, selectedCurveRevision)) {
      throw new Error(
        `authorization governance provenance ${index} is not merged into selected Curve origin/main`,
      );
    }
    const provenanceReference = {
      repository: provenance.repository,
      path: provenance.path,
      revision: provenance.revision,
      content_digest: provenance.content_digest,
    };
    const provenanceContents = resolveReference(provenanceReference);
    if (!Buffer.isBuffer(provenanceContents) && !(provenanceContents instanceof Uint8Array)) {
      throw new Error(`authorization governance provenance ${index} did not resolve exact blob bytes`);
    }
    const provenanceDigest = computeCodingAgentAuthorizationEvidenceDigest(provenanceContents);
    if (provenanceDigest !== provenance.content_digest) {
      throw new Error(`authorization governance provenance ${index} blob digest mismatch`);
    }
    return {
      revision: provenance.revision,
      path: provenance.path,
      contentDigest: provenanceDigest,
    };
  });
  return {
    revision: reference.revision,
    path: reference.path,
    contentDigest: actualDigest,
    provenanceEvidence,
  };
}

export function discoverCodingAgentImplementationAuthorizationFiles(directory) {
  const discovered = [];
  if (!existsSync(directory)) return discovered;
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith(".json")) discovered.push(path);
    }
  }
  walk(directory);
  return discovered.sort((left, right) => left.localeCompare(right));
}

export function validateCodingAgentImplementationAuthorizationSetSemantics(authorizations) {
  if (!Array.isArray(authorizations)) throw new Error("authorization registry must be an array");
  for (const authorization of authorizations) {
    validateCodingAgentImplementationAuthorizationSemantics(authorization);
  }
  assertUnique(
    authorizations.map(
      (authorization) =>
        `${authorization.authorization_id}:v${authorization.authorization_version}`,
    ),
    "authorization ID/version",
  );
  const groups = new Map();
  for (const authorization of authorizations) {
    const versions = groups.get(authorization.authorization_id) ?? [];
    versions.push(authorization);
    groups.set(authorization.authorization_id, versions);
  }
  const effective = [];
  for (const [authorizationId, versions] of groups) {
    versions.sort((left, right) => left.authorization_version - right.authorization_version);
    for (const [index, authorization] of versions.entries()) {
      const expectedVersion = index + 1;
      if (authorization.authorization_version !== expectedVersion) {
        throw new Error(
          `authorization ${authorizationId} versions must be contiguous from 1`,
        );
      }
      if (authorization.lifecycle_state === "ACTIVE" && index !== 0) {
        throw new Error(
          `authorization ${authorizationId} may not reactivate under an existing ID`,
        );
      }
      if (authorization.lifecycle_state === "REVOKED") {
        const prior = versions[index - 1];
        if (!prior || prior.lifecycle_state !== "ACTIVE") {
          throw new Error(
            `REVOKED authorization ${authorizationId} must replace the prior ACTIVE version`,
          );
        }
        if (authorization.replaces_authorization_version !== prior.authorization_version) {
          throw new Error(
            `REVOKED authorization ${authorizationId} does not reference its prior ACTIVE version`,
          );
        }
        if (authorization.approval_subject_digest !== prior.approval_subject_digest) {
          throw new Error(
            `REVOKED authorization ${authorizationId} must preserve the approved subject`,
          );
        }
        for (const field of ["workspace_id", "approval_subject", "attestations"]) {
          if (canonicalJsonString(authorization[field]) !== canonicalJsonString(prior[field])) {
            throw new Error(
              `REVOKED authorization ${authorizationId} must preserve issuance field ${field} exactly`,
            );
          }
        }
        if (index !== versions.length - 1) {
          throw new Error(`REVOKED authorization ${authorizationId} must be its latest version`);
        }
      }
    }
    effective.push(versions.at(-1));
  }
  const activeTupleKeys = effective
    .filter((authorization) => authorization.lifecycle_state === "ACTIVE")
    .map(
      (authorization) =>
        `${authorization.workspace_id}:${authorization.approval_subject.packet.packet_id}:${authorization.approval_subject.attempt_id}`,
    );
  assertUnique(activeTupleKeys, "ACTIVE workspace/packet/attempt authorization");
  return {
    authorizationCount: authorizations.length,
    authorizationIdentityCount: groups.size,
    effective,
  };
}

export function selectRegisteredCodingAgentImplementationAuthorization(
  authorizations,
  authorizationId,
  authorizationVersion,
) {
  assertPattern(authorizationId, AUTHORIZATION_ID_PATTERN, "requested authorization ID");
  if (!Number.isInteger(authorizationVersion) || authorizationVersion < 1) {
    throw new Error("requested authorization version must be a positive integer");
  }
  validateCodingAgentImplementationAuthorizationSetSemantics(authorizations);
  const matches = authorizations.filter(
    (authorization) =>
      authorization.authorization_id === authorizationId &&
      authorization.authorization_version === authorizationVersion,
  );
  if (matches.length !== 1) {
    throw new Error(
      `authorization ${authorizationId} v${authorizationVersion} resolved ${matches.length} records in the canonical registry`,
    );
  }
  const latestVersion = Math.max(
    ...authorizations
      .filter((authorization) => authorization.authorization_id === authorizationId)
      .map((authorization) => authorization.authorization_version),
  );
  if (authorizationVersion !== latestVersion) {
    throw new Error(
      `authorization ${authorizationId} v${authorizationVersion} is superseded by v${latestVersion}`,
    );
  }
  return matches[0];
}

function computeTrustedAuthorityRequestDigest(request) {
  const projection = structuredClone(request);
  delete projection.request_digest;
  return sha256(Buffer.from(canonicalJsonString(projection)));
}

function buildTrustedHumanAuthorityRequest(authorization, attestation, action, now) {
  const requestedAt = new Date(trustedNowMilliseconds(now)).toISOString();
  const request = {
    schema_version: "curve.trusted-human-authority-verification-request/v1",
    action,
    workspace_id: authorization.workspace_id,
    actor_type: attestation.actor_type,
    actor_id: attestation.actor_id,
    actor_name: attestation.actor_name,
    authority_role: attestation.authority_role,
    subject_digest: attestation.subject_digest,
    issued_at: attestation.attested_at,
    authority_receipt: structuredClone(attestation.authority_receipt),
    request_nonce: randomBytes(32).toString("hex"),
    requested_at: requestedAt,
    request_digest: null,
  };
  request.request_digest = computeTrustedAuthorityRequestDigest(request);
  return request;
}

function validateTrustedHumanAuthorityResult(request, result, now) {
  assertObjectWithExactKeys(
    result,
    [
      "schema_version",
      "decision",
      "action",
      "workspace_id",
      "actor_type",
      "actor_id",
      "actor_name",
      "authority_role",
      "subject_digest",
      "issued_at",
      "authority_receipt",
      "request_nonce",
      "requested_at",
      "request_digest",
      "verified_at",
      "receipt_revocation_check",
      "verification_receipt",
    ],
    "trusted human-authority verification result",
  );
  if (
    result.schema_version !== "curve.trusted-human-authority-verification-result/v1" ||
    result.decision !== "VERIFIED"
  ) {
    throw new Error("trusted human-authority verifier did not return VERIFIED");
  }
  for (const field of [
    "action",
    "workspace_id",
    "actor_type",
    "actor_id",
    "actor_name",
    "authority_role",
    "subject_digest",
    "issued_at",
    "authority_receipt",
    "request_nonce",
    "requested_at",
    "request_digest",
  ]) {
    if (canonicalJsonString(result[field]) !== canonicalJsonString(request[field])) {
      throw new Error(`trusted human-authority result does not bind ${field}`);
    }
  }
  assertPattern(
    result.request_nonce,
    /^[0-9a-f]{64}$/u,
    "trusted human-authority request nonce",
  );
  const requestedAt = parseInstant(
    result.requested_at,
    "human-authority requested_at",
  );
  const verifiedAt = parseInstant(result.verified_at, "human-authority verified_at");
  const nowMilliseconds = trustedNowMilliseconds(now);
  if (requestedAt > nowMilliseconds + MAXIMUM_CLOCK_SKEW_MS) {
    throw new Error("trusted human-authority request is from the future");
  }
  if (nowMilliseconds - requestedAt > MAXIMUM_HUMAN_AUTHORITY_VERIFICATION_AGE_MS) {
    throw new Error("trusted human-authority request is stale");
  }
  if (verifiedAt > nowMilliseconds + MAXIMUM_CLOCK_SKEW_MS) {
    throw new Error("trusted human-authority verification is from the future");
  }
  if (nowMilliseconds - verifiedAt > MAXIMUM_HUMAN_AUTHORITY_VERIFICATION_AGE_MS) {
    throw new Error("trusted human-authority verification is stale");
  }
  if (verifiedAt < requestedAt - MAXIMUM_CLOCK_SKEW_MS) {
    throw new Error("trusted human-authority verification predates its request");
  }
  assertObjectWithExactKeys(
    result.receipt_revocation_check,
    [
      "status",
      "checked_at",
      "authority_receipt_reference",
      "authority_receipt_content_digest",
      "request_nonce",
      "request_digest",
    ],
    "human-authority receipt revocation check",
  );
  if (result.receipt_revocation_check.status !== "NOT_REVOKED") {
    throw new Error("trusted human-authority receipt is revoked or its status is unknown");
  }
  if (
    result.receipt_revocation_check.authority_receipt_reference !==
    request.authority_receipt.reference
  ) {
    throw new Error("human-authority receipt revocation check does not bind receipt reference");
  }
  if (
    result.receipt_revocation_check.authority_receipt_content_digest !==
    request.authority_receipt.content_digest
  ) {
    throw new Error("human-authority receipt revocation check does not bind receipt digest");
  }
  if (result.receipt_revocation_check.request_nonce !== request.request_nonce) {
    throw new Error("human-authority receipt revocation check does not bind request nonce");
  }
  if (result.receipt_revocation_check.request_digest !== request.request_digest) {
    throw new Error("human-authority receipt revocation check does not bind request digest");
  }
  const revocationCheckedAt = parseInstant(
    result.receipt_revocation_check.checked_at,
    "human-authority receipt revocation checked_at",
  );
  if (revocationCheckedAt > nowMilliseconds + MAXIMUM_CLOCK_SKEW_MS) {
    throw new Error("trusted human-authority receipt revocation check is from the future");
  }
  if (
    nowMilliseconds - revocationCheckedAt >
    MAXIMUM_HUMAN_AUTHORITY_VERIFICATION_AGE_MS
  ) {
    throw new Error("trusted human-authority receipt revocation check is stale");
  }
  if (revocationCheckedAt < requestedAt - MAXIMUM_CLOCK_SKEW_MS) {
    throw new Error("trusted human-authority receipt revocation check predates its request");
  }
  assertObjectWithExactKeys(
    result.verification_receipt,
    ["reference", "content_digest", "request_nonce", "request_digest"],
    "human-authority verification receipt",
  );
  assertNonEmptyString(
    result.verification_receipt.reference,
    "human-authority verification receipt reference",
    1024,
  );
  assertPattern(
    result.verification_receipt.content_digest,
    DIGEST_PATTERN,
    "human-authority verification receipt digest",
  );
  if (result.verification_receipt.request_nonce !== request.request_nonce) {
    throw new Error("human-authority verification receipt does not bind request nonce");
  }
  if (result.verification_receipt.request_digest !== request.request_digest) {
    throw new Error("human-authority verification receipt does not bind request digest");
  }
  return {
    action: result.action,
    actorId: result.actor_id,
    authorityRole: result.authority_role,
    subjectDigest: result.subject_digest,
    requestNonce: result.request_nonce,
    requestedAt: result.requested_at,
    requestDigest: result.request_digest,
    verifiedAt: result.verified_at,
    receiptRevocationCheck: structuredClone(result.receipt_revocation_check),
    verificationReceipt: structuredClone(result.verification_receipt),
  };
}

export function verifyCodingAgentImplementationHumanAuthority(
  authorization,
  { verifyTrustedHumanAuthority, now } = {},
) {
  if (typeof verifyTrustedHumanAuthority !== "function") {
    throw new Error(
      "a configured trusted human-authority verifier is required; merged governance bytes cannot grant implementation authority",
    );
  }
  const verificationInputs = authorization.attestations.map((attestation) => ({
    attestation,
    action: "AUTHORIZE_IMPLEMENTATION",
  }));
  if (authorization.revocation_attestation !== null) {
    verificationInputs.push({
      attestation: authorization.revocation_attestation,
      action: "REVOKE_IMPLEMENTATION",
    });
  }
  return verificationInputs.map(({ attestation, action }, index) => {
    const requestNow = now ?? new Date();
    const request = buildTrustedHumanAuthorityRequest(
      authorization,
      attestation,
      action,
      requestNow,
    );
    const result = verifyTrustedHumanAuthority(structuredClone(request));
    if (result && typeof result.then === "function") {
      throw new Error("trusted human-authority verifier must complete atomically before dispatch");
    }
    try {
      return validateTrustedHumanAuthorityResult(request, result, now ?? new Date());
    } catch (error) {
      throw new Error(`trusted human-authority verification ${index} failed: ${error.message}`);
    }
  });
}

function computeAttemptLeaseIdempotencyKey(request) {
  const projection = structuredClone(request);
  delete projection.idempotency_key;
  return sha256(Buffer.from(canonicalJsonString(projection)));
}

export function buildCodingAgentAttemptLeaseRequest(
  authorization,
  { leaseId, leaseExpiresAt },
) {
  assertPattern(leaseId, UUID_PATTERN, "attempt lease_id");
  parseInstant(leaseExpiresAt, "attempt lease expires_at");
  const request = {
    schema_version: "curve.trusted-attempt-lease-request/v1",
    workspace_id: authorization.workspace_id,
    attempt_id: authorization.approval_subject.attempt_id,
    packet_digest: authorization.approval_subject.packet.packet_digest,
    authorization_id: authorization.authorization_id,
    authorization_version: authorization.authorization_version,
    approval_subject_digest: authorization.approval_subject_digest,
    lease_id: leaseId,
    lease_expires_at: leaseExpiresAt,
    idempotency_key: null,
  };
  request.idempotency_key = computeAttemptLeaseIdempotencyKey(request);
  return request;
}

function validateTrustedAttemptLeaseResult(request, result, now) {
  assertObjectWithExactKeys(
    result,
    [
      "schema_version",
      "decision",
      "workspace_id",
      "attempt_id",
      "attempt_state",
      "packet_digest",
      "authorization_id",
      "authorization_version",
      "approval_subject_digest",
      "lease_id",
      "lease_expires_at",
      "idempotency_key",
      "acquired_at",
      "lease_receipt",
    ],
    "trusted attempt-lease result",
  );
  if (
    result.schema_version !== "curve.trusted-attempt-lease-result/v1" ||
    result.decision !== "ACQUIRED" ||
    result.attempt_state !== "CURRENT_NONTERMINAL"
  ) {
    throw new Error(
      "trusted attempt-lease provider did not atomically acquire the current nonterminal attempt",
    );
  }
  for (const field of [
    "workspace_id",
    "attempt_id",
    "packet_digest",
    "authorization_id",
    "authorization_version",
    "approval_subject_digest",
    "lease_id",
    "lease_expires_at",
    "idempotency_key",
  ]) {
    if (canonicalJsonString(result[field]) !== canonicalJsonString(request[field])) {
      throw new Error(`trusted attempt-lease result does not bind ${field}`);
    }
  }
  const acquiredAt = parseInstant(result.acquired_at, "attempt lease acquired_at");
  const nowMilliseconds = trustedNowMilliseconds(now);
  if (
    acquiredAt > nowMilliseconds + MAXIMUM_CLOCK_SKEW_MS ||
    acquiredAt < nowMilliseconds - MAXIMUM_REMOTE_OBSERVATION_AGE_MS
  ) {
    throw new Error("trusted attempt-lease acquisition time is stale or from the future");
  }
  const expiresAt = parseInstant(result.lease_expires_at, "attempt lease expires_at");
  if (expiresAt <= nowMilliseconds) {
    throw new Error("trusted attempt lease is already expired");
  }
  assertObjectWithExactKeys(
    result.lease_receipt,
    ["kind", "reference", "content_digest"],
    "attempt lease receipt",
  );
  if (result.lease_receipt.kind !== "DURABLE_SINGLE_CONSUMPTION_ATTEMPT_LEASE") {
    throw new Error("attempt lease receipt kind is unsupported");
  }
  assertNonEmptyString(result.lease_receipt.reference, "attempt lease receipt reference", 1024);
  assertPattern(
    result.lease_receipt.content_digest,
    DIGEST_PATTERN,
    "attempt lease receipt digest",
  );
  return {
    leaseId: result.lease_id,
    expiresAt: result.lease_expires_at,
    idempotencyKey: result.idempotency_key,
    acquiredAt: result.acquired_at,
    receipt: structuredClone(result.lease_receipt),
  };
}

export function acquireCodingAgentImplementationAttemptLease(
  authorization,
  {
    acquireTrustedAttemptLease,
    leaseId,
    leaseExpiresAt,
    now,
  } = {},
) {
  if (typeof acquireTrustedAttemptLease !== "function") {
    throw new Error(
      "a configured trusted durable single-consumption attempt-lease provider is required",
    );
  }
  const request = buildCodingAgentAttemptLeaseRequest(authorization, {
    leaseId,
    leaseExpiresAt,
  });
  const requestNow = now ?? new Date();
  const nowMilliseconds = trustedNowMilliseconds(requestNow);
  const authorizationExpiry = parseInstant(
    authorization.approval_subject.expires_at,
    "authorization expires_at",
  );
  const leaseExpiry = parseInstant(request.lease_expires_at, "attempt lease expires_at");
  if (leaseExpiry > authorizationExpiry || leaseExpiry <= nowMilliseconds) {
    throw new Error("attempt lease expiry must be after now and at or before authorization expiry");
  }
  const result = acquireTrustedAttemptLease(structuredClone(request));
  if (result && typeof result.then === "function") {
    throw new Error("trusted attempt-lease acquisition must complete atomically before dispatch");
  }
  return validateTrustedAttemptLeaseResult(request, result, now ?? new Date());
}

function requireTrustedGitRunner(trustedGitRunner) {
  if (typeof trustedGitRunner !== "function" || !TRUSTED_GIT_RUNNERS.has(trustedGitRunner)) {
    throw new Error(
      "a branded trusted Git runner created from an absolute verified executable or explicit trusted test seam is required",
    );
  }
  return TRUSTED_GIT_RUNNERS.get(trustedGitRunner);
}

export function createCodingAgentTrustedGitExecutableRunner(gitExecutable) {
  if (typeof gitExecutable !== "string" || !isAbsolute(gitExecutable)) {
    throw new Error("trusted Git executable path must be absolute");
  }
  const executable = realpathSync(gitExecutable);
  const executableStat = statSync(executable);
  if (!executableStat.isFile() || (executableStat.mode & 0o111) === 0) {
    throw new Error("trusted Git executable must be an executable regular file");
  }
  const versionOutput = execFileSync(executable, ["--version"], {
    encoding: "utf8",
    env: GIT_ENVIRONMENT,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  if (!/^git version \d+(?:\.\d+)+(?:[. -].*)?$/u.test(versionOutput)) {
    throw new Error("trusted Git executable returned an unexpected version response");
  }
  const metadata = Object.freeze({
    kind: "ABSOLUTE_VERIFIED_GIT_EXECUTABLE",
    executable,
    executableDigest: sha256(readFileSync(executable)),
    version: versionOutput,
  });
  const runner = (repository, args) => execFileSync(
    executable,
    ["-C", repository, ...args],
    {
      encoding: "utf8",
      env: GIT_ENVIRONMENT,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  TRUSTED_GIT_RUNNERS.set(runner, metadata);
  return runner;
}

export function createCodingAgentTrustedGitTestSeam(testRunner) {
  if (typeof testRunner !== "function") {
    throw new Error("trusted Git test seam requires a function");
  }
  const runner = (repository, args) => testRunner(repository, structuredClone(args));
  TRUSTED_GIT_RUNNERS.set(runner, Object.freeze({ kind: "EXPLICIT_TRUSTED_TEST_SEAM" }));
  return runner;
}

const UNSAFE_LOCAL_GIT_CONFIG = /^(?:alias\.|include(?:if)?\.|url\.|credential\.|http\.|filter\.|submodule\.|protocol\.|remote\..*\.(?:uploadpack|receivepack|proxy|promisor|partialclonefilter)$|core\.(?:hookspath|sshcommand|fsmonitor|askpass)$|diff\..*\.(?:command|textconv)$)/u;

function assertSafeLocalGitConfiguration(repository, trustedGitRunner) {
  const output = trustedGitRunner(
    repository,
    ["config", "--local", "--null", "--name-only", "--list"],
  );
  const names = output.split("\0").filter(Boolean).map((name) => name.trim().toLowerCase());
  for (const name of names) {
    if (UNSAFE_LOCAL_GIT_CONFIG.test(name)) {
      throw new Error(`Curve authorization checkout has unsafe local Git config ${name}`);
    }
  }
}

function requireTrustedRemoteTipResolver(resolver) {
  if (typeof resolver !== "function" || !TRUSTED_REMOTE_TIP_RESOLVERS.has(resolver)) {
    throw new Error(
      "a branded trusted live remote-tip resolver is required for Curve origin/main",
    );
  }
  return TRUSTED_REMOTE_TIP_RESOLVERS.get(resolver);
}

function normalizeTrustedRemoteObservation(observation, branch, expectedSource, now) {
  assertObjectWithExactKeys(
    observation,
    ["commit", "branch", "remote", "observed_at", "source"],
    "trusted live remote-tip observation",
  );
  assertPattern(observation.commit, SHA_PATTERN, "trusted live remote-tip commit");
  if (observation.branch !== branch || observation.remote !== "origin") {
    throw new Error("trusted live remote-tip observation does not bind origin and branch");
  }
  if (observation.source !== expectedSource) {
    throw new Error("trusted live remote-tip observation source is not the configured trust source");
  }
  const observedAt = parseInstant(
    observation.observed_at,
    "trusted live remote-tip observed_at",
  );
  const nowMilliseconds = trustedNowMilliseconds(now);
  if (
    observedAt > nowMilliseconds + MAXIMUM_CLOCK_SKEW_MS ||
    nowMilliseconds - observedAt > MAXIMUM_REMOTE_OBSERVATION_AGE_MS
  ) {
    throw new Error("trusted live remote-tip observation is stale or from the future");
  }
  return structuredClone(observation);
}

export function createCodingAgentTrustedGitRemoteTipResolver(trustedGitRunner) {
  requireTrustedGitRunner(trustedGitRunner);
  const resolver = (repository, branch) => {
    assertSafeLocalGitConfiguration(repository, trustedGitRunner);
    const output = trustedGitRunner(
      repository,
      ["ls-remote", "--exit-code", "origin", `refs/heads/${branch}`],
    ).trim();
    const lines = output === "" ? [] : output.split("\n");
    if (lines.length !== 1) {
      throw new Error(`trusted Git live origin/${branch} resolved ${lines.length} refs`);
    }
    const match = lines[0].match(/^([0-9a-f]{40})\trefs\/heads\/(.+)$/u);
    if (!match || match[2] !== branch) {
      throw new Error(`trusted Git live origin/${branch} returned an unexpected ref`);
    }
    return {
      commit: match[1],
      branch,
      remote: "origin",
      observed_at: new Date().toISOString(),
      source: "TRUSTED_GIT_LS_REMOTE",
    };
  };
  TRUSTED_REMOTE_TIP_RESOLVERS.set(
    resolver,
    Object.freeze({ expectedSource: "TRUSTED_GIT_LS_REMOTE" }),
  );
  return resolver;
}

export function createCodingAgentTrustedControllerRemoteTipResolver(
  controllerBinding,
  observeRemoteTip,
) {
  assertObjectWithExactKeys(
    controllerBinding,
    ["controller_id", "contract_digest"],
    "trusted controller binding",
  );
  assertNonEmptyString(controllerBinding.controller_id, "trusted controller ID", 128);
  assertPattern(
    controllerBinding.contract_digest,
    DIGEST_PATTERN,
    "trusted controller contract digest",
  );
  if (typeof observeRemoteTip !== "function") {
    throw new Error("trusted controller remote-tip callback is required");
  }
  const resolver = (repository, branch, label) => observeRemoteTip({
    repository,
    branch,
    remote: "origin",
    label,
    controller_binding: structuredClone(controllerBinding),
  });
  TRUSTED_REMOTE_TIP_RESOLVERS.set(
    resolver,
    Object.freeze({
      expectedSource: "TRUSTED_CONTROLLER",
      controllerBinding: structuredClone(controllerBinding),
    }),
  );
  return resolver;
}

export function createCodingAgentTrustedRemoteTipTestSeam(testResolver) {
  if (typeof testResolver !== "function") {
    throw new Error("trusted remote-tip test seam requires a function");
  }
  const resolver = (...args) => testResolver(...args);
  TRUSTED_REMOTE_TIP_RESOLVERS.set(
    resolver,
    Object.freeze({ expectedSource: "TRUSTED_TEST_REMOTE_OBSERVATION" }),
  );
  return resolver;
}

export function validateExactCurveOriginMainCheckout(
  curveRepository,
  expectedRepositoryUrl,
  {
    trustedGitRunner,
    resolveRepository = realpathSync,
    trustedRemoteTipResolver,
    now = new Date(),
  } = {},
) {
  requireTrustedGitRunner(trustedGitRunner);
  const remoteTrust = requireTrustedRemoteTipResolver(trustedRemoteTipResolver);
  const repository = resolveRepository(curveRepository);
  assertSafeLocalGitConfiguration(repository, trustedGitRunner);
  const topLevel = resolveRepository(
    trustedGitRunner(repository, ["rev-parse", "--show-toplevel"]).trim(),
  );
  if (topLevel !== repository) throw new Error("Curve repository path must be the checkout root");
  const remote = normalizeCodingAgentRepositoryUrl(
    trustedGitRunner(repository, ["remote", "get-url", "origin"]).trim(),
  );
  const expected = normalizeCodingAgentRepositoryUrl(expectedRepositoryUrl);
  if (remote !== expected) throw new Error("Curve checkout origin does not match the authorization trust root");
  const head = trustedGitRunner(
    repository,
    ["rev-parse", "--verify", "HEAD^{commit}"],
  ).trim();
  const remoteObservation = normalizeTrustedRemoteObservation(
    trustedRemoteTipResolver(
      repository,
      "main",
      "Curve implementation-authorization trust root",
    ),
    "main",
    remoteTrust.expectedSource,
    now,
  );
  const remoteMain = remoteObservation.commit;
  assertPattern(head, SHA_PATTERN, "Curve HEAD");
  assertPattern(remoteMain, SHA_PATTERN, "Curve origin/main");
  if (head !== remoteMain) {
    throw new Error("Curve checkout is local, stale, or unmerged; HEAD must equal origin/main");
  }
  const status = trustedGitRunner(
    repository,
    ["status", "--porcelain=v1", "--untracked-files=all"],
  );
  if (status !== "") throw new Error("Curve authorization checkout must be clean");
  return {
    repository,
    remote,
    head,
    remoteMain,
    remoteObservation,
    gitTrust: structuredClone(requireTrustedGitRunner(trustedGitRunner)),
    remoteTrust: structuredClone(remoteTrust),
    clean: true,
  };
}

export function createCodingAgentMergedCurveRevisionValidator(
  curveRepository,
  { trustedGitRunner } = {},
) {
  requireTrustedGitRunner(trustedGitRunner);
  assertSafeLocalGitConfiguration(curveRepository, trustedGitRunner);
  return (revision, selectedCurveRevision) => {
    assertPattern(revision, SHA_PATTERN, "governance provenance revision");
    assertPattern(selectedCurveRevision, SHA_PATTERN, "selected Curve revision");
    try {
      const resolved = trustedGitRunner(
        curveRepository,
        ["rev-parse", "--verify", `${revision}^{commit}`],
      ).trim();
      if (resolved !== revision) return false;
      trustedGitRunner(
        curveRepository,
        ["merge-base", "--is-ancestor", revision, selectedCurveRevision],
      );
      return true;
    } catch {
      return false;
    }
  };
}

function authorizeCodingAgentTaskPacketForExecutionInternal(
  packet,
  authorization,
  {
    preflightOptions,
    validatePreflight,
    now,
    expectedAttemptId,
    authorizationEvidence,
    verifyTrustedHumanAuthority,
    acquireTrustedAttemptLease,
    leaseId,
    leaseExpiresAt,
  } = {},
) {
  if (typeof validatePreflight !== "function") {
    throw new Error("task-packet preflight validator is required");
  }
  const preflight = validatePreflight(packet, preflightOptions);
  if (preflight?.implementation_authority_granted !== false) {
    throw new Error("read-only task-packet preflight must grant no implementation authority");
  }
  if (preflight.packet_digest !== packet.packet_digest) {
    throw new Error("preflight packet digest does not match the selected packet");
  }
  if (preflight.context_digest !== packet.curve_binding.context_pack.context_digest) {
    throw new Error("preflight context digest does not match the selected packet");
  }
  const evidence = validateCodingAgentImplementationAuthorizationEvidence(
    authorization,
    authorizationEvidence,
  );
  const decisionNow = now ?? new Date();
  const semantics = validateCodingAgentImplementationAuthorizationAgainstPacket(
    packet,
    authorization,
    { now: decisionNow, expectedAttemptId },
  );
  const authorityVerifications = verifyCodingAgentImplementationHumanAuthority(
    authorization,
    { verifyTrustedHumanAuthority, now },
  );
  const requestsControllerEffects =
    authorization.approval_subject.permitted_agent_workflow_actions.includes(
      "REQUEST_TRUSTED_CONTROLLER_EFFECTS",
    );
  const externalEffectsBinding = requestsControllerEffects
    ? {
        mode: "TRUSTED_CONTROLLER_ONLY",
        effects_digest: computeCodingAgentAuthorizedEffectsDigest(
          authorization.approval_subject.external_effects.effects,
        ),
        controller_contracts_digest:
          computeCodingAgentAuthorizedControllerContractsDigest(
            authorization.approval_subject.external_effects.controller_contracts,
          ),
      }
    : null;
  const attemptLease = acquireCodingAgentImplementationAttemptLease(authorization, {
    acquireTrustedAttemptLease,
    leaseId,
    leaseExpiresAt,
    now,
  });
  return {
    ...preflight,
    implementation_authority_granted: true,
    authorization: {
      authorization_id: semantics.authorizationId,
      authorization_version: semantics.authorizationVersion,
      lifecycle_state: semantics.lifecycleState,
      workspace_id: authorization.workspace_id,
      attempt_id: authorization.approval_subject.attempt_id,
      approval_subject_digest: semantics.approvalSubjectDigest,
      valid_from: authorization.approval_subject.valid_from,
      expires_at: authorization.approval_subject.expires_at,
      permitted_agent_workflow_actions: structuredClone(
        authorization.approval_subject.permitted_agent_workflow_actions,
      ),
      human_authority_verifications: authorityVerifications,
      external_effects_binding: externalEffectsBinding,
      attempt_lease: attemptLease,
      evidence,
    },
  };
}

export function authorizeCodingAgentTaskPacketForExecution(
  packet,
  authorization,
  options = {},
) {
  for (const prohibitedOption of ["validatePreflight", "now"]) {
    if (Object.prototype.hasOwnProperty.call(options, prohibitedOption)) {
      throw new Error(
        `production authorization does not accept caller-selected ${prohibitedOption}`,
      );
    }
  }
  return authorizeCodingAgentTaskPacketForExecutionInternal(packet, authorization, {
    ...options,
    validatePreflight: validateCodingAgentTaskPacketForDispatch,
  });
}

export function createCodingAgentAuthorizationPreflightTestController(
  validatePreflight,
) {
  if (typeof validatePreflight !== "function") {
    throw new Error("authorization preflight test controller requires a function");
  }
  const controller = (packet, options) => validatePreflight(packet, options);
  AUTHORIZATION_PREFLIGHT_TEST_CONTROLLERS.add(controller);
  return controller;
}

export function authorizeCodingAgentTaskPacketForExecutionWithTestControllers(
  packet,
  authorization,
  options = {},
  { preflightController } = {},
) {
  if (!AUTHORIZATION_PREFLIGHT_TEST_CONTROLLERS.has(preflightController)) {
    throw new Error(
      "authorization test seam requires a tagged task-packet preflight controller",
    );
  }
  if (Object.prototype.hasOwnProperty.call(options, "validatePreflight")) {
    throw new Error("authorization test options cannot override the tagged preflight controller");
  }
  return authorizeCodingAgentTaskPacketForExecutionInternal(packet, authorization, {
    ...options,
    validatePreflight: preflightController,
  });
}

export function relativeAuthorizationRegistryPath(repositoryRoot, authorizationPath) {
  const path = relative(repositoryRoot, authorizationPath);
  return normalizedAuthorizationRegistryPath(path).split(sep).join("/");
}

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SOURCE_ADR_PATH = fileURLToPath(
  new URL("../../docs/technical/adr-009-retention-and-erasure.md", import.meta.url),
);
const DECISION_SCHEMA_PATH = fileURLToPath(
  new URL("../../contracts/schemas/retention-policy-decision.schema.json", import.meta.url),
);

export const RETENTION_ASSET_CLASSES = Object.freeze([
  "EVIDENCE_RESEARCH_BODY",
  "DERIVED_ARTIFACT_CONTEXT_BODY",
  "PROMPT_RESPONSE_MODEL_TRACE",
  "TRANSCRIPT_QUESTION_BODY",
  "CANDIDATE_PATCH_SANDBOX_OUTPUT",
  "QUALITY_LOG_REPORT_BODY",
  "PREVIEW_BODY_RUNTIME",
  "EXPORT_STAGING_BODY",
  "RAW_PROVIDER_PAYLOAD",
  "AUDIT_LINEAGE_METADATA",
  "TOMBSTONE_ERASURE_RECEIPT",
  "DATABASE_BACKUP_OBJECT_VERSION",
  "FORENSIC_QUARANTINE",
]);

export const RETENTION_CLASSIFICATIONS = Object.freeze([
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
]);

export const RETENTION_STORAGE_COPY_KINDS = Object.freeze([
  "POSTGRESQL_FULL_INCREMENTAL_PITR",
  "POSTGRESQL_REPLICA",
  "S3_CURRENT_OBJECT",
  "S3_NONCURRENT_VERSION_DELETE_MARKER",
  "S3_INCOMPLETE_MULTIPART_UPLOAD",
  "S3_REPLICATION_ARCHIVE",
  "LOG_SIEM_PROJECTION",
  "FORENSIC_QUARANTINE_STORE",
]);

export const RETENTION_ALLOWED_START_EVENTS = Object.freeze({
  EVIDENCE_RESEARCH_BODY: Object.freeze(["INITIATIVE_CLOSED"]),
  DERIVED_ARTIFACT_CONTEXT_BODY: Object.freeze(["ARTIFACT_SUPERSEDED"]),
  PROMPT_RESPONSE_MODEL_TRACE: Object.freeze(["ATTEMPT_TERMINAL"]),
  TRANSCRIPT_QUESTION_BODY: Object.freeze(["QUESTION_ANSWERED", "ATTEMPT_TERMINAL"]),
  CANDIDATE_PATCH_SANDBOX_OUTPUT: Object.freeze(["SANDBOX_TERMINAL", "ATTEMPT_TERMINAL"]),
  QUALITY_LOG_REPORT_BODY: Object.freeze(["QUALITY_RUN_TERMINAL"]),
  PREVIEW_BODY_RUNTIME: Object.freeze(["PREVIEW_CREATED", "PREVIEW_LAST_AUTHORIZED_USE"]),
  EXPORT_STAGING_BODY: Object.freeze(["EXPORT_COMPLETED"]),
  RAW_PROVIDER_PAYLOAD: Object.freeze(["PROVIDER_PAYLOAD_NORMALIZED"]),
  AUDIT_LINEAGE_METADATA: Object.freeze(["EVENT_RECORDED"]),
  TOMBSTONE_ERASURE_RECEIPT: Object.freeze(["ERASURE_COMPLETED"]),
  DATABASE_BACKUP_OBJECT_VERSION: Object.freeze(["BACKUP_CREATED_OR_VERSION_BECAME_NONCURRENT"]),
  FORENSIC_QUARANTINE: Object.freeze(["CASE_CLOSED_OR_HOLD_RELEASED"]),
});

const DECISION_BLOCKS = Object.freeze([
  ["key_erasure", "KEY_ERASURE"],
  ["legal_hold", "LEGAL_HOLD"],
  ["restore_re_erasure", "RESTORE_RE_ERASURE"],
  ["external_copy_deletion", "EXTERNAL_COPY_DELETION"],
  ["failure_escalation", "FAILURE_ESCALATION"],
  ["cost_capacity", "COST_CAPACITY"],
]);

const APPROVAL_ROLES = Object.freeze([
  "security",
  "privacy",
  "legal",
  "platform_operations",
  "database_operations",
  "curve_engineering",
]);

const CONTRACT_REPOSITORY_REF = "git@github.com:faocampo/curve.git";
const SHA256_DIGEST_PATTERN = /^sha256:(?!0{64}$)[0-9a-f]{64}$/;
const REVISION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,255}$/;
const REFERENCE_PATTERN = /^[a-z][a-z0-9._:/-]{2,255}$/;
const CANONICAL_IDENTITY_AUTHORITY_PATTERN = /^identity:[a-z0-9][a-z0-9._/-]{1,126}$/;
const CANONICAL_IDENTITY_SUBJECT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,254}$/;

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function assertExact(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message);
}

function expectedCellKeys() {
  return RETENTION_ASSET_CLASSES.flatMap((assetClass) =>
    RETENTION_CLASSIFICATIONS.map((classification) => `${assetClass}:${classification}`),
  );
}

function approvalComplete(record) {
  return Boolean(record.approver_identity && record.approved_decision_digest && record.approved_at);
}

function approvalEmpty(record) {
  return (
    record.approver_identity === null &&
    record.approved_decision_digest === null &&
    record.approved_at === null
  );
}

function evidenceReferenceComplete(reference) {
  return Boolean(
    reference &&
      typeof reference.artifact_ref === "string" &&
      REFERENCE_PATTERN.test(reference.artifact_ref) &&
      typeof reference.revision === "string" &&
      REVISION_PATTERN.test(reference.revision) &&
      typeof reference.content_digest === "string" &&
      SHA256_DIGEST_PATTERN.test(reference.content_digest),
  );
}

function assertEvidenceReference(reference, field) {
  if (!evidenceReferenceComplete(reference)) {
    throw new Error(`${field} must bind an artifact revision and SHA-256 content digest`);
  }
}

function identityProofReferenceComplete(reference, authorityRef, subjectId) {
  return Boolean(
    evidenceReferenceComplete(reference) &&
      reference.authority_ref === authorityRef &&
      reference.subject_id === subjectId,
  );
}

function contractEvidenceValuesComplete(contractEvidence) {
  return Boolean(
    contractEvidence.repository_ref === CONTRACT_REPOSITORY_REF &&
      typeof contractEvidence.base_revision === "string" &&
      /^(?!0{40}$)[0-9a-f]{40}$/.test(contractEvidence.base_revision) &&
      typeof contractEvidence.source_adr_digest === "string" &&
      SHA256_DIGEST_PATTERN.test(contractEvidence.source_adr_digest) &&
      typeof contractEvidence.decision_schema_digest === "string" &&
      SHA256_DIGEST_PATTERN.test(contractEvidence.decision_schema_digest),
  );
}

function contractEvidenceComplete(contractEvidence) {
  return contractEvidence.status === "BOUND" && contractEvidenceValuesComplete(contractEvidence);
}

function approvalIdentityPolicyValuesComplete(policy) {
  return Boolean(
    typeof policy.canonical_authority_ref === "string" &&
      CANONICAL_IDENTITY_AUTHORITY_PATTERN.test(policy.canonical_authority_ref) &&
      evidenceReferenceComplete(policy.authority_evidence_ref) &&
      ["SIX_DISTINCT_PEOPLE", "DUAL_HAT_ALLOWED"].includes(policy.separation_mode) &&
      approvalSeparationConfigurationComplete(policy) &&
      evidenceReferenceComplete(policy.separation_policy_evidence_ref),
  );
}

function canonicalRolePairKey(pair) {
  return [...pair].sort().join("\0");
}

function dualHatRolePairsValid(pairs) {
  if (!Array.isArray(pairs)) return false;
  const pairKeys = [];
  for (const pair of pairs) {
    if (
      !Array.isArray(pair) ||
      pair.length !== 2 ||
      new Set(pair).size !== 2 ||
      !pair.every((role) => APPROVAL_ROLES.includes(role))
    ) {
      return false;
    }
    pairKeys.push(canonicalRolePairKey(pair));
  }
  return new Set(pairKeys).size === pairKeys.length;
}

function approvalSeparationConfigurationComplete(policy) {
  if (!dualHatRolePairsValid(policy.allowed_dual_hat_role_pairs)) return false;
  if (policy.separation_mode === "SIX_DISTINCT_PEOPLE") {
    return policy.allowed_dual_hat_role_pairs.length === 0;
  }
  if (policy.separation_mode === "DUAL_HAT_ALLOWED") {
    return policy.allowed_dual_hat_role_pairs.length > 0;
  }
  return false;
}

function approvalIdentityPolicyComplete(policy) {
  return policy.status === "DECIDED" && approvalIdentityPolicyValuesComplete(policy);
}

function canonicalIdentityKey(identity) {
  return `${identity.authority_ref}\0${identity.subject_id}`;
}

let localContractContext;

function sha256File(filePath) {
  return `sha256:${createHash("sha256").update(readFileSync(filePath)).digest("hex")}`;
}

function resolvedLocalContractContext() {
  if (!localContractContext) {
    localContractContext = {
      headRevision: execFileSync(
        "git",
        ["-C", REPOSITORY_ROOT, "rev-parse", "HEAD"],
        { encoding: "utf8" },
      ).trim(),
      sourceAdrDigest: sha256File(SOURCE_ADR_PATH),
      decisionSchemaDigest: sha256File(DECISION_SCHEMA_PATH),
    };
  }
  return localContractContext;
}

function assertContractEvidenceResolved(contractEvidence) {
  const context = resolvedLocalContractContext();
  try {
    execFileSync(
      "git",
      ["-C", REPOSITORY_ROOT, "cat-file", "-e", `${contractEvidence.base_revision}^{commit}`],
      { stdio: "ignore" },
    );
    execFileSync(
      "git",
      [
        "-C",
        REPOSITORY_ROOT,
        "merge-base",
        "--is-ancestor",
        contractEvidence.base_revision,
        context.headRevision,
      ],
      { stdio: "ignore" },
    );
  } catch {
    throw new Error("D-009 contract evidence base revision is not a resolvable ancestor of HEAD");
  }
  if (contractEvidence.source_adr_digest !== context.sourceAdrDigest) {
    throw new Error("D-009 contract evidence source ADR digest does not match the candidate bytes");
  }
  if (contractEvidence.decision_schema_digest !== context.decisionSchemaDigest) {
    throw new Error("D-009 contract evidence decision schema digest does not match the candidate bytes");
  }
}

function assertContractEvidenceConsistency(contractEvidence) {
  if (contractEvidence.repository_ref !== CONTRACT_REPOSITORY_REF) {
    throw new Error("D-009 contract evidence names an unexpected repository");
  }
  const valuesComplete = contractEvidenceValuesComplete(contractEvidence);
  if (
    !["UNRESOLVED", "BOUND"].includes(contractEvidence.status) ||
    (contractEvidence.status === "BOUND") !== valuesComplete
  ) {
    throw new Error("D-009 contract evidence status differs from its revision/digest bindings");
  }
  if (contractEvidence.status === "BOUND") assertContractEvidenceResolved(contractEvidence);
}

function assertStorageInventoryEntryConsistency(entry) {
  assertEvidenceReference(entry.state_evidence_ref, `D-009 ${entry.storage_copy_kind} state evidence`);
  if (entry.state === "PRESENT") {
    if (
      !entry.product_ref ||
      !entry.account_ref ||
      entry.regions.length === 0 ||
      !["RESTORABLE", "NON_RESTORABLE"].includes(entry.restore_behavior)
    ) {
      throw new Error(`D-009 ${entry.storage_copy_kind} PRESENT inventory is incomplete`);
    }
    if (
      entry.storage_copy_kind === "S3_INCOMPLETE_MULTIPART_UPLOAD" &&
      entry.restore_behavior !== "NON_RESTORABLE"
    ) {
      throw new Error("D-009 incomplete multipart uploads must be recorded as non-restorable");
    }
    assertEvidenceReference(
      entry.lifecycle_policy_ref,
      `D-009 ${entry.storage_copy_kind} lifecycle policy`,
    );
    assertEvidenceReference(
      entry.destruction_proof_ref,
      `D-009 ${entry.storage_copy_kind} destruction proof`,
    );
    assertEvidenceReference(
      entry.restore_behavior_ref,
      `D-009 ${entry.storage_copy_kind} restore behavior`,
    );
    return;
  }
  if (!["ABSENT", "NOT_DEPLOYED"].includes(entry.state)) {
    throw new Error(`D-009 ${entry.storage_copy_kind} has an unknown storage-copy state`);
  }
  if (
    entry.product_ref !== null ||
    entry.account_ref !== null ||
    entry.regions.length !== 0 ||
    entry.lifecycle_policy_ref !== null ||
    entry.destruction_proof_ref !== null ||
    entry.restore_behavior !== "NOT_APPLICABLE" ||
    entry.restore_behavior_ref !== null
  ) {
    throw new Error(`D-009 ${entry.storage_copy_kind} non-present inventory has deployed-copy fields`);
  }
}

function assertExternalCopyConsistency(block) {
  assertExact(
    block.accepted_proof_modes,
    ["RECEIPT", "CONTRACT_EVIDENCE", "OUTSIDE_CURVE_CONTROL"],
    "D-009 external-copy proof modes differ from the required vocabulary",
  );
  const inventoryRefs = block.connection_inventory_refs;
  if (
    !Array.isArray(inventoryRefs) ||
    inventoryRefs.some((reference) => !REFERENCE_PATTERN.test(reference)) ||
    new Set(inventoryRefs).size !== inventoryRefs.length
  ) {
    throw new Error("D-009 external-connection inventory references are invalid or duplicated");
  }
  const connectionRefs = block.connection_policies.map((entry) => entry.connection_ref);
  if (new Set(connectionRefs).size !== connectionRefs.length) {
    throw new Error("D-009 external-copy policies contain a duplicate connection");
  }
  for (const entry of block.connection_policies) {
    if (!block.accepted_proof_modes.includes(entry.proof_mode)) {
      throw new Error(`D-009 external connection ${entry.connection_ref} has an unknown proof mode`);
    }
    assertEvidenceReference(entry.policy_ref, `D-009 external connection ${entry.connection_ref} policy`);
    assertEvidenceReference(entry.proof_ref, `D-009 external connection ${entry.connection_ref} proof`);
  }

  if (block.connection_inventory_state === null) {
    if (
      block.connection_inventory_evidence_ref !== null ||
      inventoryRefs.length !== 0 ||
      connectionRefs.length !== 0
    ) {
      throw new Error("D-009 unresolved external-connection inventory contains completion evidence");
    }
    if (block.status === "DECIDED") {
      throw new Error("D-009 decided external-copy block lacks a connection inventory decision");
    }
    return;
  }
  assertEvidenceReference(
    block.connection_inventory_evidence_ref,
    "D-009 external-connection inventory evidence",
  );
  if (
    (block.connection_inventory_state === "NO_EXTERNAL_CONNECTIONS" &&
      (inventoryRefs.length !== 0 || connectionRefs.length !== 0)) ||
    (block.connection_inventory_state === "ENUMERATED" &&
      (inventoryRefs.length === 0 || connectionRefs.length === 0)) ||
    !["NO_EXTERNAL_CONNECTIONS", "ENUMERATED"].includes(block.connection_inventory_state)
  ) {
    throw new Error("D-009 external-connection inventory state contradicts its policy mapping");
  }
  if (block.connection_inventory_state === "ENUMERATED") {
    assertExact(
      [...connectionRefs].sort(),
      [...inventoryRefs].sort(),
      "D-009 external-connection inventory does not exactly match its policy mappings",
    );
  }
  if (block.status === "DECIDED") {
    if (!block.owner_ref || !block.procedure_ref) {
      throw new Error("D-009 decided external-copy block is missing its owner or procedure");
    }
    assertEvidenceReference(block.procedure_ref, "D-009 external-copy deletion procedure");
  }
}

function assertApprovalIdentityPolicyConsistency(policy) {
  if (!dualHatRolePairsValid(policy.allowed_dual_hat_role_pairs)) {
    throw new Error("D-009 approval identity policy contains invalid or duplicate dual-hat role pairs");
  }
  if (
    policy.separation_mode !== "DUAL_HAT_ALLOWED" &&
    policy.allowed_dual_hat_role_pairs.length !== 0
  ) {
    throw new Error("D-009 approval identity policy has role pairs without a dual-hat selection");
  }
  const valuesComplete = approvalIdentityPolicyValuesComplete(policy);
  if (
    !["UNRESOLVED", "DECIDED"].includes(policy.status) ||
    (policy.status === "DECIDED") !== valuesComplete
  ) {
    throw new Error("D-009 approval identity policy status differs from its authority/separation fields");
  }
}

const DECIDED_BLOCK_NON_NULL_FIELDS = Object.freeze({
  key_erasure: Object.freeze([
    "key_boundary",
    "kms_key_type",
    "deletion_wait_days",
    "multi_region_replica_handling_ref",
    "custom_key_store_backup_handling_ref",
    "destruction_authority_ref",
    "proof_ref",
    "unrelated_data_impact_test_ref",
  ]),
  legal_hold: Object.freeze(["conflict_authority_ref", "periodic_review", "procedure_ref"]),
  restore_re_erasure: Object.freeze([
    "re_erasure_max_duration",
    "verification_owner_ref",
    "runbook_ref",
  ]),
  external_copy_deletion: Object.freeze([
    "connection_inventory_state",
    "connection_inventory_evidence_ref",
    "owner_ref",
    "procedure_ref",
  ]),
  failure_escalation: Object.freeze([
    "incident_severity",
    "owner_ref",
    "notice_policy_ref",
    "manual_recovery_runbook_ref",
  ]),
  cost_capacity: Object.freeze(["monthly_estimate", "assumptions_ref", "approver_ref"]),
});

const DECIDED_BLOCK_EVIDENCE_FIELDS = Object.freeze({
  key_erasure: Object.freeze([
    "multi_region_replica_handling_ref",
    "custom_key_store_backup_handling_ref",
    "proof_ref",
    "unrelated_data_impact_test_ref",
  ]),
  legal_hold: Object.freeze(["procedure_ref"]),
  restore_re_erasure: Object.freeze(["runbook_ref"]),
  external_copy_deletion: Object.freeze([
    "connection_inventory_evidence_ref",
    "procedure_ref",
  ]),
  failure_escalation: Object.freeze(["notice_policy_ref", "manual_recovery_runbook_ref"]),
  cost_capacity: Object.freeze(["assumptions_ref"]),
});

function assertDecisionBlockComplete(manifest, property) {
  const block = manifest[property];
  if (block.status !== "DECIDED") throw new Error(`${property} remains unresolved`);
  for (const field of DECIDED_BLOCK_NON_NULL_FIELDS[property]) {
    if (block[field] === null) throw new Error(`${property}.${field} remains unresolved`);
  }
  for (const field of DECIDED_BLOCK_EVIDENCE_FIELDS[property]) {
    assertEvidenceReference(block[field], `D-009 ${property}.${field}`);
  }
  if (property === "legal_hold") {
    if (block.authority_refs.length === 0) throw new Error("legal_hold authority is missing");
    if (block.release_authority_refs.length === 0) {
      throw new Error("legal_hold release authority is missing");
    }
  }
  if (property === "failure_escalation" && block.retry_schedule.length === 0) {
    throw new Error("failure_escalation retry schedule is missing");
  }
}

function assertDecidedBlockCompleteness(manifest) {
  for (const [property] of DECISION_BLOCKS) assertDecisionBlockComplete(manifest, property);
}

function assertPolicyCellConsistency(cell) {
  assertEvidenceReference(
    cell.minimum_metadata_profile_ref,
    `D-009 policy cell ${cell.cell_key} metadata profile`,
  );
  assertEvidenceReference(
    cell.authority_reference,
    `D-009 policy cell ${cell.cell_key} authority`,
  );
  const allowedStartEvents = RETENTION_ALLOWED_START_EVENTS[cell.asset_class];
  if (!allowedStartEvents?.includes(cell.start_event)) {
    throw new Error(`D-009 policy cell ${cell.cell_key} has an incompatible start event`);
  }

  const activeMode = cell.active_retention.mode;
  const backupMode = cell.backup_retention.mode;
  if (activeMode === "DEFAULT_DENIED") {
    if (
      cell.body_disposition !== "DEFAULT_DENIED" ||
      cell.deletion_trigger !== "NOT_APPLICABLE" ||
      backupMode === "DURATION" ||
      cell.backup_destruction_verification_required
    ) {
      throw new Error(`D-009 policy cell ${cell.cell_key} contradicts DEFAULT_DENIED retention`);
    }
    return;
  }
  if (activeMode === "NOT_APPLICABLE") {
    if (
      cell.body_disposition !== "NOT_APPLICABLE" ||
      cell.deletion_trigger !== "NOT_APPLICABLE" ||
      backupMode !== "NOT_APPLICABLE" ||
      cell.backup_destruction_verification_required
    ) {
      throw new Error(`D-009 policy cell ${cell.cell_key} contradicts NOT_APPLICABLE retention`);
    }
    return;
  }
  if (["DEFAULT_DENIED", "NOT_APPLICABLE"].includes(cell.body_disposition)) {
    throw new Error(`D-009 policy cell ${cell.cell_key} disposition contradicts DURATION retention`);
  }
  if (cell.deletion_trigger === "NOT_APPLICABLE") {
    throw new Error(`D-009 policy cell ${cell.cell_key} deletion trigger contradicts DURATION retention`);
  }
  if ((backupMode === "DURATION") !== cell.backup_destruction_verification_required) {
    throw new Error(`D-009 policy cell ${cell.cell_key} backup verification contradicts backup retention`);
  }
}

export function retentionApprovalSubjectDigest(manifest) {
  const storageInventory = manifest.storage_inventory
    .map((entry) => ({ ...entry, regions: [...entry.regions].sort() }))
    .sort((left, right) => left.storage_copy_kind.localeCompare(right.storage_copy_kind));
  const legalHold = {
    ...manifest.legal_hold,
    authority_refs: [...manifest.legal_hold.authority_refs].sort(),
    release_authority_refs: [...manifest.legal_hold.release_authority_refs].sort(),
  };
  const externalCopyDeletion = {
    ...manifest.external_copy_deletion,
    connection_inventory_refs: [
      ...manifest.external_copy_deletion.connection_inventory_refs,
    ].sort(),
    connection_policies: [...manifest.external_copy_deletion.connection_policies].sort((left, right) =>
      left.connection_ref.localeCompare(right.connection_ref),
    ),
  };
  const approvalIdentityPolicy = {
    ...manifest.approvals.identity_policy,
    allowed_dual_hat_role_pairs: manifest.approvals.identity_policy.allowed_dual_hat_role_pairs
      .map((pair) => [...pair].sort())
      .sort((left, right) => canonicalRolePairKey(left).localeCompare(canonicalRolePairKey(right))),
  };
  const subject = {
    schema_version: manifest.schema_version,
    decision_id: manifest.decision_id,
    decision_state: manifest.decision_state,
    effective_scope: manifest.effective_scope,
    source_adr: manifest.source_adr,
    contract_evidence: manifest.contract_evidence,
    catalog: manifest.catalog,
    policy_cells: [...manifest.policy_cells].sort((left, right) =>
      left.cell_key.localeCompare(right.cell_key),
    ),
    storage_inventory: storageInventory,
    key_erasure: manifest.key_erasure,
    legal_hold: legalHold,
    restore_re_erasure: manifest.restore_re_erasure,
    external_copy_deletion: externalCopyDeletion,
    failure_escalation: manifest.failure_escalation,
    cost_capacity: manifest.cost_capacity,
    approval_identity_policy: approvalIdentityPolicy,
    next_review_at: manifest.approvals.next_review_at,
    activation_guard: manifest.activation_guard,
  };
  return `sha256:${createHash("sha256")
    .update("curve-d009-retention-decision:v1\0")
    .update(JSON.stringify(canonicalJson(subject)))
    .digest("hex")}`;
}

export function validateRetentionPolicyDecisionSemantics(manifest) {
  assertExact(
    manifest.catalog.asset_classes,
    RETENTION_ASSET_CLASSES,
    "D-009 asset catalog differs from the required v1 inventory",
  );
  assertExact(
    manifest.catalog.classifications,
    RETENTION_CLASSIFICATIONS,
    "D-009 classification catalog differs from the required v1 inventory",
  );
  assertExact(
    manifest.catalog.storage_copy_kinds,
    RETENTION_STORAGE_COPY_KINDS,
    "D-009 storage-copy catalog differs from the required v1 inventory",
  );
  assertContractEvidenceConsistency(manifest.contract_evidence);

  const allCellKeys = expectedCellKeys();
  const populatedCellKeys = manifest.policy_cells.map((cell) => cell.cell_key);
  if (new Set(populatedCellKeys).size !== populatedCellKeys.length) {
    throw new Error("D-009 policy cells contain a duplicate cell key");
  }
  for (const cell of manifest.policy_cells) {
    const expectedKey = `${cell.asset_class}:${cell.classification}`;
    if (cell.cell_key !== expectedKey || !allCellKeys.includes(cell.cell_key)) {
      throw new Error(`D-009 policy cell ${cell.cell_key} does not match its asset/classification`);
    }
    assertPolicyCellConsistency(cell);
  }
  const unresolvedCellKeys = allCellKeys.filter((key) => !populatedCellKeys.includes(key));
  assertExact(
    manifest.unresolved_cell_keys,
    unresolvedCellKeys,
    "D-009 unresolved cell list does not exactly complement populated policy cells",
  );

  const populatedStorageKeys = manifest.storage_inventory.map((entry) => entry.storage_copy_kind);
  if (new Set(populatedStorageKeys).size !== populatedStorageKeys.length) {
    throw new Error("D-009 storage inventory contains a duplicate copy kind");
  }
  for (const entry of manifest.storage_inventory) {
    if (!RETENTION_STORAGE_COPY_KINDS.includes(entry.storage_copy_kind)) {
      throw new Error(`D-009 storage inventory contains unknown copy kind ${entry.storage_copy_kind}`);
    }
    assertStorageInventoryEntryConsistency(entry);
  }
  const unresolvedStorageKeys = RETENTION_STORAGE_COPY_KINDS.filter(
    (key) => !populatedStorageKeys.includes(key),
  );
  assertExact(
    manifest.unresolved_storage_keys,
    unresolvedStorageKeys,
    "D-009 unresolved storage list does not exactly complement the inventory",
  );

  assertExternalCopyConsistency(manifest.external_copy_deletion);
  assertApprovalIdentityPolicyConsistency(manifest.approvals.identity_policy);
  for (const [property] of DECISION_BLOCKS) {
    if (manifest[property].status === "DECIDED") assertDecisionBlockComplete(manifest, property);
  }
  const approvalRecordsComplete = APPROVAL_ROLES.every((role) =>
    approvalComplete(manifest.approvals[role]),
  );
  const approvalsComplete =
    approvalIdentityPolicyComplete(manifest.approvals.identity_policy) && approvalRecordsComplete;
  const approvalsEmpty = APPROVAL_ROLES.every((role) => approvalEmpty(manifest.approvals[role]));
  const expectedUnresolvedRequirements = [];
  if (unresolvedCellKeys.length > 0) expectedUnresolvedRequirements.push("ASSET_POLICY_CELLS");
  if (unresolvedStorageKeys.length > 0) expectedUnresolvedRequirements.push("STORAGE_INVENTORY");
  if (!contractEvidenceComplete(manifest.contract_evidence)) {
    expectedUnresolvedRequirements.push("CONTRACT_EVIDENCE");
  }
  for (const [property, requirement] of DECISION_BLOCKS) {
    if (manifest[property].status !== "DECIDED") expectedUnresolvedRequirements.push(requirement);
  }
  if (!approvalsComplete) expectedUnresolvedRequirements.push("NAMED_APPROVALS");
  assertExact(
    manifest.unresolved_requirements,
    expectedUnresolvedRequirements,
    "D-009 unresolved-requirement projection differs from the decision content",
  );

  if (
    manifest.activation_guard.protected_storage_enabled ||
    manifest.activation_guard.staging_enabled ||
    manifest.activation_guard.production_enabled
  ) {
    throw new Error("D-009 cannot directly activate protected storage or a non-local environment");
  }

  if (manifest.decision_state === "PROPOSED") {
    if (
      manifest.effective_scope !== "NONE_FAIL_CLOSED" ||
      manifest.approval_subject_digest !== null ||
      !approvalsEmpty ||
      manifest.approvals.decision_date !== null ||
      manifest.approvals.next_review_at !== null ||
      manifest.activation_guard.implementation_dispatch_allowed ||
      expectedUnresolvedRequirements.length === 0
    ) {
      throw new Error("a proposed D-009 decision must remain fail closed and unresolved");
    }
    return {
      state: manifest.decision_state,
      populatedCellCount: populatedCellKeys.length,
      unresolvedCellCount: unresolvedCellKeys.length,
      populatedStorageCount: populatedStorageKeys.length,
      unresolvedRequirementCount: expectedUnresolvedRequirements.length,
    };
  }

  if (unresolvedCellKeys.length > 0 || unresolvedStorageKeys.length > 0) {
    throw new Error("a decided D-009 policy requires every asset cell and storage copy");
  }
  if (!contractEvidenceComplete(manifest.contract_evidence)) {
    throw new Error("a decided D-009 policy requires revision-bound contract evidence");
  }
  assertDecidedBlockCompleteness(manifest);
  if (!approvalIdentityPolicyComplete(manifest.approvals.identity_policy)) {
    throw new Error("a decided D-009 policy requires a canonical approval identity policy");
  }
  if (!approvalRecordsComplete) {
    throw new Error("a decided D-009 policy requires every named approval");
  }
  if (!manifest.approvals.decision_date || !manifest.approvals.next_review_at) {
    throw new Error("a decided D-009 policy requires decision and next-review timestamps");
  }
  const decisionTime = Date.parse(manifest.approvals.decision_date);
  const nextReviewTime = Date.parse(manifest.approvals.next_review_at);
  if (!Number.isFinite(decisionTime) || !Number.isFinite(nextReviewTime)) {
    throw new Error("D-009 decision and next-review timestamps must be valid dates");
  }
  if (!(nextReviewTime > decisionTime)) throw new Error("D-009 next review must follow the decision date");

  const expectedDigest = retentionApprovalSubjectDigest(manifest);
  if (manifest.approval_subject_digest !== expectedDigest) {
    throw new Error(`D-009 approval-subject digest mismatch: expected ${expectedDigest}`);
  }
  for (const role of APPROVAL_ROLES) {
    const approval = manifest.approvals[role];
    const identity = approval.approver_identity;
    if (
      identity.authority_ref !== manifest.approvals.identity_policy.canonical_authority_ref ||
      typeof identity.subject_id !== "string" ||
      !CANONICAL_IDENTITY_SUBJECT_PATTERN.test(identity.subject_id) ||
      !identityProofReferenceComplete(
        identity.identity_proof_ref,
        identity.authority_ref,
        identity.subject_id,
      )
    ) {
      throw new Error(`D-009 ${role} approval does not use the canonical identity authority`);
    }
    if (approval.approved_decision_digest !== expectedDigest) {
      throw new Error(`D-009 ${role} approval does not bind the exact decision digest`);
    }
    const approvedTime = Date.parse(approval.approved_at);
    if (!Number.isFinite(approvedTime) || approvedTime >= decisionTime) {
      throw new Error(`D-009 ${role} approval must occur before the decision date`);
    }
  }
  const approvalIdentityKeys = APPROVAL_ROLES.map((role) =>
    canonicalIdentityKey(manifest.approvals[role].approver_identity),
  );
  if (
    manifest.approvals.identity_policy.separation_mode === "SIX_DISTINCT_PEOPLE" &&
    new Set(approvalIdentityKeys).size !== APPROVAL_ROLES.length
  ) {
    throw new Error("D-009 approval identity policy requires six distinct people");
  }
  if (manifest.approvals.identity_policy.separation_mode === "DUAL_HAT_ALLOWED") {
    const rolesByIdentity = new Map();
    for (let index = 0; index < APPROVAL_ROLES.length; index += 1) {
      const identityKey = approvalIdentityKeys[index];
      const assignedRoles = rolesByIdentity.get(identityKey) ?? [];
      assignedRoles.push(APPROVAL_ROLES[index]);
      rolesByIdentity.set(identityKey, assignedRoles);
    }
    const allowedPairKeys = new Set(
      manifest.approvals.identity_policy.allowed_dual_hat_role_pairs.map(canonicalRolePairKey),
    );
    for (const assignedRoles of rolesByIdentity.values()) {
      if (assignedRoles.length > 2) {
        throw new Error("D-009 dual-hat policy permits at most two functional roles per person");
      }
      if (assignedRoles.length === 2 && !allowedPairKeys.has(canonicalRolePairKey(assignedRoles))) {
        throw new Error("D-009 approval identity reuse is not an allowed dual-hat role pair");
      }
    }
  }
  if (
    manifest.effective_scope !== "CURVE_CONTROLLED_COPIES" ||
    !manifest.activation_guard.implementation_dispatch_allowed
  ) {
    throw new Error("a decided D-009 policy must explicitly unblock implementation review only");
  }

  return {
    state: manifest.decision_state,
    populatedCellCount: populatedCellKeys.length,
    unresolvedCellCount: 0,
    populatedStorageCount: populatedStorageKeys.length,
    unresolvedRequirementCount: 0,
    approvalSubjectDigest: expectedDigest,
  };
}

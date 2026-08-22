import { createHash } from "node:crypto";

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
  return Boolean(record.approver_ref && record.approved_decision_digest && record.approved_at);
}

function assertDecidedBlockCompleteness(manifest) {
  const nonNullFields = {
    key_erasure: [
      "key_boundary",
      "kms_key_type",
      "deletion_wait_days",
      "multi_region_replica_handling_ref",
      "custom_key_store_backup_handling_ref",
      "destruction_authority_ref",
      "proof_ref",
      "unrelated_data_impact_test_ref",
    ],
    legal_hold: ["conflict_authority_ref", "periodic_review", "procedure_ref"],
    restore_re_erasure: ["re_erasure_max_duration", "verification_owner_ref", "runbook_ref"],
    external_copy_deletion: ["owner_ref", "procedure_ref"],
    failure_escalation: [
      "incident_severity",
      "owner_ref",
      "notice_policy_ref",
      "manual_recovery_runbook_ref",
    ],
    cost_capacity: ["monthly_estimate", "assumptions_ref", "approver_ref"],
  };

  for (const [property] of DECISION_BLOCKS) {
    const block = manifest[property];
    if (block.status !== "DECIDED") throw new Error(`${property} remains unresolved`);
    for (const field of nonNullFields[property]) {
      if (block[field] === null) throw new Error(`${property}.${field} remains unresolved`);
    }
  }
  if (manifest.legal_hold.authority_refs.length === 0) throw new Error("legal_hold authority is missing");
  if (manifest.legal_hold.release_authority_refs.length === 0) {
    throw new Error("legal_hold release authority is missing");
  }
  if (manifest.failure_escalation.retry_schedule.length === 0) {
    throw new Error("failure_escalation retry schedule is missing");
  }
}

export function retentionApprovalSubjectDigest(manifest) {
  const subject = {
    catalog: manifest.catalog,
    policy_cells: [...manifest.policy_cells].sort((left, right) =>
      left.cell_key.localeCompare(right.cell_key),
    ),
    storage_inventory: [...manifest.storage_inventory].sort((left, right) =>
      left.storage_copy_kind.localeCompare(right.storage_copy_kind),
    ),
    key_erasure: manifest.key_erasure,
    legal_hold: manifest.legal_hold,
    restore_re_erasure: manifest.restore_re_erasure,
    external_copy_deletion: manifest.external_copy_deletion,
    failure_escalation: manifest.failure_escalation,
    cost_capacity: manifest.cost_capacity,
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
  const unresolvedStorageKeys = RETENTION_STORAGE_COPY_KINDS.filter(
    (key) => !populatedStorageKeys.includes(key),
  );
  assertExact(
    manifest.unresolved_storage_keys,
    unresolvedStorageKeys,
    "D-009 unresolved storage list does not exactly complement the inventory",
  );

  const approvalsComplete = APPROVAL_ROLES.every((role) => approvalComplete(manifest.approvals[role]));
  const expectedUnresolvedRequirements = [];
  if (unresolvedCellKeys.length > 0) expectedUnresolvedRequirements.push("ASSET_POLICY_CELLS");
  if (unresolvedStorageKeys.length > 0) expectedUnresolvedRequirements.push("STORAGE_INVENTORY");
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
  assertDecidedBlockCompleteness(manifest);
  if (!approvalsComplete) throw new Error("a decided D-009 policy requires every named approval");
  if (!manifest.approvals.decision_date || !manifest.approvals.next_review_at) {
    throw new Error("a decided D-009 policy requires decision and next-review timestamps");
  }
  const decisionTime = Date.parse(manifest.approvals.decision_date);
  const nextReviewTime = Date.parse(manifest.approvals.next_review_at);
  if (!(nextReviewTime > decisionTime)) throw new Error("D-009 next review must follow the decision date");

  const expectedDigest = retentionApprovalSubjectDigest(manifest);
  if (manifest.approval_subject_digest !== expectedDigest) {
    throw new Error(`D-009 approval-subject digest mismatch: expected ${expectedDigest}`);
  }
  for (const role of APPROVAL_ROLES) {
    const approval = manifest.approvals[role];
    if (approval.approved_decision_digest !== expectedDigest) {
      throw new Error(`D-009 ${role} approval does not bind the exact decision digest`);
    }
    if (Date.parse(approval.approved_at) > decisionTime) {
      throw new Error(`D-009 ${role} approval occurs after the decision date`);
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

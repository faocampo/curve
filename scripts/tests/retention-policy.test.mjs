import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  RETENTION_ASSET_CLASSES,
  RETENTION_CLASSIFICATIONS,
  RETENTION_STORAGE_COPY_KINDS,
  retentionApprovalSubjectDigest,
  validateRetentionPolicyDecisionSemantics,
} from "../lib/retention-policy.mjs";

const PROPOSAL = JSON.parse(
  readFileSync(
    new URL("../../contracts/governance/d009-retention-policy-v1.json", import.meta.url),
    "utf8",
  ),
);

function validate(mutator = () => {}) {
  const manifest = structuredClone(PROPOSAL);
  mutator(manifest);
  return validateRetentionPolicyDecisionSemantics(manifest);
}

function decidedManifest() {
  const manifest = structuredClone(PROPOSAL);
  manifest.decision_state = "DECIDED";
  manifest.effective_scope = "CURVE_CONTROLLED_COPIES";
  manifest.policy_cells = RETENTION_ASSET_CLASSES.flatMap((assetClass) =>
    RETENTION_CLASSIFICATIONS.map((classification) => ({
      cell_key: `${assetClass}:${classification}`,
      asset_class: assetClass,
      classification,
      active_retention: { mode: "DURATION", duration: "P30D" },
      backup_retention: { mode: "DURATION", duration: "P60D" },
      start_event: "EVENT_RECORDED",
      deletion_trigger: "AUTHORIZED_REQUEST_OR_RETENTION_EXPIRY",
      body_disposition: "PHYSICAL_AND_CRYPTOGRAPHIC",
      minimum_metadata_profile_ref: "policy:metadata:v1",
      legal_hold_behavior: "HOLD_BLOCKS_ERASURE_AND_MAY_FENCE_READS",
      backup_destruction_verification_required: true,
      accountable_owner_ref: "role:data-governance",
      authority_reference: "policy:d009:v1",
      review_cadence: "P365D",
    })),
  );
  manifest.unresolved_cell_keys = [];
  manifest.storage_inventory = RETENTION_STORAGE_COPY_KINDS.map((storageCopyKind) => ({
    storage_copy_kind: storageCopyKind,
    product_ref: "aws:inventory:v1",
    account_ref: "aws:account:development",
    regions: ["us-east-1"],
    catalog_owner_ref: "role:platform-operations",
    lifecycle_policy_ref: "policy:storage-lifecycle:v1",
    destruction_proof_ref: "runbook:storage-destruction:v1",
  }));
  manifest.unresolved_storage_keys = [];
  manifest.key_erasure = {
    status: "DECIDED",
    key_boundary: "OBJECT",
    kms_key_type: "CUSTOMER_MANAGED_SINGLE_REGION",
    deletion_wait_days: 7,
    multi_region_replica_handling_ref: "policy:kms-replica:not-applicable",
    custom_key_store_backup_handling_ref: "policy:custom-key-store:not-applicable",
    destruction_authority_ref: "role:key-destruction-authority",
    proof_ref: "runbook:kms-erasure:v1",
    unrelated_data_impact_test_ref: "test:kms-erasure-isolation:v1",
  };
  manifest.legal_hold = {
    status: "DECIDED",
    authority_refs: ["role:legal-hold-authority"],
    release_authority_refs: ["role:legal-hold-release-authority"],
    conflict_authority_ref: "role:legal-counsel",
    case_id_required: true,
    covers_derivatives: true,
    covers_backups: true,
    read_fencing_supported: true,
    periodic_review: "P30D",
    procedure_ref: "runbook:legal-hold:v1",
  };
  manifest.restore_re_erasure = {
    status: "DECIDED",
    quarantine_before_service: true,
    ledger_replay_required: true,
    re_erasure_max_duration: "PT24H",
    verification_owner_ref: "role:database-operations",
    runbook_ref: "runbook:restore-re-erasure:v1",
  };
  manifest.external_copy_deletion = {
    status: "DECIDED",
    connection_policy_required: true,
    truthful_scope_reporting: true,
    accepted_proof_modes: ["RECEIPT", "CONTRACT_EVIDENCE", "OUTSIDE_CURVE_CONTROL"],
    owner_ref: "role:integration-owner",
    procedure_ref: "runbook:external-copy-deletion:v1",
  };
  manifest.failure_escalation = {
    status: "DECIDED",
    retry_schedule: ["PT5M", "PT30M", "PT2H"],
    incident_severity: "HIGH",
    owner_ref: "role:privacy-incident-owner",
    notice_policy_ref: "policy:data-erasure-notice:v1",
    manual_recovery_runbook_ref: "runbook:data-erasure-recovery:v1",
  };
  manifest.cost_capacity = {
    status: "DECIDED",
    currency: "USD",
    monthly_estimate: 100,
    assumptions_ref: "forecast:retention-capacity:v1",
    approver_ref: "role:platform-finance-approver",
  };
  manifest.unresolved_requirements = [];
  manifest.activation_guard.implementation_dispatch_allowed = true;
  const digest = retentionApprovalSubjectDigest(manifest);
  manifest.approval_subject_digest = digest;
  for (const role of [
    "security",
    "privacy",
    "legal",
    "platform_operations",
    "database_operations",
    "curve_engineering",
  ]) {
    manifest.approvals[role] = {
      approver_ref: `person:${role.replaceAll("_", "-")}`,
      approved_decision_digest: digest,
      approved_at: "2026-08-22T12:00:00Z",
    };
  }
  manifest.approvals.decision_date = "2026-08-22T13:00:00Z";
  manifest.approvals.next_review_at = "2027-08-22T13:00:00Z";
  return manifest;
}

test("canonical D-009 proposal is complete as a fail-closed decision worksheet", () => {
  assert.deepEqual(validate(), {
    state: "PROPOSED",
    populatedCellCount: 0,
    unresolvedCellCount: 39,
    populatedStorageCount: 0,
    unresolvedRequirementCount: 9,
  });
});

test("asset, classification, and storage catalogs cannot drift", () => {
  assert.throws(
    () => validate((manifest) => { manifest.catalog.asset_classes.pop(); }),
    /asset catalog differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.catalog.classifications.reverse(); }),
    /classification catalog differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.catalog.storage_copy_kinds.pop(); }),
    /storage-copy catalog differs/,
  );
});

test("policy cells must be unique and bind their exact asset and classification", () => {
  const cell = decidedManifest().policy_cells[0];
  assert.throws(
    () => validate((manifest) => {
      manifest.policy_cells = [cell, structuredClone(cell)];
    }),
    /duplicate cell key/,
  );
  assert.throws(
    () => validate((manifest) => {
      manifest.policy_cells = [{ ...cell, classification: "CONFIDENTIAL" }];
    }),
    /does not match its asset\/classification/,
  );
});

test("unresolved cell and storage projections must exactly complement populated entries", () => {
  assert.throws(
    () => validate((manifest) => { manifest.unresolved_cell_keys.pop(); }),
    /unresolved cell list/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.unresolved_storage_keys.pop(); }),
    /unresolved storage list/,
  );
});

test("a proposal cannot claim approval, implementation dispatch, or effective scope", () => {
  assert.throws(
    () => validate((manifest) => { manifest.activation_guard.implementation_dispatch_allowed = true; }),
    /proposed D-009 decision must remain fail closed/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.approval_subject_digest = `sha256:${"0".repeat(64)}`; }),
    /proposed D-009 decision must remain fail closed/,
  );
});

test("a decided policy requires all 39 cells and eight storage copy inventories", () => {
  assert.throws(
    () => validate((manifest) => {
      manifest.decision_state = "DECIDED";
      manifest.effective_scope = "CURVE_CONTROLLED_COPIES";
      manifest.activation_guard.implementation_dispatch_allowed = true;
    }),
    /requires every asset cell and storage copy/,
  );
});

test("a complete decided policy binds every human approval to one stable content digest", () => {
  const manifest = decidedManifest();
  const result = validateRetentionPolicyDecisionSemantics(manifest);
  assert.equal(result.state, "DECIDED");
  assert.equal(result.populatedCellCount, 39);
  assert.equal(result.populatedStorageCount, 8);
  assert.equal(result.approvalSubjectDigest, manifest.approval_subject_digest);
});

test("decided policy rejects an unresolved block or forged approval digest", () => {
  const unresolved = decidedManifest();
  unresolved.key_erasure.status = "UNRESOLVED";
  unresolved.unresolved_requirements = ["KEY_ERASURE"];
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(unresolved),
    /key_erasure remains unresolved/,
  );

  const forged = decidedManifest();
  forged.approvals.security.approved_decision_digest = `sha256:${"0".repeat(64)}`;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(forged),
    /security approval does not bind/,
  );
});

test("decision chronology requires approvals before decision and review after decision", () => {
  const lateApproval = decidedManifest();
  lateApproval.approvals.security.approved_at = "2026-08-22T14:00:00Z";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(lateApproval),
    /approval occurs after the decision date/,
  );

  const staleReview = decidedManifest();
  staleReview.approvals.next_review_at = staleReview.approvals.decision_date;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(staleReview),
    /next review must follow/,
  );
});

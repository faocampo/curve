import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  RETENTION_ASSET_CLASSES,
  RETENTION_ALLOWED_START_EVENTS,
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
const REPOSITORY_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SOURCE_ADR_BYTES = readFileSync(
  new URL("../../docs/technical/adr-009-retention-and-erasure.md", import.meta.url),
);
const DECISION_SCHEMA_BYTES = readFileSync(
  new URL("../../contracts/schemas/retention-policy-decision.schema.json", import.meta.url),
);
const DECISION_SCHEMA = JSON.parse(DECISION_SCHEMA_BYTES.toString("utf8"));
const CONTRACT_BASE_REVISION = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: REPOSITORY_ROOT,
  encoding: "utf8",
}).trim();
const SOURCE_ADR_DIGEST = `sha256:${createHash("sha256").update(SOURCE_ADR_BYTES).digest("hex")}`;
const DECISION_SCHEMA_DIGEST = `sha256:${createHash("sha256")
  .update(DECISION_SCHEMA_BYTES)
  .digest("hex")}`;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateDecisionSchema = ajv.compile(DECISION_SCHEMA);

const APPROVAL_ROLES = [
  "security",
  "privacy",
  "legal",
  "platform_operations",
  "database_operations",
  "curve_engineering",
];

function validate(mutator = () => {}) {
  const manifest = structuredClone(PROPOSAL);
  mutator(manifest);
  return validateRetentionPolicyDecisionSemantics(manifest);
}

function assertSchemaValid(manifest) {
  assert.equal(validateDecisionSchema(manifest), true, JSON.stringify(validateDecisionSchema.errors));
}

function assertSchemaInvalid(manifest) {
  assert.equal(validateDecisionSchema(manifest), false, "expected JSON Schema rejection");
}

function evidenceRef(artifactRef, revision = "v1") {
  return {
    artifact_ref: artifactRef,
    revision,
    content_digest: `sha256:${createHash("sha256")
      .update(`${artifactRef}\0${revision}`)
      .digest("hex")}`,
  };
}

function identityProofRef(authorityRef, subjectId) {
  return {
    ...evidenceRef(`identity-proof:${subjectId}`, "v1"),
    authority_ref: authorityRef,
    subject_id: subjectId,
  };
}

function rebindApprovals(manifest) {
  const digest = retentionApprovalSubjectDigest(manifest);
  manifest.approval_subject_digest = digest;
  for (const role of APPROVAL_ROLES) {
    manifest.approvals[role].approved_decision_digest = digest;
  }
  return digest;
}

function decidedManifest() {
  const manifest = structuredClone(PROPOSAL);
  manifest.decision_state = "DECIDED";
  manifest.effective_scope = "CURVE_CONTROLLED_COPIES";
  manifest.contract_evidence = {
    status: "BOUND",
    repository_ref: "git@github.com:faocampo/curve.git",
    base_revision: CONTRACT_BASE_REVISION,
    source_adr_digest: SOURCE_ADR_DIGEST,
    decision_schema_digest: DECISION_SCHEMA_DIGEST,
  };
  manifest.policy_cells = RETENTION_ASSET_CLASSES.flatMap((assetClass) =>
    RETENTION_CLASSIFICATIONS.map((classification) => ({
      cell_key: `${assetClass}:${classification}`,
      asset_class: assetClass,
      classification,
      active_retention: { mode: "DURATION", duration: "P30D" },
      backup_retention: { mode: "DURATION", duration: "P60D" },
      start_event: RETENTION_ALLOWED_START_EVENTS[assetClass][0],
      deletion_trigger: "AUTHORIZED_REQUEST_OR_RETENTION_EXPIRY",
      body_disposition: "PHYSICAL_AND_CRYPTOGRAPHIC",
      minimum_metadata_profile_ref: evidenceRef("policy:metadata", "v1"),
      legal_hold_behavior: "HOLD_BLOCKS_ERASURE_AND_MAY_FENCE_READS",
      backup_destruction_verification_required: true,
      accountable_owner_ref: "role:data-governance",
      authority_reference: evidenceRef("policy:d009-authority", "v1"),
      review_cadence: "P365D",
    })),
  );
  manifest.unresolved_cell_keys = [];
  manifest.storage_inventory = RETENTION_STORAGE_COPY_KINDS.map((storageCopyKind) => ({
    storage_copy_kind: storageCopyKind,
    state: "PRESENT",
    state_evidence_ref: evidenceRef(`inventory:${storageCopyKind.toLowerCase()}`, "snapshot-v1"),
    product_ref: "aws:inventory:v1",
    account_ref: "aws:account:development",
    regions: ["us-east-1"],
    catalog_owner_ref: "role:platform-operations",
    lifecycle_policy_ref: evidenceRef("policy:storage-lifecycle", "v1"),
    destruction_proof_ref: evidenceRef("runbook:storage-destruction", "v1"),
    restore_behavior:
      storageCopyKind === "S3_INCOMPLETE_MULTIPART_UPLOAD"
        ? "NON_RESTORABLE"
        : "RESTORABLE",
    restore_behavior_ref: evidenceRef("runbook:storage-restore", "v1"),
  }));
  manifest.unresolved_storage_keys = [];
  manifest.key_erasure = {
    status: "DECIDED",
    key_boundary: "OBJECT",
    kms_key_type: "CUSTOMER_MANAGED_SINGLE_REGION",
    deletion_wait_days: 7,
    multi_region_replica_handling_ref: evidenceRef("policy:kms-replica", "not-applicable-v1"),
    custom_key_store_backup_handling_ref: evidenceRef(
      "policy:custom-key-store",
      "not-applicable-v1",
    ),
    destruction_authority_ref: "role:key-destruction-authority",
    proof_ref: evidenceRef("runbook:kms-erasure", "v1"),
    unrelated_data_impact_test_ref: evidenceRef("test:kms-erasure-isolation", "v1"),
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
    procedure_ref: evidenceRef("runbook:legal-hold", "v1"),
  };
  manifest.restore_re_erasure = {
    status: "DECIDED",
    quarantine_before_service: true,
    ledger_replay_required: true,
    re_erasure_max_duration: "PT24H",
    verification_owner_ref: "role:database-operations",
    runbook_ref: evidenceRef("runbook:restore-re-erasure", "v1"),
  };
  manifest.external_copy_deletion = {
    status: "DECIDED",
    connection_policy_required: true,
    truthful_scope_reporting: true,
    accepted_proof_modes: ["RECEIPT", "CONTRACT_EVIDENCE", "OUTSIDE_CURVE_CONTROL"],
    connection_inventory_state: "ENUMERATED",
    connection_inventory_evidence_ref: evidenceRef("inventory:external-connections", "snapshot-v1"),
    connection_inventory_refs: ["connection:onyx-primary"],
    connection_policies: [
      {
        connection_ref: "connection:onyx-primary",
        policy_ref: evidenceRef("policy:onyx-copy-deletion", "v1"),
        proof_mode: "CONTRACT_EVIDENCE",
        proof_ref: evidenceRef("contract:onyx-copy-deletion", "v1"),
      },
    ],
    owner_ref: "role:integration-owner",
    procedure_ref: evidenceRef("runbook:external-copy-deletion", "v1"),
  };
  manifest.failure_escalation = {
    status: "DECIDED",
    retry_schedule: ["PT5M", "PT30M", "PT2H"],
    incident_severity: "HIGH",
    owner_ref: "role:privacy-incident-owner",
    notice_policy_ref: evidenceRef("policy:data-erasure-notice", "v1"),
    manual_recovery_runbook_ref: evidenceRef("runbook:data-erasure-recovery", "v1"),
  };
  manifest.cost_capacity = {
    status: "DECIDED",
    currency: "USD",
    monthly_estimate: 100,
    assumptions_ref: evidenceRef("forecast:retention-capacity", "v1"),
    approver_ref: "role:platform-finance-approver",
  };
  manifest.unresolved_requirements = [];
  manifest.activation_guard.implementation_dispatch_allowed = true;
  manifest.approvals.identity_policy = {
    status: "DECIDED",
    canonical_authority_ref: "identity:x3m-workforce",
    authority_evidence_ref: evidenceRef("policy:workforce-identity-authority", "v1"),
    separation_mode: "SIX_DISTINCT_PEOPLE",
    allowed_dual_hat_role_pairs: [],
    separation_policy_evidence_ref: evidenceRef("policy:d009-approval-separation", "v1"),
  };
  manifest.approvals.decision_date = "2026-08-22T13:00:00Z";
  manifest.approvals.next_review_at = "2027-08-22T13:00:00Z";
  const digest = retentionApprovalSubjectDigest(manifest);
  manifest.approval_subject_digest = digest;
  for (const role of APPROVAL_ROLES) {
    manifest.approvals[role] = {
      approver_identity: {
        authority_ref: "identity:x3m-workforce",
        subject_id: role.replaceAll("_", "-"),
        identity_proof_ref: identityProofRef(
          "identity:x3m-workforce",
          role.replaceAll("_", "-"),
        ),
      },
      approved_decision_digest: digest,
      approved_at: "2026-08-22T12:00:00Z",
    };
  }
  return manifest;
}

test("canonical D-009 proposal is complete as a fail-closed decision worksheet", () => {
  assert.deepEqual(validate(), {
    state: "PROPOSED",
    populatedCellCount: 0,
    unresolvedCellCount: 39,
    populatedStorageCount: 0,
    unresolvedRequirementCount: 10,
  });
});

test("JSON Schema exposes the same evidence, inventory, connection, and identity semantics", () => {
  const { properties, $defs } = DECISION_SCHEMA;
  assert.equal(properties.contract_evidence.$ref, "#/$defs/contractEvidence");
  assert.equal(
    $defs.policyCell.properties.authority_reference.$ref,
    "#/$defs/evidenceReference",
  );
  assert.deepEqual(
    $defs.storageInventoryEntry.properties.state.enum,
    ["PRESENT", "ABSENT", "NOT_DEPLOYED"],
  );
  assert.deepEqual(
    $defs.storageInventoryEntry.properties.restore_behavior.enum,
    ["RESTORABLE", "NON_RESTORABLE", "NOT_APPLICABLE"],
  );
  assert.equal(
    $defs.externalConnectionPolicy.properties.policy_ref.$ref,
    "#/$defs/evidenceReference",
  );
  assert.deepEqual(
    $defs.externalCopy.properties.connection_inventory_state.anyOf[0].enum,
    ["NO_EXTERNAL_CONNECTIONS", "ENUMERATED"],
  );
  assert.deepEqual(
    $defs.approvalIdentityPolicy.properties.separation_mode.anyOf[0].enum,
    ["SIX_DISTINCT_PEOPLE", "DUAL_HAT_ALLOWED"],
  );
  assert.equal(
    $defs.approvalIdentityPolicy.properties.allowed_dual_hat_role_pairs.items.items.$ref,
    "#/$defs/approvalRole",
  );
  assert.equal(
    $defs.approvalRecord.properties.approver_identity.anyOf[0].$ref,
    "#/$defs/canonicalPersonIdentity",
  );
  assert.equal(
    $defs.canonicalPersonIdentity.properties.identity_proof_ref.$ref,
    "#/$defs/identityProofReference",
  );
  assert.equal(DECISION_SCHEMA.allOf.length, 2);
  assert.equal($defs.keyErasure.allOf.length, 1);
  assert.equal($defs.storageInventoryEntry.allOf.length, 2);
});

test("JSON Schema rejects fail-open top-level states and incomplete decided blocks", () => {
  assertSchemaValid(PROPOSAL);
  assertSchemaValid(decidedManifest());

  const failOpenProposal = structuredClone(PROPOSAL);
  failOpenProposal.effective_scope = "CURVE_CONTROLLED_COPIES";
  assertSchemaInvalid(failOpenProposal);

  const incompleteBlock = structuredClone(PROPOSAL);
  incompleteBlock.key_erasure.status = "DECIDED";
  incompleteBlock.unresolved_requirements = incompleteBlock.unresolved_requirements.filter(
    (requirement) => requirement !== "KEY_ERASURE",
  );
  assertSchemaInvalid(incompleteBlock);

  const missingApproval = decidedManifest();
  missingApproval.approvals.security = structuredClone(PROPOSAL.approvals.security);
  assertSchemaInvalid(missingApproval);

  const restorableMultipart = decidedManifest();
  const multipart = restorableMultipart.storage_inventory.find(
    (entry) => entry.storage_copy_kind === "S3_INCOMPLETE_MULTIPART_UPLOAD",
  );
  multipart.restore_behavior = "RESTORABLE";
  assertSchemaInvalid(restorableMultipart);
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

test("contract evidence status exactly tracks its base revision and contract digests", () => {
  assert.throws(
    () => validate((manifest) => { manifest.contract_evidence.status = "BOUND"; }),
    /contract evidence status differs/,
  );
  assert.throws(
    () => validate((manifest) => {
      manifest.contract_evidence = structuredClone(decidedManifest().contract_evidence);
      manifest.contract_evidence.status = "UNRESOLVED";
    }),
    /contract evidence status differs/,
  );
  assert.throws(
    () => validate((manifest) => {
      manifest.contract_evidence.repository_ref = "git@example.invalid:other/repository.git";
    }),
    /unexpected repository/,
  );
  const placeholderBase = decidedManifest();
  placeholderBase.contract_evidence.base_revision = "0".repeat(40);
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(placeholderBase),
    /contract evidence status differs/,
  );

  const unresolvableBase = decidedManifest();
  unresolvableBase.contract_evidence.base_revision = "f".repeat(40);
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(unresolvableBase),
    /not a resolvable ancestor of HEAD/,
  );

  const tamperedAdrDigest = decidedManifest();
  tamperedAdrDigest.contract_evidence.source_adr_digest = evidenceRef(
    "docs:technical:adr-009",
    "tampered",
  ).content_digest;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(tamperedAdrDigest),
    /source ADR digest does not match/,
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

test("policy cells enforce asset start events and internally consistent retention outcomes", () => {
  const incompatibleStart = decidedManifest();
  incompatibleStart.policy_cells[0].start_event = "EVENT_RECORDED";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(incompatibleStart),
    /incompatible start event/,
  );

  const deniedDisposition = decidedManifest();
  deniedDisposition.policy_cells[0].body_disposition = "DEFAULT_DENIED";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(deniedDisposition),
    /disposition contradicts DURATION/,
  );

  const missingBackupVerification = decidedManifest();
  missingBackupVerification.policy_cells[0].backup_destruction_verification_required = false;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(missingBackupVerification),
    /backup verification contradicts backup retention/,
  );

  const deniedWithBackup = decidedManifest();
  deniedWithBackup.policy_cells[0] = {
    ...deniedWithBackup.policy_cells[0],
    active_retention: { mode: "DEFAULT_DENIED", duration: null },
    body_disposition: "DEFAULT_DENIED",
    deletion_trigger: "NOT_APPLICABLE",
  };
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(deniedWithBackup),
    /contradicts DEFAULT_DENIED/,
  );
});

test("policy evidence references require both an exact revision and content digest", () => {
  const missingRevision = decidedManifest();
  delete missingRevision.policy_cells[0].authority_reference.revision;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(missingRevision),
    /must bind an artifact revision and SHA-256 content digest/,
  );

  const missingDigest = decidedManifest();
  delete missingDigest.policy_cells[0].minimum_metadata_profile_ref.content_digest;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(missingDigest),
    /must bind an artifact revision and SHA-256 content digest/,
  );

  const placeholderDigest = decidedManifest();
  placeholderDigest.policy_cells[0].authority_reference.content_digest =
    `sha256:${"0".repeat(64)}`;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(placeholderDigest),
    /must bind an artifact revision and SHA-256 content digest/,
  );
});

test("the approval digest binds contract, storage, external-copy, and approval-policy evidence", () => {
  const manifest = decidedManifest();
  const originalDigest = retentionApprovalSubjectDigest(manifest);
  const mutations = [
    (candidate) => { candidate.effective_scope = "NONE_FAIL_CLOSED"; },
    (candidate) => { candidate.activation_guard.implementation_dispatch_allowed = false; },
    (candidate) => { candidate.contract_evidence.base_revision = "2".repeat(40); },
    (candidate) => { candidate.storage_inventory[0].state_evidence_ref.revision = "snapshot-v2"; },
    (candidate) => {
      candidate.external_copy_deletion.connection_policies[0].proof_ref.revision = "v2";
    },
    (candidate) => {
      candidate.approvals.identity_policy.separation_policy_evidence_ref.revision = "v2";
    },
    (candidate) => { candidate.approvals.next_review_at = "2027-09-22T13:00:00Z"; },
  ];
  for (const mutate of mutations) {
    const candidate = structuredClone(manifest);
    mutate(candidate);
    assert.notEqual(retentionApprovalSubjectDigest(candidate), originalDigest);
  }
});

test("the approval digest canonicalizes set-like arrays and keyed connection mappings", () => {
  const manifest = decidedManifest();
  manifest.legal_hold.authority_refs.push("role:legal-hold-backup-authority");
  manifest.storage_inventory[0].regions.push("us-west-2");
  manifest.external_copy_deletion.connection_policies.push({
    connection_ref: "connection:quartz-secondary",
    policy_ref: evidenceRef("policy:quartz-copy-deletion", "v1"),
    proof_mode: "RECEIPT",
    proof_ref: evidenceRef("receipt:quartz-copy-deletion", "v1"),
  });
  manifest.external_copy_deletion.connection_inventory_refs.push(
    "connection:quartz-secondary",
  );
  manifest.approvals.identity_policy.separation_mode = "DUAL_HAT_ALLOWED";
  manifest.approvals.identity_policy.allowed_dual_hat_role_pairs = [
    ["security", "privacy"],
    ["platform_operations", "database_operations"],
  ];
  const originalDigest = retentionApprovalSubjectDigest(manifest);
  const reordered = structuredClone(manifest);
  reordered.legal_hold.authority_refs.reverse();
  reordered.storage_inventory[0].regions.reverse();
  reordered.external_copy_deletion.connection_inventory_refs.reverse();
  reordered.external_copy_deletion.connection_policies.reverse();
  reordered.approvals.identity_policy.allowed_dual_hat_role_pairs.reverse();
  for (const pair of reordered.approvals.identity_policy.allowed_dual_hat_role_pairs) {
    pair.reverse();
  }
  assert.equal(retentionApprovalSubjectDigest(reordered), originalDigest);
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

test("storage-copy state controls deployed fields and records restore behavior", () => {
  const presentWithoutRestore = decidedManifest();
  presentWithoutRestore.storage_inventory[0].restore_behavior_ref = null;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(presentWithoutRestore),
    /restore behavior must bind/,
  );

  const absentWithDeployment = decidedManifest();
  absentWithDeployment.storage_inventory[0].state = "ABSENT";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(absentWithDeployment),
    /non-present inventory has deployed-copy fields/,
  );

  for (const state of ["ABSENT", "NOT_DEPLOYED"]) {
    const nonPresent = decidedManifest();
    nonPresent.storage_inventory[0] = {
      ...nonPresent.storage_inventory[0],
      state,
      product_ref: null,
      account_ref: null,
      regions: [],
      lifecycle_policy_ref: null,
      destruction_proof_ref: null,
      restore_behavior: "NOT_APPLICABLE",
      restore_behavior_ref: null,
    };
    rebindApprovals(nonPresent);
    assert.equal(validateRetentionPolicyDecisionSemantics(nonPresent).state, "DECIDED");
  }

  const unknownState = decidedManifest();
  unknownState.storage_inventory[0].state = "UNKNOWN";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(unknownState),
    /unknown storage-copy state/,
  );

  const restorableMultipart = decidedManifest();
  const multipart = restorableMultipart.storage_inventory.find(
    (entry) => entry.storage_copy_kind === "S3_INCOMPLETE_MULTIPART_UPLOAD",
  );
  multipart.restore_behavior = "RESTORABLE";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(restorableMultipart),
    /incomplete multipart uploads must be recorded as non-restorable/,
  );
});

test("external-copy inventory and per-connection policy/proof mappings are coherent", () => {
  const missingInventoryDecision = decidedManifest();
  missingInventoryDecision.external_copy_deletion.connection_inventory_state = null;
  missingInventoryDecision.external_copy_deletion.connection_inventory_evidence_ref = null;
  missingInventoryDecision.external_copy_deletion.connection_inventory_refs = [];
  missingInventoryDecision.external_copy_deletion.connection_policies = [];
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(missingInventoryDecision),
    /lacks a connection inventory decision/,
  );

  assert.throws(
    () => validate((manifest) => {
      manifest.external_copy_deletion.connection_inventory_evidence_ref = evidenceRef(
        "inventory:external-connections",
        "snapshot-v1",
      );
    }),
    /unresolved external-connection inventory contains completion evidence/,
  );

  const duplicate = decidedManifest();
  duplicate.external_copy_deletion.connection_policies.push(
    structuredClone(duplicate.external_copy_deletion.connection_policies[0]),
  );
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(duplicate),
    /duplicate connection/,
  );

  const noConnectionsWithPolicy = decidedManifest();
  noConnectionsWithPolicy.external_copy_deletion.connection_inventory_state =
    "NO_EXTERNAL_CONNECTIONS";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(noConnectionsWithPolicy),
    /inventory state contradicts/,
  );

  const enumeratedWithoutPolicy = decidedManifest();
  enumeratedWithoutPolicy.external_copy_deletion.connection_policies = [];
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(enumeratedWithoutPolicy),
    /inventory state contradicts/,
  );

  const omittedConnectionMapping = decidedManifest();
  omittedConnectionMapping.external_copy_deletion.connection_inventory_refs.push(
    "connection:quartz-secondary",
  );
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(omittedConnectionMapping),
    /inventory does not exactly match its policy mappings/,
  );

  const unknownProofMode = decidedManifest();
  unknownProofMode.external_copy_deletion.connection_policies[0].proof_mode = "CLAIM_ONLY";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(unknownProofMode),
    /unknown proof mode/,
  );

  const unboundPolicy = decidedManifest();
  delete unboundPolicy.external_copy_deletion.connection_policies[0].policy_ref.revision;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(unboundPolicy),
    /external connection .* policy must bind/,
  );

  const noConnections = decidedManifest();
  noConnections.external_copy_deletion.connection_inventory_state = "NO_EXTERNAL_CONNECTIONS";
  noConnections.external_copy_deletion.connection_inventory_refs = [];
  noConnections.external_copy_deletion.connection_policies = [];
  rebindApprovals(noConnections);
  assert.equal(validateRetentionPolicyDecisionSemantics(noConnections).state, "DECIDED");
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
  assert.throws(
    () => validate((manifest) => {
      manifest.approvals.security = {
        approver_identity: {
          authority_ref: "identity:x3m-workforce",
          subject_id: "security-owner",
        },
        approved_decision_digest: `sha256:${"0".repeat(64)}`,
        approved_at: "2026-08-22T12:00:00Z",
      };
    }),
    /proposed D-009 decision must remain fail closed/,
  );
  assert.throws(
    () => validate((manifest) => {
      manifest.approvals.decision_date = "2026-08-22T13:00:00Z";
    }),
    /proposed D-009 decision must remain fail closed/,
  );

  assert.throws(
    () => validate((manifest) => {
      manifest.key_erasure.status = "DECIDED";
      manifest.unresolved_requirements = manifest.unresolved_requirements.filter(
        (requirement) => requirement !== "KEY_ERASURE",
      );
    }),
    /key_erasure\.key_boundary remains unresolved/,
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

test("approval identities use one canonical authority and obey the selected separation policy", () => {
  const wrongAuthority = decidedManifest();
  wrongAuthority.approvals.security.approver_identity.authority_ref = "identity:other-directory";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(wrongAuthority),
    /does not use the canonical identity authority/,
  );

  const duplicatePerson = decidedManifest();
  duplicatePerson.approvals.privacy.approver_identity = structuredClone(
    duplicatePerson.approvals.security.approver_identity,
  );
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(duplicatePerson),
    /requires six distinct people/,
  );

  const dualHat = decidedManifest();
  dualHat.approvals.identity_policy.separation_mode = "DUAL_HAT_ALLOWED";
  dualHat.approvals.identity_policy.allowed_dual_hat_role_pairs = [
    ["security", "privacy"],
  ];
  dualHat.approvals.privacy.approver_identity = structuredClone(
    dualHat.approvals.security.approver_identity,
  );
  rebindApprovals(dualHat);
  assert.equal(validateRetentionPolicyDecisionSemantics(dualHat).state, "DECIDED");

  const forbiddenPair = decidedManifest();
  forbiddenPair.approvals.identity_policy.separation_mode = "DUAL_HAT_ALLOWED";
  forbiddenPair.approvals.identity_policy.allowed_dual_hat_role_pairs = [
    ["security", "privacy"],
  ];
  forbiddenPair.approvals.legal.approver_identity = structuredClone(
    forbiddenPair.approvals.security.approver_identity,
  );
  rebindApprovals(forbiddenPair);
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(forbiddenPair),
    /not an allowed dual-hat role pair/,
  );

  const sixRoleReuse = decidedManifest();
  sixRoleReuse.approvals.identity_policy.separation_mode = "DUAL_HAT_ALLOWED";
  sixRoleReuse.approvals.identity_policy.allowed_dual_hat_role_pairs = [
    ["security", "privacy"],
  ];
  for (const role of APPROVAL_ROLES.slice(1)) {
    sixRoleReuse.approvals[role].approver_identity = structuredClone(
      sixRoleReuse.approvals.security.approver_identity,
    );
  }
  rebindApprovals(sixRoleReuse);
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(sixRoleReuse),
    /at most two functional roles per person/,
  );

  const invalidSubject = decidedManifest();
  invalidSubject.approvals.security.approver_identity.subject_id = "Display Name";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(invalidSubject),
    /does not use the canonical identity authority/,
  );

  const forgedIdentityProof = decidedManifest();
  forgedIdentityProof.approvals.security.approver_identity.identity_proof_ref.subject_id =
    "another-subject";
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(forgedIdentityProof),
    /does not use the canonical identity authority/,
  );
});

test("approval identity policy status exactly tracks authority and separation evidence", () => {
  const incomplete = decidedManifest();
  incomplete.approvals.identity_policy.authority_evidence_ref = null;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(incomplete),
    /identity policy status differs/,
  );

  assert.throws(
    () => validate((manifest) => {
      manifest.approvals.identity_policy = structuredClone(
        decidedManifest().approvals.identity_policy,
      );
      manifest.approvals.identity_policy.status = "UNRESOLVED";
    }),
    /identity policy status differs/,
  );

  const duplicatePair = decidedManifest();
  duplicatePair.approvals.identity_policy.separation_mode = "DUAL_HAT_ALLOWED";
  duplicatePair.approvals.identity_policy.allowed_dual_hat_role_pairs = [
    ["security", "privacy"],
    ["privacy", "security"],
  ];
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(duplicatePair),
    /invalid or duplicate dual-hat role pairs/,
  );
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
    /approval must occur before the decision date/,
  );

  const simultaneousApproval = decidedManifest();
  simultaneousApproval.approvals.security.approved_at = simultaneousApproval.approvals.decision_date;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(simultaneousApproval),
    /approval must occur before the decision date/,
  );

  const staleReview = decidedManifest();
  staleReview.approvals.next_review_at = staleReview.approvals.decision_date;
  assert.throws(
    () => validateRetentionPolicyDecisionSemantics(staleReview),
    /next review must follow/,
  );
});

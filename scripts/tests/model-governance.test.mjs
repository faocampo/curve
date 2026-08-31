import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  computeModelDataPolicyDecisionDigest,
  computeModelGatewayArchitectureDecisionDigest,
  D004_OPTION_CATALOG,
  D005_OPTION_CATALOG,
  unresolvedModelDataPolicy,
  unresolvedModelGatewayArchitecture,
  validateFallbackEquivalence,
  validateModelCatalog,
  validateModelDataPolicyDecision,
  validateModelGatewayArchitectureDecision,
  validateModelPolicyBoundContractBytes,
  validateRestrictedRouteEvidence,
  validateTaskModelPolicyMatrix,
} from "../lib/model-governance.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url));
}

function readJson(path) {
  return JSON.parse(read(path).toString("utf8"));
}

function digest(seed) {
  return `sha256:${seed.repeat(64).slice(0, 64)}`;
}

const architecture = readJson("contracts/governance/d004-model-gateway-architecture-v1.json");
const dataPolicy = readJson("contracts/governance/d005-model-data-policy-v1.json");
const candidateContracts = {
  modelCatalog: readJson("contracts/models/m0-s9c1a-model-catalog-v1.json"),
  taskPolicy: readJson("contracts/models/m0-s9c1a-task-model-policy-v1.json"),
  fallbackEquivalence: readJson("contracts/models/m0-s9c1a-fallback-equivalence-v1.json"),
  restrictedEvidence: readJson("contracts/models/m0-s9c1a-restricted-route-evidence-v1.json"),
};

const boundBytes = Object.fromEntries(
  dataPolicy.candidate_contracts.map(({ path }) => [path, read(path)]),
);

function evidenceRef(id, index) {
  return {
    repository: "github.com/faocampo/curve",
    path: `docs/technical/proofs/${id.toLowerCase()}.json`,
    source_revision: "a".repeat(40),
    content_digest: digest(String((index % 9) + 1)),
    environment: "LOCAL",
    checked_at: "2026-08-31T17:00:00Z",
  };
}

function approveArchitecture() {
  const record = structuredClone(architecture);
  record.status = "DECIDED";
  record.contract_state = "DECIDED_NORMATIVE";
  record.decision_outcome = "APPROVED";
  for (const option of Object.values(record.material_options)) {
    option.selected = option.options.find((value) => value !== "DEFER");
  }
  record.evidence_requirements = record.evidence_requirements.map((requirement, index) => ({
    ...requirement,
    status: "PASS",
    evidence_refs: [evidenceRef(requirement.requirement_id, index)],
  }));
  record.owners = {
    ai_platform: "AI Platform Owner",
    platform_operations: "Platform Operations Owner",
    security: "Security Owner",
    finops: "FinOps Owner",
  };
  record.decided_at = "2026-08-31T18:00:00Z";
  record.next_review_at = "2026-11-30T18:00:00Z";
  record.last_updated = record.decided_at;
  record.activation.decision_selected = true;
  record.activation.successor_contract_preparation_authorized = true;
  record.unresolved_requirements = [];
  record.decision_payload_digest = computeModelGatewayArchitectureDecisionDigest(record);
  record.approvals = [
    ["AI_PLATFORM", "AI Platform Owner"],
    ["PLATFORM_OPERATIONS", "Platform Operations Owner"],
    ["SECURITY", "Security Owner"],
    ["FINOPS", "FinOps Owner"],
  ].map(([role, approved_by]) => ({
    role,
    approved_by,
    approved_at: "2026-08-31T17:30:00Z",
    decision_payload_digest: record.decision_payload_digest,
  }));
  return record;
}

function catalogEvidence(seed) {
  return {
    reference: `docs/technical/proofs/${seed}.json`,
    source_revision: "b".repeat(40),
    content_digest: digest(seed.slice(0, 1)),
    checked_at: "2026-08-31T17:00:00Z",
  };
}

function approvedPolicyContracts() {
  const modelCatalog = structuredClone(candidateContracts.modelCatalog);
  modelCatalog.status = "APPROVED";
  modelCatalog.contract_state = "APPROVED_NORMATIVE";
  modelCatalog.effective_at = "2026-08-31T17:00:00Z";
  modelCatalog.expires_at = "2026-11-30T17:00:00Z";
  modelCatalog.allowlist_active = true;
  modelCatalog.d004_decision_digest = digest("1");
  modelCatalog.d005_decision_digest = digest("2");
  modelCatalog.d014_budget_decision_digest = digest("3");
  modelCatalog.entries = [
    {
      route_id: "SYNTHETIC_ROUTE_1",
      model_id: "synthetic/model-v1",
      model_revision: "synthetic-model-2026-08-31",
      provider_id: "synthetic-provider",
      provider_endpoint_id: "SYNTHETIC_ENDPOINT_1",
      provider_policy_id: "SYNTHETIC_POLICY_1",
      capabilities: ["TEXT", "STRUCTURED_OUTPUT"],
      context_window_tokens: 32000,
      maximum_output_tokens: 4096,
      supported_classifications: ["INTERNAL"],
      processing_regions: ["TEST_REGION"],
      data_handling: {
        zdr_enforced: false,
        prompt_training_allowed: false,
        response_training_allowed: false,
        maximum_provider_retention_seconds: 0,
        terms_checked_at: "2026-08-31T17:00:00Z",
        terms_evidence: catalogEvidence("terms"),
      },
      price: {
        currency: "USD",
        input_micro_units_per_million_tokens: 1000,
        output_micro_units_per_million_tokens: 2000,
        source_checked_at: "2026-08-31T17:00:00Z",
        source_evidence: catalogEvidence("price"),
        d014_budget_binding_required: true,
      },
      lifecycle: {
        status: "ACTIVE",
        available_from: "2026-08-31T17:00:00Z",
        review_at: "2026-09-30T17:00:00Z",
        retire_at: null,
      },
      evidence_refs: [catalogEvidence("route")],
    },
  ];

  const taskPolicy = structuredClone(candidateContracts.taskPolicy);
  taskPolicy.status = "APPROVED";
  taskPolicy.contract_state = "APPROVED_NORMATIVE";
  taskPolicy.policy_activation_allowed = true;
  taskPolicy.d004_decision_digest = digest("1");
  taskPolicy.d005_decision_digest = digest("2");
  taskPolicy.d014_budget_decision_digest = digest("3");
  taskPolicy.policies = [
    {
      policy_id: "ALIGNMENT_INTERNAL_V1",
      task_class: "ALIGNMENT_REFINEMENT",
      classification: "INTERNAL",
      allowed_route_ids: ["SYNTHETIC_ROUTE_1"],
      required_capabilities: ["TEXT", "STRUCTURED_OUTPUT"],
      prompt_policy_id: "PROMPT_POLICY_1",
      prompt_policy_digest: digest("4"),
      evaluation_suite_id: "EVAL_SUITE_1",
      evaluation_suite_digest: digest("5"),
      minimum_quality_score_basis_points: 7000,
      maximum_input_tokens: 16000,
      maximum_output_tokens: 2048,
      maximum_cost_micro_usd: 10000,
      fallback_equivalence_group_ids: [],
      restricted_evidence_contract_id: null,
      exception_policy: "NONE",
    },
  ];

  return {
    modelCatalog,
    taskPolicy,
    fallbackEquivalence: structuredClone(candidateContracts.fallbackEquivalence),
    restrictedEvidence: structuredClone(candidateContracts.restrictedEvidence),
  };
}

function approveDataPolicy() {
  const contracts = approvedPolicyContracts();
  const record = structuredClone(dataPolicy);
  record.status = "DECIDED";
  record.contract_state = "DECIDED_NORMATIVE";
  record.decision_outcome = "APPROVED";
  Object.assign(record.material_options, {
    classification_profile: { ...record.material_options.classification_profile, selected: "EXACT_TASK_CLASSIFICATION_ROUTE_MATRIX" },
    restricted_profile: { ...record.material_options.restricted_profile, selected: "DENY_ALL_RESTRICTED" },
    fallback_profile: { ...record.material_options.fallback_profile, selected: "NO_FALLBACK" },
    evaluation_profile: { ...record.material_options.evaluation_profile, selected: "TASK_SPECIFIC_VERSIONED_THRESHOLDS" },
    data_terms_profile: { ...record.material_options.data_terms_profile, selected: "ENDPOINT_SPECIFIC_EVIDENCE_SNAPSHOT" },
    exception_profile: { ...record.material_options.exception_profile, selected: "NO_EXCEPTIONS" },
    telemetry_profile: { ...record.material_options.telemetry_profile, selected: "METADATA_ONLY" },
    catalog_drift_profile: { ...record.material_options.catalog_drift_profile, selected: "FAIL_CLOSED_ON_DIGEST_CHANGE" },
  });
  record.evidence_requirements = record.evidence_requirements.map((requirement, index) => ({
    ...requirement,
    status: "PASS",
    evidence_refs: [evidenceRef(requirement.requirement_id, index)],
  }));
  record.baseline.d004_status = "DECIDED";
  record.dependencies.d004.status = "DECIDED";
  record.dependencies.d004.evidence_digest = digest("6");
  record.owners = {
    ai_governance: "AI Governance Owner",
    security: "Security Owner",
    privacy_legal: "Privacy Legal Owner",
    curve_product: "Curve Product Owner",
  };
  record.decided_at = "2026-08-31T18:00:00Z";
  record.next_review_at = "2026-11-30T18:00:00Z";
  record.last_updated = record.decided_at;
  record.activation.decision_selected = true;
  record.activation.successor_contract_preparation_authorized = true;
  record.unresolved_requirements = [];
  record.decision_payload_digest = computeModelDataPolicyDecisionDigest(record);
  record.approvals = [
    ["AI_GOVERNANCE", "AI Governance Owner"],
    ["SECURITY", "Security Owner"],
    ["PRIVACY_LEGAL", "Privacy Legal Owner"],
    ["CURVE_PRODUCT", "Curve Product Owner"],
  ].map(([role, approved_by]) => ({
    role,
    approved_by,
    approved_at: "2026-08-31T17:30:00Z",
    decision_payload_digest: record.decision_payload_digest,
  }));
  return { record, contracts };
}

test("canonical D-004 proposal is exact, unselected, and fail closed", () => {
  const result = validateModelGatewayArchitectureDecision(architecture);
  assert.equal(result.decisionReady, false);
  assert.deepEqual(result.unresolved, unresolvedModelGatewayArchitecture(architecture));
  assert.ok(Object.values(architecture.material_options).every(({ selected }) => selected === null));
  assert.equal(architecture.activation.runtime_model_calls_allowed, false);
});

test("canonical D-005 proposal and four candidate contracts are empty and fail closed", () => {
  validateModelPolicyBoundContractBytes(dataPolicy, boundBytes);
  const result = validateModelDataPolicyDecision(dataPolicy, candidateContracts);
  assert.equal(result.decisionReady, false);
  assert.deepEqual(result.unresolved, unresolvedModelDataPolicy(dataPolicy, candidateContracts));
  assert.equal(candidateContracts.modelCatalog.entries.length, 0);
  assert.equal(candidateContracts.taskPolicy.policies.length, 0);
  assert.equal(candidateContracts.fallbackEquivalence.groups.length, 0);
  assert.equal(candidateContracts.restrictedEvidence.approved_route_ids.length, 0);
  assert.equal(dataPolicy.activation.runtime_model_calls_allowed, false);
});

test("candidate recommendation remains one alternative and is not selected", () => {
  assert.deepEqual(architecture.material_options.attempt_routing_profile.options, D004_OPTION_CATALOG.attempt_routing_profile);
  assert.equal(
    architecture.material_options.attempt_routing_profile.options.includes("SINGLE_EXACT_ROUTE_NEW_AUDITED_FALLBACK_ATTEMPT"),
    true,
  );
  assert.equal(architecture.material_options.attempt_routing_profile.selected, null);
  assert.deepEqual(dataPolicy.material_options.fallback_profile.options, D005_OPTION_CATALOG.fallback_profile);
  assert.equal(dataPolicy.material_options.fallback_profile.selected, null);
});

test("a complete D-004 decision authorizes only successor contract preparation", () => {
  const record = approveArchitecture();
  assert.deepEqual(validateModelGatewayArchitectureDecision(record), { decisionReady: true, unresolved: [] });
  assert.equal(record.activation.implementation_dispatch_allowed, false);
  assert.equal(record.activation.provider_network_allowed, false);
});

test("a complete synthetic D-005 decision can approve a no-fallback INTERNAL policy only", () => {
  const { record, contracts } = approveDataPolicy();
  assert.deepEqual(validateModelDataPolicyDecision(record, contracts), { decisionReady: true, unresolved: [] });
  assert.equal(record.material_options.restricted_profile.selected, "DENY_ALL_RESTRICTED");
  assert.equal(record.material_options.fallback_profile.selected, "NO_FALLBACK");
  assert.equal(record.activation.restricted_model_calls_allowed, false);
});

test("D-005 cannot be approved before a digest-bound decided D-004", () => {
  const { record, contracts } = approveDataPolicy();
  record.baseline.d004_status = "PROPOSED";
  assert.throws(() => validateModelDataPolicyDecision(record, contracts), /decided D-004/);
});

test("raw-byte contract drift invalidates the D-005 candidate bindings", () => {
  const changed = { ...boundBytes };
  const path = dataPolicy.candidate_contracts[0].path;
  changed[path] = Buffer.concat([changed[path], Buffer.from("\n")]);
  assert.throws(() => validateModelPolicyBoundContractBytes(dataPolicy, changed), /digest mismatch/);
});

test("semantic activation and route-broadening mutations fail closed", () => {
  const mutations = [
    () => {
      const record = structuredClone(architecture);
      record.fixed_invariants.provider_defaults_allowed = true;
      return () => validateModelGatewayArchitectureDecision(record);
    },
    () => {
      const record = structuredClone(architecture);
      record.activation.runtime_model_calls_allowed = true;
      return () => validateModelGatewayArchitectureDecision(record);
    },
    () => {
      const record = structuredClone(dataPolicy);
      record.fixed_invariants.floating_model_alias_allowed = true;
      return () => validateModelDataPolicyDecision(record, candidateContracts);
    },
    () => {
      const catalog = structuredClone(candidateContracts.modelCatalog);
      catalog.allowlist_active = true;
      return () => validateModelCatalog(catalog);
    },
    () => {
      const matrix = structuredClone(candidateContracts.taskPolicy);
      matrix.policy_activation_allowed = true;
      return () => validateTaskModelPolicyMatrix(matrix, candidateContracts.modelCatalog);
    },
    () => {
      const fallback = structuredClone(candidateContracts.fallbackEquivalence);
      fallback.fallback_activation_allowed = true;
      return () => validateFallbackEquivalence(fallback, candidateContracts.modelCatalog);
    },
    () => {
      const restricted = structuredClone(candidateContracts.restrictedEvidence);
      restricted.restricted_route_activation_allowed = true;
      return () => validateRestrictedRouteEvidence(restricted, candidateContracts.modelCatalog);
    },
  ];
  for (const makeMutation of mutations) assert.throws(makeMutation());
});

test("task policy, fallback, and RESTRICTED evidence cannot reference unknown routes", () => {
  const contracts = approvedPolicyContracts();
  contracts.taskPolicy.policies[0].allowed_route_ids = ["UNKNOWN_ROUTE"];
  assert.throws(() => validateTaskModelPolicyMatrix(contracts.taskPolicy, contracts.modelCatalog), /unknown route/);

  const fallback = structuredClone(candidateContracts.fallbackEquivalence);
  fallback.status = "APPROVED";
  fallback.routing_profile = "SINGLE_EXACT_ROUTE_NEW_AUDITED_FALLBACK_ATTEMPT";
  fallback.groups = [{
    group_id: "UNKNOWN_GROUP",
    task_class: "ALIGNMENT_REFINEMENT",
    classification: "INTERNAL",
    primary_route_id: "UNKNOWN_ROUTE",
    fallback_route_ids: ["ALSO_UNKNOWN"],
    allowed_trigger_codes: ["TRANSIENT"],
    new_attempt_required: true,
    actual_route_evidence_required: true,
    dimensions: Object.fromEntries(
      ["quality", "capability", "data_handling", "residency", "security", "context", "latency", "cost"].map((key) => [
        key,
        { status: "PASS", evidence_refs: [catalogEvidence(key)] },
      ]),
    ),
    valid_until: "2026-11-30T18:00:00Z",
  }];
  assert.throws(() => validateFallbackEquivalence(fallback, contracts.modelCatalog), /unknown route/);

  const restricted = structuredClone(candidateContracts.restrictedEvidence);
  restricted.route_evidence = [{ route_id: "UNKNOWN_ROUTE", classification: "RESTRICTED", evidence: [], complete: false, approved_by: null, approved_at: null }];
  assert.throws(() => validateRestrictedRouteEvidence(restricted, contracts.modelCatalog), /unknown route|closed candidate set/);
});

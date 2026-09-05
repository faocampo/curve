import { createHash } from "node:crypto";

export const D004_OPTION_CATALOG = Object.freeze({
  component_boundary: ["IN_PROCESS_CURVE_GATEWAY", "DEDICATED_CURVE_GATEWAY_SERVICE", "DEFER"],
  transport_profile: ["OPENROUTER_HTTP_V1", "OPENROUTER_OFFICIAL_SDK_V1", "PROVIDER_NEUTRAL_OTHER", "DEFER"],
  attempt_routing_profile: ["SINGLE_EXACT_ROUTE_NEW_AUDITED_FALLBACK_ATTEMPT", "IMMUTABLE_EQUIVALENT_ROUTE_ENVELOPE", "DEFER"],
  streaming_profile: ["BUFFERED_ONLY", "NORMALIZED_STREAM_EVENTS", "DEFER"],
  reconciliation_profile: ["PROVIDER_REQUEST_ID_AND_USAGE", "FAIL_AMBIGUOUS_NO_RETRY", "DEFER"],
  deployment_profile: ["API_PROCESS", "DEDICATED_WORKER_PROCESS", "DEDICATED_SERVICE", "DEFER"],
  telemetry_profile: ["METADATA_ONLY_OTEL", "PROTECTED_TRACE_STORE", "DEFER"],
  replacement_profile: ["MODEL_GATEWAY_PORT_CONFORMANCE", "DEFER"],
});

export const D005_OPTION_CATALOG = Object.freeze({
  classification_profile: ["EXACT_TASK_CLASSIFICATION_ROUTE_MATRIX", "DEFER"],
  restricted_profile: ["DENY_ALL_RESTRICTED", "ZDR_DLP_RESIDENCY_EVIDENCE", "DEFER"],
  fallback_profile: ["SINGLE_ROUTE_NEW_AUDITED_ATTEMPT", "EQUIVALENT_ROUTE_ENVELOPE", "NO_FALLBACK", "DEFER"],
  evaluation_profile: ["TASK_SPECIFIC_VERSIONED_THRESHOLDS", "DEFER"],
  data_terms_profile: ["ENDPOINT_SPECIFIC_EVIDENCE_SNAPSHOT", "DEFER"],
  exception_profile: ["NO_EXCEPTIONS", "TIME_BOUND_HUMAN_APPROVED", "DEFER"],
  telemetry_profile: ["METADATA_ONLY", "PROTECTED_TRACE_DESTINATION", "DEFER"],
  catalog_drift_profile: ["FAIL_CLOSED_ON_DIGEST_CHANGE", "DEFER"],
});

export const D004_EVIDENCE_IDS = Object.freeze([
  "ACTUAL_ROUTE_USAGE",
  "AUTH_KEY_LIFECYCLE",
  "BUDGET_PORT_D014_BINDING",
  "HA_KILL_SWITCH",
  "LICENSE_SUPPLY_CHAIN",
  "OPENROUTER_API_PROFILE",
  "RATE_LIMIT_RETRY_TIMEOUT",
  "REPLACEMENT_CONFORMANCE",
  "REQUEST_STREAM_CANCEL",
  "TELEMETRY_REDACTION",
]);

export const D005_EVIDENCE_IDS = Object.freeze([
  "ACTUAL_ROUTE_ATTESTATION",
  "D009_RETENTION_BINDING",
  "D014_BUDGET_BINDING",
  "FALLBACK_EQUIVALENCE",
  "MODEL_CATALOG_SNAPSHOT",
  "PRE_AND_POST_CALL_DLP",
  "PROVIDER_TERMS",
  "RED_TEAM",
  "REGION_RESIDENCY",
  "RETENTION_AND_TRAINING",
  "TASK_EVALUATION",
  "TELEMETRY_DESTINATION",
  "ZERO_DATA_RETENTION",
]);

export const RESTRICTED_EVIDENCE_TYPES = Object.freeze([
  "ACTUAL_ROUTE_ATTESTATION",
  "POST_CALL_LEAK_SCAN",
  "PRE_CALL_DLP",
  "PRIVACY_LEGAL_APPROVAL",
  "PROCESSING_RESIDENCY",
  "RETENTION_AND_TRAINING_TERMS",
  "TELEMETRY_DESTINATION",
  "ZERO_DATA_RETENTION",
]);

const D004_APPROVAL_ROLES = Object.freeze(["AI_PLATFORM", "FINOPS", "PLATFORM_OPERATIONS", "SECURITY"]);
const D005_APPROVAL_ROLES = Object.freeze(["AI_GOVERNANCE", "CURVE_PRODUCT", "PRIVACY_LEGAL", "SECURITY"]);
const MODEL_CONTRACT_IDS = Object.freeze([
  "FALLBACK_EQUIVALENCE",
  "MODEL_CATALOG",
  "RESTRICTED_ROUTE_EVIDENCE",
  "TASK_MODEL_POLICY_MATRIX",
]);
const MODEL_CONTRACT_COORDINATES = Object.freeze({
  FALLBACK_EQUIVALENCE: {
    path: "contracts/models/m0-s9c1a-fallback-equivalence-v1.json",
    schema_id: "https://curve.example.invalid/contracts/schemas/fallback-equivalence.schema.json",
  },
  MODEL_CATALOG: {
    path: "contracts/models/m0-s9c1a-model-catalog-v1.json",
    schema_id: "https://curve.example.invalid/contracts/schemas/model-catalog.schema.json",
  },
  RESTRICTED_ROUTE_EVIDENCE: {
    path: "contracts/models/m0-s9c1a-restricted-route-evidence-v1.json",
    schema_id: "https://curve.example.invalid/contracts/schemas/restricted-route-evidence.schema.json",
  },
  TASK_MODEL_POLICY_MATRIX: {
    path: "contracts/models/m0-s9c1a-task-model-policy-v1.json",
    schema_id: "https://curve.example.invalid/contracts/schemas/task-model-policy-matrix.schema.json",
  },
});

const EXPECTED_D004_OPERATIONS = Object.freeze(["CANCEL", "COUNT_TOKENS", "GENERATE", "REPORT_USAGE", "STREAM"]);
const EXPECTED_D004_REQUEST_BINDINGS = Object.freeze([
  "BUDGET_POLICY_VERSION",
  "CLASSIFICATION",
  "CONTEXT_DIGEST",
  "DEADLINE",
  "IDEMPOTENCY_DIGEST",
  "MAXIMUM_INPUT_TOKENS",
  "MAXIMUM_OUTPUT_TOKENS",
  "MODEL_CATALOG_DIGEST",
  "MODEL_CATALOG_VERSION",
  "OPERATION_ID",
  "POLICY_DIGEST",
  "POLICY_VERSION",
  "PROMPT_PACKAGE_DIGEST",
  "TASK_CLASS",
  "WORKSPACE_ID",
]);
const EXPECTED_D004_RESULT_BINDINGS = Object.freeze([
  "ACTUAL_ENDPOINT_ID",
  "ACTUAL_MODEL_ID",
  "ACTUAL_PROVIDER_ID",
  "COST_MICRO_USD",
  "ERROR_CODE",
  "INVOCATION_ID",
  "REQUESTED_ROUTE_ID",
  "RESPONSE_DIGEST",
  "STATUS",
  "TOKEN_USAGE",
]);
const EXPECTED_D004_ERRORS = Object.freeze([
  "AMBIGUOUS_RESULT",
  "AUTHENTICATION",
  "AUTHORIZATION",
  "BUDGET_EXHAUSTED",
  "CANCELLED",
  "CAPABILITY_UNSUPPORTED",
  "DATA_CLASSIFICATION",
  "NO_ELIGIBLE_ROUTE",
  "POLICY",
  "RATE_LIMIT",
  "TERMINAL",
  "TIMEOUT",
  "TRANSIENT",
  "USAGE_UNSETTLED",
  "VALIDATION",
]);

const EXPECTED_D004_FIXED_INVARIANTS = Object.freeze({
  curve_policy_precedes_transport: true,
  caller_selects_route: false,
  provider_defaults_allowed: false,
  silent_model_or_provider_substitution: false,
  actual_route_evidence_required: true,
  ambiguous_charge_retried_automatically: false,
  raw_body_in_ordinary_telemetry: false,
  credential_in_agent_or_temporal_history: false,
  unknown_error_retryable: false,
  workspace_scope_required: true,
});

const EXPECTED_D005_FIXED_INVARIANTS = Object.freeze({
  unknown_classification_normalizes_to_restricted: true,
  empty_allowlist_denies: true,
  floating_model_alias_allowed: false,
  provider_default_routing_allowed: false,
  silent_fallback_allowed: false,
  actual_route_evidence_required: true,
  restricted_requires_route_evidence: true,
  route_policy_immutable_per_attempt: true,
  changed_route_creates_new_attempt: true,
  budget_failure_changes_route: false,
  protected_body_persistence_allowed: false,
});

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function digestBytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assertExactUnique(actual, expected, label) {
  if (!Array.isArray(actual)) throw new Error(`${label} must be an array`);
  const sorted = [...actual].sort();
  if (new Set(sorted).size !== sorted.length || JSON.stringify(sorted) !== JSON.stringify([...expected].sort())) {
    throw new Error(`${label} differs from its closed candidate set`);
  }
}

function assertOptionCatalog(materialOptions, expectedCatalog, label) {
  assertExactUnique(Object.keys(materialOptions ?? {}), Object.keys(expectedCatalog), `${label} option keys`);
  for (const [key, expected] of Object.entries(expectedCatalog)) {
    const option = materialOptions[key];
    assertExactUnique(option?.options, expected, `${label}.${key}.options`);
    if (option.selected !== null && !expected.includes(option.selected)) {
      throw new Error(`${label}.${key}.selected is outside its catalog`);
    }
  }
}

function assertExactObject(actual, expected, label) {
  if (JSON.stringify(canonicalJson(actual)) !== JSON.stringify(canonicalJson(expected))) {
    throw new Error(`${label} differs from the closed fail-closed contract`);
  }
}

function assertEvidenceRequirements(requirements, expectedIds, label) {
  assertExactUnique(requirements?.map(({ requirement_id }) => requirement_id), expectedIds, `${label} evidence IDs`);
  for (const requirement of requirements) {
    if (requirement.status === "PASS" && requirement.evidence_refs.length === 0) {
      throw new Error(`${label}.${requirement.requirement_id} PASS requires evidence`);
    }
    if (requirement.status === "NOT_PROVIDED" && requirement.evidence_refs.length !== 0) {
      throw new Error(`${label}.${requirement.requirement_id} NOT_PROVIDED cannot carry evidence`);
    }
  }
}

function approvalsComplete(record, expectedRoles) {
  const approvals = record.approvals ?? [];
  try {
    assertExactUnique(approvals.map(({ role }) => role), expectedRoles, `${record.decision_id} approvals`);
  } catch {
    return false;
  }
  return approvals.every(({ approved_by, approved_at, decision_payload_digest }) => approved_by && approved_at && decision_payload_digest);
}

function evidenceComplete(record) {
  return record.evidence_requirements.every(({ status, evidence_refs }) => status === "PASS" && evidence_refs.length > 0);
}

function decisionPayload(record, namespace) {
  const {
    approvals: _approvals,
    activation: _activation,
    status: _status,
    decision_outcome: _decisionOutcome,
    unresolved_requirements: _unresolvedRequirements,
    decision_payload_digest: _decisionPayloadDigest,
    ...payload
  } = record;
  return `sha256:${createHash("sha256")
    .update(`${namespace}\0`)
    .update(JSON.stringify(canonicalJson(payload)))
    .digest("hex")}`;
}

export function computeModelGatewayArchitectureDecisionDigest(record) {
  return decisionPayload(record, "curve-model-gateway-architecture-decision:v1");
}

export function computeModelDataPolicyDecisionDigest(record) {
  return decisionPayload(record, "curve-model-data-policy-decision:v1");
}

export function unresolvedModelGatewayArchitecture(record) {
  const unresolved = [];
  for (const key of Object.keys(D004_OPTION_CATALOG)) {
    if (!record.material_options?.[key]?.selected) unresolved.push(key.toUpperCase());
  }
  if (record.decision_outcome !== "DEFERRED" && !evidenceComplete(record)) {
    unresolved.push("EVIDENCE_REQUIREMENTS");
  }
  if (!record.owners?.ai_platform) unresolved.push("AI_PLATFORM_OWNER");
  if (!record.owners?.platform_operations) unresolved.push("PLATFORM_OPERATIONS_OWNER");
  if (!record.owners?.security) unresolved.push("SECURITY_OWNER");
  if (!record.owners?.finops) unresolved.push("FINOPS_OWNER");
  if (!approvalsComplete(record, D004_APPROVAL_ROLES)) unresolved.push("APPROVALS");
  return unresolved.sort();
}

export function unresolvedModelDataPolicy(record, contracts) {
  const unresolved = [];
  for (const key of Object.keys(D005_OPTION_CATALOG)) {
    if (!record.material_options?.[key]?.selected) unresolved.push(key.toUpperCase());
  }
  if (record.decision_outcome !== "DEFERRED" && !evidenceComplete(record)) {
    unresolved.push("EVIDENCE_REQUIREMENTS");
  }
  if (!record.owners?.ai_governance) unresolved.push("AI_GOVERNANCE_OWNER");
  if (!record.owners?.security) unresolved.push("SECURITY_OWNER");
  if (!record.owners?.privacy_legal) unresolved.push("PRIVACY_LEGAL_OWNER");
  if (!record.owners?.curve_product) unresolved.push("CURVE_PRODUCT_OWNER");
  if (!approvalsComplete(record, D005_APPROVAL_ROLES)) unresolved.push("APPROVALS");
  if (record.decision_outcome !== "DEFERRED") {
    if ((contracts?.modelCatalog?.entries ?? []).length === 0) unresolved.push("MODEL_CATALOG_ENTRIES");
    if ((contracts?.taskPolicy?.policies ?? []).length === 0) unresolved.push("TASK_MODEL_POLICIES");
    if (
      record.material_options?.fallback_profile?.selected !== "NO_FALLBACK" &&
      (contracts?.fallbackEquivalence?.groups ?? []).length === 0
    ) {
      unresolved.push("FALLBACK_EQUIVALENCE_GROUPS");
    }
    if (
      record.material_options?.restricted_profile?.selected !== "DENY_ALL_RESTRICTED" &&
      (contracts?.restrictedEvidence?.approved_route_ids ?? []).length === 0
    ) {
      unresolved.push("RESTRICTED_ROUTE_EVIDENCE");
    }
  }
  return unresolved.sort();
}

function assertRecordedUnresolved(record, expected) {
  const recorded = [...(record.unresolved_requirements ?? [])].sort();
  if (new Set(recorded).size !== recorded.length || JSON.stringify(recorded) !== JSON.stringify(expected)) {
    throw new Error(`${record.decision_id} unresolved_requirements differs from computed gaps`);
  }
}

function assertDecisionLifecycle(record, expectedRoles, computedUnresolved, digestFunction) {
  assertRecordedUnresolved(record, computedUnresolved);
  const activation = record.activation ?? {};
  if (activation.implementation_dispatch_allowed || activation.runtime_model_calls_allowed) {
    throw new Error(`${record.decision_id} candidate decision cannot authorize implementation or model calls`);
  }
  if (record.status === "PROPOSED") {
    if (
      record.contract_state !== "PROPOSED_NOT_NORMATIVE" ||
      record.decision_outcome !== "UNSELECTED" ||
      record.decision_payload_digest !== null
    ) {
      throw new Error(`${record.decision_id} proposal must remain unselected and undigested`);
    }
    if (record.approvals.length !== 0 || record.decided_at !== null || record.next_review_at !== null) {
      throw new Error(`${record.decision_id} proposal cannot carry approvals or decision chronology`);
    }
    if (Object.values(record.material_options).some(({ selected }) => selected !== null)) {
      throw new Error(`${record.decision_id} proposal cannot select a material option`);
    }
    if (activation.decision_selected || activation.successor_contract_preparation_authorized) {
      throw new Error(`${record.decision_id} proposal cannot activate successor preparation`);
    }
    return { decisionReady: false, unresolved: computedUnresolved };
  }

  if (record.contract_state !== "DECIDED_NORMATIVE") {
    throw new Error(`${record.decision_id} decided record must be explicitly normative`);
  }
  if (computedUnresolved.length > 0) throw new Error(`${record.decision_id} decided record has unresolved requirements`);
  assertExactUnique(record.approvals.map(({ role }) => role), expectedRoles, `${record.decision_id} approvals`);
  if (!record.decided_at || !record.next_review_at || Date.parse(record.next_review_at) <= Date.parse(record.decided_at)) {
    throw new Error(`${record.decision_id} decision chronology is invalid`);
  }
  if (Date.parse(record.last_updated) < Date.parse(record.decided_at)) {
    throw new Error(`${record.decision_id} last_updated precedes decided_at`);
  }
  const digest = digestFunction(record);
  if (record.decision_payload_digest !== digest) throw new Error(`${record.decision_id} decision digest is invalid`);
  for (const approval of record.approvals) {
    if (approval.decision_payload_digest !== digest || Date.parse(approval.approved_at) > Date.parse(record.decided_at)) {
      throw new Error(`${record.decision_id} approval is not bound before the decision`);
    }
  }
  if (!activation.decision_selected) throw new Error(`${record.decision_id} decided record must select the decision`);

  const selected = Object.values(record.material_options).map(({ selected: value }) => value);
  if (record.decision_outcome === "DEFERRED") {
    if (selected.some((value) => value !== "DEFER") || activation.successor_contract_preparation_authorized) {
      throw new Error(`${record.decision_id} deferred outcome must select only DEFER and disable successors`);
    }
    return { decisionReady: false, unresolved: [] };
  }
  if (selected.some((value) => value === "DEFER" || value === null)) {
    throw new Error(`${record.decision_id} approved outcome cannot contain DEFER or null`);
  }
  if (!activation.successor_contract_preparation_authorized) {
    throw new Error(`${record.decision_id} approved outcome must authorize only successor preparation`);
  }
  return { decisionReady: true, unresolved: [] };
}

export function validateModelGatewayArchitectureDecision(record) {
  if (record.schema_version !== "curve.model-gateway-architecture-decision/v1" || record.decision_id !== "D-004") {
    throw new Error("D-004 identity or schema version is invalid");
  }
  assertExactObject(record.fixed_invariants, EXPECTED_D004_FIXED_INVARIANTS, "D-004 fixed invariants");
  assertOptionCatalog(record.material_options, D004_OPTION_CATALOG, "D-004");
  assertEvidenceRequirements(record.evidence_requirements, D004_EVIDENCE_IDS, "D-004");
  assertExactUnique(record.interface_contract?.operations, EXPECTED_D004_OPERATIONS, "D-004 operations");
  assertExactUnique(record.interface_contract?.required_request_bindings, EXPECTED_D004_REQUEST_BINDINGS, "D-004 request bindings");
  assertExactUnique(record.interface_contract?.safe_result_bindings, EXPECTED_D004_RESULT_BINDINGS, "D-004 safe result bindings");
  assertExactUnique(record.interface_contract?.normalized_errors, EXPECTED_D004_ERRORS, "D-004 normalized errors");
  if (
    record.dependencies?.d005?.decision_id !== "D-005" ||
    record.dependencies.d005.required_before !== "CHARGEABLE_INVOCATION" ||
    record.dependencies?.d014?.decision_id !== "D-014" ||
    record.dependencies.d014.required_before !== "CHARGEABLE_INVOCATION" ||
    record.dependencies?.d009?.decision_id !== "D-009" ||
    record.dependencies.d009.required_before !== "PROTECTED_BODY_PERSISTENCE"
  ) {
    throw new Error("D-004 dependency boundary is invalid");
  }
  return assertDecisionLifecycle(
    record,
    D004_APPROVAL_ROLES,
    unresolvedModelGatewayArchitecture(record),
    computeModelGatewayArchitectureDecisionDigest,
  );
}

export function validateModelCatalog(catalog) {
  const routeIds = catalog.entries.map(({ route_id }) => route_id);
  if (new Set(routeIds).size !== routeIds.length) throw new Error("model catalog route IDs must be unique");
  if (catalog.status === "DRAFT") {
    if (
      catalog.contract_state !== "PROPOSED_NOT_NORMATIVE" ||
      catalog.allowlist_active ||
      catalog.effective_at !== null ||
      catalog.entries.length !== 0
    ) {
      throw new Error("draft candidate model catalog must remain an empty inactive allowlist");
    }
    if (catalog.d004_decision_digest || catalog.d005_decision_digest || catalog.d014_budget_decision_digest) {
      throw new Error("draft candidate model catalog cannot bind approved decisions");
    }
  }
  if (catalog.allowlist_active) {
    if (
      catalog.contract_state !== "APPROVED_NORMATIVE" ||
      catalog.status !== "APPROVED" ||
      catalog.entries.length === 0 ||
      !catalog.effective_at
    ) {
      throw new Error("active model catalog must be approved, effective, and non-empty");
    }
    if (!catalog.d004_decision_digest || !catalog.d005_decision_digest || !catalog.d014_budget_decision_digest) {
      throw new Error("active model catalog requires D-004, D-005, and D-014 bindings");
    }
  }
  return true;
}

export function validateTaskModelPolicyMatrix(matrix, modelCatalog) {
  const policyKeys = matrix.policies.map(({ task_class, classification }) => `${task_class}:${classification}`);
  if (new Set(policyKeys).size !== policyKeys.length) throw new Error("task-model policy rows must be unique by task and classification");
  if (matrix.catalog_id !== modelCatalog.catalog_id || matrix.catalog_version !== modelCatalog.catalog_version) {
    throw new Error("task-model policy matrix catalog coordinate is stale");
  }
  const routes = new Map(modelCatalog.entries.map((entry) => [entry.route_id, entry]));
  for (const policy of matrix.policies) {
    for (const routeId of policy.allowed_route_ids) {
      const route = routes.get(routeId);
      if (!route) throw new Error(`task policy references unknown route ${routeId}`);
      if (!route.supported_classifications.includes(policy.classification)) {
        throw new Error(`route ${routeId} does not allow ${policy.classification}`);
      }
      if (policy.required_capabilities.some((capability) => !route.capabilities.includes(capability))) {
        throw new Error(`route ${routeId} lacks a required capability`);
      }
      if (policy.maximum_input_tokens > route.context_window_tokens || policy.maximum_output_tokens > route.maximum_output_tokens) {
        throw new Error(`task policy exceeds route ${routeId} token limits`);
      }
    }
    if (policy.classification === "RESTRICTED" && !policy.restricted_evidence_contract_id) {
      throw new Error("RESTRICTED task policy requires a restricted evidence contract");
    }
  }
  if (matrix.status === "DRAFT" && (matrix.policy_activation_allowed || matrix.policies.length !== 0)) {
    throw new Error("draft candidate task-model matrix must remain empty and inactive");
  }
  if (matrix.status === "DRAFT" && matrix.contract_state !== "PROPOSED_NOT_NORMATIVE") {
    throw new Error("draft candidate task-model matrix must remain non-normative");
  }
  if (matrix.policy_activation_allowed) {
    if (
      matrix.contract_state !== "APPROVED_NORMATIVE" ||
      matrix.status !== "APPROVED" ||
      !matrix.d004_decision_digest ||
      !matrix.d005_decision_digest ||
      !matrix.d014_budget_decision_digest
    ) {
      throw new Error("active task-model policy requires D-004, D-005, and D-014 bindings");
    }
  }
  return true;
}

export function validateFallbackEquivalence(contract, modelCatalog) {
  const routeIds = new Set(modelCatalog.entries.map(({ route_id }) => route_id));
  const groupIds = contract.groups.map(({ group_id }) => group_id);
  if (new Set(groupIds).size !== groupIds.length) throw new Error("fallback group IDs must be unique");
  for (const group of contract.groups) {
    if (!routeIds.has(group.primary_route_id) || group.fallback_route_ids.some((routeId) => !routeIds.has(routeId))) {
      throw new Error(`fallback group ${group.group_id} references an unknown route`);
    }
    if (group.fallback_route_ids.includes(group.primary_route_id)) {
      throw new Error(`fallback group ${group.group_id} repeats its primary route`);
    }
    for (const [dimension, result] of Object.entries(group.dimensions)) {
      if (result.status !== "PASS" || result.evidence_refs.length === 0) {
        throw new Error(`fallback group ${group.group_id} has incomplete ${dimension} evidence`);
      }
    }
    if (
      contract.routing_profile === "SINGLE_EXACT_ROUTE_NEW_AUDITED_FALLBACK_ATTEMPT" &&
      group.new_attempt_required !== true
    ) {
      throw new Error("single-route fallback profile requires a new audited attempt");
    }
  }
  if (contract.status === "DRAFT") {
    if (
      contract.contract_state !== "PROPOSED_NOT_NORMATIVE" ||
      contract.routing_profile !== "UNSELECTED" ||
      contract.groups.length !== 0 ||
      contract.fallback_activation_allowed
    ) {
      throw new Error("draft fallback contract must remain unselected, empty, and inactive");
    }
  }
  if (contract.fallback_activation_allowed) {
    if (
      contract.contract_state !== "APPROVED_NORMATIVE" ||
      contract.status !== "APPROVED" ||
      contract.groups.length === 0 ||
      !contract.d004_decision_digest ||
      !contract.d005_decision_digest ||
      !contract.d014_budget_decision_digest
    ) {
      throw new Error("active fallback requires approved groups and D-004, D-005, and D-014 bindings");
    }
  }
  return true;
}

export function validateRestrictedRouteEvidence(contract, modelCatalog) {
  assertExactUnique(contract.required_evidence_types, RESTRICTED_EVIDENCE_TYPES, "restricted evidence types");
  const catalogRoutes = new Set(modelCatalog.entries.map(({ route_id }) => route_id));
  const routeEvidence = new Map();
  for (const record of contract.route_evidence) {
    if (routeEvidence.has(record.route_id)) throw new Error(`duplicate restricted evidence for ${record.route_id}`);
    if (!catalogRoutes.has(record.route_id)) throw new Error(`restricted evidence references unknown route ${record.route_id}`);
    assertExactUnique(record.evidence.map(({ evidence_type }) => evidence_type), RESTRICTED_EVIDENCE_TYPES, `${record.route_id} restricted evidence`);
    if (record.evidence.some((evidence) => evidence.subject_route_id !== record.route_id || evidence.status !== "PASS")) {
      throw new Error(`restricted evidence for ${record.route_id} is not route-bound and passing`);
    }
    if (record.complete && (!record.approved_by || !record.approved_at)) {
      throw new Error(`complete restricted evidence for ${record.route_id} lacks human approval`);
    }
    routeEvidence.set(record.route_id, record);
  }
  for (const routeId of contract.approved_route_ids) {
    if (!routeEvidence.get(routeId)?.complete) throw new Error(`approved RESTRICTED route ${routeId} lacks complete evidence`);
  }
  if (contract.status === "DRAFT") {
    if (
      contract.contract_state !== "PROPOSED_NOT_NORMATIVE" ||
      contract.route_evidence.length !== 0 ||
      contract.approved_route_ids.length !== 0 ||
      contract.restricted_route_activation_allowed
    ) {
      throw new Error("draft restricted-route contract must remain empty and inactive");
    }
  }
  if (contract.restricted_route_activation_allowed) {
    if (
      contract.contract_state !== "APPROVED_NORMATIVE" ||
      contract.status !== "APPROVED" ||
      contract.approved_route_ids.length === 0 ||
      !contract.d005_decision_digest ||
      !contract.d009_retention_decision_digest ||
      !contract.d014_budget_decision_digest
    ) {
      throw new Error("active RESTRICTED routing requires approved routes and D-005, D-009, and D-014 bindings");
    }
  }
  return true;
}

export function validateModelPolicyBoundContractBytes(record, bytesByPath) {
  assertExactUnique(record.candidate_contracts?.map(({ contract_id }) => contract_id), MODEL_CONTRACT_IDS, "D-005 candidate contract IDs");
  for (const contract of record.candidate_contracts) {
    const expected = MODEL_CONTRACT_COORDINATES[contract.contract_id];
    if (contract.path !== expected.path || contract.schema_id !== expected.schema_id) {
      throw new Error(`candidate contract coordinate mismatch for ${contract.contract_id}`);
    }
    const bytes = bytesByPath[contract.path];
    if (!bytes) throw new Error(`missing candidate contract bytes for ${contract.path}`);
    if (digestBytes(bytes) !== contract.content_digest) {
      throw new Error(`candidate contract digest mismatch for ${contract.path}`);
    }
  }
  return true;
}

export function validateModelDataPolicyDecision(record, contracts) {
  if (record.schema_version !== "curve.model-data-policy-decision/v1" || record.decision_id !== "D-005") {
    throw new Error("D-005 identity or schema version is invalid");
  }
  assertExactObject(record.fixed_invariants, EXPECTED_D005_FIXED_INVARIANTS, "D-005 fixed invariants");
  assertOptionCatalog(record.material_options, D005_OPTION_CATALOG, "D-005");
  assertEvidenceRequirements(record.evidence_requirements, D005_EVIDENCE_IDS, "D-005");
  if (
    record.dependencies?.d004?.decision_id !== "D-004" ||
    record.dependencies.d004.required_before !== "CONTRACT_PROMOTION" ||
    record.dependencies?.d014?.decision_id !== "D-014" ||
    record.dependencies.d014.required_before !== "CHARGEABLE_INVOCATION" ||
    record.dependencies?.d009?.decision_id !== "D-009" ||
    record.dependencies.d009.required_before !== "PROTECTED_BODY_PERSISTENCE"
  ) {
    throw new Error("D-005 dependency boundary is invalid");
  }
  if (
    record.status === "DECIDED" &&
    record.decision_outcome === "APPROVED" &&
    (record.baseline.d004_status !== "DECIDED" ||
      record.dependencies.d004.status !== "DECIDED" ||
      !record.dependencies.d004.evidence_digest)
  ) {
    throw new Error("an approved D-005 decision requires a digest-bound decided D-004 dependency");
  }
  validateModelCatalog(contracts.modelCatalog);
  validateTaskModelPolicyMatrix(contracts.taskPolicy, contracts.modelCatalog);
  validateFallbackEquivalence(contracts.fallbackEquivalence, contracts.modelCatalog);
  validateRestrictedRouteEvidence(contracts.restrictedEvidence, contracts.modelCatalog);
  return assertDecisionLifecycle(
    record,
    D005_APPROVAL_ROLES,
    unresolvedModelDataPolicy(record, contracts),
    computeModelDataPolicyDecisionDigest,
  );
}

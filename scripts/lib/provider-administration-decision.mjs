import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

export const PROVIDER_ADMIN_BASELINE = Object.freeze({
  surveyed_curve_revision: "e7aa7e6ff23491cfae02379d74508822a8ded238",
  observed_plane_preview_revision: "99a73b4eab5ee21fd012d7358bc9259252d47f71",
  observed_plane_migration_head: "0007_initiative_gateassignment.py",
  plane_migration_reserved: false,
  parent_packet_version: "0.2",
  openapi_version: "1.1.0",
  core_policy_version: 2,
  core_policy_manifest_digest:
    "sha256:2895b63392236afa07e6f0572d6ddb1c91aa7f40d37282f250019d2829ed5787",
  provider_connection_schema_version: "2.0",
});

export const PROVIDER_ADMIN_FIXED_INVARIANTS = Object.freeze({
  workspace_scope: "EXACT_TARGET_WORKSPACE",
  authorization_order: "WORKSPACE_PREAUTH_BEFORE_SCOPED_SAFE_LOOKUP_THEN_RESOURCE_AUTH",
  cross_workspace_identifier_behavior: "SAME_AS_ABSENT",
  caller_supplied_workspace: "REJECT",
  caller_supplied_role: "REJECT",
  agent_authority: false,
  service_authority: false,
  system_authority: false,
  credential_resolution: false,
  provider_network_access: false,
  callback_processing: false,
  outgoing_webhooks: false,
  scheduled_reconciliation: false,
  real_adapter_activation: false,
  external_side_effect: false,
  protected_body_persistence: false,
  evidence_verification_boundary: "DIGEST_BOUND_HUMAN_ATTESTATION",
});

export const PROVIDER_ADMIN_PAGINATION = Object.freeze({
  cursor_parameter: "cursor",
  page_size_parameter: "page_size",
  minimum_page_size: 1,
  maximum_page_size: 100,
  default_page_size: 25,
  maximum_cursor_length: 4096,
  response_cursor_field: "next_cursor",
});

export const PROVIDER_ADMIN_IDEMPOTENCY_PRECONDITION_PROFILE = Object.freeze({
  request_digest: "SHA256_CANONICAL_REQUEST_BYTES",
  record_payload: "STATUS_DIGEST_RESOURCE_REF_NO_RESPONSE_BODY",
  matching_terminal_command: "RESOLVE_CURRENT_AUTHORIZED_SAFE_PROJECTION_FROM_STORED_RESOURCE_REF",
  matching_pending_operation: "RETURN_SAME_OPERATION_AND_RESUME_DURABLE_PHASE",
  replay_response_status: "ORIGINAL_STORED_STATUS",
  replay_location: "STORED_RESOURCE_REF",
  replay_response_etag: "CURRENT_RESOURCE_AGGREGATE_VERSION",
  historical_response_body: "NOT_STORED",
  unavailable_stored_resource_version: "IDEMPOTENCY_RECONCILIATION_REQUIRED_NO_EFFECT",
  changed_request_digest: "HTTP_409_NO_EFFECT",
  evaluation_order: [
    "AUTHORIZE_CURRENT_REQUEST_WITH_OPERATION_LOOKUP_SEQUENCE",
    "LOOKUP_IDEMPOTENCY_RECORD_BY_WORKSPACE_PRINCIPAL_COMMAND_AND_KEY_DIGEST",
    "REPLAY_OR_RESUME_MATCHING_REQUEST_DIGEST",
    "REJECT_CHANGED_REQUEST_DIGEST",
    "EVALUATE_IF_MATCH_FOR_NEW_COMMAND",
    "COMMIT_DOMAIN_EVENT_OUTBOX_AUDIT_AND_IDEMPOTENCY_ATOMICALLY",
  ],
  missing_if_match: "HTTP_428_NO_EFFECT",
  stale_if_match: "HTTP_412_NO_DOMAIN_OR_DELIVERY_EFFECT",
});

export const PROVIDER_ADMIN_ACCEPTED_ADAPTER_SNAPSHOT = Object.freeze({
  contract_state: "ACCEPTED_M0_S9A_BASE",
  source_schema_version: "curve.provider-registry/v1",
  source_path: "contracts/providers/m0-s9a-provider-registry-v1.json",
  source_content_digest:
    "sha256:ac9a7e854b917591f0c747d8ec55a6d051bcf6abe8680bbb341ca3763b368fbb",
  accepted_coordinates: [
    {
      provider_type: "FAKE_LOCAL",
      adapter_key: "curve.fake-local",
      adapter_version: "1.0.0",
      environment: "LOCAL",
      allowed_classifications: ["INTERNAL"],
    },
  ],
});

export const PROVIDER_ADMIN_REGISTER_REQUEST = Object.freeze({
  contract_state: "PROPOSED_NOT_NORMATIVE",
  schema_version: "curve.provider-connection-register-request/v1",
  schema_id:
    "https://curve.example.invalid/contracts/schemas/provider-connection-register-request.schema.json",
  schema_path: "contracts/schemas/provider-connection-register-request.schema.json",
  schema_content_digest:
    "sha256:2b692e7dfcace6690770d9eb85e8e392163794992dc975fb616db53427e2e597",
  additional_properties: false,
  required_fields: [
    "schema_version",
    "provider_type",
    "adapter_key",
    "adapter_version",
    "environment",
    "display_name",
    "allowed_classifications",
  ],
  allowed_fields: [
    "schema_version",
    "provider_type",
    "adapter_key",
    "adapter_version",
    "environment",
    "display_name",
    "allowed_classifications",
  ],
  blocked_fields: [
    "id",
    "workspace_id",
    "aggregate_version",
    "external_tenant_ref",
    "configuration_ref",
    "configuration_digest",
    "configuration_body",
    "secret_reference",
    "status",
    "created_by",
    "updated_by",
    "actor_roles",
  ],
  provider_type_values: [
    "FAKE_LOCAL",
    "ONYX",
    "MCP",
    "ORCA_HUMAN_ASSISTANCE",
    "MODEL_GATEWAY",
    "OPENHANDS",
    "GITHUB",
    "GITLAB",
    "QUALITY",
    "FEATURE_FLAG",
    "DOCUMENTATION",
    "MONITORING",
    "PROTOTYPE",
  ],
  environment_values: ["LOCAL", "STAGING", "PRODUCTION"],
  classification_values: ["INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
  adapter_allowlist_source: "SERVER_SIDE_PROVIDER_REGISTRY",
  caller_selected_workspace: false,
  configuration_body_allowed: false,
});

export const PROVIDER_ADMIN_RESPONSE_CONTRACTS = Object.freeze({
  PROVIDER_CONNECTION_ADMINISTRATION_V1: Object.freeze({
    contract_state: "PROPOSED_NOT_NORMATIVE",
    schema_version: "curve.provider-connection-administration/v1",
    schema_id:
      "https://curve.example.invalid/contracts/schemas/provider-connection-administration.schema.json",
    schema_path: "contracts/schemas/provider-connection-administration.schema.json",
    schema_content_digest:
      "sha256:56d085fec6167495ff9882134a243822041fde00bfde54b4c26ebfcd5babc80b",
  }),
  PROVIDER_CONNECTION_ADMINISTRATION_PAGE_V1: Object.freeze({
    contract_state: "PROPOSED_NOT_NORMATIVE",
    schema_version: "curve.provider-connection-administration-page/v1",
    schema_id:
      "https://curve.example.invalid/contracts/schemas/provider-connection-administration-page.schema.json",
    schema_path: "contracts/schemas/provider-connection-administration-page.schema.json",
    schema_content_digest:
      "sha256:75ffb001ee7b0bae1ef5ca2a3dfe9af3319fc359ec881673de0d52cbaf44e1c9",
  }),
  OPERATION_SUMMARY_V1: Object.freeze({
    contract_state: "ACCEPTED_BASE_REQUIRES_SELECTED_OPERATION_TYPE_MATERIALIZATION",
    schema_version: "1.0",
    schema_id: "https://curve.example.invalid/contracts/schemas/operation-summary.schema.json",
    schema_path: "contracts/schemas/operation-summary.schema.json",
    schema_content_digest:
      "sha256:6e33c190d6a17633b446485cd1f872ce5b051ddf049e5f615eb37927170ad50b",
    safe_fields: [
      "schema_version",
      "id",
      "workspace_id",
      "operation_type",
      "status",
      "version",
      "progress_percent",
    ],
    accepted_operation_types: [
      "FOUNDATION_PROBE",
      "WORKFLOW_COMMAND",
      "PROVIDER_RECONCILIATION",
    ],
    candidate_operation_types: [
      "PROVIDER_ADMINISTRATION",
      "PROVIDER_VALIDATION",
      "PROVIDER_RECONCILIATION",
    ],
    selected_operation_type_materialization_required: true,
  }),
});

const PROVIDER_ADMIN_OPERATION_BASES = [
  {
    operation_id: "LIST",
    kind: "QUERY",
    method: "GET",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections",
    coarse_action: "CURVE.PROVIDER_CONNECTION.LIST",
    granular_action: "CURVE.PROVIDER_CONNECTION.LIST",
    required_headers: [],
    success_status: 200,
    response_kind: "CONNECTION_PAGE",
    response_contract: "PROVIDER_CONNECTION_ADMINISTRATION_PAGE_V1",
    request_body_contract: "NONE",
    operation_type_options: {},
    precondition_resource: "NONE",
    response_etag_resource: "NONE",
    location: false,
  },
  {
    operation_id: "REGISTER",
    kind: "COMMAND",
    method: "POST",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections",
    coarse_action: "CURVE.PROVIDER_CONNECTION.REGISTER",
    granular_action: "CURVE.PROVIDER_CONNECTION.REGISTER",
    required_headers: ["Idempotency-Key"],
    success_status: 201,
    response_kind: "CONNECTION",
    response_contract: "PROVIDER_CONNECTION_ADMINISTRATION_V1",
    request_body_contract: "PROVIDER_CONNECTION_REGISTER_REQUEST_V1",
    operation_type_options: {},
    precondition_resource: "NONE",
    response_etag_resource: "PROVIDER_CONNECTION",
    location: true,
  },
  {
    operation_id: "READ",
    kind: "QUERY",
    method: "GET",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}",
    coarse_action: "CURVE.PROVIDER_CONNECTION.READ",
    granular_action: "CURVE.PROVIDER_CONNECTION.READ",
    required_headers: [],
    success_status: 200,
    response_kind: "CONNECTION",
    response_contract: "PROVIDER_CONNECTION_ADMINISTRATION_V1",
    request_body_contract: "NONE",
    operation_type_options: {},
    precondition_resource: "NONE",
    response_etag_resource: "PROVIDER_CONNECTION",
    location: false,
  },
  {
    operation_id: "VALIDATE",
    kind: "COMMAND",
    method: "POST",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:validate",
    coarse_action: "CURVE.PROVIDER_CONNECTION.ADMINISTER",
    granular_action: "CURVE.PROVIDER_CONNECTION.VALIDATE",
    required_headers: ["Idempotency-Key", "If-Match"],
    success_status: 202,
    response_kind: "OPERATION",
    response_contract: "OPERATION_SUMMARY_V1",
    request_body_contract: "NONE",
    operation_type_options: {
      SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1: "PROVIDER_ADMINISTRATION",
      DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1: "PROVIDER_VALIDATION",
    },
    precondition_resource: "PROVIDER_CONNECTION",
    response_etag_resource: "OPERATION",
    location: true,
  },
  {
    operation_id: "RECONCILE",
    kind: "COMMAND",
    method: "POST",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:reconcile",
    coarse_action: "CURVE.PROVIDER_CONNECTION.ADMINISTER",
    granular_action: "CURVE.PROVIDER_CONNECTION.RECONCILE",
    required_headers: ["Idempotency-Key", "If-Match"],
    success_status: 202,
    response_kind: "OPERATION",
    response_contract: "OPERATION_SUMMARY_V1",
    request_body_contract: "NONE",
    operation_type_options: {
      SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1: "PROVIDER_ADMINISTRATION",
      DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1: "PROVIDER_RECONCILIATION",
    },
    precondition_resource: "PROVIDER_CONNECTION",
    response_etag_resource: "OPERATION",
    location: true,
  },
  {
    operation_id: "DISABLE",
    kind: "COMMAND",
    method: "POST",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:disable",
    coarse_action: "CURVE.PROVIDER_CONNECTION.ADMINISTER",
    granular_action: "CURVE.PROVIDER_CONNECTION.DISABLE",
    required_headers: ["Idempotency-Key", "If-Match"],
    success_status: 200,
    response_kind: "CONNECTION",
    response_contract: "PROVIDER_CONNECTION_ADMINISTRATION_V1",
    request_body_contract: "NONE",
    operation_type_options: {},
    precondition_resource: "PROVIDER_CONNECTION",
    response_etag_resource: "PROVIDER_CONNECTION",
    location: false,
  },
  {
    operation_id: "ENABLE",
    kind: "COMMAND",
    method: "POST",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:enable",
    coarse_action: "CURVE.PROVIDER_CONNECTION.ADMINISTER",
    granular_action: "CURVE.PROVIDER_CONNECTION.ENABLE",
    required_headers: ["Idempotency-Key", "If-Match"],
    success_status: 200,
    response_kind: "CONNECTION",
    response_contract: "PROVIDER_CONNECTION_ADMINISTRATION_V1",
    request_body_contract: "NONE",
    operation_type_options: {},
    precondition_resource: "PROVIDER_CONNECTION",
    response_etag_resource: "PROVIDER_CONNECTION",
    location: false,
  },
  {
    operation_id: "REVOKE",
    kind: "COMMAND",
    method: "POST",
    path: "/api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:revoke",
    coarse_action: "CURVE.PROVIDER_CONNECTION.ADMINISTER",
    granular_action: "CURVE.PROVIDER_CONNECTION.REVOKE",
    required_headers: ["Idempotency-Key", "If-Match"],
    success_status: 200,
    response_kind: "CONNECTION",
    response_contract: "PROVIDER_CONNECTION_ADMINISTRATION_V1",
    request_body_contract: "NONE",
    operation_type_options: {},
    precondition_resource: "PROVIDER_CONNECTION",
    response_etag_resource: "PROVIDER_CONNECTION",
    location: false,
  },
];

export const PROVIDER_ADMIN_OPERATIONS = Object.freeze(
  PROVIDER_ADMIN_OPERATION_BASES.map((operation) => {
    const workspaceOnly = ["LIST", "REGISTER"].includes(operation.operation_id);
    return Object.freeze({
      ...operation,
      authorization_resource_type: workspaceOnly ? "WORKSPACE" : "PROVIDER_CONNECTION",
      lookup_sequence: workspaceOnly
        ? "WORKSPACE_AUTHORIZATION_ONLY"
        : "WORKSPACE_PREAUTHORIZE_SCOPED_SAFE_LOOKUP_RESOURCE_AUTHORIZE",
    });
  }),
);

export const PROVIDER_ADMIN_SAFE_FIELDS = Object.freeze([
  "schema_version",
  "id",
  "workspace_id",
  "aggregate_version",
  "provider_type",
  "adapter_key",
  "adapter_version",
  "environment",
  "display_name",
  "allowed_classifications",
  "status",
  "current_capability",
  "validated_at",
  "last_reconciled_at",
  "next_reconcile_at",
  "last_error",
  "created_at",
  "updated_at",
]);

export const PROVIDER_ADMIN_BLOCKED_FIELDS = Object.freeze([
  "external_tenant_ref",
  "configuration_ref",
  "configuration_digest",
  "secret_reference",
  "capability_document_ref",
  "validation_result_ref",
  "callback_endpoint_key",
  "callback_secret",
  "signing_material",
  "provider_token",
  "authorization_header",
  "endpoint_url",
  "raw_callback_body",
  "raw_delivery_body",
  "raw_provider_body",
  "provider_exception",
  "protected_object_ref",
  "created_by",
  "updated_by",
  "actor_roles",
]);

export const PROVIDER_ADMIN_SAFE_NESTED_SHAPES = Object.freeze({
  current_capability: {
    nullable: true,
    additional_properties: false,
    required_fields: ["capability_version", "capability_digest"],
    field_types: {
      capability_version: "AGGREGATE_VERSION",
      capability_digest: "SHA256_DIGEST",
    },
  },
  last_error: {
    nullable: true,
    additional_properties: false,
    required_fields: ["code", "retryable"],
    field_types: {
      code: "SAFE_ERROR_CODE",
      retryable: "BOOLEAN",
    },
  },
});

export const PROVIDER_ADMIN_CAPABILITY_DIGEST_DERIVATION = Object.freeze({
  algorithm: "SHA-256",
  encoding: "UTF-8",
  digest_prefix: "sha256:",
  canonical_json:
    "RECURSIVE_LEXICOGRAPHIC_OBJECT_KEYS_COMPACT_SEPARATORS_ARRAY_ORDER_PRESERVED",
  source_fields: [
    "adapter_key",
    "adapter_version",
    "allowed_classifications",
    "capabilities",
    "connection_id",
    "protocol_versions",
    "provider_type",
    "workspace_id",
  ],
  capability_fields: ["enabled", "name", "risk", "schema_uri"],
  optional_field_rule: "OMIT_CAPABILITY_SCHEMA_URI_WHEN_NULL",
  excluded_fields: [
    "capability_version",
    "connection_version",
    "expires_at",
    "observed_at",
    "validated_at",
  ],
});

export const PROVIDER_ADMIN_EMPTY_DEPENDENCY_EVIDENCE = Object.freeze({
  runtime_activation_refs: [],
  retention_decision_refs: [],
  ux_contract_refs: [],
  approved_data_classifications: [],
  data_classification_approval_refs: [],
  dedicated_revoke_approver_policy_ref: null,
  owner_reviewer_exception_ref: null,
  approval_role_overlap_exception_ref: null,
  custom_coding_attempt_usd: null,
});

export const PROVIDER_ADMIN_OPTION_CATALOG = Object.freeze({
  authority_source: [
    "PLANE_WORKSPACE_ROLE_20",
    "PLANE_INSTANCE_ADMIN_AND_WORKSPACE_MEMBER",
    "CURVE_PLATFORM_ADMIN_ASSIGNMENT",
    "DEFER",
  ],
  action_profile: ["COARSE_V3", "GRANULAR_V3", "DEFER"],
  read_visibility: [
    "PLATFORM_ADMINISTRATOR_ONLY",
    "ACTIVE_WORKSPACE_MEMBERS_SAFE_PROJECTION",
    "DEFER",
  ],
  membership_rule: [
    "ACTIVE_TARGET_WORKSPACE_REQUIRED",
    "ACTIVE_TARGET_WORKSPACE_AND_INSTANCE_ADMIN_REQUIRED",
    "ACTIVE_TARGET_WORKSPACE_AND_CURVE_ASSIGNMENT_REQUIRED",
    "DEFER",
  ],
  separation_rule: [
    "NONE",
    "DISTINCT_REVOKER",
    "DISTINCT_REGISTRAR_AND_REVOKER",
    "DEDICATED_REVOKE_APPROVER",
    "DEFER",
  ],
  deny_response_profile: [
    "ROLE_DENIAL_403_SCOPE_OR_ABSENCE_404",
    "OPAQUE_404_FOR_ALL_AUTHENTICATED_DENIALS",
    "DEFER",
  ],
  api_exposure_profile: ["INTERNAL_API_ONLY", "API_AND_CURVE_ADMIN_UI", "DEFER"],
  environment_classification_scope: [
    "LOCAL_INTERNAL_ONLY",
    "LOCAL_AND_STAGING_INTERNAL",
    "ALL_ENVIRONMENTS_APPROVED_CLASSES",
    "DEFER",
  ],
  owner_reviewer_rule: ["DISTINCT_HUMANS", "SAME_PERSON_BOOTSTRAP_EXCEPTION", "DEFER"],
  approval_separation_rule: [
    "THREE_DISTINCT_HUMANS",
    "MULTI_ROLE_TIME_BOUND_EXCEPTION",
    "DEFER",
  ],
  coding_budget_profile: ["USD_25_ZERO_PROVIDER_SPEND", "OWNER_SPECIFIED_LOWER_CEILING", "DEFER"],
  governance_identity_authority: [
    "ORGANIZATION_IDP_SUBJECT",
    "PLANE_USER_ID",
    "GITHUB_USER_ID",
  ],
  async_operation_profile: [
    "SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1",
    "DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1",
    "DEFER",
  ],
});

export const PROVIDER_ADMIN_IDENTITY_AUTHORITIES = Object.freeze([
  "ORGANIZATION_IDP_SUBJECT",
  "PLANE_USER_ID",
  "GITHUB_USER_ID",
]);

export const PROVIDER_ADMIN_EVIDENCE_SUBJECT = Object.freeze({
  decision_id: "B-ADMIN-M0-S9B1",
  work_package: "M0-S9B1",
  repository: "github.com/faocampo/curve",
});

export const PROVIDER_ADMIN_PROOF_CASES = Object.freeze([
  "ROLE_SOURCE_DERIVATION",
  "MEMBERSHIP_ACTIVE_EXACT_WORKSPACE",
  "CALLER_SUPPLIED_ROLE_REJECTED",
  "AGENT_SERVICE_SYSTEM_REJECTED",
  "ACTION_SCOPE_EXACT",
  "SEPARATION_RULE_ENFORCED",
  "DENY_RESPONSE_INDISTINGUISHABILITY",
  "READ_PROJECTION_REDACTION",
  "IDEMPOTENCY_REPLAY_AND_CONFLICT",
  "ETAG_PRECONDITION",
  "AUTHORIZATION_BEFORE_LOOKUP",
  "ZERO_SECRET_NETWORK_DELIVERY_EFFECT",
  "APPROVAL_ROLE_SEPARATION_ENFORCED",
  "REGISTRATION_ALLOWLIST_AND_SCOPE_CEILING",
]);

export const PROVIDER_ADMIN_APPROVAL_ROLES = Object.freeze([
  "CURVE_PRODUCT",
  "SECURITY_IDENTITY",
  "PLATFORM_ADMINISTRATION",
]);

const OPTION_TO_UNRESOLVED = Object.freeze({
  authority_source: "AUTHORITY_SOURCE",
  action_profile: "ACTION_PROFILE",
  read_visibility: "READ_VISIBILITY",
  membership_rule: "MEMBERSHIP_RULE",
  separation_rule: "SEPARATION_RULE",
  deny_response_profile: "DENY_RESPONSE_PROFILE",
  api_exposure_profile: "API_EXPOSURE_PROFILE",
  environment_classification_scope: "ENVIRONMENT_CLASSIFICATION_SCOPE",
  owner_reviewer_rule: "OWNER_REVIEWER_RULE",
  approval_separation_rule: "APPROVAL_SEPARATION_RULE",
  coding_budget_profile: "CODING_BUDGET_PROFILE",
  governance_identity_authority: "GOVERNANCE_IDENTITY_AUTHORITY",
  async_operation_profile: "ASYNC_OPERATION_PROFILE",
});

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function rawFileBytes(rawFilesByPath, path) {
  const value = rawFilesByPath instanceof Map ? rawFilesByPath.get(path) : rawFilesByPath[path];
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  throw new Error(`M0-S9B1 bound contract bytes are missing for ${path}`);
}

function rawSha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function acceptedAdapterCoordinateFromRegistry(registry) {
  return {
    provider_type: registry.provider.provider_type,
    adapter_key: registry.provider.adapter_key,
    adapter_version: registry.provider.adapter_version,
    environment: registry.authority.environment,
    allowed_classifications: registry.provider.allowed_classifications,
  };
}

export function validateProviderAdministrationBoundContractBytes(manifest, rawFilesByPath) {
  const schemaBindings = [
    manifest.api_contract.register_request,
    ...Object.values(manifest.api_contract.response_contracts),
  ];
  for (const binding of schemaBindings) {
    const bytes = rawFileBytes(rawFilesByPath, binding.schema_path);
    if (rawSha256(bytes) !== binding.schema_content_digest) {
      throw new Error(`M0-S9B1 raw-byte contract digest changed for ${binding.schema_path}`);
    }
    const schema = JSON.parse(bytes.toString("utf8"));
    if (
      schema.$id !== binding.schema_id ||
      schema.properties?.schema_version?.const !== binding.schema_version
    ) {
      throw new Error(`M0-S9B1 schema identity changed for ${binding.schema_path}`);
    }
    if (
      binding.contract_state === "PROPOSED_NOT_NORMATIVE" &&
      (schema["x-curve-contract-state"] !== "PROPOSED_NOT_NORMATIVE" ||
        schema["x-curve-promotion-decision"] !== manifest.decision_id)
    ) {
      throw new Error(`M0-S9B1 candidate-state annotation changed for ${binding.schema_path}`);
    }
  }

  const snapshot = manifest.api_contract.accepted_adapter_snapshot;
  const registryBytes = rawFileBytes(rawFilesByPath, snapshot.source_path);
  if (rawSha256(registryBytes) !== snapshot.source_content_digest) {
    throw new Error("M0-S9B1 accepted M0-S9A provider registry bytes changed");
  }
  const registry = JSON.parse(registryBytes.toString("utf8"));
  if (registry.schema_version !== snapshot.source_schema_version) {
    throw new Error("M0-S9B1 accepted M0-S9A provider registry schema changed");
  }
  if (
    registry.registration_authorization.target_id !==
    `${registry.provider.adapter_key}@${registry.provider.adapter_version}`
  ) {
    throw new Error("M0-S9B1 accepted registry policy target differs from its adapter coordinate");
  }
  assertExact(
    snapshot.accepted_coordinates,
    [acceptedAdapterCoordinateFromRegistry(registry)],
    "M0-S9B1 accepted adapter coordinates differ from the M0-S9A registry",
  );
  return { verified_bindings: schemaBindings.length + 1 };
}

export function validateProviderRegistrationCoordinates(manifest, request) {
  const expectedFields = manifest.api_contract.register_request.required_fields;
  assertExact(
    Object.keys(request).sort(),
    [...expectedFields].sort(),
    "M0-S9B1 registration request fields differ from the closed candidate request",
  );
  const coordinate = manifest.api_contract.accepted_adapter_snapshot.accepted_coordinates.find(
    (candidate) =>
      candidate.provider_type === request.provider_type &&
      candidate.adapter_key === request.adapter_key &&
      candidate.adapter_version === request.adapter_version &&
      candidate.environment === request.environment,
  );
  if (!coordinate) {
    throw new Error("M0-S9B1 registration coordinate is absent from the accepted adapter snapshot");
  }
  if (
    request.allowed_classifications.length === 0 ||
    new Set(request.allowed_classifications).size !== request.allowed_classifications.length ||
    request.allowed_classifications.some(
      (classification) => !coordinate.allowed_classifications.includes(classification),
    )
  ) {
    throw new Error("M0-S9B1 registration classifications exceed the accepted adapter scope");
  }
  return coordinate;
}

export function providerCapabilityDigest(observation) {
  const capabilityPayloads = observation.capabilities.map((capability) => ({
    enabled: capability.enabled,
    name: capability.name,
    risk: capability.risk,
    ...(capability.schema_uri === null || capability.schema_uri === undefined
      ? {}
      : { schema_uri: capability.schema_uri }),
  }));
  const payload = {
    adapter_key: observation.adapter_key,
    adapter_version: observation.adapter_version,
    allowed_classifications: observation.allowed_classifications,
    capabilities: capabilityPayloads,
    connection_id: observation.connection_id,
    protocol_versions: observation.protocol_versions,
    provider_type: observation.provider_type,
    workspace_id: observation.workspace_id,
  };
  return rawSha256(Buffer.from(JSON.stringify(canonicalJson(payload)), "utf8"));
}

function assertExact(actual, expected, message) {
  if (!isDeepStrictEqual(actual, expected)) throw new Error(message);
}

function activationAllFalse(activation) {
  return Object.values(activation).every((value) => value === false);
}

function evidenceSubjectValid(evidence) {
  return (
    evidence.decision_id === PROVIDER_ADMIN_EVIDENCE_SUBJECT.decision_id &&
    evidence.work_package === PROVIDER_ADMIN_EVIDENCE_SUBJECT.work_package &&
    evidence.repository === PROVIDER_ADMIN_EVIDENCE_SUBJECT.repository
  );
}

function subjectIdValidForAuthority(authority, subjectId) {
  if (typeof subjectId !== "string" || subjectId !== subjectId.trim()) return false;
  if (authority === "GITHUB_USER_ID") return /^[1-9][0-9]{0,19}$/.test(subjectId);
  if (authority === "PLANE_USER_ID") {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      subjectId,
    );
  }
  if (authority === "ORGANIZATION_IDP_SUBJECT") {
    return /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,254}$/.test(subjectId);
  }
  return false;
}

function evidenceRefValid(evidence, expectedType, expectedEnvironment = null) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    !Array.isArray(evidence) &&
    isDeepStrictEqual(Object.keys(evidence).sort(), [
      "content_digest",
      "decision_id",
      "evidence_type",
      "reference",
      "repository",
      "source_revision",
      "target_environment",
      "work_package",
    ]) &&
    evidenceSubjectValid(evidence) &&
    evidence.evidence_type === expectedType &&
    typeof evidence.reference === "string" &&
    evidence.reference.length > 0 &&
    /^sha256:[0-9a-f]{64}$/.test(evidence.content_digest) &&
    /^[0-9a-f]{40}$/.test(evidence.source_revision) &&
    ["LOCAL", "STAGING", "PRODUCTION", "NOT_APPLICABLE"].includes(
      evidence.target_environment,
    ) &&
    (expectedEnvironment === null || evidence.target_environment === expectedEnvironment)
  );
}

function classificationApprovalRefValid(evidence) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    !Array.isArray(evidence) &&
    isDeepStrictEqual(Object.keys(evidence).sort(), [
      "approved_classifications",
      "content_digest",
      "decision_id",
      "evidence_type",
      "reference",
      "repository",
      "source_revision",
      "target_environment",
      "work_package",
    ]) &&
    evidenceSubjectValid(evidence) &&
    evidence.evidence_type === "CLASSIFICATION_APPROVAL" &&
    typeof evidence.reference === "string" &&
    evidence.reference.length > 0 &&
    /^sha256:[0-9a-f]{64}$/.test(evidence.content_digest) &&
    /^[0-9a-f]{40}$/.test(evidence.source_revision) &&
    evidence.target_environment === "NOT_APPLICABLE" &&
    Array.isArray(evidence.approved_classifications) &&
    evidence.approved_classifications.length > 0 &&
    new Set(evidence.approved_classifications).size === evidence.approved_classifications.length &&
    evidence.approved_classifications.every((classification) =>
      ["INTERNAL", "CONFIDENTIAL", "RESTRICTED"].includes(classification),
    )
  );
}

function proofEvidenceRefValid(evidence, expectedCaseId) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    !Array.isArray(evidence) &&
    isDeepStrictEqual(Object.keys(evidence).sort(), [
      "content_digest",
      "decision_id",
      "evidence_type",
      "proof_case_id",
      "reference",
      "repository",
      "source_revision",
      "target_environment",
      "work_package",
    ]) &&
    evidenceSubjectValid(evidence) &&
    evidence.evidence_type === "PROOF_RESULT" &&
    evidence.proof_case_id === expectedCaseId &&
    typeof evidence.reference === "string" &&
    evidence.reference.length > 0 &&
    /^sha256:[0-9a-f]{64}$/.test(evidence.content_digest) &&
    /^[0-9a-f]{40}$/.test(evidence.source_revision) &&
    evidence.target_environment === "NOT_APPLICABLE"
  );
}

function identityProofRefValid(evidence, expectedAuthority, expectedSubjectId) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    !Array.isArray(evidence) &&
    isDeepStrictEqual(Object.keys(evidence).sort(), [
      "content_digest",
      "decision_id",
      "evidence_type",
      "identity_authority",
      "reference",
      "repository",
      "source_revision",
      "subject_id",
      "target_environment",
      "work_package",
    ]) &&
    evidenceSubjectValid(evidence) &&
    evidence.evidence_type === "IDENTITY_SUBJECT_PROOF" &&
    evidence.identity_authority === expectedAuthority &&
    evidence.subject_id === expectedSubjectId &&
    subjectIdValidForAuthority(evidence.identity_authority, evidence.subject_id) &&
    typeof evidence.reference === "string" &&
    evidence.reference.length > 0 &&
    /^sha256:[0-9a-f]{64}$/.test(evidence.content_digest) &&
    /^[0-9a-f]{40}$/.test(evidence.source_revision) &&
    evidence.target_environment === "NOT_APPLICABLE"
  );
}

function canonicalHumanSubject(human, expectedAuthority) {
  if (
    human === null ||
    human.actor_type !== "HUMAN" ||
    human.identity_authority !== expectedAuthority ||
    !PROVIDER_ADMIN_IDENTITY_AUTHORITIES.includes(human.identity_authority) ||
    !subjectIdValidForAuthority(human.identity_authority, human.subject_id) ||
    !identityProofRefValid(human.identity_proof_ref, expectedAuthority, human.subject_id)
  ) {
    throw new Error("M0-S9B1 human identity is not bound to the selected canonical authority");
  }
  return `${human.identity_authority}\0${human.subject_id}`;
}

function timeBoundExceptionValid(evidence, expectedType, requireDispatchRevalidation = false) {
  const expectedKeys = [
    "content_digest",
    "decision_id",
    ...(requireDispatchRevalidation ? ["dispatch_revalidation_required"] : []),
    "evidence_type",
    "reference",
    "repository",
    "source_revision",
    "target_environment",
    "valid_from",
    "valid_until",
    "work_package",
  ].sort();
  if (
    evidence === null ||
    typeof evidence !== "object" ||
    Array.isArray(evidence) ||
    !isDeepStrictEqual(Object.keys(evidence).sort(), expectedKeys) ||
    !evidenceSubjectValid(evidence) ||
    evidence.evidence_type !== expectedType ||
    (requireDispatchRevalidation && evidence.dispatch_revalidation_required !== true) ||
    typeof evidence.reference !== "string" ||
    evidence.reference.length === 0 ||
    !/^sha256:[0-9a-f]{64}$/.test(evidence.content_digest) ||
    !/^[0-9a-f]{40}$/.test(evidence.source_revision) ||
    evidence.target_environment !== "NOT_APPLICABLE"
  ) {
    return false;
  }
  const validFrom = Date.parse(evidence.valid_from);
  const validUntil = Date.parse(evidence.valid_until);
  return Number.isFinite(validFrom) && Number.isFinite(validUntil) && validUntil > validFrom;
}

function assertDependencyEvidence(manifest) {
  const classifications = manifest.dependency_evidence.approved_data_classifications;
  if (
    new Set(classifications).size !== classifications.length ||
    classifications.some(
      (classification) => !["INTERNAL", "CONFIDENTIAL", "RESTRICTED"].includes(classification),
    )
  ) {
    throw new Error("M0-S9B1 approved data classifications are invalid or duplicated");
  }
  for (const [field, evidenceType, expectedEnvironment] of [
    ["runtime_activation_refs", "RUNTIME_ACTIVATION", null],
    ["retention_decision_refs", "RETENTION_DECISION", "NOT_APPLICABLE"],
    ["ux_contract_refs", "UX_CONTRACT", "NOT_APPLICABLE"],
  ]) {
    if (
      !manifest.dependency_evidence[field].every((item) =>
        evidenceRefValid(item, evidenceType, expectedEnvironment),
      )
    ) {
      throw new Error(`M0-S9B1 ${field} must contain exact digest-bound ${evidenceType} evidence`);
    }
    const references = manifest.dependency_evidence[field];
    const digests = references.map((reference) => reference.content_digest);
    const sourceLocators = references.map(
      (reference) => `${reference.reference}\0${reference.source_revision}`,
    );
    if (
      new Set(digests).size !== digests.length ||
      new Set(sourceLocators).size !== sourceLocators.length
    ) {
      throw new Error(`M0-S9B1 ${field} cannot reuse one evidence artifact`);
    }
  }
  if (
    !manifest.dependency_evidence.data_classification_approval_refs.every(
      classificationApprovalRefValid,
    )
  ) {
    throw new Error(
      "M0-S9B1 classification approvals must be exact and classification-bound",
    );
  }
  const classificationEvidence =
    manifest.dependency_evidence.data_classification_approval_refs;
  if (
    new Set(classificationEvidence.map((reference) => reference.content_digest)).size !==
      classificationEvidence.length ||
    new Set(
      classificationEvidence.map(
        (reference) => `${reference.reference}\0${reference.source_revision}`,
      ),
    ).size !== classificationEvidence.length
  ) {
    throw new Error("M0-S9B1 classification approvals cannot reuse one evidence artifact");
  }
  const evidencedClassifications = [
    ...new Set(
      manifest.dependency_evidence.data_classification_approval_refs.flatMap(
        (reference) => reference.approved_classifications,
      ),
    ),
  ].sort();
  if (
    manifest.dependency_evidence.data_classification_approval_refs.length > 0 &&
    !isDeepStrictEqual(evidencedClassifications, [...classifications].sort())
  ) {
    throw new Error(
      "M0-S9B1 classification approval evidence must exactly cover approved classifications",
    );
  }
  const separationRef = manifest.dependency_evidence.dedicated_revoke_approver_policy_ref;
  if (
    separationRef !== null &&
    !evidenceRefValid(separationRef, "SEPARATION_POLICY", "NOT_APPLICABLE")
  ) {
    throw new Error("M0-S9B1 dedicated revoke-approver evidence is not digest-bound");
  }
  const exceptionRef = manifest.dependency_evidence.owner_reviewer_exception_ref;
  if (
    exceptionRef !== null &&
    !timeBoundExceptionValid(exceptionRef, "OWNER_REVIEWER_EXCEPTION", true)
  ) {
    throw new Error("M0-S9B1 owner/reviewer exception is not exact and time-bounded");
  }
  const approvalOverlapRef = manifest.dependency_evidence.approval_role_overlap_exception_ref;
  if (
    approvalOverlapRef !== null &&
    !timeBoundExceptionValid(approvalOverlapRef, "APPROVAL_ROLE_OVERLAP_EXCEPTION")
  ) {
    throw new Error("M0-S9B1 approval-role overlap exception is not exact and time-bounded");
  }
}

function dependencyEvidenceArtifacts(manifest) {
  return [
    ...manifest.dependency_evidence.runtime_activation_refs,
    ...manifest.dependency_evidence.retention_decision_refs,
    ...manifest.dependency_evidence.ux_contract_refs,
    ...manifest.dependency_evidence.data_classification_approval_refs,
    manifest.dependency_evidence.dedicated_revoke_approver_policy_ref,
    manifest.dependency_evidence.owner_reviewer_exception_ref,
    manifest.dependency_evidence.approval_role_overlap_exception_ref,
  ].filter((reference) => reference !== null);
}

function assertEvidenceArtifactUniqueness(manifest) {
  const artifacts = [
    ...dependencyEvidenceArtifacts(manifest),
    ...manifest.proof_cases.flatMap((proofCase) => proofCase.evidence_refs),
  ];
  const digests = artifacts.map((artifact) => artifact.content_digest);
  const locators = artifacts.map(
    (artifact) => `${artifact.reference}\0${artifact.source_revision}`,
  );
  if (new Set(digests).size !== digests.length) {
    throw new Error("M0-S9B1 governance evidence must use one unique content digest per artifact");
  }
  if (new Set(locators).size !== locators.length) {
    throw new Error("M0-S9B1 governance evidence must use one unique artifact locator");
  }
}

function assertProofEvidenceIntegrity(manifest) {
  const artifactDigests = manifest.proof_cases.flatMap((proofCase) =>
    proofCase.evidence_refs.map((evidence) => evidence.content_digest),
  );
  const artifactLocators = manifest.proof_cases.flatMap((proofCase) =>
    proofCase.evidence_refs.map(
      (evidence) => `${evidence.reference}\0${evidence.source_revision}`,
    ),
  );
  for (const proofCase of manifest.proof_cases) {
    if (proofCase.status === "NOT_RUN" && proofCase.evidence_refs.length > 0) {
      throw new Error("M0-S9B1 NOT_RUN proof case cannot carry evidence");
    }
    if (["PASS", "FAIL"].includes(proofCase.status) && proofCase.evidence_refs.length === 0) {
      throw new Error("M0-S9B1 completed proof case requires evidence");
    }
    if (
      !proofCase.evidence_refs.every((evidence) =>
        proofEvidenceRefValid(evidence, proofCase.case_id),
      )
    ) {
      throw new Error("M0-S9B1 proof evidence is not bound to its containing case");
    }
  }
  if (new Set(artifactDigests).size !== artifactDigests.length) {
    throw new Error("M0-S9B1 proof evidence reuses one content digest");
  }
  if (new Set(artifactLocators).size !== artifactLocators.length) {
    throw new Error("M0-S9B1 proof evidence reuses one artifact locator");
  }
}

function proofCasesComplete(manifest) {
  return manifest.proof_cases.every(
    (proofCase) => proofCase.status === "PASS" && proofCase.evidence_refs.length > 0,
  );
}

function assertDecidedIdentityBindings(manifest) {
  const selectedAuthority = manifest.material_options.governance_identity_authority.selected;
  if (!PROVIDER_ADMIN_IDENTITY_AUTHORITIES.includes(selectedAuthority)) {
    throw new Error("M0-S9B1 decided record requires a canonical governance identity authority");
  }
  const requiredOwnerNames =
    manifest.decision_outcome === "APPROVED"
      ? [
          "decision_owner",
          "delivery_owner",
          "human_reviewer",
          "security_identity_owner",
          "platform_administration_owner",
        ]
      : ["decision_owner", "security_identity_owner", "platform_administration_owner"];
  return Object.fromEntries(
    requiredOwnerNames.map((ownerName) => [
      ownerName,
      canonicalHumanSubject(manifest.owners[ownerName], selectedAuthority),
    ]),
  );
}

function approvalsComplete(manifest, expectedDigest) {
  const roles = manifest.approvals.map((approval) => approval.approval_role);
  if (!isDeepStrictEqual([...roles].sort(), [...PROVIDER_ADMIN_APPROVAL_ROLES].sort())) return false;
  if (new Set(roles).size !== roles.length) return false;
  const expectedApprovers = {
    CURVE_PRODUCT: manifest.owners.decision_owner,
    SECURITY_IDENTITY: manifest.owners.security_identity_owner,
    PLATFORM_ADMINISTRATION: manifest.owners.platform_administration_owner,
  };
  return manifest.approvals.every((approval) => {
    const expectedApprover = expectedApprovers[approval.approval_role];
    return (
      expectedApprover !== null &&
      approval.approver.actor_type === "HUMAN" &&
      isDeepStrictEqual(approval.approver, expectedApprover) &&
      approval.approved_decision_digest === expectedDigest
    );
  });
}

function unresolvedRequirements(manifest, expectedDigest) {
  const unresolved = [];
  for (const [optionName, requirement] of Object.entries(OPTION_TO_UNRESOLVED)) {
    if (manifest.material_options[optionName].selected === null) unresolved.push(requirement);
  }

  if (manifest.owners.security_identity_owner === null) unresolved.push("SECURITY_IDENTITY_OWNER");
  if (manifest.owners.platform_administration_owner === null) {
    unresolved.push("PLATFORM_ADMINISTRATION_OWNER");
  }
  if (manifest.decision_outcome !== "DEFERRED") {
    if (!proofCasesComplete(manifest)) unresolved.push("FOURTEEN_PROOF_CASES");
  }

  if (!approvalsComplete(manifest, expectedDigest)) {
    unresolved.push("THREE_DIGEST_BOUND_APPROVALS");
  }
  return unresolved;
}

function assertSelectedOptions(manifest) {
  for (const [optionName, expectedAllowed] of Object.entries(PROVIDER_ADMIN_OPTION_CATALOG)) {
    const option = manifest.material_options[optionName];
    assertExact(option.allowed, expectedAllowed, `M0-S9B1 ${optionName} alternatives changed`);
    if (option.selected !== null && !expectedAllowed.includes(option.selected)) {
      throw new Error(`M0-S9B1 ${optionName} selection is outside the published alternatives`);
    }
  }
}

function assertApprovedCompatibility(manifest) {
  const selected = Object.fromEntries(
    Object.entries(manifest.material_options).map(([name, option]) => [name, option.selected]),
  );

  const requiredMembership = {
    PLANE_WORKSPACE_ROLE_20: "ACTIVE_TARGET_WORKSPACE_REQUIRED",
    PLANE_INSTANCE_ADMIN_AND_WORKSPACE_MEMBER:
      "ACTIVE_TARGET_WORKSPACE_AND_INSTANCE_ADMIN_REQUIRED",
    CURVE_PLATFORM_ADMIN_ASSIGNMENT:
      "ACTIVE_TARGET_WORKSPACE_AND_CURVE_ASSIGNMENT_REQUIRED",
  }[selected.authority_source];
  if (selected.membership_rule !== requiredMembership) {
    throw new Error("M0-S9B1 authority source and membership rule are incompatible");
  }

  for (const operation of manifest.api_contract.operations) {
    if (operation.response_kind === "OPERATION") {
      const selectedOperationType = operation.operation_type_options[selected.async_operation_profile];
      if (!selectedOperationType) {
        throw new Error(
          "M0-S9B1 async operation profile does not map every asynchronous command",
        );
      }
      const operationSummary = manifest.api_contract.response_contracts.OPERATION_SUMMARY_V1;
      if (!operationSummary.candidate_operation_types.includes(selectedOperationType)) {
        throw new Error("M0-S9B1 selected operation type is absent from the candidate materialization set");
      }
      if (
        !operationSummary.accepted_operation_types.includes(selectedOperationType) &&
        operationSummary.selected_operation_type_materialization_required !== true
      ) {
        throw new Error("M0-S9B1 selected operation type requires successor schema materialization");
      }
    } else if (Object.keys(operation.operation_type_options).length !== 0) {
      throw new Error("M0-S9B1 synchronous operation cannot declare an operation type");
    }
  }

  if (
    selected.api_exposure_profile === "API_AND_CURVE_ADMIN_UI" &&
    manifest.dependency_evidence.ux_contract_refs.length === 0
  ) {
    throw new Error("M0-S9B1 API and UI exposure requires approved UX contract evidence");
  }

  const expectedRuntimeEnvironments = {
    LOCAL_INTERNAL_ONLY: ["LOCAL"],
    LOCAL_AND_STAGING_INTERNAL: ["LOCAL", "STAGING"],
    ALL_ENVIRONMENTS_APPROVED_CLASSES: ["LOCAL", "PRODUCTION", "STAGING"],
  }[selected.environment_classification_scope];
  const actualRuntimeEnvironments = [
    ...new Set(
      manifest.dependency_evidence.runtime_activation_refs.map(
        (reference) => reference.target_environment,
      ),
    ),
  ].sort();
  if (!isDeepStrictEqual(actualRuntimeEnvironments, expectedRuntimeEnvironments)) {
    throw new Error("M0-S9B1 runtime activation evidence does not cover the selected environments");
  }
  if (
    selected.environment_classification_scope === "LOCAL_AND_STAGING_INTERNAL" &&
    manifest.dependency_evidence.retention_decision_refs.length === 0
  ) {
    throw new Error("M0-S9B1 staging scope requires D-009 retention-decision evidence");
  }
  if (selected.environment_classification_scope === "ALL_ENVIRONMENTS_APPROVED_CLASSES") {
    if (manifest.dependency_evidence.runtime_activation_refs.length === 0) {
      throw new Error("M0-S9B1 all-environment scope requires runtime activation evidence");
    }
    if (manifest.dependency_evidence.retention_decision_refs.length === 0) {
      throw new Error("M0-S9B1 all-environment scope requires retention-decision evidence");
    }
    if (
      manifest.dependency_evidence.approved_data_classifications.length === 0 ||
      manifest.dependency_evidence.data_classification_approval_refs.length === 0
    ) {
      throw new Error("M0-S9B1 all-environment scope requires explicit approved classifications");
    }
  } else if (
    !isDeepStrictEqual(manifest.dependency_evidence.approved_data_classifications, ["INTERNAL"]) ||
    manifest.dependency_evidence.data_classification_approval_refs.length !== 0
  ) {
    throw new Error("M0-S9B1 local and staging scopes are limited to INTERNAL data");
  }

  if (selected.separation_rule === "DEDICATED_REVOKE_APPROVER") {
    if (manifest.dependency_evidence.dedicated_revoke_approver_policy_ref === null) {
      throw new Error("M0-S9B1 dedicated revoker requires an exact separation-policy reference");
    }
  } else if (manifest.dependency_evidence.dedicated_revoke_approver_policy_ref !== null) {
    throw new Error("M0-S9B1 non-dedicated separation cannot carry a dedicated-role policy");
  }

  const canonicalSubjects = assertDecidedIdentityBindings(manifest);
  const ownerRef = canonicalSubjects.delivery_owner;
  const reviewerRef = canonicalSubjects.human_reviewer;
  if (selected.owner_reviewer_rule === "DISTINCT_HUMANS") {
    if (ownerRef === reviewerRef) throw new Error("M0-S9B1 distinct owner/reviewer rule is not met");
    if (manifest.dependency_evidence.owner_reviewer_exception_ref !== null) {
      throw new Error("M0-S9B1 distinct owner/reviewer rule cannot carry an exception");
    }
  }
  if (selected.owner_reviewer_rule === "SAME_PERSON_BOOTSTRAP_EXCEPTION") {
    if (ownerRef !== reviewerRef) throw new Error("M0-S9B1 same-person exception has different people");
    const exceptionRef = manifest.dependency_evidence.owner_reviewer_exception_ref;
    if (!exceptionRef) {
      throw new Error("M0-S9B1 same-person exception requires an exact evidence reference");
    }
    const decisionTime = Date.parse(manifest.decided_at);
    if (
      !(Date.parse(exceptionRef.valid_from) <= decisionTime) ||
      !(decisionTime < Date.parse(exceptionRef.valid_until)) ||
      !(Date.parse(manifest.next_review_at) < Date.parse(exceptionRef.valid_until)) ||
      exceptionRef.dispatch_revalidation_required !== true
    ) {
      throw new Error(
        "M0-S9B1 same-person exception must cover the next review and require dispatch revalidation",
      );
    }
  }

  const approvalIdentityRefs = [
    canonicalSubjects.decision_owner,
    canonicalSubjects.security_identity_owner,
    canonicalSubjects.platform_administration_owner,
  ];
  const uniqueApprovalIdentities = new Set(approvalIdentityRefs).size;
  const overlapException = manifest.dependency_evidence.approval_role_overlap_exception_ref;
  if (selected.approval_separation_rule === "THREE_DISTINCT_HUMANS") {
    if (uniqueApprovalIdentities !== 3) {
      throw new Error("M0-S9B1 three-distinct-human approval rule is not met");
    }
    if (overlapException !== null) {
      throw new Error("M0-S9B1 distinct governance approvals cannot carry an overlap exception");
    }
  }
  if (selected.approval_separation_rule === "MULTI_ROLE_TIME_BOUND_EXCEPTION") {
    if (uniqueApprovalIdentities === 3 || overlapException === null) {
      throw new Error("M0-S9B1 multi-role approvals require an actual overlap and exception");
    }
    const decisionTime = Date.parse(manifest.decided_at);
    if (
      !(Date.parse(overlapException.valid_from) <= decisionTime) ||
      !(decisionTime < Date.parse(overlapException.valid_until))
    ) {
      throw new Error("M0-S9B1 approval-role overlap exception must be valid at decision time");
    }
  }

  if (selected.coding_budget_profile === "USD_25_ZERO_PROVIDER_SPEND") {
    if (manifest.dependency_evidence.custom_coding_attempt_usd !== null) {
      throw new Error("M0-S9B1 fixed USD 25 profile cannot carry a custom ceiling");
    }
  }
  if (selected.coding_budget_profile === "OWNER_SPECIFIED_LOWER_CEILING") {
    const value = manifest.dependency_evidence.custom_coding_attempt_usd;
    if (value === null || value < 0 || value >= 25) {
      throw new Error("M0-S9B1 custom coding ceiling must be non-negative and below USD 25");
    }
  }
}

export function providerAdministrationDecisionPayload(manifest) {
  return {
    schema_version: manifest.schema_version,
    decision_id: manifest.decision_id,
    decision_version: manifest.decision_version,
    work_package: manifest.work_package,
    baseline: manifest.baseline,
    fixed_invariants: manifest.fixed_invariants,
    api_contract: manifest.api_contract,
    safe_projection: manifest.safe_projection,
    material_options: manifest.material_options,
    dependency_evidence: manifest.dependency_evidence,
    proof_cases: manifest.proof_cases,
    owners: manifest.owners,
    decision_outcome: manifest.decision_outcome,
    decided_at: manifest.decided_at,
    next_review_at: manifest.next_review_at,
  };
}

export function providerAdministrationDecisionDigest(manifest) {
  return `sha256:${createHash("sha256")
    .update("curve-m0-s9b1-provider-administration-decision:v1\0")
    .update(JSON.stringify(canonicalJson(providerAdministrationDecisionPayload(manifest))))
    .digest("hex")}`;
}

export function validateProviderAdministrationDecisionSemantics(manifest) {
  assertExact(manifest.baseline, PROVIDER_ADMIN_BASELINE, "M0-S9B1 exact baseline changed");
  assertExact(
    manifest.fixed_invariants,
    PROVIDER_ADMIN_FIXED_INVARIANTS,
    "M0-S9B1 fixed security invariants changed",
  );
  if (manifest.api_contract.api_prefix !== "/api/v1/workspaces/{workspace_slug}/curve") {
    throw new Error("M0-S9B1 API prefix changed");
  }
  if (manifest.api_contract.contract_state !== "PROPOSED_NOT_NORMATIVE") {
    throw new Error("M0-S9B1 candidate API cannot become normative through this decision record");
  }
  assertExact(
    manifest.api_contract.pagination,
    PROVIDER_ADMIN_PAGINATION,
    "M0-S9B1 pagination contract changed",
  );
  assertExact(
    manifest.api_contract.idempotency_precondition_profile,
    PROVIDER_ADMIN_IDEMPOTENCY_PRECONDITION_PROFILE,
    "M0-S9B1 idempotency/precondition profile changed",
  );
  assertExact(
    manifest.api_contract.accepted_adapter_snapshot,
    PROVIDER_ADMIN_ACCEPTED_ADAPTER_SNAPSHOT,
    "M0-S9B1 accepted M0-S9A adapter snapshot changed",
  );
  assertExact(
    manifest.api_contract.register_request,
    PROVIDER_ADMIN_REGISTER_REQUEST,
    "M0-S9B1 register-request contract changed",
  );
  assertExact(
    manifest.api_contract.response_contracts,
    PROVIDER_ADMIN_RESPONSE_CONTRACTS,
    "M0-S9B1 response contracts changed",
  );
  assertExact(
    manifest.api_contract.operations,
    PROVIDER_ADMIN_OPERATIONS,
    "M0-S9B1 operation contract changed",
  );
  assertExact(
    manifest.safe_projection.allowed_fields,
    PROVIDER_ADMIN_SAFE_FIELDS,
    "M0-S9B1 safe projection changed",
  );
  assertExact(
    manifest.safe_projection.blocked_fields,
    PROVIDER_ADMIN_BLOCKED_FIELDS,
    "M0-S9B1 blocked projection fields changed",
  );
  if (
    manifest.safe_projection.schema_version !== "curve.provider-connection-administration/v1" ||
    manifest.safe_projection.additional_properties !== false
  ) {
    throw new Error("M0-S9B1 safe projection envelope changed");
  }
  assertExact(
    manifest.safe_projection.nested_shapes,
    PROVIDER_ADMIN_SAFE_NESTED_SHAPES,
    "M0-S9B1 nested safe projection changed",
  );
  assertExact(
    manifest.safe_projection.capability_digest_derivation,
    PROVIDER_ADMIN_CAPABILITY_DIGEST_DERIVATION,
    "M0-S9B1 capability digest derivation changed",
  );
  if (
    manifest.safe_projection.allowed_fields.some((field) =>
      manifest.safe_projection.blocked_fields.includes(field),
    )
  ) {
    throw new Error("M0-S9B1 safe and blocked projection fields overlap");
  }
  assertSelectedOptions(manifest);
  assertDependencyEvidence(manifest);
  assertProofEvidenceIntegrity(manifest);
  assertEvidenceArtifactUniqueness(manifest);

  const caseIds = manifest.proof_cases.map((proofCase) => proofCase.case_id);
  assertExact(caseIds, PROVIDER_ADMIN_PROOF_CASES, "M0-S9B1 proof-case inventory changed");
  if (new Set(caseIds).size !== caseIds.length) {
    throw new Error("M0-S9B1 proof cases contain a duplicate ID");
  }

  if (
    manifest.baseline.core_policy_manifest_digest !==
    "sha256:2895b63392236afa07e6f0572d6ddb1c91aa7f40d37282f250019d2829ed5787"
  ) {
    throw new Error("M0-S9B1 baseline does not bind immutable core policy v2");
  }
  if (manifest.baseline.plane_migration_reserved !== false) {
    throw new Error("M0-S9B1 decision readiness cannot reserve a Plane migration");
  }
  if (
    manifest.implementation_dispatch_allowed ||
    manifest.activation.plane_implementation_authorized
  ) {
    throw new Error("M0-S9B1 decision record cannot authorize Plane implementation");
  }

  const expectedDigest = providerAdministrationDecisionDigest(manifest);
  const expectedUnresolved = unresolvedRequirements(manifest, expectedDigest);
  assertExact(
    manifest.unresolved_requirements,
    expectedUnresolved,
    "M0-S9B1 unresolved requirements differ from decision content",
  );

  if (manifest.status === "PROPOSED") {
    if (manifest.decision_outcome !== "UNSELECTED") {
      throw new Error("a proposed M0-S9B1 decision must remain unselected");
    }
    if (
      Object.values(manifest.material_options).some((option) => option.selected !== null)
    ) {
      throw new Error("a proposed M0-S9B1 decision cannot carry a material selection");
    }
    if (
      manifest.approvals.length > 0 ||
      manifest.decided_at !== null ||
      manifest.next_review_at !== null ||
      manifest.decision_payload_digest !== null ||
      !activationAllFalse(manifest.activation)
    ) {
      throw new Error("a proposed M0-S9B1 decision must remain fail closed");
    }
    if (expectedUnresolved.length === 0) {
      throw new Error("a proposed M0-S9B1 decision must retain unresolved requirements");
    }
    return {
      status: manifest.status,
      outcome: manifest.decision_outcome,
      unresolved: expectedUnresolved,
      implementationDispatchAllowed: false,
    };
  }

  if (!manifest.decided_at || !manifest.next_review_at || !manifest.decision_payload_digest) {
    throw new Error("a decided M0-S9B1 record requires decision, review, and digest fields");
  }
  if (manifest.decision_payload_digest !== expectedDigest) {
    throw new Error(`M0-S9B1 decision digest mismatch: expected ${expectedDigest}`);
  }
  const decisionTime = Date.parse(manifest.decided_at);
  if (!(Date.parse(manifest.next_review_at) > decisionTime)) {
    throw new Error("M0-S9B1 next review must follow the decision time");
  }
  const lastUpdatedTime = Date.parse(manifest.last_updated);
  if (!(lastUpdatedTime >= decisionTime)) {
    throw new Error("M0-S9B1 last update must be at or after the decision time");
  }
  for (const approval of manifest.approvals) {
    if (!(Date.parse(approval.approved_at) < decisionTime)) {
      throw new Error("M0-S9B1 approvals must precede the decision time");
    }
    if (Date.parse(approval.approved_at) > lastUpdatedTime) {
      throw new Error("M0-S9B1 last update must be at or after every approval");
    }
  }
  if (!approvalsComplete(manifest, expectedDigest)) {
    throw new Error("a decided M0-S9B1 record requires three digest-bound human approvals");
  }
  const canonicalSubjects = assertDecidedIdentityBindings(manifest);
  if (expectedUnresolved.length > 0) {
    throw new Error("a decided M0-S9B1 record retains unresolved requirements");
  }

  if (manifest.decision_outcome === "DEFERRED") {
    if (
      Object.entries(manifest.material_options).some(
        ([optionName, option]) =>
          optionName !== "governance_identity_authority" && option.selected !== "DEFER",
      )
    ) {
      throw new Error(
        "a deferred M0-S9B1 decision must select DEFER for every defer-capable provider-administration option",
      );
    }
    assertExact(
      manifest.activation,
      {
        decision_selected: true,
        successor_policy_materialization_ready: false,
        successor_openapi_materialization_ready: false,
        child_task_packet_materialization_ready: false,
        plane_implementation_authorized: false,
      },
      "a deferred M0-S9B1 decision cannot activate successor contracts",
    );
    assertExact(
      manifest.dependency_evidence,
      PROVIDER_ADMIN_EMPTY_DEPENDENCY_EVIDENCE,
      "a deferred M0-S9B1 decision cannot retain activation or implementation evidence",
    );
    if (
      new Set([
        canonicalSubjects.decision_owner,
        canonicalSubjects.security_identity_owner,
        canonicalSubjects.platform_administration_owner,
      ]).size !== 3
    ) {
      throw new Error("a deferred M0-S9B1 decision requires three distinct governance approvers");
    }
  } else if (manifest.decision_outcome === "APPROVED") {
    if (
      Object.values(manifest.material_options).some(
        (option) => option.selected === null || option.selected === "DEFER",
      )
    ) {
      throw new Error("an approved M0-S9B1 decision requires every non-deferred selection");
    }
    assertApprovedCompatibility(manifest);
    assertExact(
      manifest.activation,
      {
        decision_selected: true,
        successor_policy_materialization_ready: true,
        successor_openapi_materialization_ready: true,
        child_task_packet_materialization_ready: true,
        plane_implementation_authorized: false,
      },
      "an approved M0-S9B1 decision has an invalid contract-materialization projection",
    );
  } else {
    throw new Error("a decided M0-S9B1 record requires APPROVED or DEFERRED outcome");
  }

  return {
    status: manifest.status,
    outcome: manifest.decision_outcome,
    unresolved: [],
    decisionPayloadDigest: expectedDigest,
    implementationDispatchAllowed: false,
  };
}

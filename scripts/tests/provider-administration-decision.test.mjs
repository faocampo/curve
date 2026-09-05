import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  PROVIDER_ADMIN_ACCEPTED_ADAPTER_SNAPSHOT,
  PROVIDER_ADMIN_APPROVAL_ROLES,
  PROVIDER_ADMIN_BASELINE,
  PROVIDER_ADMIN_BLOCKED_FIELDS,
  PROVIDER_ADMIN_CAPABILITY_DIGEST_DERIVATION,
  PROVIDER_ADMIN_EMPTY_DEPENDENCY_EVIDENCE,
  PROVIDER_ADMIN_EVIDENCE_SUBJECT,
  PROVIDER_ADMIN_FIXED_INVARIANTS,
  PROVIDER_ADMIN_IDENTITY_AUTHORITIES,
  PROVIDER_ADMIN_IDEMPOTENCY_PRECONDITION_PROFILE,
  PROVIDER_ADMIN_OPERATIONS,
  PROVIDER_ADMIN_OPTION_CATALOG,
  PROVIDER_ADMIN_PAGINATION,
  PROVIDER_ADMIN_PROOF_CASES,
  PROVIDER_ADMIN_REGISTER_REQUEST,
  PROVIDER_ADMIN_RESPONSE_CONTRACTS,
  PROVIDER_ADMIN_SAFE_FIELDS,
  PROVIDER_ADMIN_SAFE_NESTED_SHAPES,
  providerCapabilityDigest,
  providerAdministrationDecisionDigest,
  validateProviderAdministrationBoundContractBytes,
  validateProviderAdministrationDecisionSemantics,
  validateProviderRegistrationCoordinates,
} from "../lib/provider-administration-decision.mjs";

const manifestPath = new URL(
  "../../contracts/governance/m0-s9b1-provider-administration-v1.json",
  import.meta.url,
);
const canonicalManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const invalidManifestPath = new URL(
  "../../contracts/schemas/examples/provider-administration-decision.invalid.json",
  import.meta.url,
);
const invalidManifest = JSON.parse(readFileSync(invalidManifestPath, "utf8"));
const approvedFixture = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/semantic-fixtures/provider-administration-decision-approved.valid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const deferredFixture = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/semantic-fixtures/provider-administration-decision-deferred.valid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const providerAdministrationSchema = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/provider-administration-decision.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const commonSchema = JSON.parse(
  readFileSync(
    new URL("../../contracts/schemas/common.schema.json", import.meta.url),
    "utf8",
  ),
);
const providerConnectionRegisterRequestSchema = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/provider-connection-register-request.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const providerConnectionAdministrationSchema = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/provider-connection-administration.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const providerConnectionAdministrationPageSchema = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/provider-connection-administration-page.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const providerConnectionRegisterRequest = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/examples/provider-connection-register-request.valid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const providerConnectionAdministration = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/examples/provider-connection-administration.valid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const providerConnectionAdministrationPage = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/examples/provider-connection-administration-page.valid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const boundContractPaths = [
  PROVIDER_ADMIN_REGISTER_REQUEST.schema_path,
  ...Object.values(PROVIDER_ADMIN_RESPONSE_CONTRACTS).map((contract) => contract.schema_path),
  PROVIDER_ADMIN_ACCEPTED_ADAPTER_SNAPSHOT.source_path,
];
const boundContractBytes = Object.fromEntries(
  boundContractPaths.map((path) => [path, readFileSync(new URL(`../../${path}`, import.meta.url))]),
);
const schemaAjv = new Ajv2020({ allErrors: true, strict: false });
addFormats(schemaAjv);
schemaAjv.addSchema(commonSchema);
schemaAjv.addSchema(providerConnectionAdministrationSchema);
const validateProviderAdministrationSchema = schemaAjv.compile(providerAdministrationSchema);
const validateRegisterRequestSchema = schemaAjv.compile(providerConnectionRegisterRequestSchema);
const validateConnectionAdministrationSchema = schemaAjv.getSchema(
  providerConnectionAdministrationSchema.$id,
);
const validateConnectionAdministrationPageSchema = schemaAjv.compile(
  providerConnectionAdministrationPageSchema,
);

function assertSchemaValidity(candidate, expected, label) {
  assert.equal(
    validateProviderAdministrationSchema(candidate),
    expected,
    `${label}: ${JSON.stringify(validateProviderAdministrationSchema.errors)}`,
  );
}

function cloneManifest() {
  return structuredClone(canonicalManifest);
}

function identityProof(subjectId, suffix) {
  return {
    ...evidence("IDENTITY_SUBJECT_PROOF", `identity/${suffix}`),
    identity_authority: "GITHUB_USER_ID",
    subject_id: subjectId,
  };
}

function human(
  role,
  identityRef = "github:faocampo",
  subjectId = "1001",
  proofSuffix = subjectId,
) {
  return {
    actor_type: "HUMAN",
    identity_ref: identityRef,
    identity_authority: "GITHUB_USER_ID",
    subject_id: subjectId,
    identity_proof_ref: identityProof(subjectId, proofSuffix),
    name: "Designated reviewer",
    role,
  };
}

function evidence(evidenceType, suffix, targetEnvironment = "NOT_APPLICABLE") {
  return {
    evidence_type: evidenceType,
    reference: `evidence://${suffix}`,
    content_digest: `sha256:${createHash("sha256")
      .update(`${evidenceType}\0${suffix}\0${targetEnvironment}`)
      .digest("hex")}`,
    source_revision: "b".repeat(40),
    target_environment: targetEnvironment,
    ...PROVIDER_ADMIN_EVIDENCE_SUBJECT,
  };
}

function proofEvidence(caseId, suffix = caseId.toLowerCase()) {
  return {
    ...evidence("PROOF_RESULT", suffix),
    proof_case_id: caseId,
  };
}

function classificationApprovalEvidence(classifications) {
  return {
    ...evidence(
      "CLASSIFICATION_APPROVAL",
      `approved-classifications/${classifications.join("-").toLowerCase()}`,
    ),
    approved_classifications: classifications,
  };
}

function ownerReviewerException() {
  return {
    evidence_type: "OWNER_REVIEWER_EXCEPTION",
    reference: "https://github.com/faocampo/curve/issues/example#issuecomment-example",
    content_digest: `sha256:${"c".repeat(64)}`,
    source_revision: "d".repeat(40),
    target_environment: "NOT_APPLICABLE",
    ...PROVIDER_ADMIN_EVIDENCE_SUBJECT,
    valid_from: "2026-08-30T10:00:00Z",
    valid_until: "2027-03-01T12:00:00Z",
    dispatch_revalidation_required: true,
  };
}

function approvalRoleOverlapException() {
  return {
    evidence_type: "APPROVAL_ROLE_OVERLAP_EXCEPTION",
    reference: "https://github.com/faocampo/curve/issues/example#issuecomment-overlap",
    content_digest: `sha256:${"e".repeat(64)}`,
    source_revision: "f".repeat(40),
    target_environment: "NOT_APPLICABLE",
    ...PROVIDER_ADMIN_EVIDENCE_SUBJECT,
    valid_from: "2026-08-30T10:00:00Z",
    valid_until: "2026-08-30T13:00:00Z",
  };
}

function bindApprovals(manifest) {
  manifest.decided_at = "2026-08-30T12:00:00Z";
  manifest.next_review_at = "2027-02-28T12:00:00Z";
  manifest.last_updated = "2026-08-30T13:00:00Z";
  const digest = providerAdministrationDecisionDigest(manifest);
  manifest.decision_payload_digest = digest;
  const approvers = {
    CURVE_PRODUCT: manifest.owners.decision_owner,
    SECURITY_IDENTITY: manifest.owners.security_identity_owner,
    PLATFORM_ADMINISTRATION: manifest.owners.platform_administration_owner,
  };
  manifest.approvals = PROVIDER_ADMIN_APPROVAL_ROLES.map((approvalRole) => ({
    approval_role: approvalRole,
    approver: structuredClone(approvers[approvalRole]),
    approved_decision_digest: digest,
    approved_at: "2026-08-30T11:00:00Z",
  }));
}

function completeApprovedManifest() {
  const manifest = cloneManifest();
  manifest.status = "DECIDED";
  manifest.decision_outcome = "APPROVED";
  const selections = {
    authority_source: "PLANE_WORKSPACE_ROLE_20",
    action_profile: "COARSE_V3",
    read_visibility: "PLATFORM_ADMINISTRATOR_ONLY",
    membership_rule: "ACTIVE_TARGET_WORKSPACE_REQUIRED",
    separation_rule: "NONE",
    deny_response_profile: "ROLE_DENIAL_403_SCOPE_OR_ABSENCE_404",
    api_exposure_profile: "INTERNAL_API_ONLY",
    environment_classification_scope: "LOCAL_INTERNAL_ONLY",
    owner_reviewer_rule: "SAME_PERSON_BOOTSTRAP_EXCEPTION",
    approval_separation_rule: "THREE_DISTINCT_HUMANS",
    coding_budget_profile: "USD_25_ZERO_PROVIDER_SPEND",
    governance_identity_authority: "GITHUB_USER_ID",
    async_operation_profile: "DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1",
  };
  for (const [optionName, selection] of Object.entries(selections)) {
    manifest.material_options[optionName].selected = selection;
  }
  manifest.dependency_evidence.approved_data_classifications = ["INTERNAL"];
  manifest.dependency_evidence.runtime_activation_refs = [
    evidence("RUNTIME_ACTIVATION", "local-runtime", "LOCAL"),
  ];
  manifest.dependency_evidence.owner_reviewer_exception_ref = ownerReviewerException();
  manifest.owners.security_identity_owner = human(
    "Security identity owner",
    "github:security-owner",
    "1002",
    "security-owner",
  );
  manifest.owners.platform_administration_owner = human(
    "Platform administration owner",
    "github:platform-owner",
    "1003",
    "platform-owner",
  );
  manifest.owners.decision_owner = human("Example Organization CTO", "github:faocampo", "1001", "product");
  manifest.owners.delivery_owner = human(
    "Curve engineering owner",
    "github:example.user",
    "1001",
    "delivery-alias",
  );
  manifest.owners.human_reviewer = human(
    "Current default human reviewer",
    "github:reviewer-alias",
    "1001",
    "reviewer-alias",
  );
  manifest.proof_cases = manifest.proof_cases.map((proofCase) => ({
    ...proofCase,
    status: "PASS",
    evidence_refs: [proofEvidence(proofCase.case_id)],
  }));
  manifest.activation = {
    decision_selected: true,
    successor_policy_materialization_ready: true,
    successor_openapi_materialization_ready: true,
    child_task_packet_materialization_ready: true,
    plane_implementation_authorized: false,
  };
  bindApprovals(manifest);
  manifest.unresolved_requirements = [];
  return manifest;
}

function completeDeferredManifest() {
  const manifest = cloneManifest();
  manifest.status = "DECIDED";
  manifest.decision_outcome = "DEFERRED";
  for (const [optionName, option] of Object.entries(manifest.material_options)) {
    option.selected = optionName === "governance_identity_authority" ? "GITHUB_USER_ID" : "DEFER";
  }
  manifest.owners.decision_owner = human(
    "Example Organization CTO",
    "github:product-owner",
    "2001",
    "deferred-product",
  );
  manifest.owners.security_identity_owner = human(
    "Security identity owner",
    "github:security-owner",
    "2002",
    "deferred-security",
  );
  manifest.owners.platform_administration_owner = human(
    "Platform administration owner",
    "github:platform-owner",
    "2003",
    "deferred-platform",
  );
  manifest.activation.decision_selected = true;
  bindApprovals(manifest);
  manifest.unresolved_requirements = [];
  return manifest;
}

test("canonical M0-S9B1 proposal is exact and fail closed", () => {
  const result = validateProviderAdministrationDecisionSemantics(cloneManifest());
  assert.equal(result.status, "PROPOSED");
  assert.equal(result.outcome, "UNSELECTED");
  assert.equal(result.implementationDispatchAllowed, false);
  assert.equal(result.unresolved.length, 17);
  assert.deepEqual(canonicalManifest.baseline, PROVIDER_ADMIN_BASELINE);
  assert.deepEqual(canonicalManifest.fixed_invariants, PROVIDER_ADMIN_FIXED_INVARIANTS);
  assert.deepEqual(PROVIDER_ADMIN_IDENTITY_AUTHORITIES, [
    "ORGANIZATION_IDP_SUBJECT",
    "PLANE_USER_ID",
    "GITHUB_USER_ID",
  ]);
  assert.deepEqual(canonicalManifest.api_contract.pagination, PROVIDER_ADMIN_PAGINATION);
  assert.deepEqual(
    canonicalManifest.api_contract.idempotency_precondition_profile,
    PROVIDER_ADMIN_IDEMPOTENCY_PRECONDITION_PROFILE,
  );
  assert.deepEqual(
    canonicalManifest.api_contract.accepted_adapter_snapshot,
    PROVIDER_ADMIN_ACCEPTED_ADAPTER_SNAPSHOT,
  );
  assert.deepEqual(
    canonicalManifest.api_contract.register_request,
    PROVIDER_ADMIN_REGISTER_REQUEST,
  );
  assert.deepEqual(
    canonicalManifest.api_contract.response_contracts,
    PROVIDER_ADMIN_RESPONSE_CONTRACTS,
  );
  assert.deepEqual(canonicalManifest.api_contract.operations, PROVIDER_ADMIN_OPERATIONS);
  assert.deepEqual(canonicalManifest.safe_projection.allowed_fields, PROVIDER_ADMIN_SAFE_FIELDS);
  assert.deepEqual(canonicalManifest.safe_projection.blocked_fields, PROVIDER_ADMIN_BLOCKED_FIELDS);
  assert.deepEqual(
    canonicalManifest.safe_projection.nested_shapes,
    PROVIDER_ADMIN_SAFE_NESTED_SHAPES,
  );
  assert.deepEqual(
    canonicalManifest.safe_projection.capability_digest_derivation,
    PROVIDER_ADMIN_CAPABILITY_DIGEST_DERIVATION,
  );
  assert.deepEqual(
    canonicalManifest.dependency_evidence,
    PROVIDER_ADMIN_EMPTY_DEPENDENCY_EVIDENCE,
  );
});

test("candidate schemas remain closed, isolated, and explicitly non-normative", () => {
  for (const schema of [
    providerConnectionRegisterRequestSchema,
    providerConnectionAdministrationSchema,
    providerConnectionAdministrationPageSchema,
  ]) {
    assert.equal(schema.additionalProperties, false);
    assert.equal(schema["x-curve-contract-state"], "PROPOSED_NOT_NORMATIVE");
    assert.equal(schema["x-curve-promotion-decision"], "B-ADMIN-M0-S9B1");
  }
  assert.equal(validateRegisterRequestSchema(providerConnectionRegisterRequest), true);
  assert.equal(validateConnectionAdministrationSchema(providerConnectionAdministration), true);
  assert.equal(
    validateConnectionAdministrationPageSchema(providerConnectionAdministrationPage),
    true,
  );

  const requestWithSecret = {
    ...providerConnectionRegisterRequest,
    secret_reference: "forbidden://secret",
  };
  assert.equal(validateRegisterRequestSchema(requestWithSecret), false);
  const responseWithSecret = {
    ...providerConnectionAdministration,
    secret_reference: "forbidden://secret",
  };
  assert.equal(validateConnectionAdministrationSchema(responseWithSecret), false);
  const oversizedPage = {
    schema_version: "curve.provider-connection-administration-page/v1",
    results: Array.from({ length: 101 }, () => providerConnectionAdministration),
    next_cursor: null,
  };
  assert.equal(validateConnectionAdministrationPageSchema(oversizedPage), false);
});

test("raw schema and accepted-registry bytes are bound into the decision", () => {
  assert.deepEqual(
    validateProviderAdministrationBoundContractBytes(canonicalManifest, boundContractBytes),
    { verified_bindings: 5 },
  );
  const tampered = {
    ...boundContractBytes,
    [PROVIDER_ADMIN_REGISTER_REQUEST.schema_path]: Buffer.concat([
      boundContractBytes[PROVIDER_ADMIN_REGISTER_REQUEST.schema_path],
      Buffer.from(" "),
    ]),
  };
  assert.throws(
    () => validateProviderAdministrationBoundContractBytes(canonicalManifest, tampered),
    /raw-byte contract digest changed/,
  );
});

test("registration coordinates are limited to the accepted M0-S9A adapter snapshot", () => {
  assert.deepEqual(
    validateProviderRegistrationCoordinates(canonicalManifest, providerConnectionRegisterRequest),
    PROVIDER_ADMIN_ACCEPTED_ADAPTER_SNAPSHOT.accepted_coordinates[0],
  );
  assert.throws(
    () =>
      validateProviderRegistrationCoordinates(canonicalManifest, {
        ...providerConnectionRegisterRequest,
        adapter_key: "curve.unreviewed",
      }),
    /absent from the accepted adapter snapshot/,
  );
  assert.throws(
    () =>
      validateProviderRegistrationCoordinates(canonicalManifest, {
        ...providerConnectionRegisterRequest,
        allowed_classifications: ["INTERNAL", "CONFIDENTIAL"],
      }),
    /exceed the accepted adapter scope/,
  );
});

test("capability digests use the published deterministic derivation", () => {
  const observation = {
    workspace_id: "22222222-2222-4222-8222-222222222222",
    connection_id: "11111111-1111-4111-8111-111111111111",
    provider_type: "FAKE_LOCAL",
    adapter_key: "curve.fake-local",
    adapter_version: "1.0.0",
    protocol_versions: ["curve.fake-local/v1"],
    capabilities: [
      { enabled: true, name: "DESCRIBE", risk: "READ", schema_uri: null },
    ],
    allowed_classifications: ["INTERNAL"],
  };
  assert.equal(
    providerCapabilityDigest(observation),
    "sha256:40ad6f86df96105b0581f3f307c690a4727a11b345aa4dbe791d6e235514a759",
  );
  assert.equal(
    providerCapabilityDigest({ ...observation, observed_at: "2099-01-01T00:00:00Z" }),
    providerCapabilityDigest(observation),
  );
  assert.notEqual(
    providerCapabilityDigest({
      ...observation,
      capabilities: [
        ...observation.capabilities,
        { enabled: true, name: "EXECUTE", risk: "WRITE", schema_uri: null },
      ],
    }),
    providerCapabilityDigest(observation),
  );
});

test("idempotency replay authorizes before lookup and returns a current safe projection", () => {
  const profile = canonicalManifest.api_contract.idempotency_precondition_profile;
  assert.equal(
    profile.evaluation_order[0],
    "AUTHORIZE_CURRENT_REQUEST_WITH_OPERATION_LOOKUP_SEQUENCE",
  );
  assert.equal(profile.record_payload, "STATUS_DIGEST_RESOURCE_REF_NO_RESPONSE_BODY");
  assert.equal(
    profile.matching_terminal_command,
    "RESOLVE_CURRENT_AUTHORIZED_SAFE_PROJECTION_FROM_STORED_RESOURCE_REF",
  );
  assert.equal(profile.historical_response_body, "NOT_STORED");
  assert.equal(profile.replay_response_etag, "CURRENT_RESOURCE_AGGREGATE_VERSION");
});

test("selected asynchronous operation types remain guarded by successor materialization", () => {
  const summary = canonicalManifest.api_contract.response_contracts.OPERATION_SUMMARY_V1;
  assert.equal(summary.selected_operation_type_materialization_required, true);
  assert.ok(summary.accepted_operation_types.includes("PROVIDER_RECONCILIATION"));
  assert.ok(summary.candidate_operation_types.includes("PROVIDER_ADMINISTRATION"));
  assert.ok(summary.candidate_operation_types.includes("PROVIDER_VALIDATION"));
});

test("material alternative catalogs are exact and every proposal selection is empty", () => {
  for (const [optionName, allowed] of Object.entries(PROVIDER_ADMIN_OPTION_CATALOG)) {
    assert.deepEqual(canonicalManifest.material_options[optionName], {
      allowed,
      selected: null,
    });
  }
});

test("the schema-negative fixture isolates forbidden implementation dispatch", () => {
  assert.equal(invalidManifest.implementation_dispatch_allowed, true);
  const restored = structuredClone(invalidManifest);
  restored.implementation_dispatch_allowed = false;
  assert.deepEqual(restored, canonicalManifest);
});

test("the candidate API has eight unique operations with exact header semantics", () => {
  const operations = canonicalManifest.api_contract.operations;
  assert.equal(new Set(operations.map((operation) => operation.operation_id)).size, 8);
  assert.equal(new Set(operations.map((operation) => `${operation.method} ${operation.path}`)).size, 8);

  for (const operation of operations) {
    const workspaceOnly = ["LIST", "REGISTER"].includes(operation.operation_id);
    assert.equal(
      operation.authorization_resource_type,
      workspaceOnly ? "WORKSPACE" : "PROVIDER_CONNECTION",
    );
    assert.equal(
      operation.lookup_sequence,
      workspaceOnly
        ? "WORKSPACE_AUTHORIZATION_ONLY"
        : "WORKSPACE_PREAUTHORIZE_SCOPED_SAFE_LOOKUP_RESOURCE_AUTHORIZE",
    );
    if (operation.kind === "QUERY") assert.deepEqual(operation.required_headers, []);
    else if (operation.operation_id === "REGISTER") {
      assert.deepEqual(operation.required_headers, ["Idempotency-Key"]);
    } else {
      assert.deepEqual(operation.required_headers, ["Idempotency-Key", "If-Match"]);
    }
    assert.equal(
      operation.request_body_contract,
      operation.operation_id === "REGISTER"
        ? "PROVIDER_CONNECTION_REGISTER_REQUEST_V1"
        : "NONE",
    );
  }

  const operationById = Object.fromEntries(
    operations.map((operation) => [operation.operation_id, operation]),
  );
  assert.deepEqual(
    [
      operationById.LIST.precondition_resource,
      operationById.LIST.response_etag_resource,
    ],
    ["NONE", "NONE"],
  );
  for (const operationId of ["REGISTER", "READ"]) {
    assert.deepEqual(
      [
        operationById[operationId].precondition_resource,
        operationById[operationId].response_etag_resource,
      ],
      ["NONE", "PROVIDER_CONNECTION"],
    );
  }
  for (const operationId of ["VALIDATE", "RECONCILE"]) {
    assert.deepEqual(
      [
        operationById[operationId].precondition_resource,
        operationById[operationId].response_etag_resource,
      ],
      ["PROVIDER_CONNECTION", "OPERATION"],
    );
    assert.deepEqual(operationById[operationId].operation_type_options, {
      SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1: "PROVIDER_ADMINISTRATION",
      DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1:
        operationId === "VALIDATE" ? "PROVIDER_VALIDATION" : "PROVIDER_RECONCILIATION",
    });
  }
  for (const operationId of ["DISABLE", "ENABLE", "REVOKE"]) {
    assert.deepEqual(
      [
        operationById[operationId].precondition_resource,
        operationById[operationId].response_etag_resource,
      ],
      ["PROVIDER_CONNECTION", "PROVIDER_CONNECTION"],
    );
  }
});

test("coarse and granular policy profiles cover the exact operation set", () => {
  const coarse = new Set(PROVIDER_ADMIN_OPERATIONS.map((operation) => operation.coarse_action));
  const granular = new Set(PROVIDER_ADMIN_OPERATIONS.map((operation) => operation.granular_action));
  assert.deepEqual(
    [...coarse].sort(),
    [
      "CURVE.PROVIDER_CONNECTION.ADMINISTER",
      "CURVE.PROVIDER_CONNECTION.LIST",
      "CURVE.PROVIDER_CONNECTION.READ",
      "CURVE.PROVIDER_CONNECTION.REGISTER",
    ],
  );
  assert.deepEqual(
    [...granular].sort(),
    [
      "CURVE.PROVIDER_CONNECTION.DISABLE",
      "CURVE.PROVIDER_CONNECTION.ENABLE",
      "CURVE.PROVIDER_CONNECTION.LIST",
      "CURVE.PROVIDER_CONNECTION.READ",
      "CURVE.PROVIDER_CONNECTION.RECONCILE",
      "CURVE.PROVIDER_CONNECTION.REGISTER",
      "CURVE.PROVIDER_CONNECTION.REVOKE",
      "CURVE.PROVIDER_CONNECTION.VALIDATE",
    ],
  );
});

test("safe projection and blocked fields never overlap", () => {
  assert.equal(
    PROVIDER_ADMIN_SAFE_FIELDS.some((field) => PROVIDER_ADMIN_BLOCKED_FIELDS.includes(field)),
    false,
  );
  for (const blocked of [
    "secret_reference",
    "configuration_ref",
    "endpoint_url",
    "raw_provider_body",
    "provider_token",
    "created_by",
  ]) {
    assert.ok(PROVIDER_ADMIN_BLOCKED_FIELDS.includes(blocked));
  }
});

for (const [name, mutate, pattern] of [
  [
    "caller-selected workspace in registration",
    (manifest) => { manifest.api_contract.register_request.allowed_fields.push("workspace_id"); },
    /register-request contract changed/,
  ],
  [
    "changed exact baseline",
    (manifest) => { manifest.baseline.parent_packet_version = "0.1"; },
    /exact baseline changed/,
  ],
  [
    "premature material selection",
    (manifest) => { manifest.material_options.authority_source.selected = "PLANE_WORKSPACE_ROLE_20"; },
    /unresolved requirements|cannot carry a material selection/,
  ],
  [
    "nested safe projection with a detail reference",
    (manifest) => { manifest.safe_projection.nested_shapes.last_error.required_fields.push("detail_ref"); },
    /nested safe projection changed/,
  ],
  [
    "premature contract activation",
    (manifest) => { manifest.activation.successor_openapi_materialization_ready = true; },
    /must remain fail closed/,
  ],
  [
    "implementation authority",
    (manifest) => { manifest.implementation_dispatch_allowed = true; },
    /cannot authorize Plane implementation/,
  ],
  [
    "agent authority",
    (manifest) => { manifest.fixed_invariants.agent_authority = true; },
    /fixed security invariants changed/,
  ],
  [
    "caller supplied role",
    (manifest) => { manifest.fixed_invariants.caller_supplied_role = "ALLOW"; },
    /fixed security invariants changed/,
  ],
  [
    "removed API operation",
    (manifest) => { manifest.api_contract.operations.pop(); },
    /operation contract changed/,
  ],
  [
    "caller body on a bodyless operation",
    (manifest) => {
      manifest.api_contract.operations.find(
        (operation) => operation.operation_id === "VALIDATE",
      ).request_body_contract = "PROVIDER_CONNECTION_REGISTER_REQUEST_V1";
    },
    /operation contract changed/,
  ],
  [
    "ambiguous async operation mapping",
    (manifest) => {
      delete manifest.api_contract.operations.find(
        (operation) => operation.operation_id === "RECONCILE",
      ).operation_type_options.DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1;
    },
    /operation contract changed/,
  ],
  [
    "secret-bearing safe projection",
    (manifest) => { manifest.safe_projection.allowed_fields.push("secret_reference"); },
    /safe projection changed/,
  ],
  [
    "changed alternative catalog",
    (manifest) => { manifest.material_options.authority_source.allowed.push("CALLER_ROLE"); },
    /alternatives changed/,
  ],
  [
    "changed proof inventory",
    (manifest) => { manifest.proof_cases[0].case_id = "UNREVIEWED_PROOF"; },
    /proof-case inventory changed/,
  ],
  [
    "reserved migration",
    (manifest) => { manifest.baseline.plane_migration_reserved = true; },
    /exact baseline changed/,
  ],
]) {
  test(`proposal rejects ${name}`, () => {
    const manifest = cloneManifest();
    mutate(manifest);
    assert.throws(() => validateProviderAdministrationDecisionSemantics(manifest), pattern);
  });
}

test("a complete non-deferred decision enables only successor contract preparation", () => {
  const manifest = completeApprovedManifest();
  const result = validateProviderAdministrationDecisionSemantics(manifest);
  assert.equal(result.status, "DECIDED");
  assert.equal(result.outcome, "APPROVED");
  assert.deepEqual(result.unresolved, []);
  assert.equal(result.implementationDispatchAllowed, false);
  assert.match(result.decisionPayloadDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.activation.child_task_packet_materialization_ready, true);
  assert.equal(manifest.activation.plane_implementation_authorized, false);
});

test("a decided defer selection keeps every successor contract disabled", () => {
  const manifest = completeDeferredManifest();
  const result = validateProviderAdministrationDecisionSemantics(manifest);
  assert.equal(result.outcome, "DEFERRED");
  assert.equal(result.implementationDispatchAllowed, false);
  assert.equal(Object.values(manifest.activation).filter(Boolean).length, 1);
});

test("every documented DEFER choice is reachable in one valid deferred decision", () => {
  const manifest = completeDeferredManifest();
  const deferCapableOptions = Object.entries(PROVIDER_ADMIN_OPTION_CATALOG)
    .filter(([, allowed]) => allowed.includes("DEFER"))
    .map(([optionName]) => optionName);
  assert.equal(deferCapableOptions.length, 12);
  for (const optionName of deferCapableOptions) {
    assert.equal(manifest.material_options[optionName].selected, "DEFER", optionName);
  }
  assert.equal(
    manifest.material_options.governance_identity_authority.selected,
    "GITHUB_USER_ID",
  );
  assert.equal(validateProviderAdministrationDecisionSemantics(manifest).outcome, "DEFERRED");
});

test("published completed-state fixtures pass semantic validation", () => {
  assert.equal(
    validateProviderAdministrationDecisionSemantics(structuredClone(approvedFixture)).outcome,
    "APPROVED",
  );
  assert.equal(
    validateProviderAdministrationDecisionSemantics(structuredClone(deferredFixture)).outcome,
    "DEFERRED",
  );
});

test("published proposal and completed-state fixtures pass the lifecycle schema", () => {
  assertSchemaValidity(canonicalManifest, true, "proposal");
  assertSchemaValidity(approvedFixture, true, "approved");
  assertSchemaValidity(deferredFixture, true, "deferred");
});

for (const [name, source, mutate] of [
  [
    "proposed record carrying an approved outcome",
    canonicalManifest,
    (candidate) => { candidate.decision_outcome = "APPROVED"; },
  ],
  [
    "decided record carrying an unselected outcome",
    approvedFixture,
    (candidate) => { candidate.decision_outcome = "UNSELECTED"; },
  ],
  [
    "proposed record carrying activation",
    canonicalManifest,
    (candidate) => { candidate.activation.decision_selected = true; },
  ],
  [
    "proposed record carrying a decision timestamp",
    canonicalManifest,
    (candidate) => { candidate.decided_at = "2026-08-30T12:00:00Z"; },
  ],
  [
    "decided record with fewer than three approvals",
    approvedFixture,
    (candidate) => { candidate.approvals.pop(); },
  ],
  [
    "decided record with duplicate governance roles",
    approvedFixture,
    (candidate) => { candidate.approvals[1].approval_role = "CURVE_PRODUCT"; },
  ],
  [
    "deferred record carrying implementation evidence",
    deferredFixture,
    (candidate) => {
      candidate.dependency_evidence.runtime_activation_refs = [
        evidence("RUNTIME_ACTIVATION", "forbidden-deferred-evidence", "LOCAL"),
      ];
    },
  ],
  [
    "approved record with a non-passing proof",
    approvedFixture,
    (candidate) => { candidate.proof_cases[0].status = "NOT_RUN"; },
  ],
  [
    "approved record with missing proof evidence",
    approvedFixture,
    (candidate) => { candidate.proof_cases[0].evidence_refs = []; },
  ],
  [
    "approved record with the wrong proof evidence type",
    approvedFixture,
    (candidate) => {
      candidate.proof_cases[0].evidence_refs[0].evidence_type = "RETENTION_DECISION";
    },
  ],
  [
    "approved record with deferred activation",
    approvedFixture,
    (candidate) => { candidate.activation.successor_policy_materialization_ready = false; },
  ],
  [
    "deferred record with successor activation",
    deferredFixture,
    (candidate) => { candidate.activation.child_task_packet_materialization_ready = true; },
  ],
]) {
  test(`lifecycle schema rejects ${name}`, () => {
    const candidate = structuredClone(source);
    mutate(candidate);
    assertSchemaValidity(candidate, false, name);
  });
}

test("a deferred decision requires three distinct governance identities", () => {
  const manifest = completeDeferredManifest();
  manifest.owners.security_identity_owner = structuredClone(manifest.owners.decision_owner);
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /three distinct governance approvers/,
  );
});

test("canonical identity subjects prevent distinct aliases from representing one approver", () => {
  const manifest = completeApprovedManifest();
  const productOwner = manifest.owners.decision_owner;
  manifest.owners.security_identity_owner = {
    ...structuredClone(productOwner),
    identity_ref: "github:a-different-visible-alias",
    role: "Security identity owner",
  };
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /three-distinct-human approval rule is not met/,
  );
});

test("canonical identity proof must match its authority and subject", () => {
  const manifest = completeApprovedManifest();
  manifest.owners.security_identity_owner.identity_proof_ref.subject_id = "9999";
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /human identity is not bound to the selected canonical authority/,
  );
});

test("proof evidence must bind the containing proof case", () => {
  const manifest = completeApprovedManifest();
  manifest.proof_cases[1].evidence_refs[0].proof_case_id = manifest.proof_cases[0].case_id;
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /proof evidence is not bound to its containing case/,
  );
});

test("one proof artifact cannot satisfy multiple proof cases", () => {
  const manifest = completeApprovedManifest();
  const reused = structuredClone(manifest.proof_cases[0].evidence_refs[0]);
  reused.proof_case_id = manifest.proof_cases[1].case_id;
  manifest.proof_cases[1].evidence_refs = [reused];
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /proof evidence reuses one content digest/,
  );
});

test("proof evidence integrity is enforced in NOT_RUN, FAIL, and PASS states", () => {
  const failedProof = cloneManifest();
  failedProof.proof_cases[0] = {
    ...failedProof.proof_cases[0],
    status: "FAIL",
    evidence_refs: [proofEvidence(failedProof.proof_cases[0].case_id, "failed-proof")],
  };
  assert.equal(validateProviderAdministrationDecisionSemantics(failedProof).status, "PROPOSED");

  const failWithoutEvidence = cloneManifest();
  failWithoutEvidence.proof_cases[0].status = "FAIL";
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(failWithoutEvidence),
    /completed proof case requires evidence/,
  );

  const notRunWithEvidence = cloneManifest();
  notRunWithEvidence.proof_cases[0].evidence_refs = [
    proofEvidence(notRunWithEvidence.proof_cases[0].case_id, "premature-proof"),
  ];
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(notRunWithEvidence),
    /NOT_RUN proof case cannot carry evidence/,
  );
});

test("dependency and proof evidence cannot reuse a digest or artifact locator", () => {
  const digestAlias = completeApprovedManifest();
  digestAlias.dependency_evidence.runtime_activation_refs[0].content_digest =
    digestAlias.proof_cases[0].evidence_refs[0].content_digest;
  bindApprovals(digestAlias);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(digestAlias),
    /unique content digest per artifact/,
  );

  const locatorAlias = completeApprovedManifest();
  locatorAlias.dependency_evidence.runtime_activation_refs[0].reference =
    locatorAlias.proof_cases[0].evidence_refs[0].reference;
  locatorAlias.dependency_evidence.runtime_activation_refs[0].source_revision =
    locatorAlias.proof_cases[0].evidence_refs[0].source_revision;
  bindApprovals(locatorAlias);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(locatorAlias),
    /unique artifact locator/,
  );
});

test("the fourteenth proof closes accepted-adapter allowlist and scope enforcement", () => {
  assert.equal(PROVIDER_ADMIN_PROOF_CASES.length, 14);
  assert.equal(PROVIDER_ADMIN_PROOF_CASES.at(-1), "REGISTRATION_ALLOWLIST_AND_SCOPE_CEILING");
  const approved = completeApprovedManifest();
  const proof = approved.proof_cases.at(-1);
  assert.equal(proof.status, "PASS");
  assert.equal(proof.evidence_refs[0].proof_case_id, proof.case_id);
});

test("Plane governance subjects use canonical lowercase UUIDs", () => {
  const manifest = completeApprovedManifest();
  manifest.material_options.governance_identity_authority.selected = "PLANE_USER_ID";
  const ids = {
    decision_owner: "10000000-0000-4000-8000-000000000001",
    delivery_owner: "10000000-0000-4000-8000-000000000001",
    human_reviewer: "10000000-0000-4000-8000-000000000001",
    security_identity_owner: "10000000-0000-4000-8000-000000000002",
    platform_administration_owner: "10000000-0000-4000-8000-000000000003",
  };
  for (const [ownerName, subjectId] of Object.entries(ids)) {
    const owner = manifest.owners[ownerName];
    owner.identity_authority = "PLANE_USER_ID";
    owner.subject_id = subjectId;
    owner.identity_proof_ref.identity_authority = "PLANE_USER_ID";
    owner.identity_proof_ref.subject_id = subjectId;
  }
  bindApprovals(manifest);
  assert.equal(validateProviderAdministrationDecisionSemantics(manifest).outcome, "APPROVED");

  manifest.owners.security_identity_owner.subject_id =
    "AAAAAAAA-0000-4000-8000-000000000002";
  manifest.owners.security_identity_owner.identity_proof_ref.subject_id =
    "AAAAAAAA-0000-4000-8000-000000000002";
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /human identity is not bound to the selected canonical authority/,
  );
});

test("canonical identity subjects reject leading or trailing whitespace", () => {
  const manifest = completeApprovedManifest();
  manifest.material_options.governance_identity_authority.selected = "ORGANIZATION_IDP_SUBJECT";
  const ids = {
    decision_owner: "example:user-1",
    delivery_owner: "example:user-1",
    human_reviewer: "example:user-1",
    security_identity_owner: "example:user-2",
    platform_administration_owner: "example:user-3",
  };
  for (const [ownerName, subjectId] of Object.entries(ids)) {
    const owner = manifest.owners[ownerName];
    owner.identity_authority = "ORGANIZATION_IDP_SUBJECT";
    owner.subject_id = subjectId;
    owner.identity_proof_ref.identity_authority = "ORGANIZATION_IDP_SUBJECT";
    owner.identity_proof_ref.subject_id = subjectId;
  }
  bindApprovals(manifest);
  assert.equal(validateProviderAdministrationDecisionSemantics(manifest).outcome, "APPROVED");

  manifest.owners.security_identity_owner.subject_id = " example:user-2";
  manifest.owners.security_identity_owner.identity_proof_ref.subject_id = " example:user-2";
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /human identity is not bound to the selected canonical authority/,
  );
});

test("classification approval evidence covers the exact approved classification set", () => {
  const manifest = completeApprovedManifest();
  manifest.material_options.environment_classification_scope.selected =
    "ALL_ENVIRONMENTS_APPROVED_CLASSES";
  manifest.dependency_evidence.runtime_activation_refs = [
    evidence("RUNTIME_ACTIVATION", "local", "LOCAL"),
    evidence("RUNTIME_ACTIVATION", "staging", "STAGING"),
    evidence("RUNTIME_ACTIVATION", "production", "PRODUCTION"),
  ];
  manifest.dependency_evidence.retention_decision_refs = [
    evidence("RETENTION_DECISION", "d-009"),
  ];
  manifest.dependency_evidence.approved_data_classifications = [
    "INTERNAL",
    "CONFIDENTIAL",
  ];
  manifest.dependency_evidence.data_classification_approval_refs = [
    classificationApprovalEvidence(["INTERNAL"]),
  ];
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /must exactly cover approved classifications/,
  );
});

test("classification aliases cannot expand one approval artifact to another class", () => {
  const manifest = completeApprovedManifest();
  manifest.material_options.environment_classification_scope.selected =
    "ALL_ENVIRONMENTS_APPROVED_CLASSES";
  manifest.dependency_evidence.runtime_activation_refs = [
    evidence("RUNTIME_ACTIVATION", "local", "LOCAL"),
    evidence("RUNTIME_ACTIVATION", "staging", "STAGING"),
    evidence("RUNTIME_ACTIVATION", "production", "PRODUCTION"),
  ];
  manifest.dependency_evidence.retention_decision_refs = [
    evidence("RETENTION_DECISION", "d-009"),
  ];
  manifest.dependency_evidence.approved_data_classifications = [
    "INTERNAL",
    "RESTRICTED",
  ];
  const internalApproval = classificationApprovalEvidence(["INTERNAL"]);
  const restrictedAlias = classificationApprovalEvidence(["RESTRICTED"]);
  restrictedAlias.reference = internalApproval.reference;
  restrictedAlias.source_revision = internalApproval.source_revision;
  restrictedAlias.content_digest = internalApproval.content_digest;
  manifest.dependency_evidence.data_classification_approval_refs = [
    internalApproval,
    restrictedAlias,
  ];
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /classification approvals cannot reuse one evidence artifact/,
  );
});

test("dependency evidence must bind the exact decision, package, and repository", () => {
  const manifest = completeApprovedManifest();
  manifest.dependency_evidence.runtime_activation_refs[0].decision_id = "B-OTHER";
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /runtime_activation_refs must contain exact digest-bound RUNTIME_ACTIVATION evidence/,
  );
});

test("decided record chronology requires last_updated at or after the decision", () => {
  const manifest = completeApprovedManifest();
  manifest.last_updated = "2026-08-30T11:30:00Z";
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /last update must be at or after the decision time/,
  );
});

test("a decided record requires its next review after the decision", () => {
  const manifest = completeApprovedManifest();
  manifest.next_review_at = manifest.decided_at;
  bindApprovals(manifest);
  manifest.next_review_at = manifest.decided_at;
  const digest = providerAdministrationDecisionDigest(manifest);
  manifest.decision_payload_digest = digest;
  for (const approval of manifest.approvals) approval.approved_decision_digest = digest;
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /next review must follow the decision time/,
  );
});

for (const [name, mutate, pattern] of [
  [
    "arbitrary security approver",
    (manifest) => {
      manifest.approvals.find((approval) => approval.approval_role === "SECURITY_IDENTITY")
        .approver.identity_ref = "github:unassigned-security-reviewer";
    },
    /unresolved requirements|three digest-bound human approvals/,
  ],
  [
    "undigested proof reference",
    (manifest) => { manifest.proof_cases[0].evidence_refs = ["evidence://self-asserted"]; },
    /proof evidence is not bound to its containing case/,
  ],
  [
    "forged digest",
    (manifest) => { manifest.decision_payload_digest = `sha256:${"0".repeat(64)}`; },
    /decision digest mismatch/,
  ],
  [
    "approval at decision time",
    (manifest) => { manifest.approvals[0].approved_at = manifest.decided_at; },
    /approvals must precede/,
  ],
  [
    "same-person review without exception",
    (manifest) => { manifest.dependency_evidence.owner_reviewer_exception_ref = null; },
    /same-person exception requires/,
  ],
  [
    "staging without runtime evidence",
    (manifest) => {
      manifest.material_options.environment_classification_scope.selected =
        "LOCAL_AND_STAGING_INTERNAL";
    },
    /runtime activation evidence does not cover/,
  ],
  [
    "staging without retention-decision evidence",
    (manifest) => {
      manifest.material_options.environment_classification_scope.selected =
        "LOCAL_AND_STAGING_INTERNAL";
      manifest.dependency_evidence.runtime_activation_refs = [
        evidence("RUNTIME_ACTIVATION", "local", "LOCAL"),
        evidence("RUNTIME_ACTIVATION", "staging", "STAGING"),
      ];
    },
    /staging scope requires D-009/,
  ],
  [
    "expired same-person exception",
    (manifest) => {
      manifest.dependency_evidence.owner_reviewer_exception_ref.valid_until =
        "2026-08-30T11:30:00Z";
    },
    /same-person exception must cover the next review/,
  ],
  [
    "same-person exception without dispatch revalidation",
    (manifest) => {
      manifest.dependency_evidence.owner_reviewer_exception_ref.dispatch_revalidation_required =
        false;
    },
    /owner\/reviewer exception is not exact and time-bounded/,
  ],
  [
    "same-person exception expiring exactly at the next review",
    (manifest) => {
      manifest.dependency_evidence.owner_reviewer_exception_ref.valid_until =
        manifest.next_review_at;
    },
    /same-person exception must cover the next review/,
  ],
  [
    "dedicated revoker without a separation policy",
    (manifest) => {
      manifest.material_options.separation_rule.selected = "DEDICATED_REVOKE_APPROVER";
    },
    /dedicated revoker requires/,
  ],
  [
    "all environments without classification approval",
    (manifest) => {
      manifest.material_options.environment_classification_scope.selected =
        "ALL_ENVIRONMENTS_APPROVED_CLASSES";
      manifest.dependency_evidence.runtime_activation_refs = [
        evidence("RUNTIME_ACTIVATION", "local", "LOCAL"),
        evidence("RUNTIME_ACTIVATION", "staging", "STAGING"),
        evidence("RUNTIME_ACTIVATION", "production", "PRODUCTION"),
      ];
      manifest.dependency_evidence.retention_decision_refs = [
        evidence("RETENTION_DECISION", "d-009"),
      ];
    },
    /explicit approved classifications/,
  ],
  [
    "UI without UX evidence",
    (manifest) => {
      manifest.material_options.api_exposure_profile.selected = "API_AND_CURVE_ADMIN_UI";
    },
    /API and UI exposure requires approved UX contract evidence/,
  ],
  [
    "custom budget without a lower ceiling",
    (manifest) => {
      manifest.material_options.coding_budget_profile.selected =
        "OWNER_SPECIFIED_LOWER_CEILING";
    },
    /custom coding ceiling must be/,
  ],
]) {
  test(`approved decision rejects ${name}`, () => {
    const manifest = completeApprovedManifest();
    mutate(manifest);
    const digest = providerAdministrationDecisionDigest(manifest);
    if (name !== "forged digest") {
      manifest.decision_payload_digest = digest;
      for (const approval of manifest.approvals) approval.approved_decision_digest = digest;
    }
    assert.throws(() => validateProviderAdministrationDecisionSemantics(manifest), pattern);
  });
}

test("approved decision requires the exact authority/membership tuple", () => {
  const manifest = completeApprovedManifest();
  manifest.material_options.membership_rule.selected =
    "ACTIVE_TARGET_WORKSPACE_AND_INSTANCE_ADMIN_REQUIRED";
  const digest = providerAdministrationDecisionDigest(manifest);
  manifest.decision_payload_digest = digest;
  for (const approval of manifest.approvals) approval.approved_decision_digest = digest;
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /authority source and membership rule are incompatible/,
  );
});

test("three-distinct-human governance rejects owner identity overlap", () => {
  const manifest = completeApprovedManifest();
  manifest.owners.security_identity_owner = structuredClone(manifest.owners.decision_owner);
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /three-distinct-human approval rule is not met/,
  );
});

test("time-bound multi-role governance accepts a digest-bound active exception", () => {
  const manifest = completeApprovedManifest();
  manifest.material_options.approval_separation_rule.selected =
    "MULTI_ROLE_TIME_BOUND_EXCEPTION";
  manifest.owners.security_identity_owner = structuredClone(manifest.owners.decision_owner);
  manifest.dependency_evidence.approval_role_overlap_exception_ref =
    approvalRoleOverlapException();
  bindApprovals(manifest);
  const result = validateProviderAdministrationDecisionSemantics(manifest);
  assert.equal(result.outcome, "APPROVED");
  assert.deepEqual(result.unresolved, []);
});

for (const [name, mutate, pattern] of [
  [
    "missing exception",
    () => {},
    /multi-role approvals require an actual overlap and exception/,
  ],
  [
    "expired exception",
    (manifest) => {
      manifest.dependency_evidence.approval_role_overlap_exception_ref =
        approvalRoleOverlapException();
      manifest.dependency_evidence.approval_role_overlap_exception_ref.valid_until =
        "2026-08-30T11:30:00Z";
    },
    /approval-role overlap exception must be valid at decision time/,
  ],
]) {
  test(`time-bound multi-role governance rejects ${name}`, () => {
    const manifest = completeApprovedManifest();
    manifest.material_options.approval_separation_rule.selected =
      "MULTI_ROLE_TIME_BOUND_EXCEPTION";
    manifest.owners.security_identity_owner = structuredClone(manifest.owners.decision_owner);
    mutate(manifest);
    bindApprovals(manifest);
    assert.throws(() => validateProviderAdministrationDecisionSemantics(manifest), pattern);
  });
}

test("runtime activation evidence is bound to the selected environment", () => {
  const manifest = completeApprovedManifest();
  manifest.dependency_evidence.runtime_activation_refs = [
    evidence("RUNTIME_ACTIVATION", "wrong-environment", "STAGING"),
  ];
  bindApprovals(manifest);
  assert.throws(
    () => validateProviderAdministrationDecisionSemantics(manifest),
    /runtime activation evidence does not cover the selected environments/,
  );
});

test("each selected runtime environment requires a distinct evidence artifact", () => {
  for (const aliasKind of ["digest", "locator"]) {
    const manifest = completeApprovedManifest();
    manifest.material_options.environment_classification_scope.selected =
      "LOCAL_AND_STAGING_INTERNAL";
    const local = evidence("RUNTIME_ACTIVATION", `local-${aliasKind}`, "LOCAL");
    const staging = evidence("RUNTIME_ACTIVATION", `staging-${aliasKind}`, "STAGING");
    if (aliasKind === "digest") staging.content_digest = local.content_digest;
    else {
      staging.reference = local.reference;
      staging.source_revision = local.source_revision;
    }
    manifest.dependency_evidence.runtime_activation_refs = [local, staging];
    manifest.dependency_evidence.retention_decision_refs = [
      evidence("RETENTION_DECISION", `d-009-${aliasKind}`),
    ];
    bindApprovals(manifest);
    assert.throws(
      () => validateProviderAdministrationDecisionSemantics(manifest),
      /runtime_activation_refs cannot reuse one evidence artifact/,
      aliasKind,
    );
  }
});

test("approval digest changes with every material contract surface", () => {
  const manifest = completeApprovedManifest();
  const original = providerAdministrationDecisionDigest(manifest);
  for (const mutate of [
    (candidate) => { candidate.material_options.action_profile.selected = "GRANULAR_V3"; },
    (candidate) => { candidate.api_contract.operations[0].success_status = 201; },
    (candidate) => { candidate.safe_projection.allowed_fields.push("unreviewed_field"); },
    (candidate) => { candidate.proof_cases[0].evidence_refs = ["evidence://changed"]; },
    (candidate) => { candidate.owners.delivery_owner.identity_ref = "github:another-owner"; },
    (candidate) => { candidate.decided_at = "2026-08-30T12:00:01Z"; },
    (candidate) => { candidate.next_review_at = "2027-03-01T12:00:00Z"; },
  ]) {
    const candidate = structuredClone(manifest);
    mutate(candidate);
    assert.notEqual(providerAdministrationDecisionDigest(candidate), original);
  }
});

test("published proof and approval inventories remain exact", () => {
  assert.deepEqual(
    canonicalManifest.proof_cases.map((proofCase) => proofCase.case_id),
    PROVIDER_ADMIN_PROOF_CASES,
  );
  assert.deepEqual(PROVIDER_ADMIN_APPROVAL_ROLES, [
    "CURVE_PRODUCT",
    "SECURITY_IDENTITY",
    "PLATFORM_ADMINISTRATION",
  ]);
});

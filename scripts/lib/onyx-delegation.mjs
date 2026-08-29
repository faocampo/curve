import { createHash } from "node:crypto";

export const ONYX_PROOF_CASE_IDS = Object.freeze([
  "AUDIENCE_MISMATCH",
  "AUDIT_ATTRIBUTION",
  "CREDENTIAL_AND_BODY_LEAK_SCAN",
  "DURABLE_WAIT_REAUTHORIZATION",
  "EXPIRED_GRANT",
  "OUTAGE_RATE_LIMIT_CANCELLATION_RECONCILIATION",
  "PROMPT_INJECTION_CONTAINMENT",
  "REVOKED_GRANT",
  "SOURCE_DELETION_OR_ACCESS_CHANGE",
  "SUBJECT_SWAP",
  "TWO_USER_ACL",
  "WORKSPACE_MISMATCH",
]);

export const ONYX_APPROVAL_ROLES = Object.freeze([
  "CURVE_PRODUCT",
  "ONYX_OPERATIONS",
  "SECURITY_IDENTITY",
]);

const REQUIRED_PROHIBITED_CAPABILITIES = Object.freeze([
  "ADMINISTRATION",
  "AGENT_WRITE",
  "CHAT_HISTORY_READ",
  "CONNECTOR_MANAGEMENT",
  "DOCUMENT_MUTATION",
  "USER_MANAGEMENT",
]);

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

export function computeOnyxDecisionPayloadDigest(record) {
  const {
    approvals: _approvals,
    activation: _activation,
    decision_payload_digest: _decisionPayloadDigest,
    status: _status,
    unresolved_requirements: _unresolvedRequirements,
    ...decisionPayload
  } = record;
  return `sha256:${createHash("sha256")
    .update("curve-onyx-delegation-decision:v1\0")
    .update(JSON.stringify(canonicalJson(decisionPayload)))
    .digest("hex")}`;
}

function endpointComplete(endpoint) {
  return Boolean(endpoint?.method && endpoint?.path && endpoint?.response_schema_digest);
}

export function unresolvedOnyxRequirements(record) {
  const unresolved = [];
  const source = record.source_boundary ?? {};
  const mechanism = record.mechanism ?? {};
  const principal = record.principal_binding ?? {};
  const lifecycle = record.credential_lifecycle ?? {};
  const api = record.api_profile ?? {};
  const owners = record.owners ?? {};

  if (!source.deployed_version) unresolved.push("DEPLOYED_ONYX_VERSION");
  if (!source.image_digest) unresolved.push("IMAGE_DIGEST");
  if (!source.openapi_digest) unresolved.push("OPENAPI_DIGEST");
  if (!source.sanitized_configuration_digest) unresolved.push("SANITIZED_CONFIGURATION_DIGEST");
  if (!mechanism.selected) unresolved.push("SUPPORTED_DELEGATION_MECHANISM");
  if (!mechanism.protocol_version) unresolved.push("PROTOCOL_VERSION");
  if (!principal.issuer) unresolved.push("IDENTITY_ISSUER");
  if (!principal.audience) unresolved.push("IDENTITY_AUDIENCE");
  if (!principal.subject_mapping) unresolved.push("SUBJECT_MAPPING");
  if (!principal.workspace_claim) unresolved.push("WORKSPACE_CLAIM");
  if (!principal.operation_claim) unresolved.push("OPERATION_CLAIM");
  if (!principal.purpose_claim) unresolved.push("PURPOSE_CLAIM");
  if (!lifecycle.maximum_ttl_seconds) unresolved.push("MAXIMUM_TTL");
  if (lifecycle.revocation_maximum_seconds === null || lifecycle.revocation_maximum_seconds === undefined) {
    unresolved.push("REVOCATION_PROPAGATION");
  }
  if (api.per_user_delegated_api_support !== "PROVEN") {
    unresolved.push("PER_USER_DELEGATED_API_SUPPORT");
  }
  if (!endpointComplete(api.search)) unresolved.push("SEARCH_ENDPOINT");
  if (!endpointComplete(api.access_check)) unresolved.push("ACCESS_CHECK_ENDPOINT");
  if (!api.timeout_milliseconds) unresolved.push("TIMEOUT");
  if (!api.retry_policy) unresolved.push("RETRY_POLICY");
  if (!api.rate_limit_contract) unresolved.push("RATE_LIMIT_CONTRACT");
  if (!owners.security_identity) unresolved.push("SECURITY_IDENTITY_OWNER");
  if (!owners.onyx_operations) unresolved.push("ONYX_OPERATIONS_OWNER");

  const proofCases = new Map((record.proof_cases ?? []).map((proof) => [proof.id, proof]));
  if (
    proofCases.size !== ONYX_PROOF_CASE_IDS.length ||
    ONYX_PROOF_CASE_IDS.some((id) => {
      const proof = proofCases.get(id);
      return !proof || proof.status !== "PASS" || !proof.evidence_digest;
    })
  ) {
    unresolved.push("TWELVE_PROOF_CASES");
  }

  const approvals = new Map((record.approvals ?? []).map((approval) => [approval.role, approval]));
  if (
    approvals.size !== ONYX_APPROVAL_ROLES.length ||
    ONYX_APPROVAL_ROLES.some((role) => {
      const approval = approvals.get(role);
      return !approval?.approved_by || !approval.approved_at || !approval.decision_payload_digest;
    })
  ) {
    unresolved.push("APPROVALS");
  }

  return unresolved.sort();
}

function assertExactUniqueValues(actual, expected, label) {
  if (!Array.isArray(actual)) throw new Error(`${label} must be an array`);
  const sorted = [...actual].sort();
  if (new Set(sorted).size !== sorted.length || JSON.stringify(sorted) !== JSON.stringify(expected)) {
    throw new Error(`${label} differs from its closed v1 set`);
  }
}

export function validateOnyxDelegationDecision(record) {
  if (record.schema_version !== "curve.onyx-delegation-decision/v1" || record.decision_id !== "D-002") {
    throw new Error("D-002 identity or schema version is invalid");
  }

  assertExactUniqueValues(
    record.proof_cases?.map((proof) => proof.id),
    ONYX_PROOF_CASE_IDS,
    "proof_cases",
  );
  assertExactUniqueValues(
    record.approvals?.map((approval) => approval.role),
    ONYX_APPROVAL_ROLES,
    "approvals",
  );
  assertExactUniqueValues(
    record.api_profile?.prohibited_capabilities,
    REQUIRED_PROHIBITED_CAPABILITIES,
    "prohibited_capabilities",
  );

  const unresolved = unresolvedOnyxRequirements(record);
  const recordedUnresolved = [...(record.unresolved_requirements ?? [])].sort();
  if (new Set(recordedUnresolved).size !== recordedUnresolved.length) {
    throw new Error("unresolved_requirements contains duplicates");
  }
  if (JSON.stringify(recordedUnresolved) !== JSON.stringify(unresolved)) {
    throw new Error("unresolved_requirements does not equal the computed decision gaps");
  }

  const activation = record.activation ?? {};
  if (activation.protected_body_persistence_authorized || activation.model_destination_authorized) {
    throw new Error("D-002 cannot authorize protected persistence or model delivery");
  }

  if (record.status !== "DECIDED") {
    if (activation.adapter_implementation_authorized || activation.live_retrieval_authorized) {
      throw new Error("an undecided D-002 record cannot activate an adapter or live retrieval");
    }
    if (record.decision_payload_digest !== null) {
      throw new Error("an undecided D-002 record cannot carry an approval digest");
    }
    return { dispatchable: false, unresolved };
  }

  if (unresolved.length > 0) throw new Error("a decided D-002 record has unresolved requirements");
  if (!activation.adapter_implementation_authorized || !activation.live_retrieval_authorized) {
    throw new Error("a decided D-002 record must explicitly authorize adapter implementation and live retrieval");
  }
  const allowed = [...record.api_profile.allowed_capabilities].sort();
  if (
    JSON.stringify(allowed) !==
    JSON.stringify(["DOCUMENT_SEARCH", "SOURCE_ACCESS_CHECK", "SOURCE_METADATA_READ"])
  ) {
    throw new Error("a decided D-002 record must use the exact read-only capability set");
  }

  const digest = computeOnyxDecisionPayloadDigest(record);
  if (record.decision_payload_digest !== digest) throw new Error("decision_payload_digest is invalid");
  for (const approval of record.approvals) {
    if (approval.decision_payload_digest !== digest) {
      throw new Error(`${approval.role} approval is not bound to the decision payload`);
    }
  }

  return { dispatchable: true, unresolved: [] };
}

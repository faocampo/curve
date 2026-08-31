import { createHash } from "node:crypto";

export const PROVIDER_PROFILE_SCHEMA_PATHS = Object.freeze([
  "contracts/schemas/provider-credential-reference.schema.json",
  "contracts/schemas/provider-endpoint-profile.schema.json",
  "contracts/schemas/provider-profile-binding.schema.json",
  "contracts/schemas/provider-profile-decision.schema.json",
]);

export const PROVIDER_PROFILE_PREDECESSOR_PATHS = Object.freeze([
  "contracts/governance/m0-s9b1-provider-administration-v1.json",
  "contracts/providers/m0-s9a-provider-registry-v1.json",
]);

export const PROVIDER_PROFILE_NORMALIZED_ERRORS = Object.freeze([
  "BROKER_UNAVAILABLE",
  "CREDENTIAL_REFERENCE_MISSING",
  "CREDENTIAL_REFERENCE_REVOKED",
  "CREDENTIAL_REFERENCE_VERSION_MISMATCH",
  "ENDPOINT_PROFILE_DISABLED",
  "ENDPOINT_PROFILE_MISSING",
  "OPTIMISTIC_CONCURRENCY",
  "POLICY_DENIED",
]);

export const PROVIDER_PROFILE_UNRESOLVED = Object.freeze([
  "B-IDENTITY",
  "B-ENDPOINT",
  "B-DATA",
  "CREDENTIAL_PERSISTENCE_PLACEMENT",
  "BROKER_REFERENCE_SYNTAX",
  "ENDPOINT_VALUES",
  "OWNER_APPROVALS",
]);

const OPTION_CATALOG = Object.freeze({
  credential_persistence_placement: [
    "DEDICATED_PROFILE_RECORD",
    "PROVIDER_CONNECTION_EXTENSION",
    "DEFER",
  ],
  endpoint_persistence_placement: [
    "DEDICATED_PROFILE_RECORD",
    "PROVIDER_CONNECTION_EXTENSION",
    "DEFER",
  ],
  credential_broker_profile: [
    "X3M_SECRETS_MANAGER_BROKER",
    "ABSTRACT_CREDENTIAL_BROKER",
    "DEFER",
  ],
  credential_reference_protocol: ["OPAQUE_VERSIONED_REFERENCE", "DEFER"],
  endpoint_transport_policy: ["HTTPS_ALLOWLISTED_ORIGINS", "LOCAL_PROCESS_ONLY", "DEFER"],
  rotation_and_revocation_policy: [
    "BROKER_VERSIONED_ROTATION_AND_TERMINAL_REVOCATION",
    "PROVIDER_MANAGED_ROTATION_AND_TERMINAL_REVOCATION",
    "DEFER",
  ],
  environment_activation: ["LOCAL_ONLY", "LOCAL_AND_STAGING", "ALL_ENVIRONMENTS", "DEFER"],
});

const FORBIDDEN_KEYS = /(?:secret|token|password|authorization|endpoint_url|origin|hostname|credential_value|reference_value)/iu;

function assertExact(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} changed`);
  }
}

function walk(value, path = "record") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.test(key) && entry !== null && entry !== false && !(Array.isArray(entry) && entry.length === 0)) {
      throw new Error(`${path}.${key} carries a prohibited concrete provider value`);
    }
    walk(entry, `${path}.${key}`);
  }
}

export function rawByteDigest(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function validateProviderProfileBoundBytes(record, bytesByPath) {
  for (const binding of [...record.predecessor_bindings, ...record.schema_bindings]) {
    const bytes = bytesByPath[binding.path];
    if (!Buffer.isBuffer(bytes)) throw new Error(`M0-S9B2 bytes missing for ${binding.path}`);
    if (rawByteDigest(bytes) !== binding.sha256) {
      throw new Error(`M0-S9B2 raw-byte digest changed for ${binding.path}`);
    }
    if (binding.schema_id) {
      const schema = JSON.parse(bytes.toString("utf8"));
      if (schema.$id !== binding.schema_id) throw new Error(`M0-S9B2 schema identity changed for ${binding.path}`);
      if (schema["x-curve-contract-state"] !== "PROPOSED_NOT_NORMATIVE") {
        throw new Error(`M0-S9B2 schema state changed for ${binding.path}`);
      }
      if (schema["x-curve-promotion-decision"] !== "B-PROFILE-M0-S9B2") {
        throw new Error(`M0-S9B2 promotion decision changed for ${binding.path}`);
      }
    }
  }
}

export function validateProviderProfileDecisionSemantics(record) {
  if (record.status !== "PROPOSED" || record.readiness !== "OWNER_SELECTION_REQUIRED") {
    throw new Error("M0-S9B2 must remain an owner-selection proposal");
  }
  if (record.dispatch_state !== "NO_DISPATCH" || record.implementation_authority !== false) {
    throw new Error("M0-S9B2 proposal cannot grant dispatch or implementation authority");
  }
  if (record.contract_state !== "PROPOSED_NOT_NORMATIVE") {
    throw new Error("M0-S9B2 candidate contracts cannot become normative through this proposal");
  }
  if (record.baseline.external_effects !== "NONE" || record.baseline.data_boundary !== "SYNTHETIC_INTERNAL_METADATA_ONLY") {
    throw new Error("M0-S9B2 proposal exceeded its data or external-effect boundary");
  }

  assertExact(
    record.predecessor_bindings.map(({ path }) => path),
    PROVIDER_PROFILE_PREDECESSOR_PATHS,
    "M0-S9B2 predecessor inventory",
  );
  assertExact(
    record.schema_bindings.map(({ path }) => path),
    PROVIDER_PROFILE_SCHEMA_PATHS,
    "M0-S9B2 schema inventory",
  );
  assertExact(record.normalized_errors, PROVIDER_PROFILE_NORMALIZED_ERRORS, "M0-S9B2 normalized errors");
  assertExact(record.unresolved_requirements, PROVIDER_PROFILE_UNRESOLVED, "M0-S9B2 unresolved requirements");

  for (const [name, allowed] of Object.entries(OPTION_CATALOG)) {
    const option = record.material_options[name];
    if (!option) throw new Error(`M0-S9B2 material option ${name} is missing`);
    assertExact(option.allowed, allowed, `M0-S9B2 ${name} alternatives`);
    if (option.selected !== null) throw new Error(`M0-S9B2 ${name} remains a human selection`);
  }
  if (record.material_options.credential_reference_protocol.reference_syntax !== null) {
    throw new Error("M0-S9B2 concrete credential-reference syntax remains unresolved");
  }
  if (record.material_options.endpoint_transport_policy.endpoint_values.length !== 0) {
    throw new Error("M0-S9B2 concrete endpoint values remain unresolved");
  }

  assertExact(record.broker_port, {
    port_id: "CURVE_PROVIDER_CREDENTIAL_BROKER_PORT_V1_CANDIDATE",
    scope: "PROCESS_LOCAL",
    serializable: false,
    network_transport: false,
    persistent_secret_material: false,
    inputs: ["workspace_context", "provider_connection_context", "requested_capability"],
    success_projection: "NON_SERIALIZABLE_CREDENTIAL_USE_CAPABILITY",
    error_projection: "NORMALIZED_ERROR_CODE_ONLY",
    implementation_authorized: false,
  }, "M0-S9B2 candidate broker port");

  if (record.evidence.length || record.approvals.length || Object.values(record.owners).some(Boolean)) {
    throw new Error("M0-S9B2 proposal cannot carry owner, evidence, or approval claims");
  }
  if (Object.values(record.activation).some((value) => value !== false)) {
    throw new Error("M0-S9B2 proposal must remain fully inactive");
  }

  const { credential_reference: credential, endpoint_profile: endpoint, profile_binding: binding } = record.candidate_records;
  for (const candidate of [credential, endpoint, binding]) {
    if (candidate.workspace_id !== credential.workspace_id || candidate.provider_connection_id !== credential.provider_connection_id) {
      throw new Error("M0-S9B2 candidate records must share one workspace-scoped provider connection");
    }
  }
  if (credential.reference_kind !== null || credential.reference_format_version !== null || credential.credential_material_present !== false) {
    throw new Error("M0-S9B2 credential candidate exposed or selected a reference");
  }
  if ([endpoint.endpoint_profile_kind, endpoint.transport_protocol, endpoint.tls_policy, endpoint.source_policy].some((value) => value !== null) || endpoint.endpoint_value_present !== false) {
    throw new Error("M0-S9B2 endpoint candidate exposed or selected a transport value");
  }
  if (binding.credential_profile_version !== null || binding.endpoint_profile_version !== null || binding.dispatch_allowed !== false) {
    throw new Error("M0-S9B2 candidate binding became active");
  }
  walk(record.candidate_records);
  return { dispatchable: false, unresolved: [...record.unresolved_requirements] };
}

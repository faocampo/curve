import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { validateTestStrategyMatrixSemantics } from "./lib/test-strategy.mjs";
import { validateTemporalOrchestrationSemantics } from "./lib/temporal-orchestration.mjs";

const root = process.cwd();

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function filesUnder(directory, suffix) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}

const jsonFiles = filesUnder(join(root, "contracts"), ".json").sort();
for (const file of jsonFiles) {
  JSON.parse(readFileSync(file, "utf8"));
}

const schemaFiles = jsonFiles.filter((file) => file.endsWith(".schema.json"));
const schemasById = new Map(
  schemaFiles.map((file) => {
    const schema = JSON.parse(readFileSync(file, "utf8"));
    if (!schema.$id) throw new Error(`${relative(root, file)} has no $id`);
    return [schema.$id, file];
  }),
);
if (schemasById.size !== schemaFiles.length) {
  throw new Error("Every JSON Schema must have a unique $id");
}
for (const file of schemaFiles) {
  const args = ["compile", "--spec=draft2020", "--strict=false", "-c", "ajv-formats", "-s", file];
  for (const referencedSchema of schemaFiles) {
    if (referencedSchema !== file) args.push("-r", referencedSchema);
  }
  execFileSync(join(root, "node_modules/.bin/ajv"), args, { stdio: "inherit" });
}

const invocationSchema = join(root, "contracts/mcp/orca-tools-v1.schema.json");
const resultSchema = join(root, "contracts/mcp/orca-tool-result-v1.schema.json");
const p0_06StageProjectionSchema = join(root, "contracts/schemas/p0-06-stage-projection-v3.schema.json");
const corePolicyManifestSchema = join(root, "contracts/schemas/core-policy-manifest.schema.json");
const corePolicyManifestPath = join(root, "contracts/policy/core-policy-v1.json");
const operationSchema = join(root, "contracts/schemas/operation.schema.json");
const operationEventV2Schema = join(root, "contracts/schemas/operation-event-v2.schema.json");
const outboxSchema = join(root, "contracts/schemas/outbox-event.schema.json");
const inboxSchema = join(root, "contracts/schemas/inbox-message.schema.json");
const idempotencySchema = join(root, "contracts/schemas/idempotency-record.schema.json");
const policyEvaluationSchema = join(root, "contracts/schemas/policy-evaluation.schema.json");
const policyDecisionSchema = join(root, "contracts/schemas/policy-decision.schema.json");
const telemetryManifestSchema = join(root, "contracts/schemas/telemetry-manifest.schema.json");
const telemetryManifestPath = join(root, "contracts/observability/m0-s5-telemetry-v1.json");
const observabilityBindingSchema = join(root, "contracts/schemas/observability-binding.schema.json");
const observabilityBindingPath = join(root, "contracts/observability/obs-bind-001-local-v1.json");
const testStrategyMatrixSchema = join(root, "contracts/schemas/test-strategy-matrix.schema.json");
const testStrategyMatrixPath = join(root, "contracts/testing/ac-test-matrix-v1.json");
const temporalOrchestrationSchema = join(root, "contracts/schemas/temporal-orchestration.schema.json");
const temporalOrchestrationPath = join(root, "contracts/temporal/m0-orchestration-v1.json");
const fixtureSpecs = [
  ["contracts/mcp/examples/claim-slice.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/link-vcs-reference.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/mutation-result.valid.json", resultSchema, true],
  ["contracts/mcp/examples/forbidden-tool.invalid.json", invocationSchema, false],
  ["contracts/mcp/examples/forged-actor.invalid.json", invocationSchema, false],
  ["docs/technical/proofs/p0-06-stage-record.json", p0_06StageProjectionSchema, true],
  ["contracts/policy/core-policy-v1.json", corePolicyManifestSchema, true],
  ["contracts/observability/m0-s5-telemetry-v1.json", telemetryManifestSchema, true],
  ["contracts/observability/obs-bind-001-local-v1.json", observabilityBindingSchema, true],
  ["contracts/testing/ac-test-matrix-v1.json", testStrategyMatrixSchema, true],
  ["contracts/temporal/m0-orchestration-v1.json", temporalOrchestrationSchema, true],
  ["contracts/schemas/semantic-fixtures/observability-binding-external-delivery.invalid.json", observabilityBindingSchema, false],
  ["contracts/schemas/semantic-fixtures/operation-event-v2-tracestate.invalid.json", operationEventV2Schema, false],
  ["contracts/schemas/semantic-fixtures/operation-terminal.valid.json", operationSchema, true],
  ["contracts/schemas/semantic-fixtures/operation-terminal-null.invalid.json", operationSchema, false],
  ["contracts/schemas/semantic-fixtures/outbox-claim.valid.json", outboxSchema, true],
  ["contracts/schemas/semantic-fixtures/outbox-claim-null.invalid.json", outboxSchema, false],
  ["contracts/schemas/semantic-fixtures/outbox-delivery.valid.json", outboxSchema, true],
  ["contracts/schemas/semantic-fixtures/outbox-delivery-null.invalid.json", outboxSchema, false],
  ["contracts/schemas/semantic-fixtures/outbox-retry.valid.json", outboxSchema, true],
  ["contracts/schemas/semantic-fixtures/outbox-retry-null.invalid.json", outboxSchema, false],
  ["contracts/schemas/semantic-fixtures/inbox-processed-null.invalid.json", inboxSchema, false],
  ["contracts/schemas/semantic-fixtures/idempotency-completed.valid.json", idempotencySchema, true],
  ["contracts/schemas/semantic-fixtures/idempotency-raw-key.invalid.json", idempotencySchema, false],
  ["contracts/schemas/semantic-fixtures/idempotency-terminal-null.invalid.json", idempotencySchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-service.valid.json", policyEvaluationSchema, true],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-transition-service.valid.json", policyEvaluationSchema, true],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-service-membership.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-human-service-auth.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-human-service-role.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-service-human-role.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-service-version.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-target-version.valid.json", policyEvaluationSchema, true],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-target-version.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-gate-assignment.valid.json", policyEvaluationSchema, true],
  ["contracts/schemas/semantic-fixtures/policy-evaluation-gate-assignment.invalid.json", policyEvaluationSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-decision-human-recorder.invalid.json", policyDecisionSchema, false],
  ["contracts/schemas/semantic-fixtures/policy-decision-allow-reason.invalid.json", policyDecisionSchema, false],
];

for (const fixture of filesUnder(join(root, "contracts/schemas/examples"), ".json").sort()) {
  const fixtureName = relative(root, fixture);
  const match = fixtureName.match(/\/([^/]+)\.(valid|invalid)\.json$/);
  if (!match) throw new Error(`Unexpected schema fixture name: ${fixtureName}`);
  fixtureSpecs.push([fixtureName, join(root, `contracts/schemas/${match[1]}.schema.json`), match[2] === "valid"]);
}

const testStrategyMatrix = JSON.parse(readFileSync(testStrategyMatrixPath, "utf8"));
const prdText = readFileSync(join(root, testStrategyMatrix.source.document), "utf8");
const developmentPlanText = readFileSync(join(root, "docs/technical/development-plan.md"), "utf8");
validateTestStrategyMatrixSemantics({
  matrix: testStrategyMatrix,
  prdText,
  developmentPlanText,
});

const corePolicyManifest = JSON.parse(readFileSync(corePolicyManifestPath, "utf8"));
const expectedCorePolicyDenyPrecedence = [
  "POLICY_CONTEXT_INVALID",
  "FEATURE_DISABLED",
  "UNAUTHENTICATED",
  "AGENT_NOT_ALLOWED",
  "WORKSPACE_MISMATCH",
  "INACTIVE_MEMBERSHIP",
  "UNKNOWN_ACTION",
  "RESOURCE_TYPE_NOT_ALLOWED",
  "RESOURCE_NOT_FOUND",
  "UNSUPPORTED_PRINCIPAL",
  "ROLE_NOT_ALLOWED",
  "ENVIRONMENT_NOT_ALLOWED",
  "CLASSIFICATION_NOT_ALLOWED",
  "OBJECT_ACL_REQUIRED",
  "OBJECT_ACL_DENIED",
  "ASSIGNMENT_REQUIRED",
  "ASSIGNMENT_MISMATCH",
  "SEPARATION_OF_DUTY_DENIED",
  "TARGET_ALLOWLIST_REQUIRED",
  "TARGET_NOT_ALLOWED",
  "SERVICE_AUTHORIZATION_REQUIRED",
  "SERVICE_AUTHORIZATION_INVALID",
  "SERVICE_AUTHORIZATION_INACTIVE",
  "SERVICE_AUTHORIZATION_EXPIRED",
  "EXTERNAL_EFFECT_NOT_ALLOWED",
];
if (
  JSON.stringify(corePolicyManifest.deny_precedence) !==
  JSON.stringify(expectedCorePolicyDenyPrecedence)
) {
  throw new Error(
    "contracts/policy/core-policy-v1.json deny precedence differs from immutable v1",
  );
}
if (corePolicyManifest.allow_reason_code !== "POLICY_ALLOWED") {
  throw new Error("contracts/policy/core-policy-v1.json allow reason differs from immutable v1");
}
if (corePolicyManifest.deny_precedence.includes(corePolicyManifest.allow_reason_code)) {
  throw new Error("contracts/policy/core-policy-v1.json mixes allow and deny reason codes");
}
const expectedCorePolicyResources = new Map([
  ["CURVE.SHELL.VIEW", ["WORKSPACE"]],
  ["CURVE.OPERATION.READ", ["OPERATION"]],
  ["CURVE.OPERATION.CANCEL", ["OPERATION"]],
  ["CURVE.FOUNDATION_PROBE.START", ["WORKSPACE"]],
  ["CURVE.OPERATION.TRANSITION", ["OPERATION"]],
  ["CURVE.PROVIDER_CONNECTION.ADMINISTER", ["PROVIDER_CONNECTION"]],
  ["CURVE.GATE.DECIDE.PRD", ["ARTIFACT_VERSION"]],
  ["CURVE.GATE.DECIDE.PLAN", ["EXECUTION_PLAN"]],
  ["CURVE.GATE.DECIDE.CODE_READINESS", ["PULL_REQUEST_SET"]],
  ["CURVE.FINDING.DISPOSITION.NON_SECURITY", ["REVIEW_FINDING"]],
]);
const expectedOwnerAcl = new Map([
  ["CURVE.SHELL.VIEW", false],
  ["CURVE.OPERATION.READ", true],
  ["CURVE.OPERATION.CANCEL", true],
  ["CURVE.FOUNDATION_PROBE.START", false],
  ["CURVE.OPERATION.TRANSITION", false],
  ["CURVE.PROVIDER_CONNECTION.ADMINISTER", false],
  ["CURVE.GATE.DECIDE.PRD", false],
  ["CURVE.GATE.DECIDE.PLAN", false],
  ["CURVE.GATE.DECIDE.CODE_READINESS", false],
  ["CURVE.FINDING.DISPOSITION.NON_SECURITY", false],
]);
const actionNames = corePolicyManifest.actions.map((action) => action.action);
if (new Set(actionNames).size !== actionNames.length) {
  throw new Error("contracts/policy/core-policy-v1.json contains duplicate actions");
}
if (
  actionNames.length !== expectedCorePolicyResources.size ||
  actionNames.some((actionName) => !expectedCorePolicyResources.has(actionName))
) {
  throw new Error("contracts/policy/core-policy-v1.json action set differs from immutable v1");
}
for (const action of corePolicyManifest.actions) {
  if (
    JSON.stringify(action.allowed_resource_types) !==
    JSON.stringify(expectedCorePolicyResources.get(action.action))
  ) {
    throw new Error(`${action.action} resource types differ from immutable v1`);
  }
  if (action.allowed_actor_types.includes("AGENT")) {
    throw new Error(`${action.action} grants authority to AGENT`);
  }
  if (action.external_side_effect !== false) {
    throw new Error(`${action.action} grants an M0 external side effect`);
  }
  if (action.owner_satisfies_acl !== expectedOwnerAcl.get(action.action)) {
    throw new Error(`${action.action} owner ACL rule differs from immutable v1`);
  }
}
const transitionPolicy = corePolicyManifest.actions.find(
  (action) => action.action === "CURVE.OPERATION.TRANSITION",
);
if (
  JSON.stringify(transitionPolicy.allowed_actor_types) !== JSON.stringify(["SERVICE"]) ||
  JSON.stringify(transitionPolicy.allowed_roles) !== JSON.stringify(["TRUSTED_SERVICE"]) ||
  JSON.stringify(transitionPolicy.allowed_classifications) !==
    JSON.stringify(["INTERNAL", "CONFIDENTIAL", "RESTRICTED"]) ||
  JSON.stringify(transitionPolicy.allowed_environments) !==
    JSON.stringify(["LOCAL", "STAGING", "PRODUCTION"]) ||
  transitionPolicy.object_acl !== "NOT_APPLICABLE" ||
  transitionPolicy.owner_satisfies_acl !== false ||
  transitionPolicy.assignment !== "NONE" ||
  transitionPolicy.separation_of_duty !== "NONE" ||
  transitionPolicy.target_allowlist !== "NOT_APPLICABLE" ||
  transitionPolicy.external_side_effect !== false ||
  JSON.stringify(transitionPolicy.permitted_projection) !== JSON.stringify(["NO_BODY"])
) {
  throw new Error("CURVE.OPERATION.TRANSITION differs from the immutable trusted-service boundary");
}

const telemetryManifest = JSON.parse(readFileSync(telemetryManifestPath, "utf8"));
const telemetryManifestSchemaDocument = JSON.parse(readFileSync(telemetryManifestSchema, "utf8"));
const telemetryManifestSchemaDigest = createHash("sha256")
  .update(JSON.stringify(canonicalJson(telemetryManifestSchemaDocument)))
  .digest("hex");
if (telemetryManifestSchemaDigest !== "1d65abeb873ad5d7b4a7785e5d1e2010e4fd41d5f307d5e355a63ebe3f160a60") {
  throw new Error(
    "contracts/schemas/telemetry-manifest.schema.json changed without a new reviewed contract version",
  );
}
const telemetryManifestDigest = createHash("sha256")
  .update(JSON.stringify(canonicalJson(telemetryManifest)))
  .digest("hex");
if (telemetryManifestDigest !== "611bf0f8760af2c9110eaded2b812d1203af31b813542fa6f0c78626d2a565e1") {
  throw new Error(
    "contracts/observability/m0-s5-telemetry-v1.json changed without a new reviewed contract version",
  );
}
const observabilityBinding = JSON.parse(readFileSync(observabilityBindingPath, "utf8"));
const observabilityBindingSchemaDocument = JSON.parse(readFileSync(observabilityBindingSchema, "utf8"));
const observabilityBindingSchemaDigest = createHash("sha256")
  .update(JSON.stringify(canonicalJson(observabilityBindingSchemaDocument)))
  .digest("hex");
if (observabilityBindingSchemaDigest !== "589b9facb39efaa47ed0277ec9e8c31ed9b4106cd7ae8da5f0e5d4bccf085602") {
  throw new Error(
    "contracts/schemas/observability-binding.schema.json changed without a new reviewed contract version",
  );
}
const observabilityBindingDigest = createHash("sha256")
  .update(JSON.stringify(canonicalJson(observabilityBinding)))
  .digest("hex");
if (observabilityBindingDigest !== "8cd9f61e3abd88a7f4cc7557650915c341f323863df0a9953aeda9c9420bcbc2") {
  throw new Error(
    "contracts/observability/obs-bind-001-local-v1.json changed without a new reviewed contract version",
  );
}
if (
  observabilityBinding.decision.status !== "DECIDED_LOCAL_ONLY" ||
  observabilityBinding.topology.network !== "dev_env" ||
  observabilityBinding.topology.host_bind_address !== "127.0.0.1" ||
  observabilityBinding.otlp.authentication_secret_reference !== null ||
  observabilityBinding.grafana.external_alert_delivery !== "DISABLED" ||
  observabilityBinding.promotion.staging_authority !== "SEPARATE_MATERIAL_DECISION_REQUIRED"
) {
  throw new Error("OBS-BIND-001 differs from the approved local-only authority boundary");
}
const expectedTelemetryMetrics = [
  "curve.activity.execution",
  "curve.activity.retry",
  "curve.audit.append",
  "curve.operation.completed",
  "curve.operation.duration",
  "curve.operation.started",
  "curve.outbox.backlog",
  "curve.outbox.delivery",
  "curve.outbox.oldest_age",
  "curve.sse.connections",
  "curve.sse.resume",
  "curve.telemetry.export.failure",
  "curve.worker.heartbeat.age",
  "curve.workflow.completed",
].sort();
const telemetryMetricNames = telemetryManifest.metrics.map((metric) => metric.name).sort();
if (
  new Set(telemetryMetricNames).size !== telemetryMetricNames.length ||
  JSON.stringify(telemetryMetricNames) !== JSON.stringify(expectedTelemetryMetrics)
) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json metric set differs from immutable v1");
}
if (
  telemetryManifest.default_mode !== "DISABLED" ||
  JSON.stringify(telemetryManifest.allowed_modes) !== JSON.stringify(["DISABLED", "IN_MEMORY_TEST", "OTLP"]) ||
  telemetryManifest.configuration.mode_env !== "CURVE_TELEMETRY_MODE" ||
  telemetryManifest.configuration.endpoint_env !== "CURVE_OTEL_EXPORTER_OTLP_ENDPOINT" ||
  telemetryManifest.configuration.protocol_env !== "CURVE_OTEL_EXPORTER_OTLP_PROTOCOL" ||
  telemetryManifest.configuration.headers_env !== "CURVE_OTEL_EXPORTER_OTLP_HEADERS" ||
  telemetryManifest.configuration.insecure_env !== "CURVE_OTEL_EXPORTER_OTLP_INSECURE" ||
  telemetryManifest.configuration.certificate_env !== "CURVE_OTEL_EXPORTER_OTLP_CERTIFICATE" ||
  telemetryManifest.configuration.client_certificate_env !== "CURVE_OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE" ||
  telemetryManifest.configuration.client_key_env !== "CURVE_OTEL_EXPORTER_OTLP_CLIENT_KEY" ||
  JSON.stringify(telemetryManifest.configuration.allowed_protocols) !== JSON.stringify(["grpc", "http/protobuf"]) ||
  JSON.stringify(telemetryManifest.configuration.endpoint_schemes) !== JSON.stringify(["http", "https"]) ||
  telemetryManifest.configuration.endpoint_userinfo_allowed !== false ||
  telemetryManifest.configuration.endpoint_query_allowed !== false ||
  telemetryManifest.configuration.endpoint_fragment_allowed !== false ||
  telemetryManifest.configuration.grpc_endpoint_path_mode !== "ROOT_ONLY" ||
  telemetryManifest.configuration.http_signal_path_mode !== "APPEND_STANDARD_PATHS" ||
  telemetryManifest.configuration.headers_format !== "URL_ENCODED_COMMA_SEPARATED_KEY_VALUE" ||
  JSON.stringify(telemetryManifest.configuration.insecure_boolean_values) !== JSON.stringify(["true", "false"]) ||
  telemetryManifest.configuration.tls_file_path_mode !== "ABSOLUTE_READ_ONLY" ||
  telemetryManifest.configuration.tls_client_pair_mode !== "BOTH_OR_NEITHER" ||
  telemetryManifest.configuration.tls_maximum_file_bytes !== 1048576 ||
  telemetryManifest.configuration.system_trust_store_allowed !== true ||
  telemetryManifest.configuration.compression !== "NONE" ||
  telemetryManifest.configuration.workspace_scope_key_input_encoding !== "BASE64URL_NO_PADDING" ||
  telemetryManifest.configuration.workspace_scope_key_id_pattern !== "^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$" ||
  telemetryManifest.configuration.explicit_endpoint_required !== true ||
  telemetryManifest.configuration.external_default_endpoint_allowed !== false ||
  telemetryManifest.configuration.insecure_allowed_environment !== "LOCAL" ||
  JSON.stringify(telemetryManifest.export.otlp_signals) !== JSON.stringify(["TRACES", "METRICS"]) ||
  telemetryManifest.export.structured_log_delivery !== "STDOUT_JSON" ||
  telemetryManifest.export.otlp_log_export_allowed !== false ||
  JSON.stringify(telemetryManifest.export.local_only_metrics) !==
    JSON.stringify(["curve.telemetry.export.failure"]) ||
  telemetryManifest.export.remote_path_failure_detection !== "OBS_BIND_001_PLATFORM_SIGNAL" ||
  telemetryManifest.export.exporter_timeout_millis !== 10000 ||
  telemetryManifest.export.shutdown_timeout_millis !== 10000 ||
  telemetryManifest.collection.gauge_implementation !== "OBSERVABLE_GAUGE" ||
  telemetryManifest.collection.database_query_timeout_millis !== 1000 ||
  telemetryManifest.collection.callback_failure_behavior !== "OMIT_OBSERVATION_AND_LOG_BOUNDED" ||
  telemetryManifest.collection.heartbeat_update_interval_millis !== 500 ||
  telemetryManifest.collection.heartbeat_absence_alert_required !== true ||
  JSON.stringify(telemetryManifest.propagation.inbound_headers) !== JSON.stringify(["traceparent"]) ||
  JSON.stringify(telemetryManifest.propagation.outbound_headers) !== JSON.stringify(["traceparent"]) ||
  telemetryManifest.propagation.temporal_header !== "_curve_traceparent_v1" ||
  telemetryManifest.propagation.tracestate_allowed !== false ||
  telemetryManifest.propagation.baggage_allowed !== false ||
  telemetryManifest.propagation.invalid_traceparent_behavior !== "START_NEW_TRACE" ||
  telemetryManifest.workspace_scope.minimum_key_bytes !== 32 ||
  telemetryManifest.workspace_scope.maximum_key_bytes !== 64 ||
  telemetryManifest.workspace_scope.digest_encoding !== "BASE64URL_NO_PADDING" ||
  telemetryManifest.workspace_scope.raw_workspace_id_export_allowed !== false ||
  telemetryManifest.instrumentation.scope !== "CURVE_ONLY_MANUAL" ||
  telemetryManifest.instrumentation.global_django_instrumentation_allowed !== false ||
  telemetryManifest.instrumentation.global_provider_registration_allowed !== false ||
  telemetryManifest.instrumentation.generic_otel_configuration_override_allowed !== false ||
  telemetryManifest.instrumentation.otel_sdk_disabled_fail_closed !== true ||
  telemetryManifest.instrumentation.api_initialization !== "LAZY_PROCESS_LOCAL" ||
  telemetryManifest.instrumentation.worker_initialization !== "EXPLICIT_BEFORE_TEMPORAL_CONNECT" ||
  telemetryManifest.instrumentation.workflow_exporter_io_allowed !== false ||
  telemetryManifest.instrumentation.resource_construction !== "STATIC_CURVE_RESOURCE_ONLY" ||
  JSON.stringify(telemetryManifest.instrumentation.resource_attributes_by_component) !==
    JSON.stringify({
      API: {
        "service.name": "curve-api",
        "service.namespace": "curve",
        "deployment.environment.name": "local",
      },
      TEMPORAL_WORKER: {
        "service.name": "curve-temporal-worker",
        "service.namespace": "curve",
        "deployment.environment.name": "local",
      },
    }) ||
  telemetryManifest.instrumentation.sampler !== "PARENT_BASED_ALWAYS_ON" ||
  telemetryManifest.instrumentation.shutdown_on_exit !== false ||
  JSON.stringify(telemetryManifest.instrumentation.span_limits) !==
    JSON.stringify({
      max_attributes: 16,
      max_span_attributes: 16,
      max_events: 0,
      max_event_attributes: 0,
      max_links: 0,
      max_link_attributes: 0,
      max_attribute_length: 128,
      max_span_attribute_length: 128,
    }) ||
  telemetryManifest.instrumentation.automatic_exception_recording_allowed !== false ||
  telemetryManifest.instrumentation.metric_exemplar_filter !== "ALWAYS_OFF" ||
  telemetryManifest.instrumentation.metric_temporality !== "CUMULATIVE" ||
  telemetryManifest.instrumentation.metric_default_view !== "DROP_UNDECLARED" ||
  telemetryManifest.instrumentation.histogram_boundaries_source !== "MANIFEST_EXPLICIT_VIEW" ||
  telemetryManifest.attribute_policy.free_form_runtime_strings_allowed !== false ||
  telemetryManifest.attribute_policy.maximum_string_value_bytes !== 128 ||
  telemetryManifest.attribute_policy.maximum_collection_items !== 16 ||
  telemetryManifest.logs.message_mode !== "STATIC_EVENT_CODE_TEMPLATE" ||
  telemetryManifest.logs.maximum_serialized_bytes !== 2048 ||
  telemetryManifest.correlation.workspace_scope_algorithm !== "HMAC-SHA256" ||
  telemetryManifest.correlation.workspace_scope_domain !== "curve-workspace-scope:v1" ||
  telemetryManifest.correlation.metric_identifiers_allowed !== false ||
  telemetryManifest.dashboard.metric_translation_strategy !== "UnderscoreEscapingWithSuffixes"
) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json weakens fail-closed export defaults");
}
const metricAttributeNames = new Set(telemetryManifest.metric_attributes.map((attribute) => attribute.name));
if (metricAttributeNames.size !== telemetryManifest.metric_attributes.length) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json contains duplicate metric attributes");
}
for (const attribute of telemetryManifest.metric_attributes) {
  if (new Set(attribute.allowed_values).size !== attribute.allowed_values.length) {
    throw new Error(`${attribute.name} contains duplicate bounded values`);
  }
}
const telemetryMetricAttributes = new Map(
  telemetryManifest.metric_attributes.map((attribute) => [attribute.name, attribute.allowed_values]),
);
if (
  JSON.stringify(telemetryMetricAttributes.get("curve.activity.type")) !==
    JSON.stringify(["MARK_OPERATION_CANCELLED", "MARK_OPERATION_RUNNING", "MARK_OPERATION_SUCCEEDED"]) ||
  JSON.stringify(telemetryMetricAttributes.get("curve.operation.type")) !==
    JSON.stringify(["FOUNDATION_PROBE"])
) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json differs from the M0-S3 activity/operation vocabulary");
}
const highCardinalityMetricAttributes = new Set([
  "curve.correlation_id",
  "curve.event.id",
  "curve.operation.id",
  "curve.workflow.id",
  "curve.workspace.scope",
]);
for (const metric of telemetryManifest.metrics) {
  for (const attribute of metric.allowed_attributes) {
    if (!metricAttributeNames.has(attribute)) {
      throw new Error(`${metric.name} uses undeclared metric attribute ${attribute}`);
    }
    if (highCardinalityMetricAttributes.has(attribute)) {
      throw new Error(`${metric.name} uses high-cardinality metric attribute ${attribute}`);
    }
  }
}
const forbiddenTelemetryName = new RegExp(
  telemetryManifest.attribute_policy.forbidden_name_patterns.map((pattern) => `(?:${pattern})`).join("|"),
  "i",
);
for (const [surface, names] of [
  ["trace", telemetryManifest.attribute_policy.trace_allowlist],
  ["log", telemetryManifest.attribute_policy.log_allowlist],
]) {
  for (const name of names) {
    if (forbiddenTelemetryName.test(name)) throw new Error(`${surface} allowlist contains forbidden name ${name}`);
  }
}
const traceAllowlist = new Set(telemetryManifest.attribute_policy.trace_allowlist);
const expectedTelemetrySpans = [
  "curve.activity.run",
  "curve.http.command",
  "curve.outbox.dispatch",
  "curve.sse.publish",
].sort();
const telemetrySpanNames = telemetryManifest.spans.map((span) => span.name).sort();
if (
  new Set(telemetrySpanNames).size !== telemetrySpanNames.length ||
  JSON.stringify(telemetrySpanNames) !== JSON.stringify(expectedTelemetrySpans)
) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json span set differs from immutable v1");
}
for (const span of telemetryManifest.spans) {
  for (const attribute of span.allowed_attributes) {
    if (!traceAllowlist.has(attribute)) throw new Error(`${span.name} uses non-allowlisted trace attribute ${attribute}`);
  }
}
const logAllowlist = new Set(telemetryManifest.attribute_policy.log_allowlist);
for (const prohibitedIdentifier of [
  "curve.correlation_id",
  "curve.workspace.id",
  "curve.workflow.id",
  "temporalRunID",
  "temporalWorkflowID",
]) {
  if (traceAllowlist.has(prohibitedIdentifier) || logAllowlist.has(prohibitedIdentifier)) {
    throw new Error(`telemetry allowlist contains prohibited raw identifier ${prohibitedIdentifier}`);
  }
}
for (const field of [
  ...telemetryManifest.logs.common_required_fields,
  ...telemetryManifest.logs.workspace_required_fields,
]) {
  if (!logAllowlist.has(field)) throw new Error(`required log field ${field} is absent from the log allowlist`);
}
if (new Set(telemetryManifest.logs.event_codes).size !== telemetryManifest.logs.event_codes.length) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json contains duplicate log event codes");
}
const logEventCodes = new Set(telemetryManifest.logs.event_codes);
const workspaceLogEventCodes = new Set(telemetryManifest.logs.workspace_scoped_event_codes);
if (
  workspaceLogEventCodes.size !== telemetryManifest.logs.workspace_scoped_event_codes.length ||
  [...workspaceLogEventCodes].some((code) => !logEventCodes.has(code)) ||
  workspaceLogEventCodes.has("CURVE_TELEMETRY_CONFIGURATION_INVALID") ||
  workspaceLogEventCodes.has("CURVE_TELEMETRY_EXPORT_FAILED")
) {
  throw new Error("workspace-scoped logs must be a unique subset and global telemetry failures cannot require workspace context");
}
for (const [surface, identifiers] of [
  ["dashboard", telemetryManifest.dashboard.panels.map((panel) => panel.id)],
  ["alert", telemetryManifest.alerts.rules.map((rule) => rule.id)],
]) {
  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error(`contracts/observability/m0-s5-telemetry-v1.json contains duplicate ${surface} identifiers`);
  }
}
const dashboardPanelIds = telemetryManifest.dashboard.panels.map((panel) => panel.id).sort((a, b) => a - b);
if (JSON.stringify(dashboardPanelIds) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json dashboard panel set differs from immutable v1");
}
const telemetryAlerts = new Map(telemetryManifest.alerts.rules.map((rule) => [rule.id, rule.expression]));
const expectedTelemetryAlertIds = [
  "CURVE_AUDIT_APPEND_FAILURE",
  "CURVE_OPERATION_FAILURE_RATIO",
  "CURVE_OUTBOX_STUCK",
  "CURVE_WORKER_HEARTBEAT_STALE",
];
const telemetryAlertIds = [...telemetryAlerts.keys()].sort();
if (
  JSON.stringify(telemetryAlertIds) !== JSON.stringify(expectedTelemetryAlertIds) ||
  telemetryAlerts.get("CURVE_WORKER_HEARTBEAT_STALE") !==
    "max(curve_worker_heartbeat_age_seconds) > 30 or absent(curve_worker_heartbeat_age_seconds)" ||
  telemetryAlerts.get("CURVE_OPERATION_FAILURE_RATIO") !==
    'sum(increase(curve_operation_completed_total{curve_result="FAILED"}[5m])) / clamp_min(sum(increase(curve_operation_completed_total[5m])), 1) > 0.05'
) {
  throw new Error("contracts/observability/m0-s5-telemetry-v1.json weakens heartbeat or failure-ratio detection");
}
const remoteQuerySurface = [
  ...telemetryManifest.dashboard.panels.map((panel) => panel.query),
  ...telemetryManifest.alerts.rules.map((rule) => rule.expression),
].join("\n");
if (
  remoteQuerySurface.includes("curve_telemetry_export_failure") ||
  telemetryAlerts.has("CURVE_TELEMETRY_EXPORT_FAILURE")
) {
  throw new Error("a Curve exporter cannot be the remote signal for its own delivery-path failure");
}

const temporalOrchestration = JSON.parse(readFileSync(temporalOrchestrationPath, "utf8"));
validateTemporalOrchestrationSemantics(temporalOrchestration);

for (const [fixtureName, schema, shouldBeValid] of fixtureSpecs) {
  const fixture = join(root, fixtureName);
  const args = ["validate", "--spec=draft2020", "--strict=false", "-c", "ajv-formats", "-s", schema, "-d", fixture];
  for (const referencedSchema of schemaFiles) {
    if (referencedSchema !== schema) args.push("-r", referencedSchema);
  }

  let valid = true;
  try {
    execFileSync(join(root, "node_modules/.bin/ajv"), args, { stdio: "pipe" });
  } catch {
    valid = false;
  }
  if (valid !== shouldBeValid) {
    throw new Error(`${relative(root, fixture)} was expected to be ${shouldBeValid ? "valid" : "invalid"}`);
  }
}

const p0_06AttemptFixturePath = join(
  root,
  "contracts/schemas/examples/p0-06a-attempt-manifest.valid.json",
);
const p0_06AttemptFixture = JSON.parse(readFileSync(p0_06AttemptFixturePath, "utf8"));
const operationBindingsDigest = `sha256:${createHash("sha256")
  .update("curve-p0-06a-operation-bindings:v1\0")
  .update(JSON.stringify(canonicalJson(p0_06AttemptFixture.controller.operation_bindings)))
  .digest("hex")}`;
if (p0_06AttemptFixture.controller.operation_bindings_digest !== operationBindingsDigest) {
  throw new Error(
    `${relative(root, p0_06AttemptFixturePath)} has an invalid operation_bindings_digest`,
  );
}

const validEventFixture = join(root, "contracts/schemas/examples/event-envelope.valid.json");
const eventEnvelope = JSON.parse(readFileSync(validEventFixture, "utf8"));
const payloadSchema = schemasById.get(eventEnvelope.payload_schema);
if (!payloadSchema) {
  throw new Error(
    `${relative(root, validEventFixture)} declares unknown payload_schema ${eventEnvelope.payload_schema}`,
  );
}
const temporaryDirectory = mkdtempSync(join(tmpdir(), "curve-contract-"));
const temporaryPayload = join(temporaryDirectory, "event-payload.json");
try {
  writeFileSync(temporaryPayload, `${JSON.stringify(eventEnvelope.payload, null, 2)}\n`, "utf8");
  const args = [
    "validate",
    "--spec=draft2020",
    "--strict=false",
    "-c",
    "ajv-formats",
    "-s",
    payloadSchema,
    "-d",
    temporaryPayload,
  ];
  for (const referencedSchema of schemaFiles) {
    if (referencedSchema !== payloadSchema) args.push("-r", referencedSchema);
  }
  execFileSync(join(root, "node_modules/.bin/ajv"), args, { stdio: "pipe" });
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Validated ${schemaFiles.length} JSON Schemas and ${fixtureSpecs.length} contract fixtures.`);

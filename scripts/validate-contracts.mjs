import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

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
const outboxSchema = join(root, "contracts/schemas/outbox-event.schema.json");
const inboxSchema = join(root, "contracts/schemas/inbox-message.schema.json");
const idempotencySchema = join(root, "contracts/schemas/idempotency-record.schema.json");
const policyEvaluationSchema = join(root, "contracts/schemas/policy-evaluation.schema.json");
const policyDecisionSchema = join(root, "contracts/schemas/policy-decision.schema.json");
const fixtureSpecs = [
  ["contracts/mcp/examples/claim-slice.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/link-vcs-reference.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/mutation-result.valid.json", resultSchema, true],
  ["contracts/mcp/examples/forbidden-tool.invalid.json", invocationSchema, false],
  ["contracts/mcp/examples/forged-actor.invalid.json", invocationSchema, false],
  ["docs/technical/proofs/p0-06-stage-record.json", p0_06StageProjectionSchema, true],
  ["contracts/policy/core-policy-v1.json", corePolicyManifestSchema, true],
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

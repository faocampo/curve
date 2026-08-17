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
const p0_06StageProjectionSchema = join(root, "contracts/schemas/p0-06-stage-projection-v2.schema.json");
const operationSchema = join(root, "contracts/schemas/operation.schema.json");
const outboxSchema = join(root, "contracts/schemas/outbox-event.schema.json");
const inboxSchema = join(root, "contracts/schemas/inbox-message.schema.json");
const idempotencySchema = join(root, "contracts/schemas/idempotency-record.schema.json");
const fixtureSpecs = [
  ["contracts/mcp/examples/claim-slice.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/link-vcs-reference.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/mutation-result.valid.json", resultSchema, true],
  ["contracts/mcp/examples/forbidden-tool.invalid.json", invocationSchema, false],
  ["contracts/mcp/examples/forged-actor.invalid.json", invocationSchema, false],
  ["docs/technical/proofs/p0-06-stage-record.json", p0_06StageProjectionSchema, true],
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
];

for (const fixture of filesUnder(join(root, "contracts/schemas/examples"), ".json").sort()) {
  const fixtureName = relative(root, fixture);
  const match = fixtureName.match(/\/([^/]+)\.(valid|invalid)\.json$/);
  if (!match) throw new Error(`Unexpected schema fixture name: ${fixtureName}`);
  fixtureSpecs.push([fixtureName, join(root, `contracts/schemas/${match[1]}.schema.json`), match[2] === "valid"]);
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

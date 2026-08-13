import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const root = process.cwd();

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
const fixtureSpecs = [
  ["contracts/mcp/examples/claim-slice.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/link-vcs-reference.valid.json", invocationSchema, true],
  ["contracts/mcp/examples/mutation-result.valid.json", resultSchema, true],
  ["contracts/mcp/examples/forbidden-tool.invalid.json", invocationSchema, false],
  ["contracts/mcp/examples/forged-actor.invalid.json", invocationSchema, false],
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

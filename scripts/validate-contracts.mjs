import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
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

console.log(`Validated ${schemaFiles.length} JSON Schemas and ${fixtureSpecs.length} contract fixtures.`);

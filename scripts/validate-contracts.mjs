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

const common = join(root, "contracts/schemas/common.schema.json");
for (const file of jsonFiles) {
  const args = ["compile", "--spec=draft2020", "--strict=false", "-c", "ajv-formats", "-s", file];
  if (file !== common) args.push("-r", common);
  execFileSync(join(root, "node_modules/.bin/ajv"), args, { stdio: "inherit" });
}

console.log(`Validated ${jsonFiles.length} JSON contracts.`);

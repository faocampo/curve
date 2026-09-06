import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const read = name => JSON.parse(readFileSync(new URL(`../../contracts/schemas/${name}.schema.json`, import.meta.url)));
const base = "https://curve.example.invalid/contracts/schemas/";
const pairs = [
  ["access-envelope", "access-envelope-v2"],
  ["prd-artifact-records-v1", "prd-artifact-records-v2"],
  ["external-prd-v1", "external-prd-v2"],
  ["prd-review-decision-record-v1", "prd-review-decision-record-v2"],
];
const ajv = new Ajv2020({ strict: false });
addFormats(ajv);
for (const name of ["common", "git-retention-policy-reference-v1", ...pairs.flat()]) ajv.addSchema(read(name));

for (const [oldName, newName] of pairs) {
  test(`${newName} preserves every non-retention constraint`, () => {
    const old = read(oldName), next = read(newName);
    assert.ok(ajv.getSchema(next.$id));
    function compare(a, b, path = "") {
      if (["/$id", "/title"].includes(path)) return;
      if (path.endsWith("/properties/schema_version/const")) {
        assert.equal(b, a === "1.0" ? "2.0" : "2.0-candidate"); return;
      }
      if (/\/properties\/(?:rationale_)?retention_policy_version_id$/.test(path)) {
        assert.deepEqual(b, { $ref: "git-retention-policy-reference-v1.schema.json#/$defs/Commit" }); return;
      }
      if (path.endsWith("/properties/retention_policy_ref")) {
        assert.deepEqual(b, { $ref: "git-retention-policy-reference-v1.schema.json" }); return;
      }
      if (path.endsWith("/$ref") && typeof a === "string" && a.startsWith("access-envelope.schema.json")) {
        assert.equal(b, a.replace("access-envelope.schema.json", "access-envelope-v2.schema.json")); return;
      }
      if (a && typeof a === "object") {
        assert.deepEqual(Object.keys(b), Object.keys(a), path);
        for (const key of Object.keys(a)) compare(a[key], b[key], `${path}/${key}`);
      } else assert.equal(b, a, path);
    }
    compare(old, next);
  });
}

const targets = [
  "git-retention-policy-reference-v1.schema.json#/$defs/Commit",
  "prd-artifact-records-v2.schema.json#/$defs/ArtifactVersion/properties/retention_policy_version_id",
  "prd-artifact-records-v2.schema.json#/$defs/EvidenceItem/properties/retention_policy_version_id",
  "external-prd-v2.schema.json#/$defs/Checkpoint/properties/retention_policy_version_id",
  "prd-review-decision-record-v2.schema.json#/properties/rationale_retention_policy_version_id",
];
for (const target of targets) {
  test(`${target} accepts only the supported full commit format`, () => {
    const validate = ajv.getSchema(base + target);
    assert.equal(validate("a1".repeat(20)), true);
    for (const value of ["main", "HEAD", "a".repeat(12), "a".repeat(39), "a".repeat(41), "A".repeat(40),
      "a".repeat(40) + "~1", "a".repeat(40) + "\n", "00000000-0000-4000-8000-000000000001", null, 1, {}, true]) {
      assert.equal(validate(value), false, JSON.stringify(value));
    }
  });
}
test("access envelopes use a closed commit resource reference", () => {
  const validate = ajv.getSchema(base + "access-envelope-v2.schema.json#/properties/retention_policy_ref");
  const ref = { resource_type: "RETENTION_POLICY_VERSION", resource_id: "b".repeat(40) };
  assert.equal(validate(ref), true);
  for (const value of [{ ...ref, resource_version: 1 }, { ...ref, repository: "https://example.invalid" },
    { ...ref, resource_type: "POLICY" }, { ...ref, resource_id: "main" }]) assert.equal(validate(value), false);
});
test("legacy retention fields retain UUID semantics", () => {
  const validate = ajv.getSchema(base + "external-prd-v1.schema.json#/$defs/Checkpoint/properties/retention_policy_version_id");
  assert.equal(validate("00000000-0000-4000-8000-000000000001"), true);
  assert.equal(validate("a".repeat(40)), false);
});

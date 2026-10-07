import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../../contracts/candidates/manual-gate2-v2/", import.meta.url);
const raw = (name) => readFileSync(new URL(name, root));
const read = (name) => JSON.parse(raw(name));
const hash = (body) => "sha256:" + createHash("sha256").update(body).digest("hex");
function validator(name) {
  // The unchanged predecessor uses type constraints shared through allOf/then.
  const ajv = new Ajv({strict: true, strictTypes: false});
  addFormats(ajv);
  return ajv.compile(read(name + ".schema.json"));
}

test("manual Gate2 manifest pins exactly the frozen contract bytes", () => {
  assert.equal(hash(raw("manifest.json")), "sha256:72877f8914391b231fe916853faed3c72f5d11456d154b1fe54d9ba6714b8387");
  const manifest = read("manifest.json");
  assert.deepEqual(Object.keys(manifest).sort(), readdirSync(root).filter(n => n.endsWith(".json") && n !== "manifest.json").sort());
  for (const [name, expected] of Object.entries(manifest)) assert.equal(hash(raw(name)), expected, name);
});

for (const name of ["command", "event", "material", "preparation", "rationale", "record", "status"]) {
  test(`manual Gate2 ${name} compiles as a closed schema`, () => {
    const validate = validator(name);
    assert.equal(validate({}), false);
    assert.equal(read(name + ".schema.json").additionalProperties, false);
  });
}

test("manual Gate2 preparation command has no caller authority or alternate task list", () => {
  const validate = validator("command");
  const value = {
    schema_version: "curve.manual-gate2.command/v2-candidate", action: "PREPARE",
    draft_revision_id: "10000000-0000-4000-8000-000000000001", subject_ref: null,
    rationale_ref: null, claims: [], reconciliation_ref: null,
  };
  assert.equal(validate(value), true, JSON.stringify(validate.errors));
  for (const field of ["actor_id", "authority", "tasks", "execution_authorized", "completion_credit"])
    assert.equal(validate({...value, [field]: true}), false, field);
  assert.equal(validate({...value, action: "EXECUTE"}), false);
  assert.equal(validate({...value, draft_revision_id: "different"}), false);
});

test("manual Gate2 policy keeps execution and completion credit excluded", () => {
  const policy = read("policy.json");
  assert.equal(policy.execution, false);
  assert.equal(policy.completion_credit, false);
  assert.deepEqual(policy.claim_key, ["workspace_id", "installation_id", "issue_id"]);
});

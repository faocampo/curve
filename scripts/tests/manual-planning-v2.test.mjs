import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import { canonicalJson, metadataDigest, parseStrictJson, validateManualDefinitionSemantics, validateInputIdentitySemantics, parseTypedInitiativeEtag } from "../lib/manual-planning-v2.mjs";

const require = createRequire(import.meta.url);
const Ajv = require("ajv/dist/2020.js");
const addFormats = require("ajv-formats");
const root = resolve(import.meta.dirname, "../..");
const base = resolve(root, "contracts/candidates/manual-planning-v2");
const readBase = resolve(root, "contracts/candidates/scope-editor-read-v2");
const uri = "https://curve.example.invalid/candidates/manual-planning-v2/";
const readUri = "https://curve.example.invalid/candidates/scope-editor-read-v2/";
const load = (path) => JSON.parse(readFileSync(path, "utf8"));
const digest = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const schemas = [];
for (const directory of [base, readBase]) {
  for (const name of readdirSync(directory).filter((file) => file.endsWith(".schema.json"))) {
    const schema = load(resolve(directory, name));
    ajv.addSchema(schema);
    schemas.push(schema);
  }
}
const validate = (id, value) => {
  const validator = ajv.getSchema(id);
  assert.ok(validator, `Missing schema ${id}`);
  return validator(value);
};
const fixtures = [
  ["definition", "manual-plan-definition"], ["save", "manual-plan-draft-save"],
  ["revision", "manual-plan-draft-revision"], ["status-absent", "manual-plan-draft-status"],
  ["status-current", "manual-plan-draft-status"], ["status-stale", "manual-plan-draft-status"],
  ["input-identity", "manual-plan-input-identity"], ["current-authority", "manual-plan-current-authority"],
  ["validation", "manual-plan-validation-receipt"], ["event", "manual-plan-draft-event"],
  ["error", "manual-plan-error"],
].map(([file, schema]) => [file, uri + schema + "-v2.schema.json", load(resolve(base, `fixtures/${file}.valid.json`))]);
for (const state of ["absent", "present", "error"]) {
  fixtures.push([`scope-${state}`, readUri + (state === "error" ? "scope-editor-error" : "scope-editor-precondition") + "-v2.schema.json", load(resolve(readBase, `fixtures/${state}.valid.json`))]);
}
for (const kind of ["model", "tool", "budget"]) {
  fixtures.push([`policy-${kind}`, uri + `manual-plan-${kind}-policy-v2.schema.json`, load(resolve(base, `manual-plan-${kind}-policy-v2.json`))]);
}
fixtures.push(["profile", uri + "manual-plan-profile-v2.schema.json", load(resolve(base, "manual-plan-profile-v2.json"))]);

test("all new schemas compile locally and have distinct identities", () => {
  assert.equal(new Set(schemas.map((schema) => schema.$id)).size, schemas.length);
  for (const schema of schemas) assert.ok(ajv.getSchema(schema.$id));
});

for (const [name, schema, value] of fixtures) {
  test(`closed schema accepts ${name}`, () => assert.equal(validate(schema, value), true, JSON.stringify(ajv.getSchema(schema).errors)));
  for (const key of Object.keys(value)) {
    test(`${name} rejects absent required ${key}`, () => {
      const changed = structuredClone(value); delete changed[key];
      assert.equal(validate(schema, changed), false);
    });
  }
  const paths = [];
  const walk = (value, path = []) => {
    if (Array.isArray(value)) value.forEach((item, index) => walk(item, [...path, index]));
    else if (value !== null && typeof value === "object") {
      paths.push(path);
      for (const [key, child] of Object.entries(value)) walk(child, [...path, key]);
    }
  };
  walk(value);
  for (const path of paths) {
    test(`${name} rejects an unknown property at ${path.join(".") || "root"}`, () => {
      const changed = structuredClone(value); let object = changed;
      for (const part of path) object = object[part];
      object.injected_authority = true;
      assert.equal(validate(schema, changed), false);
    });
  }
}

test("VersionRef is grounded in the recovered domain model and distinct from ObjectRef/ResourceRef", () => {
  const text = readFileSync(resolve(root, "docs/technical/domain-model.md"), "utf8");
  assert.match(text, /`VersionRef` \| `\{entity_id, version\}` or `\{entity_id, digest\}`/u);
  const common = uri + "common-v2.schema.json#/$defs/";
  const id = "30000000-0000-4000-8000-000000000001";
  assert.equal(validate(common + "VersionRef", { entity_id: id, version: 1 }), true);
  assert.equal(validate(common + "VersionRef", { entity_id: id, digest: "sha256:" + "a".repeat(64) }), true);
  for (const value of [{ entity_id: id }, { entity_id: id, version: 1, digest: "sha256:" + "a".repeat(64) },
    { resource_id: id, resource_version: 1 }, { object_id: id, digest: "sha256:" + "a".repeat(64) }]) {
    assert.equal(validate(common + "VersionRef", value), false);
  }
});

for (const directory of [base, readBase]) {
  test(`manifest covers exact candidate files in ${directory.split("/").at(-1)}`, () => {
    const manifest = load(resolve(directory, "manifest-v2.json"));
    const names = readdirSync(directory).filter((file) => file.endsWith(".json") && file !== "manifest-v2.json").sort();
    assert.deepEqual(Object.keys(manifest).sort(), names);
    for (const [name, expected] of Object.entries(manifest)) assert.equal(digest(readFileSync(resolve(directory, name))), expected);
  });
}

test("manual profile references exact policy identities and bytes", () => {
  const profile = load(resolve(base, "manual-plan-profile-v2.json"));
  for (const kind of ["model", "tool", "budget"]) {
    const path = resolve(base, `manual-plan-${kind}-policy-v2.json`), definition = load(path);
    assert.deepEqual(profile[`${kind}_policy_ref`], { entity_id: definition.id, digest: digest(readFileSync(path)) });
  }
  const policy = load(resolve(base, "policy-v2.json"));
  assert.deepEqual(policy.manual_profile_ref, { entity_id: profile.id, digest: digest(readFileSync(resolve(base, "manual-plan-profile-v2.json"))) });
  assert.deepEqual(profile.gates, ["PRD_APPROVAL", "PLAN_APPROVAL", "CODE_READINESS"]);
  assert.equal(profile.automatic_execution, "DENIED");
  assert.equal(policy.preplan_observations, "EXACT_CURRENT_SCOPED_SUBJECT_REQUIRED");
});

test("private original input identity and fresh authority cannot be substituted or exposed", () => {
  const original = load(resolve(base, "fixtures/input-identity.valid.json"));
  const fresh = load(resolve(base, "fixtures/current-authority.valid.json"));
  assert.equal(validate(uri + "manual-plan-input-identity-v2.schema.json", fresh), false);
  assert.equal(validate(uri + "manual-plan-current-authority-v2.schema.json", original), false);
  assert.equal(fresh.input_identity_digest, original.digest);
  const revision = load(resolve(base, "fixtures/revision.valid.json"));
  for (const key of ["original_input_identity", "current_authority", "acl_generation", "protected_path", "callbacks"]) {
    assert.equal(validate(uri + "manual-plan-draft-revision-v2.schema.json", { ...revision, [key]: original }), false);
  }
  assert.equal(validate(uri + "manual-plan-draft-revision-v2.schema.json", { ...revision, controlling: true }), false);
});

test("numeric bounds and empty/current distinctions are closed", () => {
  const save = load(resolve(base, "fixtures/save.valid.json"));
  for (const value of [true, false, -1, 0.5, 9007199254740992, "0", null]) {
    assert.equal(validate(uri + "manual-plan-draft-save-v2.schema.json", { ...save, expected_draft_revision: value }), false);
  }
  const absent = load(resolve(readBase, "fixtures/absent.valid.json"));
  assert.equal(validate(readUri + "scope-editor-precondition-v2.schema.json", { ...absent, scope_status: "PRESENT" }), false);
  assert.equal(validate(readUri + "scope-editor-precondition-v2.schema.json", { ...absent, expected_scope_revision: 1 }), false);
  const current = load(resolve(base, "fixtures/status-current.valid.json"));
  assert.equal(validate(uri + "manual-plan-draft-status-v2.schema.json", { ...current, current_revision_id: null }), false);
});

test("v2 explicitly selects typed C1-style strong Initiative ETags", () => {
  const id = "30000000-0000-4000-8000-000000000002";
  assert.equal(parseTypedInitiativeEtag(`"curve-initiative:${id}:v1"`, id), 1);
  assert.equal(parseTypedInitiativeEtag(`"curve-initiative:${id}:v9007199254740991"`, id), 9007199254740991);
  for (const value of ['"1"', "1", "*", `W/"curve-initiative:${id}:v1"`, `"curve-initiative:${id}:v01"`,
    `"curve-initiative:${id}:v0"`, `"curve-initiative:${id}:v9007199254740992"`, `"curve-initiative:${id}:v1"\n`,
    `"curve-initiative:30000000-0000-4000-8000-000000000003:v1"`]) assert.throws(() => parseTypedInitiativeEtag(value, id));
});

test("dependency pairs derive from pinned normative source and correct aggregate types", () => {
  const subset = load(resolve(base, "workflow-condition-subset-v2.json"));
  for (const source of subset.normative_sources) assert.equal(digest(readFileSync(resolve(root, source.path))), source.digest);
  const prd = readFileSync(resolve(root, "docs/curve-ai-native-sdlc-prd.md"), "utf8");
  assert.match(prd, /default for `EXECUTION_ORDER` is predecessor `DRAFT_ELIGIBLE`/u);
  assert.match(prd, /`MERGE_ORDER` is only observed because Curve does not merge/u);
  const slice = prd.split("\n").find((line) => line.startsWith("| Vertical Slice |") && line.includes("`PLANNED`"));
  const vcs = prd.split("\n").find((line) => line.startsWith("| PR/MR Binding |"));
  assert.ok(slice.includes("`DRAFT_ELIGIBLE`"));
  assert.ok(!slice.includes("`PLAN_APPROVED`") && !slice.includes("`MERGED`"));
  assert.ok(vcs.includes("`MERGED`"));
  assert.deepEqual(subset.unsupported_dependency_types, ["PLANNING_ORDER"]);
  assert.deepEqual(subset.allowed_conditions, facts.workflow_conditions.allowed_conditions);
  const merge = structuredClone(definition);
  Object.assign(merge.dependencies[0], subset.allowed_conditions[1]);
  assert.equal(validate(uri + "manual-plan-definition-v2.schema.json", merge), true);
  assert.equal(validateManualDefinitionSemantics(merge, facts), true);
  for (const change of [{ dependency_type: "PLANNING_ORDER", required_state: "PLAN_APPROVED" },
    { required_state: "CODE_READY" }, { condition_subject: "PR_MR_BINDING" },
    { condition_source: "AUTOMATIC_MERGE" }, { workflow_ref: facts.approved_subject_ref }]) {
    const value = structuredClone(definition); Object.assign(value.dependencies[0], change);
    assert.throws(() => validateManualDefinitionSemantics(value, facts));
  }
  const wrongWorkflow = structuredClone(facts); wrongWorkflow.workflow_conditions.workflow_ref = facts.approved_subject_ref;
  assert.throws(() => validateManualDefinitionSemantics(definition, wrongWorkflow));
});

for (const text of ['{"x":1,"x":2}', '{"x":1,"\\u0078":2}', '{"x":1.0}', '{"x":1e0}', '{"x":-0}',
  '{"x":NaN}', '{"x":Infinity}', '{"x":9007199254740992}', '{"x":01}', '{"x":true}garbage',
  '{"x":"\\ud800"}', '{"x":"\\udfff"}', '\ufeff{}', '{"x":1,}', '[1,]', '[undefined]']) {
  test(`strict parser rejects ${JSON.stringify(text)}`, () => assert.throws(() => parseStrictJson(Buffer.from(text))));
}

test("strict parser rejects malformed UTF-8 and preserves booleans, Unicode and safe integers", () => {
  assert.throws(() => parseStrictJson(Buffer.from([0xff])));
  const parsed = parseStrictJson(Buffer.from('{"z":true,"a":"é😀","n":9007199254740991}'));
  assert.equal(canonicalJson(parsed), '{"a":"é😀","n":9007199254740991,"z":true}');
  assert.equal(canonicalJson(parseStrictJson(Buffer.from('{"__proto__":null}'))), '{"__proto__":null}');
});

test("strict parser enforces inclusive byte, depth and node bounds", () => {
  const exact = Buffer.from(JSON.stringify("a".repeat(65534)));
  assert.equal(exact.length, 65536);
  assert.equal(parseStrictJson(exact).length, 65534);
  assert.throws(() => parseStrictJson(Buffer.concat([exact, Buffer.from(" ")])));
  assert.throws(() => parseStrictJson(Buffer.from("[[]]"), { maxDepth: 1 }));
  assert.throws(() => parseStrictJson(Buffer.from("[null]"), { maxNodes: 1 }));
  const protectedExact = Buffer.from(JSON.stringify("a".repeat(5242878)));
  assert.equal(parseStrictJson(protectedExact, { maxBytes: 5242880 }).length, 5242878);
  assert.throws(() => parseStrictJson(Buffer.concat([protectedExact, Buffer.from(" ")]), { maxBytes: 5242880 }));
});

test("canonical metadata hashes are cross-language stable and exclude only their digest field", () => {
  assert.equal(canonicalJson({ 2: "b", 10: "a" }), '{"10":"a","2":"b"}');
  assert.equal(canonicalJson({ "😀": 1, "\uffff": 2 }), '{"￿":2,"😀":1}');
  for (const file of ["revision", "input-identity", "validation"]) {
    const value = load(resolve(base, `fixtures/${file}.valid.json`));
    assert.equal(metadataDigest(value), value.digest);
    assert.equal(metadataDigest({ ...value, digest: "ignored" }), value.digest);
  }
  for (const value of [NaN, Infinity, 1.5, -0, undefined, () => 1, new Date()]) assert.throws(() => canonicalJson(value));
  for (const value of [Array(1), Array(2), Object.defineProperty({}, "hidden", { value: 1 }), { get value() { throw new Error("must not execute"); } }]) {
    assert.throws(() => canonicalJson(value));
  }
});

const definition = load(resolve(base, "fixtures/definition.valid.json"));
const facts = load(resolve(base, "fixtures/immutable-semantic-facts.json"));
test("synthetic definition semantics pass without executing inert commands", () => {
  assert.equal(validateManualDefinitionSemantics(definition, facts), true);
  const hostile = structuredClone(definition);
  hostile.slices[0].verification_steps[0].command_text = "Never execute this text: rm -rf /";
  assert.equal(validateManualDefinitionSemantics(hostile, facts), true);
});

test("original input receipt retains every required gate and unique assignment identities", () => {
  const identity = load(resolve(base, "fixtures/input-identity.valid.json"));
  assert.equal(validateInputIdentitySemantics(identity, definition), true);
  const duplicateGate = structuredClone(identity);
  duplicateGate.gate_assignments[1].gate_type = "CODE_READINESS";
  assert.equal(validate(uri + "manual-plan-input-identity-v2.schema.json", duplicateGate), false);
  const duplicateAssignment = structuredClone(identity);
  duplicateAssignment.gate_assignments[1].gate_assignment_id = duplicateAssignment.gate_assignments[0].gate_assignment_id;
  duplicateAssignment.digest = metadataDigest(duplicateAssignment);
  assert.throws(() => validateInputIdentitySemantics(duplicateAssignment, definition));
  const duplicateHuman = structuredClone(identity);
  duplicateHuman.gate_assignments[1].approver_user_id = duplicateHuman.gate_assignments[0].approver_user_id;
  duplicateHuman.digest = metadataDigest(duplicateHuman);
  assert.throws(() => validateInputIdentitySemantics(duplicateHuman, definition));
});

test("dependency artifact references require trusted original material", () => {
  const value = structuredClone(definition), trusted = structuredClone(facts);
  value.dependencies[0].artifact_ref = structuredClone(facts.protected_object_refs[0]);
  assert.throws(() => validateManualDefinitionSemantics(value, facts));
  trusted.dependency_artifact_refs.push(value.dependencies[0].artifact_ref);
  assert.equal(validateManualDefinitionSemantics(value, trusted), true);
  trusted.protected_object_refs = [];
  assert.throws(() => validateManualDefinitionSemantics(value, trusted));
  const identity = load(resolve(base, "fixtures/input-identity.valid.json"));
  assert.equal(validateInputIdentitySemantics(identity, value), true);
  value.dependencies[0].artifact_ref = { ...value.dependencies[0].artifact_ref, object_id: facts.workspace_id };
  assert.throws(() => validateInputIdentitySemantics(identity, value));
});

for (const suffix of ["alpha.lock", "alpha/", "alpha.", "/alpha", ".alpha", "alpha@{foo}", "unrelated"]) {
  test(`branch rejects ${suffix}`, () => {
    const value = structuredClone(definition); value.slices[0].branch_name = `curve/${facts.initiative_key}/${suffix}`;
    assert.throws(() => validateManualDefinitionSemantics(value, facts));
  });
}
test("component path rejects NUL and other control characters", () => {
  for (const control of ["\0", "\r", "\n", "\x7f"]) {
    const value = structuredClone(definition); value.slices[0].expected_components[0].path = `src/invalid${control}file`;
    assert.equal(validate(uri + "manual-plan-definition-v2.schema.json", value), false);
    assert.throws(() => validateManualDefinitionSemantics(value, facts));
  }
});

const mutations = {
  "different approved subject": (x) => { x.approved_subject_ref.digest = "sha256:" + "0".repeat(64); },
  "different profile": (x) => { x.manual_profile_ref.digest = "sha256:" + "0".repeat(64); },
  "different scope": (x) => { x.scope_revision_ref.digest = "sha256:" + "0".repeat(64); },
  "different workflow": (x) => { x.workflow_ref.digest = "sha256:" + "0".repeat(64); },
  "different quality policy": (x) => { x.quality_policy_ref.digest = "sha256:" + "0".repeat(64); },
  "duplicate repository": (x) => x.repositories.push(structuredClone(x.repositories[0])),
  "changed base": (x) => { x.repositories[0].base_commit.value = "2".repeat(40); },
  "changed context": (x) => { x.repositories[0].context_input_ref.digest = "sha256:" + "0".repeat(64); },
  "duplicate slice": (x) => x.slices.push(structuredClone(x.slices[0])),
  "unknown repository": (x) => { x.slices[0].repository_binding_id = facts.workspace_id; },
  "nonhuman owner": (x) => { x.slices[0].owner.actor_type = "AGENT"; },
  "unknown owner": (x) => { x.slices[0].owner.actor_id = facts.workspace_id; },
  "wrong code approver": (x) => { x.slices[0].code_approver.actor_id = facts.owner_ids[0]; },
  "understated risk": (x) => { x.slices[0].risk_tier = "LOW"; },
  "different budget": (x) => { x.slices[0].budget_policy_ref.digest = "sha256:" + "0".repeat(64); },
  "unknown requirement": (x) => { x.slices[0].requirement_ids = ["FR-UNKNOWN"]; },
  "missing requirement coverage": (x) => { x.slices[0].requirement_ids = ["FR-009"]; },
  "unknown acceptance": (x) => { x.slices[0].acceptance_ids = ["AC-UNKNOWN"]; },
  "missing acceptance coverage": (x) => { x.slices[0].acceptance_ids = ["AC-11"]; },
  "missing quality check": (x) => x.slices[0].verification_steps.pop(),
  "duplicate check": (x) => x.slices[0].verification_steps.push(structuredClone(x.slices[0].verification_steps[0])),
  "traversal path": (x) => { x.slices[0].expected_components[0].path = "../outside"; },
  "absolute path": (x) => { x.slices[0].expected_components[0].path = "/outside"; },
  "unsafe branch": (x) => { x.slices[0].branch_name = "curve/example-initiative/../escape"; },
  "unapproved delivery item": (x) => { x.slices[0].proposed_delivery_refs[0].source_issue_id = facts.workspace_id; },
  "missing delivery coverage": (x) => { x.slices[0].proposed_delivery_refs = []; },
  "duplicate delivery reference": (x) => x.slices[0].proposed_delivery_refs.push(structuredClone(x.slices[0].proposed_delivery_refs[0])),
  "unsorted slices": (x) => x.slices.reverse(),
  "self edge": (x) => { x.dependencies[0].successor_slice_key = "alpha"; },
  "missing edge target": (x) => { x.dependencies[0].successor_slice_key = "missing"; },
  "duplicate edge": (x) => x.dependencies.push(structuredClone(x.dependencies[0])),
  "already satisfied future condition": (x) => { x.dependencies[0].condition_status = "SATISFIED"; },
  "invalid merge condition": (x) => { x.dependencies[0].dependency_type = "MERGE_ORDER"; },
  "cycle": (x) => x.dependencies.push({ ...x.dependencies[0], predecessor_slice_key: "beta", successor_slice_key: "alpha" }),
};
for (const [name, mutate] of Object.entries(mutations)) {
  test(`definition rejects ${name}`, () => {
    const value = structuredClone(definition); mutate(value);
    assert.throws(() => validateManualDefinitionSemantics(value, facts));
  });
}

test("proposed qualification is never executable or an inherited historical pass", () => {
  const delta = load(resolve(base, "qualification-delta-v2.json"));
  assert.equal(delta.status, "PROPOSED_NOT_RUNTIME_QUALIFIED");
  assert.equal(delta.draft_successor.current_catalog_digest, null);
  assert.equal(delta.draft_successor.migration_digest, null);
  assert.equal(delta.draft_successor.runtime_source_digests, null);
  assert.equal(delta.draft_successor.runtime_added.length, 11);
  assert.deepEqual(delta.draft_successor.runtime_replaced, ["models.py", "urls.py"]);
  assert.deepEqual(delta.draft_successor.excluded_writers, ["PLAN_APPROVAL", "CONTROLLING_WORK_BINDING", "EXECUTION", "COMPLETION_CREDIT"]);
  assert.equal(delta.draft_successor.immediate_predecessor, "project_association_read_qualification.json");
  assert.deepEqual(delta.read_successor.non_runtime_delta, []);
});

test("OpenAPI contains only the new draft/read routes and no control authority", () => {
  const draft = load(resolve(base, "openapi-v2.json")), read = load(resolve(readBase, "openapi-v2.json"));
  assert.equal(Object.keys(draft.paths).length, 4);
  assert.equal(Object.keys(read.paths).length, 1);
  assert.ok(Object.keys(draft.paths).every((path) => path.includes("/manual-plan-drafts/v2/")));
  assert.ok(Object.keys(read.paths)[0].endsWith("/scope-editor/v2/preconditions/"));
  assert.equal(Object.values(draft.paths).flatMap((path) => Object.keys(path)).filter((method) => method === "post").length, 1);
  for (const document of [draft, read]) for (const path of Object.values(document.paths)) for (const operation of Object.values(path)) {
    for (const [status, response] of Object.entries(operation.responses)) {
      if (Number(status) >= 400) assert.equal(Object.hasOwn(response.headers, "ETag"), false);
    }
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  assertProductAcceptsNewInitiative,
  isIanaTimeZone,
  productArchiveBlockers,
  validateProductCoreDecision,
  validateProductEventSemantics,
  validateProductPolicy,
  validateProductRecordSemantics,
} from "../lib/product-core.mjs";
import { contextPathsFor, digestContextEntries } from "../lib/context-pack.mjs";

const readJson = (path) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const decision = readJson("contracts/governance/m1-00a-product-core-v1.json");
const policy = readJson("contracts/policy/product-policy-v1.json");
const product = readJson("contracts/schemas/examples/product.valid.json");
const productEvent = readJson("contracts/schemas/examples/product-event-v1.valid.json");
const taskPacket = readFileSync(
  new URL("../../docs/technical/m1-00a-product-core-task-packet.md", import.meta.url),
  "utf8",
);
const implementationEvidence = readFileSync(
  new URL("../../docs/technical/m1-00a-product-core-implementation-evidence.md", import.meta.url),
  "utf8",
);
const physicalSchemaEvidence = readJson(
  "contracts/database/m1-00a-product-physical-schema-evidence-v1.json",
);
const implementedErd = readFileSync(
  new URL("../../docs/technical/implemented-entity-relationship-model.md", import.meta.url),
  "utf8",
);

test("approved M1-00A decision preserves every exact Product semantic", () => {
  assert.equal(validateProductCoreDecision(decision), true);
});

test("Product decision rejects a mutable key", () => {
  const changed = structuredClone(decision);
  changed.semantics.key.mutable = true;
  assert.throws(() => validateProductCoreDecision(changed), /Product key semantics/);
});

test("Product decision rejects an M2 entity in M1", () => {
  const changed = structuredClone(decision);
  changed.semantics.deferred_to_m2 = changed.semantics.deferred_to_m2.filter((value) => value !== "ROADMAP");
  assert.throws(() => validateProductCoreDecision(changed), /M2 deferral boundary/);
});

test("IANA timezone validation accepts named zones and rejects offsets or unknown zones", () => {
  assert.equal(isIanaTimeZone("America/Argentina/Buenos_Aires"), true);
  assert.equal(isIanaTimeZone("UTC"), true);
  assert.equal(isIanaTimeZone("-03:00"), false);
  assert.equal(isIanaTimeZone("X3M/Unknown"), false);
});

test("Product record requires a valid IANA timezone and human owner", () => {
  assert.equal(validateProductRecordSemantics(product), true);
  assert.throws(
    () => validateProductRecordSemantics({ ...product, timezone: "-03:00" }),
    /IANA timezone/,
  );
  assert.throws(
    () => validateProductRecordSemantics({ ...product, owner: { ...product.owner, actor_type: "AGENT" } }),
    /owner must be human/,
  );
});

test("timezone update event binds distinct previous and current IANA values", () => {
  assert.equal(validateProductEventSemantics(productEvent), true);
  assert.throws(
    () => validateProductEventSemantics({ ...productEvent, current_timezone: productEvent.previous_timezone }),
    /prospective and value-changing/,
  );
  const missingPrevious = structuredClone(productEvent);
  delete missingPrevious.previous_timezone;
  assert.throws(() => validateProductEventSemantics(missingPrevious), /previous and current/);
});

test("non-timezone metadata event cannot carry timezone values", () => {
  const changed = { ...productEvent, changed_fields: ["name"] };
  assert.throws(() => validateProductEventSemantics(changed), /without a timezone change/);
});

test("owner reassignment must select a different human", () => {
  const event = {
    event_type: "PRODUCT_OWNER_REASSIGNED",
    previous_owner_user_id: "30000000-0000-4000-8000-000000000001",
    current_owner_user_id: "30000000-0000-4000-8000-000000000001",
  };
  assert.throws(() => validateProductEventSemantics(event), /must change/);
});

test("Product policy preserves exact human authorities and Plane Admin mapping", () => {
  assert.equal(validateProductPolicy(policy), true);
  const changed = structuredClone(policy);
  changed.principal_mapping.workspace_administrator.role_value = 15;
  assert.throws(() => validateProductPolicy(changed), /principal mapping/);
});

test("Product policy rejects agents and duplicate or unknown actions", () => {
  const agent = structuredClone(policy);
  agent.actions[0].authorities = ["AGENT"];
  assert.throws(() => validateProductPolicy(agent), /authorities/);
  const duplicate = structuredClone(policy);
  duplicate.actions[5] = structuredClone(duplicate.actions[0]);
  assert.throws(() => validateProductPolicy(duplicate), /duplicate actions/);
});

test("archive guard permits only terminal Initiative states", () => {
  assert.deepEqual(
    productArchiveBlockers({
      initiativeStates: ["READY_FOR_REPOSITORY_REVIEW", "CANCELLED"],
      initiativeGuardAvailable: true,
    }),
    [],
  );
  assert.deepEqual(
    productArchiveBlockers({ initiativeStates: ["FAILED", "DRAFT"], initiativeGuardAvailable: true }),
    ["NON_TERMINAL_INITIATIVE:FAILED", "NON_TERMINAL_INITIATIVE:DRAFT"],
  );
});

test("archive guard fails closed when Initiative state cannot be checked", () => {
  assert.deepEqual(
    productArchiveBlockers({ initiativeStates: [], initiativeGuardAvailable: false }),
    ["INITIATIVE_GUARD_UNAVAILABLE"],
  );
});

test("archived Product rejects new Initiative while active Product accepts it", () => {
  assert.equal(assertProductAcceptsNewInitiative(product), true);
  assert.throws(
    () => assertProductAcceptsNewInitiative({ ...product, state: "ARCHIVED" }),
    /ARCHIVED_PRODUCT_REJECTS_NEW_INITIATIVE/,
  );
});

test("M1-00A context pack binds every normative Product contract", () => {
  const paths = contextPathsFor("M1-00A");
  const required = [
    "contracts/database/m1-00a-product-core-relational-contract.md",
    "contracts/governance/m1-00a-product-core-v1.json",
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/policy/product-policy-v1.json",
    "contracts/schemas/product-event-v1.schema.json",
    "contracts/schemas/product.schema.json",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/m1-00a-product-core-task-packet.md",
    "scripts/lib/product-core.mjs",
    "scripts/tests/product-core.test.mjs",
  ];
  for (const path of required) assert.equal(paths.includes(path), true, `missing ${path}`);
  const entries = paths.map((path) => ({
    path,
    contents: readFileSync(new URL(`../../${path}`, import.meta.url)),
  }));
  assert.match(digestContextEntries(entries), /^sha256:[0-9a-f]{64}$/);
});

test("M1-00A lifecycle records the merged local result and leaves exact conformance open", () => {
  assert.match(taskPacket, /`MERGED \/ LOCAL_ACCEPTANCE_RECORDED \/ CONFORMANCE_VARIANCE_OPEN`/);
  assert.doesNotMatch(taskPacket, /`PREPARED_NOT_DISPATCHABLE`/);
  assert.match(taskPacket, /R-027 \(Product timestamp\/schema-version contract reconciliation\) remains undecided/);
  assert.match(implementationEvidence, /d4ab9ea7c6d19222c316a51d7d2992415c8940f0/);
  assert.match(implementationEvidence, /afdb59388e4ea9b2321d33935000126303fc93b8/);
  assert.match(implementationEvidence, /1c4904d617207b8301954c1019fe0fc6bf099b6d/);
  assert.match(implementationEvidence, /sha256:951fd873f4a9179aae58359e595e48e80ba081a9703202f6b9d9eed51b4b3b6f/);
  assert.match(implementationEvidence, /33233528896/);
  assert.match(implementationEvidence, /33233531615/);
  assert.match(implementationEvidence, /33233534728/);
  assert.match(implementationEvidence, /`MERGED \/ LOCAL_ACCEPTANCE_RECORDED \/ CONFORMANCE_VARIANCE_OPEN`/);
  assert.match(implementationEvidence, /Exact\s+relational conformance, production qualification,[\s\S]*remain fail-closed/);
  assert.match(implementationEvidence, /grants no continuing mutation authority|local functional\s+evidence is complete/);
});

test("M1-00A physical Product indexes are exact, source-bound, and represented in the ERD", () => {
  assert.equal(physicalSchemaEvidence.plane_revision, "99a73b4eab5ee21fd012d7358bc9259252d47f71");
  assert.equal(physicalSchemaEvidence.plane_tree, "fd1c18aa4754620bd3b0d28f3cb82af565c4e5a4");
  assert.equal(physicalSchemaEvidence.migration_boundary, "curve.0006_product");
  assert.equal(physicalSchemaEvidence.evidence_scope, "INDEX_EXISTENCE");

  assert.deepEqual(physicalSchemaEvidence.sources, [
    {
      path: "apps/api/plane/curve/migrations/0006_product.py",
      git_blob: "d9905634e63e0e1c5e4da37439547079772f36eb",
      sha256: "sha256:219caf004407992065fa854b667408e8b435c7e91ed7bd78d6dd3b4a26d1d0b9",
    },
  ]);

  const product = physicalSchemaEvidence.tables.find(({ table }) => table === "curve_product");
  assert.ok(product, "curve_product physical evidence is required");
  assert.equal(product.new_index_migration_required, false);
  const indexes = new Map(product.indexes.map((index) => [index.name, index]));
  assert.deepEqual(indexes.get("curve_product_workspace_state_key_idx"), {
    name: "curve_product_workspace_state_key_idx",
    columns: ["workspace_id", "state", "key"],
    unique: false,
    implementation: "DJANGO_RUNSQL",
    forward_sql:
      "CREATE INDEX curve_product_workspace_state_key_idx ON curve_product (workspace_id, state, key)",
    reverse_sql: "DROP INDEX IF EXISTS curve_product_workspace_state_key_idx",
  });
  assert.deepEqual(indexes.get("curve_product_workspace_owner_state_idx"), {
    name: "curve_product_workspace_owner_state_idx",
    columns: ["workspace_id", "owner_user_id", "state"],
    unique: false,
    implementation: "DJANGO_RUNSQL",
    forward_sql:
      "CREATE INDEX curve_product_workspace_owner_state_idx ON curve_product (workspace_id, owner_user_id, state)",
    reverse_sql: "DROP INDEX IF EXISTS curve_product_workspace_owner_state_idx",
  });

  for (const indexName of indexes.keys()) assert.match(implementedErd, new RegExp(indexName));
  assert.match(implementedErd, /physical `RunSQL` operations in released[\s\S]*`0006_product\.py`/);
  assert.match(implementedErd, /R-027 \(Product timestamp\/schema-version contract reconciliation\)/);
  assert.match(implementedErd, /Django application UTC; auto_now_add/);
  assert.match(implementedErd, /Django application UTC; auto_now/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const erd = readFileSync(
  new URL(
    "../../docs/technical/implemented-entity-relationship-model.md",
    import.meta.url,
  ),
  "utf8",
);

const expectedPlaneRevision =
  "99a73b4eab5ee21fd012d7358bc9259252d47f71";
const curveEntities = [
  "AUDIT_EVENT",
  "DOMAIN_EVENT",
  "GATE_ASSIGNMENT",
  "IDEMPOTENCY_RECORD",
  "INBOX_MESSAGE",
  "INITIATIVE",
  "OPERATION",
  "OUTBOX_EVENT",
  "POLICY_DECISION",
  "PRODUCT",
  "PROVIDER_CAPABILITY",
  "PROVIDER_CONNECTION",
].sort();
const externalEntities = ["EXTERNAL_PLANE_USER", "EXTERNAL_PLANE_WORKSPACE"].sort();
const physicalTables = [
  "curve_audit_event",
  "curve_domain_event",
  "curve_gate_assignment",
  "curve_idempotency_record",
  "curve_inbox_message",
  "curve_initiative",
  "curve_operation",
  "curve_outbox_event",
  "curve_policy_decision",
  "curve_product",
  "curve_provider_capability",
  "curve_provider_connection",
].sort();
const migrationHistory = [
  "0001_initial",
  "0002_initial",
  "0003_policydecision",
  "0004_policydecision_recorded_at_default",
  "0005_providerconnection_providercapability",
  "0006_product",
  "0007_initiative_gateassignment",
];

function mermaidErd() {
  const match = erd.match(/```mermaid\n(erDiagram[\s\S]*?)\n```/);
  assert.ok(match, "implemented physical Mermaid ERD is required");
  return match[1];
}

test("implemented ERD binds the exact Plane and migration snapshot", () => {
  assert.match(erd, new RegExp(expectedPlaneRevision));
  assert.match(
    erd,
    /\| Contract derivation baseline \| Curve `main` `a0d21bee7f98f2477d9cfe69708a8ac043c4fc69`/,
  );
  assert.match(erd, /regular Git blob and merged commit containing these exact bytes/);
  assert.doesNotMatch(erd, /Assigned after this reconciliation is merged/);
  assert.doesNotMatch(erd, /MUST be updated with that exact commit in the next governed revision/);
  assert.match(
    erd,
    /\| Migration boundary \| `curve\.0001_initial` through `curve\.0007_initiative_gateassignment` \|/,
  );
  assert.match(erd, /observational physical evidence/);
  assert.match(erd, /R-027 \(Product timestamp\/schema-version contract reconciliation\)/);
});

test("implemented ERD enumerates every current Curve table exactly once", () => {
  const diagram = mermaidErd();
  const declaredEntities = [
    ...diagram.matchAll(/^\s{4}([A-Z_]+) \{$/gm),
  ].map(([, entity]) => entity);

  assert.deepEqual(
    [...new Set(declaredEntities)].sort(),
    [...externalEntities, ...curveEntities].sort(),
  );
  assert.equal(declaredEntities.length, externalEntities.length + curveEntities.length);

  const documentedTables = [
    ...erd.matchAll(/^\| `(curve_[a-z_]+)` \|/gm),
  ].map(([, table]) => table);
  assert.deepEqual([...new Set(documentedTables)].sort(), physicalTables);
});

test("workspace ownership, SQL FKs, and opaque references remain explicit", () => {
  const diagram = mermaidErd();
  for (const entity of curveEntities) {
    assert.match(
      diagram,
      new RegExp(`EXTERNAL_PLANE_WORKSPACE \\|\\|--o\\{ ${entity} :`),
      `${entity}: workspace ownership`,
    );
  }

  for (const relation of [
    "INITIATIVE ||--|{ GATE_ASSIGNMENT",
    "PROVIDER_CONNECTION ||--o{ PROVIDER_CAPABILITY",
    "PROVIDER_CAPABILITY o|--o{ PROVIDER_CONNECTION",
  ]) {
    assert.match(diagram, new RegExp(relation.replaceAll("|", "\\|")));
  }
  assert.match(erd, /`PROTECT` FK plus unique/);
  assert.match(erd, /Nullable `PROTECT` FK; no database uniqueness/);
  assert.match(erd, /Opaque `event_id`.*no SQL FK/);
  assert.match(erd, /Generic `\(aggregate_type, aggregate_id\)`; no SQL FK/);
});

test("implemented indexes and workspace-first uniqueness fences are complete", () => {
  for (const fence of [
    "curve_product_workspace_key_uniq",
    "Functional unique `(workspace_id, lower(keyword))`",
    "(workspace_id, initiative_id, gate_type)",
    "(workspace_id, environment, adapter_key)",
    "(workspace_id, connection_id, capability_version)",
    "(workspace_id, aggregate_type, aggregate_id, sequence)",
    "(workspace_id, event_id, destination)",
    "(workspace_id, consumer_id, event_id)",
    "(workspace_id, principal_scope, command_scope, key_digest)",
    "(workspace_id, resource_type, resource_id, sequence)",
    "(workspace_id, target_type, target_id, sequence)",
  ]) {
    assert.ok(erd.includes(fence), `missing ERD fence: ${fence}`);
  }
  assert.match(erd, /Uniqueness always begins with `workspace_id`/);
});

test("migration history and protected-storage boundary stay fail closed", () => {
  const documentedMigrations = [
    ...erd.matchAll(/^\| `(000[1-7]_[a-z0-9_]+)` \|/gm),
  ].map(([, migration]) => migration);
  assert.deepEqual(documentedMigrations, migrationHistory);

  const diagram = mermaidErd();
  for (const plannedEntity of [
    "STORED_OBJECT",
    "ARTIFACT",
    "ARTIFACT_VERSION",
    "EVIDENCE_ITEM",
    "CONTEXT_PACK",
  ]) {
    assert.doesNotMatch(diagram, new RegExp(`\\b${plannedEntity}\\b`));
  }
  assert.match(erd, /D-009.*remains the\s+activation gate/s);
  assert.match(erd, /fails closed to those capabilities/);
});

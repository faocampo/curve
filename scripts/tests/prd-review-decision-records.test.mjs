import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ strict: false });
addFormats(ajv);
for (const name of ["common.schema.json", "external-prd-v1.schema.json", "prd-review-decision-record-v1.schema.json"]) {
  ajv.addSchema(JSON.parse(readFileSync(new URL(`../../contracts/schemas/${name}`, import.meta.url), "utf8")));
}
const validate = ajv.getSchema("https://curve.example.invalid/contracts/schemas/prd-review-decision-record-v1.schema.json");
const id = (n) => `97000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
function fixture() {
  return {
    schema_version: "1.0-candidate", id: id(1), workspace_id: id(2), initiative_id: id(3),
    gate_assignment_id: id(4), checkpoint_id: id(5), artifact_version_id: id(6),
    content_digest: `sha256:${"a".repeat(64)}`, provider_version: "source-one", evidence_snapshot_id: id(7),
    access_evaluation_id: id(8), policy_version_ids: [id(9)], confirmed_risk_tier: "STANDARD", state: "APPROVED",
    decided_by: { actor_type: "HUMAN", actor_id: id(10) }, decided_at: "2026-01-01T00:03:00Z",
    provider_validation_cutoff: "2026-01-01T00:02:00Z",
    rationale_ref: { object_id: id(11), digest: `sha256:${"b".repeat(64)}`, size_bytes: 123, media_type: "text/plain; charset=utf-8" },
    rationale_access_envelope_id: id(12), rationale_retention_policy_version_id: id(13),
  };
}

for (const state of ["APPROVED", "CHANGES_REQUESTED", "REJECTED"]) {
  test(`${state} retains closed metadata without a rationale body`, () => {
    const value = fixture(); value.state = state;
    const before = structuredClone(value);
    assert.equal(validate(value), true);
    assert.deepEqual(value, before);
  });
}
for (const [name, change] of [
  ["inline rationale", (x) => { x.rationale = "Synthetic text"; }],
  ["inline body", (x) => { x.rationale_ref.body = "Synthetic text"; }],
  ["raw object URL", (x) => { x.rationale_ref.url = "https://example.invalid/object"; }],
  ["missing envelope", (x) => { delete x.rationale_access_envelope_id; }],
  ["missing retention", (x) => { delete x.rationale_retention_policy_version_id; }],
  ["wrong content type", (x) => { x.rationale_ref.media_type = "text/html"; }],
  ["empty bytes", (x) => { x.rationale_ref.size_bytes = 0; }],
  ["too many bytes", (x) => { x.rationale_ref.size_bytes = 8001; }],
  ["fractional length", (x) => { x.rationale_ref.size_bytes = 1.5; }],
  ["missing policy", (x) => { x.policy_version_ids = []; }],
  ["duplicate policy", (x) => { x.policy_version_ids.push(x.policy_version_ids[0]); }],
  ["service reviewer", (x) => { x.decided_by.actor_type = "SERVICE"; }],
  ["pending outcome", (x) => { x.state = "PENDING"; }],
  ["mutable approval state", (x) => { x.state = "SUPERSEDED"; }],
]) {
  test(`rejects ${name}`, () => { const value = fixture(); change(value); assert.equal(validate(value), false); });
}

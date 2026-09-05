import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateCheckpointGraph, validateApprovalGraph } from "../lib/external-prd-records.mjs";

const read = (path) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));
const contract = read("contracts/schemas/external-prd-v1.schema.json");
const api = read("contracts/openapi/external-prd-v1.openapi.json");
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema(read("contracts/schemas/common.schema.json"));
ajv.addSchema(contract);
const validate = (name, value) => ajv.getSchema(`${contract.$id}#/$defs/${name}`)(value);
// Deterministic fabricated identities; no deployed resource or authority.
const id = (n) => `91000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const human = (n) => ({ actor_type: "HUMAN", actor_id: id(n) });

function fixture() {
  const base = { schema_version: "1.0", workspace_id: id(1), initiative_id: id(2) };
  const binding = { ...base, id: id(3), artifact_kind: "PRD", provider_connection_id: id(5), provider_file_id: "fictional-document", provider_container_id: "fictional-container", canonical_url: "https://docs.example.invalid/document/fictional-document", current_provider_version: "9007199254740993", current_revision_id: null, current_modified_at: "2026-09-05T12:00:00Z", synchronization_status: "CURRENT", access_status: "ALLOWED", last_reconciled_at: "2026-09-05T12:00:00Z", version: 1, created_by: human(4), created_at: "2026-09-05T11:00:00Z" };
  const digest = `sha256:${"a".repeat(64)}`;
  const checkpoint = { ...base, id: id(7), external_document_binding_id: binding.id, artifact_version_id: id(8), checkpoint_number: 1, checkpoint_type: "SUBMITTED", provider_connection_id: binding.provider_connection_id, provider_file_id: binding.provider_file_id, provider_container_id: binding.provider_container_id, provider_version: binding.current_provider_version, revision_id: null, normalized_content_ref: { object_id: id(9), digest, size_bytes: 100, media_type: "application/json" }, content_digest: digest, normalization_schema_version: "curve.google-docs.normalized/v1-candidate", evidence_snapshot_id: id(11), access_evaluation_id: id(12), completeness_check_id: id(13), retention_policy_version_id: id(14), access_envelope_id: id(15), predecessor_id: null, submitted_or_approved_by: human(4), recorded_at: "2026-09-05T12:00:00Z" };
  const assignments = ["PRD_APPROVAL", "PLAN_APPROVAL", "CODE_READINESS"].map((gate_type, i) => ({ id: id(20 + i), workspace_id: base.workspace_id, initiative_id: base.initiative_id, gate_type, approver: human(30 + i), valid_from: "2026-09-05T11:00:00Z", valid_until: null, delegation_reason: null }));
  const approval = { ...base, id: id(10), gate_assignment_id: id(20), checkpoint_id: checkpoint.id, artifact_version_id: checkpoint.artifact_version_id, content_digest: digest, provider_version: checkpoint.provider_version, evidence_snapshot_id: checkpoint.evidence_snapshot_id, access_evaluation_id: id(16), policy_version_ids: [id(17)], confirmed_risk_tier: "STANDARD", state: "APPROVED", decided_by: human(30), decided_at: "2026-09-05T12:05:00Z", provider_validation_cutoff: "2026-09-05T12:04:59Z", rationale: "Synthetic product review completed." };
  return { binding, checkpoint, approval, assignments, active_human_ids: assignments.map((a) => a.approver.actor_id) };
}

for (const name of ["Binding", "Checkpoint", "Approval"]) {
  test(`${name} metadata validates and every required field is enforced`, () => {
    const value = fixture()[name.toLowerCase()];
    assert.equal(validate(name, value), true);
    for (const field of contract.$defs[name].required) {
      const missing = structuredClone(value); delete missing[field];
      assert.equal(validate(name, missing), false, field);
    }
    for (const field of ["normalized_content", "access_token", "raw_provider_response", "private_profile"]) {
      assert.equal(validate(name, { ...value, [field]: "forbidden" }), false);
    }
  });
}

test("metadata rejects insecure URLs, numeric source versions, bot attribution and inline bodies", () => {
  const { binding, checkpoint, approval } = fixture();
  assert.equal(validate("Binding", { ...binding, canonical_url: "http://docs.example.invalid/document" }), false);
  assert.equal(validate("Binding", { ...binding, current_provider_version: 9007199254740992 }), false);
  assert.equal(validate("Checkpoint", { ...checkpoint, normalized_content_ref: { body: "Synthetic content" } }), false);
  assert.equal(validate("Approval", { ...approval, decided_by: { actor_type: "SERVICE", actor_id: id(30) } }), false);
  assert.equal(validate("Approval", { ...approval, policy_version_ids: [] }), false);
});

test("five command shapes reject caller authority, credentials, source URLs and duplicate version fields", () => {
  const { approval } = fixture();
  const commands = {
    Link: { provider_connection_id: id(5), provider_file_id: "fictional-document", selection_receipt_id: id(40) },
    Create: { provider_connection_id: id(5), template_configuration_id: id(41), destination_configuration_id: id(42) },
    Submit: { external_document_binding_id: id(3), evidence_snapshot_id: id(11), completeness_check_id: id(13) },
    Approve: Object.fromEntries(contract.$defs.Approve.required.map((key) => [key, approval[key]])),
    Reconcile: {},
  };
  for (const [name, value] of Object.entries(commands)) {
    assert.equal(validate(name, value), true, name);
    for (const field of ["actor_id", "workspace_id", "canonical_url", "credentials", "expected_version", "policy_allowed"]) {
      assert.equal(validate(name, { ...value, [field]: "caller-supplied" }), false, `${name}.${field}`);
    }
  }
});

test("OpenAPI keeps every mutation asynchronous and scoped by both precondition and idempotency", () => {
  assert.equal(api["x-curve-activation"], "DISABLED_PENDING_CONSUMING_CONTRACTS");
  assert.deepEqual(api.security, [{ planeSession: [] }]);
  const posts = Object.values(api.paths).flatMap((path) => path.post ? [path.post] : []);
  assert.equal(posts.length, 5);
  const reads = Object.values(api.paths).flatMap((path) => path.get ? [path.get] : []);
  assert.equal(reads.length, 4);
  assert.ok(reads.some((operation) => operation.operationId === "listExternalPrdApprovals"));
  for (const operation of posts) {
    const refs = operation.parameters.map((param) => param.$ref);
    for (const name of ["WorkspaceSlug", "InitiativeId", "IfMatch", "IdempotencyKey"]) {
      assert.ok(refs.includes(`#/components/parameters/${name}`));
      assert.equal(api.components.parameters[name].required, true);
    }
    assert.ok(operation.responses["202"]);
    assert.equal(operation.responses["200"], undefined);
    for (const code of ["401", "404", "409", "412", "428", "503"]) assert.ok(operation.responses[code]);
  }
  const problem = api.components.responses.Problem.content["application/problem+json"].schema;
  const validateProblem = ajv.compile(problem);
  const safe = { type: "about:blank", title: "Source access unavailable", status: 422, code: "SOURCE_ACCESS_DENIED", correlation_id: "synthetic-correlation" };
  assert.equal(validateProblem(safe), true);
  assert.equal(validateProblem({ ...safe, provider_response: "restricted content" }), false);
});

test("checkpoint and approval record graphs preserve exact tenant, object and decision identity", () => {
  const f = fixture(); const original = structuredClone(f);
  assert.equal(validateCheckpointGraph(f), true);
  assert.equal(validateApprovalGraph(f), true);
  assert.deepEqual(f, original);
  f.binding.provider_container_id = "new-allowed-container";
  assert.equal(validateApprovalGraph(f), true, "historical captured container stays immutable after a later allowed move");
});

for (const [label, mutate, code] of [
  ["checkpoint workspace", (f) => { f.checkpoint.workspace_id = id(99); }, "CHECKPOINT_SCOPE_MISMATCH"],
  ["checkpoint Initiative", (f) => { f.checkpoint.initiative_id = id(99); }, "CHECKPOINT_SCOPE_MISMATCH"],
  ["provider connection", (f) => { f.checkpoint.provider_connection_id = id(99); }, "CHECKPOINT_BINDING_MISMATCH"],
  ["provider file", (f) => { f.checkpoint.provider_file_id = "another-document"; }, "CHECKPOINT_BINDING_MISMATCH"],
  ["protected object digest", (f) => { f.checkpoint.normalized_content_ref.digest = `sha256:${"b".repeat(64)}`; }, "CHECKPOINT_OBJECT_MISMATCH"],
  ["empty captured object", (f) => { f.checkpoint.normalized_content_ref.size_bytes = 0; }, "CHECKPOINT_OBJECT_MISMATCH"],
  ["missing predecessor", (f) => { f.checkpoint.checkpoint_number = 2; }, "CHECKPOINT_PREDECESSOR_REQUIRED"],
  ["approval workspace", (f) => { f.approval.workspace_id = id(99); }, "APPROVAL_SCOPE_MISMATCH"],
  ["approval checkpoint", (f) => { f.approval.checkpoint_id = id(99); }, "APPROVAL_SUBJECT_MISMATCH"],
  ["approval artifact version", (f) => { f.approval.artifact_version_id = id(99); }, "APPROVAL_SUBJECT_MISMATCH"],
  ["approval digest", (f) => { f.approval.content_digest = `sha256:${"b".repeat(64)}`; }, "APPROVAL_SUBJECT_MISMATCH"],
  ["approval source version", (f) => { f.approval.provider_version = "9007199254740994"; }, "APPROVAL_SUBJECT_MISMATCH"],
  ["approval evidence", (f) => { f.approval.evidence_snapshot_id = id(99); }, "APPROVAL_SUBJECT_MISMATCH"],
  ["duplicate Standard risk approvers", (f) => { f.assignments[2].approver = f.assignments[1].approver; }, "DISTINCT_APPROVERS_REQUIRED"],
  ["inactive assigned human", (f) => { f.active_human_ids.pop(); }, "GATE_MEMBERSHIP_INVALID"],
  ["cross-workspace gate", (f) => { f.assignments[1].workspace_id = id(99); }, "GATE_MEMBERSHIP_INVALID"],
  ["provider cutoff after decision", (f) => { f.approval.provider_validation_cutoff = "2026-09-05T12:06:00Z"; }, "APPROVAL_CHRONOLOGY_INVALID"],
  ["provider cutoff before submission", (f) => { f.approval.provider_validation_cutoff = "2026-09-05T11:59:00Z"; }, "APPROVAL_CHRONOLOGY_INVALID"],
  ["expired assignment", (f) => { f.assignments[0].valid_until = f.approval.decided_at; }, "GATE_ASSIGNMENT_EXPIRED"],
  ["future assignment", (f) => { f.assignments[0].valid_from = "2026-09-05T13:00:00Z"; }, "GATE_ASSIGNMENT_EXPIRED"],
  ["Technical Approver substituting", (f) => { f.approval.gate_assignment_id = id(21); f.approval.decided_by = human(31); }, "PRODUCT_APPROVER_REQUIRED"],
  ["unassigned human", (f) => { f.approval.decided_by = human(99); }, "PRODUCT_APPROVER_REQUIRED"],
]) {
  test(`record graph rejects ${label}`, () => {
    const f = fixture(); mutate(f); const original = structuredClone(f);
    assert.throws(() => validateApprovalGraph(f), new RegExp(code));
    assert.deepEqual(f, original);
  });
}

test("successor requires the exact predecessor, consecutive number and ordered timestamps", () => {
  const f = fixture(); f.predecessor = structuredClone(f.checkpoint);
  f.checkpoint.id = id(50); f.checkpoint.checkpoint_number = 2; f.checkpoint.predecessor_id = f.predecessor.id;
  assert.equal(validateCheckpointGraph(f), true);
  f.checkpoint.checkpoint_number = 3;
  assert.throws(() => validateCheckpointGraph(f), /CHECKPOINT_SEQUENCE_MISMATCH/);
  f.checkpoint.checkpoint_number = 2; f.checkpoint.recorded_at = "2026-09-05T11:00:00Z";
  assert.throws(() => validateCheckpointGraph(f), /CHECKPOINT_CHRONOLOGY_INVALID/);
});

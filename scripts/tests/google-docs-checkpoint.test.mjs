import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { captureSyntheticCheckpoint, contentDigest, evaluateSyntheticApproval, projectPostApprovalChange } from "../lib/google-docs-checkpoint.mjs";

function fixture() {
  const binding = { id: "binding-1", workspace_id: "workspace-1", initiative_id: "initiative-1", provider_file_id: "doc-1", provider_container_id: "drive-1", provider_connection_id: "connection-1", artifact_kind: "PRD" };
  const before = { provider_file_id: "doc-1", provider_container_id: "drive-1", version: "9007199254740993", mimeType: "application/vnd.google-apps.document", locationAllowed: true, actorCanRead: true, integrationCanRead: true, trashed: false };
  const content = { normalization_version: "curve.google-docs.normalized/v1-candidate", complete: true, unsupported_nodes: 0, tabs: [{ id: "tab-1", text: "Synthetic PRD: improve onboarding", suggestions: [] }, { id: "tab-2", text: "Acceptance: onboarding completes", suggestions: [] }] };
  const provenance = { synthetic: true, evidenceReadable: true, checkpoint_id: "checkpoint-1", checkpoint_number: 1, normalized_content_ref: "synthetic-object-1", actor_id: "author-1", recorded_at: "2026-09-04T12:00:00.000Z", evidence_snapshot_id: "evidence-1", access_evaluation_id: "access-1" };
  const checkpoint = captureSyntheticCheckpoint({ binding, before, after: before, content, provenance });
  return {
    binding, before, after: structuredClone(before), content, provenance, checkpoint,
    initiative: { id: "initiative-1", workspace_id: "workspace-1", state: "PRD_REVIEW", version: 4, product_approver_id: "approver-1", current_checkpoint_id: "checkpoint-1" },
    actor: { id: "approver-1", human: true, active: true, workspace_id: "workspace-1" },
    request: { expected_version: 4, checkpoint_id: "checkpoint-1", content_digest: checkpoint.content_digest },
    evidenceReadable: true,
  };
}

test("candidate schema rejects missing provenance, non-synthetic scope and numeric versions", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = JSON.parse(readFileSync(new URL("../../contracts/schemas/google-docs-checkpoint-candidate.schema.json", import.meta.url), "utf8"));
  const validate = ajv.compile(schema);
  const { checkpoint } = fixture();
  assert.equal(validate(checkpoint), true, JSON.stringify(validate.errors));
  for (const mutate of [
    (c) => { delete c.access_evaluation_id; },
    (c) => { c.synthetic = false; },
    (c) => { c.provider_version = 9007199254740992; },
    (c) => { c.normalized_content.complete = false; },
    (c) => { c.content_digest = "weak-digest"; },
    (c) => { c.credentials = "must-never-be-returned"; },
  ]) {
    const changed = structuredClone(checkpoint);
    mutate(changed);
    assert.equal(validate(changed), false);
  }
});

test("stable all-tab capture and exact human approval produce Planning", () => {
  const f = fixture();
  assert.equal(f.checkpoint.provider_version, "9007199254740993");
  assert.equal(f.checkpoint.revision_id, null);
  assert.equal(f.checkpoint.normalized_content.tabs.length, 2);
  assert.deepEqual(evaluateSyntheticApproval(f), { state: "PLANNING", checkpoint_id: "checkpoint-1", content_digest: f.checkpoint.content_digest, approved_by: "approver-1" });
});

test("canonical digest ignores object key order, preserves tab order and suggestions", () => {
  assert.equal(contentDigest({ a: 1, b: 2 }), contentDigest({ b: 2, a: 1 }));
  const { content } = fixture();
  assert.notEqual(contentDigest(content), contentDigest({ ...content, tabs: [...content.tabs].reverse() }));
  const suggested = structuredClone(content);
  suggested.tabs[0].suggestions.push({ text: "Proposed change" });
  assert.notEqual(contentDigest(content), contentDigest(suggested));
  assert.throws(() => contentDigest({ missing: undefined }), /INVALID_NORMALIZED_JSON/);
  assert.throws(() => contentDigest({ bad: NaN }), /INVALID_NORMALIZED_JSON/);
  assert.throws(() => contentDigest(new Array(1)), /INVALID_NORMALIZED_JSON/);
  const cyclic = {}; cyclic.self = cyclic;
  assert.throws(() => contentDigest(cyclic), /CONTENT_LIMIT_EXCEEDED/);
});

test("checkpoint cannot be mutated through the original input or captured output", () => {
  const f = fixture();
  f.content.tabs[0].text = "Changed";
  assert.equal(f.checkpoint.normalized_content.tabs[0].text, "Synthetic PRD: improve onboarding");
  assert.throws(() => { f.checkpoint.normalized_content.tabs[0].text = "Tampered"; }, TypeError);
});

for (const [label, mutate, code] of [
  ["real data activation", (f) => { f.provenance.synthetic = false; }, "SYNTHETIC_ONLY"],
  ["edit during capture", (f) => { f.after.version = "9007199254740994"; }, "SOURCE_CHANGED_DURING_CAPTURE"],
  ["numeric version precision", (f) => { f.before.version = 9007199254740992; }, "INVALID_DRIVE_VERSION"],
  ["unsupported structure", (f) => { f.content.unsupported_nodes = 1; }, "INCOMPLETE_CONTENT"],
  ["incomplete tabs", (f) => { f.content.complete = false; }, "INCOMPLETE_CONTENT"],
  ["missing actor provenance", (f) => { delete f.provenance.actor_id; }, "MISSING_PROVENANCE"],
  ["denied evidence", (f) => { f.provenance.evidenceReadable = false; }, "EVIDENCE_ACCESS_DENIED"],
  ["missing connection", (f) => { delete f.binding.provider_connection_id; }, "INVALID_BINDING"],
  ["incorrect artifact", (f) => { f.binding.artifact_kind = "IDEA_BRIEF"; }, "INVALID_ARTIFACT_KIND"],
  ["invalid checkpoint number", (f) => { f.provenance.checkpoint_number = 0; }, "INVALID_CHECKPOINT_NUMBER"],
  ["missing content reference", (f) => { delete f.provenance.normalized_content_ref; }, "MISSING_PROVENANCE"],
  ["ambiguous local timestamp", (f) => { f.provenance.recorded_at = "2026-09-05"; }, "INVALID_CAPTURE_TIME"],
  ["invalid calendar day", (f) => { f.provenance.recorded_at = "2026-02-30T12:00:00Z"; }, "INVALID_CAPTURE_TIME"],
  ["numeric revision", (f) => { f.after.revision_id = 1; }, "INVALID_REVISION_ID"],
  ["numeric predecessor", (f) => { f.provenance.predecessor_id = 1; }, "INVALID_PREDECESSOR_ID"],
]) {
  test(`capture rejects ${label}`, () => {
    const f = fixture(); mutate(f);
    assert.throws(() => captureSyntheticCheckpoint(f), new RegExp(code));
  });
}

for (const [label, mutate, code] of [
  ["source edit", (f) => { f.before.version = f.after.version = "9007199254740994"; }, "STALE_SUBMISSION"],
  ["content mismatch at same version", (f) => { f.content.tabs[1].text = "Changed acceptance"; }, "STALE_SUBMISSION"],
  ["mid-read edit", (f) => { f.after.version = "9007199254740994"; }, "SOURCE_CHANGED_DURING_CAPTURE"],
  ["stale Initiative", (f) => { f.initiative.version = 5; }, "INITIATIVE_VERSION_CONFLICT"],
  ["superseded submission", (f) => { f.initiative.current_checkpoint_id = "checkpoint-2"; }, "SUPERSEDED_CHECKPOINT"],
  ["tampered checkpoint", (f) => { f.checkpoint = structuredClone(f.checkpoint); f.checkpoint.normalized_content.tabs[0].text = "Tampered"; }, "CHECKPOINT_DIGEST_MISMATCH"],
  ["different requested digest", (f) => { f.request.content_digest = "sha256:wrong"; }, "CHECKPOINT_DIGEST_MISMATCH"],
  ["unassigned approver", (f) => { f.actor.id = "another-human"; }, "APPROVER_DENIED"],
  ["bot approval", (f) => { f.actor.human = false; }, "APPROVER_DENIED"],
  ["inactive approver", (f) => { f.actor.active = false; }, "APPROVER_DENIED"],
  ["absent approver and assignment", (f) => { delete f.actor.id; delete f.initiative.product_approver_id; }, "APPROVER_DENIED"],
  ["missing checkpoint provenance", (f) => { f.checkpoint = structuredClone(f.checkpoint); delete f.checkpoint.access_evaluation_id; }, "INVALID_CHECKPOINT"],
  ["missing optimistic versions", (f) => { delete f.initiative.version; delete f.request.expected_version; }, "INVALID_INITIATIVE_VERSION"],
  ["cross-workspace actor", (f) => { f.actor.workspace_id = "other"; }, "WORKSPACE_MISMATCH"],
  ["cross-Initiative binding", (f) => { f.binding.initiative_id = "other"; }, "BINDING_MISMATCH"],
  ["managed identity without human access", (f) => { f.after.actorCanRead = false; }, "SOURCE_ACCESS_DENIED"],
  ["revoked integration access", (f) => { f.after.integrationCanRead = false; }, "SOURCE_ACCESS_DENIED"],
  ["denied evidence", (f) => { f.evidenceReadable = false; }, "EVIDENCE_ACCESS_DENIED"],
  ["moved outside folder", (f) => { f.after.locationAllowed = false; }, "SOURCE_LOCATION_DENIED"],
  ["other Shared Drive", (f) => { f.after.provider_container_id = "other-drive"; }, "SOURCE_LOCATION_DENIED"],
  ["trashed source", (f) => { f.after.trashed = true; }, "SOURCE_UNAVAILABLE"],
  ["shortcut or other type", (f) => { f.after.mimeType = "application/vnd.google-apps.shortcut"; }, "SOURCE_NOT_GOOGLE_DOC"],
  ["terminal Initiative", (f) => { f.initiative.state = "CANCELLED"; }, "INVALID_STATE"],
]) {
  test(`approval rejects ${label}`, () => {
    const f = fixture(); mutate(f);
    assert.throws(() => evaluateSyntheticApproval(f), new RegExp(code));
  });
}

test("post-approval edits preserve approval and require explicit successor review", () => {
  const f = fixture();
  const args = { checkpoint: f.checkpoint, live_version: "9007199254740994", live_digest: f.checkpoint.content_digest };
  const editorial = projectPostApprovalChange(args);
  assert.equal(editorial.state, "PLANNING");
  assert.equal(editorial.requires_successor_approval, true);
  assert.equal(editorial.approved_checkpoint_id, f.checkpoint.checkpoint_id);
  assert.throws(() => projectPostApprovalChange({ ...args, material_declaration: { authorized_human: true, actor_id: "owner-1", reason: "Scope changed" } }), /MATERIAL_CHANGE_POLICY_REQUIRED/);
  assert.throws(() => projectPostApprovalChange({ ...args, material_declaration: { authorized_human: false, actor_id: "bot-1", reason: "Inferred" } }), /MATERIAL_CHANGE_POLICY_REQUIRED/);
});

test("resubmission retains predecessor and approval is bound to the successor", () => {
  const f = fixture();
  const content = structuredClone(f.content);
  content.tabs[0].text = "Revised problem";
  const source = { ...f.before, version: "9007199254740994" };
  const next = captureSyntheticCheckpoint({ ...f, content, before: source, after: source, provenance: { ...f.provenance, checkpoint_id: "checkpoint-2", predecessor_id: f.checkpoint.checkpoint_id } });
  assert.equal(next.predecessor_id, f.checkpoint.checkpoint_id);
  assert.notEqual(next.content_digest, f.checkpoint.content_digest);
  assert.throws(() => evaluateSyntheticApproval({ ...f, initiative: { ...f.initiative, current_checkpoint_id: next.checkpoint_id } }), /SUPERSEDED_CHECKPOINT/);
  assert.equal(evaluateSyntheticApproval({ ...f, checkpoint: next, content, before: source, after: source, initiative: { ...f.initiative, version: 5, current_checkpoint_id: next.checkpoint_id }, request: { expected_version: 5, checkpoint_id: next.checkpoint_id, content_digest: next.content_digest } }).state, "PLANNING");
});

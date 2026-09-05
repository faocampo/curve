import assert from "node:assert/strict";
import test from "node:test";
import { submitSyntheticPrd, approveSyntheticPrd } from "../lib/external-prd-lifecycle.mjs";
import { projectPostApprovalChange } from "../lib/google-docs-checkpoint.mjs";

function fixture() {
  const before = { provider_file_id: "doc-example", provider_container_id: "container-example", version: "9007199254740993", mimeType: "application/vnd.google-apps.document", locationAllowed: true, actorCanRead: true, integrationCanRead: true, trashed: false };
  return {
    synthetic: true,
    initiative: { id: "initiative-example", workspace_id: "workspace-example", state: "ALIGNING", version: 2, creator_id: "author-example", product_approver_id: "reviewer-example", current_checkpoint_id: null },
    binding: { id: "binding-example", workspace_id: "workspace-example", initiative_id: "initiative-example", provider_connection_id: "connection-example", provider_file_id: "doc-example", provider_container_id: "container-example", artifact_kind: "PRD" },
    actor: { id: "author-example", workspace_id: "workspace-example", human: true, active: true, object_access: true },
    request: { expected_version: 2 },
    before, after: structuredClone(before),
    content: { normalization_version: "curve.google-docs.normalized/v1-candidate", complete: true, unsupported_nodes: 0, tabs: [{ text: "Synthetic PRD for fictional onboarding" }] },
    provenance: { checkpoint_id: "checkpoint-example-1", normalized_content_ref: "synthetic-object-1", recorded_at: "2026-09-05T12:00:00Z", evidenceReadable: true, evidence_snapshot_id: "evidence-example", access_evaluation_id: "access-example" },
  };
}

function review(f = fixture()) {
  const submitted = submitSyntheticPrd(f);
  return {
    ...f, initiative: submitted.initiative, checkpoint: submitted.checkpoint,
    actor: { ...f.actor, id: "reviewer-example" }, evidenceReadable: true,
    request: { expected_version: 3, checkpoint_id: submitted.checkpoint.checkpoint_id, content_digest: submitted.checkpoint.content_digest },
    approval_recorded_at: "2026-09-05T12:05:00Z",
  };
}

test("Aligning submission enters PRD Review; exact assigned human approval enters Planning", () => {
  const f = fixture(); const before = structuredClone(f);
  const submitted = submitSyntheticPrd(f);
  assert.equal(submitted.initiative.state, "PRD_REVIEW");
  assert.equal(submitted.checkpoint.checkpoint_number, 1);
  assert.equal(submitted.checkpoint.checkpoint_type, "SUBMITTED");
  assert.equal(submitted.checkpoint.predecessor_id, null);
  assert.deepEqual(f, before);
  const r = review(f); const approved = approveSyntheticPrd(r);
  assert.equal(approved.initiative.state, "PLANNING");
  assert.equal(approved.initiative.version, 4);
  assert.equal(approved.decision.provider_version, "9007199254740993");
  assert.equal(approved.decision.actor_id, "reviewer-example");
  assert.equal(approved.decision.evidence_snapshot_id, "evidence-example");
  assert.equal(r.checkpoint.checkpoint_type, "SUBMITTED");
  assert.throws(() => { approved.decision.actor_id = "forged"; }, TypeError);
  assert.equal(JSON.stringify(submitted.event).includes("fictional onboarding"), false);
  assert.equal(JSON.stringify(approved.decision).includes("fictional onboarding"), false);
});

test("changed document requires successor submission; old checkpoint cannot approve it", () => {
  const r = review();
  r.before.version = r.after.version = "9007199254740994";
  r.content.tabs[0].text = "Revised synthetic scope";
  assert.throws(() => approveSyntheticPrd(r), /STALE_SUBMISSION/);
  const successor = submitSyntheticPrd({ ...r, actor: fixture().actor, request: { expected_version: 3 }, previous_checkpoint: r.checkpoint, provenance: { ...r.provenance, checkpoint_id: "checkpoint-example-2", normalized_content_ref: "synthetic-object-2" } });
  assert.equal(successor.checkpoint.checkpoint_number, 2);
  assert.equal(successor.checkpoint.predecessor_id, r.checkpoint.checkpoint_id);
  assert.equal(r.checkpoint.normalized_content.tabs[0].text, "Synthetic PRD for fictional onboarding");
  assert.throws(() => approveSyntheticPrd({ ...r, initiative: successor.initiative, request: { ...r.request, expected_version: 4 } }), /SUPERSEDED_CHECKPOINT/);
  const approved = approveSyntheticPrd({ ...r, initiative: successor.initiative, checkpoint: successor.checkpoint, request: { expected_version: 4, checkpoint_id: successor.checkpoint.checkpoint_id, content_digest: successor.checkpoint.content_digest } });
  assert.equal(approved.initiative.state, "PLANNING");
});

for (const [label, mutate, code] of [
  ["live mode", (f) => { f.synthetic = false; }, "SYNTHETIC_ONLY"],
  ["non-human", (f) => { f.actor.human = false; }, "ACTOR_DENIED"],
  ["revoked membership", (f) => { f.actor.active = false; }, "ACTOR_DENIED"],
  ["denied object ACL", (f) => { f.actor.object_access = false; }, "ACTOR_DENIED"],
  ["cross-workspace actor", (f) => { f.actor.workspace_id = "another-workspace"; }, "WORKSPACE_MISMATCH"],
  ["cross-workspace binding", (f) => { f.binding.workspace_id = "another-workspace"; }, "WORKSPACE_MISMATCH"],
  ["wrong Initiative binding", (f) => { f.binding.initiative_id = "another-initiative"; }, "BINDING_MISMATCH"],
  ["non-author submission", (f) => { f.actor.id = "another-person"; }, "SUBMITTER_DENIED"],
  ["Draft submission", (f) => { f.initiative.state = "DRAFT"; }, "INVALID_STATE"],
  ["paused submission", (f) => { f.initiative.state = "PAUSED"; }, "INVALID_STATE"],
  ["cancelled submission", (f) => { f.initiative.state = "CANCELLED"; }, "INVALID_STATE"],
  ["post-approval submission", (f) => { f.initiative.state = "PLANNING"; }, "INVALID_STATE"],
  ["review without checkpoint", (f) => { f.initiative.state = "PRD_REVIEW"; }, "MISSING_SUBMISSION"],
  ["stale version", (f) => { f.request.expected_version = 1; }, "INITIATIVE_VERSION_CONFLICT"],
  ["numeric version overflow", (f) => { f.initiative.version = f.request.expected_version = Number.MAX_SAFE_INTEGER; }, "INVALID_INITIATIVE_VERSION"],
  ["client-supplied identity", (f) => { f.request.actor_id = "forged"; }, "UNKNOWN_REQUEST_FIELD"],
  ["lost user source access", (f) => { f.after.actorCanRead = false; }, "SOURCE_ACCESS_DENIED"],
  ["lost integration access", (f) => { f.after.integrationCanRead = false; }, "SOURCE_ACCESS_DENIED"],
  ["edit during capture", (f) => { f.after.version = "9007199254740994"; }, "SOURCE_CHANGED_DURING_CAPTURE"],
  ["missing material evidence", (f) => { f.provenance.evidenceReadable = false; }, "EVIDENCE_ACCESS_DENIED"],
]) {
  test(`submission rejects ${label} without changing input`, () => {
    const f = fixture(); mutate(f); const original = structuredClone(f);
    assert.throws(() => submitSyntheticPrd(f), new RegExp(code));
    assert.deepEqual(f, original);
  });
}

test("successor rejects checkpoint-ID reuse, wrong predecessor and connection substitution", () => {
  const f = fixture(); const submitted = submitSyntheticPrd(f);
  const args = { ...f, initiative: submitted.initiative, previous_checkpoint: submitted.checkpoint, request: { expected_version: 3 } };
  assert.throws(() => submitSyntheticPrd(args), /CHECKPOINT_ID_REUSED/);
  assert.throws(() => submitSyntheticPrd({ ...args, previous_checkpoint: null }), /SUPERSEDED_CHECKPOINT/);
  assert.throws(() => submitSyntheticPrd({ ...args, binding: { ...args.binding, provider_connection_id: "other-connection" } }), /BINDING_MISMATCH/);
});

test("approval rejects command injection, lost ACL, switched connection and repeat transition", () => {
  const r = review();
  assert.throws(() => approveSyntheticPrd({ ...r, request: { ...r.request, approved_by: "forged" } }), /UNKNOWN_REQUEST_FIELD/);
  assert.throws(() => approveSyntheticPrd({ ...r, actor: { ...r.actor, object_access: false } }), /ACTOR_DENIED/);
  assert.throws(() => approveSyntheticPrd({ ...r, binding: { ...r.binding, provider_connection_id: "other-connection" } }), /BINDING_MISMATCH/);
  const approved = approveSyntheticPrd(r);
  assert.throws(() => approveSyntheticPrd({ ...r, initiative: approved.initiative }), /INITIATIVE_VERSION_CONFLICT/);
  assert.throws(() => approveSyntheticPrd({ ...r, initiative: approved.initiative, request: { ...r.request, expected_version: 4 } }), /INVALID_STATE/);
  assert.throws(() => approveSyntheticPrd({ ...r, approval_recorded_at: "2026-09-04T12:00:00Z" }), /INVALID_APPROVAL_TIME/);
});

test("post-approval change preserves Planning and the immutable approved checkpoint", () => {
  const r = review(); const approved = approveSyntheticPrd(r);
  const projection = projectPostApprovalChange({ checkpoint: r.checkpoint, live_version: "9007199254740994", live_digest: r.checkpoint.content_digest });
  assert.equal(projection.state, approved.initiative.state);
  assert.equal(projection.comparison, "CHANGED_SINCE_APPROVAL");
  assert.equal(projection.approved_checkpoint_id, approved.decision.checkpoint_id);
});

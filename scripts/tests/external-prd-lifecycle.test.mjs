import assert from "node:assert/strict";
import test from "node:test";
import { submitSyntheticPrd, approveSyntheticPrd, returnSyntheticPrdForRevision } from "../lib/external-prd-lifecycle.mjs";
import { projectPostApprovalChange } from "../lib/google-docs-checkpoint.mjs";
import { readinessFixture, withCurrentReadiness } from "./helpers/prd-readiness-fixture.mjs";

function fixture() {
  const before = { provider_file_id: "doc-example", provider_container_id: "container-example", version: "9007199254740993", mimeType: "application/vnd.google-apps.document", locationAllowed: true, actorCanRead: true, integrationCanRead: true, trashed: false };
  return withCurrentReadiness({
    synthetic: true,
    initiative: { id: "initiative-example", workspace_id: "workspace-example", state: "ALIGNING", version: 2, creator_id: "author-example", product_approver_id: "reviewer-example", current_checkpoint_id: null },
    binding: { id: "binding-example", workspace_id: "workspace-example", initiative_id: "initiative-example", provider_connection_id: "connection-example", provider_file_id: "doc-example", provider_container_id: "container-example", artifact_kind: "PRD" },
    actor: { id: "author-example", workspace_id: "workspace-example", human: true, active: true, object_access: true },
    submission_authorization: { schema_version: "curve.prd-submission-authorization/v1-candidate", decision_id: "decision-example", policy_version_id: "policy-example", actor_id: "author-example", workspace_id: "workspace-example", initiative_id: "initiative-example", binding_id: "binding-example", initiative_version: 2, action: "PRD_SUBMIT", role: "CREATOR", effect: "ALLOW", evaluated_at: "2026-09-05T12:00:00Z", expires_at: "2026-09-05T12:01:00Z" },
    request: { expected_version: 2 },
    before, after: structuredClone(before),
    content: readinessFixture().prd.content,
    provenance: { checkpoint_id: "checkpoint-example-1", normalized_content_ref: "synthetic-object-1", recorded_at: "2026-09-05T12:00:00Z", evidenceReadable: true, evidence_snapshot_id: "evidence-example", access_evaluation_id: "access-example" },
  });
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

function revision(decision = "CHANGES_REQUESTED") {
  const f = review();
  return {
    ...f, checkpointReadable: true, review_recorded_at: f.approval_recorded_at,
    review_access_evaluation_id: "review-access-example",
    request: { ...f.request, decision, rationale: "Clarify the fictional onboarding acceptance criteria." },
    review_authorization: {
      schema_version: "curve.prd-review-authorization/v1-candidate",
      decision_id: "review-decision-example", policy_version_id: "review-policy-example",
      gate_assignment_id: "product-assignment-example", actor_id: f.actor.id,
      workspace_id: f.initiative.workspace_id, initiative_id: f.initiative.id,
      binding_id: f.binding.id, initiative_version: f.initiative.version,
      checkpoint_id: f.checkpoint.checkpoint_id, content_digest: f.checkpoint.content_digest,
      evidence_snapshot_id: f.checkpoint.evidence_snapshot_id,
      action: decision === "CHANGES_REQUESTED" ? "PRD_REQUEST_CHANGES" : "PRD_REJECT",
      role: "PRODUCT_APPROVER", effect: "ALLOW", evaluated_at: f.approval_recorded_at,
      expires_at: "2026-09-05T12:06:00Z",
    },
  };
}

for (const decision of ["CHANGES_REQUESTED", "REJECTED"]) {
  test(`${decision} returns to Aligning and requires a successor before later approval`, () => {
    const f = revision(decision), original = structuredClone(f);
    const returned = returnSyntheticPrdForRevision(f);
    assert.equal(returned.initiative.state, "ALIGNING");
    assert.equal(returned.initiative.version, 4);
    assert.equal(returned.initiative.current_checkpoint_id, f.checkpoint.checkpoint_id);
    assert.equal(returned.decision.decision, decision);
    assert.equal(returned.decision.rationale, f.request.rationale);
    assert.equal(returned.decision.access_evaluation_id, f.review_access_evaluation_id);
    assert.equal(returned.event.event_type, decision === "REJECTED" ? "prd.rejected" : "prd.changes_requested");
    assert.equal(JSON.stringify(returned.event).includes(f.request.rationale), false);
    assert.deepEqual(f, original);
    assert.throws(() => { returned.decision.rationale = "overwrite"; }, TypeError);
    const approvalRequest = { expected_version: 4, checkpoint_id: f.checkpoint.checkpoint_id, content_digest: f.checkpoint.content_digest };
    assert.throws(() => approveSyntheticPrd({ ...f, initiative: returned.initiative, request: approvalRequest }), /INVALID_STATE/);
    assert.throws(() => returnSyntheticPrdForRevision({ ...f, initiative: returned.initiative }), /INITIATIVE_VERSION_CONFLICT/);
    const next = submitSyntheticPrd(withCurrentReadiness({ ...fixture(), initiative: returned.initiative,
      previous_checkpoint: f.checkpoint, request: { expected_version: 4 },
      submission_authorization: { ...fixture().submission_authorization, initiative_version: 4,
        evaluated_at: "2026-09-05T12:06:00Z", expires_at: "2026-09-05T12:07:00Z" },
      provenance: { ...fixture().provenance, checkpoint_id: "checkpoint-example-2", recorded_at: "2026-09-05T12:06:00Z" },
    }));
    assert.equal(next.checkpoint.predecessor_id, f.checkpoint.checkpoint_id);
    assert.equal(next.checkpoint.checkpoint_number, 2);
    assert.throws(() => approveSyntheticPrd({ ...f, initiative: next.initiative, request: { ...approvalRequest, expected_version: 5 } }), /SUPERSEDED_CHECKPOINT/);
    const approved = approveSyntheticPrd({ ...f, initiative: next.initiative, checkpoint: next.checkpoint, approval_recorded_at: "2026-09-05T12:08:00Z", request: { expected_version: 5, checkpoint_id: next.checkpoint.checkpoint_id, content_digest: next.checkpoint.content_digest } });
    assert.equal(approved.initiative.state, "PLANNING");
    assert.equal(returned.decision.decision, decision);
  });

  test(`${decision} addresses the displayed checkpoint despite subsequent live edits`, () => {
    const f = revision(decision);
    f.after.version = "9007199254740994";
    f.content.tabs[0].documentTab.body.content[1].paragraph.elements[0].textRun.content = "Edited live outcome";
    const returned = returnSyntheticPrdForRevision(f);
    assert.equal(returned.decision.provider_version, f.checkpoint.provider_version);
    assert.equal(returned.decision.content_digest, f.checkpoint.content_digest);
    assert.equal(returned.initiative.state, "ALIGNING");
  });
}

for (const [label, mutate, code] of [
  ["service actor", (f) => { f.actor.human = false; }, "ACTOR_DENIED"],
  ["inactive actor", (f) => { f.actor.active = false; }, "ACTOR_DENIED"],
  ["object access lost", (f) => { f.actor.object_access = false; }, "ACTOR_DENIED"],
  ["different approver", (f) => { f.initiative = { ...f.initiative, product_approver_id: "someone-else" }; }, "APPROVER_DENIED"],
  ["workspace substitution", (f) => { f.actor.workspace_id = "other"; }, "WORKSPACE_MISMATCH"],
  ["stale ETag", (f) => { f.request.expected_version = 2; }, "INITIATIVE_VERSION_CONFLICT"],
  ["unknown command field", (f) => { f.request.authority = true; }, "UNKNOWN_REQUEST_FIELD"],
  ["approval disguised as return", (f) => { f.request.decision = "APPROVED"; }, "INVALID_REVIEW_DECISION"],
  ["blank rationale", (f) => { f.request.rationale = " \n"; }, "REVIEW_RATIONALE_REQUIRED"],
  ["oversize rationale", (f) => { f.request.rationale = "x".repeat(2001); }, "REVIEW_RATIONALE_REQUIRED"],
  ["missing access evidence", (f) => { delete f.review_access_evaluation_id; }, "REVIEW_ACCESS_EVALUATION_REQUIRED"],
  ["protected checkpoint denied", (f) => { f.checkpointReadable = false; }, "CHECKPOINT_ACCESS_DENIED"],
  ["material evidence denied", (f) => { f.evidenceReadable = false; }, "EVIDENCE_ACCESS_DENIED"],
  ["source denied before read", (f) => { f.before.actorCanRead = false; }, "SOURCE_ACCESS_DENIED"],
  ["source denied after read", (f) => { f.after.integrationCanRead = false; }, "SOURCE_ACCESS_DENIED"],
  ["disallowed source location", (f) => { f.after.locationAllowed = false; }, "SOURCE_LOCATION_DENIED"],
  ["deleted source", (f) => { f.after.trashed = true; }, "SOURCE_UNAVAILABLE"],
  ["wrong checkpoint", (f) => { f.request.checkpoint_id = "other"; }, "SUPERSEDED_CHECKPOINT"],
  ["wrong digest", (f) => { f.request.content_digest = "other"; }, "CHECKPOINT_DIGEST_MISMATCH"],
  ["before submission", (f) => { f.review_recorded_at = "2026-09-05T11:59:00Z"; }, "INVALID_REVIEW_TIME"],
  ["invalid clock", (f) => { f.review_recorded_at = "2026-09-05T12:00:60Z"; }, "INVALID_REVIEW_TIME"],
]) {
  test(`negative review rejects ${label}`, () => {
    const f = revision(); mutate(f); const original = structuredClone(f);
    assert.throws(() => returnSyntheticPrdForRevision(f), new RegExp(code));
    assert.deepEqual(f, original);
  });
}

test("negative review requires an exact current action-specific trusted policy decision", () => {
  const good = revision();
  for (const field of Object.keys(good.review_authorization)) {
    const missing = revision(); delete missing.review_authorization[field];
    assert.throws(() => returnSyntheticPrdForRevision(missing), /REVIEWER_DENIED/, field);
  }
  for (const field of ["actor_id", "workspace_id", "initiative_id", "binding_id", "initiative_version", "checkpoint_id", "content_digest", "evidence_snapshot_id", "action", "role", "effect", "schema_version"]) {
    const wrong = revision(); wrong.review_authorization[field] = "wrong";
    assert.throws(() => returnSyntheticPrdForRevision(wrong), /REVIEWER_DENIED/, field);
  }
  for (const mutate of [
    (f) => { delete f.review_authorization; },
    (f) => { f.review_authorization.allow = true; },
    (f) => { f.review_authorization.expires_at = f.review_recorded_at; },
    (f) => { f.review_authorization.evaluated_at = "2026-09-05T12:04:59Z"; },
    (f) => { f.request.decision = "REJECTED"; },
  ]) {
    const f = revision(); mutate(f);
    assert.throws(() => returnSyntheticPrdForRevision(f), /REVIEWER_DENIED/);
  }
});

test("negative review is limited to PRD Review and preserves checkpoint integrity", () => {
  for (const state of ["DRAFT", "ALIGNING", "PLANNING", "PAUSED", "CANCELLED", "FAILED"]) {
    const f = revision(); f.initiative = { ...f.initiative, state };
    assert.throws(() => returnSyntheticPrdForRevision(f), /INVALID_STATE/);
  }
  const f = revision(); f.checkpoint = structuredClone(f.checkpoint);
  f.checkpoint.normalized_content.tabs[0].documentTab.body.content[1].paragraph.elements[0].textRun.content = "Tampered checkpoint";
  assert.throws(() => returnSyntheticPrdForRevision(f), /CHECKPOINT_DIGEST_MISMATCH/);
  for (const mutate of [
    (checkpoint) => { checkpoint.provider_version = 9007199254740992; },
    (checkpoint) => { checkpoint.provider_version = "unknown"; },
    (checkpoint) => { checkpoint.normalized_content.complete = false; },
    (checkpoint) => { checkpoint.normalized_content.normalization_version = "unknown"; },
    (checkpoint) => { checkpoint.normalized_content.tabs = []; },
  ]) {
    const invalid = revision(); invalid.checkpoint = structuredClone(invalid.checkpoint); mutate(invalid.checkpoint);
    assert.throws(() => returnSyntheticPrdForRevision(invalid), /INVALID_CHECKPOINT/);
  }
});

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
  r.content.tabs[0].documentTab.body.content[1].paragraph.elements[0].textRun.content = "Revised synthetic scope";
  assert.throws(() => approveSyntheticPrd(r), /STALE_SUBMISSION/);
  const successor = submitSyntheticPrd(withCurrentReadiness({ ...r, actor: fixture().actor, submission_authorization: { ...r.submission_authorization, initiative_version: 3 }, request: { expected_version: 3 }, previous_checkpoint: r.checkpoint, provenance: { ...r.provenance, checkpoint_id: "checkpoint-example-2", normalized_content_ref: "synthetic-object-2" } }));
  assert.equal(successor.checkpoint.checkpoint_number, 2);
  assert.equal(successor.checkpoint.predecessor_id, r.checkpoint.checkpoint_id);
  assert.equal(r.checkpoint.normalized_content.tabs[0].documentTab.body.content[1].paragraph.elements[0].textRun.content, "Synthetic PRD for fictional onboarding\n");
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
  const args = { ...f, initiative: submitted.initiative, submission_authorization: { ...f.submission_authorization, initiative_version: 3 }, previous_checkpoint: submitted.checkpoint, request: { expected_version: 3 } };
  assert.throws(() => submitSyntheticPrd(args), /CHECKPOINT_ID_REUSED/);
  assert.throws(() => submitSyntheticPrd({ ...args, previous_checkpoint: null }), /SUPERSEDED_CHECKPOINT/);
  assert.throws(() => submitSyntheticPrd({ ...args, binding: { ...args.binding, provider_connection_id: "other-connection" } }), /BINDING_MISMATCH/);
});

test("an authorized contributor can submit and is attributed without becoming the creator", () => {
  const f = fixture(); f.actor.id = "contributor-example";
  f.submission_authorization.actor_id = f.actor.id; f.submission_authorization.role = "CONTRIBUTOR";
  const result = submitSyntheticPrd(f);
  assert.equal(result.initiative.state, "PRD_REVIEW");
  assert.equal(result.initiative.creator_id, "author-example");
  assert.equal(result.checkpoint.submitted_or_approved_by, f.actor.id);
  assert.equal(result.event.actor_id, f.actor.id);
  assert.equal(result.event.authorization_decision_id, f.submission_authorization.decision_id);
});

test("submission policy decisions are closed and cannot assign creator authority to another actor", () => {
  for (const key of Object.keys(fixture().submission_authorization)) {
    const f = fixture(); delete f.submission_authorization[key];
    assert.throws(() => submitSyntheticPrd(f), /SUBMITTER_DENIED/, key);
  }
  const extra = fixture(); extra.submission_authorization.source_content = "synthetic content";
  assert.throws(() => submitSyntheticPrd(extra), /SUBMITTER_DENIED/);
  const forged = fixture(); forged.actor.id = forged.submission_authorization.actor_id = "other-person";
  assert.throws(() => submitSyntheticPrd(forged), /SUBMITTER_DENIED/);
});

for (const [label, mutate] of [
  ["missing decision", (f) => { delete f.submission_authorization; }],
  ["revoked permission", (f) => { f.submission_authorization.effect = "DENY"; }],
  ["unapproved role", (f) => { f.submission_authorization.role = "ADMIN"; }],
  ["wrong action", (f) => { f.submission_authorization.action = "PRD_APPROVE"; }],
  ["different binding", (f) => { f.submission_authorization.binding_id = "other-binding"; }],
  ["different workspace", (f) => { f.submission_authorization.workspace_id = "other-workspace"; }],
  ["different Initiative", (f) => { f.submission_authorization.initiative_id = "other-initiative"; }],
  ["stale aggregate decision", (f) => { f.submission_authorization.initiative_version = 1; }],
  ["expired decision", (f) => { f.submission_authorization.expires_at = f.provenance.recorded_at; }],
  ["stale decision", (f) => { f.submission_authorization.evaluated_at = "2026-09-05T11:00:00Z"; }],
  ["client contributor flag", (f) => { f.actor.id = "other-person"; f.request.is_contributor = true; }],
]) {
  test(`submission rejects ${label}`, () => {
    const f = fixture(); mutate(f); const original = structuredClone(f);
    assert.throws(() => submitSyntheticPrd(f), /SUBMITTER_DENIED/);
    assert.deepEqual(f, original);
  });
}

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

test("submission requires current readiness for the exact PRD, Idea Brief and inventory", () => {
  for (const mutate of [
    (f) => { delete f.readiness; },
    (f) => { f.readiness = { ...f.readiness, status: "BLOCKED", reasons: ["BLOCKERS_UNRESOLVED"] }; },
    (f) => { f.current_idea_brief.id = "new-brief-version"; },
    (f) => { f.current_idea_brief.content_digest = "different"; },
    (f) => { f.current_readiness_inventory_digest = "different"; },
    (f) => { f.content.tabs[0].documentTab.body.content[1].paragraph.elements[0].textRun.content = "Changed after readiness"; },
  ]) {
    const f = fixture(); mutate(f); const original = structuredClone(f);
    assert.throws(() => submitSyntheticPrd(f), /PRD_READINESS_REQUIRED|PRD_READINESS_STALE/);
    assert.deepEqual(f, original);
  }
});

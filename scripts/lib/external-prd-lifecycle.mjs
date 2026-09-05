// Pure synthetic conformance model. Callers supply trusted test observations.
// No database, HTTP route, provider transport, production policy, or stored body.
import { captureSyntheticCheckpoint, evaluateSyntheticApproval, evaluateSyntheticReviewReturn, validCheckpointTime } from "./google-docs-checkpoint.mjs";
import { requireCurrentPrdReadiness } from "./prd-readiness.mjs";

function requireValue(condition, code) {
  if (!condition) throw new Error(code);
}

function immutable(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
}

function authorize({ initiative, binding, actor, request, synthetic }) {
  requireValue(synthetic === true, "SYNTHETIC_ONLY");
  requireValue(typeof actor?.id === "string" && actor.id.trim().length > 0 && actor.human === true && actor.active === true && actor.object_access === true, "ACTOR_DENIED");
  requireValue(actor.workspace_id === initiative.workspace_id && binding.workspace_id === initiative.workspace_id, "WORKSPACE_MISMATCH");
  requireValue(binding.initiative_id === initiative.id, "BINDING_MISMATCH");
  requireValue(Number.isSafeInteger(initiative.version) && initiative.version > 0 && initiative.version < Number.MAX_SAFE_INTEGER, "INVALID_INITIATIVE_VERSION");
  requireValue(request?.expected_version === initiative.version, "INITIATIVE_VERSION_CONFLICT");
}

export function submitSyntheticPrd(input) {
  authorize(input);
  const { initiative, binding, actor, request, previous_checkpoint, before, after, content, provenance, submission_authorization: grant } = input;
  // This is a current server-side policy decision, never a client-supplied
  // contributor flag. It binds the exact action, subject, scope and version.
  const fields = ["schema_version", "decision_id", "policy_version_id", "actor_id", "workspace_id", "initiative_id", "binding_id", "initiative_version", "action", "role", "effect", "evaluated_at", "expires_at"];
  requireValue(grant && Object.keys(grant).length === fields.length && fields.every((key) => Object.hasOwn(grant, key)), "SUBMITTER_DENIED");
  requireValue(grant.schema_version === "curve.prd-submission-authorization/v1-candidate" && [grant.decision_id, grant.policy_version_id].every((id) => typeof id === "string" && id.trim().length > 0), "SUBMITTER_DENIED");
  requireValue(grant.actor_id === actor.id && grant.workspace_id === initiative.workspace_id && grant.initiative_id === initiative.id && grant.binding_id === binding.id && grant.initiative_version === initiative.version && grant.action === "PRD_SUBMIT" && grant.effect === "ALLOW", "SUBMITTER_DENIED");
  requireValue((grant.role === "CREATOR" && actor.id === initiative.creator_id) || grant.role === "CONTRIBUTOR", "SUBMITTER_DENIED");
  requireValue(validCheckpointTime(grant.evaluated_at) && validCheckpointTime(grant.expires_at) && grant.evaluated_at === provenance?.recorded_at && Date.parse(grant.expires_at) > Date.parse(grant.evaluated_at), "SUBMITTER_DENIED");
  requireValue(["ALIGNING", "PRD_REVIEW"].includes(initiative.state), "INVALID_STATE");
  // The request schema is deliberately closed. Identity and capture evidence
  // come from server-side fixtures rather than command payload fields.
  requireValue(Object.keys(request).length === 1, "UNKNOWN_REQUEST_FIELD");
  requireValue(typeof provenance?.checkpoint_id === "string" && provenance.checkpoint_id.trim(), "MISSING_PROVENANCE");
  const predecessor = previous_checkpoint ?? null;
  requireValue((initiative.current_checkpoint_id ?? null) === (predecessor?.checkpoint_id ?? null), "SUPERSEDED_CHECKPOINT");
  requireValue(initiative.state !== "PRD_REVIEW" || predecessor !== null, "MISSING_SUBMISSION");
  if (predecessor) {
    requireValue(predecessor.synthetic === true && predecessor.workspace_id === initiative.workspace_id && predecessor.initiative_id === initiative.id && predecessor.external_document_binding_id === binding.id && predecessor.provider_connection_id === binding.provider_connection_id && predecessor.provider_file_id === binding.provider_file_id && predecessor.provider_container_id === binding.provider_container_id, "BINDING_MISMATCH");
    requireValue(Number.isSafeInteger(predecessor.checkpoint_number) && predecessor.checkpoint_number > 0 && predecessor.checkpoint_number < Number.MAX_SAFE_INTEGER, "INVALID_CHECKPOINT_NUMBER");
    requireValue(provenance.checkpoint_id !== predecessor.checkpoint_id, "CHECKPOINT_ID_REUSED");
  }
  const checkpoint = captureSyntheticCheckpoint({
    binding, before, after, content,
    provenance: {
      ...provenance,
      synthetic: true,
      actor_id: actor.id,
      predecessor_id: predecessor?.checkpoint_id ?? null,
      checkpoint_number: (predecessor?.checkpoint_number ?? 0) + 1,
    },
  });
  requireCurrentPrdReadiness(input.readiness, {
    id: provenance.completeness_check_id, workspace_id: initiative.workspace_id,
    initiative_id: initiative.id, initiative_version: initiative.version,
    prd_binding_id: binding.id, provider_file_id: binding.provider_file_id, provider_version: checkpoint.provider_version,
    content_digest: checkpoint.content_digest, evidence_snapshot_id: provenance.evidence_snapshot_id,
    idea_brief_version_id: input.current_idea_brief?.id,
    idea_brief_digest: input.current_idea_brief?.content_digest,
    inventory_digest: input.current_readiness_inventory_digest, checked_at: provenance.recorded_at,
  });
  return immutable({
    initiative: { ...structuredClone(initiative), state: "PRD_REVIEW", version: initiative.version + 1, current_checkpoint_id: checkpoint.checkpoint_id },
    checkpoint,
    event: {
      event_type: "prd.submitted", workspace_id: initiative.workspace_id,
      initiative_id: initiative.id, actor_id: actor.id,
      checkpoint_id: checkpoint.checkpoint_id, content_digest: checkpoint.content_digest,
      aggregate_version: initiative.version + 1, recorded_at: checkpoint.recorded_at,
      authorization_decision_id: grant.decision_id, policy_version_id: grant.policy_version_id,
      completeness_check_id: input.readiness.id, readiness_profile_digest: input.readiness.profile_digest,
    },
  });
}

export function approveSyntheticPrd(input) {
  authorize(input);
  const { initiative, request, actor, checkpoint, approval_recorded_at } = input;
  requireValue(Object.keys(request).length === 3 && ["expected_version", "checkpoint_id", "content_digest"].every((field) => Object.hasOwn(request, field)), "UNKNOWN_REQUEST_FIELD");
  requireValue(validCheckpointTime(approval_recorded_at) && validCheckpointTime(checkpoint.recorded_at) && Date.parse(approval_recorded_at) >= Date.parse(checkpoint.recorded_at), "INVALID_APPROVAL_TIME");
  const approval = evaluateSyntheticApproval(input);
  return immutable({
    initiative: { ...structuredClone(initiative), state: approval.state, version: initiative.version + 1 },
    decision: {
      decision: "APPROVED", checkpoint_id: checkpoint.checkpoint_id,
      external_document_binding_id: checkpoint.external_document_binding_id,
      provider_connection_id: checkpoint.provider_connection_id,
      provider_file_id: checkpoint.provider_file_id, provider_version: checkpoint.provider_version,
      content_digest: checkpoint.content_digest, evidence_snapshot_id: checkpoint.evidence_snapshot_id,
      workspace_id: initiative.workspace_id, initiative_id: initiative.id,
      actor_id: actor.id, recorded_at: approval_recorded_at,
    },
  });
}

export function returnSyntheticPrdForRevision(input) {
  authorize(input);
  const { initiative, binding, actor, request, checkpoint, review_recorded_at, review_authorization: grant } = input;
  const requestFields = ["expected_version", "checkpoint_id", "content_digest", "decision", "rationale"];
  requireValue(request && Object.keys(request).length === requestFields.length && requestFields.every((field) => Object.hasOwn(request, field)), "UNKNOWN_REQUEST_FIELD");
  requireValue(["CHANGES_REQUESTED", "REJECTED"].includes(request.decision), "INVALID_REVIEW_DECISION");
  requireValue(typeof request.rationale === "string" && request.rationale.trim().length > 0 && request.rationale.length <= 2000, "REVIEW_RATIONALE_REQUIRED");
  requireValue(validCheckpointTime(review_recorded_at) && validCheckpointTime(checkpoint?.recorded_at) && Date.parse(review_recorded_at) >= Date.parse(checkpoint.recorded_at), "INVALID_REVIEW_TIME");
  requireValue(typeof input.review_access_evaluation_id === "string" && input.review_access_evaluation_id.trim().length > 0, "REVIEW_ACCESS_EVALUATION_REQUIRED");
  const grantFields = ["schema_version", "decision_id", "policy_version_id", "gate_assignment_id", "actor_id", "workspace_id", "initiative_id", "binding_id", "initiative_version", "checkpoint_id", "content_digest", "evidence_snapshot_id", "action", "role", "effect", "evaluated_at", "expires_at"];
  requireValue(grant && Object.keys(grant).length === grantFields.length && grantFields.every((field) => Object.hasOwn(grant, field)), "REVIEWER_DENIED");
  requireValue(grant.schema_version === "curve.prd-review-authorization/v1-candidate" && [grant.decision_id, grant.policy_version_id, grant.gate_assignment_id].every((id) => typeof id === "string" && id.trim().length > 0), "REVIEWER_DENIED");
  requireValue(grant.actor_id === actor.id && grant.workspace_id === initiative.workspace_id && grant.initiative_id === initiative.id && grant.binding_id === binding.id && grant.initiative_version === initiative.version && grant.checkpoint_id === checkpoint.checkpoint_id && grant.content_digest === checkpoint.content_digest && grant.evidence_snapshot_id === checkpoint.evidence_snapshot_id, "REVIEWER_DENIED");
  const action = request.decision === "CHANGES_REQUESTED" ? "PRD_REQUEST_CHANGES" : "PRD_REJECT";
  requireValue(grant.action === action && grant.role === "PRODUCT_APPROVER" && grant.effect === "ALLOW", "REVIEWER_DENIED");
  requireValue(validCheckpointTime(grant.evaluated_at) && validCheckpointTime(grant.expires_at) && grant.evaluated_at === review_recorded_at && Date.parse(grant.expires_at) > Date.parse(review_recorded_at), "REVIEWER_DENIED");
  evaluateSyntheticReviewReturn(input);
  return immutable({
    initiative: { ...structuredClone(initiative), state: "ALIGNING", version: initiative.version + 1 },
    decision: {
      decision: request.decision, rationale: request.rationale,
      checkpoint_id: checkpoint.checkpoint_id, content_digest: checkpoint.content_digest,
      external_document_binding_id: binding.id, provider_connection_id: binding.provider_connection_id,
      provider_file_id: checkpoint.provider_file_id, provider_version: checkpoint.provider_version,
      evidence_snapshot_id: checkpoint.evidence_snapshot_id,
      workspace_id: initiative.workspace_id, initiative_id: initiative.id,
      actor_id: actor.id, recorded_at: review_recorded_at,
      gate_assignment_id: grant.gate_assignment_id, policy_version_id: grant.policy_version_id,
      authorization_decision_id: grant.decision_id,
      access_evaluation_id: input.review_access_evaluation_id,
    },
    event: {
      event_type: request.decision === "CHANGES_REQUESTED" ? "prd.changes_requested" : "prd.rejected",
      workspace_id: initiative.workspace_id, initiative_id: initiative.id,
      actor_id: actor.id, checkpoint_id: checkpoint.checkpoint_id,
      content_digest: checkpoint.content_digest, aggregate_version: initiative.version + 1,
      recorded_at: review_recorded_at, authorization_decision_id: grant.decision_id,
    },
  });
}

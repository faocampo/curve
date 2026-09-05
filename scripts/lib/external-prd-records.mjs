// Cross-record conformance after JSON Schema validation. Inputs are trusted
// server-side records/test fixtures, never authority supplied by a client.
// This checks record consistency; live authorization and reads remain required.
import { validateGateAssignments } from "./initiative-core.mjs";

function requireValue(condition, code) {
  if (!condition) throw new Error(code);
}

function sameScope(left, right) {
  return left.workspace_id === right.workspace_id && left.initiative_id === right.initiative_id;
}

export function validateCheckpointGraph({ binding, checkpoint, predecessor = null }) {
  requireValue(sameScope(binding, checkpoint), "CHECKPOINT_SCOPE_MISMATCH");
  requireValue(checkpoint.external_document_binding_id === binding.id && checkpoint.provider_connection_id === binding.provider_connection_id && checkpoint.provider_file_id === binding.provider_file_id, "CHECKPOINT_BINDING_MISMATCH");
  // A later allowed folder move does not rewrite historical capture provenance.
  requireValue(checkpoint.normalized_content_ref.digest === checkpoint.content_digest && checkpoint.normalized_content_ref.media_type === "application/json" && checkpoint.normalized_content_ref.size_bytes > 0, "CHECKPOINT_OBJECT_MISMATCH");
  if (predecessor === null) {
    requireValue(checkpoint.predecessor_id === null && checkpoint.checkpoint_number === 1, "CHECKPOINT_PREDECESSOR_REQUIRED");
  } else {
    requireValue(sameScope(checkpoint, predecessor) && checkpoint.external_document_binding_id === predecessor.external_document_binding_id, "CHECKPOINT_SCOPE_MISMATCH");
    requireValue(checkpoint.predecessor_id === predecessor.id && checkpoint.id !== predecessor.id && checkpoint.checkpoint_number === predecessor.checkpoint_number + 1, "CHECKPOINT_SEQUENCE_MISMATCH");
    requireValue(Date.parse(checkpoint.recorded_at) >= Date.parse(predecessor.recorded_at), "CHECKPOINT_CHRONOLOGY_INVALID");
  }
  return true;
}

export function validateApprovalGraph({ binding, checkpoint, predecessor = null, approval, assignments, active_human_ids }) {
  validateCheckpointGraph({ binding, checkpoint, predecessor });
  requireValue(sameScope(checkpoint, approval), "APPROVAL_SCOPE_MISMATCH");
  requireValue(approval.checkpoint_id === checkpoint.id && approval.artifact_version_id === checkpoint.artifact_version_id && approval.content_digest === checkpoint.content_digest && approval.provider_version === checkpoint.provider_version && approval.evidence_snapshot_id === checkpoint.evidence_snapshot_id, "APPROVAL_SUBJECT_MISMATCH");
  validateGateAssignments({ assignments, riskTier: approval.confirmed_risk_tier });
  requireValue(Array.isArray(active_human_ids) && assignments.every((assignment) => sameScope(assignment, checkpoint) && active_human_ids.includes(assignment.approver.actor_id)), "GATE_MEMBERSHIP_INVALID");
  const start = Date.parse(checkpoint.recorded_at);
  const cutoff = Date.parse(approval.provider_validation_cutoff);
  const decided = Date.parse(approval.decided_at);
  requireValue([start, cutoff, decided].every(Number.isFinite) && start <= cutoff && cutoff <= decided, "APPROVAL_CHRONOLOGY_INVALID");
  requireValue(assignments.every((assignment) => Date.parse(assignment.valid_from) <= cutoff && (assignment.valid_until === null || Date.parse(assignment.valid_until) > decided)), "GATE_ASSIGNMENT_EXPIRED");
  const assignment = assignments.find((candidate) => candidate.id === approval.gate_assignment_id);
  requireValue(assignment?.gate_type === "PRD_APPROVAL" && approval.decided_by.actor_type === "HUMAN" && assignment.approver.actor_id === approval.decided_by.actor_id, "PRODUCT_APPROVER_REQUIRED");
  return true;
}

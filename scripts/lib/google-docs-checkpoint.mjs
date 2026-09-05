// Synthetic reference semantics for the Google Docs PRD contract.
// This module performs no provider calls, persistence, or authorization lookup.
import { createHash } from "node:crypto";

function canonical(value, depth = 0, budget = { nodes: 0 }) {
  requireValue(depth <= 100 && ++budget.nodes <= 100000, "CONTENT_LIMIT_EXCEEDED");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) {
    requireValue(Object.keys(value).length === value.length, "INVALID_NORMALIZED_JSON");
    return Array.from(value, (item) => canonical(item, depth + 1, budget));
  }
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key], depth + 1, budget)]));
  }
  throw new Error("INVALID_NORMALIZED_JSON");
}

export function contentDigest(normalized_content) {
  return `sha256:${createHash("sha256").update(JSON.stringify(canonical(normalized_content))).digest("hex")}`;
}

function requireValue(condition, code) {
  if (!condition) throw new Error(code);
}

export function validCheckpointTime(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 19) === value.slice(0, 19);
}

function verifySource(binding, observation) {
  requireValue(observation?.provider_file_id === binding.provider_file_id, "SOURCE_ID_MISMATCH");
  requireValue(observation.mimeType === "application/vnd.google-apps.document", "SOURCE_NOT_GOOGLE_DOC");
  requireValue(observation.provider_container_id === binding.provider_container_id && observation.locationAllowed === true, "SOURCE_LOCATION_DENIED");
  requireValue(observation.actorCanRead === true && observation.integrationCanRead === true, "SOURCE_ACCESS_DENIED");
  requireValue(observation.trashed === false, "SOURCE_UNAVAILABLE");
  requireValue(typeof observation.version === "string" && /^[1-9][0-9]*$/.test(observation.version), "INVALID_DRIVE_VERSION");
}

function immutable(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
}

export function captureSyntheticCheckpoint({ binding, before, after, content, provenance }) {
  requireValue(provenance?.synthetic === true, "SYNTHETIC_ONLY");
  for (const field of ["id", "workspace_id", "initiative_id", "provider_file_id", "provider_container_id", "provider_connection_id"]) {
    requireValue(typeof binding?.[field] === "string" && binding[field].trim().length > 0, "INVALID_BINDING");
  }
  requireValue(binding.artifact_kind === "PRD", "INVALID_ARTIFACT_KIND");
  verifySource(binding, before);
  verifySource(binding, after);
  requireValue(before.version === after.version, "SOURCE_CHANGED_DURING_CAPTURE");
  requireValue(provenance.evidenceReadable === true, "EVIDENCE_ACCESS_DENIED");
  requireValue(content?.normalization_version === "curve.google-docs.normalized/v1-candidate", "UNKNOWN_NORMALIZATION");
  requireValue(content.complete === true && content.unsupported_nodes === 0, "INCOMPLETE_CONTENT");
  requireValue(Array.isArray(content.tabs) && content.tabs.length > 0, "MISSING_TABS");
  if (content.document_properties) requireValue(content.document_properties.documentId === binding.provider_file_id, "CONTENT_SOURCE_MISMATCH");
  for (const field of ["checkpoint_id", "actor_id", "evidence_snapshot_id", "access_evaluation_id", "normalized_content_ref"]) {
    requireValue(typeof provenance[field] === "string" && provenance[field].trim().length > 0, "MISSING_PROVENANCE");
  }
  requireValue(Number.isSafeInteger(provenance.checkpoint_number) && provenance.checkpoint_number > 0, "INVALID_CHECKPOINT_NUMBER");
  requireValue(validCheckpointTime(provenance.recorded_at), "INVALID_CAPTURE_TIME");
  requireValue(after.revision_id == null || (typeof after.revision_id === "string" && after.revision_id.trim().length > 0), "INVALID_REVISION_ID");
  requireValue(provenance.predecessor_id == null || (typeof provenance.predecessor_id === "string" && provenance.predecessor_id.trim().length > 0), "INVALID_PREDECESSOR_ID");
  const normalized_content = canonical(content);
  return immutable({
    schema_version: "curve.google-docs.checkpoint/v1-candidate",
    synthetic: true,
    workspace_id: binding.workspace_id,
    initiative_id: binding.initiative_id,
    external_document_binding_id: binding.id,
    provider_connection_id: binding.provider_connection_id,
    artifact_kind: binding.artifact_kind,
    provider_file_id: binding.provider_file_id,
    provider_container_id: binding.provider_container_id,
    provider_version: after.version,
    revision_id: after.revision_id ?? null,
    checkpoint_id: provenance.checkpoint_id,
    checkpoint_number: provenance.checkpoint_number,
    checkpoint_type: "SUBMITTED",
    predecessor_id: provenance.predecessor_id ?? null,
    submitted_or_approved_by: provenance.actor_id,
    recorded_at: provenance.recorded_at,
    evidence_snapshot_id: provenance.evidence_snapshot_id,
    access_evaluation_id: provenance.access_evaluation_id,
    normalized_content_ref: provenance.normalized_content_ref,
    normalized_content,
    content_digest: contentDigest(normalized_content),
  });
}

export function evaluateSyntheticApproval({ initiative, checkpoint, binding, before, after, content, actor, request, evidenceReadable }) {
  requireValue(checkpoint.synthetic === true, "SYNTHETIC_ONLY");
  for (const field of ["checkpoint_id", "external_document_binding_id", "provider_connection_id", "workspace_id", "initiative_id", "normalized_content_ref", "evidence_snapshot_id", "access_evaluation_id", "submitted_or_approved_by"]) {
    requireValue(typeof checkpoint[field] === "string" && checkpoint[field].trim().length > 0, "INVALID_CHECKPOINT");
  }
  requireValue(checkpoint.checkpoint_type === "SUBMITTED" && Number.isSafeInteger(checkpoint.checkpoint_number) && checkpoint.checkpoint_number > 0, "INVALID_CHECKPOINT");
  requireValue(Number.isSafeInteger(initiative.version) && initiative.version > 0, "INVALID_INITIATIVE_VERSION");
  requireValue(initiative.state === "PRD_REVIEW", "INVALID_STATE");
  requireValue(request.expected_version === initiative.version, "INITIATIVE_VERSION_CONFLICT");
  requireValue(typeof actor.id === "string" && actor.id.trim().length > 0 && actor.active === true && actor.human === true && actor.id === initiative.product_approver_id, "APPROVER_DENIED");
  requireValue(actor.workspace_id === initiative.workspace_id && binding.workspace_id === initiative.workspace_id && checkpoint.workspace_id === initiative.workspace_id, "WORKSPACE_MISMATCH");
  requireValue(binding.initiative_id === initiative.id && checkpoint.initiative_id === initiative.id && checkpoint.external_document_binding_id === binding.id && checkpoint.provider_file_id === binding.provider_file_id && checkpoint.provider_container_id === binding.provider_container_id, "BINDING_MISMATCH");
  requireValue(binding.artifact_kind === "PRD" && checkpoint.artifact_kind === "PRD" && checkpoint.provider_connection_id === binding.provider_connection_id, "BINDING_MISMATCH");
  requireValue(initiative.current_checkpoint_id === checkpoint.checkpoint_id && request.checkpoint_id === checkpoint.checkpoint_id, "SUPERSEDED_CHECKPOINT");
  requireValue(checkpoint.content_digest === contentDigest(checkpoint.normalized_content) && request.content_digest === checkpoint.content_digest, "CHECKPOINT_DIGEST_MISMATCH");
  verifySource(binding, before);
  verifySource(binding, after);
  requireValue(before.version === after.version, "SOURCE_CHANGED_DURING_CAPTURE");
  requireValue(content?.complete === true && content.unsupported_nodes === 0 && content.normalization_version === checkpoint.normalized_content.normalization_version, "INCOMPLETE_CONTENT");
  if (content.document_properties) requireValue(content.document_properties.documentId === binding.provider_file_id, "CONTENT_SOURCE_MISMATCH");
  requireValue(after.version === checkpoint.provider_version && contentDigest(content) === checkpoint.content_digest, "STALE_SUBMISSION");
  requireValue(evidenceReadable === true, "EVIDENCE_ACCESS_DENIED");
  return immutable({ state: "PLANNING", checkpoint_id: checkpoint.checkpoint_id, content_digest: checkpoint.content_digest, approved_by: actor.id });
}

export function projectPostApprovalChange({ checkpoint, live_version, live_digest, material_declaration }) {
  requireValue(checkpoint.synthetic === true, "SYNTHETIC_ONLY");
  requireValue(material_declaration === undefined, "MATERIAL_CHANGE_POLICY_REQUIRED");
  requireValue(checkpoint.content_digest === contentDigest(checkpoint.normalized_content), "CHECKPOINT_DIGEST_MISMATCH");
  const changed = live_version !== checkpoint.provider_version || live_digest !== checkpoint.content_digest;
  return immutable({
    state: "PLANNING",
    comparison: changed ? "CHANGED_SINCE_APPROVAL" : "CURRENT",
    requires_successor_approval: changed,
    approved_checkpoint_id: checkpoint.checkpoint_id,
  });
}

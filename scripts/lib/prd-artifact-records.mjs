// Metadata conformance for trusted records, not a source-access authorization.
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { contentDigest, validCheckpointTime } from "./google-docs-checkpoint.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(`../../contracts/schemas/${name}`, import.meta.url), "utf8"));
const ajv = new Ajv2020({ strict: false });
addFormats(ajv);
for (const name of ["common.schema.json", "access-envelope.schema.json", "external-prd-v1.schema.json"]) ajv.addSchema(read(name));
const schema = read("prd-artifact-records-v1.schema.json");
ajv.addSchema(schema);
const requireValue = (condition, code) => { if (!condition) throw new Error(code); };
const check = (kind, value) => requireValue(ajv.getSchema(`${schema.$id}#/$defs/${kind}`)(value), "ARTIFACT_SCHEMA_INVALID");
const before = (left, right) => validCheckpointTime(left) && validCheckpointTime(right) && Date.parse(left) <= Date.parse(right);

export function evidenceSnapshotDigest(snapshot) {
  // Excludes only the self-referential digest field. IDs, scope, order, claims,
  // source versions, excerpt references and exact envelopes remain bound.
  const { digest: _digest, ...subject } = snapshot;
  return contentDigest(subject);
}

export function validatePrdArtifactGraph({ artifact, version, snapshot, evidence_items, checkpoint, predecessor = null }) {
  check("Artifact", artifact); check("ArtifactVersion", version); check("EvidenceSnapshot", snapshot);
  requireValue(Array.isArray(evidence_items) && evidence_items.length <= 10000, "EVIDENCE_ITEMS_INVALID");
  evidence_items.forEach((item) => check("EvidenceItem", item));
  requireValue(ajv.getSchema("https://curve.example.invalid/contracts/schemas/external-prd-v1.schema.json#/$defs/Checkpoint")(checkpoint), "CHECKPOINT_SCHEMA_INVALID");
  requireValue([version, snapshot, checkpoint].every((item) => item.workspace_id === artifact.workspace_id && item.initiative_id === artifact.initiative_id), "ARTIFACT_SCOPE_MISMATCH");
  requireValue(version.artifact_id === artifact.id && artifact.current_version_id === version.id && checkpoint.artifact_version_id === version.id && snapshot.artifact_version_id === version.id && version.evidence_snapshot_id === snapshot.id && checkpoint.evidence_snapshot_id === snapshot.id, "ARTIFACT_LINKAGE_INVALID");
  requireValue(version.created_by.actor_type === "HUMAN" && version.created_by.actor_id === checkpoint.submitted_or_approved_by.actor_id, "ARTIFACT_ATTRIBUTION_INVALID");
  requireValue(version.body_digest === version.body.digest && version.body_digest === checkpoint.content_digest && contentDigest(version.body) === contentDigest(checkpoint.normalized_content_ref) && version.body.media_type === "application/json" && version.body.size_bytes > 0, "ARTIFACT_BODY_MISMATCH");
  requireValue(version.access_envelope_id === checkpoint.access_envelope_id && version.retention_policy_version_id === checkpoint.retention_policy_version_id && version.body_schema_id === checkpoint.normalization_schema_version, "ARTIFACT_POLICY_MISMATCH");
  requireValue(before(artifact.created_at, version.created_at) && before(snapshot.created_at, version.created_at) && before(version.created_at, checkpoint.recorded_at), "ARTIFACT_CHRONOLOGY_INVALID");
  if (predecessor === null) requireValue(version.parent_version_id === null && version.version_number === 1, "ARTIFACT_PREDECESSOR_REQUIRED");
  else {
    check("ArtifactVersion", predecessor);
    requireValue(predecessor.workspace_id === version.workspace_id && predecessor.initiative_id === version.initiative_id && predecessor.artifact_id === artifact.id && predecessor.id !== version.id && version.parent_version_id === predecessor.id && version.version_number === predecessor.version_number + 1 && before(predecessor.created_at, version.created_at), "ARTIFACT_PREDECESSOR_INVALID");
  }
  requireValue(snapshot.digest === evidenceSnapshotDigest(snapshot), "EVIDENCE_SNAPSHOT_DIGEST_MISMATCH");
  const index = new Map(evidence_items.map((item) => [`${item.id}:${item.version}`, item]));
  requireValue(index.size === evidence_items.length && index.size === snapshot.items.length, "EVIDENCE_MEMBERSHIP_INVALID");
  const seen = new Set();
  for (const [ordinal, entry] of snapshot.items.entries()) {
    const key = `${entry.evidence_item_id}:${entry.evidence_item_version}`;
    const item = index.get(key);
    requireValue(entry.ordinal === ordinal && !seen.has(key) && item, "EVIDENCE_MEMBERSHIP_INVALID"); seen.add(key);
    requireValue(item.workspace_id === artifact.workspace_id && item.access_envelope.workspace_id === artifact.workspace_id, "EVIDENCE_SCOPE_MISMATCH");
    requireValue(entry.content_digest === item.content_digest && entry.source_version === item.source_version && entry.access_envelope_id === item.access_envelope.id && entry.access_envelope_digest === contentDigest(item.access_envelope), "EVIDENCE_IDENTITY_MISMATCH");
    requireValue(item.access_envelope.source_refs.some((source) => contentDigest(source) === contentDigest(item.source.source_ref)), "EVIDENCE_SOURCE_MISMATCH");
    requireValue(item.effective_principal.actor_type === "HUMAN" && contentDigest(item.effective_principal) === contentDigest(item.access_envelope.effective_principal), "EVIDENCE_PRINCIPAL_MISMATCH");
    requireValue(item.classification === item.access_envelope.classification && item.redaction_state === item.access_envelope.redaction_state && item.access_envelope.retention_policy_ref.resource_type === "RETENTION_POLICY_VERSION" && item.retention_policy_version_id === item.access_envelope.retention_policy_ref.resource_id, "EVIDENCE_POLICY_MISMATCH");
    requireValue(before(item.retrieved_at, item.created_at) && before(item.access_envelope.created_at, item.created_at) && before(item.created_at, snapshot.created_at), "EVIDENCE_CHRONOLOGY_INVALID");
    if (item.content) requireValue(item.content.digest === item.content_digest && item.content.size_bytes > 0, "EVIDENCE_BODY_MISMATCH");
    if (entry.selected_excerpt_ref) requireValue(entry.selected_excerpt_ref.size_bytes > 0, "EVIDENCE_EXCERPT_INVALID");
    if (entry.material) requireValue(entry.claim_refs.length > 0, "MATERIAL_CLAIM_REFERENCE_REQUIRED");
  }
  return true;
}

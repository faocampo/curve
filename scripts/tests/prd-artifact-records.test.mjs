import assert from "node:assert/strict";
import test from "node:test";
import { contentDigest } from "../lib/google-docs-checkpoint.mjs";
import { evidenceSnapshotDigest, validatePrdArtifactGraph } from "../lib/prd-artifact-records.mjs";

const id = (n) => `93000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = "2026-01-10T12:00:00Z";
const digest = `sha256:${"e".repeat(64)}`;
function fixture() {
  const base = { schema_version: "1.0-candidate", workspace_id: id(1), created_at: at };
  const human = { actor_type: "HUMAN", actor_id: id(2) };
  const body = { object_id: id(3), digest, size_bytes: 123, media_type: "application/json" };
  const artifact = { ...base, id: id(4), initiative_id: id(5), kind: "PRD", current_version_id: id(6) };
  const version = { ...base, id: id(6), initiative_id: id(5), artifact_id: id(4), version_number: 1, state: "SUBMITTED", body, body_schema_id: "curve.google-docs.normalized/v1-candidate", body_schema_version: 1, body_digest: digest, evidence_snapshot_id: id(7), parent_version_id: null, created_by: human, generation_provenance: null, access_envelope_id: id(8), retention_policy_version_id: id(9) };
  const envelope = { schema_version: "1.0", id: id(10), workspace_id: id(1), source_refs: [{ resource_type: "EVIDENCE_ITEM", resource_id: id(11) }], effective_principal: human, source_authorization_digest: digest, classification: "INTERNAL", allowed_audiences: ["WORKSPACE_MEMBER"], allowed_destinations: ["CURVE_PROTECTED_STORAGE"], retention_policy_ref: { resource_type: "RETENTION_POLICY_VERSION", resource_id: id(9) }, redaction_state: "RAW", legal_hold: false, created_at: at };
  const evidence = { ...base, id: id(11), version: 1, source: { provider_connection_id: id(12), resource_id: "fictional-source", resource_type: "DOCUMENT", source_ref: envelope.source_refs[0] }, source_version: "fictional-version", retrieved_at: at, effective_principal: human, content: { object_id: id(13), digest, size_bytes: 5, media_type: "text/plain" }, content_digest: digest, classification: "INTERNAL", access_envelope: envelope, trust_flags: [], redaction_state: "RAW", retention_policy_version_id: id(9) };
  const snapshot = { ...base, id: id(7), initiative_id: id(5), artifact_version_id: id(6), digest, items: [{ ordinal: 0, evidence_item_id: id(11), evidence_item_version: 1, content_digest: digest, source_version: "fictional-version", access_envelope_id: id(10), access_envelope_digest: contentDigest(envelope), material: true, claim_refs: ["REQ-1"], selected_excerpt_ref: null }] };
  snapshot.digest = evidenceSnapshotDigest(snapshot);
  const checkpoint = { schema_version: "1.0", id: id(14), workspace_id: id(1), initiative_id: id(5), external_document_binding_id: id(15), artifact_version_id: id(6), checkpoint_number: 1, checkpoint_type: "SUBMITTED", provider_connection_id: id(16), provider_file_id: "fictional-document", provider_container_id: "fictional-container", provider_version: "1", revision_id: null, normalized_content_ref: body, content_digest: digest, normalization_schema_version: version.body_schema_id, evidence_snapshot_id: id(7), access_evaluation_id: id(17), completeness_check_id: id(18), retention_policy_version_id: id(9), access_envelope_id: id(8), predecessor_id: null, submitted_or_approved_by: human, recorded_at: at };
  return { artifact, version, snapshot, evidence_items: [evidence], checkpoint };
}
function rehash(f) {
  f.snapshot.digest = evidenceSnapshotDigest(f.snapshot);
}

test("immutable PRD metadata graph binds body, evidence, author and checkpoint without mutation", () => {
  const f = fixture(), original = structuredClone(f);
  assert.equal(validatePrdArtifactGraph(f), true);
  assert.deepEqual(f, original);
});
test("explicit empty evidence snapshot validates for a PRD without material source evidence", () => {
  const f = fixture(); f.evidence_items = []; f.snapshot.items = []; rehash(f);
  assert.equal(validatePrdArtifactGraph(f), true);
});
test("erased evidence bodies retain valid historical metadata without granting current access", () => {
  const f = fixture(); f.evidence_items[0].content = null;
  assert.equal(validatePrdArtifactGraph(f), true);
});
test("snapshot digest is stable across object key order but binds scope and all membership fields", () => {
  const f = fixture(), snapshot = f.snapshot;
  assert.equal(evidenceSnapshotDigest(Object.fromEntries(Object.entries(snapshot).reverse())), snapshot.digest);
  for (const mutate of [
    (s) => { s.workspace_id = id(99); }, (s) => { s.artifact_version_id = id(99); },
    (s) => { s.items[0].material = false; }, (s) => { s.items[0].claim_refs = ["REQ-2"]; },
    (s) => { s.items[0].source_version = "next"; }, (s) => { s.items[0].selected_excerpt_ref = f.version.body; },
  ]) {
    const changed = structuredClone(snapshot); mutate(changed);
    assert.notEqual(evidenceSnapshotDigest(changed), snapshot.digest);
  }
});

for (const [label, mutate, reason] of [
  ["version workspace", (f) => { f.version.workspace_id = id(99); }, "ARTIFACT_SCOPE_MISMATCH"],
  ["snapshot Initiative", (f) => { f.snapshot.initiative_id = id(99); }, "ARTIFACT_SCOPE_MISMATCH"],
  ["checkpoint workspace", (f) => { f.checkpoint.workspace_id = id(99); }, "ARTIFACT_SCOPE_MISMATCH"],
  ["artifact pointer", (f) => { f.artifact.current_version_id = id(99); }, "ARTIFACT_LINKAGE_INVALID"],
  ["wrong artifact", (f) => { f.version.artifact_id = id(99); }, "ARTIFACT_LINKAGE_INVALID"],
  ["wrong snapshot subject", (f) => { f.snapshot.artifact_version_id = id(99); }, "ARTIFACT_LINKAGE_INVALID"],
  ["wrong checkpoint subject", (f) => { f.checkpoint.artifact_version_id = id(99); }, "ARTIFACT_LINKAGE_INVALID"],
  ["nonhuman author", (f) => { f.version.created_by = { actor_type: "SERVICE", actor_id: id(2) }; }, "ARTIFACT_ATTRIBUTION_INVALID"],
  ["different author", (f) => { f.version.created_by = { actor_type: "HUMAN", actor_id: id(99) }; }, "ARTIFACT_ATTRIBUTION_INVALID"],
  ["body object substitution", (f) => { f.version.body = { ...f.version.body, object_id: id(99) }; }, "ARTIFACT_BODY_MISMATCH"],
  ["body digest substitution", (f) => { f.version.body_digest = `sha256:${"f".repeat(64)}`; }, "ARTIFACT_BODY_MISMATCH"],
  ["policy substitution", (f) => { f.version.retention_policy_version_id = id(99); }, "ARTIFACT_POLICY_MISMATCH"],
  ["missing predecessor", (f) => { f.version.version_number = 2; }, "ARTIFACT_PREDECESSOR_REQUIRED"],
  ["future artifact", (f) => { f.artifact.created_at = "2026-01-11T12:00:00Z"; }, "ARTIFACT_CHRONOLOGY_INVALID"],
  ["snapshot digest tampering", (f) => { f.snapshot.digest = digest; }, "EVIDENCE_SNAPSHOT_DIGEST_MISMATCH"],
  ["missing evidence", (f) => { f.evidence_items = []; }, "EVIDENCE_MEMBERSHIP_INVALID"],
  ["duplicate evidence", (f) => { f.evidence_items.push(structuredClone(f.evidence_items[0])); }, "EVIDENCE_MEMBERSHIP_INVALID"],
  ["invalid ordinal", (f) => { f.snapshot.items[0].ordinal = 1; rehash(f); }, "EVIDENCE_MEMBERSHIP_INVALID"],
  ["evidence workspace", (f) => { f.evidence_items[0].workspace_id = id(99); }, "EVIDENCE_SCOPE_MISMATCH"],
  ["envelope workspace", (f) => { f.evidence_items[0].access_envelope.workspace_id = id(99); }, "EVIDENCE_SCOPE_MISMATCH"],
  ["source version", (f) => { f.evidence_items[0].source_version = "next"; }, "EVIDENCE_IDENTITY_MISMATCH"],
  ["envelope digest", (f) => { f.snapshot.items[0].access_envelope_digest = digest; rehash(f); }, "EVIDENCE_IDENTITY_MISMATCH"],
  ["source outside envelope", (f) => { f.evidence_items[0].source.source_ref = { resource_type: "EVIDENCE_ITEM", resource_id: id(99) }; }, "EVIDENCE_SOURCE_MISMATCH"],
  ["different effective principal", (f) => { f.evidence_items[0].effective_principal = { actor_type: "HUMAN", actor_id: id(99) }; }, "EVIDENCE_PRINCIPAL_MISMATCH"],
  ["classification mismatch", (f) => { f.evidence_items[0].classification = "CONFIDENTIAL"; }, "EVIDENCE_POLICY_MISMATCH"],
  ["wrong policy reference type", (f) => { f.evidence_items[0].access_envelope.retention_policy_ref.resource_type = "ARTIFACT"; f.snapshot.items[0].access_envelope_digest = contentDigest(f.evidence_items[0].access_envelope); rehash(f); }, "EVIDENCE_POLICY_MISMATCH"],
  ["future retrieval", (f) => { f.evidence_items[0].retrieved_at = "2026-01-11T12:00:00Z"; }, "EVIDENCE_CHRONOLOGY_INVALID"],
  ["evidence body mismatch", (f) => { f.evidence_items[0].content.digest = `sha256:${"f".repeat(64)}`; }, "EVIDENCE_BODY_MISMATCH"],
  ["empty excerpt", (f) => { f.snapshot.items[0].selected_excerpt_ref = { ...f.version.body, size_bytes: 0 }; rehash(f); }, "EVIDENCE_EXCERPT_INVALID"],
  ["unmapped material evidence", (f) => { f.snapshot.items[0].claim_refs = []; rehash(f); }, "MATERIAL_CLAIM_REFERENCE_REQUIRED"],
]) {
  test(`PRD metadata rejects ${label}`, () => {
    const f = fixture(); mutate(f); const original = structuredClone(f);
    assert.throws(() => validatePrdArtifactGraph(f), new RegExp(reason));
    assert.deepEqual(f, original);
  });
}

test("successor versions require exact same-artifact predecessor and consecutive numbering", () => {
  const f = fixture(); f.predecessor = structuredClone(f.version); f.predecessor.id = id(20);
  f.version.version_number = 2; f.version.parent_version_id = id(20);
  assert.equal(validatePrdArtifactGraph(f), true);
  f.predecessor.artifact_id = id(99);
  assert.throws(() => validatePrdArtifactGraph(f), /ARTIFACT_PREDECESSOR_INVALID/);
});
test("all required resource fields are enforced and inline content is rejected", () => {
  for (const key of ["artifact", "version", "snapshot", "checkpoint"]) {
    const original = fixture();
    for (const field of Object.keys(original[key])) {
      const f = fixture(); delete f[key][field];
      assert.throws(() => validatePrdArtifactGraph(f), /SCHEMA_INVALID/, `${key}.${field}`);
    }
    const f = fixture(); f[key].raw_body = "synthetic content";
    assert.throws(() => validatePrdArtifactGraph(f), /SCHEMA_INVALID/);
  }
  const f = fixture(); f.evidence_items[0].access_token = "synthetic-token";
  assert.throws(() => validatePrdArtifactGraph(f), /SCHEMA_INVALID/);
  for (const field of Object.keys(fixture().evidence_items[0])) {
    const missing = fixture(); delete missing.evidence_items[0][field];
    assert.throws(() => validatePrdArtifactGraph(missing), /SCHEMA_INVALID/, field);
  }
});

test("evidence order is bound by the digest and must agree with contiguous ordinals", () => {
  const f = fixture(), second = structuredClone(f.evidence_items[0]);
  second.id = id(21); second.access_envelope.id = id(22);
  second.source.source_ref.resource_id = id(21);
  second.access_envelope.source_refs[0].resource_id = id(21);
  f.evidence_items.push(second);
  f.snapshot.items.push({ ...structuredClone(f.snapshot.items[0]), ordinal: 1, evidence_item_id: id(21), access_envelope_id: id(22), access_envelope_digest: contentDigest(second.access_envelope) });
  rehash(f); assert.equal(validatePrdArtifactGraph(f), true);
  f.snapshot.items.reverse();
  assert.throws(() => validatePrdArtifactGraph(f), /EVIDENCE_SNAPSHOT_DIGEST_MISMATCH/);
  rehash(f);
  assert.throws(() => validatePrdArtifactGraph(f), /EVIDENCE_MEMBERSHIP_INVALID/);
});

test("unrepresentable capture times cannot pass chronology comparisons", () => {
  for (const change of [
    (f) => { f.version.created_at = "2026-01-10T11:59:60Z"; },
    (f) => { f.evidence_items[0].retrieved_at = "2026-01-10T11:59:60Z"; },
  ]) {
    const f = fixture(); change(f);
    assert.throws(() => validatePrdArtifactGraph(f), /CHRONOLOGY_INVALID|SCHEMA_INVALID/);
  }
});

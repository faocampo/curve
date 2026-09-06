import { normalizeSyntheticGoogleDoc, GOOGLE_DOCS_CAPTURE_OPTIONS } from "../../lib/google-docs-normalization.mjs";
import { contentDigest } from "../../lib/google-docs-checkpoint.mjs";
import { PRD_READINESS_PROFILE, evaluateSyntheticPrdReadiness } from "../../lib/prd-readiness.mjs";

export function normalizedDefinition(sections, documentId) {
  const content = Object.values(sections).flatMap((label) => [
    { paragraph: { paragraphStyle: { namedStyleType: "HEADING_1" }, elements: [{ textRun: { content: `${label}\n` } }] } },
    { paragraph: { elements: [{ textRun: { content: label === "Requirements" ? "FR-1: Support fictional onboarding\n" : label === "Acceptance" ? "AC-1: Verify fictional onboarding for FR-1\n" : "Synthetic PRD for fictional onboarding\n" } }] } },
  ]);
  return normalizeSyntheticGoogleDoc({ synthetic: true, readOptions: GOOGLE_DOCS_CAPTURE_OPTIONS, document: { documentId, title: "Synthetic definition", suggestionsViewMode: "SUGGESTIONS_INLINE", tabs: [{ tabProperties: { tabId: "main", title: "Definition", index: 0 }, documentTab: { body: { content } } }] } });
}

export function readinessFixture() {
  const input = { synthetic: true, id: "readiness-example-2", workspace_id: "workspace-example", initiative_id: "initiative-example", initiative_version: 2, checked_at: "2026-09-05T12:00:00Z", evidence_snapshot_id: "evidence-example", active_human_ids: ["author-example"], prd: { binding_id: "binding-example", provider_version: "9007199254740993", content: normalizedDefinition(PRD_READINESS_PROFILE.prd_sections, "doc-example") }, idea_brief: { version_id: "idea-brief-example", content: normalizedDefinition(PRD_READINESS_PROFILE.idea_brief_sections, "brief-example") } };
  for (const doc of [input.prd, input.idea_brief]) Object.assign(doc, { workspace_id: input.workspace_id, initiative_id: input.initiative_id, provider_file_id: doc.content.document_properties.documentId });
  input.inventory = { workspace_id: input.workspace_id, initiative_id: input.initiative_id, prd_digest: contentDigest(input.prd.content), idea_brief_digest: contentDigest(input.idea_brief.content), checked_at: input.checked_at, complete: true, blockers: [], assumptions: [] };
  return input;
}

// Explicitly refresh fabricated controller observations when a test changes
// the subject. Runtime must perform real reads and cannot self-grant readiness.
export function withCurrentReadiness(f) {
  const input = readinessFixture();
  input.id = `readiness-example-${f.initiative.version}`;
  input.initiative_version = f.initiative.version;
  input.prd.content = f.content; input.prd.provider_version = f.before.version;
  input.inventory.prd_digest = contentDigest(f.content);
  input.checked_at = input.inventory.checked_at = f.provenance.recorded_at;
  f.readiness = evaluateSyntheticPrdReadiness(input);
  f.current_idea_brief = { id: input.idea_brief.version_id, content_digest: contentDigest(input.idea_brief.content) };
  f.current_readiness_inventory_digest = f.readiness.inventory_digest;
  f.provenance.completeness_check_id = input.id;
  return f;
}

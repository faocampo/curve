import assert from "node:assert/strict";
import test from "node:test";
import { GOOGLE_DOCS_CAPTURE_OPTIONS, normalizeSyntheticGoogleDoc } from "../lib/google-docs-normalization.mjs";
import { captureSyntheticCheckpoint, contentDigest, evaluateSyntheticApproval } from "../lib/google-docs-checkpoint.mjs";

const paragraph = (content) => ({ paragraph: { elements: [{ textRun: { content } }] } });
function fixture() {
  return {
    synthetic: true,
    readOptions: { ...GOOGLE_DOCS_CAPTURE_OPTIONS },
    document: {
      documentId: "synthetic-doc", title: "Synthetic PRD", revisionId: "opaque-revision",
      suggestionsViewMode: "SUGGESTIONS_INLINE",
      tabs: [{
        tabProperties: { tabId: "main", title: "Problem", index: 0 },
        documentTab: {
          body: { content: [paragraph("Reduce onboarding time\n"), {
            table: { rows: 1, columns: 1, tableRows: [{ tableCells: [{ content: [paragraph("Success: completed in one minute\n")] }] }] },
          }, { paragraph: { elements: [{ footnoteReference: { footnoteId: "fn-1" } }] } }] },
          headers: { "h-1": { content: [paragraph("Example Organization\n")] } },
          footers: { "f-1": { content: [paragraph("Internal\n")] } },
          footnotes: { "fn-1": { content: [paragraph("Research evidence\n")] } },
        },
        childTabs: [{
          tabProperties: { tabId: "acceptance", parentTabId: "main", title: "Acceptance", index: 0 },
          documentTab: { body: { content: [{ paragraph: { elements: [{ textRun: {
            content: "Suggested criterion\n", suggestedInsertionIds: ["s-1"], textStyle: { bold: true },
          } }] } }] } },
        }],
      }],
    },
  };
}
const normalize = (f = fixture()) => normalizeSyntheticGoogleDoc(f);

test("normalization preserves nested tabs, tables, notes, headers, footers and inline suggestions", () => {
  const f = fixture(); const output = normalize(f);
  assert.deepEqual(output.tabs, f.document.tabs);
  assert.equal(output.document_properties.title, "Synthetic PRD");
  assert.equal(output.document_properties.revisionId, undefined);
  assert.equal(output.complete, true);
  output.tabs[0].documentTab.body.content[0].paragraph.elements[0].textRun.content = "Mutated copy";
  assert.equal(f.document.tabs[0].documentTab.body.content[0].paragraph.elements[0].textRun.content, "Reduce onboarding time\n");
});

test("revision transport changes leave digest stable while content, ordering, suggestions and title changes affect it", () => {
  const f = fixture(); const digest = contentDigest(normalize(f));
  f.document.revisionId = "provider-rotated-id";
  assert.equal(contentDigest(normalize(f)), digest);
  for (const mutate of [
    (d) => { d.title = "Changed title"; },
    (d) => { d.tabs[0].documentTab.headers["h-1"].content[0].paragraph.elements[0].textRun.content = "Changed header"; },
    (d) => { d.tabs[0].documentTab.body.content[1].table.tableRows[0].tableCells[0].content = [paragraph("Changed acceptance")]; },
    (d) => { d.tabs[0].documentTab.body.content.reverse(); },
    (d) => { delete d.tabs[0].childTabs[0].documentTab.body.content[0].paragraph.elements[0].textRun.suggestedInsertionIds; },
    (d) => { d.tabs[0].documentTab.newProviderMetadata = { semantics: "retained" }; },
  ]) {
    const changed = fixture(); mutate(changed.document);
    assert.notEqual(contentDigest(normalize(changed)), digest);
  }
});

function imageFixture() {
  const f = fixture();
  f.document.tabs[0].documentTab.inlineObjects = { "image-1": {
    inlineObjectProperties: { embeddedObject: { title: "Acceptance diagram", imageProperties: {
      contentUri: "https://synthetic.invalid/temporary-image-a", sourceUri: "https://synthetic.invalid/source", cropProperties: { offsetLeft: 0.1 },
    } } },
  } };
  f.document.tabs[0].documentTab.body.content.push({ paragraph: { elements: [{ inlineObjectElement: { inlineObjectId: "image-1" } }] } });
  f.imageCaptures = new Map([["https://synthetic.invalid/temporary-image-a", { authorized: true, bytes: new Uint8Array([1, 2, 3]) }]]);
  return f;
}

test("image bytes replace temporary access URLs; rotation is stable and changed bytes alter the digest", () => {
  const f = imageFixture(); const original = normalize(f); const digest = contentDigest(original);
  assert.equal(JSON.stringify(original).includes("temporary-image-a"), false);
  const image = f.document.tabs[0].documentTab.inlineObjects["image-1"].inlineObjectProperties.embeddedObject.imageProperties;
  image.contentUri = "https://synthetic.invalid/temporary-image-b";
  f.imageCaptures.set(image.contentUri, { authorized: true, bytes: new Uint8Array([1, 2, 3]) });
  assert.equal(contentDigest(normalize(f)), digest);
  f.imageCaptures.get(image.contentUri).bytes[0] = 9;
  assert.notEqual(contentDigest(normalize(f)), digest);
  assert.equal(contentDigest(original), digest);
});

for (const [name, mutate, code] of [
  ["live activation", (f) => { f.synthetic = false; }, "SYNTHETIC_ONLY"],
  ["first-tab-only read", (f) => { f.readOptions.includeTabsContent = false; }, "FULL_DOCUMENT_READ_REQUIRED"],
  ["field-masked response", (f) => { f.readOptions.fields = "tabs"; }, "FULL_DOCUMENT_READ_REQUIRED"],
  ["accepted-suggestion preview", (f) => { f.document.suggestionsViewMode = "PREVIEW_SUGGESTIONS_ACCEPTED"; }, "INLINE_SUGGESTIONS_REQUIRED"],
  ["implicit suggestion permissions", (f) => { delete f.readOptions.suggestionsViewMode; }, "INLINE_SUGGESTIONS_REQUIRED"],
  ["missing tabs", (f) => { f.document.tabs = []; }, "MISSING_TABS"],
  ["sparse tabs", (f) => { f.document.tabs = new Array(1); }, "INVALID_DOCUMENT_JSON"],
  ["duplicate tab IDs", (f) => { f.document.tabs[0].childTabs[0].tabProperties.tabId = "main"; }, "INVALID_TAB_ID"],
  ["wrong child parent", (f) => { f.document.tabs[0].childTabs[0].tabProperties.parentTabId = "other"; }, "INVALID_TAB_HIERARCHY"],
  ["missing child body", (f) => { delete f.document.tabs[0].childTabs[0].documentTab.body; }, "MISSING_TAB_BODY"],
  ["unknown tab type", (f) => { f.document.tabs[0].canvasTab = {}; }, "UNSUPPORTED_TAB"],
  ["unknown structural node", (f) => { f.document.tabs[0].documentTab.body.content.push({ canvas: {} }); }, "UNSUPPORTED_STRUCTURAL_ELEMENT"],
  ["null structural node", (f) => { f.document.tabs[0].documentTab.body.content.push({ paragraph: null }); }, "UNSUPPORTED_STRUCTURAL_ELEMENT"],
  ["null paragraph node", (f) => { f.document.tabs[0].documentTab.body.content.push({ paragraph: { elements: [{ textRun: null }] } }); }, "UNSUPPORTED_PARAGRAPH_ELEMENT"],
  ["unsupported equation", (f) => { f.document.tabs[0].documentTab.body.content.push({ paragraph: { elements: [{ equation: {} }] } }); }, "UNSUPPORTED_PARAGRAPH_ELEMENT"],
  ["missing table cell content", (f) => { delete f.document.tabs[0].documentTab.body.content[1].table.tableRows[0].tableCells[0].content; }, "INVALID_STRUCTURAL_CONTENT"],
  ["missing footnote", (f) => { delete f.document.tabs[0].documentTab.footnotes; }, "MISSING_FOOTNOTE"],
  ["missing list definition", (f) => { f.document.tabs[0].documentTab.body.content[0].paragraph.bullet = { listId: "absent" }; }, "MISSING_LIST"],
  ["legacy response mixed with tabs", (f) => { f.document.body = { content: [paragraph("Hidden first tab")] }; }, "LEGACY_CONTENT_WITH_TABS"],
  ["non-JSON content", (f) => { f.document.tabs[0].documentTab.metadata = undefined; }, "INVALID_DOCUMENT_JSON"],
  ["unexpected access URL", (f) => { f.document.contentUri = "https://synthetic.invalid/secret"; }, "UNEXPECTED_CONTENT_URI"],
]) {
  test(`normalization rejects ${name}`, () => {
    const f = fixture(); mutate(f);
    assert.throws(() => normalize(f), new RegExp(code));
  });
}

for (const [name, mutate, code] of [
  ["uncaptured image", (f) => { f.imageCaptures.clear(); }, "IMAGE_CAPTURE_REQUIRED"],
  ["unauthorized image", (f) => { f.imageCaptures.values().next().value.authorized = false; }, "IMAGE_CAPTURE_REQUIRED"],
  ["empty image bytes", (f) => { f.imageCaptures.values().next().value.bytes = new Uint8Array(); }, "IMAGE_CAPTURE_REQUIRED"],
  ["unresolved inline object", (f) => { delete f.document.tabs[0].documentTab.inlineObjects; }, "MISSING_INLINE_OBJECT"],
  ["unavailable drawing content", (f) => { f.document.tabs[0].documentTab.inlineObjects["image-1"].inlineObjectProperties.embeddedObject.embeddedDrawingProperties = {}; }, "UNSUPPORTED_EMBEDDED_DRAWING"],
  ["externally linked chart", (f) => { f.document.tabs[0].documentTab.inlineObjects["image-1"].inlineObjectProperties.embeddedObject.linkedContentReference = {}; }, "UNSUPPORTED_LINKED_CONTENT"],
  ["missing embedded content", (f) => { delete f.document.tabs[0].documentTab.inlineObjects["image-1"].inlineObjectProperties.embeddedObject.imageProperties; }, "UNSUPPORTED_EMBEDDED_OBJECT"],
]) {
  test(`normalization rejects ${name}`, () => {
    const f = imageFixture(); mutate(f);
    assert.throws(() => normalize(f), new RegExp(code));
  });
}

test("bounded traversal rejects cyclic or oversized-depth provider input", () => {
  const f = fixture(); f.document.circular = f.document;
  assert.throws(() => normalize(f), /DOCUMENT_LIMIT_EXCEEDED/);
});

test("normalized provider-shaped PRD can be captured and approved; a changed table blocks approval", () => {
  const f = fixture(); const content = normalize(f);
  const binding = { id: "binding", workspace_id: "workspace", initiative_id: "initiative", provider_file_id: f.document.documentId, provider_container_id: "drive", provider_connection_id: "connection", artifact_kind: "PRD" };
  const before = { provider_file_id: binding.provider_file_id, provider_container_id: "drive", mimeType: "application/vnd.google-apps.document", version: "10", actorCanRead: true, integrationCanRead: true, locationAllowed: true, trashed: false };
  const checkpoint = captureSyntheticCheckpoint({ binding, before, after: before, content, provenance: {
    synthetic: true, evidenceReadable: true, checkpoint_id: "checkpoint", checkpoint_number: 1, normalized_content_ref: "synthetic-object", actor_id: "author", evidence_snapshot_id: "evidence", access_evaluation_id: "access", recorded_at: "2026-09-04T12:00:00Z",
  } });
  const review = {
    binding, before, after: before, content, checkpoint, evidenceReadable: true,
    initiative: { id: "initiative", workspace_id: "workspace", state: "PRD_REVIEW", version: 3, product_approver_id: "approver", current_checkpoint_id: "checkpoint" },
    actor: { id: "approver", workspace_id: "workspace", active: true, human: true },
    request: { expected_version: 3, checkpoint_id: "checkpoint", content_digest: checkpoint.content_digest },
  };
  assert.equal(evaluateSyntheticApproval(review).state, "PLANNING");
  const substituted = structuredClone(content);
  substituted.document_properties.documentId = "another-document";
  assert.throws(() => evaluateSyntheticApproval({ ...review, content: substituted }), /CONTENT_SOURCE_MISMATCH/);
  assert.throws(() => captureSyntheticCheckpoint({ binding, before, after: before, content: substituted, provenance: { synthetic: true, evidenceReadable: true } }), /CONTENT_SOURCE_MISMATCH/);
  f.document.tabs[0].documentTab.body.content[1].table.tableRows[0].tableCells[0].content = [paragraph("Changed after submission")];
  assert.throws(() => evaluateSyntheticApproval({ ...review, content: normalize(f) }), /STALE_SUBMISSION/);
});

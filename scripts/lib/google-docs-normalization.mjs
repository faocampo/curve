// Local, synthetic Google Docs capture candidate. No network or storage access.
import { createHash } from "node:crypto";

export const GOOGLE_DOCS_CAPTURE_OPTIONS = Object.freeze({
  includeTabsContent: true,
  suggestionsViewMode: "SUGGESTIONS_INLINE",
});

function requireValue(condition, code) {
  if (!condition) throw new Error(code);
}

const structuralTypes = ["paragraph", "table", "sectionBreak", "tableOfContents"];
const paragraphTypes = ["textRun", "inlineObjectElement", "footnoteReference", "pageBreak", "columnBreak", "horizontalRule"];

// The transport must attest a full response: absence of a field in a field-masked
// response cannot be distinguished from absence in the actual document.
export function normalizeSyntheticGoogleDoc({ document, readOptions, synthetic, imageCaptures = new Map() }) {
  requireValue(synthetic === true, "SYNTHETIC_ONLY");
  requireValue(readOptions?.includeTabsContent === true && !Object.hasOwn(readOptions, "fields"), "FULL_DOCUMENT_READ_REQUIRED");
  requireValue(readOptions.suggestionsViewMode === "SUGGESTIONS_INLINE" && document?.suggestionsViewMode === "SUGGESTIONS_INLINE", "INLINE_SUGGESTIONS_REQUIRED");
  requireValue(Array.isArray(document.tabs) && document.tabs.length > 0, "MISSING_TABS");
  requireValue(typeof document.documentId === "string" && document.documentId.length > 0 && typeof document.title === "string", "INVALID_DOCUMENT");

  let nodeCount = 0;
  const tabIds = new Set();
  function copy(value, depth = 0, inImage = false) {
    requireValue(++nodeCount <= 100000 && depth <= 100, "DOCUMENT_LIMIT_EXCEEDED");
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (Array.isArray(value)) {
      requireValue(Object.keys(value).length === value.length, "INVALID_DOCUMENT_JSON");
      return Array.from(value, (item) => copy(item, depth + 1));
    }
    requireValue(value && Object.getPrototypeOf(value) === Object.prototype, "INVALID_DOCUMENT_JSON");
    requireValue(!Object.hasOwn(value, "embeddedDrawingProperties"), "UNSUPPORTED_EMBEDDED_DRAWING");
    requireValue(!Object.hasOwn(value, "linkedContentReference"), "UNSUPPORTED_LINKED_CONTENT");
    const entries = Object.entries(value).map(([key, child]) => {
      // contentUri is a temporary, requester-scoped bearer URL. Replace only at
      // its documented image location, with a digest of separately captured bytes.
      if (key === "contentUri") {
        requireValue(inImage && typeof child === "string", "UNEXPECTED_CONTENT_URI");
        const capture = imageCaptures.get(child);
        requireValue(capture?.authorized === true && capture.bytes instanceof Uint8Array && capture.bytes.byteLength > 0, "IMAGE_CAPTURE_REQUIRED");
        return ["capturedImage", { digest: `sha256:${createHash("sha256").update(capture.bytes).digest("hex")}`, byteLength: capture.bytes.byteLength }];
      }
      if (key === "imageProperties") {
        requireValue(child && typeof child.contentUri === "string" && child.contentUri.length > 0, "IMAGE_CAPTURE_REQUIRED");
      }
      if (key === "embeddedObject") {
        requireValue(child && Object.hasOwn(child, "imageProperties"), "UNSUPPORTED_EMBEDDED_OBJECT");
      }
      // Unknown metadata is retained in the digest, never silently discarded.
      return [key, copy(child, depth + 1, key === "imageProperties")];
    });
    requireValue(!inImage || !Object.hasOwn(value, "capturedImage"), "UNEXPECTED_CAPTURE_FIELD");
    return Object.fromEntries(entries);
  }

  function checkUnion(node, types, metadata, code) {
    requireValue(node && Object.getPrototypeOf(node) === Object.prototype, code);
    requireValue(types.filter((type) => Object.hasOwn(node, type)).length === 1, code);
    const child = node[types.find((type) => Object.hasOwn(node, type))];
    requireValue(child && Object.getPrototypeOf(child) === Object.prototype, code);
    requireValue(Object.keys(node).every((key) => types.includes(key) || metadata.includes(key)), code);
  }

  function checkContent(content, tab, depth = 0) {
    requireValue(depth <= 50 && Array.isArray(content), "INVALID_STRUCTURAL_CONTENT");
    for (const element of content) {
      checkUnion(element, structuralTypes, ["startIndex", "endIndex"], "UNSUPPORTED_STRUCTURAL_ELEMENT");
      if (element.paragraph) {
        requireValue(Array.isArray(element.paragraph.elements), "MISSING_PARAGRAPH_ELEMENTS");
        const paragraph = element.paragraph;
        if (paragraph.bullet) requireValue(Object.hasOwn(tab.lists ?? {}, paragraph.bullet.listId), "MISSING_LIST");
        for (const id of paragraph.positionedObjectIds ?? []) requireValue(Object.hasOwn(tab.positionedObjects ?? {}, id), "MISSING_POSITIONED_OBJECT");
        for (const item of paragraph.elements) {
          checkUnion(item, paragraphTypes, ["startIndex", "endIndex"], "UNSUPPORTED_PARAGRAPH_ELEMENT");
          if (item.textRun) requireValue(typeof item.textRun.content === "string", "MISSING_TEXT_CONTENT");
          if (item.inlineObjectElement) requireValue(Object.hasOwn(tab.inlineObjects ?? {}, item.inlineObjectElement.inlineObjectId), "MISSING_INLINE_OBJECT");
          if (item.footnoteReference) requireValue(Object.hasOwn(tab.footnotes ?? {}, item.footnoteReference.footnoteId), "MISSING_FOOTNOTE");
        }
      }
      if (element.table) {
        requireValue(Array.isArray(element.table.tableRows), "MISSING_TABLE_ROWS");
        for (const row of element.table.tableRows) {
          requireValue(Array.isArray(row.tableCells), "MISSING_TABLE_CELLS");
          for (const cell of row.tableCells) checkContent(cell.content, tab, depth + 1);
        }
      }
      if (element.tableOfContents) checkContent(element.tableOfContents.content, tab, depth + 1);
    }
  }

  function checkTab(tab, parentId = null, depth = 0) {
    requireValue(depth <= 50, "DOCUMENT_LIMIT_EXCEEDED");
    requireValue(tab && Object.keys(tab).every((key) => ["tabProperties", "documentTab", "childTabs"].includes(key)), "UNSUPPORTED_TAB");
    const properties = tab.tabProperties;
    requireValue(typeof properties?.tabId === "string" && properties.tabId.length > 0 && !tabIds.has(properties.tabId), "INVALID_TAB_ID");
    requireValue((properties.parentTabId ?? null) === parentId, "INVALID_TAB_HIERARCHY");
    tabIds.add(properties.tabId);
    requireValue(tab.documentTab?.body, "MISSING_TAB_BODY");
    checkContent(tab.documentTab.body.content, tab.documentTab);
    for (const kind of ["headers", "footers", "footnotes"]) {
      for (const segment of Object.values(tab.documentTab[kind] ?? {})) checkContent(segment.content, tab.documentTab);
    }
    requireValue(tab.childTabs === undefined || Array.isArray(tab.childTabs), "INVALID_TAB_HIERARCHY");
    for (const child of tab.childTabs ?? []) checkTab(child, properties.tabId, depth + 1);
  }

  // Bound copying first, before recursively checking the provider structures.
  const captured = copy(document);
  captured.tabs.forEach((tab) => checkTab(tab));
  // Legacy first-tab content would create an ambiguous hybrid response.
  for (const field of ["body", "headers", "footers", "footnotes", "documentStyle", "suggestedDocumentStyleChanges", "namedStyles", "suggestedNamedStylesChanges", "lists", "namedRanges", "inlineObjects", "positionedObjects"]) {
    if (captured[field] !== undefined) {
      requireValue(captured[field] && Object.keys(captured[field]).length === 0, "LEGACY_CONTENT_WITH_TABS");
      delete captured[field];
    }
  }
  delete captured.revisionId; // Captured separately as optional provenance.
  const { tabs, ...document_properties } = captured;
  return {
    normalization_version: "curve.google-docs.normalized/v1-candidate",
    complete: true,
    unsupported_nodes: 0,
    document_properties,
    tabs,
  };
}
